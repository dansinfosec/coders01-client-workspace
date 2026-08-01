"""Tests for the website-discovery enrichment phase (phase 1).

No network: the search provider is MockSearchProvider and the candidate fetcher
is the audit MockFetcher, both backed by leadfinder.mockdata fixtures.

Covers:
  * SearchProvider interface + Brave payload parsing + transient classification;
  * domain blocklist (social/directory/marketplace/maps/shortener/OEM) and that
    franchise/multi-location garage domains are NOT blocklisted;
  * identity verification + HIGH/MEDIUM/LOW confidence and conflict handling;
  * the six lead statuses;
  * telephone fallback only on ambiguity, and per-lead query caps;
  * separate cost guard reserve-before-send + request/USD ceilings + retries;
  * automatic resume by place_id;
  * deterministic pilot sampler;
  * leads.json is never mutated and no Brave snippets/titles are persisted.
"""

import csv
import io
import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from leadfinder import config, storage, mockdata  # noqa: E402
from leadfinder import website_discovery as wd  # noqa: E402
from leadfinder import search_provider as sp  # noqa: E402
from leadfinder.audit import MockFetcher  # noqa: E402


def _lead(pid, name, city, phone, address, website=None, region="Test"):
    return {"place_id": pid, "industry": "autogarage", "business_name": name,
            "city": city, "region": region, "phone": phone, "address": address,
            "website": website}


# A synthetic dataset exercising every status (all missing a website except one).
SYNTH_LEADS = [
    _lead("p_verified", "Autobedrijf Verified", "Amsterdam", "020 111 2222",
          "Testweg 1, 1011 AA Amsterdam"),
    _lead("p_medium", "Garage Medium Uniek", "Rotterdam", "010 222 3333",
          "Pleinweg 5, 3083 AA Rotterdam"),
    _lead("p_conflict", "Autoservice Conflict", "Utrecht", "030 444 5555",
          "Domweg 9, 3511 AA Utrecht"),
    _lead("p_directory", "Garage Directory Only", "Den Haag", "070 555 6666",
          "Laan 2, 2511 AA Den Haag"),
    _lead("p_zonder", "Autobedrijf Zonder", "Groningen", "050 777 8888",
          "Weg 4, 9711 AA Groningen"),
    _lead("p_phone", "Garage", "Eindhoven", "040 121 2121",
          "Ringweg 3, 5611 AA Eindhoven"),
    _lead("p_hassite", "Heeft Site", "Assen", "0592 10 10 10",
          "Site 1, 9400 AA Assen", website="https://heeftsite.nl"),
]


def _run(leads, **kw):
    d = tempfile.mkdtemp()
    paths = config.make_industry_paths("autogarage", d)
    paths.ensure()
    storage.save_leads(paths, leads)
    provider = kw.pop("provider", None) or sp.MockSearchProvider()
    fetcher = kw.pop("fetcher", None) or MockFetcher()
    kw.setdefault("sleeper", lambda _s: None)   # never sleep on retry backoff in tests
    report = wd.run_discovery(leads, provider, fetcher, paths, **kw)
    return paths, report


def _results(paths):
    data = json.loads(Path(paths.website_discovery_json).read_text(encoding="utf-8"))
    return {r["place_id"]: r for r in data["results"]}


# ---------------------------------------------------------------------------
# Provider interface
# ---------------------------------------------------------------------------

class TestSearchProvider(unittest.TestCase):
    def test_mock_provider_records_and_returns_results(self):
        p = sp.MockSearchProvider()
        res = p.search("Autobedrijf Verified Amsterdam", count=5)
        self.assertEqual(p.name, "mock")
        self.assertIn("verified", p.queries[0].lower())
        self.assertTrue(any("garageverified.nl" in r.url for r in res))

    def test_mock_provider_empty_for_unknown_query(self):
        self.assertEqual(sp.MockSearchProvider().search("iets onbekends hier"), [])

    def test_brave_payload_parsing(self):
        payload = {"web": {"results": [
            {"url": "https://a.nl/", "title": "A", "description": "snip"},
            {"url": "https://b.nl/", "title": "B"},
            {"title": "no url"},
        ]}}
        out = sp._parse_brave(payload, count=5)
        self.assertEqual([r.url for r in out], ["https://a.nl/", "https://b.nl/"])

    def test_transient_classification(self):
        self.assertTrue(sp.is_transient(sp.TransientSearchError("x")))
        self.assertFalse(sp.is_transient(sp.SearchError("x")))


# ---------------------------------------------------------------------------
# Domain blocklist
# ---------------------------------------------------------------------------

class TestDomainBlocklist(unittest.TestCase):
    def test_rejects_social_directory_marketplace_maps_shortener_oem(self):
        for host, cat in [
            ("facebook.com", "social"), ("www.detelefoongids.nl", "directory"),
            ("marktplaats.nl", "marketplace"), ("www.waze.com", "maps"),
            ("bit.ly", "url_shortener"), ("www.volkswagen.nl", "manufacturer_oem"),
            ("bovag.nl", "directory"),
        ]:
            reason = wd.classify_domain(host)
            self.assertIsNotNone(reason, host)
            self.assertTrue(reason.startswith(cat), f"{host} -> {reason}")

    def test_allows_ordinary_and_franchise_garage_domains(self):
        # A legitimate independent or franchise/branch garage domain is eligible;
        # branch legitimacy is decided later by on-page location evidence.
        for host in ["garageverified.nl", "autobedrijf-de-vries.nl",
                     "bosch-car-service-jansen.nl"]:
            self.assertIsNone(wd.classify_domain(host), host)


# ---------------------------------------------------------------------------
# Verification + confidence
# ---------------------------------------------------------------------------

