"""Tests for batch state, estimate, merge, dedup, and the CLI guards. No network."""

import argparse
import io
import json
import sys
import tempfile
import unittest
from contextlib import redirect_stdout
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from leadfinder import batch, targets  # noqa: E402
from leadfinder.normalize import dedupe_leads, name_location_key  # noqa: E402
from leadfinder.leads import has_valid_phone  # noqa: E402
from leadfinder.pricing import CostGuard  # noqa: E402
from leadfinder.places_client import PlacesClient  # noqa: E402
import lead_finder  # noqa: E402


class PhoneMixTransport:
    """Two places: one with a phone, one without (to exercise --require-phone).

    Text Search now carries the full lead payload, so the phone arrives in the
    search result itself — no Place Details call is expected.
    """
    def __init__(self):
        self.details_calls = 0

    def text_search(self, body, field_mask):
        return {"places": [
            {"id": "P1", "displayName": {"text": "Has Phone"},
             "nationalPhoneNumber": "085 060 0397", "websiteUri": "https://p1.nl",
             "businessStatus": "OPERATIONAL"},
            {"id": "P2", "displayName": {"text": "No Phone"},
             "websiteUri": "https://p2.nl", "businessStatus": "OPERATIONAL"},
        ], "nextPageToken": None}

    def place_details(self, place_id, field_mask):
        self.details_calls += 1
        return {"id": place_id}


def combo(cat="Dakdekker", loc="Amsterdam"):
    return list(targets.iter_combinations([cat], [loc]))[0]


class TestEstimate(unittest.TestCase):
    def test_estimate_numbers(self):
        e = batch.estimate(10, max_results=20, budget=500)
        self.assertEqual(e["combinations"], 10)
        self.assertEqual(e["max_text_search_requests"], 10)      # 1 page each
        self.assertEqual(e["max_place_details_requests"], 0)     # Text-Search-only
        self.assertEqual(e["configured_budget"], 500)

    def test_estimate_with_details_fallback(self):
        e = batch.estimate(10, max_results=20, budget=500, details_fallback=True)
        self.assertEqual(e["max_place_details_requests"], 200)   # worst case: 10 * 20

    def test_pages_capped_at_three(self):
        e = batch.estimate(1, max_results=200, budget=None)      # would be 10 pages
        self.assertEqual(e["max_text_search_requests"], 3)       # capped

    def test_is_large(self):
        self.assertFalse(batch.is_large(20))
        self.assertTrue(batch.is_large(21))


class TestCheckpointState(unittest.TestCase):
    def test_persist_and_reload(self):
        with tempfile.TemporaryDirectory() as tmp:
            p = Path(tmp) / "batch-progress.json"
            st = batch.load_state(p)
            c = combo()
            batch.mark_completed(st, c, {"leads_kept": 5})
            batch.save_state(p, st)
            reloaded = batch.load_state(p)
            self.assertTrue(batch.is_completed(reloaded, c))
            self.assertEqual(reloaded["completed"][batch.combo_key(c)]["leads_kept"], 5)

    def test_reset(self):
        with tempfile.TemporaryDirectory() as tmp:
            p = Path(tmp) / "batch-progress.json"
            batch.save_state(p, {"completed": {"x": {}}, "failed": {}})
            batch.reset_state(p)
            self.assertFalse(p.exists())

    def test_completed_skipped_failed_retried(self):
        st = {"completed": {}, "failed": {}}
        c1, c2 = combo("Dakdekker", "Amsterdam"), combo("Kapper", "Utrecht")
        batch.mark_completed(st, c1)
        batch.mark_failed(st, c2, "boom")
        pending = batch.pending_combos(st, [c1, c2])
        self.assertEqual([batch.combo_key(x) for x in pending], [batch.combo_key(c2)])  # only failed retried
        self.assertEqual(st["failed"][batch.combo_key(c2)]["retries"], 1)

    def test_failed_record_fields_and_retry_count(self):
        st = {"completed": {}, "failed": {}}
        c = combo("Loodgieter", "Delft")
        batch.mark_failed(st, c, "timeout")
        batch.mark_failed(st, c, "timeout again")
        f = st["failed"][batch.combo_key(c)]
        self.assertEqual(f["category"], "Loodgieter")
        self.assertEqual(f["location"], "Delft")
        self.assertEqual(f["retries"], 2)
        self.assertIn("timestamp", f)

    def test_success_clears_failed(self):
        st = {"completed": {}, "failed": {}}
        c = combo()
        batch.mark_failed(st, c, "boom")
        batch.mark_completed(st, c)
        self.assertNotIn(batch.combo_key(c), st["failed"])
        self.assertTrue(batch.is_completed(st, c))


