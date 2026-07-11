"""Tests for the explainable opportunity score. No network."""

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from leadfinder.scoring import score_audit, MAX_SCORE  # noqa: E402

YEAR = 2026


class TestScoring(unittest.TestCase):
    def test_no_website_is_max(self):
        res = score_audit({"has_website": False}, current_year=YEAR)
        self.assertEqual(res.score, 100)
        self.assertEqual(res.reasons[0]["code"], "no_website")

    def test_unreachable_website(self):
        res = score_audit(
            {"has_website": True, "reachable": False, "unreachable_reason": "timeout"},
            current_year=YEAR,
        )
        self.assertEqual(res.score, 40)
        self.assertEqual(res.reasons[0]["code"], "unreachable")

    def test_unreachable_with_server_error(self):
        res = score_audit(
            {"has_website": True, "reachable": False, "server_error": True},
            current_year=YEAR,
        )
        self.assertEqual(res.score, 70)  # 40 + 30

    def test_healthy_site_scores_low(self):
        res = score_audit({
            "has_website": True, "reachable": True, "https": True,
            "mobile_viewport": True, "response_time": 0.4,
            "has_contact_form": True, "has_cta": True,
            "broken_links": 0, "broken_images": 0,
            "copyright_year": YEAR, "title": "Goed Bedrijf",
            "has_visible_phone": True, "has_visible_email": True,
        }, current_year=YEAR)
        self.assertEqual(res.score, 0)
        self.assertEqual(res.reasons, [])

    def test_old_site_accumulates(self):
        res = score_audit({
            "has_website": True, "reachable": True, "https": False,
            "mobile_viewport": False, "response_time": 6.2,
            "has_contact_form": False, "has_cta": True,
            "broken_links": 1, "broken_images": 1,
            "copyright_year": 2016, "title": "Oud",
            "has_visible_phone": True, "has_visible_email": False,
        }, current_year=YEAR)
        # 15 (https) + 15 (viewport) + 15 (slow) + 10 (form) + 10 (broken) + 5 (copyright)
        self.assertEqual(res.score, 70)
        codes = {r["code"] for r in res.reasons}
        self.assertEqual(codes, {"no_https", "no_mobile_viewport", "slow_response",
                                 "no_contact_form", "broken_assets", "outdated_copyright"})

    def test_score_capped_at_max(self):
        res = score_audit({
            "has_website": True, "reachable": True, "server_error": True,
            "https": False, "mobile_viewport": False, "response_time": 9,
            "has_contact_form": False, "has_cta": False,
            "broken_links": 5, "broken_images": 5, "copyright_year": 2010,
            "title": None, "has_visible_phone": False, "has_visible_email": False,
        }, current_year=YEAR)
        self.assertEqual(res.score, MAX_SCORE)  # sum > 100, capped

    def test_every_reason_recorded(self):
        res = score_audit({
            "has_website": True, "reachable": True, "https": False,
            "mobile_viewport": True, "response_time": 1,
            "has_contact_form": True, "has_cta": True,
            "broken_links": 0, "broken_images": 0,
            "copyright_year": YEAR, "title": "X",
            "has_visible_phone": True, "has_visible_email": True,
        }, current_year=YEAR)
        self.assertEqual([r["code"] for r in res.reasons], ["no_https"])
        self.assertEqual(res.reasons[0]["points"], 15)

    def test_top_problems_ordered_by_points(self):
        res = score_audit({
            "has_website": True, "reachable": True, "https": False,
            "mobile_viewport": True, "response_time": 1,
            "has_contact_form": False, "has_cta": True,
            "broken_links": 0, "broken_images": 0,
            "copyright_year": YEAR, "title": "X",
            "has_visible_phone": True, "has_visible_email": True,
        }, current_year=YEAR)
        # no_https (15) should rank above no_contact_form (10)
        self.assertEqual(res.top_problems()[0], "Geen HTTPS")


if __name__ == "__main__":
    unittest.main()
