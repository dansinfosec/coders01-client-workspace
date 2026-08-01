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

from leadfinder import config, storage, dashboard as dash, targets, batch as batchmod, pricing  # noqa: E402
from leadfinder.logging_setup import configure  # noqa: E402
from leadfinder.leads import (  # noqa: E402
    map_to_lead, has_sufficient_identity, has_valid_phone, is_open_business,
    needs_details_fallback,
)
from leadfinder.normalize import dedupe_leads  # noqa: E402
from leadfinder.garage_messages import evaluate_lead  # noqa: E402
from leadfinder.audit import audit_lead, MockFetcher, RealFetcher  # noqa: E402
from leadfinder.places_client import (  # noqa: E402
    PlacesClient, MockTransport, RealTransport, TEXT_SEARCH_FIELDS, PLACE_DETAILS_FIELDS,
)
from leadfinder import website_discovery as wd  # noqa: E402
from leadfinder import canonical  # noqa: E402
from leadfinder import search_provider as searchprov  # noqa: E402

LOGGER = None


# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------

def _mock_guard(args) -> bool:
    """Refuse to let a MOCK run write into the real output/ directory.

    A mock batch that runs against the production output dir merges fixture
    leads into real datasets and charges phantom USD to the real cost state
    (this actually happened once via a test without --output-dir). Mock runs
    must always point at a scratch dir.
    """
    if not args.mock:
        return True
    out = Path(args.output_dir).resolve() if args.output_dir else config.DEFAULT_OUTPUT_DIR.resolve()
    if out == config.DEFAULT_OUTPUT_DIR.resolve():
        LOGGER.error("--mock refuses to write into the REAL output dir (%s). "
                     "Pass --output-dir <scratch-dir> for mock runs.", out)
        return False
    return True


def _make_client(args, budget):
    if args.mock:
        LOGGER.info("Using MOCK Places transport (no real API calls).")
        return PlacesClient(MockTransport(), budget=budget, delay=0.0)
    key = config.get_api_key(required=True)
    LOGGER.info("Using REAL Places transport.")
    return PlacesClient(RealTransport(key), budget=budget, delay=args.delay)


# Industries that get the garage booking/vehicle-lookup audit extension.
GARAGE_INDUSTRIES = {"autogarage"}


def _garage_features_for(industry_slug: str | None, forced: bool = False) -> bool:
    """True when the garage booking/vehicle-lookup detection should run.

    Auto-enabled for the `autogarage` industry slug, or when explicitly forced
    via --garage-features (e.g. to test the feature against another industry).
    """
    return bool(forced) or (industry_slug in GARAGE_INDUSTRIES)


def _compute_scores(audits: list[dict]) -> dict:
    """Score every audit. Garage audits (has_basic_contact_form present) get
    the full opportunity classification + sales copy via evaluate_lead();
    every other industry gets exactly the same score_audit() result as before."""
    scores = {}
    for a in audits:
        scores[a.get("place_id")] = evaluate_lead(a)
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


def _rebuild_master_dashboard(output_dir=None):
    """Combine every industry folder into dashboard-data.json + the master
    dashboard.html at the top-level output/ dir."""
    top = config.make_paths(output_dir)
    top.output.mkdir(parents=True, exist_ok=True)
    payload = dash.build_combined_data(top)
    storage.write_json(top.dashboard_data, payload)
    top.dashboard_html.write_text(dash.render(payload), encoding="utf-8")
    LOGGER.info("Master dashboard rebuilt: %d leads across %s",
                len(payload["rows"]), payload["industries"])
    return payload


# ---------------------------------------------------------------------------
# Commands
# ---------------------------------------------------------------------------

def cmd_search(args):
    if not _mock_guard(args):
        return 2
    # Every search/batch targets one industry, stored separately so batches do
    # not overwrite each other.
    paths = config.make_industry_paths(args.industry, args.output_dir)
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

    skipped_closed = 0
    for summ in summaries:
        lead = map_to_lead(summ, region=args.region, city=args.city, industry=args.industry)
        # Narrow, opt-in fallback: only when there is no contact route at all.
        if args.details_fallback and needs_details_fallback(lead):
            details = client.place_details(summ.get("id"))
            if details:
                lead = map_to_lead(summ, details, region=args.region, city=args.city,
                                   industry=args.industry)
        if not is_open_business(lead):
            skipped_closed += 1
            continue
        raw_leads.append(lead)
    if skipped_closed:
        LOGGER.info("Skipped %d closed business(es).", skipped_closed)

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
    _rebuild_master_dashboard(args.output_dir)
    _print_usage(report)
    print(f"\nSaved {len(leads)} leads ({args.industry}) → {paths.leads_json}")
    return 0


def cmd_audit(args):
    paths = config.make_industry_paths(args.industry, args.output_dir)
    paths.ensure()
    leads = storage.load_leads(paths) if not args.input else \
        storage.read_json(Path(args.input), default={}).get("leads", []) or []
    if not leads:
        LOGGER.error("No leads found. Run `search` first (or pass --input).")
        return 2

    fetcher = MockFetcher() if args.mock else RealFetcher(timeout=args.timeout)
    existing = {a.get("place_id"): a for a in storage.load_audits(paths)} if args.resume else {}
    garage_features = _garage_features_for(args.industry, forced=args.garage_features)
    if garage_features:
        LOGGER.info("Garage booking/vehicle-lookup detection ENABLED for industry '%s'.", args.industry)

    audits = []
    for lead in leads:
        pid = lead.get("place_id")
        if args.resume and pid in existing:
            audits.append(existing[pid])
            continue
        LOGGER.info("Auditing %s (%s)", lead.get("business_name"), lead.get("website") or "geen website")
        audit = audit_lead(lead, fetcher, garage_features=garage_features)

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
    _rebuild_master_dashboard(args.output_dir)

    print(f"\nAudited {len(audits)} sites ({args.industry}) → {paths.audits_json}")
    print(f"Refreshed CSV → {paths.leads_csv}")
    print(f"Master dashboard → {config.make_paths(args.output_dir).dashboard_html}")
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
    """(Re)build the combined multi-industry master dashboard from every
    output/industries/<slug>/ folder."""
    industries = config.list_industries(args.output_dir)
    if not industries:
        LOGGER.error("No industry data found under output/industries/. Run `search` first.")
        return 2
    payload = _rebuild_master_dashboard(args.output_dir)
    top = config.make_paths(args.output_dir)
    print(f"Combined data → {top.dashboard_data}")
    print(f"Master dashboard → {top.dashboard_html}")
    print(f"Industries: {payload['industries']} · {len(payload['rows'])} leads")
    return 0


