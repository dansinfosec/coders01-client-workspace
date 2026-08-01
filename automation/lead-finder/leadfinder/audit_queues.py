"""Reproducible, fully OFFLINE garage-outreach queue generation from the
combined latest audit dataset (`audit-pilot1-reeval` for the original 50 +
a production run-tag for the remainder — see `website_audit_pilot.py`).

Makes ZERO network requests: no Brave, no Google Places, no HTTP fetch of any
kind. Pure aggregation over already-stored results plus `leads.json` (for the
business phone number). Supersedes the earlier one-off `build_queues.py`
script — this module is the single, tested source of truth for every
operational CSV queue derived from the audit dataset.

Safety model: `evaluate_outreach_safety()` names every independently-checked
condition a record must pass before it may enter an automatic sales queue —
never inferred from a single combined flag. `classify_exclusion_reasons()`
maps a record to the canonical do-not-auto-contact reason codes (a record may
carry more than one reason but appears in the output only once).
"""

from __future__ import annotations

import csv
import os
from pathlib import Path

from . import config
from . import storage
from . import website_audit_pilot as wap
from .normalize import normalize_domain

PRIORITY_CLASSIFICATIONS = ("B_basic_website", "C_manual_appointment_website")
SECONDARY_CLASSIFICATIONS = ("D_booking_without_vehicle_lookup",)
ADVANCED_CLASSIFICATION = "E_advanced_garage_website"

_TRANSPORT_OUTCOMES = (wap.OUTCOME_DNS_FAILURE, wap.OUTCOME_TLS_FAILURE,
                       wap.OUTCOME_TIMEOUT, wap.OUTCOME_CONNECTION_FAILURE)
_ACCESS_BLOCKED_OUTCOMES = (wap.OUTCOME_ACCESS_BLOCKED, wap.OUTCOME_CLIENT_ERROR)

REASON_COLUMNS = ["suspected_wrong_industry", "insufficient_industry_evidence",
                  "identity_conflict", "weak_identity", "manual_review_required",
                  "external_redirect", "page_not_found", "access_blocked",
                  "transport_failure", "server_error", "advanced_website", "other"]


class QueueOverlapError(RuntimeError):
    """A forbidden overlap was detected between mutually-exclusive queues."""


# ---------------------------------------------------------------------------
# Data loading (read-only)
# ---------------------------------------------------------------------------

def load_combined_latest(industry: str, output_dir=None):
    """Returns (latest_by_id, provenance_by_id, leads_by_id). Read-only: loads
    already-stored results from disk. Makes no fetch of any kind."""
    pilot_paths = config.make_industry_paths(industry, output_dir, run_tag="audit-pilot1")
    reeval_paths = config.make_industry_paths(industry, output_dir, run_tag="audit-pilot1-reeval")
    prod_paths = config.make_industry_paths(industry, output_dir, run_tag="audit-production1")

    pilot_orig = wap.load_pilot_results(pilot_paths)
    reeval = wap.load_pilot_results(reeval_paths)
    production = wap.load_pilot_results(prod_paths)
    latest = wap.combine_latest_audit_records(pilot_orig, reeval, production)

    provenance = {}
    for pid in reeval:
        provenance[pid] = "audit-pilot1-reeval"
    for pid in production:
        provenance[pid] = "audit-production1"

    leads = storage.load_leads(config.make_industry_paths(industry, output_dir))
    leads_by_id = {l.get("place_id"): l for l in leads}
    return latest, provenance, leads_by_id


# ---------------------------------------------------------------------------
# Safety evaluation
# ---------------------------------------------------------------------------

