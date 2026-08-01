"""Canonical latest-status consolidation of the website-discovery lifecycle.

Produces exactly ONE record per processed place_id by applying lifecycle
precedence — never summing multiple records for the same lead:

  Pilot 1 : completed human decision > retry report > Verifier-V2 re-eval > original
  Pilot 2 / full1-auto : completed human decision > the discovery run result

Read-only: preserves every source discovery / re-evaluation / retry file, never
touches leads.json or Google Places state, makes no network calls. Deterministic
and idempotent (atomic writes).
"""

from __future__ import annotations

from datetime import datetime, timezone

from . import storage

CANONICAL_STATUSES = ("found_verified", "manual_review", "searched_not_found",
                      "rejected_candidates", "fetch_failed", "discovery_error")


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _domains(candidates) -> list[str]:
    return sorted({c.get("domain") for c in (candidates or []) if c.get("domain")})


def _page_types(candidates) -> list[str]:
    return sorted({c.get("candidate_page_type") for c in (candidates or [])
                   if c.get("candidate_page_type")})


# A completed accepted-website-review decision that keeps the accept.
_ACCEPT_CONFIRMS = {"confirmed_official_website"}
# A completed accepted-website-review decision that REJECTS the accept and
# requires re-evaluating the lead's remaining candidate evidence (not a blanket
# reclassification — see `_reeval_after_accept_rejection`).
_ACCEPT_REJECTS = {"unrelated_website", "related_business_but_not_official_site"}


def _reeval_after_accept_rejection(candidates: list[dict], rejected_url: str | None) -> str:
    """Decision tree for a found_verified lead whose ONLY accepted candidate was
    rejected by a human. Never guesses — re-examines the lead's own stored
    candidate evidence (never a blanket reclassification):

      1. another official (non-blocklisted) candidate is still at MEDIUM
         (decision == 'manual', i.e. unresolved between accept/reject) -> manual_review
      2. an unresolved transient (DNS/SSL/timeout/429/5xx) candidate remains -> fetch_failed
      3. every other candidate considered was conclusively (non-transient,
         non-blocklist) rejected, or none exist besides the rejected accept
         itself -> rejected_candidates
      4. otherwise (e.g. only blocklisted candidates remain) -> searched_not_found
    """
    from .website_discovery import classify_domain, is_transient_fetch_reason
    others = [c for c in (candidates or []) if c.get("url") != rejected_url]
    eligible = [c for c in others if classify_domain(c.get("domain")) is None]

    if any(c.get("decision") == "manual" for c in eligible):
        return "manual_review"
    if any(is_transient_fetch_reason(c.get("rejection_reason")) for c in eligible):
        return "fetch_failed"
    conclusively_rejected = [c for c in eligible
                             if c.get("decision") == "rejected"
                             and not is_transient_fetch_reason(c.get("rejection_reason"))]
    if len(conclusively_rejected) == len(eligible):   # true even when eligible == []
        return "rejected_candidates"
    return "searched_not_found"