# ---------------------------------------------------------------------------
# discover-websites: find websites for leads whose Google website is empty
# ---------------------------------------------------------------------------

def cmd_discover_websites(args):
    """Phase-1 website-discovery enrichment. Makes ZERO Google Places calls and
    NEVER writes leads.json — only the separate website-discovery.* artifacts."""
    if not _mock_guard(args):
        return 2
    run_tag = getattr(args, "run_tag", None)
    paths = config.make_industry_paths(args.industry, args.output_dir, run_tag=run_tag)
    paths.ensure()

    all_leads = storage.load_leads(paths)
    if not all_leads:
        LOGGER.error("No leads found for industry '%s'. Run discovery first.", args.industry)
        return 2

    exclude_ids = wd.already_discovered_ids(paths) if getattr(args, "exclude_discovered", False) else set()
    missing = wd.leads_missing_website(all_leads)
    if getattr(args, "prep_class", None):
        scope = wd.select_by_prep_class(all_leads, args.prep_class, exclude_ids=exclude_ids)
        scope_label = f"{len(scope)} lead(s) with prep-class '{args.prep_class}'"
    elif getattr(args, "pilot_composition", False):
        scope = wd.select_pilot_composition(all_leads, exclude_ids=exclude_ids)
        from collections import Counter
        comp = Counter(wd.prep_classification(l) for l in scope)
        scope_label = (f"composition pilot of {len(scope)} "
                       f"({comp[wd.PREP_AUTOMOTIVE]} automotive / "
                       f"{comp[wd.PREP_WRONG]} wrong-industry / {comp[wd.PREP_ADJACENT]} adjacent)")
    elif args.pilot_sample:
        scope = wd.select_pilot_sample(all_leads, n=args.pilot_sample, exclude_ids=exclude_ids)
        scope_label = f"deterministic pilot sample of {len(scope)}"
    else:
        pool = [l for l in missing if l.get("place_id") not in exclude_ids]
        scope = pool[:args.limit] if args.limit else pool
        scope_label = f"{len(scope)} lead(s)" + (f" (--limit {args.limit})" if args.limit else "")

    print(f"Industry            : {args.industry}" + (f"   run-tag: {run_tag}" if run_tag else ""))
    print(f"Total leads         : {len(all_leads)}")
    print(f"With Google website : {len(all_leads) - len(missing)}")
    print(f"Missing website     : {len(missing)}  <- discovery scope population")
    if exclude_ids:
        print(f"Excluded (prior runs): {len(exclude_ids)} place_id(s)")
    print(f"This run will process: {scope_label}")
    print(f"Provider            : {'MOCK (no network)' if args.mock else 'Brave Web Search (LIVE)'}")
    print(f"USD ceiling         : ${args.usd_budget:.2f}   | request ceiling: {args.max_requests}")
    print(f"Resume              : {'off' if args.no_resume else 'on'}")

    if args.dry_run:
        print("\nDRY RUN — no search or fetch requests will be made.\n")
        print("Planned per-lead query strategy (max 2 normal + 1 telephone-on-ambiguity):")
        shown = scope[:args.pilot_sample or 25]
        for i, lead in enumerate(shown, 1):
            ident = wd.LeadIdentity.from_lead(lead)
            plan = wd.build_queries(ident)
            flags = []
            flags.append("generic-name" if ident.generic else "unique-name")
            flags.append("complete-addr" if wd._address_complete(lead) else "partial-addr")
            print(f"  {i:2}. {lead.get('business_name')} — {lead.get('city')}  "
                  f"[{', '.join(flags)}]")
            print(f"      address : {lead.get('address')}")
            print(f"      primary : {plan['primary']}")
            print(f"      fallback: {plan['fallback']}")
            print(f"      phone   : {plan['phone']}  (used only if identity is ambiguous)")
        if len(scope) > len(shown):
            print(f"  ... +{len(scope) - len(shown)} more")
        print("\nDRY RUN complete — nothing was called, written state unchanged.")
        return 0

    if args.mock:
        provider = searchprov.MockSearchProvider()
        fetcher = MockFetcher()
        LOGGER.info("MOCK website discovery — no real search/fetch calls.")
    else:
        key = config.get_brave_api_key(required=True)   # never logged/printed
        provider = searchprov.BraveSearchProvider(key, timeout=wd.FETCH_TIMEOUT)
        fetcher = RealFetcher(timeout=wd.FETCH_TIMEOUT)
        LOGGER.info("LIVE website discovery via Brave Web Search.")

    report = wd.run_discovery(
        all_leads, provider, fetcher, paths,
        max_usd=args.usd_budget, max_requests=args.max_requests,
        limit=None, sample=scope, resume=not args.no_resume,
    )

    print("\n=== Website-discovery report ===")
    print(f"  processed this run : {report.get('processed_this_run')}")
    for status, n in report.get("status_counts", {}).items():
        print(f"    {status:20}: {n}")
    cost = report.get("cost", {})
    print(f"  search requests    : {cost.get('count_search')} "
          f"(+{cost.get('count_retries')} retries) = ${cost.get('spent_usd', 0):.3f}")
    print(f"  outputs            : {paths.website_discovery_json}")
    print(f"                       {paths.discovered_websites_csv}")
    print(f"                       {paths.manual_website_review_csv}")
    print(f"                       {paths.website_not_found_csv}")
    print(f"                       {paths.rejected_candidates_json}")
    return 0