def evaluate_outreach_safety(record: dict, lead: dict) -> list[str]:
    """Returns the VIOLATED safety-check names (empty == fully safe for
    automatic outreach). Every check is independently verifiable."""
    violations = []
    if record.get("outcome") != wap.OUTCOME_SUCCESS:
        violations.append("outcome_not_success")
    if not record.get("reachable"):
        violations.append("not_reachable")
    if not wap.is_score_eligible(record):
        violations.append("not_score_eligible")
    if record.get("industry_relevance_status") not in (wap.REL_AUTOMOTIVE_CONFIRMED,
                                                        wap.REL_PROBABLY_AUTOMOTIVE):
        violations.append("industry_relevance_not_automotive")
    if record.get("excluded_from_automatic_garage_outreach"):
        violations.append("excluded_from_automatic_garage_outreach")
    if record.get("identity_confidence") not in ("high", "medium"):
        violations.append("weak_identity_confidence")
    if record.get("identity_match_outcome") == "conflict":
        violations.append("identity_conflict")
    if record.get("manual_review_required"):
        violations.append("manual_review_required")
    if record.get("external_redirect"):
        violations.append("external_redirect")
    if not record.get("final_url"):
        violations.append("missing_final_url")
    if not (lead or {}).get("phone"):
        violations.append("missing_business_phone")
    return violations


def is_outreach_safe(record: dict, lead: dict) -> bool:
    return not evaluate_outreach_safety(record, lead)


def classify_exclusion_reasons(record: dict, lead: dict) -> list[str]:
    """Canonical do-not-auto-contact reason codes for one record. A record
    may carry more than one; the caller de-duplicates place_ids, never rows."""
    reasons = []
    rel = record.get("industry_relevance_status")
    if rel == wap.REL_SUSPECTED_WRONG:
        reasons.append("suspected_wrong_industry")
    if rel == wap.REL_INSUFFICIENT:
        reasons.append("insufficient_industry_evidence")
    if record.get("identity_match_outcome") == "conflict":
        reasons.append("identity_conflict")
    elif record.get("identity_confidence") in ("low", "unknown"):
        reasons.append("weak_identity")
    if record.get("manual_review_required"):
        reasons.append("manual_review_required")
    if record.get("external_redirect"):
        reasons.append("external_redirect")
    outcome = record.get("outcome")
    if outcome == wap.OUTCOME_PAGE_NOT_FOUND:
        reasons.append("page_not_found")
    if outcome in _ACCESS_BLOCKED_OUTCOMES:
        reasons.append("access_blocked")
    if outcome in _TRANSPORT_OUTCOMES:
        reasons.append("transport_failure")
    if outcome == wap.OUTCOME_SERVER_ERROR:
        reasons.append("server_error")
    if record.get("final_audit_classification") == ADVANCED_CLASSIFICATION:
        reasons.append("advanced_website")
    if not reasons and not is_outreach_safe(record, lead):
        reasons.append("other")
    return reasons


# ---------------------------------------------------------------------------
# Queue construction (pure functions — no I/O)
# ---------------------------------------------------------------------------

def build_sales_queues(latest: dict, leads_by_id: dict) -> dict:
    """Returns {"priority": [(pid, record), ...], "secondary": [...],
    "do_not_contact": [...], "reasons_by_id": {pid: [reason, ...]},
    "overlaps": {pair_name: [pid, ...]}}. Deterministic (sorted by place_id).
    Raises QueueOverlapError if priority/secondary/do_not_contact are not
    pairwise disjoint (they are constructed to be, by an if/elif/else split —
    the check exists as a hard structural guarantee, not a soft warning)."""
    priority, secondary, do_not_contact = [], [], []
    reasons_by_id = {}

    for pid in sorted(latest):
        r = latest[pid]
        lead = leads_by_id.get(pid, {})
        safe = is_outreach_safe(r, lead)
        cls = r.get("final_audit_classification")
        if safe and cls in PRIORITY_CLASSIFICATIONS:
            priority.append((pid, r))
        elif safe and cls in SECONDARY_CLASSIFICATIONS:
            secondary.append((pid, r))
        else:
            reasons_by_id[pid] = classify_exclusion_reasons(r, lead)
            do_not_contact.append((pid, r))

    priority_ids = {pid for pid, _ in priority}
    secondary_ids = {pid for pid, _ in secondary}
    contact_ids = {pid for pid, _ in do_not_contact}
    overlaps = check_disjoint_or_raise({
        "priority": priority_ids, "secondary": secondary_ids, "do_not_contact": contact_ids,
    })

    return {"priority": priority, "secondary": secondary, "do_not_contact": do_not_contact,
            "reasons_by_id": reasons_by_id, "overlaps": overlaps}


