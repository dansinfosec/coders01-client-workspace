"""USD cost enforcement for live Places API runs (additive to the request Budget).

Conservative Places API (New) prices matched to this project's field masks. The
Text Search mask now carries every lead field (contact + rating), so it is priced
at the Enterprise tier; Place Details is only used as a narrow opt-in fallback:
  * Text Search   -> Enterprise (conservative) = $0.035 / request
  * Place Details -> Enterprise fallback       = $0.020 / request

Three independent ceilings, all checked BEFORE a request is sent:
  * RUN limit        — optional, applies to THIS run only (--additional-cost-limit-usd)
  * OPERATIONAL limit— cumulative historical spend stop
  * ABSOLUTE limit   — cumulative hard invariant, never crossed

The CostGuard reserves-and-records the price of EVERY billable request BEFORE it
is sent (including each pagination page and each retry, charged at the retried
endpoint's price). State is persisted on every reservation, so a crash mid-run
cannot make a resume reuse the budget — cumulative spend is loaded on resume,
while the per-run counter always starts at zero.

Internally amounts are integer "mills" (1 mill = $0.001) to avoid float drift.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path
from datetime import datetime, timezone

# Prices in mills (1 mill = $0.001).
PRICE_MILLS = {"text": 35, "details": 20}   # $0.035 Text Search Ent, $0.020 Details Ent fallback
TEXT_SEARCH_USD = PRICE_MILLS["text"] / 1000.0
PLACE_DETAILS_USD = PRICE_MILLS["details"] / 1000.0

DEFAULT_OPERATIONAL_USD = 195.50
DEFAULT_ABSOLUTE_USD = 230.00


class BudgetExceeded(Exception):
    """Raised/handled when a request would exceed the operational USD limit."""


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


@dataclass
class CostGuard:
    operational_mills: int = int(round(DEFAULT_OPERATIONAL_USD * 1000))
    absolute_mills: int = int(round(DEFAULT_ABSOLUTE_USD * 1000))
    state_path: Path | None = None
    # cumulative spend (mills), split by kind + retries
    spent_text: int = 0
    spent_details: int = 0
    spent_retries: int = 0
    count_text: int = 0
    count_details: int = 0
    count_retries: int = 0
    rejections: int = 0
    stopped: bool = False
    # Per-RUN ceiling (--additional-cost-limit-usd). None = no extra run limit.
    # Never loaded from disk: it constrains only the current process/run, so
    # historical cost-state.json never has to be edited by hand.
    run_limit_mills: int | None = None
    run_spent_mills: int = 0

    # -- amounts -----------------------------------------------------------
    def total_mills(self) -> int:
        return self.spent_text + self.spent_details + self.spent_retries

    def total_usd(self) -> float:
        return round(self.total_mills() / 1000.0, 4)

    def run_spent_usd(self) -> float:
        return round(self.run_spent_mills / 1000.0, 4)

    def remaining_operational_usd(self) -> float:
        return round((self.operational_mills - self.total_mills()) / 1000.0, 4)

    def remaining_run_usd(self) -> float | None:
        """USD still spendable in THIS run (None when no per-run limit is set)."""
        if self.run_limit_mills is None:
            return None
        return round((self.run_limit_mills - self.run_spent_mills) / 1000.0, 4)

    def remaining_budget_usd(self) -> float:
        """The binding remaining budget: the tighter of run limit and operational."""
        op = self.remaining_operational_usd()
        run = self.remaining_run_usd()
        return op if run is None else min(op, run)

    def can_afford(self, kind: str) -> bool:
        """Would one more `kind` request fit under EVERY active ceiling?"""
        price = PRICE_MILLS[kind]
        if self.run_limit_mills is not None and \
                self.run_spent_mills + price > self.run_limit_mills:
            return False
        return self.total_mills() + price <= self.operational_mills

    # -- reserve-before-send ----------------------------------------------
    def _reserve(self, kind: str, retry: bool) -> bool:
        price = PRICE_MILLS[kind]
        # Per-run ceiling first (cheapest to breach, easiest to reason about),
        # then the operational stop AND the absolute invariant.
        if self.run_limit_mills is not None and \
                self.run_spent_mills + price > self.run_limit_mills:
            self.stopped = True
            self.rejections += 1
            self.save()
            return False
        if self.total_mills() + price > self.operational_mills or \
                self.total_mills() + price > self.absolute_mills:
            self.stopped = True
            self.rejections += 1
            self.save()
            return False
        # Record the charge BEFORE the HTTP request is sent (conservative: if the
        # send crashes we cannot prove nothing was transmitted, so it stays billed).
        if retry:
            self.spent_retries += price
            self.count_retries += 1
        elif kind == "text":
            self.spent_text += price
            self.count_text += 1
        else:
            self.spent_details += price
            self.count_details += 1
        self.run_spent_mills += price
        self.save()
        return True

    def reserve(self, kind: str) -> bool:
        """Reserve one initial request. False => reject; caller must NOT send."""
        return self._reserve(kind, retry=False)

    def reserve_retry(self, kind: str) -> bool:
        """Reserve one retry of the given endpoint. False => do not retry."""
        return self._reserve(kind, retry=True)

    # -- persistence -------------------------------------------------------
    def as_dict(self) -> dict:
        return {
            "operational_usd": self.operational_mills / 1000.0,
            "absolute_usd": self.absolute_mills / 1000.0,
            "spent_text_usd": self.spent_text / 1000.0,
            "spent_details_usd": self.spent_details / 1000.0,
            "spent_retries_usd": self.spent_retries / 1000.0,
            "total_usd": self.total_usd(),
            "count_text": self.count_text,
            "count_details": self.count_details,
            "count_retries": self.count_retries,
            "rejections": self.rejections,
            "stopped": self.stopped,
            # Per-run figures are reported for transparency but NEVER reloaded —
            # `run_spent_mills` always restarts at 0 in a new run.
            "last_run_spent_usd": self.run_spent_usd(),
            "last_run_limit_usd": (None if self.run_limit_mills is None
                                   else self.run_limit_mills / 1000.0),
            # raw mills for exact reload
            "_spent_text_mills": self.spent_text,
            "_spent_details_mills": self.spent_details,
            "_spent_retries_mills": self.spent_retries,
            "updated_at": _now(),
        }

    def save(self) -> None:
        if not self.state_path:
            return
        p = Path(self.state_path)
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(json.dumps(self.as_dict(), indent=2, ensure_ascii=False), encoding="utf-8")

    @classmethod
    def load(cls, state_path, operational_usd=DEFAULT_OPERATIONAL_USD,
             absolute_usd=DEFAULT_ABSOLUTE_USD,
             run_limit_usd: float | None = None) -> "CostGuard":
        """Load cumulative historical spend; `run_limit_usd` caps THIS run only."""
        op = int(round(operational_usd * 1000))
        ab = int(round(absolute_usd * 1000))
        run = None if run_limit_usd is None else int(round(float(run_limit_usd) * 1000))
        guard = cls(operational_mills=op, absolute_mills=ab,
                    state_path=Path(state_path) if state_path else None,
                    run_limit_mills=run)
        p = Path(state_path) if state_path else None
        if p and p.exists():
            try:
                d = json.loads(p.read_text(encoding="utf-8"))
                guard.spent_text = int(d.get("_spent_text_mills", 0))
                guard.spent_details = int(d.get("_spent_details_mills", 0))
                guard.spent_retries = int(d.get("_spent_retries_mills", 0))
                guard.count_text = int(d.get("count_text", 0))
                guard.count_details = int(d.get("count_details", 0))
                guard.count_retries = int(d.get("count_retries", 0))
                guard.rejections = int(d.get("rejections", 0))
            except (ValueError, OSError):
                pass
        return guard

    @staticmethod
    def reset(state_path) -> None:
        p = Path(state_path) if state_path else None
        if p and p.exists():
            p.unlink()


def estimate_usd(text_requests: int, details_requests: int = 0, retries: int = 0) -> float:
    """Conservative USD estimate (retries priced at the higher Text Search rate)."""
    mills = text_requests * PRICE_MILLS["text"] + details_requests * PRICE_MILLS["details"] \
        + retries * PRICE_MILLS["text"]
    return round(mills / 1000.0, 4)
