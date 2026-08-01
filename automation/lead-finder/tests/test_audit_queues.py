"""Tests for leadfinder/audit_queues.py — the reproducible, fully OFFLINE
garage-outreach queue generator (supersedes the one-off build_queues.py).

No Brave, no Google Places, no HTTP fetch anywhere in this module — every
test operates purely over synthetic stored records and a synthetic
leads.json.
"""

import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from leadfinder import config, storage  # noqa: E402
from leadfinder import audit_queues as aq  # noqa: E402
from leadfinder import website_audit_pilot as wap  # noqa: E402
import lead_finder  # noqa: E402


def _lead(pid, name="Garage X", city="Ede", phone="020 000 0000"):
    return {"place_id": pid, "business_name": name, "city": city, "phone": phone,
            "address": "Weg 1, 1000AA Ede", "website": f"https://{pid}.nl/"}


def _record(pid, **overrides):
    base = {
        "place_id": pid, "business_name": "Garage X", "city": "Ede",
        "website_source": wap.GOOGLE_SUPPLIED, "submitted_url": f"https://{pid}.nl/",
        "final_url": f"https://{pid}.nl/", "outcome": wap.OUTCOME_SUCCESS, "reachable": True,
        "industry_relevance_status": wap.REL_AUTOMOTIVE_CONFIRMED,
        "excluded_from_automatic_garage_outreach": False,
        "identity_confidence": "high", "identity_match_outcome": "match",
        "manual_review_required": False, "external_redirect": False,
        "final_audit_classification": "B_basic_website",
        "garage_feature_score": 50, "website_quality_score": 90,
    }
    base.update(overrides)
    return base


class TestEvaluateOutreachSafety(unittest.TestCase):
    def test_fully_safe_record_has_no_violations(self):
        r = _record("p1")
        self.assertEqual(aq.evaluate_outreach_safety(r, _lead("p1")), [])
        self.assertTrue(aq.is_outreach_safe(r, _lead("p1")))

    def test_non_success_outcome_violates(self):
        r = _record("p2", outcome=wap.OUTCOME_PAGE_NOT_FOUND, reachable=False)
        self.assertIn("outcome_not_success", aq.evaluate_outreach_safety(r, _lead("p2")))

    def test_manual_review_required_violates(self):
        r = _record("p3", manual_review_required=True)
        self.assertIn("manual_review_required", aq.evaluate_outreach_safety(r, _lead("p3")))

    def test_external_redirect_violates(self):
        r = _record("p4", external_redirect=True)
        self.assertIn("external_redirect", aq.evaluate_outreach_safety(r, _lead("p4")))

    def test_identity_conflict_violates(self):
        r = _record("p5", identity_match_outcome="conflict", identity_confidence="conflict")
        self.assertIn("identity_conflict", aq.evaluate_outreach_safety(r, _lead("p5")))

    def test_suspected_wrong_industry_violates(self):
        r = _record("p6", industry_relevance_status=wap.REL_SUSPECTED_WRONG)
        self.assertIn("industry_relevance_not_automotive", aq.evaluate_outreach_safety(r, _lead("p6")))

    def test_insufficient_evidence_violates(self):
        r = _record("p7", industry_relevance_status=wap.REL_INSUFFICIENT)
        self.assertIn("industry_relevance_not_automotive", aq.evaluate_outreach_safety(r, _lead("p7")))

    def test_missing_phone_violates(self):
        r = _record("p8")
        lead = _lead("p8", phone="")
        self.assertIn("missing_business_phone", aq.evaluate_outreach_safety(r, lead))

    def test_missing_final_url_violates(self):
        r = _record("p9", final_url=None)
        self.assertIn("missing_final_url", aq.evaluate_outreach_safety(r, _lead("p9")))

    def test_weak_identity_confidence_violates(self):
        r = _record("p10", identity_confidence="low")
        self.assertIn("weak_identity_confidence", aq.evaluate_outreach_safety(r, _lead("p10")))