def cmd_retry_website_fetches(args):
    """Retry ONLY already-known candidate URLs for leads flagged fetch_retry_pending.
    Makes ZERO Brave requests and constructs NO new queries. Never writes leads.json
    or Places state; writes a separate website-fetch-retry-report.json."""
    if not _mock_guard(args):
        return 2
    paths = config.make_industry_paths(args.industry, args.output_dir)
    if not Path(paths.website_discovery_reeval).exists():
        LOGGER.error("No re-evaluation report for '%s'. Run reevaluate-websites first.", args.industry)
        return 2
    place_ids = list(args.place_id) if args.place_id else wd.select_retry_place_ids(paths, args.status)
    if not place_ids:
        LOGGER.error("No leads with status '%s' to retry.", args.status)
        return 2

    leads = storage.load_leads(paths)
    recs = {r["place_id"]: r for r in
            (storage.read_json(paths.website_discovery_json, default={}) or {}).get("results", [])}

    print(f"Retry scope (status='{args.status}'): {len(place_ids)} lead(s) — KNOWN URLs only, NO Brave.")
    for pid in place_ids:
        rec = recs.get(pid, {})
        eligible = [wd.normalize_domain(c.get("url")) for c in rec.get("candidates", [])
                    if wd.classify_domain(wd.normalize_domain(c.get("url"))) is None]
        seen, doms = set(), []
        for d in eligible:
            if d and d not in seen:
                seen.add(d); doms.append(d)
        print(f"  - {rec.get('business_name','?')}  [{pid}]  candidate domains: "
              f"{', '.join(doms[:wd.MAX_FETCHED_DOMAINS]) or '(none eligible)'}")

    if args.dry_run:
        print("\nDRY RUN — no candidate fetches performed.")
        return 0

    if args.mock:
        fetcher = MockFetcher()
        LOGGER.info("MOCK retry — no real candidate fetches.")
    else:
        fetcher = RealFetcher(timeout=wd.RETRY_FETCH_TIMEOUT)
        LOGGER.info("LIVE retry of known candidate URLs (no Brave).")

    report = wd.retry_fetches(paths, leads, place_ids, fetcher)
    print("\n=== Retry report ===")
    print(f"  status BEFORE : {report['status_before']}")
    print(f"  status AFTER  : {report['status_after']}")
    print(f"  report → {paths.website_fetch_retry_report}")
    return 0


def cmd_manual_review_queue(args):
    """Build/refresh the manual-review queue for fetch_failed leads. Preserves the
    factual fetch_failed status; never writes leads.json or Places state."""
    import glob
    paths = config.make_industry_paths(args.industry, args.output_dir)
    if not Path(paths.website_fetch_retry_report).exists():
        LOGGER.error("No retry report for '%s'. Run retry-website-fetches first.", args.industry)
        return 2
    leads = storage.load_leads(paths)
    # Auto-include every TAGGED discovery-results file (e.g. pilot2, full1) so their
    # fetch_failed leads join the one combined queue. Analysis files are skipped.
    extra = []
    for path in sorted(glob.glob(str(paths.output / "website-discovery-*.json"))):
        name = Path(path).name
        if any(k in name for k in ("progress", "cost-state", "report", "reeval")):
            continue
        tag = name[len("website-discovery-"):-len(".json")]
        extra.append({"path": Path(path), "records_key": "results",
                      "status_key": "status", "source": f"{tag}_discovery"})
    result = wd.build_manual_review_queue(paths, leads, extra_sources=extra)
    print(f"Combined manual-review queue (fetch_failed, unresolved website status): "
          f"{result['count']} lead(s)")
    for q in result["queue"]:
        print(f"  - [{q['source']}] {q['business_name']}  [{q['place_id']}]  "
              f"domains: {', '.join(q['candidate_domains']) or '(none)'}  "
              f"status: {q['manual_review_status']}")
    print(f"  reviewer options: {' / '.join(wd.MANUAL_REVIEW_OUTCOMES)}")
    print(f"  queue CSV → {paths.manual_review_queue_csv}")
    print(f"  annotations added to → {paths.website_fetch_retry_report} (fetch_failed preserved)")
    return 0


def cmd_prep_review_split(args):
    """Build the wrong-industry review queue (Part A) and the adjacent read-only
    report (Part C) from the remaining prep population. No Brave, no fetch, no
    leads.json changes. Deterministic + idempotent."""
    paths = config.make_industry_paths(args.industry, args.output_dir)
    leads = storage.load_leads(paths)
    # Exclude everything already processed by any discovery run (pilot 1 + 2 + …).
    excl = wd.already_discovered_ids(config.make_industry_paths(args.industry, args.output_dir,
                                                                run_tag="__none__"))
    wrong = wd.build_wrong_industry_review(paths, leads, exclude_ids=excl)
    adj = wd.build_adjacent_review(paths, leads, exclude_ids=excl)
    print(f"Wrong-industry review (suspected_wrong_industry_pending_review): {wrong['count']} leads")
    print(f"  → {paths.wrong_industry_review_csv}")
    print(f"  → {paths.wrong_industry_review_json}")
    print(f"Adjacent held (read-only report): {adj['count']} leads")
    print(f"  → {paths.adjacent_industry_review_csv}")
    print(f"  → {paths.adjacent_industry_review_json}")
    return 0


def cmd_canonicalize_discovery(args):
    """Deterministic, read-only consolidation: exactly one canonical latest-status
    record per processed place_id (Part A), the questionable accepted-website
    review queue (Part B), the operational queues (Part C), and the prepared
    (not executed) audit scope (Part D). Makes NO network calls; never modifies
    leads.json, Google Places state, or any source discovery/reeval/retry file."""
    paths = config.make_industry_paths(args.industry, args.output_dir)
    leads = storage.load_leads(paths)

    summary = canonical.canonicalize(paths, leads)
    recs = summary["records"]
    print(f"Canonical latest-status dataset: {summary['processed']} place_ids")
    print(f"  status: {summary['canonical_status_counts']}")
    print(f"  → {paths.discovery_canonical_json}")
    print(f"  → {paths.discovery_canonical_csv}")
    print(f"  → {paths.discovery_canonical_summary}")

    rev = canonical.build_accepted_website_review(paths, recs)
    pending = sum(1 for r in rev["leads"] if r.get("accepted_website_review_status") == "pending")
    print(f"\nAccepted-website review queue: {rev['count']} lead(s) ({pending} pending)")
    print(f"  → {paths.accepted_website_review_csv}")
    print(f"  → {paths.accepted_website_review_json}")

    # Re-canonicalize: a completed accepted-website decision changes canonical
    # status, so the operational queues/audit scope must reflect it.
    summary = canonical.canonicalize(paths, leads)
    recs = summary["records"]

    ops = canonical.build_operational_queues(paths, recs)
    print(f"\nOperational queues (from canonical status):")
    print(f"  confirmed-discovered-websites.csv        : {ops['confirmed_discovered_websites']}")
    print(f"  identity-manual-review.csv                : {ops['identity_manual_review']}")
    print(f"  fetch-failed-manual-review.csv             : {ops['fetch_failed_manual_review']}")
    print(f"  no-reliable-official-website-found.csv     : {ops['no_reliable_official_website_found']}")
    print(f"  rejected-candidate-review.csv               : {ops['rejected_candidate_review']}")
    print(f"  (withheld pending/rejected accepts: {ops['withheld_pending_or_rejected_accepts']})")

    audit = canonical.prepare_audit_scope(paths, leads, recs)
    print(f"\nAudit scope (PREPARED, NOT executed):")
    print(f"  Google-supplied website leads   : {audit['google_supplied_website_leads']}")
    print(f"  Confirmed discovered websites   : {audit['confirmed_discovered_websites']}")
    print(f"  AUDIT-READY COUNT               : {audit['audit_ready_count']}")
    print(f"  double-assignment overlap       : {audit['double_assignment_overlap']}")
    print(f"  excluded: {audit['excluded']}")
    print(f"  → {paths.audit_scope_json}")
    return 0