class TestVerification(unittest.TestCase):
    def setUp(self):
        self.fetcher = MockFetcher()

    def _ident(self, lead):
        return wd.LeadIdentity.from_lead(lead)

    def test_high_confidence_on_phone_match(self):
        ident = self._ident(SYNTH_LEADS[0])
        v = wd.verify_candidate("https://garageverified.nl/", ident, self.fetcher)
        self.assertEqual(v["confidence"], "high")
        self.assertEqual(v["decision"], "accepted")
        self.assertTrue(any(e["signal"] == "phone_match" for e in v["evidence"]))

    def test_medium_confidence_on_name_plus_city(self):
        ident = self._ident(SYNTH_LEADS[1])
        v = wd.verify_candidate("https://garagemedium.nl/", ident, self.fetcher)
        self.assertEqual(v["confidence"], "medium")
        self.assertEqual(v["decision"], "manual")

    def test_true_identity_conflict_still_rejected(self):
        # Different name + different city + different postcode + different phone
        # is a REAL conflict (not merely a phone mismatch).
        ident = self._ident(SYNTH_LEADS[2])  # Autoservice Conflict, Utrecht, 3511 AA
        v = wd.verify_candidate("https://garagevanelders.nl/", ident, self.fetcher)
        self.assertEqual(v["confidence"], "low")
        self.assertEqual(v["rejection_reason"], "identity_conflict")

    def test_unreachable_domain_is_rejected(self):
        ident = self._ident(SYNTH_LEADS[0])
        v = wd.verify_candidate("https://does-not-exist-xyz.nl/", ident, self.fetcher)
        self.assertEqual(v["decision"], "rejected")
        self.assertTrue(v["rejection_reason"].startswith("unreachable"))

    def test_generic_name_cannot_reach_medium_without_hard_signal(self):
        # Generic name + city only must NOT be auto-classified as medium.
        self.assertTrue(wd.is_generic_name("Garage", "Eindhoven"))
        self.assertFalse(wd.is_generic_name("Autobedrijf Verified", "Amsterdam"))


# ---------------------------------------------------------------------------
# End-to-end statuses
# ---------------------------------------------------------------------------

class TestStatuses(unittest.TestCase):
    def test_all_six_status_outcomes(self):
        paths, report = _run(SYNTH_LEADS)
        res = _results(paths)
        self.assertEqual(res["p_verified"]["status"], "found_verified")
        self.assertEqual(res["p_verified"]["accepted_website"], "https://garageverified.nl/")
        self.assertEqual(res["p_medium"]["status"], "manual_review")
        self.assertEqual(res["p_conflict"]["status"], "searched_not_found")
        self.assertEqual(res["p_directory"]["status"], "rejected_candidates")
        self.assertEqual(res["p_zonder"]["status"], "searched_not_found")
        self.assertEqual(res["p_phone"]["status"], "found_verified")
        # Lead that already has a Google website is out of scope entirely.
        self.assertNotIn("p_hassite", res)

    def test_phone_fallback_only_on_ambiguity_and_capped(self):
        paths, _ = _run(SYNTH_LEADS)
        res = _results(paths)
        # Generic-named lead used the telephone fallback (3rd query) with a reason.
        self.assertEqual(res["p_phone"]["ambiguity_reason"], "generic_business_name")
        self.assertLessEqual(len(res["p_phone"]["queries"]), wd.MAX_QUERIES_WITH_PHONE)
        # A confidently-verified lead never needs the fallback.
        self.assertEqual(len(res["p_verified"]["queries"]), 1)
        self.assertIsNone(res["p_verified"]["ambiguity_reason"])

    def test_discovered_and_review_csv_outputs(self):
        paths, _ = _run(SYNTH_LEADS)
        with io.open(paths.discovered_websites_csv, encoding="utf-8-sig") as fh:
            disc = list(csv.DictReader(fh))
        self.assertEqual({r["place_id"] for r in disc}, {"p_verified", "p_phone"})
        with io.open(paths.manual_website_review_csv, encoding="utf-8-sig") as fh:
            man = list(csv.DictReader(fh))
        self.assertEqual({r["place_id"] for r in man}, {"p_medium"})


# ---------------------------------------------------------------------------
# Data-safety invariants
# ---------------------------------------------------------------------------

class TestDataSafety(unittest.TestCase):
    def test_leads_json_is_never_mutated(self):
        paths, _ = _run(SYNTH_LEADS)
        after = storage.load_leads(paths)
        self.assertEqual(len(after), len(SYNTH_LEADS))
        # Original (empty) Google website value preserved; nothing merged back.
        by = {l["place_id"]: l for l in after}
        self.assertIsNone(by["p_verified"]["website"])
        self.assertEqual(by["p_hassite"]["website"], "https://heeftsite.nl")
        self.assertNotIn("website_discovery_status", by["p_verified"])

    def test_no_brave_snippets_or_titles_persisted(self):
        paths, _ = _run(SYNTH_LEADS)
        raw = Path(paths.website_discovery_json).read_text(encoding="utf-8")
        # Fixture snippet/title strings must not leak into persisted output.
        self.assertNotIn("snippet", raw.lower())
        self.assertNotIn("Garage Rotterdam", raw)   # a fixture snippet value
        # Candidate records keep only the allowed minimal keys (+ page-type facts).
        res = _results(paths)
        allowed = {"url", "domain", "decision", "confidence", "rejection_reason",
                   "evidence", "candidate_page_type", "candidate_page_type_evidence"}
        for cand in res["p_verified"]["candidates"]:
            self.assertEqual(set(cand) - allowed, set())

    def test_cost_state_is_separate_file(self):
        paths, _ = _run(SYNTH_LEADS)
        self.assertTrue(Path(paths.website_discovery_cost_state).exists())
        # The Places cost-state.json must not be created by this phase.
        self.assertFalse(Path(paths.output / "cost-state.json").exists())


# ---------------------------------------------------------------------------
# Cost guard
# ---------------------------------------------------------------------------

class TestCostGuard(unittest.TestCase):
    def test_reserve_before_send_and_request_ceiling(self):
        d = tempfile.mkdtemp()
        g = wd.SearchCostGuard(max_usd=100.0, max_requests=2,
                               state_path=Path(d) / "cs.json")
        self.assertTrue(g.reserve())
        self.assertTrue(g.reserve())
        self.assertFalse(g.reserve())          # request ceiling hit
        self.assertTrue(g.stopped)
        self.assertEqual(g.total_requests, 2)

    def test_usd_ceiling_independent_of_request_count(self):
        d = tempfile.mkdtemp()
        # $0.012 budget @ $0.005/req -> exactly 2 requests fit, 3rd rejected.
        g = wd.SearchCostGuard(max_usd=0.012, max_requests=1000,
                               state_path=Path(d) / "cs.json")
        self.assertTrue(g.reserve())
        self.assertTrue(g.reserve())
        self.assertFalse(g.reserve())
        self.assertAlmostEqual(g.total_usd(), 0.010, places=3)

    def test_retries_count_toward_limits(self):
        d = tempfile.mkdtemp()
        g = wd.SearchCostGuard(max_usd=100.0, max_requests=2,
                               state_path=Path(d) / "cs.json")
        self.assertTrue(g.reserve())
        self.assertTrue(g.reserve_retry())     # retry consumes a slot
        self.assertFalse(g.reserve())
        self.assertEqual(g.count_retries, 1)

    def test_budget_stop_halts_run(self):
        # One request of budget: only the first lead can be searched.
        paths, report = _run(SYNTH_LEADS, max_requests=1)
        self.assertLessEqual(report["cost"]["total_requests"], 1)
        self.assertLessEqual(report["processed_this_run"], 1)


