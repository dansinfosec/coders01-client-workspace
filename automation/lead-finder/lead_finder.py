#!/usr/bin/env python3
"""Coders01 Google Places lead finder — CLI.

Commands:
  search     Find businesses via the Places API (New) and store leads.
  audit      Audit each lead's website and compute opportunity scores.
  export     Export scored leads (filtered by --min-score) to CSV/JSON.
  dashboard  (Re)build the local HTML review dashboard.

Development safety: pass --mock to use bundled fixtures and make NO real API
calls. Real calls happen only with a real key and without --mock.

See README.md for the full workflow and PowerShell setup.
"""

from __future__ import annotations

import argparse
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from leadfinder import config, storage, dashboard as dash  # noqa: E402
from leadfinder.logging_setup import configure  # noqa: E402
from leadfinder.leads import map_to_lead  # noqa: E402
from leadfinder.normalize import dedupe_leads  # noqa: E402
from leadfinder.scoring import score_audit  # noqa: E402
from leadfinder.audit import audit_lead, MockFetcher, RealFetcher  # noqa: E402
from leadfinder.places_client import (  # noqa: E402
    PlacesClient, MockTransport, RealTransport, TEXT_SEARCH_FIELDS, PLACE_DETAILS_FIELDS,
)

LOGGER = None


# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------

def _make_client(args, budget):
    if args.mock:
        LOGGER.info("Using MOCK Places transport (no real API calls).")
        return PlacesClient(MockTransport(), budget=budget, delay=0.0)
    key = config.get_api_key(required=True)
    LOGGER.info("Using REAL Places transport.")
    return PlacesClient(RealTransport(key), budget=budget, delay=args.delay)


def _compute_scores(audits: list[dict]) -> dict:
    scores = {}
    for a in audits:
        res = score_audit(a)
        scores[a.get("place_id")] = {
            "score": res.score,
            "reasons": res.reasons,
            "top_problems": res.top_problems(),
        }
    return scores


def _regenerate_outputs(paths, leads, audits):
    """Refresh leads.csv + dashboard.html from current leads/audits."""
    scores = _compute_scores(audits)
    audits_by = {a.get("place_id"): a for a in audits}
    review = storage.load_review_state(paths)
    rows = storage.build_csv_rows(leads, audits_by, scores, review)
    storage.write_csv(paths.leads_csv, rows)
    html = dash.build_dashboard(leads, audits, scores)
    paths.dashboard_html.parent.mkdir(parents=True, exist_ok=True)
    paths.dashboard_html.write_text(html, encoding="utf-8")
    return scores


# ---------------------------------------------------------------------------
# Commands
# ---------------------------------------------------------------------------

def cmd_search(args):
    paths = config.make_paths(args.output_dir)
    paths.ensure()
    budget = config.Budget(max_requests=args.budget)

    if args.dry_run:
        body = PlacesClient.build_search_body(
            args.query, args.region, args.city, args.lat, args.lng, args.radius)
        print("DRY RUN — no API calls will be made.\n")
        print(f"  Endpoint (Text Search): POST https://places.googleapis.com/v1/places:searchText")
        print(f"  Request body          : {body}")
        print(f"  Text Search fieldMask : {TEXT_SEARCH_FIELDS}")
        print(f"  Place Details fieldMask: {PLACE_DETAILS_FIELDS}")
        print(f"  Max results           : {args.max_results}")
        print(f"  Request budget        : {budget.max_requests}")
        print(f"  Mode                  : {'MOCK' if args.mock else 'REAL'}")
        return 0

    client = _make_client(args, budget)

    # Resume: continue from the saved page token if present.
    resume_token = None
    existing = storage.load_leads(paths) if args.resume else []
    if args.resume:
        prev = storage.read_json(paths.run_report, default={}) or {}
        resume_token = prev.get("last_page_token")
        LOGGER.info("Resume: %d existing leads, token=%s", len(existing), bool(resume_token))

    raw_leads = list(existing)
    summaries = list(client.search_text(
        args.query, region=args.region, city=args.city, lat=args.lat, lng=args.lng,
        radius=args.radius, max_results=args.max_results, resume_token=resume_token,
    ))
    LOGGER.info("Text Search returned %d place summaries.", len(summaries))

    for summ in summaries:
        details = client.place_details(summ.get("id")) if not args.no_details else None
        raw_leads.append(map_to_lead(summ, details, region=args.region, city=args.city))

    leads, dups = dedupe_leads(raw_leads)
    LOGGER.info("Deduplicated: %d unique leads (%d duplicates removed).", len(leads), dups)

    storage.save_leads(paths, leads)
    # Write a leads.csv now (scores fill in after `audit`).
    _regenerate_outputs(paths, leads, storage.load_audits(paths))

    report = {
        "command": "search",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "query": args.query, "region": args.region, "city": args.city,
        "mock": args.mock,
        "unique_leads": len(leads), "duplicates_removed": dups,
        "api_usage": client.counters.as_dict(),
        "budget": {"max": budget.max_requests, "used": budget.used},
        "last_page_token": getattr(client, "last_page_token", None),
    }
    storage.write_run_report(paths, report)
    _print_usage(report)
    print(f"\nSaved {len(leads)} leads → {paths.leads_json}")
    return 0


