"""Human review of the sales-ready validation sample — fully OFFLINE.

Decisions are stored SEPARATELY from the immutable audit result files, keyed
by place_id, in `human-review-decisions.json`. Nothing here ever writes into
`website-audit-audit-*.json`, `sales-ready-validation-human-review.csv`, or
any other audit/queue source file — every write in this module targets its
own dedicated output file.

Used by both the audit-review dashboard server (leadfinder/audit_dashboard*)
and the `audit-export-human-review` CLI command, so the two can never drift:
one storage/export implementation, two callers.
"""

from __future__ import annotations

import csv
import hashlib
import json
import os
from datetime import datetime, timezone
from pathlib import Path

from . import audit_queues as aq
from . import config
from . import storage

VERDICT_CHOICES = ("approve", "reject", "manual_review")
TRISTATE_CHOICES = ("yes", "no", "unsure")

DECISION_FIELDS = ("business_identity_correct", "real_autogarage", "valid_sales_opportunity",
                   "phone_usable", "website_assessment", "verdict", "notes")

_TRISTATE_FIELDS = ("business_identity_correct", "real_autogarage", "valid_sales_opportunity",
                    "phone_usable")

# Formula-injection guard (OWASP CSV injection): a leading =, +, -, @, tab, or
# CR can make a spreadsheet application interpret a cell as a formula. Every
# string cell this module writes is passed through this — including fields
# that originate from Google Places data, not just free-text human input.
_FORMULA_PREFIXES = ("=", "+", "-", "@", "\t", "\r")


def csv_safe(value) -> str:
    """Neutralizes CSV/formula injection: a leading formula-trigger character
    is prefixed with a literal apostrophe so spreadsheet software renders it
    as text, never evaluates it."""
    s = "" if value is None else str(value)
    if s and s[0] in _FORMULA_PREFIXES:
        return "'" + s
    return s


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def compute_record_fingerprint(record: dict) -> str:
    """A stable SHA-256 over the audit record's outcome-relevant fields —
    lets a stored decision detect (not silently hide) that the underlying
    audit finding changed since the human reviewed it."""
    stable_keys = ("outcome", "final_audit_classification", "garage_feature_score",
                  "website_quality_score", "identity_confidence", "identity_match_outcome",
                  "industry_relevance_status", "external_redirect", "manual_review_required",
                  "final_url", "submitted_url")
    payload = {k: record.get(k) for k in stable_keys}
    blob = json.dumps(payload, sort_keys=True, ensure_ascii=True).encode("utf-8")
    return hashlib.sha256(blob).hexdigest()


# ---------------------------------------------------------------------------
# Decision storage (atomic, place_id-keyed, preserves existing entries)
# ---------------------------------------------------------------------------

def load_decisions(paths) -> dict:
    data = storage.read_json(paths.human_review_decisions_json, default={"decisions": {}})
    return data.get("decisions", {}) if isinstance(data, dict) else {}


def _save_decisions_atomic(paths, decisions: dict) -> None:
    storage.write_json_atomic(paths.human_review_decisions_json, {
        "generated_at": _now(), "count": len(decisions), "decisions": decisions,
    })


def save_decision(paths, place_id: str, fields: dict, *, record: dict | None = None,
                  source_run: str | None = None, reviewer: str | None = None) -> dict:
    """Merge-updates one place_id's decision and writes the WHOLE decisions
    file atomically (preserving every other existing entry unchanged).
    `record`/`source_run` (if given) refresh the provenance fingerprint —
    omit them for a pure field-only update (e.g. from a resumed session)."""
    for key in fields:
        if key not in DECISION_FIELDS:
            raise ValueError(f"Unknown decision field: {key}")
    for key in _TRISTATE_FIELDS:
        if key in fields and fields[key] not in (*TRISTATE_CHOICES, "", None):
            raise ValueError(f"{key} must be one of {TRISTATE_CHOICES}, got {fields[key]!r}")
    if "verdict" in fields and fields["verdict"] not in (*VERDICT_CHOICES, "", None):
        raise ValueError(f"verdict must be one of {VERDICT_CHOICES}, got {fields['verdict']!r}")

    decisions = load_decisions(paths)
    existing = decisions.get(place_id, {})
    updated = dict(existing)
    updated.update(fields)
    updated["place_id"] = place_id
    updated.setdefault("reviewed_at", existing.get("reviewed_at") or _now())
    updated["updated_at"] = _now()
    if reviewer is not None:
        updated["reviewer"] = reviewer
    else:
        updated.setdefault("reviewer", existing.get("reviewer"))
    if record is not None:
        updated["source_record_fingerprint"] = compute_record_fingerprint(record)
    else:
        updated.setdefault("source_record_fingerprint", existing.get("source_record_fingerprint"))
    if source_run is not None:
        updated["source_audit_run"] = source_run
    else:
        updated.setdefault("source_audit_run", existing.get("source_audit_run"))

    decisions[place_id] = updated
    _save_decisions_atomic(paths, decisions)
    return updated


# ---------------------------------------------------------------------------
# Sample loading (reads the fixed 100-lead human-review sample CSV)
# ---------------------------------------------------------------------------

def load_sample_rows(industry: str, output_dir=None) -> list[dict]:
    """Reads the ORIGINAL, never-modified sales-ready-validation-human-review.csv.
    Read-only — this module never writes to that file."""
    paths = config.make_industry_paths(industry, output_dir)
    path = paths.output / "sales-ready-validation-human-review.csv"
    if not path.exists():
        return []
    with open(path, encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))


