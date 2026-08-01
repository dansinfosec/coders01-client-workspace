"""Tests for garage opportunity scoring, classification and sales copy.

No network. Covers: the score_garage_audit rule ladders (proving closely
related missing features are NOT double-scored), classify_opportunity's 5
categories (A-E), the gap-reason/sales-reason/opening-line generators, and
evaluate_lead()'s auto-detection between garage and generic scoring.
"""

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from leadfinder.scoring import score_garage_audit, score_audit, MAX_SCORE  # noqa: E402
from leadfinder import garage_messages as gm  # noqa: E402

YEAR = 2026


def _healthy_technical(**overrides) -> dict:
    """Base audit with every generic technical check passing, so only the
    garage-specific rules under test can contribute points."""
    base = {
        "has_website": True, "reachable": True, "https": True,
        "mobile_viewport": True, "response_time": 0.4,
        "broken_links": 0, "broken_images": 0,
        "copyright_year": YEAR, "title": "Garage X",
        "has_visible_phone": True, "has_visible_email": True,
        # garage facts, all default to the "worst" (false) unless overridden
        "has_basic_contact_form": False,
        "has_appointment_request_form": False,
        "has_real_booking_calendar": False,
        "can_select_service": False,
        "can_select_branch": False,
        "can_select_date": False,
        "can_select_available_time_slot": False,
        "is_multi_location": False,
        "has_appointment_cta": False,
        "can_enter_license_plate": False,
        "has_vehicle_lookup_result": False,
        "has_rdw_or_vehicle_data_integration": False,
    }
    base.update(overrides)
    return base


class TestBookingLadderMutuallyExclusive(unittest.TestCase):
    """Exactly ONE of basic_contact_form_only / appointment_request_no_calendar
    / no_booking_system may fire — never two at once for the same audit."""

    def test_no_form_at_all_scores_no_booking_system(self):
        res = score_garage_audit(_healthy_technical(has_appointment_cta=True), current_year=YEAR)
        codes = {r["code"] for r in res.reasons}
        self.assertIn("no_booking_system", codes)
        self.assertNotIn("basic_contact_form_only", codes)
        self.assertNotIn("appointment_request_no_calendar", codes)

    def test_basic_form_only_fires_alone(self):
        res = score_garage_audit(
            _healthy_technical(has_basic_contact_form=True, has_appointment_cta=True),
            current_year=YEAR)
        codes = [r["code"] for r in res.reasons]
        self.assertEqual(codes.count("basic_contact_form_only"), 1)
        self.assertNotIn("no_booking_system", codes)
        self.assertNotIn("appointment_request_no_calendar", codes)

    def test_appointment_request_fires_alone(self):
        res = score_garage_audit(
            _healthy_technical(has_appointment_request_form=True, has_appointment_cta=True),
            current_year=YEAR)
        codes = [r["code"] for r in res.reasons]
        self.assertEqual(codes.count("appointment_request_no_calendar"), 1)
        self.assertNotIn("basic_contact_form_only", codes)
        self.assertNotIn("no_booking_system", codes)

    def test_real_calendar_fires_none_of_the_three(self):
        res = score_garage_audit(_healthy_technical(
            has_real_booking_calendar=True, can_select_service=True,
            can_select_available_time_slot=True, has_appointment_cta=True,
        ), current_year=YEAR)
        codes = {r["code"] for r in res.reasons}
        self.assertFalse(codes & {"basic_contact_form_only",
                                  "appointment_request_no_calendar", "no_booking_system"})


class TestBookingDetailGapsOnlyWhenBookingPresent(unittest.TestCase):
    """service/branch/time-slot gaps must NOT pile onto a bare-contact-form
    site that was never close to having them (avoids over-penalizing)."""

    def test_basic_form_site_gets_no_service_or_slot_penalty(self):
        res = score_garage_audit(
            _healthy_technical(has_basic_contact_form=True, has_appointment_cta=True),
            current_year=YEAR)
        codes = {r["code"] for r in res.reasons}
        self.assertNotIn("no_service_selection", codes)
        self.assertNotIn("no_selectable_time_slots", codes)
        # Only the ladder rule + vehicle-ladder rule should fire.
        self.assertEqual(codes, {"basic_contact_form_only", "no_kenteken_input"})

    def test_appointment_request_site_gets_detail_gaps(self):
        res = score_garage_audit(_healthy_technical(
            has_appointment_request_form=True, has_appointment_cta=True,
        ), current_year=YEAR)
        codes = {r["code"] for r in res.reasons}
        self.assertIn("no_service_selection", codes)
        self.assertIn("no_selectable_time_slots", codes)

    def test_branch_gap_only_when_multi_location(self):
        single = score_garage_audit(_healthy_technical(
            has_real_booking_calendar=True, can_select_service=True,
            can_select_available_time_slot=True, has_appointment_cta=True,
            is_multi_location=False,
        ), current_year=YEAR)
        self.assertNotIn("no_branch_selection", {r["code"] for r in single.reasons})

        multi = score_garage_audit(_healthy_technical(
            has_real_booking_calendar=True, can_select_service=True,
            can_select_available_time_slot=True, has_appointment_cta=True,
            is_multi_location=True, can_select_branch=False,
        ), current_year=YEAR)
        self.assertIn("no_branch_selection", {r["code"] for r in multi.reasons})