def cmd_audit(args):
    paths = config.make_paths(args.output_dir)
    paths.ensure()
    leads = storage.load_leads(config.make_paths(args.output_dir)) if not args.input else \
        storage.read_json(Path(args.input), default={}).get("leads", []) or []
    if not leads:
        LOGGER.error("No leads found. Run `search` first (or pass --input).")
        return 2

    fetcher = MockFetcher() if args.mock else RealFetcher(timeout=args.timeout)
    existing = {a.get("place_id"): a for a in storage.load_audits(paths)} if args.resume else {}

    audits = []
    for lead in leads:
        pid = lead.get("place_id")
        if args.resume and pid in existing:
            audits.append(existing[pid])
            continue
        LOGGER.info("Auditing %s (%s)", lead.get("business_name"), lead.get("website") or "geen website")
        audit = audit_lead(lead, fetcher)

        if args.screenshots and audit.get("has_website") and audit.get("reachable"):
            from leadfinder import screenshots
            shots = screenshots.capture(pid, lead["website"], paths)
            audit["screenshot_desktop"] = shots["desktop"]
            audit["screenshot_mobile"] = shots["mobile"]
            audit["screenshot_status"] = shots["status"]

        audits.append(audit)

    storage.save_audits(paths, audits)
    scores = _regenerate_outputs(paths, leads, audits)

    report = storage.read_json(paths.run_report, default={}) or {}
    report.update({
        "audit_generated_at": datetime.now(timezone.utc).isoformat(),
        "audited": len(audits), "mock": args.mock,
        "score_distribution": _distribution(scores),
    })
    storage.write_run_report(paths, report)

    print(f"\nAudited {len(audits)} sites → {paths.audits_json}")
    print(f"Refreshed CSV → {paths.leads_csv}")
    print(f"Dashboard → {paths.dashboard_html}")
    return 0


def cmd_export(args):
    paths = config.make_paths(args.output_dir)
    leads = storage.load_leads(paths)
    audits = storage.load_audits(paths)
    if not leads:
        LOGGER.error("No leads to export. Run `search` and `audit` first.")
        return 2
    scores = _compute_scores(audits)
    audits_by = {a.get("place_id"): a for a in audits}
    review = storage.load_review_state(paths)

    rows = storage.build_csv_rows(leads, audits_by, scores, review)
    filtered = [r for r in rows if (r["opportunity_score"] or 0) >= args.min_score]
    filtered.sort(key=lambda r: r["opportunity_score"] or 0, reverse=True)

    if args.format == "json":
        out = paths.output / "leads-export.json"
        storage.write_json(out, filtered)
    else:
        out = paths.output / "leads-export.csv"
        storage.write_csv(out, filtered)

    print(f"Exported {len(filtered)} leads (min-score {args.min_score}) → {out}")
    return 0