class TestMergeAndDedup(unittest.TestCase):
    def test_merge_preserves_existing_and_adds_new(self):
        existing = [{"place_id": "A", "business_name": "One", "phone": "030 111 1111"}]
        new = [{"place_id": "A", "website": "one.nl"},          # dup by place_id -> merges
               {"place_id": "B", "business_name": "Two"}]        # new
        merged, dups = batch.merge_leads(existing, new)
        self.assertEqual(len(merged), 2)
        self.assertEqual(dups, 1)
        self.assertEqual(merged[0]["website"], "one.nl")          # existing filled, not overwritten
        self.assertEqual(merged[0]["phone"], "030 111 1111")

    def test_dedup_priority_place_domain_phone(self):
        leads = [{"place_id": "A", "website": "http://x.nl"},
                 {"place_id": "B", "website": "https://www.x.nl/contact"},  # dup domain
                 {"place_id": "C", "phone": "+31 6 1"},
                 {"place_id": "D", "phone": "0031 6 1"}]          # dup phone
        unique, dups = dedupe_leads(leads)
        self.assertEqual(dups, 2)
        self.assertEqual(len(unique), 2)

    def test_name_location_fourth_key(self):
        # No place_id/domain/phone -> dedup falls back to name+location.
        leads = [{"business_name": "Zorg BV", "city": "Amsterdam"},
                 {"business_name": "Zorg", "city": "Amsterdam"}]   # same name (BV stripped) + city
        unique, dups = dedupe_leads(leads)
        self.assertEqual(dups, 1)
        self.assertEqual(len(unique), 1)

    def test_name_location_requires_both_parts(self):
        # Missing location -> not merged (safe).
        leads = [{"business_name": "Zorg"}, {"business_name": "Zorg"}]
        unique, dups = dedupe_leads(leads)
        self.assertEqual(dups, 0)
        self.assertEqual(len(unique), 2)
        self.assertIsNone(name_location_key({"business_name": "Zorg"}))

    def test_different_name_same_city_not_merged(self):
        leads = [{"business_name": "Alpha", "city": "Utrecht"},
                 {"business_name": "Beta", "city": "Utrecht"}]
        _u, dups = dedupe_leads(leads)
        self.assertEqual(dups, 0)


class TestCliGuards(unittest.TestCase):
    def _run(self, argv):
        buf = io.StringIO()
        with redirect_stdout(buf):
            rc = lead_finder.main(argv)
        return rc, buf.getvalue()

    def test_dry_run_makes_no_calls(self):
        with tempfile.TemporaryDirectory() as tmp:
            rc, out = self._run(["--mock", "--output-dir", tmp, "batch", "--dry-run",
                                 "--category", "Dakdekker", "--location", "Amsterdam"])
        self.assertEqual(rc, 0)
        self.assertIn("DRY RUN", out)
        self.assertIn("dakdekker Amsterdam", out)
        self.assertIn("MAX text-search requests", out)
        self.assertIn("REMAINING run budget", out)

    def test_estimate_cost_exits_without_running(self):
        with tempfile.TemporaryDirectory() as tmp:
            rc, out = self._run(["--mock", "--output-dir", tmp, "batch", "--estimate-cost",
                                 "--category-limit", "2", "--location-limit", "2"])
        self.assertEqual(rc, 0)
        self.assertIn("Combinations: 4", out)

    def test_large_batch_guard_blocks_without_yes(self):
        # 30 combos (> 20) without --yes must NOT run.
        with tempfile.TemporaryDirectory() as tmp:
            rc, out = self._run(["--mock", "--output-dir", tmp, "batch",
                                 "--category-limit", "30", "--location-limit", "1"])
        self.assertEqual(rc, 2)
        self.assertIn("Large batch", out)

    def test_mock_refuses_real_output_dir(self):
        # The guard that prevents mock runs from polluting real output/.
        rc, _ = self._run(["--mock", "batch", "--dry-run", "--category", "Dakdekker",
                           "--location", "Amsterdam"])
        self.assertEqual(rc, 2)

    def test_existing_commands_unchanged(self):
        parser = lead_finder.build_parser()
        # subcommands present
        actions = [a for a in parser._actions if a.dest == "command"]
        choices = set(actions[0].choices)
        self.assertTrue({"search", "audit", "export", "dashboard", "batch"} <= choices)
        # search still requires --industry and --query
        search = actions[0].choices["search"]
        opts = {a.dest for a in search._actions}
        self.assertIn("industry", opts)
        self.assertIn("query", opts)


class TestRoundRobin(unittest.TestCase):
    def test_covers_full_matrix_once(self):
        cats = targets.select_categories(limit=5)
        locs = targets.select_locations(limit=4)
        rr = list(targets.iter_round_robin(cats, locs))
        base = list(targets.iter_combinations(cats, locs))
        self.assertEqual(len(rr), len(base))                       # same total
        key = lambda c: (c["slug"], c["location"])                 # noqa: E731
        self.assertEqual({key(c) for c in rr}, {key(c) for c in base})  # same set, no dups

    def test_spreads_categories_and_locations_early(self):
        cats = targets.select_categories(limit=5)
        locs = targets.select_locations(limit=5)
        first_round = list(targets.iter_round_robin(cats, locs))[:5]
        self.assertEqual(len({c["slug"] for c in first_round}), 5)      # 5 categories
        self.assertEqual(len({c["location"] for c in first_round}), 5)  # 5 different cities

    def test_exclude_removes_category(self):
        cats = targets.select_categories(exclude=["Dakdekker"])
        self.assertNotIn("Dakdekker", cats)
        self.assertEqual(len(cats), len(targets.CATEGORIES) - 1)


