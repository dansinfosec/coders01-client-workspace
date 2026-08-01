"""End-to-end tests for the garage audit extension: audit_lead(garage_features)
through to storage CSV rows, and the CLI --industry autogarage auto-detection.
No network — the MockFetcher + mockdata garage fixtures exercise the full path.
"""

import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from leadfinder.audit import audit_lead, MockFetcher  # noqa: E402
from leadfinder import storage, config  # noqa: E402
from leadfinder.garage_messages import evaluate_lead  # noqa: E402
import lead_finder  # noqa: E402

BASIC_LEAD = {"place_id": "g1", "business_name": "Garage Klaassen",
             "website": "https://garageklaassen.nl", "industry": "autogarage"}
ADVANCED_LEAD = {"place_id": "g2", "business_name": "Moderne Garage",
                 "website": "https://modernegarage.nl", "industry": "autogarage"}
NO_WEBSITE_LEAD = {"place_id": "g3", "business_name": "Garage Zonder Site",
                   "industry": "autogarage"}


class TestAuditLeadGarageFeatures(unittest.TestCase):
    def test_garage_features_off_by_default_no_new_keys(self):
        audit = audit_lead(BASIC_LEAD, MockFetcher())
        self.assertNotIn("has_basic_contact_form", audit)
        self.assertNotIn("can_enter_license_plate", audit)

    def test_basic_garage_site_flat_keys(self):
        audit = audit_lead(BASIC_LEAD, MockFetcher(), garage_features=True)
        self.assertTrue(audit["has_basic_contact_form"])
        self.assertFalse(audit["has_real_booking_calendar"])
        self.assertFalse(audit["can_enter_license_plate"])
        self.assertFalse(audit["has_rdw_or_vehicle_data_integration"])

    def test_advanced_garage_site_flat_keys(self):
        audit = audit_lead(ADVANCED_LEAD, MockFetcher(), garage_features=True)
        self.assertTrue(audit["has_real_booking_calendar"])
        self.assertTrue(audit["can_select_service"])
        self.assertTrue(audit["can_select_available_time_slot"])
        self.assertTrue(audit["can_enter_license_plate"])
        self.assertTrue(audit["has_vehicle_lookup_result"])
        self.assertTrue(audit["has_rdw_or_vehicle_data_integration"])
        self.assertFalse(audit["has_basic_contact_form"])

    def test_no_website_still_gets_flat_false_defaults(self):
        audit = audit_lead(NO_WEBSITE_LEAD, MockFetcher(), garage_features=True)
        self.assertFalse(audit["has_website"])
        self.assertFalse(audit["has_basic_contact_form"])
        self.assertFalse(audit["can_enter_license_plate"])
        self.assertIn("booking_evidence", audit)
        self.assertEqual(audit["booking_evidence"], [])

    def test_unreachable_site_gets_flat_false_defaults(self):
        lead = {"place_id": "g4", "business_name": "Onbereikbaar",
                "website": "https://stadendak.nl", "industry": "autogarage"}
        audit = audit_lead(lead, MockFetcher(), garage_features=True)
        self.assertFalse(audit["reachable"])
        self.assertFalse(audit["has_basic_contact_form"])
        self.assertFalse(audit["can_enter_license_plate"])


class TestEndToEndScoringAndClassification(unittest.TestCase):
    def test_basic_site_classified_and_scored(self):
        audit = audit_lead(BASIC_LEAD, MockFetcher(), garage_features=True)
        result = evaluate_lead(audit)
        self.assertEqual(result["website_opportunity_category"], "B_basic_website")
        self.assertGreater(result["score"], 0)
        self.assertIsNotNone(result["sales_reason"])
        self.assertIsNotNone(result["recommended_opening_line"])

    def test_advanced_site_classified_and_scored(self):
        audit = audit_lead(ADVANCED_LEAD, MockFetcher(), garage_features=True)
        result = evaluate_lead(audit)
        self.assertEqual(result["website_opportunity_category"], "E_advanced_garage_website")
        self.assertEqual(result["score"], 0)
        self.assertIsNone(result["booking_gap_reason"])
        self.assertIsNone(result["vehicle_lookup_gap_reason"])

    def test_no_website_classified_as_category_a(self):
        audit = audit_lead(NO_WEBSITE_LEAD, MockFetcher(), garage_features=True)
        result = evaluate_lead(audit)
        self.assertEqual(result["website_opportunity_category"], "A_no_website")
        self.assertEqual(result["score"], 100)


