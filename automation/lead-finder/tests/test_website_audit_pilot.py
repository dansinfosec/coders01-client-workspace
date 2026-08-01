"""Tests for the isolated, direct-HTTP-only website-audit pilot
(leadfinder/website_audit_pilot.py).

No Brave, no Google Places: the fetcher is the existing MockFetcher (canned
HTML fixtures). Covers:
  * static-HTML signal detection (opening hours, maps link, privacy/cookie,
    technologies, garage service keywords);
  * identity re-verification (match / neutral phone mismatch / real conflict),
    reusing the same primitives already validated for website discovery;
  * garage-feature-score / website-quality-score derivation;
  * deterministic 40/10 sampling from a synthetic audit-scope population, with
    no duplicate place_id or website domain;
  * the isolated run-tag config paths matching the exact requested filenames;
  * end-to-end pilot execution: checkpointing after every lead, resume,
    stopping exactly at the sample size, and that leads.json / the legacy
    website-audits.json are never touched.
"""

import argparse
import io
import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from leadfinder import config, storage  # noqa: E402
from leadfinder import website_audit_pilot as wap  # noqa: E402
from leadfinder.audit import MockFetcher  # noqa: E402
from leadfinder import mockdata  # noqa: E402
import lead_finder  # noqa: E402


def _lead(pid, name, city, phone, address, website):
    return {"place_id": pid, "industry": "autogarage", "business_name": name,
            "city": city, "region": "T", "phone": phone, "address": address,
            "website": website}


class TestExtraSignals(unittest.TestCase):
    def test_all_signals_detected_from_static_html(self):
        html = ('<html><body>Openingstijden: ma-vr 08:00-18:00. '
                'Wij verzorgen APK, onderhoud, reparatie, banden, diagnose, airco, '
                'schadeherstel, sleepdienst en occasions. '
                '<a href="https://maps.google.com/?q=1">Route</a> '
                'Privacybeleid. Wij gebruiken cookies, klik akkoord voor toestemming. '
                '<script src="wp-content/themes/x.js"></script></body></html>')
        sig = wap.detect_extra_signals(html)
        for key in ("opening_hours_present", "maps_link_present", "privacy_policy_present",
                   "cookie_banner_evidence", "mentions_apk", "mentions_maintenance",
                   "mentions_repair", "mentions_tires", "mentions_diagnostics",
                   "mentions_aircon", "mentions_bodywork", "mentions_towing",
                   "mentions_vehicle_sales"):
            self.assertTrue(sig[key], key)
        self.assertIn("WordPress", sig["detected_technologies"])

    def test_no_false_positives_on_unrelated_page(self):
        html = "<html><body><h1>Welkom</h1><p>Een gewone pagina zonder iets bijzonders.</p></body></html>"
        sig = wap.detect_extra_signals(html)
        self.assertFalse(any(v for k, v in sig.items() if k != "detected_technologies"))
        self.assertEqual(sig["detected_technologies"], [])


class TestIdentityReVerification(unittest.TestCase):
    def test_phone_match_is_high_confidence(self):
        lead = _lead("i1", "Garage Jansen", "Utrecht", "020 111 2222", "Kerkstraat 5, 1011 AA Utrecht", "https://x.nl")
        html = '<a href="tel:+31201112222">020 111 2222</a> Garage Jansen, Kerkstraat 5, 1011 AA Utrecht'
        r = wap.identity_evidence_for_audit(lead, html)
        self.assertEqual(r["identity_confidence"], "high")
        self.assertEqual(r["identity_match_outcome"], "match")
        self.assertIn("phone_match", r["identity_evidence"])

    def test_phone_mismatch_alone_is_neutral_not_conflict(self):
        # Google mobile vs site landline: a bare phone difference must NOT be a
        # conflict when the name/city otherwise corroborate.
        lead = _lead("i2", "Garage Bakker", "Haarlem", "06 12345678", "Iets 1, 2011 AB Haarlem", "https://y.nl")
        html = "Garage Bakker in Haarlem. Bel 023 555 1234 voor een afspraak."
        r = wap.identity_evidence_for_audit(lead, html)
        self.assertNotEqual(r["identity_confidence"], "conflict")
        self.assertNotEqual(r["identity_match_outcome"], "conflict")
        # name+city corroborate, so this reaches at least medium confidence.
        self.assertIn(r["identity_confidence"], ("medium", "high"))

    def test_real_conflict_needs_differing_address_no_name(self):
        lead = _lead("i3", "Garage Conflict", "Rotterdam", "010 111 1111", "Straat 1, 3011 AA Rotterdam", "https://z.nl")
        html = "Andere Zaak in Rotterdam. Bel 010 999 9999. Adres: Weg 2, 3099 ZZ Rotterdam."
        r = wap.identity_evidence_for_audit(lead, html)
        self.assertEqual(r["identity_confidence"], "conflict")
        self.assertEqual(r["identity_match_outcome"], "conflict")
        self.assertIn("address_conflict", r["identity_conflicting_evidence"])

    def test_unreachable_site_has_no_evidence(self):
        lead = _lead("i4", "Garage X", "Ede", "0", "Weg 1, 1000AA Ede", "https://x.nl")
        r = wap.identity_evidence_for_audit(lead, "")
        self.assertEqual(r["identity_confidence"], "unknown")
        self.assertEqual(r["identity_match_outcome"], "no_evidence")


class TestScoresAndClassification(unittest.TestCase):
    def test_unreachable_scores_are_zero(self):
        audit = {"has_website": True, "reachable": False}
        self.assertEqual(wap.website_quality_score(audit), 0)
        self.assertEqual(wap.garage_feature_score(audit), 0)

    def test_full_featured_site_scores_higher_than_bare_site(self):
        bare = {"has_website": True, "reachable": True, "https": True, "mobile_viewport": True,
               "has_contact_form": True, "has_cta": True, "title": "X", "has_visible_phone": True,
               "server_error": False, "copyright_year": 2026}
        advanced = dict(bare)
        advanced.update({"has_real_booking_calendar": True, "can_select_service": True,
                         "can_select_date": True, "can_select_available_time_slot": True,
                         "has_appointment_cta": True, "can_enter_license_plate": True,
                         "has_vehicle_lookup_result": True, "has_rdw_or_vehicle_data_integration": True})
        self.assertGreater(wap.garage_feature_score(advanced), wap.garage_feature_score(bare))


