"""Tests for domain + phone normalization. No network."""

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from leadfinder.normalize import normalize_domain, normalize_phone  # noqa: E402


class TestNormalizeDomain(unittest.TestCase):
    def test_strips_scheme_www_path_query(self):
        self.assertEqual(normalize_domain("https://WWW.Example.com:443/contact?x=1"), "example.com")

    def test_bare_host(self):
        self.assertEqual(normalize_domain("example.nl"), "example.nl")

    def test_subdomain_preserved(self):
        self.assertEqual(normalize_domain("https://blog.example.nl"), "blog.example.nl")

    def test_none_and_empty(self):
        self.assertIsNone(normalize_domain(None))
        self.assertIsNone(normalize_domain(""))
        self.assertIsNone(normalize_domain("   "))

    def test_two_urls_same_domain(self):
        a = normalize_domain("http://utrechtdakzink.nl")
        b = normalize_domain("https://www.utrechtdakzink.nl/contact")
        self.assertEqual(a, b)


class TestNormalizePhone(unittest.TestCase):
    def test_nl_national_to_e164(self):
        self.assertEqual(normalize_phone("085 - 060 0397"), "+31850600397")

    def test_already_international(self):
        self.assertEqual(normalize_phone("+31 85 060 0397"), "+31850600397")

    def test_double_zero_prefix(self):
        self.assertEqual(normalize_phone("0031 30 1234567"), "+31301234567")

    def test_display_and_intl_match(self):
        self.assertEqual(normalize_phone("030 222 2222"), normalize_phone("+31 30 222 2222"))

    def test_none_and_empty(self):
        self.assertIsNone(normalize_phone(None))
        self.assertIsNone(normalize_phone(""))
        self.assertIsNone(normalize_phone("abc"))

    def test_custom_country(self):
        self.assertEqual(normalize_phone("040 123456", default_country="49"), "+4940123456")


if __name__ == "__main__":
    unittest.main()
