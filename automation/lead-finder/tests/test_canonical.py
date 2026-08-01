"""Tests for the website-discovery canonical latest-status consolidation
(leadfinder/canonical.py).

Read-only, no network: builds synthetic pilot-1/pilot-2/full1-auto lifecycle
files in a temp dir and proves the consolidation rules required by the task:

  1. A pilot-1 retry result overrides fetch_retry_pending.
  2. A pilot-1 re-evaluation overrides the original pilot result.
  3. An unresolved retry becomes canonical fetch_failed.
  4. No place_id appears more than once.
  5. All processed place_ids are represented.
  6. Canonical totals equal the statuses derived from the actual lifecycle files.
  7. Original source files remain byte-for-byte unchanged.
  8. leads.json remains byte-for-byte unchanged.
  9. No Brave, candidate fetch or Places request occurs (structural: the module
     never imports a search provider or a website fetcher).
"""

import io
import json
import sys
import tempfile
import unittest
from pathlib import Path
from collections import Counter

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from leadfinder import config, storage, canonical as canon  # noqa: E402


def _lead(pid, name, city, website=None):
    return {"place_id": pid, "industry": "autogarage", "business_name": name,
            "city": city, "region": "T", "phone": "020 0", "address": f"S 1, 1000AA {city}",
            "website": website}


def _cand(url, domain, decision, confidence, reason, evidence=None, page_type="official_business_homepage"):
    return {"url": url, "domain": domain, "decision": decision, "confidence": confidence,
            "rejection_reason": reason, "candidate_page_type": page_type,
            "candidate_page_type_evidence": [], "evidence": evidence or []}