class TestDeterministicSampling(unittest.TestCase):
    def _synthetic_scope(self):
        leads_by_id, scope = {}, []
        cities = [f"City{i}" for i in range(20)]
        for i in range(200):
            pid = f"g{i:04d}"
            name = "Garage" if i % 3 == 0 else f"Autobedrijf Uniek {i}"
            leads_by_id[pid] = _lead(pid, name, cities[i % len(cities)], "020 0",
                                     f"Straat {i}, 10{i%99:02d} AB {cities[i%len(cities)]}",
                                     f"https://google{i}.nl/")
            scope.append({"place_id": pid, "website": f"https://google{i}.nl/",
                         "website_source": wap.GOOGLE_SUPPLIED})
        for i in range(30):
            pid = f"d{i:04d}"
            leads_by_id[pid] = _lead(pid, f"Confirmed Garage {i}", cities[i % len(cities)], "020 1",
                                     f"Weg {i}, 20{i%99:02d} AB {cities[i%len(cities)]}",
                                     f"https://discovered{i}.nl/")
            scope.append({"place_id": pid, "website": f"https://discovered{i}.nl/",
                         "website_source": wap.CONFIRMED_DISCOVERED})
        return scope, leads_by_id

    def test_exact_40_10_split_no_duplicates_deterministic(self):
        scope, leads_by_id = self._synthetic_scope()
        s1 = wap.select_pilot_sample(scope, leads_by_id, n_google=40, n_discovered=10)
        g = [e for e in s1 if e["website_source"] == wap.GOOGLE_SUPPLIED]
        d = [e for e in s1 if e["website_source"] == wap.CONFIRMED_DISCOVERED]
        self.assertEqual(len(g), 40)
        self.assertEqual(len(d), 10)
        self.assertEqual(len(s1), 50)
        ids = [e["place_id"] for e in s1]
        self.assertEqual(len(ids), len(set(ids)))          # no duplicate place_id
        domains = [e["website"] for e in s1]
        self.assertEqual(len(domains), len(set(domains)))  # no duplicate website
        s2 = wap.select_pilot_sample(scope, leads_by_id, n_google=40, n_discovered=10)
        self.assertEqual([e["place_id"] for e in s1], [e["place_id"] for e in s2])  # deterministic

    def test_falls_back_to_all_discovered_when_bucket_too_small(self):
        scope, leads_by_id = self._synthetic_scope()
        small_scope = [e for e in scope if e["website_source"] == wap.GOOGLE_SUPPLIED] + \
            [e for e in scope if e["website_source"] == wap.CONFIRMED_DISCOVERED][:5]
        s = wap.select_pilot_sample(small_scope, leads_by_id, n_google=40, n_discovered=10)
        self.assertEqual(sum(1 for e in s if e["website_source"] == wap.CONFIRMED_DISCOVERED), 5)

    def test_excludes_specified_place_ids(self):
        scope, leads_by_id = self._synthetic_scope()
        s = wap.select_pilot_sample(scope, leads_by_id, n_google=5, n_discovered=0,
                                    exclude_place_ids={"g0000"})
        self.assertNotIn("g0000", {e["place_id"] for e in s})


class TestConfigPaths(unittest.TestCase):
    def test_pilot_filenames_match_requested_convention(self):
        p = config.make_industry_paths("autogarage", tempfile.mkdtemp(), run_tag="audit-pilot1")
        self.assertEqual(p.audit_pilot_results_json.name, "website-audit-audit-pilot1.json")
        self.assertEqual(p.audit_pilot_progress_json.name, "website-audit-progress-audit-pilot1.json")
        self.assertEqual(p.audit_pilot_report_json.name, "website-audit-report-audit-pilot1.json")
        self.assertEqual(p.audit_pilot_csv.name, "website-audit-audit-pilot1.csv")

    def test_untagged_audits_json_unchanged(self):
        p = config.make_industry_paths("autogarage", tempfile.mkdtemp())
        self.assertEqual(p.audits_json.name, "website-audits.json")   # backward compatible

    def test_production_filenames_match_requested_convention(self):
        p = config.make_industry_paths("autogarage", tempfile.mkdtemp(), run_tag="audit-production1")
        self.assertEqual(p.audit_pilot_results_json.name, "website-audit-audit-production1.json")
        self.assertEqual(p.audit_pilot_progress_json.name, "website-audit-progress-audit-production1.json")
        self.assertEqual(p.audit_pilot_report_json.name, "website-audit-report-audit-production1.json")
        self.assertEqual(p.audit_pilot_csv.name, "website-audit-audit-production1.csv")
        self.assertEqual(p.audit_scope_tagged_json.name, "website-audit-scope-audit-production1.json")
        self.assertEqual(p.audit_pilot_fingerprint_json.name, "website-audit-fingerprint-audit-production1.json")


class TestDiscoveredWebsiteUrlSource(unittest.TestCase):
    """Regression: confirmed_discovered leads have website=None in leads.json
    (discovered URLs are deliberately never merged back into leads.json) — the
    audit-scope entry's `website`, NOT `lead.get('website')`, must be fetched."""

    def test_confirmed_discovered_lead_with_null_leads_json_website_is_fetched(self):
        lead = _lead("cd1", "BFT GROEP BV", "Zwolle", "06 24288860",
                     "Newtonweg 27, 8013 RD Zwolle", website=None)   # website=None, as in leads.json
        record = wap.audit_one_pilot_lead(lead, "https://bftgroep.nl/",
                                          wap.CONFIRMED_DISCOVERED, MockFetcher())
        self.assertEqual(record["website_source"], wap.CONFIRMED_DISCOVERED)
        self.assertEqual(record["submitted_url"], "https://bftgroep.nl/")
        self.assertNotIn(record.get("final_audit_classification"), (None,))

    def test_run_pilot_uses_scope_website_not_lead_website(self):
        d = tempfile.mkdtemp()
        base = config.make_industry_paths("autogarage", d)
        base.ensure()
        lead = _lead("cd2", "Kings Cars", "Venlo", "06 0", "Straat 1, 1000AA Venlo", website=None)
        storage.save_leads(base, [lead])
        paths = config.make_industry_paths("autogarage", d, run_tag="test-pilot1")
        paths.ensure()
        sample = [{"place_id": "cd2", "website": "https://garageverified.nl/",
                  "website_source": wap.CONFIRMED_DISCOVERED}]
        report = wap.run_pilot(paths, sample, {"cd2": lead}, MockFetcher())
        results = wap.load_pilot_results(paths)
        # A real mock fixture exists for garageverified.nl -> must be reachable,
        # proving the SCOPE's website (not the lead's None) was actually fetched.
        self.assertTrue(results["cd2"]["reachable"])
        self.assertIsNone(results["cd2"].get("unreachable_reason"))
        self.assertEqual(results["cd2"]["website_source"], wap.CONFIRMED_DISCOVERED)


class FakeFetcher:
    """Fully scripted fetcher for controlled status-code/redirect-chain tests.
    Maps a URL to a canned fetch() result dict — independent of MockFetcher's
    fixture bank, so every HTTP outcome can be tested precisely."""

    def __init__(self, script: dict):
        self.script = script
        self.calls = []

    def fetch(self, url):
        self.calls.append(url)
        return self.script.get(url, {"ok": False, "reason": "dns_failure"})


def _ok(status, final_url, html="", redirect_chain=None, https=True):
    chain = redirect_chain or [final_url]
    return {"ok": True, "status_code": status, "final_url": final_url, "html": html,
            "https": https, "response_time": 0.1, "redirects": max(0, len(chain) - 1),
            "redirect_chain": chain}


GARAGE_HTML = ("<html><head><title>Garage X</title></head><body>APK, onderhoud, reparatie, "
              "banden. <form><input name='naam'></form></body></html>")


