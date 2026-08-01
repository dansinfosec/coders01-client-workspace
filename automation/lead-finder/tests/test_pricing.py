"""Tests for the per-request USD CostGuard and its wiring into the client.

No network. Covers: individual-request stops (Text Search + Place Details),
pagination charging, retry charging by endpoint, cumulative/persisted spend
across resumed runs, crash-safety, the $195.50 operational stop, the $230
absolute invariant, and that NO request is sent after a CostGuard rejection.
"""

import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from leadfinder import pricing  # noqa: E402
from leadfinder.pricing import CostGuard, PRICE_MILLS  # noqa: E402
from leadfinder.places_client import PlacesClient  # noqa: E402


# --- test doubles ----------------------------------------------------------

class _Resp:
    def __init__(self, code):
        self.status_code = code


class Transient(Exception):
    """Looks transient to _is_transient (503)."""
    def __init__(self):
        self.response = _Resp(503)


class SpyTextTransport:
    """Text Search transport that paginates and counts every HTTP call."""
    def __init__(self, pages):
        # pages: list of nextPageToken values (last is None to stop)
        self._tokens = pages
        self.text_calls = 0

    def text_search(self, body, field_mask):
        i = self.text_calls
        self.text_calls += 1
        token = self._tokens[i] if i < len(self._tokens) else None
        return {"places": [{"id": f"p{i}"}], "nextPageToken": token}

    def place_details(self, place_id, field_mask):  # pragma: no cover - unused
        return {"id": place_id}


class FlakyDetailsTransport:
    """Place Details that fails transiently `fails` times, then succeeds."""
    def __init__(self, fails):
        self.fails = fails
        self.detail_calls = 0

    def text_search(self, body, field_mask):  # pragma: no cover - unused
        return {"places": []}

    def place_details(self, place_id, field_mask):
        self.detail_calls += 1
        if self.detail_calls <= self.fails:
            raise Transient()
        return {"id": place_id, "nationalPhoneNumber": "085 060 0397"}


# --- CostGuard unit behaviour ---------------------------------------------

class TestCostGuardCharging(unittest.TestCase):
    def test_reserve_charges_by_kind(self):
        g = CostGuard(operational_mills=10_000, absolute_mills=10_000)
        self.assertTrue(g.reserve("text"))
        self.assertTrue(g.reserve("details"))
        self.assertEqual(g.spent_text, PRICE_MILLS["text"])
        self.assertEqual(g.spent_details, PRICE_MILLS["details"])
        self.assertEqual(g.count_text, 1)
        self.assertEqual(g.count_details, 1)

    def test_stop_before_individual_text_request(self):
        # Room for exactly two text requests at PRICE_MILLS['text'], not a third.
        g = CostGuard(operational_mills=2 * PRICE_MILLS["text"], absolute_mills=1_000)
        self.assertTrue(g.reserve("text"))
        self.assertTrue(g.reserve("text"))
        self.assertFalse(g.reserve("text"))       # third rejected BEFORE sending
        self.assertTrue(g.stopped)
        self.assertEqual(g.count_text, 2)
        self.assertLessEqual(g.total_mills(), g.operational_mills)

    def test_stop_before_individual_details_request(self):
        g = CostGuard(operational_mills=2 * PRICE_MILLS["details"], absolute_mills=1_000)
        self.assertTrue(g.reserve("details"))
        self.assertTrue(g.reserve("details"))
        self.assertFalse(g.reserve("details"))
        self.assertEqual(g.count_details, 2)

    def test_retry_charged_by_endpoint(self):
        g = CostGuard(operational_mills=10_000, absolute_mills=10_000)
        self.assertTrue(g.reserve_retry("text"))
        self.assertTrue(g.reserve_retry("details"))
        self.assertEqual(g.spent_retries, PRICE_MILLS["text"] + PRICE_MILLS["details"])
        self.assertEqual(g.count_retries, 2)

    def test_operational_stop_at_195_50(self):
        g = CostGuard.load(None, operational_usd=195.50, absolute_usd=230.00)
        g.spent_details = 195_500 - PRICE_MILLS["details"]
        self.assertTrue(g.reserve("details"))    # lands exactly on $195.50
        self.assertEqual(g.total_usd(), 195.50)
        self.assertFalse(g.reserve("details"))   # next request would cross -> stop
        self.assertLessEqual(g.total_usd(), 195.50)

    def test_absolute_ceiling_never_crossed(self):
        # Even if operational were mis-set high, the absolute ceiling holds.
        g = CostGuard(operational_mills=10_000_000, absolute_mills=230_000)
        g.spent_text = 229_980            # $229.98
        self.assertFalse(g.reserve("text"))      # +$0.032 -> $230.012 > $230 -> reject
        self.assertLessEqual(g.total_mills(), g.absolute_mills)

    def test_can_afford(self):
        g = CostGuard(operational_mills=30, absolute_mills=1_000)
        self.assertFalse(g.can_afford("text"))   # 32 > 30
        self.assertTrue(g.can_afford("details"))  # 25 <= 30