def cmd_discovery_summary(args):
    """Read-only combined summary across all website-discovery runs (base + tagged),
    PLUS the canonical latest-status totals (labelled separately — raw per-run
    results can differ from canonical because of re-evaluation/retry lifecycle
    records). No network; never writes leads.json or Places state."""
    paths = config.make_industry_paths(args.industry, args.output_dir)
    leads = storage.load_leads(paths)
    s = wd.summarize_discovery_runs(paths, leads)
    print("=== RAW per-run results (as originally produced by each run) ===")
    for r in s["runs"]:
        print(f"  [{r['run']:>9}] processed {r['processed']:>4} | verified {r['verified']:>3} | "
              f"{r['brave_requests']} req / ${r['brave_cost_usd']:.3f} | {r['status_counts']}")
    print(f"  RAW COMBINED: processed {s['combined_processed']} | "
          f"{s['combined_brave_requests']} req / ${s['combined_brave_cost_usd']:.3f}")
    print(f"  RAW status (sum of each run's own result, NOT lifecycle-aware): "
          f"{s['combined_status_counts']}")

    if Path(paths.discovery_canonical_summary).exists():
        csum = storage.read_json(paths.discovery_canonical_summary, default={}) or {}
        print("\n=== CANONICAL latest-status totals (after re-evaluation + retry "
              "lifecycle precedence — run `canonicalize-discovery` to refresh) ===")
        print(f"  processed: {csum.get('processed')}")
        print(f"  status: {csum.get('canonical_status_counts')}")
        rev = storage.read_json(paths.accepted_website_review_json, default={}) or {}
        pending = sum(1 for r in rev.get("leads", [])
                      if r.get("accepted_website_review_status") == "pending")
        print(f"  accepted websites pending confirmation: {pending}")
    else:
        print("\n(No canonical dataset yet — run `canonicalize-discovery` first.)")

    rq = s["review_queues"]
    print(f"\n  review queues: fetch_failed manual={rq['manual_review_fetch_failed']} | "
          f"wrong-industry pending={rq['wrong_industry_pending_review']} | "
          f"adjacent held={rq['adjacent_held']}")
    print(f"  remaining unprocessed (missing website, not yet run): {s['remaining_unprocessed']}")
    print(f"  written → {paths.output / 'website-discovery-combined-summary.json'}")
    return 0


def cmd_reevaluate_websites(args):
    """OFFLINE re-evaluation of an existing website-discovery run under the updated
    verifier rules. Makes ZERO Brave requests and ZERO candidate fetches — reasons
    only over already-persisted data + leads.json. Never writes leads.json."""
    paths = config.make_industry_paths(args.industry, args.output_dir)
    if not Path(paths.website_discovery_json).exists():
        LOGGER.error("No website-discovery.json for '%s'. Run discover-websites first.", args.industry)
        return 2
    leads = storage.load_leads(paths)
    summary = wd.reevaluate_pilot(paths, leads)

    print(f"Offline re-evaluation (industry: {args.industry}) — NO Brave requests, NO fetches.")
    print(f"  leads re-evaluated : {summary['count']}")
    print(f"  status BEFORE      : {summary['status_before']}")
    print(f"  status AFTER       : {summary['status_after']}")
    print(f"  suspected_wrong_industry              : {summary['suspected_wrong_industry']}")
    print(f"  upgraded (mobile-vs-landline neutral) : {summary['upgraded_because_mobile_vs_landline']}")
    print(f"  upgraded (postcode+house+name)        : {summary['upgraded_by_postcode_house_name']}")
    print(f"  moved out of searched_not_found (transient): {summary['moved_out_of_searched_not_found_by_transient']}")
    print(f"  report → {paths.website_discovery_reeval}")
    return 0


# ---------------------------------------------------------------------------
# batch: run the category × location matrix (resumable, checkpointed)
# ---------------------------------------------------------------------------

def _audit_industry(ipaths, mock: bool, industry_slug: str | None = None):
    """Optional: audit one industry's leads (separate pipeline, opt-in)."""
    leads = storage.load_leads(ipaths)
    fetcher = MockFetcher() if mock else RealFetcher(timeout=15.0)
    existing = {a.get("place_id"): a for a in storage.load_audits(ipaths)}
    garage_features = _garage_features_for(industry_slug)
    audits = []
    for lead in leads:
        pid = lead.get("place_id")
        audits.append(existing[pid] if pid in existing
                      else audit_lead(lead, fetcher, garage_features=garage_features))
    storage.save_audits(ipaths, audits)
    _regenerate_outputs(ipaths, leads, audits)