class TestCsvRowsIncludeGarageColumns(unittest.TestCase):
    def test_garage_lead_populates_new_columns(self):
        audit = audit_lead(BASIC_LEAD, MockFetcher(), garage_features=True)
        score = evaluate_lead(audit)
        rows = storage.build_csv_rows(
            [BASIC_LEAD], {"g1": audit}, {"g1": score}, {})
        row = rows[0]
        self.assertEqual(row["website_opportunity_category"], "B_basic_website")
        self.assertEqual(row["has_basic_contact_form"], True)
        self.assertEqual(row["website_score"], row["opportunity_score"])
        self.assertIsNotNone(row["sales_reason"])

    def test_non_garage_lead_has_blank_garage_columns(self):
        lead = {"place_id": "d1", "business_name": "Dakdekker X",
                "website": "https://vandijkdakwerken.nl", "industry": "dakdekkers"}
        audit = audit_lead(lead, MockFetcher())  # garage_features=False (default)
        score = evaluate_lead(audit)
        rows = storage.build_csv_rows([lead], {"d1": audit}, {"d1": score}, {})
        row = rows[0]
        self.assertIsNone(row["website_opportunity_category"])
        self.assertIsNone(row["has_basic_contact_form"])
        self.assertIsNone(row["sales_reason"])
        # Generic scoring is completely unaffected.
        self.assertIn("opportunity_score", row)

    def test_all_csv_columns_present_in_header(self):
        for col in ("website_opportunity_category", "has_basic_contact_form",
                    "has_appointment_request_form", "has_real_booking_calendar",
                    "can_select_service", "can_select_branch", "can_select_date",
                    "can_select_available_time_slot", "can_enter_license_plate",
                    "has_vehicle_lookup_result", "has_rdw_or_vehicle_data_integration",
                    "booking_gap_reason", "vehicle_lookup_gap_reason", "website_score",
                    "sales_reason", "recommended_opening_line"):
            self.assertIn(col, storage.CSV_COLUMNS)


class TestCliAutoDetection(unittest.TestCase):
    def test_garage_features_for_autogarage_slug(self):
        self.assertTrue(lead_finder._garage_features_for("autogarage"))

    def test_garage_features_off_for_other_industries(self):
        self.assertFalse(lead_finder._garage_features_for("dakdekkers"))
        self.assertFalse(lead_finder._garage_features_for("kapper"))

    def test_forced_flag_enables_for_any_industry(self):
        self.assertTrue(lead_finder._garage_features_for("dakdekkers", forced=True))

    def test_cmd_audit_auto_enables_for_autogarage(self):
        with tempfile.TemporaryDirectory() as tmp:
            paths = config.make_industry_paths("autogarage", tmp)
            paths.ensure()
            storage.save_leads(paths, [BASIC_LEAD, ADVANCED_LEAD])
            rc = lead_finder.main([
                "--mock", "--output-dir", tmp, "audit", "--industry", "autogarage",
            ])
            self.assertEqual(rc, 0)
            audits = storage.load_audits(paths)
            self.assertTrue(all("has_basic_contact_form" in a for a in audits))
            csv_text = (Path(tmp) / "industries" / "autogarage" / "leads.csv").read_text(encoding="utf-8-sig")
            self.assertIn("website_opportunity_category", csv_text)
            self.assertIn("E_advanced_garage_website", csv_text)


if __name__ == "__main__":
    unittest.main()