class TestCostGuardPersistence(unittest.TestCase):
    def test_cumulative_across_resumed_runs(self):
        with tempfile.TemporaryDirectory() as tmp:
            p = Path(tmp) / "cost-state.json"
            g1 = CostGuard.load(p, operational_usd=1.0, absolute_usd=2.0)
            g1.reserve("text")
            g1.reserve("details")
            first_total = g1.total_mills()
            # New process/run: load the SAME state — spend is cumulative.
            g2 = CostGuard.load(p, operational_usd=1.0, absolute_usd=2.0)
            self.assertEqual(g2.total_mills(), first_total)
            g2.reserve("text")
            self.assertEqual(g2.total_mills(), first_total + PRICE_MILLS["text"])

    def test_crash_restart_does_not_reset_cost(self):
        with tempfile.TemporaryDirectory() as tmp:
            p = Path(tmp) / "cost-state.json"
            g = CostGuard.load(p, operational_usd=1.0, absolute_usd=2.0)
            g.reserve("details")                  # save() persists on every reserve
            # Simulate a crash: no clean shutdown, just re-read the file.
            data = json.loads(p.read_text(encoding="utf-8"))
            self.assertEqual(data["_spent_details_mills"], PRICE_MILLS["details"])
            g_after = CostGuard.load(p, operational_usd=1.0, absolute_usd=2.0)
            self.assertEqual(g_after.spent_details, PRICE_MILLS["details"])

    def test_reset_clears_state(self):
        with tempfile.TemporaryDirectory() as tmp:
            p = Path(tmp) / "cost-state.json"
            CostGuard.load(p, 1.0, 2.0).reserve("text")
            self.assertTrue(p.exists())
            CostGuard.reset(p)
            self.assertFalse(p.exists())


# --- CostGuard wired INTO the client request path --------------------------

class TestClientCostEnforcement(unittest.TestCase):
    def test_each_pagination_page_is_charged(self):
        transport = SpyTextTransport(pages=["t1", "t2", None])   # 3 pages then stop
        g = CostGuard(operational_mills=10_000, absolute_mills=10_000)
        client = PlacesClient(transport, delay=0.0, cost_guard=g)
        list(client.search_text("q", max_results=10))
        self.assertEqual(transport.text_calls, 3)
        self.assertEqual(g.count_text, 3)                        # every page billed
        self.assertEqual(g.spent_text, 3 * PRICE_MILLS["text"])

    def test_no_request_sent_after_rejection(self):
        transport = SpyTextTransport(pages=["t1", "t2", "t3", "t4"])
        g = CostGuard(operational_mills=2 * PRICE_MILLS["text"],  # room for 2 pages
                      absolute_mills=10_000)
        client = PlacesClient(transport, delay=0.0, cost_guard=g)
        list(client.search_text("q", max_results=100))
        self.assertEqual(transport.text_calls, 2)                # NOT 3 — rejected before send
        self.assertTrue(client.cost_stopped)

    def test_details_rejection_returns_none_and_sends_nothing(self):
        transport = FlakyDetailsTransport(fails=0)
        g = CostGuard(operational_mills=0, absolute_mills=10_000)   # cannot afford anything
        client = PlacesClient(transport, delay=0.0, cost_guard=g)
        self.assertIsNone(client.place_details("p1"))
        self.assertEqual(transport.detail_calls, 0)              # no HTTP sent
        self.assertTrue(client.cost_stopped)

    def test_retry_is_charged_at_endpoint_price(self):
        transport = FlakyDetailsTransport(fails=2)               # 2 transient failures then ok
        g = CostGuard(operational_mills=10_000, absolute_mills=10_000)
        client = PlacesClient(transport, delay=0.0, max_retries=3, cost_guard=g)
        out = client.place_details("p1")
        self.assertIsNotNone(out)
        self.assertEqual(g.count_details, 1)                     # 1 initial detail request
        self.assertEqual(g.count_retries, 2)                     # 2 retries, each billed
        self.assertEqual(g.spent_retries, 2 * PRICE_MILLS["details"])

    def test_retry_blocked_when_budget_exhausted(self):
        transport = FlakyDetailsTransport(fails=3)
        # Room for the initial detail ($0.025) but no retry.
        g = CostGuard(operational_mills=PRICE_MILLS["details"], absolute_mills=10_000)
        client = PlacesClient(transport, delay=0.0, max_retries=3, cost_guard=g)
        with self.assertRaises(Transient):
            client.place_details("p1")
        self.assertTrue(client.cost_stopped)
        self.assertEqual(g.count_retries, 0)                     # no retry could be afforded
        self.assertEqual(transport.detail_calls, 1)              # only the initial send


if __name__ == "__main__":
    unittest.main()