class TestCanonicalPilot1Precedence(unittest.TestCase):
    def _seed(self):
        d = tempfile.mkdtemp()
        paths = config.make_industry_paths("autogarage", d)
        paths.ensure()
        leads = [_lead("p1a", "Garage A", "Utrecht"), _lead("p1b", "Garage B", "Breda"),
                 _lead("p1c", "Garage C", "Ede")]
        storage.save_leads(paths, leads)

        # Pilot-1 original discovery: all searched_not_found.
        storage.write_json_atomic(paths.website_discovery_json, {"generated_at": "t0", "results": [
            {"place_id": "p1a", "business_name": "Garage A", "city": "Utrecht",
             "status": "searched_not_found", "confidence": None, "accepted_website": None,
             "candidates": [], "industry_relevance_status": "automotive_confirmed",
             "manual_review_status": None, "updated_at": "t0"},
            {"place_id": "p1b", "business_name": "Garage B", "city": "Breda",
             "status": "searched_not_found", "confidence": None, "accepted_website": None,
             "candidates": [], "industry_relevance_status": "automotive_confirmed",
             "manual_review_status": None, "updated_at": "t0"},
            {"place_id": "p1c", "business_name": "Garage C", "city": "Ede",
             "status": "manual_review", "confidence": "medium", "accepted_website": "https://c.nl/",
             "candidates": [_cand("https://c.nl/", "c.nl", "manual", "medium", None)],
             "industry_relevance_status": "automotive_confirmed",
             "manual_review_status": None, "updated_at": "t0"},
        ]})
        # Re-evaluation: p1a upgraded to manual_review (phone-neutral rule);
        # p1b becomes fetch_retry_pending (transient); p1c unchanged.
        storage.write_json_atomic(paths.website_discovery_reeval, {"generated_at": "t1", "leads": [
            {"place_id": "p1a", "previous_status": "searched_not_found",
             "new_status": "manual_review", "new_confidence": "medium",
             "industry_relevance_status": "automotive_confirmed"},
            {"place_id": "p1b", "previous_status": "searched_not_found",
             "new_status": "fetch_retry_pending", "new_confidence": None,
             "industry_relevance_status": "automotive_confirmed"},
            {"place_id": "p1c", "previous_status": "manual_review",
             "new_status": "manual_review", "new_confidence": "medium",
             "industry_relevance_status": "automotive_confirmed"},
        ]})
        # Retry report: p1b resolved to found_verified (recovered a real site).
        storage.write_json_atomic(paths.website_fetch_retry_report, {"generated_at": "t2", "leads": [
            {"place_id": "p1b", "business_name": "Garage B", "city": "Breda",
             "previous_status": "searched_not_found", "new_status": "found_verified",
             "confidence": "high", "accepted_website": "https://garageb.nl/",
             "candidates": [_cand("https://garageb.nl/", "garageb.nl", "accepted", "high", None,
                                  [{"signal": "phone_match"}])],
             "industry_relevance_status": "automotive_confirmed", "manual_review_status": None},
        ]})
        return paths, leads

    def test_retry_overrides_fetch_retry_pending(self):
        paths, leads = self._seed()
        summary = canon.canonicalize(paths, leads)
        by = {r["place_id"]: r for r in summary["records"]}
        self.assertEqual(by["p1b"]["canonical_status"], "found_verified")   # proof #1
        self.assertEqual(by["p1b"]["source_record"], "website-fetch-retry-report.json")
        self.assertEqual(by["p1b"]["status_provenance"], "candidate_refetch")

    def test_reeval_overrides_original(self):
        paths, leads = self._seed()
        summary = canon.canonicalize(paths, leads)
        by = {r["place_id"]: r for r in summary["records"]}
        self.assertEqual(by["p1a"]["raw_original_status"], "searched_not_found")
        self.assertEqual(by["p1a"]["canonical_status"], "manual_review")    # proof #2
        self.assertEqual(by["p1a"]["source_record"], "website-discovery-reeval.json")

    def test_unresolved_retry_would_be_fetch_failed(self):
        # Modify the retry report so p1b's fetch never recovered (still transient).
        paths, leads = self._seed()
        storage.write_json_atomic(paths.website_fetch_retry_report, {"generated_at": "t2", "leads": [
            {"place_id": "p1b", "business_name": "Garage B", "city": "Breda",
             "previous_status": "searched_not_found", "new_status": "fetch_failed",
             "confidence": None, "accepted_website": None,
             "candidates": [_cand("https://garageb.nl/", "garageb.nl", "rejected", "low",
                                  "unreachable:dns_failure", page_type="parked_or_unreachable")],
             "industry_relevance_status": "automotive_confirmed", "manual_review_status": None},
        ]})
        summary = canon.canonicalize(paths, leads)
        by = {r["place_id"]: r for r in summary["records"]}
        self.assertEqual(by["p1b"]["canonical_status"], "fetch_failed")     # proof #3

    def test_no_duplicate_place_ids_and_all_represented(self):
        paths, leads = self._seed()
        summary = canon.canonicalize(paths, leads)
        ids = [r["place_id"] for r in summary["records"]]
        self.assertEqual(len(ids), len(set(ids)))                          # proof #4
        self.assertEqual(set(ids), {"p1a", "p1b", "p1c"})                  # proof #5

    def test_canonical_totals_match_lifecycle_files(self):
        paths, leads = self._seed()
        summary = canon.canonicalize(paths, leads)
        # Independently derive expected totals the same way a human would read
        # the files: reeval overrides original, retry overrides reeval.
        d1 = {r["place_id"]: r["status"] for r in
              storage.read_json(paths.website_discovery_json)["results"]}
        reeval = {r["place_id"]: r["new_status"] for r in
                  storage.read_json(paths.website_discovery_reeval)["leads"]}
        retry = {r["place_id"]: r["new_status"] for r in
                 storage.read_json(paths.website_fetch_retry_report)["leads"]}
        expected = dict(d1)
        expected.update(reeval)
        expected.update(retry)
        self.assertEqual(Counter(expected.values()),
                         Counter(summary["canonical_status_counts"]))       # proof #6

    def test_source_files_and_leads_unchanged(self):
        paths, leads = self._seed()
        before = {p: Path(p).read_bytes() for p in
                  (paths.website_discovery_json, paths.website_discovery_reeval,
                   paths.website_fetch_retry_report, paths.leads_json)}
        canon.canonicalize(paths, leads)
        for p, b in before.items():
            self.assertEqual(Path(p).read_bytes(), b, p)                    # proofs #7, #8

    def test_no_network_imports(self):
        import inspect
        src = inspect.getsource(canon)
        self.assertNotIn("search_provider", src)                            # proof #9
        self.assertNotIn("RealFetcher", src)
        self.assertNotIn("PlacesClient", src)


