"""Regression tests for copyright-year detection. No network.

The core bug: a range like "© 1998–2026" must resolve to 2026 (most recent),
not 1998, and must NOT be flagged outdated.
"""

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from leadfinder.copyright_detect import detect_copyright  # noqa: E402

YEAR = 2026


def eff(html):
    return detect_copyright(html, current_year=YEAR)


class TestCopyrightDetect(unittest.TestCase):
    def test_single_current_year(self):
        r = eff("<footer>© 2026 Loodgieter Rotterdam</footer>")
        self.assertEqual(r["effective_copyright_year"], 2026)
        self.assertFalse(r["outdated_copyright"])
        self.assertEqual(r["copyright_years_found"], [2026])

    def test_old_to_current_range_endash(self):
        # The reported bug.
        r = eff("<footer>© 1998–2026 Loodgieter Rotterdam</footer>")
        self.assertEqual(r["effective_copyright_year"], 2026)
        self.assertFalse(r["outdated_copyright"])
        self.assertEqual(r["copyright_years_found"], [1998, 2026])

    def test_old_to_current_range_hyphen(self):
        r = eff("<p>© 1998-2026 Bedrijf</p>")
        self.assertEqual(r["effective_copyright_year"], 2026)
        self.assertFalse(r["outdated_copyright"])

    def test_copyright_word_spaced_range(self):
        r = eff("<div>Copyright 2019 – 2026 Dakdekker BV</div>")
        self.assertEqual(r["effective_copyright_year"], 2026)
        self.assertFalse(r["outdated_copyright"])

    def test_slash_separator(self):
        r = eff("<footer>© 2019 / 2026 Company</footer>")
        self.assertEqual(r["effective_copyright_year"], 2026)
        self.assertFalse(r["outdated_copyright"])

    def test_to_separator(self):
        r = eff("<footer>Copyright 2019 to 2026 Company</footer>")
        self.assertEqual(r["effective_copyright_year"], 2026)
        self.assertFalse(r["outdated_copyright"])

    def test_old_single_year_is_outdated(self):
        r = eff("<footer>© 2019 Oude Dakdekker</footer>")
        self.assertEqual(r["effective_copyright_year"], 2019)
        self.assertTrue(r["outdated_copyright"])

    def test_2025_is_not_outdated(self):
        r = eff("<footer>© 2025 Bedrijf</footer>")
        self.assertEqual(r["effective_copyright_year"], 2025)
        self.assertFalse(r["outdated_copyright"])

    def test_multiple_unrelated_numbers_ignored(self):
        # KvK (8-digit) and VAT and phone must not be mistaken for the year;
        # the real copyright year (2020) should win.
        html = ("<footer>© 2020 Bedrijf B.V. · KvK 12345678 · "
                "BTW NL812345678B01 · Tel 010 123 4567</footer>")
        r = eff(html)
        self.assertEqual(r["effective_copyright_year"], 2020)
        self.assertTrue(r["outdated_copyright"])
        self.assertNotIn(1234, r["copyright_years_found"])

    def test_range_with_unrelated_numbers_picks_latest_real_year(self):
        html = ("<footer>© 1992 - 2026 Loodgieter | KvK 34567890 | "
                "Postbus 1234 | 010-4561234</footer>")
        r = eff(html)
        self.assertEqual(r["effective_copyright_year"], 2026)
        self.assertFalse(r["outdated_copyright"])

    def test_no_copyright_year(self):
        r = eff("<footer>Welkom bij ons dakdekkersbedrijf. Bel ons!</footer>")
        self.assertIsNone(r["effective_copyright_year"])
        self.assertEqual(r["copyright_years_found"], [])
        self.assertFalse(r["outdated_copyright"])

    def test_html_entity_copy(self):
        r = eff("<footer>&copy; 1998&ndash;2026 Bedrijf</footer>")
        self.assertEqual(r["effective_copyright_year"], 2026)

    def test_evidence_fields_present(self):
        r = eff("<footer>© 2026 X</footer>")
        for key in ("copyright_text", "copyright_years_found",
                    "effective_copyright_year", "outdated_copyright"):
            self.assertIn(key, r)


if __name__ == "__main__":
    unittest.main()