class TestFinalResponseOutcomes(unittest.TestCase):
    """Part A: every required outcome category, plus the two body-must-not-be-
    used-on-error rules."""

    def _lead_site(self, url, script):
        lead = _lead("o1", "Garage Outcome", "Ede", "020 111 2222",
                    "Kerkstraat 1, 1000 AA Ede", url)
        return wap.audit_one_pilot_lead(lead, url, wap.GOOGLE_SUPPLIED, FakeFetcher(script))

    def test_200_success(self):
        r = self._lead_site("https://a.nl/", {"https://a.nl/": _ok(200, "https://a.nl/", GARAGE_HTML)})
        self.assertEqual(r["outcome"], wap.OUTCOME_SUCCESS)
        self.assertTrue(r["reachable"])
        self.assertGreater(r["garage_feature_score"], 0)

    def test_301_to_200_is_success(self):
        r = self._lead_site("https://a.nl/", {
            "https://a.nl/": _ok(200, "https://a.nl/final", GARAGE_HTML, redirect_chain=["https://a.nl/", "https://a.nl/final"])})
        self.assertEqual(r["outcome"], wap.OUTCOME_SUCCESS)
        self.assertTrue(r["reachable"])
        self.assertEqual(r["redirects"], 1)

    def test_301_to_404_is_page_not_found(self):
        r = self._lead_site("https://a.nl/", {
            "https://a.nl/": _ok(404, "https://a.nl/gone", "<html>Not found</html>",
                                 redirect_chain=["https://a.nl/", "https://a.nl/gone"])})
        self.assertEqual(r["outcome"], wap.OUTCOME_PAGE_NOT_FOUND)
        self.assertFalse(r["reachable"])
        self.assertEqual(r["garage_feature_score"], 0)
        self.assertEqual(r["website_quality_score"], 0)
        self.assertTrue(r["manual_review_required"])

    def test_direct_404(self):
        r = self._lead_site("https://a.nl/", {"https://a.nl/": _ok(404, "https://a.nl/")})
        self.assertEqual(r["outcome"], wap.OUTCOME_PAGE_NOT_FOUND)
        self.assertEqual(r["final_audit_classification"], "page_not_found")

    def test_410_is_page_not_found(self):
        r = self._lead_site("https://a.nl/", {"https://a.nl/": _ok(410, "https://a.nl/")})
        self.assertEqual(r["outcome"], wap.OUTCOME_PAGE_NOT_FOUND)
        self.assertEqual(r["garage_feature_score"], 0)

    def test_403_is_access_blocked(self):
        r = self._lead_site("https://a.nl/", {"https://a.nl/": _ok(403, "https://a.nl/")})
        self.assertEqual(r["outcome"], wap.OUTCOME_ACCESS_BLOCKED)
        self.assertEqual(r["garage_feature_score"], 0)
        self.assertEqual(r["website_quality_score"], 0)
        self.assertTrue(r["manual_review_required"])

    def test_429_is_access_blocked(self):
        r = self._lead_site("https://a.nl/", {"https://a.nl/": _ok(429, "https://a.nl/")})
        self.assertEqual(r["outcome"], wap.OUTCOME_ACCESS_BLOCKED)

    def test_500_is_server_error(self):
        r = self._lead_site("https://a.nl/", {"https://a.nl/": _ok(500, "https://a.nl/")})
        self.assertEqual(r["outcome"], wap.OUTCOME_SERVER_ERROR)
        self.assertEqual(r["final_audit_classification"], "server_error")
        self.assertEqual(r["garage_feature_score"], 0)
        self.assertTrue(r["manual_review_required"])

    def test_503_is_server_error(self):
        r = self._lead_site("https://a.nl/", {"https://a.nl/": _ok(503, "https://a.nl/")})
        self.assertEqual(r["outcome"], wap.OUTCOME_SERVER_ERROR)

    def test_other_4xx_is_client_error(self):
        r = self._lead_site("https://a.nl/", {"https://a.nl/": _ok(418, "https://a.nl/")})
        self.assertEqual(r["outcome"], wap.OUTCOME_CLIENT_ERROR)
        self.assertEqual(r["garage_feature_score"], 0)

    def test_dns_failure_preserved_precisely(self):
        r = self._lead_site("https://a.nl/", {"https://a.nl/": {"ok": False, "reason": "dns_failure"}})
        self.assertEqual(r["outcome"], wap.OUTCOME_DNS_FAILURE)
        self.assertEqual(r["garage_feature_score"], 0)
        self.assertTrue(r["manual_review_required"])

    def test_tls_failure_preserved_precisely(self):
        r = self._lead_site("https://a.nl/", {"https://a.nl/": {"ok": False, "reason": "ssl_error"}})
        self.assertEqual(r["outcome"], wap.OUTCOME_TLS_FAILURE)

    def test_timeout_preserved_precisely(self):
        r = self._lead_site("https://a.nl/", {"https://a.nl/": {"ok": False, "reason": "timeout"}})
        self.assertEqual(r["outcome"], wap.OUTCOME_TIMEOUT)

    def test_connection_failure_preserved_precisely(self):
        r = self._lead_site("https://a.nl/", {"https://a.nl/": {"ok": False, "reason": "connection_refused"}})
        self.assertEqual(r["outcome"], wap.OUTCOME_CONNECTION_FAILURE)

    def test_404_body_with_garage_keywords_still_scores_zero(self):
        r = self._lead_site("https://a.nl/", {"https://a.nl/": _ok(404, "https://a.nl/", GARAGE_HTML)})
        self.assertEqual(r["garage_feature_score"], 0)
        self.assertEqual(r["website_quality_score"], 0)
        self.assertNotIn("mentions_apk", r)   # content was never even extracted

    def test_404_body_with_matching_identity_is_not_identity_match(self):
        html = ('<a href="tel:+31201112222">020 111 2222</a> Garage Outcome, '
               'Kerkstraat 1, 1000 AA Ede')
        r = self._lead_site("https://a.nl/", {"https://a.nl/": _ok(404, "https://a.nl/", html)})
        self.assertEqual(r["identity_confidence"], "not_evaluated")
        self.assertEqual(r["identity_match_outcome"], "not_evaluated")
        self.assertEqual(r["identity_evidence"], [])

    def test_existing_success_behavior_unchanged(self):
        # A fully successful, feature-rich page still scores/classifies normally.
        r = self._lead_site("https://a.nl/", {"https://a.nl/": _ok(200, "https://a.nl/", GARAGE_HTML)})
        self.assertTrue(r["mentions_apk"])
        self.assertTrue(r["has_contact_form"])
        self.assertIn(r["final_audit_classification"],
                      ("A_no_website", "B_basic_website", "C_manual_appointment_website",
                       "D_booking_without_vehicle_lookup", "E_advanced_garage_website"))


class TestExternalRedirect(unittest.TestCase):
    def test_external_domain_redirect_flagged_not_silently_trusted(self):
        lead = _lead("er1", "Garage Redirect", "Ede", "020 111 2222", "Weg 1, 1000AA Ede", "https://a.nl/")
        script = {"https://a.nl/": _ok(200, "https://elsewhere.nl/", GARAGE_HTML,
                                        redirect_chain=["https://a.nl/", "https://elsewhere.nl/"])}
        r = wap.audit_one_pilot_lead(lead, "https://a.nl/", wap.GOOGLE_SUPPLIED, FakeFetcher(script))
        self.assertTrue(r["external_redirect"])
        self.assertTrue(any("external_domain_redirect" in w for w in r["audit_warnings"]))
        self.assertTrue(r["manual_review_required"])