def canonicalize(paths, leads: list[dict]) -> dict:
    """Build the canonical latest-status dataset. Writes canonical json/csv/summary
    atomically and returns the summary dict (with the records under 'records')."""
    leads_by_id = {l.get("place_id"): l for l in (leads or [])}
    accepted_review = {r["place_id"]: r for r in
                       (storage.read_json(paths.accepted_website_review_json, default={}) or {}).get("leads", [])}

    records: dict[str, dict] = {}

    def _emit(pid, business_name, city, source_run, source_record, raw_status,
              canonical_status, confidence, accepted_website, candidates,
              relevance, manual_review_status, provenance, ts):
        lead = leads_by_id.get(pid, {})
        review = accepted_review.get(pid, {})
        ar_status = review.get("accepted_website_review_status")

        # Precedence #1a: an accepted-website human decision on a found_verified
        # lead. Confirming keeps the accept; rejecting triggers RE-EVALUATION of
        # the lead's own remaining candidate evidence (never a blanket downgrade).
        if canonical_status == "found_verified" and ar_status:
            if ar_status in _ACCEPT_CONFIRMS:
                provenance = "human_confirmed_accepted_website"
            elif ar_status in _ACCEPT_REJECTS:
                rejected_url = None
                for c in candidates or []:
                    if c.get("decision") == "accepted":
                        rejected_url = c.get("url")
                canonical_status = _reeval_after_accept_rejection(candidates, rejected_url)
                accepted_website, confidence = None, None
                provenance = f"human_rejected_accepted_website:{ar_status}"
        # Precedence #1b: a completed manual_review-queue decision (fetch_failed
        # leads only) — unaffected by the accepted-website review above.
        elif manual_review_status and manual_review_status != "pending":
            mapped = {"official_website_confirmed_manually": "found_verified",
                     "website_permanently_unavailable": "searched_not_found",
                     "no_reliable_website_found": "searched_not_found",
                     "directory_or_listing_only": "rejected_candidates",
                     "wrong_business_identity": "searched_not_found"}.get(manual_review_status)
            if mapped:
                canonical_status, provenance = mapped, f"human_manual_review:{manual_review_status}"

        records[pid] = {
            "place_id": pid,
            "business_name": business_name or lead.get("business_name"),
            "city": city or lead.get("city"),
            "source_run": source_run,
            "source_record": source_record,
            "raw_original_status": raw_status,
            "canonical_status": canonical_status,
            "confidence": confidence,
            "accepted_website": accepted_website,
            "candidate_domains": _domains(candidates),
            "candidate_page_types": _page_types(candidates),
            "industry_relevance_status": relevance,
            "manual_review_status": manual_review_status,
            "excluded_from_no_website_outreach": canonical_status != "found_verified",
            "status_provenance": provenance,
            "last_factual_update": ts,
        }

    # --- Pilot 1: original -> reeval -> retry, per place_id -----------------
    base = storage.read_json(paths.website_discovery_json, default={}) or {}
    d1 = {r["place_id"]: r for r in base.get("results", [])}
    base_ts = base.get("generated_at")
    reeval_doc = storage.read_json(paths.website_discovery_reeval, default={}) or {}
    reeval = {r["place_id"]: r for r in reeval_doc.get("leads", [])}
    reeval_ts = reeval_doc.get("generated_at")
    retry_doc = storage.read_json(paths.website_fetch_retry_report, default={}) or {}
    retry = {r["place_id"]: r for r in retry_doc.get("leads", [])}
    retry_ts = retry_doc.get("generated_at")

    for pid, orig in d1.items():
        raw = orig.get("status")
        # start from the original (richest fields)
        status, conf = raw, orig.get("confidence")
        acc, cands = orig.get("accepted_website"), orig.get("candidates", [])
        rel = orig.get("industry_relevance_status")
        mrs = orig.get("manual_review_status")
        src_run, src_rec, prov, ts = "pilot1", "website-discovery.json", "original_discovery", orig.get("updated_at") or base_ts
        if pid in reeval:
            rv = reeval[pid]
            status, conf = rv.get("new_status"), rv.get("new_confidence")
            src_rec, prov, ts = "website-discovery-reeval.json", "verifier_v2_reeval", reeval_ts
            rel = rv.get("industry_relevance_status", rel)
            if status not in ("found_verified", "manual_review"):
                acc = None
        if pid in retry:
            rr = retry[pid]
            status, conf = rr.get("new_status"), rr.get("confidence")
            acc = rr.get("accepted_website")
            cands = rr.get("candidates", cands)
            rel = rr.get("industry_relevance_status", rel)
            mrs = rr.get("manual_review_status", mrs)
            src_rec, prov, ts = "website-fetch-retry-report.json", "candidate_refetch", retry_ts
        _emit(pid, orig.get("business_name"), orig.get("city"), src_run, src_rec,
              raw, status, conf, acc, cands, rel, mrs, prov, ts)

    # --- Pilot 2 + full1-auto: discovery result is the factual status -------
    for run, jpath in (("pilot2", paths.output / "website-discovery-pilot2.json"),
                       ("full1-auto", paths.output / "website-discovery-full1-auto.json")):
        doc = storage.read_json(jpath, default={}) or {}
        for r in doc.get("results", []):
            _emit(r.get("place_id"), r.get("business_name"), r.get("city"), run,
                  jpath.name, r.get("status"), r.get("status"), r.get("confidence"),
                  r.get("accepted_website"), r.get("candidates", []),
                  r.get("industry_relevance_status"), r.get("manual_review_status"),
                  f"discovery_result({run})", r.get("updated_at"))

    recs = sorted(records.values(), key=lambda x: x["place_id"] or "")
    from collections import Counter
    counts = Counter(r["canonical_status"] for r in recs)
    summary = {
        "generated_at": _now(),
        "processed": len(recs),
        "canonical_status_counts": dict(sorted(counts.items())),
    }
    storage.write_json_atomic(paths.discovery_canonical_json,
                              {"generated_at": _now(), "count": len(recs), "records": recs})
    _write_canonical_csv(paths.discovery_canonical_csv, recs)
    storage.write_json_atomic(paths.discovery_canonical_summary, summary)
    out = dict(summary)
    out["records"] = recs
    return out


