"""Explainable opportunity scoring (pure, unit-tested).

Turns a website audit into a 0–100 "redesign opportunity" score. Higher = more
reason to pitch a rebuild. Every rule that fires is recorded with its points and
a human-readable reason, so the score is fully explainable and auditable.
"""

from __future__ import annotations

from dataclasses import dataclass, field


# Each rule: code -> (points, human explanation). Kept as data so the README and
# the dashboard can render the same table the scorer uses.
RULES = {
    "no_website": (100, "Geen website gevonden"),
    "unreachable": (40, "Website onbereikbaar"),
    "server_error": (30, "Herhaalde serverfout (5xx)"),
    "no_https": (15, "Geen HTTPS"),
    "no_mobile_viewport": (15, "Geen mobiele viewport meta-tag"),
    "slow_response": (15, "Reactietijd boven 5 seconden"),
    "no_contact_form": (10, "Geen contact- of offerteformulier"),
    "no_cta": (10, "Geen duidelijke call-to-action"),
    "broken_assets": (10, "Kapotte links of afbeeldingen"),
    "outdated_copyright": (5, "Verouderd copyright-jaartal"),
    "missing_title_or_contact": (5, "Titel of contactgegevens ontbreken"),
}

MAX_SCORE = 100


@dataclass
class ScoreResult:
    score: int
    reasons: list[dict] = field(default_factory=list)

    def top_problems(self, limit: int = 3) -> list[str]:
        ordered = sorted(self.reasons, key=lambda r: r["points"], reverse=True)
        return [r["reason"] for r in ordered[:limit]]

    def as_dict(self) -> dict:
        return {"score": self.score, "reasons": self.reasons}


def _add(reasons, code, detail=None):
    points, text = RULES[code]
    reasons.append({
        "code": code,
        "points": points,
        "reason": text if not detail else f"{text} ({detail})",
    })


def score_audit(audit: dict, current_year: int | None = None) -> ScoreResult:
    """Compute an opportunity score from an audit dict.

    Expected audit keys (all optional; missing => not penalized unless implied):
      has_website (bool), reachable (bool), status_code (int|None),
      server_error (bool), https (bool), mobile_viewport (bool),
      response_time (float seconds), has_contact_form (bool),
      has_cta (bool), broken_links (int), broken_images (int),
      copyright_year (int|None), title (str|None),
      has_visible_phone (bool), has_visible_email (bool).
    """
    from datetime import datetime, timezone

    if current_year is None:
        current_year = datetime.now(timezone.utc).year

    reasons: list[dict] = []

    # No website dominates everything else.
    if not audit.get("has_website", False):
        _add(reasons, "no_website")
        return ScoreResult(score=MAX_SCORE, reasons=reasons)

    # If there IS a website but we couldn't reach it, most content checks are moot.
    if not audit.get("reachable", True):
        _add(reasons, "unreachable", audit.get("unreachable_reason"))
        if audit.get("server_error"):
            _add(reasons, "server_error")
        return ScoreResult(score=_capped(reasons), reasons=reasons)

    if audit.get("server_error"):
        _add(reasons, "server_error")

    if audit.get("https") is False:
        _add(reasons, "no_https")

    if audit.get("mobile_viewport") is False:
        _add(reasons, "no_mobile_viewport")

    rt = audit.get("response_time")
    if rt is not None and rt > 5.0:
        _add(reasons, "slow_response", f"{rt:.1f}s")

    if audit.get("has_contact_form") is False:
        _add(reasons, "no_contact_form")

    if audit.get("has_cta") is False:
        _add(reasons, "no_cta")

    broken = (audit.get("broken_links") or 0) + (audit.get("broken_images") or 0)
    if broken > 0:
        _add(reasons, "broken_assets", f"{broken} kapot")

    cy = audit.get("copyright_year")
    if cy is not None and cy < current_year - 1:
        _add(reasons, "outdated_copyright", str(cy))

    missing_title = not audit.get("title")
    missing_contact = not (audit.get("has_visible_phone") or audit.get("has_visible_email"))
    if missing_title or missing_contact:
        _add(reasons, "missing_title_or_contact")

    return ScoreResult(score=_capped(reasons), reasons=reasons)


def _capped(reasons) -> int:
    return min(MAX_SCORE, sum(r["points"] for r in reasons))