def check_disjoint_or_raise(named_id_sets: dict) -> dict:
    """Raises QueueOverlapError if any two of `named_id_sets` intersect;
    otherwise returns the (empty) pairwise-overlap report. Extracted as a
    standalone, directly-testable guarantee — mutually-exclusive queues must
    never silently overlap, regardless of how each set was constructed."""
    names = sorted(named_id_sets)
    overlaps = {}
    for i, a in enumerate(names):
        for b in names[i + 1:]:
            shared = sorted(named_id_sets[a] & named_id_sets[b])
            overlaps[f"{a}_{b}"] = shared
    for pair, shared in overlaps.items():
        if shared:
            raise QueueOverlapError(f"Forbidden overlap in {pair}: {shared}")
    return overlaps


def _score_band(record: dict) -> str:
    score = record.get("garage_feature_score") or 0
    if score < 30:
        return "low"
    if score < 55:
        return "medium"
    return "high"


def build_validation_sample(priority_rows: list[tuple], leads_by_id: dict, n: int = 100) -> list[tuple]:
    """Deterministic sample of up to `n` leads from sales-ready-priority,
    spread across (classification, score-band, website-source) strata and
    across cities, with no duplicate place_id or domain. Never fetches
    anything — a pure selection over already-computed fields."""
    strata: dict[tuple, list] = {}
    for pid, r in priority_rows:
        key = (r.get("final_audit_classification"), _score_band(r), r.get("website_source"))
        strata.setdefault(key, []).append((pid, r))
    for k in strata:
        strata[k].sort(key=lambda t: t[0])

    order = sorted(strata.keys())
    seen_cities, seen_domains, chosen = set(), set(), []
    while len(chosen) < n and any(strata.get(k) for k in order):
        progressed = False
        for k in order:
            bucket = strata.get(k)
            if not bucket:
                continue
            city_of = lambda t: (leads_by_id.get(t[0], {}).get("city") or "").lower()
            idx = next((i for i, t in enumerate(bucket) if city_of(t) not in seen_cities), 0)
            pid, r = bucket.pop(idx)
            domain = normalize_domain(r.get("final_url") or r.get("submitted_url"))
            if domain in seen_domains:
                continue
            chosen.append((pid, r))
            seen_domains.add(domain)
            seen_cities.add(city_of((pid, r)))
            progressed = True
            if len(chosen) >= n:
                break
        if not progressed:
            break
    chosen.sort(key=lambda t: t[0])
    return chosen[:n]


# ---------------------------------------------------------------------------
# CSV writing (atomic)
# ---------------------------------------------------------------------------

_ROW_COLUMNS = ["place_id", "business_name", "city", "website_source", "source_run",
               "submitted_url", "final_url", "outcome", "final_audit_classification",
               "industry_relevance_status", "identity_confidence", "identity_match_outcome",
               "garage_feature_score", "website_quality_score", "manual_review_required",
               "excluded_from_automatic_garage_outreach", "external_redirect"]


def _row(pid: str, record: dict, provenance: dict) -> dict:
    out = {c: record.get(c) for c in _ROW_COLUMNS if c not in ("place_id", "source_run")}
    out["place_id"] = pid
    out["source_run"] = provenance.get(pid, "unknown")
    return out


def write_csv_atomic(path: Path, rows: list[dict], columns: list[str]) -> None:
    """Write CSV atomically (temp file + os.replace) — a crash mid-write can
    never leave a truncated/corrupt queue file."""
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    with open(tmp, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=columns)
        w.writeheader()
        w.writerows(rows)
    os.replace(tmp, path)


