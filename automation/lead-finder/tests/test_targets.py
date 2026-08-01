"""Tests for the category × location matrix config + generation. No network."""

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from leadfinder import targets  # noqa: E402


class TestMatrixGeneration(unittest.TestCase):
    def test_counts(self):
        self.assertEqual(len(targets.CATEGORIES), 40)
        self.assertEqual(len(targets.LOCATIONS), 30)

    def test_full_matrix_size(self):
        combos = list(targets.iter_combinations())
        self.assertEqual(len(combos), 40 * 30)  # 1200

    def test_query_format_is_natural_dutch(self):
        combos = list(targets.iter_combinations(["Dakdekker"], ["Amsterdam"]))
        self.assertEqual(combos[0]["query"], "dakdekker Amsterdam")
        combos = list(targets.iter_combinations(["Schoonmaakbedrijf"], ["Utrecht"]))
        self.assertEqual(combos[0]["query"], "schoonmaakbedrijf Utrecht")

    def test_slug_and_alias(self):
        self.assertEqual(targets.category_slug("Airco installateur"), "airco-installateur")
        # aliases merge into existing folders
        self.assertEqual(targets.category_slug("Dakdekker"), "dakdekkers")
        self.assertEqual(targets.category_slug("Makelaar"), "makelaars")
        self.assertEqual(targets.category_slug("Thuiszorg"), "thuiszorg")

    def test_combo_shape(self):
        c = list(targets.iter_combinations(["Kapper"], ["Haarlem"]))[0]
        self.assertEqual(set(c), {"category", "slug", "location", "query"})
        self.assertEqual(c["slug"], "kapper")
        self.assertEqual(c["query"], "kapper Haarlem")


class TestSubsetSelection(unittest.TestCase):
    def test_select_categories_by_name(self):
        self.assertEqual(targets.select_categories(["Kapper", "Schilder"]), ["Schilder", "Kapper"])

    def test_select_categories_by_name_is_case_insensitive(self):
        self.assertEqual(targets.select_categories(["dakdekker"]), ["Dakdekker"])

    def test_select_categories_limit(self):
        self.assertEqual(targets.select_categories(limit=3), targets.CATEGORIES[:3])

    def test_select_locations_by_name(self):
        self.assertEqual(targets.select_locations(["Utrecht", "Haarlem"]), ["Utrecht", "Haarlem"])

    def test_select_locations_limit(self):
        self.assertEqual(len(targets.select_locations(limit=5)), 5)

    def test_subset_combo_count(self):
        cats = targets.select_categories(limit=2)
        locs = targets.select_locations(limit=3)
        self.assertEqual(len(list(targets.iter_combinations(cats, locs))), 6)


if __name__ == "__main__":
    unittest.main()