class TestIndustryRelevance(unittest.TestCase):
    def test_doc_dogdoc_detected_via_domain(self):
        lead = _lead("w1", "Doc", "Haarlem", "0", "Weg 1, 1000AA Haarlem", "https://dogdoc.nl/")
        rel = wap.assess_industry_relevance(lead, "dogdoc.nl", body_text=None)
        self.assertEqual(rel["industry_relevance_status"], wap.REL_SUSPECTED_WRONG)
        self.assertTrue(rel["excluded_from_automatic_garage_outreach"])

    def test_michaels_hondenuitlaatservice_detected_via_name(self):
        lead = _lead("w2", "Michaels Hondenuitlaatservice", "Amsterdam", "0",
                    "Weg 1, 1000AA Amsterdam", "https://x.nl/")
        rel = wap.assess_industry_relevance(lead, "x.nl", body_text=None)
        self.assertEqual(rel["industry_relevance_status"], wap.REL_SUSPECTED_WRONG)

    def test_whats_up_dogs_detected_via_name(self):
        lead = _lead("w3", "What's up dogs", "Rotterdam", "0", "Weg 1, 1000AA Rotterdam", "https://y.nl/")
        rel = wap.assess_industry_relevance(lead, "y.nl", body_text=None)
        self.assertEqual(rel["industry_relevance_status"], wap.REL_SUSPECTED_WRONG)

    def test_amrit_techniek_watersport_detected_via_domain(self):
        lead = _lead("w4", "Amrit Techniek", "Elst", "0", "Weg 1, 1000AA Elst",
                    "https://amritwatersport.nl/")
        rel = wap.assess_industry_relevance(lead, "amritwatersport.nl", body_text=None)
        self.assertEqual(rel["industry_relevance_status"], wap.REL_SUSPECTED_WRONG)

    def test_absence_of_keywords_alone_is_insufficient_not_wrong_industry(self):
        lead = _lead("w5", "Autobedrijf Janssen", "Ede", "0", "Weg 1, 1000AA Ede", "https://x.nl/")
        rel = wap.assess_industry_relevance(lead, "somehost.nl", body_text="Welkom op onze website.")
        self.assertNotEqual(rel["industry_relevance_status"], wap.REL_SUSPECTED_WRONG)
        # No strong signal either way -> insufficient (name has "auto" but not in
        # the exact term bank here is fine — the key guarantee is NOT wrong-industry).

    def test_generic_or_city_only_name_is_not_strong_automotive_proof(self):
        # A fully generic name + no site content evidence must not auto-confirm.
        lead = _lead("w6", "Garage", "Ede", "0", "Weg 1, 1000AA Ede", "https://x.nl/")
        rel = wap.assess_industry_relevance(lead, "x.nl", body_text="Welkom.", automotive_hit_count=0)
        self.assertNotEqual(rel["industry_relevance_status"], wap.REL_AUTOMOTIVE_CONFIRMED)

    def test_real_service_content_confirms_automotive(self):
        lead = _lead("w7", "Bedrijf X", "Ede", "0", "Weg 1, 1000AA Ede", "https://x.nl/")
        rel = wap.assess_industry_relevance(lead, "x.nl", body_text="apk onderhoud reparatie",
                                            automotive_hit_count=3)
        self.assertEqual(rel["industry_relevance_status"], wap.REL_AUTOMOTIVE_CONFIRMED)

    def test_end_to_end_pilot_flags_wrong_industry_and_excludes_outreach(self):
        lead = _lead("w8", "Michaels Hondenuitlaatservice", "Amsterdam", "020 000 0000",
                    "Weg 1, 1000AA Amsterdam", "https://honddoc.nl/")
        html = "<html><title>Hondenuitlaatservice</title><body>Wij laten uw hond uit.</body></html>"
        script = {"https://honddoc.nl/": _ok(200, "https://honddoc.nl/", html)}
        r = wap.audit_one_pilot_lead(lead, "https://honddoc.nl/", wap.GOOGLE_SUPPLIED, FakeFetcher(script))
        self.assertEqual(r["industry_relevance_status"], wap.REL_SUSPECTED_WRONG)
        self.assertTrue(r["excluded_from_automatic_garage_outreach"])
        self.assertTrue(r["manual_review_required"])
        self.assertFalse(wap.is_score_eligible(r))


class TestScoreEligibilityAndAggregates(unittest.TestCase):
    def test_wrong_industry_and_error_pages_excluded_from_score_eligible(self):
        good = _ok(200, "https://good.nl/", GARAGE_HTML)
        wrong_html = "<html><body>Hondenuitlaatservice</body></html>"
        script = {
            "https://good.nl/": good,
            "https://wrong.nl/": _ok(200, "https://wrong.nl/", wrong_html),
            "https://gone.nl/": _ok(404, "https://gone.nl/"),
        }
        leads = [
            _lead("s1", "Garage Good", "Ede", "0", "Weg 1, 1000AA Ede", "https://good.nl/"),
            _lead("s2", "Hondenuitlaatservice Rex", "Ede", "0", "Weg 2, 1000AB Ede", "https://wrong.nl/"),
            _lead("s3", "Garage Gone", "Ede", "0", "Weg 3, 1000AC Ede", "https://gone.nl/"),
        ]
        records = [wap.audit_one_pilot_lead(l, l["website"], wap.GOOGLE_SUPPLIED, FakeFetcher(script))
                  for l in leads]
        report = wap.build_pilot_report(records)
        self.assertEqual(report["score_eligible_count"], 1)
        self.assertEqual(report["unscored_website_count"], 2)
        self.assertEqual(report["page_not_found"], 1)
        self.assertEqual(report["suspected_wrong_industry"], 1)
        self.assertGreater(report["average_website_quality_score"], 0)

    def test_component_distribution_counts_only_score_eligible(self):
        script = {"https://good.nl/": _ok(200, "https://good.nl/", GARAGE_HTML),
                 "https://gone.nl/": _ok(404, "https://gone.nl/")}
        leads = [_lead("c1", "Garage Good", "Ede", "0", "Weg 1, 1000AA Ede", "https://good.nl/"),
                 _lead("c2", "Garage Gone", "Ede", "0", "Weg 2, 1000AB Ede", "https://gone.nl/")]
        records = [wap.audit_one_pilot_lead(l, l["website"], wap.GOOGLE_SUPPLIED, FakeFetcher(script))
                  for l in leads]
        report = wap.build_pilot_report(records)
        dist = report["quality_score_component_distribution"]
        self.assertEqual(dist["successful_fetch"], 1)   # only the eligible one
        self.assertEqual(dist["contact_form"], 1)