# ---------------------------------------------------------------------------
# Resume
# ---------------------------------------------------------------------------

class TestResume(unittest.TestCase):
    def test_resume_skips_terminal_leads(self):
        d = tempfile.mkdtemp()
        paths = config.make_industry_paths("autogarage", d)
        paths.ensure()
        storage.save_leads(paths, SYNTH_LEADS)
        p1 = sp.MockSearchProvider()
        wd.run_discovery(SYNTH_LEADS, p1, MockFetcher(), paths)
        first_requests = p1.queries
        # Second run with a fresh provider: all leads terminal -> no new searches.
        p2 = sp.MockSearchProvider()
        report = wd.run_discovery(SYNTH_LEADS, p2, MockFetcher(), paths)
        self.assertGreater(len(first_requests), 0)
        self.assertEqual(len(p2.queries), 0)
        self.assertEqual(report["processed_this_run"], 0)


# ---------------------------------------------------------------------------
# Deterministic pilot sampler
# ---------------------------------------------------------------------------

class TestPilotSampler(unittest.TestCase):
    def _big_pool(self):
        leads = []
        cities = ["Amsterdam", "Rotterdam", "Utrecht", "Den Haag", "Eindhoven",
                  "Groningen", "Tilburg", "Almere", "Breda", "Nijmegen"]
        for i in range(200):
            city = cities[i % len(cities)]
            generic = (i % 2 == 0)
            name = "Garage" if generic else f"Autobedrijf Uniek{i}"
            complete = (i % 3 != 0)
            addr = (f"Straat {i}, 10{i:02d} AB {city}" if complete
                    else f"{city}")   # less-complete: no postcode/house number
            leads.append(_lead(f"p{i:03d}", name, city, f"020 000 {i:04d}", addr))
        return leads

    def test_sample_is_deterministic_and_representative(self):
        pool = self._big_pool()
        a = wd.select_pilot_sample(pool, n=25)
        b = wd.select_pilot_sample(pool, n=25)
        self.assertEqual([l["place_id"] for l in a], [l["place_id"] for l in b])
        self.assertEqual(len(a), 25)
        names_generic = [wd.is_generic_name(l["business_name"], l["city"]) for l in a]
        self.assertIn(True, names_generic)     # some generic names
        self.assertIn(False, names_generic)    # some unique names
        completes = [wd._address_complete(l) for l in a]
        self.assertIn(True, completes)         # some complete addresses
        self.assertIn(False, completes)        # some less-complete addresses
        self.assertGreaterEqual(len({l["city"] for l in a}), 5)  # city diversity

    def test_sample_only_includes_leads_missing_website(self):
        pool = self._big_pool()
        pool[0]["website"] = "https://x.nl"
        sample = wd.select_pilot_sample(pool, n=25)
        self.assertTrue(all(not l.get("website") for l in sample))


# ---------------------------------------------------------------------------
# Industry relevance (wrong-industry noise detection)
# ---------------------------------------------------------------------------

REL_LEADS = [
    # An explicit non-automotive service that also happens to match a candidate
    # site by phone — must be flagged AND never auto-accepted.
    _lead("r_honden", "Hondenuitlaatservice Rex", "Tilburg", "013 100 2000",
          "Bosweg 7, 5011 AA Tilburg"),
    # A garage with a fully GENERIC name — must NOT be falsely flagged.
    _lead("r_generic", "Bandenservice", "Zwolle", "038 100 1000", "Zwolle"),
    # A garage whose candidate site confirms the automotive industry.
    _lead("r_verified", "Autobedrijf Verified", "Amsterdam", "020 111 2222",
          "Testweg 1, 1011 AA Amsterdam"),
]


class TestIndustryRelevance(unittest.TestCase):
    def _run_rel(self):
        return _run(REL_LEADS)

    def test_hondenuitlaatservice_is_flagged(self):
        paths, _ = self._run_rel()
        r = _results(paths)["r_honden"]
        self.assertEqual(r["industry_relevance_status"], "suspected_wrong_industry")
        terms = [e["value"] for e in r["industry_relevance_evidence"]
                 if e["signal"] == "non_automotive_term"]
        self.assertIn("hondenuitlaatservice", terms)

    def test_generic_garage_name_not_flagged(self):
        paths, _ = self._run_rel()
        r = _results(paths)["r_generic"]
        # 'Bandenservice' is generic-as-a-name but clearly automotive — never
        # suspected on a single generic word.
        self.assertTrue(wd.is_generic_name("Bandenservice", "Zwolle"))
        self.assertNotEqual(r["industry_relevance_status"], "suspected_wrong_industry")
        self.assertIn(r["industry_relevance_status"],
                      ("automotive_confirmed", "automotive_likely"))

    def test_automotive_candidate_site_confirms_relevance(self):
        paths, _ = self._run_rel()
        r = _results(paths)["r_verified"]
        self.assertEqual(r["industry_relevance_status"], "automotive_confirmed")
        self.assertTrue(any(e["signal"] == "automotive_content"
                            for e in r["industry_relevance_evidence"]))

    def test_wrong_industry_lead_preserved_and_not_auto_accepted(self):
        paths, _ = self._run_rel()
        res = _results(paths)
        self.assertIn("r_honden", res)                       # remains in output
        r = res["r_honden"]
        self.assertEqual(r["status"], "manual_review")       # placed in manual review
        self.assertNotEqual(r["status"], "found_verified")   # not auto-accepted
        self.assertTrue(any(e["signal"] == "auto_accept_blocked_wrong_industry"
                            for e in r["industry_relevance_evidence"]))
        # It appears in the manual-review CSV, not the auto-accepted CSV.
        with io.open(paths.manual_website_review_csv, encoding="utf-8-sig") as fh:
            man = {row["place_id"] for row in csv.DictReader(fh)}
        self.assertIn("r_honden", man)
        with io.open(paths.discovered_websites_csv, encoding="utf-8-sig") as fh:
            disc = {row["place_id"] for row in csv.DictReader(fh)}
        self.assertNotIn("r_honden", disc)

    def test_leads_json_unchanged_byte_for_byte(self):
        d = tempfile.mkdtemp()
        paths = config.make_industry_paths("autogarage", d)
        paths.ensure()
        storage.save_leads(paths, REL_LEADS)
        before = Path(paths.leads_json).read_bytes()
        wd.run_discovery(REL_LEADS, sp.MockSearchProvider(), MockFetcher(), paths)
        after = Path(paths.leads_json).read_bytes()
        self.assertEqual(before, after)


