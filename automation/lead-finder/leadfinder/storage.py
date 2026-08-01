"""Reading and writing the tool's output artifacts."""

from __future__ import annotations

import csv
import json
import os
from datetime import datetime, timezone
from pathlib import Path

CSV_COLUMNS = [
    "place_id", "industry", "business_name", "category", "city", "region", "phone", "website",
    "business_status", "google_rating", "google_review_count", "opportunity_score",
    "top_problems", "google_maps_uri", "screenshot_desktop", "screenshot_mobile",
    "review_status", "notes",
    # Garage (autogarage) booking + kenteken/RDW audit columns. Blank/None for
    # every non-garage industry — schema unchanged for them, just more columns.
    "website_opportunity_category",
    "has_basic_contact_form",
    "has_appointment_request_form",
    "has_real_booking_calendar",
    "can_select_service",
    "can_select_branch",
    "can_select_date",
    "can_select_available_time_slot",
    "can_enter_license_plate",
    "has_vehicle_lookup_result",
    "has_rdw_or_vehicle_data_integration",
    "booking_gap_reason",
    "vehicle_lookup_gap_reason",
    "website_score",
    "sales_reason",
    "recommended_opening_line",
]


def read_json(path: Path, default=None):
    if not Path(path).exists():
        return default
    return json.loads(Path(path).read_text(encoding="utf-8"))


def write_json(path: Path, obj) -> None:
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    Path(path).write_text(json.dumps(obj, indent=2, ensure_ascii=False), encoding="utf-8")


def write_json_atomic(path: Path, obj) -> None:
    """Write JSON atomically (temp file + os.replace) in UTF-8.

    Progress/cost-state files for the website-discovery phase are rewritten after
    every lead; an atomic replace guarantees a crash mid-write can never leave a
    truncated/corrupt checkpoint that would break resume.
    """
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(obj, indent=2, ensure_ascii=False), encoding="utf-8")
    os.replace(tmp, path)


def save_leads(paths, leads: list[dict]) -> None:
    write_json(paths.leads_json, {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "count": len(leads),
        "leads": leads,
    })


def load_leads(paths) -> list[dict]:
    data = read_json(paths.leads_json, default={})
    return data.get("leads", []) if isinstance(data, dict) else (data or [])


def save_audits(paths, audits: list[dict]) -> None:
    write_json(paths.audits_json, {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "count": len(audits),
        "audits": audits,
    })


def load_audits(paths) -> list[dict]:
    data = read_json(paths.audits_json, default={})
    return data.get("audits", []) if isinstance(data, dict) else (data or [])


def load_review_state(paths) -> dict:
    """{place_id: {"status": "approved|rejected|pending", "notes": "..."}}"""
    return read_json(paths.review_state, default={}) or {}


def write_run_report(paths, report: dict) -> None:
    write_json(paths.run_report, report)


def build_csv_rows(leads, audits, scores, review_state) -> list[dict]:
    """Assemble CSV rows from leads + audits + scores (+ optional review state).

    `audits` / `scores` are dicts keyed by place_id. `scores[pid]` is a dict with
    'score' and 'reasons'. `review_state[pid]` may hold 'status' and 'notes'.
    """
    rows = []
    for lead in leads:
        pid = lead.get("place_id")
        audit = audits.get(pid, {})
        score = scores.get(pid, {})
        review = review_state.get(pid, {})
        top = score.get("top_problems") or []
        rows.append({
            "place_id": pid,
            "industry": lead.get("industry"),
            "business_name": lead.get("business_name"),
            "category": lead.get("category"),
            "city": lead.get("city"),
            "region": lead.get("region"),
            "phone": lead.get("phone"),
            "website": lead.get("website"),
            "business_status": lead.get("business_status"),
            "google_rating": lead.get("google_rating"),
            "google_review_count": lead.get("google_review_count"),
            "opportunity_score": score.get("score"),
            "top_problems": " | ".join(top),
            "google_maps_uri": lead.get("google_maps_uri"),
            "screenshot_desktop": audit.get("screenshot_desktop"),
            "screenshot_mobile": audit.get("screenshot_mobile"),
            "review_status": review.get("status", "pending"),
            "notes": review.get("notes", ""),
            # Garage facts come straight from the audit; category/reasons/copy
            # come from the score dict (evaluate_lead output; None for non-garage).
            "website_opportunity_category": score.get("website_opportunity_category"),
            "has_basic_contact_form": audit.get("has_basic_contact_form"),
            "has_appointment_request_form": audit.get("has_appointment_request_form"),
            "has_real_booking_calendar": audit.get("has_real_booking_calendar"),
            "can_select_service": audit.get("can_select_service"),
            "can_select_branch": audit.get("can_select_branch"),
            "can_select_date": audit.get("can_select_date"),
            "can_select_available_time_slot": audit.get("can_select_available_time_slot"),
            "can_enter_license_plate": audit.get("can_enter_license_plate"),
            "has_vehicle_lookup_result": audit.get("has_vehicle_lookup_result"),
            "has_rdw_or_vehicle_data_integration": audit.get("has_rdw_or_vehicle_data_integration"),
            "booking_gap_reason": score.get("booking_gap_reason"),
            "vehicle_lookup_gap_reason": score.get("vehicle_lookup_gap_reason"),
            "website_score": score.get("score"),
            "sales_reason": score.get("sales_reason"),
            "recommended_opening_line": score.get("recommended_opening_line"),
        })
    return rows


def write_csv(path: Path, rows: list[dict]) -> None:
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", newline="", encoding="utf-8-sig") as fh:
        writer = csv.DictWriter(fh, fieldnames=CSV_COLUMNS, extrasaction="ignore")
        writer.writeheader()
        for row in rows:
            writer.writerow(row)