_CANON_COLS = ["place_id", "business_name", "city", "source_run", "source_record",
               "raw_original_status", "canonical_status", "confidence", "accepted_website",
               "candidate_domains", "candidate_page_types", "industry_relevance_status",
               "manual_review_status", "excluded_from_no_website_outreach",
               "status_provenance", "last_factual_update"]


def _write_canonical_csv(path, recs) -> None:
    import csv
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", newline="", encoding="utf-8-sig") as fh:
        w = csv.DictWriter(fh, fieldnames=_CANON_COLS, extrasaction="ignore")
        w.writeheader()
        for r in recs:
            row = dict(r)
            row["candidate_domains"] = " | ".join(r["candidate_domains"])
            row["candidate_page_types"] = " | ".join(r["candidate_page_types"])
            w.writerow(row)


def load_canonical(paths) -> list[dict]:
    return (storage.read_json(paths.discovery_canonical_json, default={}) or {}).get("records", [])


# ===========================================================================
# Part B — questionable accepted-website confirmation queue
# ===========================================================================

ACCEPTED_REVIEW_OUTCOMES = [
    "confirmed_official_website", "unrelated_website",
    "related_business_but_not_official_site", "insufficient_information",
]
# A confirmed accept enters the confirmed dataset; a "rejected" review keeps it out.
# (Same set as `_ACCEPT_REJECTS` above — aliased for readability at call sites.)
_ACCEPT_REJECTED = _ACCEPT_REJECTS


def _all_run_records(paths) -> dict:
    idx = {}
    for jpath in (paths.website_discovery_json,
                  paths.output / "website-discovery-pilot2.json",
                  paths.output / "website-discovery-full1-auto.json"):
        for r in (storage.read_json(jpath, default={}) or {}).get("results", []):
            idx[r.get("place_id")] = r
    return idx


def _is_questionable_accept(business_name, accepted_website, accepted_candidate) -> bool:
    """Questionable = accepted WITHOUT an exact telephone match AND the business
    name is not clearly reflected in the accepted domain (a different brand)."""
    import re
    from .normalize import normalize_name, normalize_domain
    ev = {e.get("signal") for e in (accepted_candidate or {}).get("evidence", [])}
    if "phone_match" in ev:
        return False
    compact = normalize_name(business_name) or ""
    dom = re.sub(r"[^a-z0-9]", "", (normalize_domain(accepted_website) or "").lower())
    return bool(compact) and compact not in dom


_ACCEPTED_REVIEW_BASE_COLS = [
    "place_id", "business_name", "city", "accepted_website", "raw_factual_status",
    "accepted_website_review_status", "excluded_from_automatic_merge",
    "excluded_from_automatic_audit", "confirmation_reason", "identity_evidence",
    "conflicting_or_weak_evidence", "reviewer_outcomes",
]