class TestVehicleLadderMutuallyExclusive(unittest.TestCase):
    def test_no_plate_fires_alone(self):
        res = score_garage_audit(_healthy_technical(has_appointment_cta=True), current_year=YEAR)
        codes = [r["code"] for r in res.reasons]
        self.assertEqual(codes.count("no_kenteken_input"), 1)
        self.assertNotIn("kenteken_no_lookup_result", codes)
        self.assertNotIn("no_verified_vehicle_integration", codes)

    def test_plate_without_result_fires_alone(self):
        res = score_garage_audit(_healthy_technical(
            can_enter_license_plate=True, has_appointment_cta=True,
        ), current_year=YEAR)
        codes = [r["code"] for r in res.reasons]
        self.assertEqual(codes.count("kenteken_no_lookup_result"), 1)
        self.assertNotIn("no_kenteken_input", codes)
        self.assertNotIn("no_verified_vehicle_integration", codes)

    def test_full_integration_fires_none(self):
        res = score_garage_audit(_healthy_technical(
            has_real_booking_calendar=True, can_select_service=True,
            can_select_available_time_slot=True, has_appointment_cta=True,
            can_enter_license_plate=True, has_vehicle_lookup_result=True,
            has_rdw_or_vehicle_data_integration=True,
        ), current_year=YEAR)
        codes = {r["code"] for r in res.reasons}
        self.assertFalse(codes & {"no_kenteken_input", "kenteken_no_lookup_result",
                                  "no_verified_vehicle_integration"})


class TestFullyAdvancedSiteScoresZero(unittest.TestCase):
    def test_advanced_garage_site_scores_zero(self):
        res = score_garage_audit(_healthy_technical(
            has_real_booking_calendar=True, can_select_service=True,
            can_select_available_time_slot=True, can_select_date=True,
            has_appointment_cta=True, can_enter_license_plate=True,
            has_vehicle_lookup_result=True, has_rdw_or_vehicle_data_integration=True,
        ), current_year=YEAR)
        self.assertEqual(res.score, 0)
        self.assertEqual(res.reasons, [])


class TestGarageScoreCappedAndDelegatesTechnicalChecks(unittest.TestCase):
    def test_no_website_short_circuits(self):
        res = score_garage_audit({"has_website": False}, current_year=YEAR)
        self.assertEqual(res.score, MAX_SCORE)
        self.assertEqual(res.reasons[0]["code"], "no_website")

    def test_unreachable_short_circuits(self):
        res = score_garage_audit({"has_website": True, "reachable": False,
                                  "unreachable_reason": "timeout"}, current_year=YEAR)
        self.assertEqual(res.score, 40)

    def test_generic_score_audit_unaffected_by_garage_module(self):
        # score_audit must produce EXACTLY the same result as before this feature.
        res = score_audit({
            "has_website": True, "reachable": True, "https": False,
            "mobile_viewport": True, "response_time": 1,
            "has_contact_form": True, "has_cta": True,
            "broken_links": 0, "broken_images": 0,
            "copyright_year": YEAR, "title": "X",
            "has_visible_phone": True, "has_visible_email": True,
        }, current_year=YEAR)
        self.assertEqual([r["code"] for r in res.reasons], ["no_https"])


class TestClassifyOpportunity(unittest.TestCase):
    def test_no_website(self):
        self.assertEqual(gm.classify_opportunity({"has_website": False}),
                         gm.CATEGORY_NO_WEBSITE)

    def test_basic_website(self):
        self.assertEqual(gm.classify_opportunity({
            "has_website": True, "has_basic_contact_form": True,
        }), gm.CATEGORY_BASIC_WEBSITE)

    def test_manual_appointment(self):
        self.assertEqual(gm.classify_opportunity({
            "has_website": True, "has_appointment_request_form": True,
            "has_real_booking_calendar": False,
        }), gm.CATEGORY_MANUAL_APPOINTMENT)

    def test_booking_without_vehicle_lookup(self):
        self.assertEqual(gm.classify_opportunity({
            "has_website": True, "has_real_booking_calendar": True,
            "has_rdw_or_vehicle_data_integration": False,
        }), gm.CATEGORY_BOOKING_NO_VEHICLE_LOOKUP)

    def test_advanced(self):
        self.assertEqual(gm.classify_opportunity({
            "has_website": True, "has_real_booking_calendar": True,
            "has_rdw_or_vehicle_data_integration": True,
        }), gm.CATEGORY_ADVANCED)