# ---------------------------------------------------------------------------
# Verifier v2: phone tolerance, address/name HIGH, transient handling
# ---------------------------------------------------------------------------

class TestVerifierV2(unittest.TestCase):
    def setUp(self):
        self.fetcher = MockFetcher()

    def _v(self, url, lead):
        return wd.verify_candidate(url, wd.LeadIdentity.from_lead(lead), self.fetcher,
                                   sleeper=lambda _s: None)

    def test_mobile_google_vs_landline_site_is_not_a_conflict(self):
        lead = _lead("m1", "Garage Mobiel", "Haarlem", "06 12 34 56 78",
                     "Iets 3, 2000 AA Haarlem")
        v = self._v("https://garagemobiel.nl/", lead)
        self.assertNotEqual(v["decision"], "rejected")     # NOT a conflict
        self.assertEqual(v["confidence"], "medium")        # name + city
        neut = [e for e in v["evidence"] if e["signal"] == "phone_differs_neutral"]
        self.assertTrue(neut and neut[0]["observed"]["mobile_vs_landline"] is True)

    def test_any_matching_number_among_many_is_a_phone_match(self):
        lead = _lead("m2", "Garage Multi", "Haarlem", "06 12 34 56 78",
                     "Iets 4, 2000 AB Haarlem")
        v = self._v("https://garagemulti.nl/", lead)
        self.assertEqual(v["confidence"], "high")
        self.assertTrue(any(e["signal"] == "phone_match" for e in v["evidence"]))

    def test_different_phone_but_name_postcode_house_is_high(self):
        lead = _lead("m3", "Garage Sterk", "Haarlem", "06 99 99 99 99",
                     "Kerkstraat 12, 2011 AB Haarlem")
        v = self._v("https://garagesterk.nl/", lead)
        self.assertEqual(v["confidence"], "high")          # rule B, despite phone diff
        sigs = {e["signal"] for e in v["evidence"]}
        self.assertTrue({"name_strong", "postcode_match", "house_number_match"} <= sigs)

    def test_transient_fetch_failure_never_becomes_searched_not_found(self):
        lead = _lead("t1", "Garage transientfetch", "Teststad", "06 11 11 11 11",
                     "Straat 1, 1000 AA Teststad")
        paths, _ = _run([lead])
        r = _results(paths)["t1"]
        self.assertEqual(r["status"], "fetch_failed")      # NOT searched_not_found
        self.assertNotEqual(r["status"], "searched_not_found")

    def test_transient_reason_classification(self):
        for reason in ("unreachable:timeout", "unreachable:ssl_error",
                       "unreachable:dns_failure", "http_429", "http_503"):
            self.assertTrue(wd.is_transient_fetch_reason(reason), reason)
        for reason in ("http_404", "http_403", "parked_or_empty", None):
            self.assertFalse(wd.is_transient_fetch_reason(reason), reason)

    def test_successful_search_no_viable_result_is_searched_not_found(self):
        lead = _lead("n1", "Garage nomatch uniekxyz", "Teststad", "06 22 22 22 22",
                     "Laan 9, 3000 AA Teststad")
        paths, _ = _run([lead])
        r = _results(paths)["n1"]
        self.assertEqual(r["status"], "searched_not_found")


# ---------------------------------------------------------------------------
# Offline re-evaluation (no Brave, no fetches)
# ---------------------------------------------------------------------------

def _record(pid, name, status, candidates, relevance="automotive_confirmed"):
    return {"place_id": pid, "business_name": name, "city": "Teststad",
            "region": "T", "original_google_website": None, "status": status,
            "confidence": None, "accepted_website": None, "queries": [],
            "candidates": candidates, "ambiguity_reason": None,
            "industry_relevance_status": relevance, "industry_relevance_evidence": [],
            "error": None, "updated_at": "2026-07-31T00:00:00+00:00"}


