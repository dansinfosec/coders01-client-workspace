"""Tests for multi-industry support: industry field + combined dashboard data."""

import io
import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from leadfinder.leads import map_to_lead, LEAD_FIELDS  # noqa: E402
from leadfinder import config, dashboard  # noqa: E402


class TestIndustryField(unittest.TestCase):
    def test_map_to_lead_sets_industry(self):
        lead = map_to_lead({"id": "p1", "displayName": {"text": "X"}}, None,
                           region="Utrecht", industry="dakdekkers")
        self.assertEqual(lead["industry"], "dakdekkers")

    def test_industry_in_schema(self):
        self.assertIn("industry", LEAD_FIELDS)

    def test_rows_carry_industry(self):
        leads = [{"place_id": "p1", "industry": "thuiszorg", "business_name": "Zorg"}]
        rows = dashboard._rows_from(leads, [], {})
        self.assertEqual(rows[0]["industry"], "thuiszorg")


class TestCombinedData(unittest.TestCase):
    def _write(self, d, name, key, items):
        d.mkdir(parents=True, exist_ok=True)
        io.open(d / name, "w", encoding="utf-8").write(
            json.dumps({key: items}, ensure_ascii=False))

    def test_build_combined_merges_industries(self):
        with tempfile.TemporaryDirectory() as tmp:
            base = Path(tmp)
            # dakdekkers: one lead with a website + audit (score computed)
            ind = base / "industries"
            self._write(ind / "dakdekkers", "leads.json", "leads",
                        [{"place_id": "d1", "industry": "dakdekkers", "business_name": "Dak",
                          "city": "Utrecht", "website": None}])
            self._write(ind / "dakdekkers", "website-audits.json", "audits",
                        [{"place_id": "d1", "has_website": False}])
            # thuiszorg: one lead
            self._write(ind / "thuiszorg", "leads.json", "leads",
                        [{"place_id": "t1", "industry": "thuiszorg", "business_name": "Zorg",
                          "city": "Almere", "website": None}])
            self._write(ind / "thuiszorg", "website-audits.json", "audits",
                        [{"place_id": "t1", "has_website": False}])

            paths = config.make_paths(base)
            payload = dashboard.build_combined_data(paths)

            self.assertEqual(len(payload["rows"]), 2)
            industries = {r["industry"] for r in payload["rows"]}
            self.assertEqual(industries, {"dakdekkers", "thuiszorg"})
            # base industries always present in the dropdown list
            for slug in ("dakdekkers", "thuiszorg", "makelaars"):
                self.assertIn(slug, payload["industries"])
            # no-website leads score 100
            self.assertTrue(all(r["score"] == 100 for r in payload["rows"]))

    def test_list_industries(self):
        with tempfile.TemporaryDirectory() as tmp:
            base = Path(tmp)
            self._write(base / "industries" / "makelaars", "leads.json", "leads", [])
            self.assertEqual(config.list_industries(base), ["makelaars"])


class TestRenderIncludesIndustryUI(unittest.TestCase):
    def test_dashboard_html_has_industry_filter_and_column(self):
        html = dashboard.render({"generated_at": "now", "industries": ["dakdekkers"],
                                 "rows": [{"place_id": "p", "industry": "dakdekkers",
                                           "business_name": "X", "score": 50, "reasons": []}]})
        self.assertIn('id="fIndustry"', html)          # industry dropdown
        self.assertIn("Alle branches", html)            # all-industries option
        self.assertIn(">Branche<", html)                # industry column header
        self.assertIn("dashboard-data.json", html)      # reads combined data
        self.assertIn("localStorage", html)             # review persistence preserved


if __name__ == "__main__":
    unittest.main()