class TestOfflineReevaluation(unittest.TestCase):
    """`reevaluate_stored_record_offline` / `reevaluate_pilot` apply the
    corrected outcome model + industry-relevance layer to OLD (pre-Part-A)
    pilot-1 records that predate the `outcome` field entirely."""

    def _old_success_record(self, **overrides):
        # Shape of a real audit-pilot1.json entry from before this fix: no
        # "outcome" key, "reachable": True regardless of status code.
        rec = {
            "place_id": "o1", "business_name": "Garage Oud", "city": "Ede",
            "website_source": wap.GOOGLE_SUPPLIED, "submitted_url": "https://garageoud.nl/",
            "final_url": "https://garageoud.nl/", "status_code": 200, "reachable": True,
            "redirects": 0, "redirect_chain": ["https://garageoud.nl/"],
            "final_audit_classification": "C_manual_appointment_website",
            "garage_feature_score": 35, "website_quality_score": 100,
            "mentions_apk": True, "audit_warnings": [], "manual_review_required": False,
            "checked_at": "2026-01-01T00:00:00+00:00",
        }
        rec.update(overrides)
        return rec

    def test_old_success_record_backfilled_with_outcome_becomes_score_eligible(self):
        # Regression test for the bug where offline re-evaluation never wrote
        # outcome="success" onto old records, so is_score_eligible() silently
        # excluded every single genuinely-successful re-evaluated lead.
        lead = _lead("o1", "Garage Oud", "Ede", "0", "Weg 1, 1000AA Ede", "https://garageoud.nl/")
        new, needs_refetch = wap.reevaluate_stored_record_offline(self._old_success_record(), lead)
        self.assertFalse(needs_refetch)
        self.assertEqual(new["outcome"], wap.OUTCOME_SUCCESS)
        self.assertTrue(new["reachable"])
        self.assertTrue(wap.is_score_eligible(new))

    def test_old_404_marked_reachable_is_corrected_and_unscored(self):
        lead = _lead("o2", "Garage Weg", "Ede", "0", "Weg 1, 1000AA Ede", "https://garageweg.nl/")
        old = self._old_success_record(place_id="o2", business_name="Garage Weg",
                                       submitted_url="https://garageweg.nl/", status_code=404,
                                       garage_feature_score=30, website_quality_score=95)
        new, needs_refetch = wap.reevaluate_stored_record_offline(old, lead)
        self.assertFalse(needs_refetch)
        self.assertEqual(new["outcome"], wap.OUTCOME_PAGE_NOT_FOUND)
        self.assertFalse(new["reachable"])
        self.assertEqual(new["garage_feature_score"], 0)
        self.assertEqual(new["website_quality_score"], 0)
        self.assertTrue(new["manual_review_required"])
        self.assertFalse(wap.is_score_eligible(new))

    def test_old_403_marked_reachable_is_corrected_to_access_blocked(self):
        # Generalization check: the offline corrector must not be limited to
        # 404/410 — any non-2xx/3xx status the old code let through must map
        # to its precise outcome (here access_blocked, not page_not_found).
        lead = _lead("o3", "Garage Blok", "Ede", "0", "Weg 1, 1000AA Ede", "https://garageblok.nl/")
        old = self._old_success_record(place_id="o3", business_name="Garage Blok",
                                       submitted_url="https://garageblok.nl/", status_code=403)
        new, needs_refetch = wap.reevaluate_stored_record_offline(old, lead)
        self.assertFalse(needs_refetch)
        self.assertEqual(new["outcome"], wap.OUTCOME_ACCESS_BLOCKED)
        self.assertFalse(wap.is_score_eligible(new))

    def test_old_dns_failure_reason_mapped_to_precise_outcome(self):
        lead = _lead("o4", "Garage Dns", "Ede", "0", "Weg 1, 1000AA Ede", "https://garagedns.nl/")
        old = self._old_success_record(place_id="o4", business_name="Garage Dns",
                                       submitted_url="https://garagedns.nl/", reachable=False,
                                       status_code=None, unreachable_reason="dns_failure")
        new, needs_refetch = wap.reevaluate_stored_record_offline(old, lead)
        self.assertFalse(needs_refetch)
        self.assertEqual(new["outcome"], wap.OUTCOME_DNS_FAILURE)
        self.assertFalse(wap.is_score_eligible(new))

    def test_old_wrong_industry_success_is_excluded_but_not_flagged_needs_refetch(self):
        lead = _lead("o5", "Michaels Hondenuitlaatservice", "Ede", "0", "Weg 1, 1000AA Ede",
                     "https://hondservice.nl/")
        old = self._old_success_record(place_id="o5", business_name="Michaels Hondenuitlaatservice",
                                       submitted_url="https://hondservice.nl/", mentions_apk=False)
        new, needs_refetch = wap.reevaluate_stored_record_offline(old, lead)
        self.assertFalse(needs_refetch)
        self.assertEqual(new["industry_relevance_status"], wap.REL_SUSPECTED_WRONG)
        self.assertEqual(new["garage_feature_score"], 0)
        self.assertTrue(new["manual_review_required"])
        self.assertFalse(wap.is_score_eligible(new))

    def test_old_success_with_no_name_domain_or_automotive_signal_needs_refetch(self):
        lead = _lead("o6", "Bedrijf X", "Ede", "0", "Weg 1, 1000AA Ede", "https://bedrijfx.nl/")
        old = self._old_success_record(place_id="o6", business_name="Bedrijf X",
                                       submitted_url="https://bedrijfx.nl/", mentions_apk=False)
        new, needs_refetch = wap.reevaluate_stored_record_offline(old, lead)
        self.assertTrue(needs_refetch)

    def test_reevaluate_pilot_never_writes_to_source_paths(self):
        d = tempfile.mkdtemp()
        source = config.make_industry_paths("autogarage", d, run_tag="audit-pilot1")
        source.ensure()
        dest = config.make_industry_paths("autogarage", d, run_tag="audit-pilot1-reeval")
        dest.ensure()
        lead = _lead("o1", "Garage Oud", "Ede", "0", "Weg 1, 1000AA Ede", "https://garageoud.nl/")
        wap.save_pilot_results(source, {"o1": self._old_success_record()})
        before = Path(source.audit_pilot_results_json).read_bytes()
        wap.reevaluate_pilot(source, dest, {"o1": lead})
        self.assertEqual(Path(source.audit_pilot_results_json).read_bytes(), before)
        after = wap.load_pilot_results(dest)
        self.assertTrue(wap.is_score_eligible(after["o1"]))