def _process_combo(client, combo, args, global_index=None):
    """Search one combo, merge new leads into the category's industry folder.

    Lead discovery is now Text-Search-only: every result already carries the full
    lead schema, so NO Place Details request is made per result. A narrow
    Details fallback runs only when `--details-fallback` is set AND the lead has
    neither a phone nor a website.

    `global_index` (batch.GlobalLeadIndex) de-duplicates against every lead
    already stored anywhere under output/, not just this industry folder.
    """
    ipaths = config.make_industry_paths(combo["slug"], args.output_dir)
    ipaths.ensure()
    ts0 = client.counters.text_search_requests
    pd0 = client.counters.place_details_requests
    rt0 = client.counters.retries
    use_fallback = bool(getattr(args, "details_fallback", False))

    # Full reconciliation counters. INVARIANT (asserted below):
    #   found = kept + duplicate_current_batch + duplicate_global_existing
    #         + no_phone + closed + outside_location + invalid_or_unmappable
    #         + wrong_business_type + other_skipped
    # There is NO post-hoc city filter and NO primaryType/types filter, so
    # outside_location and wrong_business_type are structurally 0 — they exist
    # in the ledger to make that explicit and future-proof the invariant.
    new_leads = []
    counters = {
        "duplicate_current_batch": 0,   # first seen earlier in THIS run (sibling query)
        "duplicate_global_existing": 0, # already stored in output/ before the run
        "no_phone": 0,
        "closed": 0,
        "outside_location": 0,          # no such filter (locationRestriction is API-side)
        "invalid_or_unmappable": 0,     # failed has_sufficient_identity
        "wrong_business_type": 0,       # no such filter
        "other_skipped": 0,             # found but never evaluated (cost-stop break)
    }
    businesses_found = 0
    for summ in client.search_text(combo["query"], max_results=args.max_results,
                                   restriction=combo.get("restriction")):
        businesses_found += 1
        if client.cost_stopped:
            counters["other_skipped"] += 1          # yielded but never evaluated
            break
        lead = map_to_lead(summ, region=combo["location"], industry=combo["slug"])

        # Opt-in, narrow fallback: only when there is no contact route at all.
        if use_fallback and needs_details_fallback(lead):
            details = client.place_details(summ.get("id"))
            if details is None and client.cost_stopped:
                counters["other_skipped"] += 1      # evaluation aborted mid-lead
                break
            if details:
                lead = map_to_lead(summ, details, region=combo["location"],
                                   industry=combo["slug"])

        if not is_open_business(lead):              # requirement: skip closed
            counters["closed"] += 1
            continue
        if args.require_phone and not has_valid_phone(lead):
            counters["no_phone"] += 1
            continue
        if not has_sufficient_identity(lead):
            counters["invalid_or_unmappable"] += 1
            continue
        origin = global_index.classify(lead) if global_index is not None else None
        if origin == "existing":
            counters["duplicate_global_existing"] += 1
            continue
        if origin == "run":
            counters["duplicate_current_batch"] += 1
            continue
        new_leads.append(lead)
        if global_index is not None:
            global_index.add(lead, origin="run")    # prevent intra-run repeats too

    # Reconciliation must close exactly; a nonzero rest means an uncounted path.
    unaccounted = businesses_found - len(new_leads) - sum(counters.values())
    if unaccounted:
        LOGGER.warning("Reconciliation gap of %d in [%s | %s] — counted as other_skipped.",
                       unaccounted, combo["slug"], combo["location"])
        counters["other_skipped"] += unaccounted

    existing = storage.load_leads(ipaths)           # preserve prior data
    existing_count = len(existing)
    merged, dups = batchmod.merge_leads(existing, new_leads)
    storage.save_leads(ipaths, merged)
    _regenerate_outputs(ipaths, merged, storage.load_audits(ipaths))
    if args.audit and not client.cost_stopped:
        _audit_industry(ipaths, args.mock, industry_slug=combo["slug"])

    d_text = client.counters.text_search_requests - ts0
    d_details = client.counters.place_details_requests - pd0
    d_retries = client.counters.retries - rt0
    new_saved = max(0, len(merged) - existing_count)
    return {
        "category": combo["category"],
        "location": combo["location"],
        "status": "completed",
        "requests_text": d_text,
        "requests_details": d_details,
        "retries": d_retries,
        "est_cost_usd": pricing.estimate_usd(d_text, d_details, d_retries),
        "businesses_found": businesses_found,
        "leads_kept": len(new_leads),
        "new_saved": new_saved,
        "existing_updated": max(0, len(new_leads) - new_saved),
        # Full reconciliation ledger (found = kept + all of these):
        **counters,
        "duplicates": dups,                          # merge-level (same folder), rare now
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


_AGG_KEYS = ("requests_text", "requests_details", "retries", "businesses_found",
             "leads_kept", "new_saved", "existing_updated", "no_phone", "closed",
             "duplicate_current_batch", "duplicate_global_existing",
             "outside_location", "invalid_or_unmappable", "wrong_business_type",
             "other_skipped", "duplicates")


def _accumulate(agg: dict, meta: dict) -> None:
    for k in _AGG_KEYS:
        agg[k] = agg.get(k, 0) + int(meta.get(k, 0))


def cmd_batch(args):
    if not _mock_guard(args):
        return 2
    paths = config.make_paths(args.output_dir)
    paths.ensure()
    state_path = paths.batch_progress
    cost_path = paths.cost_state

    if args.reset_state:
        batchmod.reset_state(state_path)
        pricing.CostGuard.reset(cost_path)
        print(f"Batch progress reset ({state_path}).")
        print(f"USD cost state reset  ({cost_path}).")
        return 0

    # Target selection: a preset supplies its own queries + locations + folder.
    preset = None
    if args.preset:
        try:
            preset = targets.get_preset(args.preset)
        except KeyError as exc:
            LOGGER.error("%s", exc)
            return 2
        combos = (targets.preset_round_robin if args.round_robin
                  else targets.preset_combinations)(
            preset, queries=args.category, locations=args.location,
            query_limit=args.category_limit, location_limit=args.location_limit)
        cats = sorted({c["category"] for c in combos})
        locs = sorted({c["location"] for c in combos})
    else:
        cats = targets.select_categories(args.category, args.category_limit, exclude=args.exclude)
        locs = targets.select_locations(args.location, args.location_limit)
        if not cats or not locs:
            LOGGER.error("No categories/locations selected.")
            return 2
        order = targets.iter_round_robin if args.round_robin else targets.iter_combinations
        combos = list(order(cats, locs))
        for c in combos:                       # strict geo restriction when known
            c["restriction"] = targets.location_restriction(c["location"])
    if not combos:
        LOGGER.error("No search combinations selected.")
        return 2

    state = batchmod.load_state(state_path)
    pending = batchmod.pending_combos(state, combos)

    # USD budgeting: operational limit = usd_budget minus the safety reserve.
    operational_usd = round(args.usd_budget * (1.0 - args.safety_pct / 100.0), 2)
    absolute_usd = round(float(args.usd_budget), 2)
    run_limit_usd = args.additional_cost_limit_usd
    est = batchmod.estimate(len(pending), args.max_results, args.budget,
                            details_fallback=args.details_fallback)
    est_usd = pricing.estimate_usd(est["max_text_search_requests"],
                                   est["max_place_details_requests"])

    # Historical (cumulative) spend, for the remaining-budget figures below.
    hist = pricing.CostGuard.load(cost_path, operational_usd=operational_usd,
                                  absolute_usd=absolute_usd, run_limit_usd=run_limit_usd)
    remaining_operational = hist.remaining_operational_usd()
    remaining_run = remaining_operational if run_limit_usd is None else \
        min(remaining_operational, float(run_limit_usd))

    label = f"Preset: {preset['name']}" if preset else "Matrix"
    print(f"{label} | Queries: {len(cats)} | Locations: {len(locs)} | Combinations: {len(combos)}"
          f" | order: {'round-robin' if args.round_robin else 'matrix'}")
    if args.exclude and not preset:
        print(f"  excluded categories: {', '.join(args.exclude)}")
    print(f"  completed (skipped): {len(combos) - len(pending)} | pending: {len(pending)} "
          f"| failed retryable: {len(state.get('failed', {}))}")
    print(f"  max-results/combo: {args.max_results} | require valid phone: {bool(args.require_phone)}")
    print(f"  strict geo restriction   : {sum(1 for c in pending if c.get('restriction'))}/{len(pending)} combos")
    print(f"  Place Details fallback   : {'ON (opt-in)' if args.details_fallback else 'OFF (default)'}")
    print("  --- planned requests ---")
    print(f"  MAX pages per combination : {est['max_pages_per_combo']}  (API cap: {batchmod.MAX_PAGES})")
    print(f"  MAX text-search requests  : {est['max_text_search_requests']}  @ ${pricing.TEXT_SEARCH_USD:.3f}")
    print(f"  MAX place-details requests: {est['max_place_details_requests']}  @ ${pricing.PLACE_DETAILS_USD:.3f}")
    print(f"  MAX total requests        : {est['max_total_requests']}")
    print("  --- budget ---")
    print(f"  ESTIMATED max USD (this run)      : ${est_usd:.2f}")
    if run_limit_usd is not None:
        print(f"  RUN limit (--additional-cost-limit-usd): ${float(run_limit_usd):.2f}")
    print(f"  historical spend so far           : ${hist.total_usd():.2f}")
    print(f"  REMAINING run budget              : ${remaining_run:.2f}")
    print(f"  USD operational ceiling (STOP)    : ${operational_usd:.2f}")
    print(f"  USD absolute ceiling (never cross): ${absolute_usd:.2f}")
    if est_usd > remaining_run:
        print(f"  NOTE: the estimate exceeds the remaining budget — the run will stop "
              f"early at ${remaining_run:.2f} and leave the rest pending for a later resume.")

    if args.dry_run or args.estimate_cost:
        if args.dry_run:
            shown = pending[:30]
            print("\nGenerated queries" + (" (first 30)" if len(pending) > 30 else "") + ":")
            for c in shown:
                geo = "geo" if c.get("restriction") else "no-geo"
                print(f"  [{c['slug']}] {c['query']}  ({geo})")
            if len(pending) > 30:
                print(f"  ... +{len(pending) - 30} more")
        print("\nDRY RUN - no API calls were made.")
        return 0

    # Large-batch confirmation guard (any run above the threshold).
    if batchmod.is_large(len(pending)) and not args.yes:
        print(f"\nLarge batch: {len(pending)} combinations (> {batchmod.LARGE_BATCH_THRESHOLD}). "
              f"Re-run with --yes to confirm.")
        return 2

    # CostGuard: cumulative across resumed runs (loads prior spend from disk).
    # `run_limit_usd` additionally caps THIS run only — historical cost-state.json
    # never needs manual editing.
    guard = pricing.CostGuard.load(cost_path, operational_usd=operational_usd,
                                   absolute_usd=absolute_usd, run_limit_usd=run_limit_usd)
    if guard.total_usd() > 0:
        print(f"\nResuming with ${guard.total_usd():.2f} already spent "
              f"(remaining operational: ${guard.remaining_operational_usd():.2f}).")
    if run_limit_usd is not None:
        print(f"This run may additionally spend at most ${float(run_limit_usd):.2f}.")

    # Global dedup: every lead already stored ANYWHERE under output/.
    global_index = batchmod.GlobalLeadIndex.build(args.output_dir)
    LOGGER.info("Global dedup index: %d existing leads across all industries.",
                global_index.total)

    budget = config.Budget(max_requests=args.budget)
    if args.mock:
        client = PlacesClient(MockTransport(), budget=budget, delay=0.0,
                              max_retries=args.retries, cost_guard=guard)
        LOGGER.info("MOCK batch - no real API calls.")
    else:
        key = config.get_api_key(required=True)          # key never logged/printed
        client = PlacesClient(RealTransport(key), budget=budget, delay=args.delay,
                              max_retries=args.retries, cost_guard=guard)
        LOGGER.info("LIVE batch - real Places API calls.")

    done = failed = 0
    stopped_on_cost = False
    agg: dict = {}
    for combo in pending:
        if not guard.can_afford("text"):
            LOGGER.warning("USD operational ceiling reached ($%.2f/$%.2f); stopping (resume later).",
                           guard.total_usd(), operational_usd)
            stopped_on_cost = True
            break
        if not budget.can_spend(1):
            LOGGER.warning("Request budget exhausted; stopping (resume later).")
            break
        try:
            meta = _process_combo(client, combo, args, global_index=global_index)
        except Exception as exc:  # noqa: BLE001
            if client.cost_stopped:
                stopped_on_cost = True
                batchmod.save_state(state_path, state)
                LOGGER.warning("USD ceiling hit during [%s | %s]; stopping.",
                               combo["slug"], combo["location"])
                break
            batchmod.mark_failed(state, combo, exc)
            failed += 1
            batchmod.save_state(state_path, state)
            LOGGER.warning("Combo FAILED [%s | %s]: %s", combo["slug"], combo["location"], exc)
            continue
        if client.cost_stopped:
            # Combo cut short by the USD ceiling — leave it PENDING (not completed)
            # so a resumed run retries it fully.
            _accumulate(agg, meta)
            batchmod.save_state(state_path, state)
            stopped_on_cost = True
            LOGGER.warning("USD ceiling hit mid-combo [%s | %s]; left pending for resume.",
                           combo["slug"], combo["location"])
            break
        batchmod.mark_completed(state, combo, meta)
        done += 1
        _accumulate(agg, meta)
        LOGGER.info("[%s | %s] found=%d kept=%d new=%d | dup-run=%d dup-existing=%d "
                    "no-phone=%d closed=%d invalid=%d other=%d  spent=$%.2f",
                    combo["slug"], combo["location"], meta["businesses_found"],
                    meta["leads_kept"], meta["new_saved"],
                    meta["duplicate_current_batch"], meta["duplicate_global_existing"],
                    meta["no_phone"], meta["closed"], meta["invalid_or_unmappable"],
                    meta["other_skipped"], guard.total_usd())
        batchmod.save_state(state_path, state)           # checkpoint after EVERY combo

    _rebuild_master_dashboard(args.output_dir)
    _print_batch_report(done, failed, len(state.get("failed", {})), stopped_on_cost,
                        len(pending) - done, guard, agg)
    return 0


def _print_batch_report(done, failed, failed_remaining, stopped_on_cost, not_reached, guard, agg) -> None:
    print("\n=== Batch report ===")
    print(f"  combinations completed      : {done}")
    print(f"  combinations failed         : {failed} ({failed_remaining} retryable remaining)")
    print(f"  combinations not reached    : {max(0, not_reached)}"
          + ("  (stopped at USD ceiling)" if stopped_on_cost else ""))
    print("  --- spend ---")
    print(f"  Text Search   : {guard.count_text} req  = ${guard.spent_text / 1000.0:.2f}")
    print(f"  Place Details : {guard.count_details} req  = ${guard.spent_details / 1000.0:.2f}")
    print(f"  Retries       : {guard.count_retries} req  = ${guard.spent_retries / 1000.0:.2f}")
    print(f"  THIS RUN spent: ${guard.run_spent_usd():.2f}"
          + (f"  (run limit ${guard.run_limit_mills/1000.0:.2f})"
             if guard.run_limit_mills is not None else ""))
    print(f"  TOTAL spent   : ${guard.total_usd():.2f}  (operational ${guard.operational_mills/1000.0:.2f}"
          f" / absolute ${guard.absolute_mills/1000.0:.2f})   [cumulative, historical]")
    print(f"  operational reserve remaining: ${guard.remaining_operational_usd():.2f}")
    print("  --- leads ---")
    print(f"  businesses returned         : {agg.get('businesses_found', 0)}")
    print(f"  skipped (closed business)   : {agg.get('closed', 0)}")
    print(f"  skipped (no valid phone)    : {agg.get('no_phone', 0)}")
    print(f"  dup (earlier in THIS run)   : {agg.get('duplicate_current_batch', 0)}")
    print(f"  dup (already in output/)    : {agg.get('duplicate_global_existing', 0)}")
    print(f"  skipped (invalid identity)  : {agg.get('invalid_or_unmappable', 0)}")
    print(f"  skipped (other/cost-stop)   : {agg.get('other_skipped', 0)}")
    print(f"  leads kept (valid)          : {agg.get('leads_kept', 0)}")
    print(f"  new leads saved             : {agg.get('new_saved', 0)}")
    print(f"  existing leads updated      : {agg.get('existing_updated', 0)}")
    print(f"  duplicates skipped          : {agg.get('duplicates', 0)}")


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
    s.add_argument("--industry", required=True,
                   help='Branche slug the results belong to, e.g. dakdekkers / thuiszorg / makelaars.')
    s.add_argument("--query", required=True, help='e.g. "dakdekker" or "kapper"')
    s.add_argument("--region", default=None, help="Province/region, e.g. Utrecht.")
    s.add_argument("--city", default=None, help="City, e.g. Amsterdam.")
    s.add_argument("--lat", type=float, default=None)
    s.add_argument("--lng", type=float, default=None)
    s.add_argument("--radius", type=float, default=None, help="Location bias radius (meters).")
    s.add_argument("--max-results", type=int, default=50)
    s.add_argument("--budget", type=int, default=200, help="Max billable API requests this run.")
    s.add_argument("--delay", type=float, default=0.5, help="Delay between API calls (s).")
    s.add_argument("--no-details", action="store_true",
                   help="(Deprecated no-op: discovery is Text-Search-only by default.)")
    s.add_argument("--details-fallback", action="store_true",
                   help="Allow Place Details ONLY for results missing both phone and website.")
    s.add_argument("--dry-run", action="store_true", help="Print the planned request; call nothing.")
    s.add_argument("--resume", action="store_true", help="Continue from the saved page token.")
    s.set_defaults(func=cmd_search)

    a = sub.add_parser("audit", help="Audit lead websites and score them.")
    a.add_argument("--industry", required=True,
                   help="Branche slug to audit (matches the search --industry).")
    a.add_argument("--input", default=None, help="Path to a leads.json (default: the industry's leads.json).")
    a.add_argument("--timeout", type=float, default=15.0)
    a.add_argument("--screenshots", action="store_true", help="Capture screenshots (needs Playwright).")
    a.add_argument("--resume", action="store_true", help="Skip already-audited leads.")
    a.add_argument("--garage-features", action="store_true",
                   help="Force appointment-booking/kenteken-RDW detection "
                        "(auto-enabled for --industry autogarage).")
    a.set_defaults(func=cmd_audit)

    e = sub.add_parser("export", help="Export scored leads filtered by score.")
    e.add_argument("--min-score", type=int, default=0)
    e.add_argument("--format", choices=["csv", "json"], default="csv")
    e.set_defaults(func=cmd_export)

    d = sub.add_parser("dashboard", help="(Re)build the local review dashboard.")
    d.set_defaults(func=cmd_dashboard)

    w = sub.add_parser("discover-websites",
                       help="Find websites for leads whose Google website is empty "
                            "(Brave Web Search; never touches Places state/leads.json).")
    w.add_argument("--industry", default="autogarage",
                   help="Industry slug to enrich (default: autogarage).")
    w.add_argument("--limit", type=int, default=None,
                   help="Process only the first N leads missing a website.")
    w.add_argument("--pilot-sample", type=int, default=None,
                   help="Process a DETERMINISTIC representative sample of N leads "
                        "(e.g. --pilot-sample 25).")
    w.add_argument("--pilot-composition", action="store_true",
                   help="Deterministic 25-lead sample with a fixed industry "
                        "composition (21 automotive / 2 wrong-industry / 2 adjacent).")
    w.add_argument("--prep-class", default=None,
                   choices=["automotive_likely", "adjacent_industry_control", "wrong_industry_control"],
                   help="Process ONLY leads with this preparation class (label selects "
                        "the population; it never overrides Verifier V2 at run time).")
    w.add_argument("--usd-budget", type=float, default=wd.DEFAULT_MAX_USD,
                   help="Hard USD ceiling for search requests (default: 5.00).")
    w.add_argument("--max-requests", type=int, default=wd.DEFAULT_MAX_REQUESTS,
                   help="Independent maximum number of search requests.")
    w.add_argument("--no-resume", action="store_true",
                   help="Ignore existing progress and reprocess from scratch.")
    w.add_argument("--run-tag", default=None,
                   help="Isolate this run's progress/cost-state/output files under a "
                        "suffix (e.g. pilot2). leads.json is unaffected.")
    w.add_argument("--exclude-discovered", action="store_true",
                   help="Exclude place_ids already processed by any OTHER "
                        "website-discovery run (e.g. a previous pilot).")
    w.add_argument("--dry-run", action="store_true",
                   help="Print the plan + query strategy; call and write nothing.")
    w.set_defaults(func=cmd_discover_websites)

    rv = sub.add_parser("reevaluate-websites",
                        help="OFFLINE re-evaluation of an existing discovery run "
                             "under the updated verifier rules (no Brave, no fetches).")
    rv.add_argument("--industry", default="autogarage",
                    help="Industry slug to re-evaluate (default: autogarage).")
    rv.set_defaults(func=cmd_reevaluate_websites)

    rf = sub.add_parser("retry-website-fetches",
                        help="Retry ONLY already-known candidate URLs for fetch_retry_pending "
                             "leads (no Brave, no new queries).")
    rf.add_argument("--industry", default="autogarage", help="Industry slug (default: autogarage).")
    rf.add_argument("--status", default="fetch_retry_pending",
                    help="Re-eval status to select (default: fetch_retry_pending).")
    rf.add_argument("--place-id", action="append", default=None,
                    help="Explicit place_id(s) to retry, repeatable (overrides --status).")
    rf.add_argument("--dry-run", action="store_true",
                    help="Print the scope + candidate domains; fetch nothing.")
    rf.set_defaults(func=cmd_retry_website_fetches)

    mq = sub.add_parser("manual-review-queue",
                        help="Build the human-review queue for fetch_failed leads "
                             "(preserves fetch_failed; never writes leads.json).")
    mq.add_argument("--industry", default="autogarage", help="Industry slug (default: autogarage).")
    mq.set_defaults(func=cmd_manual_review_queue)

    ds = sub.add_parser("discovery-summary",
                        help="Read-only combined summary across all discovery runs "
                             "(base + pilot2 + full1 …). No network.")
    ds.add_argument("--industry", default="autogarage", help="Industry slug (default: autogarage).")
    ds.set_defaults(func=cmd_discovery_summary)

    cd = sub.add_parser("canonicalize-discovery",
                        help="Deterministic, read-only consolidation: one canonical "
                             "latest-status record per lead, review queues, "
                             "operational queues, and the prepared audit scope. "
                             "No network.")
    cd.add_argument("--industry", default="autogarage", help="Industry slug (default: autogarage).")
    cd.set_defaults(func=cmd_canonicalize_discovery)

    pr = sub.add_parser("prep-review-split",
                        help="Build the wrong-industry review queue + adjacent held "
                             "report from the remaining prep population. No Brave.")
    pr.add_argument("--industry", default="autogarage", help="Industry slug (default: autogarage).")
    pr.set_defaults(func=cmd_prep_review_split)

    b = sub.add_parser("batch", help="Run the category x location matrix (resumable).")
    b.add_argument("--preset", default=None,
                   help="Target preset, e.g. automotive-garages-nl (own queries, "
                        "locations and industry folder).")
    b.add_argument("--category", action="append", default=None,
                   help="Category/query name(s), repeatable. Default: all configured (or preset) values.")
    b.add_argument("--location", action="append", default=None,
                   help="Location name(s), repeatable. Default: all configured locations.")
    b.add_argument("--exclude", action="append", default=None,
                   help="Category name(s) to exclude, repeatable (e.g. --exclude Dakdekker).")
    b.add_argument("--category-limit", type=int, default=None, help="Use only the first N categories.")
    b.add_argument("--location-limit", type=int, default=None, help="Use only the first N locations.")
    b.add_argument("--round-robin", action="store_true",
                   help="Spread requests across categories AND locations (broad coverage first).")
    b.add_argument("--require-phone", action="store_true",
                   help="Save ONLY leads with a valid telephone number.")
    b.add_argument("--max-results", type=int, default=20, help="Max results per search combination.")
    b.add_argument("--delay", type=float, default=0.5, help="Delay between API calls (s).")
    b.add_argument("--retries", type=int, default=3, help="Retry attempts for transient errors.")
    b.add_argument("--budget", type=int, default=1000, help="Max billable API requests this run (count).")
    b.add_argument("--usd-budget", type=float, default=pricing.DEFAULT_ABSOLUTE_USD,
                   help="Absolute USD ceiling that is NEVER crossed (default: 230).")
    b.add_argument("--safety-pct", type=float, default=15.0,
                   help="Safety reserve %%; the run STOPS at usd-budget minus this (default: 15).")
    b.add_argument("--additional-cost-limit-usd", type=float, default=None,
                   help="Extra USD ceiling for THIS run only (does not touch the "
                        "cumulative historical cost-state.json).")
    b.add_argument("--details-fallback", action="store_true",
                   help="Allow Place Details ONLY for results missing both phone and "
                        "website (default: off — discovery is Text-Search-only).")
    b.add_argument("--dry-run", action="store_true", help="Show combinations + estimate; call nothing.")
    b.add_argument("--estimate-cost", action="store_true", help="Print the request/cost estimate and exit.")
    b.add_argument("--yes", action="store_true", help="Confirm a large batch (> 20 combinations).")
    b.add_argument("--reset-state", action="store_true", help="Clear batch progress + USD cost state and exit.")
    b.add_argument("--audit", action="store_true",
                   help="Also audit each category's leads after its combos (default: off).")
    b.set_defaults(func=cmd_batch)
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
