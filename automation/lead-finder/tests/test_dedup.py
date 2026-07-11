"""Tests for lead de-duplication by place_id, domain and phone. No network."""

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from leadfinder.normalize import dedupe_leads  # noqa: E402


class TestDedupe(unittest.TestCase):
    def test_dedupe_by_place_id(self):
        leads = [
            {"place_id": "A", "business_name": "One"},
            {"place_id": "A", "business_name": "One again"},
        ]
        unique, dups = dedupe_leads(leads)
        self.assertEqual(len(unique), 1)
        self.assertEqual(dups, 1)

    def test_dedupe_by_domain(self):
        leads = [
            {"place_id": "A", "website": "http://utrechtdakzink.nl"},
            {"place_id": "B", "website": "https://www.utrechtdakzink.nl/contact"},
        ]
        unique, dups = dedupe_leads(leads)
        self.assertEqual(len(unique), 1)
        self.assertEqual(dups, 1)

    def test_dedupe_by_phone(self):
        leads = [
            {"place_id": "A", "phone": "030 222 2222"},
            {"place_id": "B", "phone": "+31 30 222 2222"},
        ]
        unique, dups = dedupe_leads(leads)
        self.assertEqual(len(unique), 1)
        self.assertEqual(dups, 1)

    def test_distinct_leads_kept(self):
        leads = [
            {"place_id": "A", "website": "a.nl", "phone": "030 111 1111"},
            {"place_id": "B", "website": "b.nl", "phone": "030 222 2222"},
            {"place_id": "C", "website": "c.nl", "phone": "030 333 3333"},
        ]
        unique, dups = dedupe_leads(leads)
        self.assertEqual(len(unique), 3)
        self.assertEqual(dups, 0)

    def test_merge_fills_missing_fields(self):
        leads = [
            {"place_id": "A", "business_name": "One", "phone": "030 222 2222"},
            {"place_id": "A", "website": "one.nl"},  # dup by place_id, adds website
        ]
        unique, dups = dedupe_leads(leads)
        self.assertEqual(dups, 1)
        self.assertEqual(unique[0]["website"], "one.nl")
        self.assertEqual(unique[0]["phone"], "030 222 2222")

    def test_missing_keys_do_not_collapse(self):
        # Leads with no place_id/domain/phone must not be treated as duplicates.
        leads = [{"business_name": "X"}, {"business_name": "Y"}]
        unique, dups = dedupe_leads(leads)
        self.assertEqual(len(unique), 2)
        self.assertEqual(dups, 0)


if __name__ == "__main__":
    unittest.main()