class TestBuildSalesQueues(unittest.TestCase):
    def test_bc_enters_priority_when_safe(self):
        latest = {"b1": _record("b1", final_audit_classification="B_basic_website"),
                  "c1": _record("c1", final_audit_classification="C_manual_appointment_website")}
        leads = {pid: _lead(pid) for pid in latest}
        result = aq.build_sales_queues(latest, leads)
        priority_ids = {pid for pid, _ in result["priority"]}
        self.assertEqual(priority_ids, {"b1", "c1"})
        self.assertEqual(result["secondary"], [])
        self.assertEqual(result["do_not_contact"], [])

    def test_d_enters_secondary_when_safe(self):
        latest = {"d1": _record("d1", final_audit_classification="D_booking_without_vehicle_lookup")}
        leads = {"d1": _lead("d1")}
        result = aq.build_sales_queues(latest, leads)
        self.assertEqual({pid for pid, _ in result["secondary"]}, {"d1"})
        self.assertEqual(result["priority"], [])

    def test_e_advanced_excluded_from_sales_targeting(self):
        latest = {"e1": _record("e1", final_audit_classification="E_advanced_garage_website")}
        leads = {"e1": _lead("e1")}
        result = aq.build_sales_queues(latest, leads)
        self.assertEqual(result["priority"], [])
        self.assertEqual(result["secondary"], [])
        contact_ids = {pid for pid, _ in result["do_not_contact"]}
        self.assertEqual(contact_ids, {"e1"})
        self.assertIn("advanced_website", result["reasons_by_id"]["e1"])

    def test_manual_review_required_cannot_enter_sales_queues(self):
        latest = {"m1": _record("m1", manual_review_required=True)}
        leads = {"m1": _lead("m1")}
        result = aq.build_sales_queues(latest, leads)
        self.assertEqual(result["priority"] + result["secondary"], [])
        self.assertEqual({pid for pid, _ in result["do_not_contact"]}, {"m1"})

    def test_external_redirect_cannot_enter_sales_queues(self):
        latest = {"x1": _record("x1", external_redirect=True)}
        leads = {"x1": _lead("x1")}
        result = aq.build_sales_queues(latest, leads)
        self.assertEqual(result["priority"] + result["secondary"], [])

    def test_identity_conflict_cannot_enter_sales_queues(self):
        latest = {"i1": _record("i1", identity_match_outcome="conflict", identity_confidence="conflict")}
        leads = {"i1": _lead("i1")}
        result = aq.build_sales_queues(latest, leads)
        self.assertEqual(result["priority"] + result["secondary"], [])
        self.assertIn("identity_conflict", result["reasons_by_id"]["i1"])

    def test_suspected_wrong_industry_cannot_enter_sales_queues(self):
        latest = {"w1": _record("w1", industry_relevance_status=wap.REL_SUSPECTED_WRONG)}
        leads = {"w1": _lead("w1")}
        result = aq.build_sales_queues(latest, leads)
        self.assertEqual(result["priority"] + result["secondary"], [])
        self.assertIn("suspected_wrong_industry", result["reasons_by_id"]["w1"])

    def test_insufficient_evidence_cannot_enter_sales_queues(self):
        latest = {"n1": _record("n1", industry_relevance_status=wap.REL_INSUFFICIENT)}
        leads = {"n1": _lead("n1")}
        result = aq.build_sales_queues(latest, leads)
        self.assertEqual(result["priority"] + result["secondary"], [])
        self.assertIn("insufficient_industry_evidence", result["reasons_by_id"]["n1"])

    def test_non_success_outcomes_cannot_enter_sales_queues(self):
        for outcome in (wap.OUTCOME_PAGE_NOT_FOUND, wap.OUTCOME_ACCESS_BLOCKED, wap.OUTCOME_SERVER_ERROR,
                       wap.OUTCOME_DNS_FAILURE, wap.OUTCOME_TLS_FAILURE, wap.OUTCOME_TIMEOUT,
                       wap.OUTCOME_CONNECTION_FAILURE):
            pid = f"o_{outcome}"
            latest = {pid: _record(pid, outcome=outcome, reachable=False,
                                   final_audit_classification=outcome)}
            leads = {pid: _lead(pid)}
            result = aq.build_sales_queues(latest, leads)
            self.assertEqual(result["priority"] + result["secondary"], [],
                             f"outcome {outcome} must never enter a sales queue")

    def test_place_ids_remain_unique_across_queues(self):
        latest = {}
        for i in range(5):
            latest[f"u{i}"] = _record(f"u{i}", final_audit_classification="B_basic_website")
        leads = {pid: _lead(pid) for pid in latest}
        result = aq.build_sales_queues(latest, leads)
        all_ids = ([pid for pid, _ in result["priority"]] + [pid for pid, _ in result["secondary"]]
                  + [pid for pid, _ in result["do_not_contact"]])
        self.assertEqual(len(all_ids), len(set(all_ids)))
        self.assertEqual(len(all_ids), 5)