def build_accepted_website_review(paths, canonical_records: list[dict]) -> dict:
    """Confirmation queue for questionable found_verified accepts. Preserves the raw
    found_verified status as historical provenance; a human decision (via
    `apply_accepted_website_decision`) determines whether each may enter the
    confirmed dataset. Idempotent: once a place_id has a completed (non-"pending")
    decision, its ENTIRE existing row — including any extra fields the decision
    attached (confirmation_type, confirmation_source, telephone_match, …) — is
    carried forward unchanged rather than regenerated."""
    idx = _all_run_records(paths)
    prev_full = {r["place_id"]: r for r in
                (storage.read_json(paths.accepted_website_review_json, default={}) or {}).get("leads", [])}
    rows = []
    for rec in canonical_records:
        pid = rec["place_id"]
        prior = prev_full.get(pid)
        if prior and prior.get("accepted_website_review_status", "pending") != "pending":
            rows.append(prior)   # human decision + custom fields carried forward verbatim
            continue
        if rec["canonical_status"] != "found_verified" or not rec["accepted_website"]:
            continue
        src = idx.get(pid, {})
        acc = next((c for c in src.get("candidates", []) if c.get("decision") == "accepted"), {})
        if not _is_questionable_accept(rec["business_name"], rec["accepted_website"], acc):
            continue
        ev = [e.get("signal") for e in acc.get("evidence", [])]
        rows.append({
            "place_id": pid, "business_name": rec["business_name"],
            "city": rec["city"], "accepted_website": rec["accepted_website"],
            "raw_factual_status": "found_verified",
            "accepted_website_review_status": "pending",
            "excluded_from_automatic_merge": True,
            "excluded_from_automatic_audit": True,
            "confirmation_reason": "accepted on name + exact postcode/house but NO exact "
                                   "telephone match, and the site brand/domain differs from "
                                   "the business name — confirm it truly belongs to this business",
            "identity_evidence": [s for s in ("phone_match", "postcode_match",
                                              "house_number_match", "city_match", "name_strong") if s in ev],
            "conflicting_or_weak_evidence": [s for s in ("phone_differs_neutral", "address_conflict") if s in ev],
            "reviewer_outcomes": ACCEPTED_REVIEW_OUTCOMES,
        })
    rows.sort(key=lambda r: r["place_id"] or "")
    storage.write_json_atomic(paths.accepted_website_review_json,
                              {"generated_at": _now(), "count": len(rows),
                               "reviewer_outcomes": ACCEPTED_REVIEW_OUTCOMES, "leads": rows})
    _write_accepted_review_csv(paths.accepted_website_review_csv, rows)
    return {"count": len(rows), "leads": rows}


def _write_accepted_review_csv(path, rows: list[dict]) -> None:
    """CSV export tolerant of extra per-row fields (a human decision may attach
    custom provenance keys not present on auto-generated pending rows)."""
    extra_cols: list[str] = []
    for r in rows:
        for k in r:
            if k not in _ACCEPTED_REVIEW_BASE_COLS and k not in extra_cols:
                extra_cols.append(k)
    cols = _ACCEPTED_REVIEW_BASE_COLS + sorted(extra_cols)

    def fmt(v):
        if isinstance(v, list):
            return " | ".join(str(x) for x in v)
        return v

    _csv(path, [{k: fmt(r.get(k)) for k in cols} for r in rows], cols)


def apply_accepted_website_decision(paths, place_id: str, decision: str, **fields) -> dict:
    """Record a COMPLETED human decision for one accepted-website review row.

    Idempotent: overwrites only this place_id's row (creating it if the automatic
    detector had not yet flagged it) and merges `fields` (arbitrary extra
    provenance — confirmation_type, confirmation_source, telephone_match, etc.).
    Never touches leads.json, never calls the network. The caller must re-run
    `canonicalize()` afterwards for the decision to take effect on canonical
    status."""
    doc = storage.read_json(paths.accepted_website_review_json, default={}) or {}
    rows = {r["place_id"]: r for r in doc.get("leads", [])}
    row = rows.get(place_id, {"place_id": place_id, "reviewer_outcomes": ACCEPTED_REVIEW_OUTCOMES})
    row["accepted_website_review_status"] = decision
    row.update(fields)
    rows[place_id] = row
    ordered = sorted(rows.values(), key=lambda r: r["place_id"] or "")
    storage.write_json_atomic(paths.accepted_website_review_json,
                              {"generated_at": _now(), "count": len(ordered),
                               "reviewer_outcomes": ACCEPTED_REVIEW_OUTCOMES, "leads": ordered})
    _write_accepted_review_csv(paths.accepted_website_review_csv, ordered)
    return row


def _pending_or_rejected_accepts(paths) -> set:
    """place_ids of found_verified accepts NOT yet confirmed (pending or rejected)."""
    out = set()
    for r in (storage.read_json(paths.accepted_website_review_json, default={}) or {}).get("leads", []):
        if r.get("accepted_website_review_status", "pending") in ({"pending"} | _ACCEPT_REJECTED):
            out.add(r["place_id"])
    return out


# ===========================================================================
# Part C — operational queues from canonical status
# ===========================================================================

def _csv(path, rows, cols) -> None:
    import csv
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", newline="", encoding="utf-8-sig") as fh:
        w = csv.DictWriter(fh, fieldnames=cols, extrasaction="ignore")
        w.writeheader()
        for r in rows:
            w.writerow(r)