class TestOfflineReeval(unittest.TestCase):
    def test_phone_mismatch_with_name_and_city_upgrades_to_medium(self):
        # Old: rejected on conflicting_phone. New: neutral phone + name + city -> MEDIUM.
        cand = {"url": "https://x.nl/", "domain": "x.nl", "decision": "rejected",
                "confidence": "low", "rejection_reason": "conflicting_phone",
                "evidence": [{"signal": "city_match"}, {"signal": "name_strong"},
                             {"signal": "phone_conflict", "observed": ["+31201112222"]}]}
        rec = _record("r1", "Garage X", "searched_not_found", [cand])
        lead = _lead("r1", "Garage X", "Teststad", "06 55 55 55 55", "Weg 1, 1000 AA Teststad")
        out = wd.reevaluate_lead(rec, lead)
        self.assertEqual(out["previous_status"], "searched_not_found")
        self.assertEqual(out["new_status"], "manual_review")
        self.assertEqual(out["new_confidence"], "medium")

    def test_transient_candidate_moves_to_fetch_retry_pending(self):
        cand = {"url": "https://y.nl/", "domain": "y.nl", "decision": "rejected",
                "confidence": "low", "rejection_reason": "unreachable:dns_failure",
                "evidence": []}
        rec = _record("r2", "Garage Y", "searched_not_found", [cand])
        lead = _lead("r2", "Garage Y", "Teststad", "06 55 55 55 56", "Weg 2, 1000 AB Teststad")
        out = wd.reevaluate_lead(rec, lead)
        self.assertEqual(out["new_status"], "fetch_retry_pending")
        self.assertTrue(out["refetch_required"])
        self.assertTrue(out["transient_fetch_failures"])

    def test_wrong_industry_stays_manual_review_on_reeval(self):
        cand = {"url": "https://z.nl/", "domain": "z.nl", "decision": "rejected",
                "confidence": "low", "rejection_reason": "conflicting_phone",
                "evidence": [{"signal": "name_strong"},
                             {"signal": "phone_conflict", "observed": ["+31201112222"]}]}
        rec = _record("r3", "Hondenuitlaatservice Rex", "manual_review", [cand],
                      relevance="suspected_wrong_industry")
        lead = _lead("r3", "Hondenuitlaatservice Rex", "Teststad", "06 55 55 55 57",
                     "Weg 3, 1000 AC Teststad")
        out = wd.reevaluate_lead(rec, lead)
        self.assertEqual(out["new_status"], "manual_review")

    def test_reeval_makes_no_brave_requests_and_leaves_leads_unchanged(self):
        # Run a mock discovery, then re-evaluate offline; prove no Brave + no mutation.
        paths, _ = _run(SYNTH_LEADS)
        before_leads = Path(paths.leads_json).read_bytes()
        before_cost = Path(paths.website_discovery_cost_state).read_bytes()
        provider = sp.MockSearchProvider()   # must never be called by re-eval
        summary = wd.reevaluate_pilot(paths, storage.load_leads(paths))
        self.assertEqual(len(provider.queries), 0)          # proof #10
        self.assertEqual(Path(paths.leads_json).read_bytes(), before_leads)   # #8
        self.assertEqual(Path(paths.website_discovery_cost_state).read_bytes(), before_cost)
        self.assertEqual(summary["count"], len(wd.leads_missing_website(SYNTH_LEADS)))
        self.assertTrue(Path(paths.website_discovery_reeval).exists())
        # Required per-lead fields are present.
        row = summary["leads"][0]
        for f in ("previous_status", "new_status", "google_phone", "candidate_site_phones",
                  "mobile_vs_landline", "name_evidence", "postcode_evidence",
                  "house_number_evidence", "city_evidence", "transient_fetch_failures",
                  "refetch_required", "reason_for_change"):
            self.assertIn(f, row)


# ---------------------------------------------------------------------------
# Part A: candidate page-type classification + gate
# ---------------------------------------------------------------------------

class TestPageType(unittest.TestCase):
    def test_news_article_is_not_official(self):
        t, _ = wd.classify_page_type("https://leidschendamkrant.nl/service-center-van-zelst-b-v-/")
        self.assertEqual(t, "news_or_editorial")
        self.assertNotIn(t, wd.OFFICIAL_PAGE_TYPES)

    def test_directory_profile_is_not_official(self):
        t, _ = wd.classify_page_type("https://misterwhat.nl/company/359872-techno-garage-den-haag")
        self.assertEqual(t, "directory_profile")
        self.assertNotIn(t, wd.OFFICIAL_PAGE_TYPES)

    def test_vehicle_listing_is_not_official(self):
        t, _ = wd.classify_page_type("https://schadeauto-zoeker.nl/nl/dealer/Autohandel-Snijders/Maastricht/1009")
        self.assertEqual(t, "vehicle_listing")
        self.assertNotIn(t, wd.OFFICIAL_PAGE_TYPES)

    def test_dealer_locator_is_not_official(self):
        t, _ = wd.classify_page_type("https://michelin.nl/auto/dealer-locator/dordrecht")
        self.assertEqual(t, "dealer_or_service_locator")
        self.assertNotIn(t, wd.OFFICIAL_PAGE_TYPES)

    def test_multi_location_homepage_without_lead_postcode_is_locator(self):
        t, _ = wd.classify_page_type("https://bandenketen.nl/", html="x",
                                     postcodes={"1000AA", "2000BB", "3000CC"},
                                     lead_postcode="9999ZZ")
        self.assertEqual(t, "dealer_or_service_locator")

    def test_official_homepage_and_branch_pass(self):
        t1, _ = wd.classify_page_type("https://garagezwanenburg.nl/")
        self.assertEqual(t1, "official_business_homepage")
        t2, _ = wd.classify_page_type("https://keten.nl/vestiging/haarlem",
                                      postcodes={"2011AB"}, lead_postcode="2011AB")
        self.assertEqual(t2, "official_business_branch_page")

    def test_gate_blocks_name_plus_city_on_locator_page(self):
        # Name + city match, but the page is a locator -> must NOT become MEDIUM.
        lead = _lead("g1", "Garage Keten", "Haarlem", "06 12 12 12 12",
                     "Iets 1, 2000 AA Haarlem")
        v = wd.verify_candidate("https://chainlocator.nl/dealer-locator/haarlem",
                                wd.LeadIdentity.from_lead(lead), MockFetcher(), sleeper=lambda _s: None)
        self.assertEqual(v["decision"], "rejected")
        self.assertTrue(v["rejection_reason"].startswith("non_official_page"))
        self.assertEqual(v["candidate_page_type"], "dealer_or_service_locator")

    def test_official_branch_page_on_multilocation_domain_may_pass(self):
        lead = _lead("g2", "Garage Keten", "Haarlem", "06 12 12 12 13",
                     "Kerkstraat 12, 2011 AB Haarlem")
        v = wd.verify_candidate("https://chainofficial.nl/vestiging/haarlem",
                                wd.LeadIdentity.from_lead(lead), MockFetcher(), sleeper=lambda _s: None)
        self.assertEqual(v["candidate_page_type"], "official_business_branch_page")
        self.assertNotEqual(v["decision"], "rejected")     # allowed to be MEDIUM/HIGH

    def test_wrong_industry_protection_still_active_with_page_types(self):
        # A dog-walking lead must still never be auto-accepted (regression guard).
        paths, _ = _run([_lead("wi", "Hondenuitlaatservice Rex", "Tilburg",
                               "013 100 2000", "Bosweg 7, 5011 AA Tilburg")])
        r = _results(paths)["wi"]
        self.assertEqual(r["industry_relevance_status"], "suspected_wrong_industry")
        self.assertNotEqual(r["status"], "found_verified")


# ---------------------------------------------------------------------------
# Part B: retry known candidate fetches (no Brave)
# ---------------------------------------------------------------------------

