"""Unit tests for the crawler's pure helpers.

Run from the crawler folder:
    python -m unittest discover -s tests -v
or with pytest:
    pytest -v

These tests cover URL normalization, same-domain filtering and filename
generation. They do NOT hit the network and do NOT crawl any real website.
"""

import sys
import unittest
from pathlib import Path

# Make the parent folder (containing crawler.py) importable without installing.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from crawler import (  # noqa: E402
    is_same_domain,
    normalize_url,
    registered_host,
    url_to_filename,
)


class TestNormalizeUrl(unittest.TestCase):
    def test_lowercases_scheme_and_host(self):
        self.assertEqual(
            normalize_url("HTTP://Example.COM/Path"),
            "http://example.com/Path",  # path case is preserved
        )

    def test_strips_fragment(self):
        self.assertEqual(
            normalize_url("https://example.com/page#section"),
            "https://example.com/page",
        )

    def test_removes_default_ports(self):
        self.assertEqual(normalize_url("http://example.com:80/a"), "http://example.com/a")
        self.assertEqual(normalize_url("https://example.com:443/a"), "https://example.com/a")

    def test_keeps_non_default_port(self):
        self.assertEqual(normalize_url("http://example.com:8080/a"), "http://example.com:8080/a")

    def test_strips_trailing_slash_except_root(self):
        self.assertEqual(normalize_url("https://example.com/about/"), "https://example.com/about")
        self.assertEqual(normalize_url("https://example.com/"), "https://example.com/")

    def test_resolves_relative_against_base(self):
        # Base ends in a directory ("company/"), so ".." climbs to /about/.
        self.assertEqual(
            normalize_url("../team", base="https://example.com/about/company/"),
            "https://example.com/about/team",
        )
        # Relative link without "../" resolves against the current directory.
        self.assertEqual(
            normalize_url("contact", base="https://example.com/about/company"),
            "https://example.com/about/contact",
        )

    def test_preserves_query_string(self):
        self.assertEqual(
            normalize_url("https://example.com/search?q=house&page=2"),
            "https://example.com/search?q=house&page=2",
        )

    def test_root_path_defaults_to_slash(self):
        self.assertEqual(normalize_url("https://example.com"), "https://example.com/")

    def test_duplicate_forms_normalize_equal(self):
        a = normalize_url("https://Example.com/about/#top")
        b = normalize_url("HTTPS://example.com:443/about")
        self.assertEqual(a, b)


class TestRegisteredHost(unittest.TestCase):
    def test_extracts_lowercase_host(self):
        self.assertEqual(registered_host("HTTPS://WWW.Example.com/x"), "www.example.com")

    def test_strips_port(self):
        self.assertEqual(registered_host("http://example.com:8080/x"), "example.com")


class TestIsSameDomain(unittest.TestCase):
    def test_exact_host_matches(self):
        self.assertTrue(is_same_domain("https://example.com/a", "example.com"))

    def test_different_host_does_not_match(self):
        self.assertFalse(is_same_domain("https://other.com/a", "example.com"))

    def test_subdomain_excluded_by_default(self):
        self.assertFalse(is_same_domain("https://blog.example.com/a", "example.com"))

    def test_subdomain_included_when_enabled(self):
        self.assertTrue(
            is_same_domain("https://blog.example.com/a", "example.com", include_subdomains=True)
        )

    def test_lookalike_domain_rejected_even_with_subdomains(self):
        # notexample.com must not be treated as a subdomain of example.com
        self.assertFalse(
            is_same_domain("https://notexample.com/a", "example.com", include_subdomains=True)
        )

    def test_empty_host_is_false(self):
        self.assertFalse(is_same_domain("/relative/path", "example.com"))


class TestUrlToFilename(unittest.TestCase):
    def test_root_becomes_index(self):
        name = url_to_filename("https://example.com/")
        self.assertTrue(name.startswith("index-"))
        self.assertTrue(name.endswith(".html"))

    def test_path_is_slugified(self):
        name = url_to_filename("https://example.com/about/team")
        self.assertTrue(name.startswith("about_team-"))
        self.assertTrue(name.endswith(".html"))

    def test_distinct_queries_produce_distinct_files(self):
        a = url_to_filename("https://example.com/search?q=1")
        b = url_to_filename("https://example.com/search?q=2")
        self.assertNotEqual(a, b)

    def test_same_url_is_stable(self):
        url = "https://example.com/contact"
        self.assertEqual(url_to_filename(url), url_to_filename(url))

    def test_special_characters_are_stripped(self):
        name = url_to_filename("https://example.com/huizen/te-koop!@#/")
        # Only safe characters plus the hash suffix and extension remain.
        self.assertRegex(name, r"^[a-z0-9_]+-[0-9a-f]{10}\.html$")

    def test_long_path_is_truncated(self):
        long_path = "a" * 300
        name = url_to_filename(f"https://example.com/{long_path}")
        # slug (<=100) + '-' + 10 hex + '.html'
        self.assertLessEqual(len(name), 100 + 1 + 10 + len(".html"))


if __name__ == "__main__":
    unittest.main()
