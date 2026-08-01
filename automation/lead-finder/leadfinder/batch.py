"""Batch matrix state, cost estimation and lead merging (pure, testable).

Runs the category × location matrix over the EXISTING Places client, pagination,
budget, dedup, storage and audit — this module adds only the orchestration glue:
resumable checkpointing, a large-batch cost estimate, and safe lead merging.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

from .normalize import (
    dedupe_leads, normalize_domain, normalize_phone, name_location_key,
)
from .targets import slugify

# Places Text Search returns up to 20 results/page and at most ~3 pages.
PAGE_SIZE = 20
MAX_PAGES = 3
LARGE_BATCH_THRESHOLD = 20


def combo_key(combo: dict) -> str:
    """Unique, process-stable checkpoint key: "<slug>|<query-slug>|<location>".

    The query/category is part of the key so a preset's many queries for ONE
    location (and one folder slug) get distinct keys — slug+location alone
    collides (all 15 automotive queries for "Amsterdam" would share a key and
    completing one would skip the rest).

    Uses the deterministic `slugify()` — never Python's built-in `hash()`, which
    is randomized per process and would produce non-resumable keys.
    """
    query = combo.get("category") or combo.get("query") or ""
    return f"{combo['slug']}|{slugify(query)}|{combo['location']}"


def legacy_combo_key(combo: dict) -> str:
    """Pre-refactor 2-part key ("<slug>|<location>").

    Kept only so an EXISTING matrix checkpoint (where each folder slug maps 1:1
    to a single category) still resumes after the key format changed. See
    `is_completed`.
    """
    return f"{combo['slug']}|{combo['location']}"


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


# --- checkpoint state ------------------------------------------------------

def load_state(path: Path) -> dict:
    p = Path(path)
    if p.exists():
        try:
            data = json.loads(p.read_text(encoding="utf-8"))
            if isinstance(data, dict):
                data.setdefault("completed", {})
                data.setdefault("failed", {})
                return data
        except (ValueError, OSError):
            pass
    return {"completed": {}, "failed": {}, "created_at": _now()}


def save_state(path: Path, state: dict) -> None:
    p = Path(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    state["updated_at"] = _now()
    p.write_text(json.dumps(state, indent=2, ensure_ascii=False), encoding="utf-8")


def reset_state(path: Path) -> None:
    p = Path(path)
    if p.exists():
        p.unlink()


def is_completed(state: dict, combo: dict) -> bool:
    """True if this exact query/location combo is already checkpointed.

    Backward compatibility: a MATRIX (non-preset) combo also counts as completed
    when its legacy 2-part key is present, because the matrix maps one category
    per folder slug, so `slug|location` uniquely identifies it. PRESET combos
    (many queries share one slug) NEVER fall back to the legacy key — otherwise a
    single old `autogarage|Amsterdam` key would wrongly skip all 15 new automotive
    queries for Amsterdam. So legacy keys can never block preset queries.
    """
    completed = state.get("completed", {})
    if combo_key(combo) in completed:
        return True
    if combo.get("preset"):
        return False
    return legacy_combo_key(combo) in completed


def mark_completed(state: dict, combo: dict, meta: dict | None = None) -> None:
    key = combo_key(combo)
    state.setdefault("completed", {})[key] = {
        "category": combo["category"], "location": combo["location"],
        "completed_at": _now(), **(meta or {}),
    }
    # A combo that now succeeds is no longer failed.
    state.get("failed", {}).pop(key, None)


def mark_failed(state: dict, combo: dict, error: str) -> None:
    key = combo_key(combo)
    failed = state.setdefault("failed", {})
    prev = failed.get(key, {})
    failed[key] = {
        "category": combo["category"], "location": combo["location"],
        "error": str(error)[:300],
        "retries": int(prev.get("retries", 0)) + 1,
        "timestamp": _now(),
    }


def pending_combos(state: dict, combos: list[dict]) -> list[dict]:
    """Combos not yet completed (failed ones remain, so they retry)."""
    return [c for c in combos if not is_completed(state, c)]


# --- cost estimate ---------------------------------------------------------

def estimate(n_combos: int, max_results: int, budget: int | None = None,
             details_fallback: bool = False) -> dict:
    """Worst-case request counts for a batch.

    Lead discovery is Text-Search-only, so Place Details requests are 0 unless
    the opt-in --details-fallback is enabled — and even then only results with
    NO phone and NO website can trigger one, so `max_results` per combo is the
    absolute worst case.
    """
    pages = max(1, min(MAX_PAGES, -(-max_results // PAGE_SIZE)))  # ceil, capped
    max_text = n_combos * pages
    max_details = n_combos * max_results if details_fallback else 0
    return {
        "combinations": n_combos,
        "max_pages_per_combo": pages,
        "max_text_search_requests": max_text,
        "max_place_details_requests": max_details,
        "max_total_requests": max_text + max_details,
        "configured_budget": budget,
        "details_fallback": bool(details_fallback),
    }


def is_large(n_combos: int) -> bool:
    return n_combos > LARGE_BATCH_THRESHOLD


# --- lead merging ----------------------------------------------------------

def merge_leads(existing: list[dict], new: list[dict]) -> tuple[list[dict], int]:
    """Merge new leads into existing, de-duplicated. Existing leads win (are kept
    and only have empty fields filled), so approved/known records are preserved.
    Returns (merged, duplicates_removed)."""
    return dedupe_leads(list(existing) + list(new))


# --- global (cross-industry) dedup -----------------------------------------

class GlobalLeadIndex:
    """Index of EVERY lead already stored anywhere under output/.

    Lead discovery previously de-duplicated only within the current industry
    folder, so the same garage found under two different queries (or already
    collected in an earlier batch) could be paid for and stored twice. This index
    is built once per run from all industry folders and answers "have we already
    got this business?" using the same keys as `dedupe_leads`:
    place_id -> normalized domain -> normalized phone -> name+location.

    Each entry records its ORIGIN so a hit can be attributed precisely:
      * "existing" — stored in output/ before this run started;
      * "run"      — first seen earlier in the CURRENT run (sibling query).
    `classify()` returns that origin (or None); `contains()` stays boolean.
    """

    def __init__(self):
        self.place_ids: dict[str, str] = {}
        self.domains: dict[str, str] = {}
        self.phones: dict[str, str] = {}
        self.name_keys: dict[str, str] = {}
        self.total = 0

    def add(self, lead: dict, origin: str = "run") -> None:
        pid = lead.get("place_id")
        if pid:
            self.place_ids.setdefault(str(pid), origin)
        domain = normalize_domain(lead.get("website"))
        if domain:
            self.domains.setdefault(domain, origin)
        phone = normalize_phone(lead.get("phone"))
        if phone:
            self.phones.setdefault(phone, origin)
        nkey = name_location_key(lead)
        if nkey:
            self.name_keys.setdefault(nkey, origin)
        self.total += 1

    def classify(self, lead: dict) -> str | None:
        """Origin of the matching entry ("existing" / "run"), or None if new."""
        pid = lead.get("place_id")
        if pid and str(pid) in self.place_ids:
            return self.place_ids[str(pid)]
        domain = normalize_domain(lead.get("website"))
        if domain and domain in self.domains:
            return self.domains[domain]
        phone = normalize_phone(lead.get("phone"))
        if phone and phone in self.phones:
            return self.phones[phone]
        nkey = name_location_key(lead)
        if nkey and nkey in self.name_keys:
            return self.name_keys[nkey]
        return None

    def contains(self, lead: dict) -> bool:
        return self.classify(lead) is not None

    @classmethod
    def build(cls, output_dir=None) -> "GlobalLeadIndex":
        """Load every industries/<slug>/leads.json under `output_dir`."""
        from . import config, storage      # local import avoids a cycle
        index = cls()
        base = config.make_paths(output_dir)
        idir = base.industries_dir
        if not idir.exists():
            return index
        for folder in sorted(p for p in idir.iterdir() if p.is_dir()):
            leads = storage.read_json(folder / "leads.json", default={}) or {}
            for lead in (leads.get("leads") or []):
                index.add(lead, origin="existing")
        return index