class TestQueueOverlapDetection(unittest.TestCase):
    def test_forbidden_overlap_raises(self):
        with self.assertRaises(aq.QueueOverlapError):
            aq.check_disjoint_or_raise({"priority": {"p1", "p2"}, "secondary": {"p2", "p3"}})

    def test_disjoint_sets_pass(self):
        overlaps = aq.check_disjoint_or_raise({"priority": {"p1"}, "secondary": {"p2"}, "do_not_contact": {"p3"}})
        self.assertTrue(all(v == [] for v in overlaps.values()))


class TestValidationSample(unittest.TestCase):
    def test_sample_capped_at_n_no_duplicates(self):
        priority = []
        leads = {}
        for i in range(150):
            pid = f"s{i}"
            cls = "B_basic_website" if i % 2 == 0 else "C_manual_appointment_website"
            score = [20, 40, 70][i % 3]
            r = _record(pid, final_audit_classification=cls, garage_feature_score=score)
            priority.append((pid, r))
            leads[pid] = _lead(pid, city=f"City{i % 10}")
        sample = aq.build_validation_sample(priority, leads, n=100)
        ids = [pid for pid, _ in sample]
        self.assertEqual(len(sample), 100)
        self.assertEqual(len(ids), len(set(ids)))

    def test_sample_spans_both_classifications_and_score_bands(self):
        priority = []
        leads = {}
        for i in range(60):
            pid = f"t{i}"
            cls = "B_basic_website" if i % 2 == 0 else "C_manual_appointment_website"
            score = [20, 40, 70][i % 3]
            r = _record(pid, final_audit_classification=cls, garage_feature_score=score)
            priority.append((pid, r))
            leads[pid] = _lead(pid, city=f"City{i % 15}")
        sample = aq.build_validation_sample(priority, leads, n=30)
        classes = {r.get("final_audit_classification") for _, r in sample}
        self.assertEqual(classes, {"B_basic_website", "C_manual_appointment_website"})

    def test_sample_never_fetches_anything(self):
        import inspect
        src = inspect.getsource(aq)
        self.assertNotIn("requests.", src)
        self.assertNotIn("fetcher.fetch", src)


class TestIdempotency(unittest.TestCase):
    def _seed(self):
        d = tempfile.mkdtemp()
        base = config.make_industry_paths("autogarage", d)
        base.ensure()
        leads = [_lead("g1", city="Ede"), _lead("g2", city="Haarlem")]
        storage.save_leads(base, leads)
        reeval_paths = config.make_industry_paths("autogarage", d, run_tag="audit-pilot1-reeval")
        reeval_paths.ensure()
        wap.save_pilot_results(reeval_paths, {"g1": _record("g1", final_audit_classification="B_basic_website")})
        prod_paths = config.make_industry_paths("autogarage", d, run_tag="audit-production1")
        prod_paths.ensure()
        wap.save_pilot_results(prod_paths, {"g2": _record("g2", final_audit_classification="D_booking_without_vehicle_lookup")})
        return d

    def test_generation_is_idempotent(self):
        d = self._seed()
        report1 = aq.generate_all_queues("autogarage", d)
        out_dir = config.make_industry_paths("autogarage", d).output
        before = {name: (out_dir / name).read_bytes() for name in report1["counts"]}
        report2 = aq.generate_all_queues("autogarage", d)
        after = {name: (out_dir / name).read_bytes() for name in report2["counts"]}
        self.assertEqual(report1["counts"], report2["counts"])
        for name in before:
            self.assertEqual(before[name], after[name], f"{name} changed between identical runs")

    def test_generate_all_queues_makes_no_network_import(self):
        import inspect
        src = inspect.getsource(aq)
        for forbidden in ("import requests", "BraveSearchProvider", "PlacesClient",
                         "from .search_provider", "from .places_client"):
            self.assertNotIn(forbidden, src)

    def test_cli_command_runs_offline_and_reports_zero_overlap(self):
        d = self._seed()
        args = __import__("argparse").Namespace(industry="autogarage", output_dir=d)
        rc = lead_finder.cmd_audit_export_queues(args)
        self.assertEqual(rc, 0)
        out_dir = config.make_industry_paths("autogarage", d).output
        self.assertTrue((out_dir / "sales-ready-priority.csv").exists())
        self.assertTrue((out_dir / "do-not-auto-contact.csv").exists())


if __name__ == "__main__":
    unittest.main()