def _dedupe_sorted(items: list[tuple]) -> list[tuple]:
    seen, out = set(), []
    for pid, r in sorted(items, key=lambda t: t[0]):
        if pid in seen:
            continue
        seen.add(pid)
        out.append((pid, r))
    return out


def generate_all_queues(industry: str, output_dir=None) -> dict:
    """Builds and atomically writes every operational queue CSV from the
    combined latest audit dataset. Idempotent: re-running with unchanged
    underlying data produces byte-identical files. Returns a report dict with
    every queue's count and the overlap-check results. Makes NO network
    request of any kind."""
    latest, provenance, leads_by_id = load_combined_latest(industry, output_dir)
    out_dir = config.make_industry_paths(industry, output_dir).output

    queues = build_sales_queues(latest, leads_by_id)
    priority, secondary, do_not_contact = queues["priority"], queues["secondary"], queues["do_not_contact"]

    # --- single-criterion review queues (reused definitions) ---------------
    def by_outcome(outcomes):
        return _dedupe_sorted([(pid, r) for pid, r in latest.items() if r.get("outcome") in outcomes])

    def by_relevance(status):
        return _dedupe_sorted([(pid, r) for pid, r in latest.items()
                               if r.get("industry_relevance_status") == status])

    identity_conflict = _dedupe_sorted([(pid, r) for pid, r in latest.items()
                                        if r.get("identity_match_outcome") == "conflict"])
    external_redirect = _dedupe_sorted([(pid, r) for pid, r in latest.items() if r.get("external_redirect")])
    booking_opportunity = _dedupe_sorted([(pid, r) for pid, r in latest.items()
                                          if wap.is_score_eligible(r)
                                          and (r.get("has_real_booking_calendar")
                                               or r.get("has_appointment_request_form"))])
    advanced_garage = _dedupe_sorted([(pid, r) for pid, r in latest.items()
                                      if r.get("final_audit_classification") == ADVANCED_CLASSIFICATION])

    automatic_eligible = _dedupe_sorted(priority + secondary)

    validation_sample = build_validation_sample(priority, leads_by_id, n=100)

    files = {
        "suspected-wrong-industry-review.csv": by_relevance(wap.REL_SUSPECTED_WRONG),
        "insufficient-industry-evidence-review.csv": by_relevance(wap.REL_INSUFFICIENT),
        "identity-conflict-review.csv": identity_conflict,
        "page-not-found-review.csv": by_outcome((wap.OUTCOME_PAGE_NOT_FOUND,)),
        "access-blocked-review.csv": by_outcome(_ACCESS_BLOCKED_OUTCOMES),
        "transport-failure-review.csv": by_outcome(_TRANSPORT_OUTCOMES),
        "server-error-review.csv": by_outcome((wap.OUTCOME_SERVER_ERROR,)),
        "external-redirect-review.csv": external_redirect,
        "booking-opportunity-leads.csv": booking_opportunity,
        "advanced-garage-websites.csv": advanced_garage,
        "automatic-garage-outreach-eligible.csv": automatic_eligible,
        "sales-ready-priority.csv": priority,
        "sales-ready-secondary.csv": secondary,
        "sales-ready-validation-sample.csv": validation_sample,
    }

    report = {"counts": {}, "overlaps": queues["overlaps"]}
    for name, rows in files.items():
        write_csv_atomic(out_dir / name, [_row(pid, r, provenance) for pid, r in rows], _ROW_COLUMNS)
        report["counts"][name] = len(rows)

    # do-not-auto-contact.csv has its own reason-column schema.
    dnc_columns = _ROW_COLUMNS + REASON_COLUMNS
    dnc_rows = []
    for pid, r in do_not_contact:
        row = _row(pid, r, provenance)
        reasons = set(queues["reasons_by_id"].get(pid, []))
        for col in REASON_COLUMNS:
            row[col] = col in reasons
        dnc_rows.append(row)
    write_csv_atomic(out_dir / "do-not-auto-contact.csv", dnc_rows, dnc_columns)
    report["counts"]["do-not-auto-contact.csv"] = len(dnc_rows)

    return report