class TestAcceptedWebsiteReviewAndQueues(unittest.TestCase):
    def _seed_found_verified(self, evidence):
        d = tempfile.mkdtemp()
        paths = config.make_industry_paths("autogarage", d)
        paths.ensure()
        leads = [_lead("q1", "Garage Vraag", "Rotterdam")]
        storage.save_leads(paths, leads)
        storage.write_json_atomic(paths.website_discovery_json, {"generated_at": "t", "results": []})
        storage.write_json_atomic(paths.output / "website-discovery-pilot2.json", {"results": []})
        storage.write_json_atomic(paths.output / "website-discovery-full1-auto.json", {"results": [
            {"place_id": "q1", "business_name": "Garage Vraag", "city": "Rotterdam",
             "status": "found_verified", "confidence": "high",
             "accepted_website": "https://anderesite.nl/",
             "candidates": [_cand("https://anderesite.nl/", "anderesite.nl", "accepted", "high", None, evidence)],
             "industry_relevance_status": "automotive_confirmed", "manual_review_status": None,
             "updated_at": "t"}]})
        return paths, leads

    def test_questionable_accept_flagged_for_review(self):
        # No phone_match, domain doesn't reflect the business name -> questionable.
        paths, leads = self._seed_found_verified([{"signal": "postcode_match"}, {"signal": "name_strong"}])
        summary = canon.canonicalize(paths, leads)
        rev = canon.build_accepted_website_review(paths, summary["records"])
        self.assertEqual(rev["count"], 1)
        self.assertEqual(rev["leads"][0]["accepted_website_review_status"], "pending")

    def test_confirm_decision_keeps_found_verified(self):
        paths, leads = self._seed_found_verified([{"signal": "postcode_match"}])
        s1 = canon.canonicalize(paths, leads)
        canon.build_accepted_website_review(paths, s1["records"])
        canon.apply_accepted_website_decision(paths, "q1", "confirmed_official_website",
                                              confirmation_type="explicit_business_identity_confirmation")
        s2 = canon.canonicalize(paths, leads)
        rec = {r["place_id"]: r for r in s2["records"]}["q1"]
        self.assertEqual(rec["canonical_status"], "found_verified")
        self.assertEqual(rec["accepted_website"], "https://anderesite.nl/")
        self.assertIn("human_confirmed", rec["status_provenance"])

    def test_reject_decision_reevaluates_to_rejected_candidates_when_sole_candidate(self):
        paths, leads = self._seed_found_verified([{"signal": "postcode_match"}])
        s1 = canon.canonicalize(paths, leads)
        canon.build_accepted_website_review(paths, s1["records"])
        canon.apply_accepted_website_decision(paths, "q1", "unrelated_website",
                                              confirmation_type="separate_business_same_address",
                                              telephone_match=False)
        s2 = canon.canonicalize(paths, leads)
        rec = {r["place_id"]: r for r in s2["records"]}["q1"]
        self.assertEqual(rec["canonical_status"], "rejected_candidates")
        self.assertIsNone(rec["accepted_website"])
        self.assertNotEqual(rec["canonical_status"], "found_verified")

    def test_decision_idempotent_across_rebuilds(self):
        paths, leads = self._seed_found_verified([{"signal": "postcode_match"}])
        s1 = canon.canonicalize(paths, leads)
        canon.build_accepted_website_review(paths, s1["records"])
        canon.apply_accepted_website_decision(paths, "q1", "unrelated_website",
                                              address_match_explanation="new business at former address")
        s2 = canon.canonicalize(paths, leads)
        canon.build_accepted_website_review(paths, s2["records"])   # rebuild
        doc = storage.read_json(paths.accepted_website_review_json)
        row = {r["place_id"]: r for r in doc["leads"]}["q1"]
        self.assertEqual(row["accepted_website_review_status"], "unrelated_website")
        self.assertEqual(row["address_match_explanation"], "new business at former address")

    def test_operational_queues_and_audit_scope_exclude_pending_accept(self):
        paths, leads = self._seed_found_verified([{"signal": "postcode_match"}])
        s1 = canon.canonicalize(paths, leads)
        canon.build_accepted_website_review(paths, s1["records"])   # q1 pending
        s2 = canon.canonicalize(paths, leads)
        ops = canon.build_operational_queues(paths, s2["records"])
        self.assertEqual(ops["confirmed_discovered_websites"], 0)   # withheld while pending
        audit = canon.prepare_audit_scope(paths, leads, s2["records"])
        self.assertEqual(audit["confirmed_discovered_websites"], 0)
        self.assertNotIn("q1", {s["place_id"] for s in audit["scope"]})


if __name__ == "__main__":
    unittest.main()