def cmd_dashboard(args):
    paths = config.make_paths(args.output_dir)
    leads = storage.load_leads(paths)
    audits = storage.load_audits(paths)
    if not leads:
        LOGGER.error("No leads found. Run `search` (and `audit`) first.")
        return 2
    _regenerate_outputs(paths, leads, audits)
    print(f"Dashboard → {paths.dashboard_html}")
    return 0


# ---------------------------------------------------------------------------
# Reporting helpers
# ---------------------------------------------------------------------------

def _distribution(scores: dict) -> dict:
    buckets = {"80-100": 0, "60-79": 0, "40-59": 0, "0-39": 0, "unscored": 0}
    for s in scores.values():
        v = s.get("score")
        if v is None:
            buckets["unscored"] += 1
        elif v >= 80:
            buckets["80-100"] += 1
        elif v >= 60:
            buckets["60-79"] += 1
        elif v >= 40:
            buckets["40-59"] += 1
        else:
            buckets["0-39"] += 1
    return buckets


def _print_usage(report: dict) -> None:
    usage = report.get("api_usage", {})
    print("\n--- API usage ---")
    for k, v in usage.items():
        print(f"  {k:24} {v}")
    b = report.get("budget", {})
    print(f"  {'budget_used':24} {b.get('used')}/{b.get('max')}")


# ---------------------------------------------------------------------------
# Arg parsing
# ---------------------------------------------------------------------------

def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="lead_finder", description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--log-level", default="INFO")
    p.add_argument("--mock", action="store_true",
                   help="Use bundled fixtures — NO real API calls (development default).")
    p.add_argument("--output-dir", default=None, help="Output directory (default: ./output).")
    sub = p.add_subparsers(dest="command", required=True)

    s = sub.add_parser("search", help="Find businesses via the Places API.")
    s.add_argument("--query", required=True, help='e.g. "dakdekker" or "kapper"')
    s.add_argument("--region", default=None, help="Province/region, e.g. Utrecht.")
    s.add_argument("--city", default=None, help="City, e.g. Amsterdam.")
    s.add_argument("--lat", type=float, default=None)
    s.add_argument("--lng", type=float, default=None)
    s.add_argument("--radius", type=float, default=None, help="Location bias radius (meters).")
    s.add_argument("--max-results", type=int, default=50)
    s.add_argument("--budget", type=int, default=200, help="Max billable API requests this run.")
    s.add_argument("--delay", type=float, default=0.5, help="Delay between API calls (s).")
    s.add_argument("--no-details", action="store_true", help="Skip Place Details enrichment.")
    s.add_argument("--dry-run", action="store_true", help="Print the planned request; call nothing.")
    s.add_argument("--resume", action="store_true", help="Continue from the saved page token.")
    s.set_defaults(func=cmd_search)

    a = sub.add_parser("audit", help="Audit lead websites and score them.")
    a.add_argument("--input", default=None, help="Path to a leads.json (default: output/leads.json).")
    a.add_argument("--timeout", type=float, default=15.0)
    a.add_argument("--screenshots", action="store_true", help="Capture screenshots (needs Playwright).")
    a.add_argument("--resume", action="store_true", help="Skip already-audited leads.")
    a.set_defaults(func=cmd_audit)

    e = sub.add_parser("export", help="Export scored leads filtered by score.")
    e.add_argument("--min-score", type=int, default=0)
    e.add_argument("--format", choices=["csv", "json"], default="csv")
    e.set_defaults(func=cmd_export)

    d = sub.add_parser("dashboard", help="(Re)build the local review dashboard.")
    d.set_defaults(func=cmd_dashboard)
    return p


def main(argv=None) -> int:
    global LOGGER
    # Windows consoles default to cp1252; force UTF-8 so any non-ASCII output
    # (arrows, accented business names) prints instead of crashing.
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8", errors="replace")
        except (AttributeError, ValueError):
            pass
    args = build_parser().parse_args(argv)
    LOGGER = configure(args.log_level)
    try:
        return args.func(args)
    except RuntimeError as exc:
        LOGGER.error("%s", exc)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