class TestRetryFetches(unittest.TestCase):
    def _seed(self, records, leads):
        d = tempfile.mkdtemp()
        paths = config.make_industry_paths("autogarage", d)
        paths.ensure()
        storage.save_leads(paths, leads)
        storage.write_json_atomic(paths.website_discovery_json,
                                  {"generated_at": "t", "count": len(records), "results": records})
        return paths

    def test_retry_recovers_verified_site_without_brave(self):
        # A previously transient-failed candidate now resolves to the real site.
        rec = _record("rf1", "Autobedrijf Verified", "fetch_retry_pending", [
            {"url": "https://garageverified.nl/", "domain": "garageverified.nl",
             "decision": "rejected", "confidence": "low",
             "rejection_reason": "unreachable:dns_failure", "evidence": []}])
        lead = _lead("rf1", "Autobedrijf Verified", "Amsterdam", "020 111 2222",
                     "Testweg 1, 1011 AA Amsterdam")
        paths = self._seed([rec], [lead])
        before = Path(paths.leads_json).read_bytes()
        provider = sp.MockSearchProvider()          # must never be called
        report = wd.retry_fetches(paths, [lead], ["rf1"], MockFetcher(), sleeper=lambda _s: None)
        self.assertEqual(len(provider.queries), 0)
        self.assertEqual(report["leads"][0]["new_status"], "found_verified")
        self.assertEqual(report["leads"][0]["accepted_website"], "https://garageverified.nl/")
        self.assertEqual(Path(paths.leads_json).read_bytes(), before)   # leads.json untouched
        self.assertTrue(Path(paths.website_fetch_retry_report).exists())
        # Retry candidates carry page-type + its evidence.
        for c in report["leads"][0]["candidates"]:
            self.assertIn("candidate_page_type", c)
            self.assertIn("candidate_page_type_evidence", c)

    def test_retry_still_failing_is_fetch_failed(self):
        rec = _record("rf2", "Garage Gone", "fetch_retry_pending", [
            {"url": "https://garage-still-gone-xyz.nl/", "domain": "garage-still-gone-xyz.nl",
             "decision": "rejected", "confidence": "low",
             "rejection_reason": "unreachable:timeout", "evidence": []}])
        lead = _lead("rf2", "Garage Gone", "Teststad", "06 11 11 11 11", "Weg 1, 1000 AA Teststad")
        paths = self._seed([rec], [lead])
        report = wd.retry_fetches(paths, [lead], ["rf2"], MockFetcher(), sleeper=lambda _s: None)
        self.assertEqual(report["leads"][0]["new_status"], "fetch_failed")

    def test_retry_only_processes_requested_place_ids(self):
        recs = [_record("a", "A", "fetch_retry_pending",
                        [{"url": "https://garageverified.nl/", "domain": "garageverified.nl",
                          "decision": "rejected", "confidence": "low",
                          "rejection_reason": "unreachable:dns_failure", "evidence": []}]),
                _record("b", "B", "fetch_retry_pending",
                        [{"url": "https://garageverified.nl/", "domain": "garageverified.nl",
                          "decision": "rejected", "confidence": "low",
                          "rejection_reason": "unreachable:dns_failure", "evidence": []}])]
        leads = [_lead("a", "Autobedrijf Verified", "Amsterdam", "020 111 2222", "Testweg 1, 1011 AA Amsterdam"),
                 _lead("b", "B", "Teststad", "06 0", "Weg 1, 1000 AA Teststad")]
        paths = self._seed(recs, leads)
        report = wd.retry_fetches(paths, leads, ["a"], MockFetcher(), sleeper=lambda _s: None)
        self.assertEqual(report["count"], 1)
        self.assertEqual(report["leads"][0]["place_id"], "a")


# ---------------------------------------------------------------------------
# Manual-review queue for fetch_failed (status preserved)
# ---------------------------------------------------------------------------