class TestPilotExecution(unittest.TestCase):
    def _seed(self):
        d = tempfile.mkdtemp()
        base = config.make_industry_paths("autogarage", d)
        base.ensure()
        leads = [
            _lead("p1", "Autobedrijf Verified", "Amsterdam", "020 111 2222",
                 "Testweg 1, 1011 AA Amsterdam", "https://garageverified.nl/"),
            _lead("p2", "Garage Mobiel", "Haarlem", "06 12 34 56 78",
                 "Iets 3, 2000 AA Haarlem", "https://garagemobiel.nl/"),
        ]
        storage.save_leads(base, leads)
        return d, base, leads

    def test_run_pilot_checkpoints_and_stops_at_sample_size(self):
        d, base, leads = self._seed()
        paths = config.make_industry_paths("autogarage", d, run_tag="test-pilot1")
        paths.ensure()
        leads_by_id = {l["place_id"]: l for l in leads}
        sample = [{"place_id": "p1", "website": leads[0]["website"], "website_source": wap.GOOGLE_SUPPLIED},
                  {"place_id": "p2", "website": leads[1]["website"], "website_source": wap.CONFIRMED_DISCOVERED}]
        report = wap.run_pilot(paths, sample, leads_by_id, MockFetcher(), max_concurrency=3)
        self.assertEqual(report["count"], 2)
        self.assertEqual(report["processed_this_run"], 2)
        self.assertTrue(Path(paths.audit_pilot_results_json).exists())
        self.assertTrue(Path(paths.audit_pilot_progress_json).exists())
        self.assertTrue(Path(paths.audit_pilot_report_json).exists())
        self.assertTrue(Path(paths.audit_pilot_csv).exists())
        # Legacy website-audits.json (untagged) must NOT be created by the pilot.
        untagged = config.make_industry_paths("autogarage", d)
        self.assertFalse(Path(untagged.audits_json).exists())

    def test_resume_skips_already_processed(self):
        d, base, leads = self._seed()
        paths = config.make_industry_paths("autogarage", d, run_tag="test-pilot1")
        paths.ensure()
        leads_by_id = {l["place_id"]: l for l in leads}
        sample = [{"place_id": "p1", "website": leads[0]["website"], "website_source": wap.GOOGLE_SUPPLIED}]
        wap.run_pilot(paths, sample, leads_by_id, MockFetcher())
        report2 = wap.run_pilot(paths, sample, leads_by_id, MockFetcher(), resume=True)
        self.assertEqual(report2["processed_this_run"], 0)   # already done, skipped

    def test_leads_json_never_modified_by_pilot(self):
        d, base, leads = self._seed()
        before = Path(base.leads_json).read_bytes()
        paths = config.make_industry_paths("autogarage", d, run_tag="test-pilot1")
        paths.ensure()
        leads_by_id = {l["place_id"]: l for l in leads}
        sample = [{"place_id": "p1", "website": leads[0]["website"], "website_source": wap.GOOGLE_SUPPLIED}]
        wap.run_pilot(paths, sample, leads_by_id, MockFetcher())
        self.assertEqual(Path(base.leads_json).read_bytes(), before)

    def test_mock_fetcher_only_no_real_network_module_used(self):
        # Structural guarantee: the module never imports a search provider or
        # a Places client (a mention of "Brave" in a docstring explaining that
        # it is NOT used is fine; an actual import/usage is not).
        import inspect
        src = inspect.getsource(wap)
        self.assertNotIn("import search_provider", src)
        self.assertNotIn("BraveSearchProvider", src)
        self.assertNotIn("PlacesClient", src)


def _sample(n, source=None, prefix="s"):
    source = source or wap.GOOGLE_SUPPLIED
    return [{"place_id": f"{prefix}{i}", "website": f"https://site{i}.nl/", "website_source": source}
            for i in range(n)]


class TestRunTagImmutability(unittest.TestCase):
    """Part F #1-6, #12: reserved tags can never be overwritten by a normal
    audit command, and resuming any tag requires an EXACT scope/config
    fingerprint match."""

    def test_reserved_tag_refused_by_run_pilot_fresh(self):
        # #1 / #2: a normal pilot/production creation command must refuse
        # BOTH reserved tags outright, even with nothing on disk yet.
        for tag in ("audit-pilot1", "audit-pilot1-reeval"):
            d = tempfile.mkdtemp()
            paths = config.make_industry_paths("autogarage", d, run_tag=tag)
            paths.ensure()
            sample = _sample(2)
            leads_by_id = {e["place_id"]: _lead(e["place_id"], "Garage X", "Ede", "0",
                                                "Weg 1, 1000AA Ede", e["website"]) for e in sample}
            with self.assertRaises(wap.RunTagImmutableError):
                wap.run_pilot(paths, sample, leads_by_id, MockFetcher())

    def test_resume_succeeds_with_identical_fingerprint(self):
        # #3
        d = tempfile.mkdtemp()
        paths = config.make_industry_paths("autogarage", d, run_tag="my-run")
        paths.ensure()
        sample = _sample(2)
        leads_by_id = {e["place_id"]: _lead(e["place_id"], "Garage X", "Ede", "0",
                                            "Weg 1, 1000AA Ede", e["website"]) for e in sample}
        wap.run_pilot(paths, sample, leads_by_id, MockFetcher(), max_concurrency=2)
        report2 = wap.run_pilot(paths, sample, leads_by_id, MockFetcher(), max_concurrency=2)
        self.assertEqual(report2["processed_this_run"], 0)   # resumed cleanly, nothing to redo

    def test_resume_fails_on_changed_place_id(self):
        # #4
        d = tempfile.mkdtemp()
        paths = config.make_industry_paths("autogarage", d, run_tag="my-run")
        paths.ensure()
        sample = _sample(2)
        leads_by_id = {e["place_id"]: _lead(e["place_id"], "Garage X", "Ede", "0",
                                            "Weg 1, 1000AA Ede", e["website"]) for e in sample}
        wap.run_pilot(paths, sample, leads_by_id, MockFetcher())
        changed = _sample(2) + [{"place_id": "extra", "website": "https://extra.nl/",
                                 "website_source": wap.GOOGLE_SUPPLIED}]
        leads_by_id["extra"] = _lead("extra", "Garage Extra", "Ede", "0", "Weg 2, 1000AB Ede",
                                     "https://extra.nl/")
        with self.assertRaises(wap.ScopeFingerprintMismatchError):
            wap.run_pilot(paths, changed, leads_by_id, MockFetcher())

    def test_resume_fails_on_changed_url(self):
        # #5
        d = tempfile.mkdtemp()
        paths = config.make_industry_paths("autogarage", d, run_tag="my-run")
        paths.ensure()
        sample = _sample(2)
        leads_by_id = {e["place_id"]: _lead(e["place_id"], "Garage X", "Ede", "0",
                                            "Weg 1, 1000AA Ede", e["website"]) for e in sample}
        wap.run_pilot(paths, sample, leads_by_id, MockFetcher())
        changed = [dict(sample[0], website="https://different-domain.nl/"), sample[1]]
        with self.assertRaises(wap.ScopeFingerprintMismatchError):
            wap.run_pilot(paths, changed, leads_by_id, MockFetcher())

    def test_resume_fails_on_changed_concurrency(self):
        # #6 (concurrency component of the config fingerprint)
        d = tempfile.mkdtemp()
        paths = config.make_industry_paths("autogarage", d, run_tag="my-run")
        paths.ensure()
        sample = _sample(2)
        leads_by_id = {e["place_id"]: _lead(e["place_id"], "Garage X", "Ede", "0",
                                            "Weg 1, 1000AA Ede", e["website"]) for e in sample}
        wap.run_pilot(paths, sample, leads_by_id, MockFetcher(), max_concurrency=1)
        with self.assertRaises(wap.ScopeFingerprintMismatchError):
            wap.run_pilot(paths, sample, leads_by_id, MockFetcher(), max_concurrency=3)

    def test_resume_fails_on_changed_page_limit(self):
        # #6 (max_pages component of the config fingerprint, exercised
        # directly since run_pilot itself doesn't parameterize it).
        d = tempfile.mkdtemp()
        paths = config.make_industry_paths("autogarage", d, run_tag="my-run")
        paths.ensure()
        sample = _sample(2)
        fp1 = wap.guard_pilot_write(paths, "my-run", sample, max_pages=4, max_concurrency=3, resume=True)
        wap.save_fingerprint(paths, fp1)
        wap.save_pilot_results(paths, {"s0": {"place_id": "s0"}, "s1": {"place_id": "s1"}})
        with self.assertRaises(wap.ScopeFingerprintMismatchError):
            wap.guard_pilot_write(paths, "my-run", sample, max_pages=5, max_concurrency=3, resume=True)

    def test_config_sha256_changes_with_model_version(self):
        # #6 (outcome/industry-relevance model-version components).
        base = wap.compute_config_sha256(4, 3)
        bumped_outcome = wap.compute_config_sha256(4, 3, outcome_model_version="different-version")
        bumped_relevance = wap.compute_config_sha256(4, 3, industry_relevance_model_version="different-version")
        self.assertNotEqual(base, bumped_outcome)
        self.assertNotEqual(base, bumped_relevance)

    def test_new_tag_without_resume_refused_if_results_exist(self):
        d = tempfile.mkdtemp()
        paths = config.make_industry_paths("autogarage", d, run_tag="my-run")
        paths.ensure()
        sample = _sample(2)
        leads_by_id = {e["place_id"]: _lead(e["place_id"], "Garage X", "Ede", "0",
                                            "Weg 1, 1000AA Ede", e["website"]) for e in sample}
        wap.run_pilot(paths, sample, leads_by_id, MockFetcher())
        with self.assertRaises(wap.RunTagImmutableError):
            wap.run_pilot(paths, sample, leads_by_id, MockFetcher(), resume=False)

    def test_no_brave_or_places_import(self):
        # #12
        import inspect
        src = inspect.getsource(wap)
        for forbidden in ("import search_provider", "BraveSearchProvider", "PlacesClient",
                         "from .search_provider", "from .places_client"):
            self.assertNotIn(forbidden, src)