class TestGapReasonsAndSalesCopy(unittest.TestCase):
    def test_booking_gap_reason_none_when_real_calendar(self):
        self.assertIsNone(gm.booking_gap_reason({"has_real_booking_calendar": True}))

    def test_booking_gap_reason_matches_ladder(self):
        self.assertIn("handmatig", gm.booking_gap_reason({"has_basic_contact_form": True}))
        self.assertIn("beschikbare tijden",
                      gm.booking_gap_reason({"has_appointment_request_form": True}))
        self.assertIn("vestiging, datum en tijdstip", gm.booking_gap_reason({}))

    def test_vehicle_gap_reason_none_when_integration(self):
        self.assertIsNone(gm.vehicle_lookup_gap_reason(
            {"has_rdw_or_vehicle_data_integration": True}))

    def test_vehicle_gap_reason_matches_ladder(self):
        self.assertIn("automatisch worden ingevuld",
                      gm.vehicle_lookup_gap_reason({"can_enter_license_plate": False}))
        self.assertIn("geen voertuiggegevens op", gm.vehicle_lookup_gap_reason(
            {"can_enter_license_plate": True, "has_vehicle_lookup_result": False}))

    def test_branch_gap_only_for_multi_location(self):
        self.assertIsNone(gm.branch_gap_reason({"is_multi_location": False}))
        reason = gm.branch_gap_reason({"is_multi_location": True, "can_select_branch": False})
        self.assertIn("vestiging kiezen", reason)

    def test_sales_reason_combines_gaps(self):
        audit = {"has_basic_contact_form": True, "can_enter_license_plate": False}
        reason = gm.sales_reason(audit)
        self.assertIn("handmatig", reason)
        self.assertIn("automatisch worden ingevuld", reason)

    def test_sales_reason_positive_when_no_gaps(self):
        audit = {"has_real_booking_calendar": True, "has_rdw_or_vehicle_data_integration": True}
        self.assertIn("volledig afsprakensysteem", gm.sales_reason(audit))

    def test_recommended_opening_line_no_website(self):
        line = gm.recommended_opening_line({"has_website": False, "business_name": "Garage Jansen"})
        self.assertIn("Garage Jansen", line)

    def test_recommended_opening_line_basic_form(self):
        line = gm.recommended_opening_line({"has_website": True, "has_basic_contact_form": True})
        self.assertIn("alleen een bericht achterlaten", line)

    def test_recommended_opening_line_no_vehicle_lookup(self):
        line = gm.recommended_opening_line({
            "has_website": True, "has_real_booking_calendar": True,
            "has_rdw_or_vehicle_data_integration": False,
        })
        self.assertIn("kentekencheck", line)

    def test_recommended_opening_line_advanced(self):
        line = gm.recommended_opening_line({
            "has_website": True, "has_real_booking_calendar": True,
            "has_rdw_or_vehicle_data_integration": True,
        })
        self.assertIn("sterk", line)


class TestEvaluateLeadAutoDetection(unittest.TestCase):
    def test_garage_audit_gets_full_evaluation(self):
        audit = _healthy_technical(has_basic_contact_form=True, has_appointment_cta=True)
        result = gm.evaluate_lead(audit)
        for key in ("website_opportunity_category", "booking_gap_reason",
                    "vehicle_lookup_gap_reason", "sales_reason", "recommended_opening_line"):
            self.assertIn(key, result)

    def test_non_garage_audit_gets_plain_score(self):
        audit = {
            "has_website": True, "reachable": True, "https": True,
            "mobile_viewport": True, "response_time": 0.2,
            "has_contact_form": True, "has_cta": True,
            "broken_links": 0, "broken_images": 0,
            "copyright_year": YEAR, "title": "X",
            "has_visible_phone": True, "has_visible_email": True,
        }
        result = gm.evaluate_lead(audit)
        self.assertNotIn("website_opportunity_category", result)
        self.assertEqual(result["score"], 0)


if __name__ == "__main__":
    unittest.main()