# ---------------------------------------------------------------------------
# Reproducible export: sample evidence + decisions, combined
# ---------------------------------------------------------------------------

_EXPORT_DECISION_COLUMNS = ["decision_business_identity_correct", "decision_real_autogarage",
                           "decision_valid_sales_opportunity", "decision_phone_usable",
                           "decision_website_assessment", "decision_verdict", "decision_notes",
                           "decision_reviewed_at", "decision_updated_at", "decision_reviewer",
                           "decision_source_audit_run", "decision_source_record_fingerprint"]


def export_completed_review_csv(industry: str, output_dir=None) -> dict:
    """Combines the original sample CSV (untouched) with the separate
    decision file into sales-ready-validation-human-review-completed.csv.
    Makes no fetch; never modifies the original sample CSV or the decisions
    file. Atomic write. Idempotent."""
    paths = config.make_industry_paths(industry, output_dir)
    sample_rows = load_sample_rows(industry, output_dir)
    decisions = load_decisions(paths)

    original_columns = list(sample_rows[0].keys()) if sample_rows else []
    columns = original_columns + _EXPORT_DECISION_COLUMNS

    out_rows = []
    reviewed = 0
    for row in sample_rows:
        pid = row["place_id"]
        d = decisions.get(pid, {})
        if d.get("verdict"):
            reviewed += 1
        out = {k: csv_safe(v) for k, v in row.items()}
        out["decision_business_identity_correct"] = csv_safe(d.get("business_identity_correct", ""))
        out["decision_real_autogarage"] = csv_safe(d.get("real_autogarage", ""))
        out["decision_valid_sales_opportunity"] = csv_safe(d.get("valid_sales_opportunity", ""))
        out["decision_phone_usable"] = csv_safe(d.get("phone_usable", ""))
        out["decision_website_assessment"] = csv_safe(d.get("website_assessment", ""))
        out["decision_verdict"] = csv_safe(d.get("verdict", ""))
        out["decision_notes"] = csv_safe(d.get("notes", ""))
        out["decision_reviewed_at"] = csv_safe(d.get("reviewed_at", ""))
        out["decision_updated_at"] = csv_safe(d.get("updated_at", ""))
        out["decision_reviewer"] = csv_safe(d.get("reviewer", ""))
        out["decision_source_audit_run"] = csv_safe(d.get("source_audit_run", ""))
        out["decision_source_record_fingerprint"] = csv_safe(d.get("source_record_fingerprint", ""))
        out_rows.append(out)

    aq.write_csv_atomic(paths.human_review_completed_csv, out_rows, columns)
    return {"path": str(paths.human_review_completed_csv), "total": len(out_rows), "reviewed": reviewed,
           "remaining": len(out_rows) - reviewed}


# ---------------------------------------------------------------------------
# First-call batch: strict approved-only deterministic sample, max 50
# ---------------------------------------------------------------------------

FIRST_CALL_REQUIRED_TRISTATE = "yes"


def _is_call_eligible(decision: dict) -> bool:
    if not decision:
        return False
    if decision.get("verdict") != "approve":
        return False
    for field in _TRISTATE_FIELDS:
        if decision.get(field) != FIRST_CALL_REQUIRED_TRISTATE:
            return False
    return True


def build_first_call_batch(industry: str, output_dir=None, max_n: int = 50) -> dict:
    """Builds and atomically writes approved-first-call-batch.csv: every
    place_id in the human-review sample whose decision is a strict approve
    (verdict==approve AND all four tri-state fields==yes), deterministically
    spread across city/classification/source/score-band, max 50, no
    duplicates. Makes no fetch; never touches audit result files."""
    paths = config.make_industry_paths(industry, output_dir)
    latest, provenance, leads_by_id = aq.load_combined_latest(industry, output_dir)
    decisions = load_decisions(paths)

    eligible_ids = [pid for pid, d in decisions.items() if _is_call_eligible(d) and pid in latest]
    eligible_ids = sorted(set(eligible_ids))   # de-duplicate defensively
    eligible_rows = [(pid, latest[pid]) for pid in eligible_ids]

    batch = aq.build_validation_sample(eligible_rows, leads_by_id, n=max_n)

    columns = ["place_id", "business_name", "city", "phone", "website_source",
              "final_audit_classification", "garage_feature_score", "website_quality_score",
              "final_url", "decision_verdict", "decision_reviewed_at"]
    rows = []
    for pid, r in batch:
        lead = leads_by_id.get(pid, {})
        d = decisions.get(pid, {})
        rows.append({
            "place_id": pid, "business_name": csv_safe(r.get("business_name")),
            "city": csv_safe(lead.get("city")), "phone": csv_safe(lead.get("phone")),
            "website_source": csv_safe(r.get("website_source")),
            "final_audit_classification": csv_safe(r.get("final_audit_classification")),
            "garage_feature_score": r.get("garage_feature_score"),
            "website_quality_score": r.get("website_quality_score"),
            "final_url": csv_safe(r.get("final_url")),
            "decision_verdict": csv_safe(d.get("verdict")),
            "decision_reviewed_at": csv_safe(d.get("reviewed_at")),
        })

    aq.write_csv_atomic(paths.first_call_batch_csv, rows, columns)
    return {"path": str(paths.first_call_batch_csv), "count": len(rows),
           "eligible_total": len(eligible_ids)}