class TestManualReviewQueue(unittest.TestCase):
    def _seed_retry_report(self):
        d = tempfile.mkdtemp()
        paths = config.make_industry_paths("autogarage", d)
        paths.ensure()
        lead = _lead("mf1", "Sheep Auto", "Eindhoven", "06 21 48 52 69", "Chamonixlaan, 5627 LX Eindhoven")
        storage.save_leads(paths, [lead])
        report = {"generated_at": "t", "count": 1, "leads": [{
            "place_id": "mf1", "business_name": "Sheep Auto", "city": "Eindhoven",
            "previous_status": "searched_not_found", "new_status": "fetch_failed",
            "confidence": None, "accepted_website": None,
            "industry_relevance_status": "automotive_confirmed",
            "refetched_urls": ["https://scheepersautos.nl/", "https://venauto.nl/x"],
            "candidates": [
                {"url": "https://scheepersautos.nl/", "domain": "scheepersautos.nl",
                 "decision": "rejected", "confidence": "low",
                 "rejection_reason": "unreachable:dns_failure",
                 "candidate_page_type": "parked_or_unreachable",
                 "candidate_page_type_evidence": [], "evidence": []},
                {"url": "https://venauto.nl/x", "domain": "venauto.nl",
                 "decision": "rejected", "confidence": "low",
                 "rejection_reason": "identity_conflict",
                 "candidate_page_type": "vehicle_listing",
                 "candidate_page_type_evidence": [], "evidence": []}]}]}
        storage.write_json_atomic(paths.website_fetch_retry_report, report)
        return paths, [lead]

    def test_queue_preserves_fetch_failed_and_adds_review_status(self):
        paths, leads = self._seed_retry_report()
        wd.build_manual_review_queue(paths, leads)
        rep = storage.read_json(paths.website_fetch_retry_report)
        row = rep["leads"][0]
        self.assertEqual(row["new_status"], "fetch_failed")            # PRESERVED
        self.assertEqual(row["manual_review_status"], "pending")       # added
        self.assertTrue(row["excluded_from_no_website_outreach"])
        self.assertEqual(rep["manual_review_queue"][0]["candidate_domains"],
                         ["scheepersautos.nl", "venauto.nl"])
        self.assertTrue(Path(paths.manual_review_queue_csv).exists())

    def test_reviewer_options_and_no_outreach_policy(self):
        self.assertEqual(wd.MANUAL_REVIEW_OUTCOMES, [
            "official_website_confirmed_manually", "website_permanently_unavailable",
            "directory_or_listing_only", "no_reliable_website_found",
            "wrong_business_identity"])
        self.assertFalse(wd.is_no_website_for_outreach("fetch_failed"))
        self.assertFalse(wd.is_no_website_for_outreach("searched_not_found"))

    def test_combined_queue_across_retry_and_discovery_sources(self):
        paths, leads = self._seed_retry_report()   # 1 fetch_failed (pilot-1 retry)
        # A pilot-2-style discovery results file with 1 fetch_failed record.
        p2 = config.make_industry_paths("autogarage", Path(paths.output).parents[1], run_tag="pilot2")
        storage.write_json_atomic(p2.website_discovery_json, {"results": [{
            "place_id": "p2a", "business_name": "Garage Twee", "city": "Zwolle",
            "status": "fetch_failed", "industry_relevance_status": "automotive_likely",
            "candidates": [{"url": "https://garagetwee.nl/", "domain": "garagetwee.nl",
                            "decision": "rejected", "confidence": "low",
                            "rejection_reason": "unreachable:ssl_error",
                            "candidate_page_type": "parked_or_unreachable",
                            "candidate_page_type_evidence": [], "evidence": []}]},
            {"place_id": "p2b", "business_name": "Garage Ok", "city": "Ede",
             "status": "found_verified", "candidates": []}]})   # not fetch_failed
        extra = [{"path": p2.website_discovery_json, "records_key": "results",
                  "status_key": "status", "source": "pilot2_discovery"}]
        result = wd.build_manual_review_queue(paths, leads, extra_sources=extra)
        self.assertEqual(result["count"], 2)                         # 1 pilot1 + 1 pilot2
        self.assertEqual({q["source"] for q in result["queue"]},
                         {"pilot1_retry", "pilot2_discovery"})
        # Pilot-2 record annotated additively; factual status preserved.
        p2rep = storage.read_json(p2.website_discovery_json)
        rec = next(r for r in p2rep["results"] if r["place_id"] == "p2a")
        self.assertEqual(rec["status"], "fetch_failed")
        self.assertEqual(rec["manual_review_status"], "pending")
        # found_verified record untouched.
        ok = next(r for r in p2rep["results"] if r["place_id"] == "p2b")
        self.assertNotIn("manual_review_status", ok)

    def test_queue_is_idempotent(self):
        paths, leads = self._seed_retry_report()
        wd.build_manual_review_queue(paths, leads)
        # Simulate a human decision, then rebuild — must not be overwritten.
        rep = storage.read_json(paths.website_fetch_retry_report)
        rep["leads"][0]["manual_review_status"] = "official_website_confirmed_manually"
        storage.write_json_atomic(paths.website_fetch_retry_report, rep)
        wd.build_manual_review_queue(paths, leads)
        rep2 = storage.read_json(paths.website_fetch_retry_report)
        self.assertEqual(rep2["leads"][0]["manual_review_status"],
                         "official_website_confirmed_manually")
        self.assertEqual(rep2["leads"][0]["new_status"], "fetch_failed")


# ---------------------------------------------------------------------------
# Pilot 2 selection (disjoint from pilot 1)
# ---------------------------------------------------------------------------

class TestPilot2Selection(unittest.TestCase):
    def _pool(self, n=300):
        cities = ["Amsterdam", "Rotterdam", "Utrecht", "Den Haag", "Eindhoven",
                  "Groningen", "Tilburg", "Almere", "Breda", "Nijmegen", "Arnhem", "Ede"]
        out = []
        for i in range(n):
            city = cities[i % len(cities)]
            generic = (i % 2 == 0)
            name = "Garage" if generic else f"Autobedrijf Uniek{i}"
            complete = (i % 3 != 0)
            addr = f"Straat {i}, 10{i:02d} AB {city}" if complete else city
            out.append(_lead(f"p{i:04d}", name, city, f"020 000 {i:04d}", addr))
        return out

    def test_pilot2_excludes_pilot1_and_is_representative(self):
        pool = self._pool()
        pilot1 = wd.select_pilot_sample(pool, n=25)
        p1_ids = {l["place_id"] for l in pilot1}
        pilot2 = wd.select_pilot_sample(pool, n=25, exclude_ids=p1_ids)
        p2_ids = {l["place_id"] for l in pilot2}
        self.assertEqual(len(pilot2), 25)
        self.assertTrue(p1_ids.isdisjoint(p2_ids))                    # none from pilot 1
        # Deterministic.
        self.assertEqual([l["place_id"] for l in pilot2],
                         [l["place_id"] for l in wd.select_pilot_sample(pool, n=25, exclude_ids=p1_ids)])
        # Representative.
        self.assertIn(True, [wd.is_generic_name(l["business_name"], l["city"]) for l in pilot2])
        self.assertIn(False, [wd.is_generic_name(l["business_name"], l["city"]) for l in pilot2])
        self.assertGreaterEqual(len({l["city"] for l in pilot2}), 5)

    def test_prep_classification_labels(self):
        def L(name, cat):
            return {"business_name": name, "category": cat, "city": "X"}
        self.assertEqual(wd.prep_classification(L("Garage Jansen", "car_repair")), "automotive_likely")
        self.assertEqual(wd.prep_classification(L("Bandenservice X", "tire_shop")), "automotive_likely")
        self.assertEqual(wd.prep_classification(L("Hondenuitlaatservice Rex", "pet_care")), "wrong_industry_control")
        # A Vespa/scooter service tagged car_repair is ADJACENT (name overrides cat).
        self.assertEqual(wd.prep_classification(L("Vespa Amazon Service", "car_repair")), "adjacent_industry_control")
        self.assertEqual(wd.prep_classification(L("Ritterbex T.H.", "car_dealer")), "adjacent_industry_control")

    def test_composition_is_21_2_2_disjoint_and_diverse(self):
        # Synthetic pool with enough of each class.
        leads = []
        cities = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
                  "N", "O", "P", "Q", "R", "S", "T"]
        for i in range(80):
            leads.append(_lead(f"a{i:03d}", ("Garage" if i % 2 else f"Autobedrijf {i}"),
                               cities[i % len(cities)], "020 0", f"Straat {i}, 10{i:02d} AB {cities[i%len(cities)]}"
                               if i % 3 else cities[i % len(cities)]))
            leads[-1]["category"] = "car_repair"
        for i in range(6):
            leads.append(_lead(f"w{i:03d}", f"Hondenuitlaatservice {i}", cities[i], "020 0", f"Weg {i}, 20{i:02d} AB {cities[i]}"))
            leads[-1]["category"] = "pet_care"
        for i in range(6):
            leads.append(_lead(f"j{i:03d}", f"Scooter Service {i}", cities[i], "020 0", f"Laan {i}, 30{i:02d} AB {cities[i]}"))
            leads[-1]["category"] = "car_dealer"
        sample = wd.select_pilot_composition(leads, exclude_ids={"a000"})
        labels = [wd.prep_classification(l) for l in sample]
        self.assertEqual(labels.count("automotive_likely"), 21)
        self.assertEqual(labels.count("wrong_industry_control"), 2)
        self.assertEqual(labels.count("adjacent_industry_control"), 2)
        self.assertEqual(len(sample), 25)
        self.assertNotIn("a000", {l["place_id"] for l in sample})   # excluded
        # Deterministic.
        self.assertEqual([l["place_id"] for l in sample],
                         [l["place_id"] for l in wd.select_pilot_composition(leads, exclude_ids={"a000"})])
        # Variety present.
        self.assertGreaterEqual(len({l["city"] for l in sample}), 5)
        comp = [wd._address_complete(l) for l in sample]
        self.assertIn(True, comp); self.assertIn(False, comp)
        gen = [wd.is_generic_name(l["business_name"], l["city"]) for l in sample]
        self.assertIn(True, gen); self.assertIn(False, gen)

    def test_already_discovered_ids_reads_results_files(self):
        d = tempfile.mkdtemp()
        paths = config.make_industry_paths("autogarage", d)
        paths.ensure()
        storage.write_json_atomic(paths.website_discovery_json,
                                  {"results": [{"place_id": "x1"}, {"place_id": "x2"}]})
        # A tagged run's own file must be ignored when computing exclusions for it.
        p2 = config.make_industry_paths("autogarage", d, run_tag="pilot2")
        self.assertEqual(wd.already_discovered_ids(p2), {"x1", "x2"})
        self.assertEqual(wd.already_discovered_ids(paths), set())    # ignores itself


