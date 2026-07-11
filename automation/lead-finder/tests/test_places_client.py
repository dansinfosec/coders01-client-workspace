"""Tests for the Places client using the MOCK transport. No real API calls."""

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from leadfinder.config import Budget  # noqa: E402
from leadfinder.places_client import (  # noqa: E402
    PlacesClient, MockTransport, TEXT_SEARCH_FIELDS, PLACE_DETAILS_FIELDS,
)


class TestPlacesClientMock(unittest.TestCase):
    def _client(self, **kw):
        return PlacesClient(MockTransport(), delay=0.0, **kw)

    def test_search_paginates_across_pages(self):
        client = self._client()
        results = list(client.search_text("dakdekker", region="Utrecht", max_results=50))
        # Fixtures: 3 on page 1 + 2 on page 2 = 5
        self.assertEqual(len(results), 5)
        ids = [r["id"] for r in results]
        self.assertIn("mock_place_004", ids)  # from page 2

    def test_max_results_limits_output(self):
        client = self._client()
        results = list(client.search_text("dakdekker", max_results=2))
        self.assertEqual(len(results), 2)

    def test_field_mask_is_sent(self):
        transport = MockTransport()
        client = PlacesClient(transport, delay=0.0)
        list(client.search_text("kapper", max_results=1))
        self.assertEqual(transport.last_text_search_mask, TEXT_SEARCH_FIELDS)
        client.place_details("mock_place_001")
        self.assertEqual(transport.last_details_mask, PLACE_DETAILS_FIELDS)

    def test_request_counters(self):
        client = self._client()
        list(client.search_text("dakdekker", max_results=50))  # 2 text-search pages
        client.place_details("mock_place_001")
        client.place_details("mock_place_002")
        self.assertEqual(client.counters.text_search_requests, 2)
        self.assertEqual(client.counters.place_details_requests, 2)
        self.assertEqual(client.counters.total, 4)

    def test_budget_stops_requests(self):
        budget = Budget(max_requests=1)
        client = self._client(budget=budget)
        results = list(client.search_text("dakdekker", max_results=50))
        # Only the first page's spend is allowed; second page is blocked.
        self.assertEqual(len(results), 3)
        self.assertEqual(budget.used, 1)
        # Further detail calls are refused once the budget is spent.
        self.assertIsNone(client.place_details("mock_place_001"))

    def test_details_returns_expected_fields(self):
        client = self._client()
        d = client.place_details("mock_place_002")
        self.assertEqual(d["websiteUri"], "http://utrechtdakzink.nl")
        self.assertIn("internationalPhoneNumber", d)

    def test_build_search_body_includes_location_and_bias(self):
        body = PlacesClient.build_search_body(
            "dakdekker", region="Utrecht", city="Utrecht",
            lat=52.09, lng=5.12, radius=5000)
        self.assertEqual(body["textQuery"], "dakdekker in Utrecht Utrecht")
        self.assertEqual(body["locationBias"]["circle"]["radius"], 5000.0)


if __name__ == "__main__":
    unittest.main()