class TestValidPhoneFilter(unittest.TestCase):
    def test_has_valid_phone_rules(self):
        self.assertTrue(has_valid_phone({"phone": "085 060 0397"}))
        self.assertTrue(has_valid_phone({"phone": "+31 6 12345678"}))
        self.assertFalse(has_valid_phone({"phone": ""}))
        self.assertFalse(has_valid_phone({}))
        self.assertFalse(has_valid_phone({"phone": "12"}))          # too short

    def test_process_combo_skips_businesses_without_phone(self):
        with tempfile.TemporaryDirectory() as tmp:
            guard = CostGuard(operational_mills=10_000, absolute_mills=10_000)
            transport = PhoneMixTransport()
            client = PlacesClient(transport, delay=0.0, cost_guard=guard)
            args = argparse.Namespace(output_dir=tmp, max_results=10,
                                      require_phone=True, audit=False, mock=True)
            meta = lead_finder._process_combo(client, combo("Kapper", "Utrecht"), args)
            self.assertEqual(meta["no_phone"], 1)
            self.assertEqual(meta["leads_kept"], 1)
            self.assertEqual(transport.details_calls, 0)           # Text-Search-only
            saved = json.loads((Path(tmp) / "industries" / "kapper" / "leads.json").read_text(encoding="utf-8"))
            names = [l["business_name"] for l in saved["leads"]]
            self.assertIn("Has Phone", names)
            self.assertNotIn("No Phone", names)                    # phoneless NOT saved


class TestBatchUsdCli(unittest.TestCase):
    def _run(self, argv):
        buf = io.StringIO()
        with redirect_stdout(buf):
            rc = lead_finder.main(argv)
        return rc, buf.getvalue()

    def test_mock_batch_persists_cost_state_under_ceiling(self):
        with tempfile.TemporaryDirectory() as tmp:
            rc, _ = self._run(["--mock", "--output-dir", tmp, "batch", "--category", "Dakdekker",
                               "--location", "Amsterdam", "--max-results", "5", "--require-phone"])
            self.assertEqual(rc, 0)
            cost = json.loads((Path(tmp) / "cost-state.json").read_text(encoding="utf-8"))
            self.assertGreater(cost["total_usd"], 0)
            self.assertLessEqual(cost["total_usd"], 195.50)

    def test_tiny_usd_budget_stops_and_leaves_combos_pending(self):
        with tempfile.TemporaryDirectory() as tmp:
            # 25 combos requested, but $0.40 only funds ~2 -> rest stay pending.
            rc, out = self._run(["--mock", "--output-dir", tmp, "batch", "--category-limit", "5",
                                 "--location-limit", "5", "--max-results", "5",
                                 "--usd-budget", "0.40", "--safety-pct", "0", "--yes"])
            self.assertEqual(rc, 0)
            state = json.loads((Path(tmp) / "batch-progress.json").read_text(encoding="utf-8"))
            self.assertLess(len(state["completed"]), 25)           # stopped early
            cost = json.loads((Path(tmp) / "cost-state.json").read_text(encoding="utf-8"))
            self.assertLessEqual(cost["total_usd"], 0.40)          # never exceeded operational
            self.assertLessEqual(cost["total_usd"], 230.0)         # absolute never crossed

    def test_reset_clears_cost_and_progress(self):
        with tempfile.TemporaryDirectory() as tmp:
            self._run(["--mock", "--output-dir", tmp, "batch", "--category", "Dakdekker",
                       "--location", "Amsterdam", "--max-results", "5"])
            self.assertTrue((Path(tmp) / "cost-state.json").exists())
            rc, _ = self._run(["--mock", "--output-dir", tmp, "batch", "--reset-state"])
            self.assertEqual(rc, 0)
            self.assertFalse((Path(tmp) / "cost-state.json").exists())
            self.assertFalse((Path(tmp) / "batch-progress.json").exists())


class TestBatchMockRun(unittest.TestCase):
    def test_mock_batch_writes_leads_and_checkpoints(self):
        with tempfile.TemporaryDirectory() as tmp:
            rc = lead_finder.main(["--mock", "--output-dir", tmp, "batch",
                                   "--category", "Dakdekker", "--location", "Amsterdam",
                                   "--max-results", "10", "--budget", "50"])
            self.assertEqual(rc, 0)
            # leads written to the aliased industry folder
            leads = json.loads((Path(tmp) / "industries" / "dakdekkers" / "leads.json").read_text(encoding="utf-8"))
            self.assertGreater(leads["count"], 0)
            # checkpoint saved and combo marked completed (3-part query-aware key)
            state = json.loads((Path(tmp) / "batch-progress.json").read_text(encoding="utf-8"))
            self.assertIn("dakdekkers|dakdekker|Amsterdam", state["completed"])


if __name__ == "__main__":
    unittest.main()