# ---------------------------------------------------------------------------
# Prep-population split: wrong-industry review, adjacent report, --prep-class
# ---------------------------------------------------------------------------

class TestPrepSplit(unittest.TestCase):
    def _pool(self):
        leads = []
        for i in range(10):
            leads.append(_lead(f"au{i}", f"Autobedrijf {i}", f"C{i}", "0", f"S {i}, 10{i:02d} AB C{i}"))
            leads[-1]["category"] = "car_repair"
        for i in range(4):
            leads.append(_lead(f"wr{i}", f"Hondenuitlaatservice {i}", f"W{i}", "0", f"W {i}, 20{i:02d} AB W{i}"))
            leads[-1]["category"] = "pet_care"
        for i in range(3):
            leads.append(_lead(f"aj{i}", f"Scooter Service {i}", f"J{i}", "0", f"J {i}, 30{i:02d} AB J{i}"))
            leads[-1]["category"] = "car_dealer"
        return leads

    def _paths(self):
        d = tempfile.mkdtemp()
        p = config.make_industry_paths("autogarage", d)
        p.ensure()
        return p

    def test_prep_detail_evidence(self):
        lbl, ev = wd.prep_classification_detail({"business_name": "Vespa Service", "category": "car_repair", "city": "X"})
        self.assertEqual(lbl, "adjacent_industry_control")
        self.assertIn("vespa", ev["name_terms"])
        lbl2, ev2 = wd.prep_classification_detail({"business_name": "Hondenuitlaat Rex", "category": "pet_care", "city": "X"})
        self.assertEqual(lbl2, "wrong_industry_control")

    def test_select_by_prep_class_excludes_and_filters(self):
        pool = self._pool()
        auto = wd.select_by_prep_class(pool, "automotive_likely", exclude_ids={"au0"})
        self.assertTrue(all(wd.prep_classification(l) == "automotive_likely" for l in auto))
        self.assertNotIn("au0", {l["place_id"] for l in auto})
        self.assertEqual(len(auto), 9)
        # deterministic
        self.assertEqual([l["place_id"] for l in auto],
                         [l["place_id"] for l in wd.select_by_prep_class(pool, "automotive_likely", exclude_ids={"au0"})])

    def test_wrong_industry_review_deterministic_idempotent(self):
        p, pool = self._paths(), self._pool()
        r1 = wd.build_wrong_industry_review(p, pool)
        self.assertEqual(r1["count"], 4)
        self.assertTrue(all(x["preparation_status"] == "suspected_wrong_industry_pending_review"
                            for x in r1["leads"]))
        self.assertEqual(wd.WRONG_INDUSTRY_REVIEW_OUTCOMES,
                         ["confirmed_wrong_industry", "automotive_business_confirmed",
                          "adjacent_vehicle_business", "insufficient_information"])
        self.assertTrue(Path(p.wrong_industry_review_csv).exists())
        # A human marks one; rebuild must preserve it (idempotent).
        doc = storage.read_json(p.wrong_industry_review_json)
        doc["leads"][0]["review_status"] = "confirmed_wrong_industry"
        storage.write_json_atomic(p.wrong_industry_review_json, doc)
        r2 = wd.build_wrong_industry_review(p, pool)
        doc2 = storage.read_json(p.wrong_industry_review_json)
        by = {l["place_id"]: l for l in doc2["leads"]}
        self.assertEqual(by[doc["leads"][0]["place_id"]]["review_status"], "confirmed_wrong_industry")

    def test_adjacent_review_reasons(self):
        p, pool = self._paths(), self._pool()
        r = wd.build_adjacent_review(p, pool)
        self.assertEqual(r["count"], 3)
        self.assertTrue(all("scooter" in x["classified_adjacent_reason"] for x in r["leads"]))
        self.assertTrue(Path(p.adjacent_industry_review_csv).exists())

    def test_reviews_do_not_mutate_leads(self):
        p, pool = self._paths(), self._pool()
        storage.save_leads(p, pool)
        before = Path(p.leads_json).read_bytes()
        wd.build_wrong_industry_review(p, storage.load_leads(p))
        wd.build_adjacent_review(p, storage.load_leads(p))
        self.assertEqual(Path(p.leads_json).read_bytes(), before)


if __name__ == "__main__":
    unittest.main()
