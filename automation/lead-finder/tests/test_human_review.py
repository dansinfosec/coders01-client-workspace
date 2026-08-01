"""Tests for leadfinder/human_review.py — offline human-review decision
storage, reproducible export, and first-call-batch generation.

No Brave, no Google Places, no HTTP fetch anywhere in this module.
"""

import csv
import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from leadfinder import config, storage  # noqa: E402
from leadfinder import human_review as hr  # noqa: E402
from leadfinder import website_audit_pilot as wap  # noqa: E402


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


SAMPLE_CSV_COLUMNS = ["place_id", "business_name", "city", "phone", "submitted_url", "final_url",
                     "website_source", "final_audit_classification", "garage_feature_score",
                     "website_quality_score", "identity_confidence", "identity_evidence",
                     "industry_relevance_status", "detected_services", "appointment_booking",
                     "vehicle_lookup", "whatsapp", "contact_form", "audit_warnings",
                     "human_business_identity_correct", "human_is_real_autogarage",
                     "human_sales_opportunity_valid", "human_phone_usable", "human_website_assessment",
                     "human_verdict", "human_notes", "reviewed_at"]


class _Base(unittest.TestCase):
    def _seed(self, n=100):
        d = tempfile.mkdtemp()
        base = config.make_industry_paths("autogarage", d)
        base.ensure()
        leads = [_lead(f"p{i}") for i in range(n)]
        storage.save_leads(base, leads)

        reeval = config.make_industry_paths("autogarage", d, run_tag="audit-pilot1-reeval")
        reeval.ensure()
        records = {f"p{i}": _record(f"p{i}") for i in range(n)}
        wap.save_pilot_results(reeval, records)

        rows = []
        for i in range(n):
            rows.append({
                "place_id": f"p{i}", "business_name": "Garage X", "city": "Ede",
                "phone": "020 000 0000", "submitted_url": f"https://p{i}.nl/",
                "final_url": f"https://p{i}.nl/", "website_source": "google_supplied",
                "final_audit_classification": "B_basic_website", "garage_feature_score": "50",
                "website_quality_score": "90", "identity_confidence": "high",
                "identity_evidence": "phone_match", "industry_relevance_status": "automotive_confirmed",
                "detected_services": "apk", "appointment_booking": "none", "vehicle_lookup": "none",
                "whatsapp": "False", "contact_form": "False", "audit_warnings": "",
                "human_business_identity_correct": "", "human_is_real_autogarage": "",
                "human_sales_opportunity_valid": "", "human_phone_usable": "",
                "human_website_assessment": "", "human_verdict": "", "human_notes": "", "reviewed_at": "",
            })
        with open(base.output / "sales-ready-validation-human-review.csv", "w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=SAMPLE_CSV_COLUMNS)
            w.writeheader()
            w.writerows(rows)
        return d, base


class TestLoadSample(_Base):
    def test_loading_all_100_sample_rows(self):
        d, base = self._seed(100)
        rows = hr.load_sample_rows("autogarage", d)
        self.assertEqual(len(rows), 100)
        self.assertEqual({r["place_id"] for r in rows}, {f"p{i}" for i in range(100)})


class TestSaveDecision(_Base):
    def test_saving_a_decision_by_place_id(self):
        d, base = self._seed(5)
        paths = config.make_industry_paths("autogarage", d)
        decision = hr.save_decision(paths, "p0", {"verdict": "approve", "business_identity_correct": "yes"})
        self.assertEqual(decision["verdict"], "approve")
        self.assertEqual(decision["business_identity_correct"], "yes")
        self.assertIn("reviewed_at", decision)
        self.assertIn("updated_at", decision)
        reloaded = hr.load_decisions(paths)
        self.assertIn("p0", reloaded)
        self.assertEqual(reloaded["p0"]["verdict"], "approve")

    def test_updating_existing_decision_without_duplication(self):
        d, base = self._seed(5)
        paths = config.make_industry_paths("autogarage", d)
        first = hr.save_decision(paths, "p0", {"verdict": "manual_review"})
        second = hr.save_decision(paths, "p0", {"verdict": "approve", "notes": "looks fine"})
        decisions = hr.load_decisions(paths)
        self.assertEqual(len(decisions), 1)
        self.assertEqual(decisions["p0"]["verdict"], "approve")
        self.assertEqual(decisions["p0"]["notes"], "looks fine")
        self.assertEqual(decisions["p0"]["reviewed_at"], first["reviewed_at"])  # preserved, not reset
        self.assertNotEqual(decisions["p0"].get("updated_at"), first.get("updated_at"))

    def test_saving_multiple_decisions_preserves_all(self):
        d, base = self._seed(5)
        paths = config.make_industry_paths("autogarage", d)
        hr.save_decision(paths, "p0", {"verdict": "approve"})
        hr.save_decision(paths, "p1", {"verdict": "reject"})
        hr.save_decision(paths, "p2", {"verdict": "manual_review"})
        decisions = hr.load_decisions(paths)
        self.assertEqual(len(decisions), 3)
        self.assertEqual(decisions["p0"]["verdict"], "approve")
        self.assertEqual(decisions["p1"]["verdict"], "reject")
        self.assertEqual(decisions["p2"]["verdict"], "manual_review")

    def test_invalid_verdict_rejected(self):
        d, base = self._seed(5)
        paths = config.make_industry_paths("autogarage", d)
        with self.assertRaises(ValueError):
            hr.save_decision(paths, "p0", {"verdict": "banana"})

    def test_invalid_tristate_rejected(self):
        d, base = self._seed(5)
        paths = config.make_industry_paths("autogarage", d)
        with self.assertRaises(ValueError):
            hr.save_decision(paths, "p0", {"real_autogarage": "maybe"})

    def test_unknown_field_rejected(self):
        d, base = self._seed(5)
        paths = config.make_industry_paths("autogarage", d)
        with self.assertRaises(ValueError):
            hr.save_decision(paths, "p0", {"not_a_real_field": "x"})

    def test_atomic_write_leaves_no_tmp_file_and_valid_json(self):
        d, base = self._seed(5)
        paths = config.make_industry_paths("autogarage", d)
        hr.save_decision(paths, "p0", {"verdict": "approve"})
        tmp_path = paths.human_review_decisions_json.with_suffix(".json.tmp")
        self.assertFalse(tmp_path.exists())
        # file must parse as valid JSON (no partial/corrupt write)
        with open(paths.human_review_decisions_json, encoding="utf-8") as f:
            data = json.load(f)
        self.assertIn("decisions", data)

    def test_restart_preserves_all_previous_decisions(self):
        d, base = self._seed(5)
        paths = config.make_industry_paths("autogarage", d)
        hr.save_decision(paths, "p0", {"verdict": "approve"})
        hr.save_decision(paths, "p1", {"verdict": "reject"})
        # Simulate a restart: fresh Paths object, fresh load — no in-memory state carried over.
        fresh_paths = config.make_industry_paths("autogarage", d)
        decisions = hr.load_decisions(fresh_paths)
        self.assertEqual(len(decisions), 2)
        self.assertEqual(decisions["p0"]["verdict"], "approve")
        self.assertEqual(decisions["p1"]["verdict"], "reject")

    def test_fingerprint_recorded_when_record_given(self):
        d, base = self._seed(5)
        paths = config.make_industry_paths("autogarage", d)
        record = _record("p0")
        decision = hr.save_decision(paths, "p0", {"verdict": "approve"}, record=record, source_run="audit-pilot1-reeval")
        self.assertEqual(decision["source_record_fingerprint"], hr.compute_record_fingerprint(record))
        self.assertEqual(decision["source_audit_run"], "audit-pilot1-reeval")


class TestExportCompletedReview(_Base):
    def test_export_combines_sample_and_decisions(self):
        d, base = self._seed(10)
        paths = config.make_industry_paths("autogarage", d)
        hr.save_decision(paths, "p0", {"verdict": "approve", "business_identity_correct": "yes"})
        report = hr.export_completed_review_csv("autogarage", d)
        self.assertEqual(report["total"], 10)
        self.assertEqual(report["reviewed"], 1)
        self.assertEqual(report["remaining"], 9)
        with open(paths.human_review_completed_csv, encoding="utf-8") as f:
            rows = list(csv.DictReader(f))
        self.assertEqual(len(rows), 10)
        p0 = next(r for r in rows if r["place_id"] == "p0")
        self.assertEqual(p0["decision_verdict"], "approve")
        self.assertEqual(p0["decision_business_identity_correct"], "yes")

    def test_original_sample_csv_remains_unchanged(self):
        d, base = self._seed(10)
        paths = config.make_industry_paths("autogarage", d)
        original_path = base.output / "sales-ready-validation-human-review.csv"
        before = original_path.read_bytes()
        hr.save_decision(paths, "p0", {"verdict": "approve"})
        hr.export_completed_review_csv("autogarage", d)
        after = original_path.read_bytes()
        self.assertEqual(before, after)

    def test_export_is_idempotent(self):
        d, base = self._seed(10)
        paths = config.make_industry_paths("autogarage", d)
        hr.save_decision(paths, "p0", {"verdict": "approve"})
        hr.export_completed_review_csv("autogarage", d)
        before = paths.human_review_completed_csv.read_bytes()
        hr.export_completed_review_csv("autogarage", d)
        after = paths.human_review_completed_csv.read_bytes()
        self.assertEqual(before, after)

    def test_formula_injection_protected_in_export(self):
        d, base = self._seed(3)
        paths = config.make_industry_paths("autogarage", d)
        hr.save_decision(paths, "p0", {"verdict": "approve", "notes": "=cmd|'/c calc'!A1"})
        hr.export_completed_review_csv("autogarage", d)
        with open(paths.human_review_completed_csv, encoding="utf-8") as f:
            rows = list(csv.DictReader(f))
        p0 = next(r for r in rows if r["place_id"] == "p0")
        self.assertTrue(p0["decision_notes"].startswith("'="))

    def test_csv_safe_neutralizes_all_formula_prefixes(self):
        for bad in ("=SUM(A1)", "+1+1", "-2+3", "@SUM(1)", "\ttab", "\rcr"):
            safe = hr.csv_safe(bad)
            self.assertTrue(safe.startswith("'"), f"{bad!r} not neutralized: {safe!r}")
        self.assertEqual(hr.csv_safe("Normal Garage Name"), "Normal Garage Name")
        self.assertEqual(hr.csv_safe(None), "")


class TestFirstCallBatch(_Base):
    def _approve_all(self, paths, ids):
        for pid in ids:
            hr.save_decision(paths, pid, {
                "verdict": "approve", "business_identity_correct": "yes",
                "real_autogarage": "yes", "valid_sales_opportunity": "yes", "phone_usable": "yes",
            })

    def test_only_strict_approve_enters_batch(self):
        d, base = self._seed(10)
        paths = config.make_industry_paths("autogarage", d)
        self._approve_all(paths, ["p0", "p1"])
        hr.save_decision(paths, "p2", {"verdict": "reject", "business_identity_correct": "yes",
                                       "real_autogarage": "yes", "valid_sales_opportunity": "yes",
                                       "phone_usable": "yes"})
        report = hr.build_first_call_batch("autogarage", d, max_n=50)
        self.assertEqual(report["count"], 2)
        with open(base.output / "approved-first-call-batch.csv", encoding="utf-8") as f:
            ids = {r["place_id"] for r in csv.DictReader(f)}
        self.assertEqual(ids, {"p0", "p1"})

    def test_rejected_never_enters_batch(self):
        d, base = self._seed(5)
        paths = config.make_industry_paths("autogarage", d)
        hr.save_decision(paths, "p0", {"verdict": "reject", "business_identity_correct": "yes",
                                       "real_autogarage": "yes", "valid_sales_opportunity": "yes",
                                       "phone_usable": "yes"})
        report = hr.build_first_call_batch("autogarage", d)
        self.assertEqual(report["count"], 0)

    def test_manual_review_never_enters_batch(self):
        d, base = self._seed(5)
        paths = config.make_industry_paths("autogarage", d)
        hr.save_decision(paths, "p0", {"verdict": "manual_review", "business_identity_correct": "yes",
                                       "real_autogarage": "yes", "valid_sales_opportunity": "yes",
                                       "phone_usable": "yes"})
        report = hr.build_first_call_batch("autogarage", d)
        self.assertEqual(report["count"], 0)

    def test_partial_tristate_excludes_from_batch(self):
        d, base = self._seed(5)
        paths = config.make_industry_paths("autogarage", d)
        hr.save_decision(paths, "p0", {"verdict": "approve", "business_identity_correct": "yes",
                                       "real_autogarage": "unsure", "valid_sales_opportunity": "yes",
                                       "phone_usable": "yes"})
        report = hr.build_first_call_batch("autogarage", d)
        self.assertEqual(report["count"], 0)

    def test_batch_capped_at_max_n(self):
        d, base = self._seed(80)
        paths = config.make_industry_paths("autogarage", d)
        self._approve_all(paths, [f"p{i}" for i in range(80)])
        report = hr.build_first_call_batch("autogarage", d, max_n=50)
        self.assertEqual(report["count"], 50)
        self.assertEqual(report["eligible_total"], 80)

    def test_no_duplicate_place_ids_in_batch(self):
        d, base = self._seed(20)
        paths = config.make_industry_paths("autogarage", d)
        self._approve_all(paths, [f"p{i}" for i in range(20)])
        # Re-approve some again (simulating repeated saves) — must not duplicate.
        self._approve_all(paths, ["p0", "p1", "p2"])
        report = hr.build_first_call_batch("autogarage", d, max_n=50)
        with open(base.output / "approved-first-call-batch.csv", encoding="utf-8") as f:
            ids = [r["place_id"] for r in csv.DictReader(f)]
        self.assertEqual(len(ids), len(set(ids)))

    def test_first_call_batch_makes_no_network_import(self):
        import inspect
        src = inspect.getsource(hr)
        for forbidden in ("import requests", "BraveSearchProvider", "PlacesClient",
                         "from .search_provider", "from .places_client"):
            self.assertNotIn(forbidden, src)


if __name__ == "__main__":
    unittest.main()