class TestReservedTagBootstrapAndBackfill(unittest.TestCase):
    def test_reeval_can_create_reserved_tag_first_time(self):
        # reevaluate_pilot IS the specifically-supported operation: creating
        # the reserved dest tag for the first time (nothing exists yet) must
        # succeed, not be treated as a violation.
        d = tempfile.mkdtemp()
        source = config.make_industry_paths("autogarage", d, run_tag="audit-pilot1")
        source.ensure()
        dest = config.make_industry_paths("autogarage", d, run_tag="audit-pilot1-reeval")
        dest.ensure()
        lead = _lead("o1", "Garage Oud", "Ede", "0", "Weg 1, 1000AA Ede", "https://garageoud.nl/")
        wap.save_pilot_results(source, {"o1": {
            "place_id": "o1", "business_name": "Garage Oud", "submitted_url": "https://garageoud.nl/",
            "website_source": wap.GOOGLE_SUPPLIED, "status_code": 200, "reachable": True,
            "final_audit_classification": "C_manual_appointment_website",
            "garage_feature_score": 30, "website_quality_score": 100, "mentions_apk": True,
        }})
        report = wap.reevaluate_pilot(source, dest, {"o1": lead})
        self.assertTrue(Path(dest.audit_pilot_fingerprint_json).exists())
        # Re-running identically must succeed (idempotent resume of a now-finalized reeval).
        report2 = wap.reevaluate_pilot(source, dest, {"o1": lead})
        self.assertEqual(report["count"], report2["count"])

    def test_reeval_blocked_if_source_scope_changes_after_finalization(self):
        d = tempfile.mkdtemp()
        source = config.make_industry_paths("autogarage", d, run_tag="audit-pilot1")
        source.ensure()
        dest = config.make_industry_paths("autogarage", d, run_tag="audit-pilot1-reeval")
        dest.ensure()
        lead = _lead("o1", "Garage Oud", "Ede", "0", "Weg 1, 1000AA Ede", "https://garageoud.nl/")
        wap.save_pilot_results(source, {"o1": {
            "place_id": "o1", "business_name": "Garage Oud", "submitted_url": "https://garageoud.nl/",
            "website_source": wap.GOOGLE_SUPPLIED, "status_code": 200, "reachable": True,
            "final_audit_classification": "C_manual_appointment_website",
            "garage_feature_score": 30, "website_quality_score": 100, "mentions_apk": True,
        }})
        wap.reevaluate_pilot(source, dest, {"o1": lead})   # finalizes the reeval
        # Now the SOURCE gains an extra lead (simulating drift/tampering) —
        # a second reeval attempt must be refused, not silently re-baseline.
        stored = wap.load_pilot_results(source)
        stored["o2"] = {"place_id": "o2", "business_name": "Garage Nieuw",
                        "submitted_url": "https://garagenieuw.nl/",
                        "website_source": wap.GOOGLE_SUPPLIED, "status_code": 200, "reachable": True}
        wap.save_pilot_results(source, stored)
        lead2 = _lead("o2", "Garage Nieuw", "Ede", "0", "Weg 2, 1000AB Ede", "https://garagenieuw.nl/")
        with self.assertRaises(wap.ScopeFingerprintMismatchError):
            wap.reevaluate_pilot(source, dest, {"o1": lead, "o2": lead2})

    def test_backfill_is_idempotent_and_never_overwrites(self):
        d = tempfile.mkdtemp()
        paths = config.make_industry_paths("autogarage", d, run_tag="audit-pilot1")
        paths.ensure()
        wap.save_pilot_results(paths, {"o1": {
            "place_id": "o1", "submitted_url": "https://x.nl/", "website_source": wap.GOOGLE_SUPPLIED}})
        fp1 = wap.backfill_fingerprint_for_existing_run(paths)
        fp2 = wap.backfill_fingerprint_for_existing_run(paths)
        self.assertEqual(fp1, fp2)   # idempotent: never recomputed once set

    def test_backfill_refuses_when_no_results_exist(self):
        d = tempfile.mkdtemp()
        paths = config.make_industry_paths("autogarage", d, run_tag="audit-pilot1")
        paths.ensure()
        with self.assertRaises(wap.RunTagImmutableError):
            wap.backfill_fingerprint_for_existing_run(paths)


class TestProductionScopeBuilder(unittest.TestCase):
    """Part F #7-9, #11: exclusion-by-place_id-only production scope
    preparation, proven generically (exact real-data "3,287" count is
    verified separately against the actual repository output — see the
    2026-08-01 report — rather than hardcoded into a hermetic unit test)."""

    def _full_scope(self, n_google=60, n_disc=10):
        scope = [{"place_id": f"g{i}", "website": f"https://g{i}.nl/", "website_source": wap.GOOGLE_SUPPLIED}
                 for i in range(n_google)]
        scope += [{"place_id": f"d{i}", "website": f"https://d{i}.nl/", "website_source": wap.CONFIRMED_DISCOVERED}
                  for i in range(n_disc)]
        return scope

    def test_production_scope_excludes_exactly_the_pilot_ids(self):
        full = self._full_scope()
        pilot_ids = {f"g{i}" for i in range(5)} | {f"d{i}" for i in range(2)}
        production = wap.build_production_scope(full, pilot_ids)
        self.assertEqual(len(production), len(full) - len(pilot_ids))
        prod_ids = {e["place_id"] for e in production}
        self.assertEqual(prod_ids & pilot_ids, set())          # #8 disjoint
        self.assertEqual(prod_ids | pilot_ids, {e["place_id"] for e in full})  # #9 union == full

    def test_no_duplicate_place_ids_in_production_scope(self):
        full = self._full_scope()
        production = wap.build_production_scope(full, {"g0", "g1"})
        ids = [e["place_id"] for e in production]
        self.assertEqual(len(ids), len(set(ids)))

    def test_exclusion_by_place_id_only_not_position_or_name(self):
        # A pilot ID that appears LATE in the scope list must still be
        # excluded — proving exclusion is a set lookup, not positional.
        full = self._full_scope()
        late_id = full[-1]["place_id"]
        production = wap.build_production_scope(full, {late_id})
        self.assertNotIn(late_id, {e["place_id"] for e in production})
        self.assertEqual(len(production), len(full) - 1)

    def test_production_scope_deterministically_sorted(self):
        full = self._full_scope(n_google=5, n_disc=0)
        production = wap.build_production_scope(list(reversed(full)), set())
        self.assertEqual([e["place_id"] for e in production], sorted(e["place_id"] for e in full))