def build_operational_queues(paths, canonical_records: list[dict]) -> dict:
    by = {}
    for r in canonical_records:
        by.setdefault(r["canonical_status"], []).append(r)
    withheld = _pending_or_rejected_accepts(paths)

    def base(r):
        return {"place_id": r["place_id"], "business_name": r["business_name"],
                "city": r["city"], "source_run": r["source_run"],
                "candidate_domains": " | ".join(r["candidate_domains"]),
                "candidate_page_types": " | ".join(r["candidate_page_types"])}

    confirmed = [r for r in by.get("found_verified", []) if r["place_id"] not in withheld]
    _csv(paths.confirmed_discovered_websites_csv,
         [{**base(r), "accepted_website": r["accepted_website"], "confidence": r["confidence"]}
          for r in confirmed],
         ["place_id", "business_name", "city", "accepted_website", "confidence", "source_run"])

    _csv(paths.identity_manual_review_csv,
         [{**base(r), "confidence": r["confidence"]} for r in by.get("manual_review", [])],
         ["place_id", "business_name", "city", "confidence", "candidate_domains",
          "candidate_page_types", "source_run"])

    _csv(paths.fetch_failed_manual_review_csv,
         [{**base(r), "fetch_status": "fetch_failed",
           "manual_review_status": r.get("manual_review_status") or "pending"}
          for r in by.get("fetch_failed", [])],
         ["place_id", "business_name", "city", "fetch_status", "manual_review_status",
          "candidate_domains", "candidate_page_types", "source_run"])

    _csv(paths.no_reliable_official_website_csv,
         [{**base(r), "result": "no reliable official website found"}
          for r in by.get("searched_not_found", [])],
         ["place_id", "business_name", "city", "result", "candidate_domains", "source_run"])

    _csv(paths.rejected_candidate_review_csv,
         [base(r) for r in by.get("rejected_candidates", [])],
         ["place_id", "business_name", "city", "candidate_domains", "candidate_page_types", "source_run"])

    return {
        "confirmed_discovered_websites": len(confirmed),
        "identity_manual_review": len(by.get("manual_review", [])),
        "fetch_failed_manual_review": len(by.get("fetch_failed", [])),
        "no_reliable_official_website_found": len(by.get("searched_not_found", [])),
        "rejected_candidate_review": len(by.get("rejected_candidates", [])),
        "withheld_pending_or_rejected_accepts": len(withheld),
    }


# ===========================================================================
# Part D — audit-ready scope (prepared, not executed)
# ===========================================================================

def prepare_audit_scope(paths, leads: list[dict], canonical_records: list[dict]) -> dict:
    from .website_discovery import leads_missing_website
    google_ids = {l.get("place_id") for l in leads
                  if l.get("website") and str(l.get("website")).strip()}
    withheld = _pending_or_rejected_accepts(paths)
    confirmed = [r for r in canonical_records
                 if r["canonical_status"] == "found_verified" and r["accepted_website"]
                 and r["place_id"] not in withheld]
    confirmed_ids = {r["place_id"] for r in confirmed}
    # A confirmed-discovered lead is (by construction) a missing-Google-website
    # lead, so google_ids and confirmed_ids are disjoint => no double assignment.
    overlap = google_ids & confirmed_ids
    scope = []
    for l in leads:
        if l.get("place_id") in google_ids:
            scope.append({"place_id": l.get("place_id"), "website": l.get("website"),
                          "website_source": "google_supplied"})
    for r in confirmed:
        scope.append({"place_id": r["place_id"], "website": r["accepted_website"],
                      "website_source": "confirmed_discovered"})
    # dedupe by place_id (there should be none)
    seen, deduped = set(), []
    for s in scope:
        if s["place_id"] in seen:
            continue
        seen.add(s["place_id"])
        deduped.append(s)
    result = {
        "generated_at": _now(),
        "google_supplied_website_leads": len(google_ids),
        "confirmed_discovered_websites": len(confirmed_ids),
        "audit_ready_count": len(deduped),
        "double_assignment_overlap": len(overlap),
        "excluded": {
            "accepted_website_pending_or_rejected": len(withheld),
            "fetch_failed": sum(1 for r in canonical_records if r["canonical_status"] == "fetch_failed"),
            "manual_review": sum(1 for r in canonical_records if r["canonical_status"] == "manual_review"),
            "searched_not_found": sum(1 for r in canonical_records if r["canonical_status"] == "searched_not_found"),
            "rejected_candidates": sum(1 for r in canonical_records if r["canonical_status"] == "rejected_candidates"),
        },
        "scope": deduped,
    }
    storage.write_json_atomic(paths.audit_scope_json, result)
    return result
