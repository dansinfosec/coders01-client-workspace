"""Reading and writing the tool's output artifacts."""

from __future__ import annotations

import csv
import json
from datetime import datetime, timezone
from pathlib import Path

CSV_COLUMNS = [
    "place_id", "business_name", "category", "city", "region", "phone", "website",
    "business_status", "opportunity_score", "top_problems", "google_maps_uri",
    "screenshot_desktop", "screenshot_mobile", "review_status", "notes",
]


def read_json(path: Path, default=None):
    if not Path(path).exists():
        return default
    return json.loads(Path(path).read_text(encoding="utf-8"))


def write_json(path: Path, obj) -> None:
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    Path(path).write_text(json.dumps(obj, indent=2, ensure_ascii=False), encoding="utf-8")


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
            "business_name": lead.get("business_name"),
            "category": lead.get("category"),
            "city": lead.get("city"),
            "region": lead.get("region"),
            "phone": lead.get("phone"),
            "website": lead.get("website"),
            "business_status": lead.get("business_status"),
            "opportunity_score": score.get("score"),
            "top_problems": " | ".join(top),
            "google_maps_uri": lead.get("google_maps_uri"),
            "screenshot_desktop": audit.get("screenshot_desktop"),
            "screenshot_mobile": audit.get("screenshot_mobile"),
            "review_status": review.get("status", "pending"),
            "notes": review.get("notes", ""),
        })
    return rows


def write_csv(path: Path, rows: list[dict]) -> None:
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", newline="", encoding="utf-8-sig") as fh:
        writer = csv.DictWriter(fh, fieldnames=CSV_COLUMNS, extrasaction="ignore")
        writer.writeheader()
        for row in rows:
            writer.writerow(row)