class TestCliExcludeAuditRun(unittest.TestCase):
    """Integration test for `audit --from-audit-scope --exclude-audit-run`:
    proves #10 (no pilot place_id fetched during a mock production run) and
    #11 (the excluded run's own files stay byte-identical)."""

    def _args(self, **overrides):
        base = dict(industry="autogarage", output_dir=None, run_tag=None,
                   exclude_audit_run=None, sample_google=40, sample_discovered=10,
                   max_concurrency=3, no_resume=False, dry_run=False, mock=True, timeout=1.0)
        base.update(overrides)
        return argparse.Namespace(**base)

    def _seed(self):
        d = tempfile.mkdtemp()
        paths = config.make_industry_paths("autogarage", d)
        paths.ensure()
        leads = [_lead(f"g{i}", f"Garage {i}", "Ede", "0", f"Weg {i}, 1000AA Ede",
                       f"https://g{i}.nl/") for i in range(6)]
        storage.save_leads(paths, leads)
        scope = [{"place_id": l["place_id"], "website": l["website"], "website_source": wap.GOOGLE_SUPPLIED}
                 for l in leads]
        storage.write_json_atomic(paths.audit_scope_json, {
            "generated_at": "2026-01-01T00:00:00+00:00", "audit_ready_count": len(scope), "scope": scope})
        return d, paths, leads

    def test_reserved_tag_rejected_before_any_write(self):
        d, paths, leads = self._seed()
        args = self._args(output_dir=d, run_tag="audit-pilot1")
        rc = lead_finder._cmd_audit_pilot(args)
        self.assertEqual(rc, 2)

    def test_exclude_audit_run_produces_disjoint_production_scope_mock_run(self):
        d, paths, leads = self._seed()
        # First: a small "pilot" covering 2 of the 6 leads.
        pilot_args = self._args(output_dir=d, run_tag="pilot-x", sample_google=2, sample_discovered=0)
        self.assertEqual(lead_finder._cmd_audit_pilot(pilot_args), 0)
        pilot_paths = config.make_industry_paths("autogarage", d, run_tag="pilot-x")
        pilot_ids = set(wap.load_pilot_results(pilot_paths))
        self.assertEqual(len(pilot_ids), 2)
        before = Path(pilot_paths.audit_pilot_results_json).read_bytes()

        # Then: the production run must cover EXACTLY the other 4, never the pilot's 2.
        prod_args = self._args(output_dir=d, run_tag="production-x", exclude_audit_run="pilot-x")
        self.assertEqual(lead_finder._cmd_audit_pilot(prod_args), 0)
        prod_paths = config.make_industry_paths("autogarage", d, run_tag="production-x")
        prod_results = wap.load_pilot_results(prod_paths)
        self.assertEqual(len(prod_results), 4)
        self.assertEqual(set(prod_results) & pilot_ids, set())   # #10: no pilot id fetched

        # #11: the pilot's own files are untouched by the production run.
        self.assertEqual(Path(pilot_paths.audit_pilot_results_json).read_bytes(), before)
        # The persisted tagged scope file matches the naming convention.
        self.assertTrue(Path(prod_paths.audit_scope_tagged_json).exists())
        self.assertEqual(prod_paths.audit_scope_tagged_json.name,
                         "website-audit-scope-production-x.json")

    def test_exclude_audit_run_refuses_when_exclusion_source_has_no_results(self):
        d, paths, leads = self._seed()
        args = self._args(output_dir=d, run_tag="production-x", exclude_audit_run="never-ran")
        rc = lead_finder._cmd_audit_pilot(args)
        self.assertEqual(rc, 2)


class TestCombinedAuditSummary(unittest.TestCase):
    def test_combine_precedence_reeval_over_original(self):
        original = {"a": {"place_id": "a", "final_audit_classification": "OLD"}}
        reeval = {"a": {"place_id": "a", "final_audit_classification": "NEW"}}
        production = {"b": {"place_id": "b", "final_audit_classification": "PROD"}}
        latest = wap.combine_latest_audit_records(original, reeval, production)
        self.assertEqual(latest["a"]["final_audit_classification"], "NEW")
        self.assertEqual(latest["b"]["final_audit_classification"], "PROD")
        self.assertEqual(len(latest), 2)

    def test_combined_summary_reports_remaining_and_eligible(self):
        reeval = {"a": {"place_id": "a", "outcome": wap.OUTCOME_SUCCESS,
                        "industry_relevance_status": wap.REL_AUTOMOTIVE_CONFIRMED,
                        "garage_feature_score": 50, "website_quality_score": 90,
                        "final_audit_classification": "B_basic_website"}}
        production = {}
        latest = wap.combine_latest_audit_records(reeval, production)
        summary = wap.build_combined_audit_summary(audit_ready_count=10, latest_by_id=latest)
        self.assertEqual(summary["audit_ready_total"], 10)
        self.assertEqual(summary["audited_count"], 1)
        self.assertEqual(summary["remaining_count"], 9)
        self.assertEqual(summary["score_eligible_count"], 1)

    def test_cli_audit_summary_is_read_only(self):
        d = tempfile.mkdtemp()
        paths = config.make_industry_paths("autogarage", d)
        paths.ensure()
        storage.write_json_atomic(paths.audit_scope_json, {"audit_ready_count": 5, "scope": []})
        pilot_reeval_paths = config.make_industry_paths("autogarage", d, run_tag="audit-pilot1-reeval")
        pilot_reeval_paths.ensure()
        wap.save_pilot_results(pilot_reeval_paths, {"a": {
            "place_id": "a", "outcome": wap.OUTCOME_SUCCESS,
            "industry_relevance_status": wap.REL_PROBABLY_AUTOMOTIVE,
            "garage_feature_score": 40, "website_quality_score": 80}})
        before = Path(pilot_reeval_paths.audit_pilot_results_json).read_bytes()
        args = argparse.Namespace(industry="autogarage", output_dir=d,
                                  pilot_tag="audit-pilot1-reeval", production_tag="audit-production1")
        rc = lead_finder.cmd_audit_summary(args)
        self.assertEqual(rc, 0)
        self.assertEqual(Path(pilot_reeval_paths.audit_pilot_results_json).read_bytes(), before)


if __name__ == "__main__":
    unittest.main()
