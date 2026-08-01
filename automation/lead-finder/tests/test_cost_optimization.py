"""Tests for the Text-Search-only cost optimization. No network, mock only.

Covers the refactor's guarantees:
  * N Text Search results trigger ZERO Place Details requests (the core saving);
  * the --details-fallback path fires only when phone AND website are absent;
  * closed businesses are skipped;
  * the per-run --additional-cost-limit-usd ceiling stops the run while the
    historical cumulative total keeps counting;
  * global dedup skips leads already stored anywhere under output/;
  * the automotive-garages-nl preset produces the expected strict-geo matrix;
  * pagination is capped at 3 pages / 60 results per query.
"""

import argparse
import io
import json
import sys
import tempfile
import unittest
from contextlib import redirect_stdout
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from leadfinder import batch, storage, targets, config  # noqa: E402
from leadfinder.leads import map_to_lead, is_open_business, needs_details_fallback  # noqa: E402
from leadfinder.pricing import CostGuard, PRICE_MILLS  # noqa: E402
from leadfinder.places_client import (  # noqa: E402
    PlacesClient, MockTransport, TEXT_SEARCH_FIELDS, MAX_PAGES, MAX_RESULTS_PER_QUERY,
)
import lead_finder  # noqa: E402


def _args(tmp, **kw):
    base = dict(output_dir=tmp, max_results=20, require_phone=False,
                audit=False, mock=True, details_fallback=False)
    base.update(kw)
    return argparse.Namespace(**base)


def _combo(query="autogarage", loc="Amsterdam", slug="autogarage"):
    return {"category": query, "slug": slug, "location": loc,
            "query": f"{query} {loc}", "restriction": targets.location_restriction(loc)}


class TestNoDetailsForTwentyResults(unittest.TestCase):
    """Requirement 14: 20 Text Search results must NOT trigger 20 Details calls."""

    def test_twenty_results_zero_details_requests(self):
        transport = MockTransport(dataset="bulk20")
        guard = CostGuard(operational_mills=100_000, absolute_mills=100_000)
        client = PlacesClient(transport, delay=0.0, cost_guard=guard)
        with tempfile.TemporaryDirectory() as tmp:
            meta = lead_finder._process_combo(client, _combo(), _args(tmp))
        self.assertEqual(meta["businesses_found"], 20)
        self.assertEqual(meta["leads_kept"], 20)
        # THE core assertion: zero Place Details traffic anywhere.
        self.assertEqual(transport.details_calls, 0)
        self.assertEqual(client.counters.place_details_requests, 0)
        self.assertEqual(guard.count_details, 0)
        # Exactly one billable request: the single Text Search page.
        self.assertEqual(client.counters.text_search_requests, 1)
        self.assertEqual(guard.total_mills(), PRICE_MILLS["text"])

    def test_leads_complete_from_text_search_alone(self):
        transport = MockTransport(dataset="bulk20")
        client = PlacesClient(transport, delay=0.0)
        leads = [map_to_lead(s, industry="autogarage")
                 for s in client.search_text("autogarage", max_results=20)]
        self.assertEqual(len(leads), 20)
        for lead in leads:
            self.assertTrue(lead["place_id"])
            self.assertTrue(lead["business_name"])
            self.assertTrue(lead["phone"])
            self.assertTrue(lead["website"])
            self.assertEqual(lead["city"], "Amsterdam")   # from addressComponents
            self.assertIsNotNone(lead["google_rating"])
            self.assertIsNotNone(lead["google_review_count"])
            self.assertIn("place_id:", lead["google_maps_uri"])  # derived locally

    def test_details_fallback_only_without_phone_and_website(self):
        self.assertTrue(needs_details_fallback({"phone": None, "website": None}))
        self.assertFalse(needs_details_fallback({"phone": "030 1", "website": None}))
        self.assertFalse(needs_details_fallback({"phone": None, "website": "https://x.nl"}))

    def test_fallback_disabled_by_default_even_without_contact(self):
        class NoContactTransport:
            def __init__(self):
                self.details_calls = 0

            def text_search(self, body, mask):
                return {"places": [{"id": "NC1", "displayName": {"text": "Geen Contact"},
                                    "formattedAddress": "Stille Steeg 1, 1011 AA Amsterdam",
                                    "businessStatus": "OPERATIONAL"}]}

            def place_details(self, place_id, mask):
                self.details_calls += 1
                return {"id": place_id, "nationalPhoneNumber": "020 999 9999"}

        transport = NoContactTransport()
        client = PlacesClient(transport, delay=0.0)
        with tempfile.TemporaryDirectory() as tmp:
            # default: fallback OFF -> no details even though contact is missing
            lead_finder._process_combo(client, _combo(), _args(tmp))
            self.assertEqual(transport.details_calls, 0)
            # explicitly enabled -> exactly one narrow fallback call
            lead_finder._process_combo(client, _combo(loc="Rotterdam"),
                                       _args(tmp, details_fallback=True))
            self.assertEqual(transport.details_calls, 1)


class TestClosedBusinessesSkipped(unittest.TestCase):
    def test_is_open_business(self):
        self.assertTrue(is_open_business({"business_status": "OPERATIONAL"}))
        self.assertTrue(is_open_business({}))                       # absent => open
        self.assertFalse(is_open_business({"business_status": "CLOSED_PERMANENTLY"}))
        self.assertFalse(is_open_business({"business_status": "CLOSED_TEMPORARILY"}))

    def test_process_combo_skips_closed(self):
        transport = MockTransport(dataset="closed_mix")
        client = PlacesClient(transport, delay=0.0)
        with tempfile.TemporaryDirectory() as tmp:
            meta = lead_finder._process_combo(client, _combo(), _args(tmp))
            self.assertEqual(meta["businesses_found"], 3)
            self.assertEqual(meta["closed"], 2)
            self.assertEqual(meta["leads_kept"], 1)
            saved = storage.read_json(
                Path(tmp) / "industries" / "autogarage" / "leads.json", default={})
            names = [l["business_name"] for l in saved["leads"]]
            self.assertEqual(names, ["Garage Open"])


class TestRunCostLimit(unittest.TestCase):
    def test_run_limit_stops_before_historical_limits(self):
        # History has $1.00 spent; the run may only add ~2 text requests.
        g = CostGuard(operational_mills=500_000, absolute_mills=500_000,
                      run_limit_mills=2 * PRICE_MILLS["text"])
        g.spent_text = 1_000
        self.assertTrue(g.reserve("text"))
        self.assertTrue(g.reserve("text"))
        self.assertFalse(g.reserve("text"))                  # run ceiling, not historical
        self.assertTrue(g.stopped)
        # Cumulative reporting keeps history + this run.
        self.assertEqual(g.total_mills(), 1_000 + 2 * PRICE_MILLS["text"])
        self.assertEqual(g.run_spent_mills, 2 * PRICE_MILLS["text"])

    def test_run_limit_is_not_persisted(self):
        with tempfile.TemporaryDirectory() as tmp:
            p = Path(tmp) / "cost-state.json"
            g1 = CostGuard.load(p, operational_usd=10.0, absolute_usd=20.0,
                                run_limit_usd=0.10)
            g1.reserve("text")
            # A later run WITHOUT a run limit sees cumulative spend but no cap.
            g2 = CostGuard.load(p, operational_usd=10.0, absolute_usd=20.0)
            self.assertIsNone(g2.run_limit_mills)
            self.assertEqual(g2.run_spent_mills, 0)          # per-run counter resets
            self.assertEqual(g2.total_mills(), PRICE_MILLS["text"])  # history kept

    def test_remaining_budget_is_tighter_of_run_and_operational(self):
        g = CostGuard(operational_mills=1_000, absolute_mills=2_000,
                      run_limit_mills=100)
        self.assertEqual(g.remaining_budget_usd(), 0.1)      # run limit binds
        g2 = CostGuard(operational_mills=50, absolute_mills=2_000, run_limit_mills=100)
        self.assertEqual(g2.remaining_budget_usd(), 0.05)    # operational binds


class TestGlobalDedup(unittest.TestCase):
    def test_index_matches_on_place_domain_phone(self):
        idx = batch.GlobalLeadIndex()
        idx.add({"place_id": "A", "website": "https://www.x.nl/", "phone": "+31 6 11111111"})
        self.assertTrue(idx.contains({"place_id": "A"}))
        self.assertTrue(idx.contains({"place_id": "Z", "website": "http://x.nl/contact"}))
        self.assertTrue(idx.contains({"place_id": "Y", "phone": "0031 6 11111111"}))
        self.assertFalse(idx.contains({"place_id": "New", "website": "https://y.nl"}))

    def test_build_reads_every_industry_folder(self):
        with tempfile.TemporaryDirectory() as tmp:
            for slug, pid in (("kapper", "K1"), ("autogarage", "G1")):
                ip = config.make_industry_paths(slug, tmp)
                ip.output.mkdir(parents=True, exist_ok=True)
                storage.save_leads(ip, [{"place_id": pid, "business_name": slug}])
            idx = batch.GlobalLeadIndex.build(tmp)
            self.assertEqual(idx.total, 2)
            self.assertTrue(idx.contains({"place_id": "K1"}))
            self.assertTrue(idx.contains({"place_id": "G1"}))

    def test_process_combo_skips_leads_known_in_other_industry(self):
        with tempfile.TemporaryDirectory() as tmp:
            # bulk_place_007 is already stored under ANOTHER industry folder.
            other = config.make_industry_paths("kapper", tmp)
            other.output.mkdir(parents=True, exist_ok=True)
            storage.save_leads(other, [{"place_id": "bulk_place_007",
                                        "business_name": "Al bekend"}])
            index = batch.GlobalLeadIndex.build(tmp)
            client = PlacesClient(MockTransport(dataset="bulk20"), delay=0.0)
            meta = lead_finder._process_combo(client, _combo(), _args(tmp),
                                              global_index=index)
            self.assertEqual(meta["duplicate_global_existing"], 1)
            self.assertEqual(meta["leads_kept"], 19)


class TestAutomotivePreset(unittest.TestCase):
    def test_preset_exists_with_all_queries(self):
        preset = targets.get_preset("automotive-garages-nl")
        self.assertEqual(preset["slug"], "autogarage")
        for q in ["autogarage", "garagebedrijf", "autobedrijf", "auto reparatie",
                  "auto onderhoud", "autoservice", "automonteur", "APK keuring",
                  "APK station", "bandenservice", "bandengarage", "airco service auto",
                  "uitlaatservice", "versnellingsbak specialist", "diesel specialist"]:
            self.assertIn(q, preset["queries"])
        self.assertEqual(len(preset["queries"]), 15)

    def test_combinations_have_strict_geo_and_one_slug(self):
        preset = targets.get_preset("automotive-garages-nl")
        combos = targets.preset_combinations(preset)
        self.assertEqual(len(combos), 15 * len(preset["locations"]))
        self.assertTrue(all(c["slug"] == "autogarage" for c in combos))
        self.assertTrue(all(c["restriction"] is not None for c in combos))
        rect = combos[0]["restriction"]
        self.assertLess(rect["low"]["latitude"], rect["high"]["latitude"])
        self.assertLess(rect["low"]["longitude"], rect["high"]["longitude"])

    def test_restriction_is_sent_to_the_api(self):
        transport = MockTransport(dataset="bulk20")
        client = PlacesClient(transport, delay=0.0)
        restriction = targets.location_restriction("Amsterdam")
        list(client.search_text("autogarage Amsterdam", max_results=5,
                                restriction=restriction))
        self.assertIn("locationRestriction", transport.last_body)
        self.assertEqual(transport.last_body["locationRestriction"]["rectangle"],
                         restriction)
        self.assertNotIn("locationBias", transport.last_body)

    def test_unknown_preset_raises(self):
        with self.assertRaises(KeyError):
            targets.get_preset("does-not-exist")


RECONCILIATION_KEYS = (
    "duplicate_current_batch", "duplicate_global_existing", "no_phone", "closed",
    "outside_location", "invalid_or_unmappable", "wrong_business_type", "other_skipped",
)


def assert_reconciles(testcase, meta):
    """found must equal kept + every rejection bucket."""
    total = meta["leads_kept"] + sum(meta[k] for k in RECONCILIATION_KEYS)
    testcase.assertEqual(meta["businesses_found"], total,
                         f"reconciliation gap: {meta}")


class TestReconciliationInvariant(unittest.TestCase):
    """found = kept + dup_batch + dup_existing + no_phone + closed
             + outside_location + invalid + wrong_type + other."""

    def test_all_buckets_present_in_meta(self):
        client = PlacesClient(MockTransport(dataset="bulk20"), delay=0.0)
        with tempfile.TemporaryDirectory() as tmp:
            meta = lead_finder._process_combo(client, _combo(), _args(tmp))
        for key in RECONCILIATION_KEYS:
            self.assertIn(key, meta)
        assert_reconciles(self, meta)

    def test_reconciles_with_closed_and_nophone(self):
        client = PlacesClient(MockTransport(dataset="closed_mix"), delay=0.0)
        with tempfile.TemporaryDirectory() as tmp:
            meta = lead_finder._process_combo(client, _combo(), _args(tmp, require_phone=True))
        self.assertEqual(meta["businesses_found"], 3)
        self.assertEqual(meta["closed"], 2)
        assert_reconciles(self, meta)

    def test_existing_and_run_duplicates_counted_separately(self):
        """A lead already in output/ counts as duplicate_global_existing; the SAME
        business re-found by a sibling query counts as duplicate_current_batch."""
        with tempfile.TemporaryDirectory() as tmp:
            other = config.make_industry_paths("kapper", tmp)
            other.output.mkdir(parents=True, exist_ok=True)
            storage.save_leads(other, [{"place_id": "bulk_place_003",
                                        "business_name": "Al bekend"}])
            index = batch.GlobalLeadIndex.build(tmp)

            client = PlacesClient(MockTransport(dataset="bulk20"), delay=0.0)
            first = lead_finder._process_combo(client, _combo(), _args(tmp),
                                               global_index=index)
            self.assertEqual(first["duplicate_global_existing"], 1)   # pre-existing lead
            self.assertEqual(first["duplicate_current_batch"], 0)
            assert_reconciles(self, first)

            # Sibling query returns the same 20 places -> all now "this run".
            second = lead_finder._process_combo(client, _combo(query="apk keuring"),
                                                _args(tmp), global_index=index)
            self.assertEqual(second["duplicate_current_batch"], 19)   # kept by run 1
            self.assertEqual(second["duplicate_global_existing"], 1)  # still the old one
            self.assertEqual(second["leads_kept"], 0)
            assert_reconciles(self, second)

    def test_no_location_or_type_filter_exists(self):
        """These buckets are structurally zero — no city/type filter is applied."""
        client = PlacesClient(MockTransport(dataset="bulk20"), delay=0.0)
        with tempfile.TemporaryDirectory() as tmp:
            # Amsterdam results processed under a Rotterdam combo: still kept.
            meta = lead_finder._process_combo(client, _combo(loc="Rotterdam"), _args(tmp))
        self.assertEqual(meta["outside_location"], 0)
        self.assertEqual(meta["wrong_business_type"], 0)
        self.assertEqual(meta["leads_kept"], 20)                      # nothing city-filtered


class TestPresetCheckpointKeys(unittest.TestCase):
    """Requirement 2: the preset's 450 combos must each have a UNIQUE, stable
    checkpoint key that includes the query — so completing one query for a city
    never skips the other queries for that same city."""

    def _combos(self):
        preset = targets.get_preset("automotive-garages-nl")
        return targets.preset_combinations(preset)

    def test_preset_has_exactly_450_combinations(self):
        self.assertEqual(len(self._combos()), 450)                 # 15 queries x 30 cities

    def test_all_450_checkpoint_keys_unique(self):
        keys = [batch.combo_key(c) for c in self._combos()]
        self.assertEqual(len(keys), 450)
        self.assertEqual(len(set(keys)), 450)                      # no collisions

    def test_key_includes_query_and_location(self):
        c = {"slug": "autogarage", "category": "APK keuring", "location": "Amsterdam"}
        self.assertEqual(batch.combo_key(c), "autogarage|apk-keuring|Amsterdam")

    def test_key_is_process_stable_not_pyhash(self):
        # Same input -> same key, run after run (slugify, never hash()).
        c = {"slug": "autogarage", "category": "diesel specialist", "location": "Breda"}
        self.assertEqual(batch.combo_key(c), batch.combo_key(dict(c)))
        self.assertEqual(batch.combo_key(c), "autogarage|diesel-specialist|Breda")

    def test_completing_one_query_does_not_skip_sibling_queries(self):
        # Requirement: completing "autogarage Amsterdam" must NOT skip
        # "APK keuring Amsterdam".
        combos = self._combos()
        amsterdam = [c for c in combos if c["location"] == "Amsterdam"]
        self.assertEqual(len(amsterdam), 15)
        autogarage = next(c for c in amsterdam if c["category"] == "autogarage")
        apk = next(c for c in amsterdam if c["category"] == "APK keuring")

        state = {"completed": {}, "failed": {}}
        batch.mark_completed(state, autogarage, {"leads_kept": 3})
        self.assertTrue(batch.is_completed(state, autogarage))
        self.assertFalse(batch.is_completed(state, apk))           # sibling still pending
        pending = batch.pending_combos(state, amsterdam)
        self.assertEqual(len(pending), 14)                         # only autogarage removed
        self.assertNotIn("autogarage", [c["category"] for c in pending])
        self.assertIn("APK keuring", [c["category"] for c in pending])

    def test_all_15_amsterdam_queries_marked_independently(self):
        combos = [c for c in self._combos() if c["location"] == "Amsterdam"]
        state = {"completed": {}, "failed": {}}
        for i, c in enumerate(combos):
            batch.mark_completed(state, c)
            # exactly i+1 marked, and every earlier one still individually complete
            self.assertEqual(len(state["completed"]), i + 1)
        self.assertEqual(len(state["completed"]), 15)
        self.assertTrue(all(batch.is_completed(state, c) for c in combos))
        self.assertEqual(batch.pending_combos(state, combos), [])

    def test_rerun_skips_only_the_exact_completed_combo(self):
        combos = self._combos()
        target = next(c for c in combos
                      if c["location"] == "Utrecht" and c["category"] == "bandenservice")
        state = {"completed": {}, "failed": {}}
        batch.mark_completed(state, target)
        pending = batch.pending_combos(state, combos)
        self.assertEqual(len(pending), 449)                        # only one removed
        removed = [c for c in combos if c not in pending]
        self.assertEqual(len(removed), 1)
        self.assertEqual((removed[0]["category"], removed[0]["location"]),
                         ("bandenservice", "Utrecht"))


class TestLegacyKeyMigration(unittest.TestCase):
    """Requirement 4: an OLD 2-part key (autogarage|Amsterdam) must not block the
    new preset queries, while a real matrix checkpoint still resumes."""

    def test_legacy_key_does_not_block_any_preset_query(self):
        preset = targets.get_preset("automotive-garages-nl")
        combos = [c for c in targets.preset_combinations(preset)
                  if c["location"] == "Amsterdam"]
        # Simulate the pre-existing matrix checkpoint.
        state = {"completed": {"autogarage|Amsterdam": {"category": "Autogarage",
                                                        "location": "Amsterdam"}},
                 "failed": {}}
        # NONE of the 15 preset queries (incl. the identical "autogarage") are blocked.
        self.assertTrue(all(not batch.is_completed(state, c) for c in combos))
        self.assertEqual(len(batch.pending_combos(state, combos)), 15)

    def test_legacy_key_still_resumes_matrix_combo(self):
        # A non-preset (matrix) combo IS honoured by its legacy 2-part key.
        matrix_combo = list(targets.iter_combinations(["Autogarage"], ["Amsterdam"]))[0]
        self.assertNotIn("preset", matrix_combo)
        state = {"completed": {"autogarage|Amsterdam": {}}, "failed": {}}
        self.assertTrue(batch.is_completed(state, matrix_combo))
        # ...and an aliased slug (dakdekker -> dakdekkers) resumes too.
        dd = list(targets.iter_combinations(["Dakdekker"], ["Amsterdam"]))[0]
        state2 = {"completed": {"dakdekkers|Amsterdam": {}}, "failed": {}}
        self.assertTrue(batch.is_completed(state2, dd))

    def test_new_completion_uses_three_part_key(self):
        state = {"completed": {}, "failed": {}}
        combo = list(targets.iter_combinations(["Autogarage"], ["Amsterdam"]))[0]
        batch.mark_completed(state, combo)
        self.assertIn("autogarage|autogarage|Amsterdam", state["completed"])


class TestPresetIntegration450(unittest.TestCase):
    """Requirement 6: all 450 combos remain independently processable end-to-end."""

    def _run(self, tmp):
        argv = [
            "--log-level", "ERROR", "--mock", "--output-dir", tmp, "batch",
            "--preset", "automotive-garages-nl", "--round-robin",
            "--max-results", "60", "--budget", "100000",
            "--usd-budget", "10000", "--safety-pct", "0", "--yes",
        ]
        with redirect_stdout(io.StringIO()):
            return lead_finder.main(argv)

    def test_mock_run_all_450_writes_autogarage_folder_and_unique_checkpoints(self):
        with tempfile.TemporaryDirectory() as tmp:
            rc = self._run(tmp)
            self.assertEqual(rc, 0)
            # One shared folder for the whole preset (requirement 3).
            leads_path = Path(tmp) / "industries" / "autogarage" / "leads.json"
            self.assertTrue(leads_path.exists())
            self.assertFalse((Path(tmp) / "industries" / "autogarages").exists())
            # All 450 combos completed under distinct query-aware keys.
            state = json.loads((Path(tmp) / "batch-progress.json").read_text(encoding="utf-8"))
            self.assertEqual(len(state["completed"]), 450)
            amsterdam_keys = [k for k in state["completed"] if k.endswith("|Amsterdam")]
            self.assertEqual(len(amsterdam_keys), 15)              # 15 distinct queries kept
            # A second run is a no-op: everything already completed.
            rc2 = self._run(tmp)
            self.assertEqual(rc2, 0)
            state2 = json.loads((Path(tmp) / "batch-progress.json").read_text(encoding="utf-8"))
            self.assertEqual(len(state2["completed"]), 450)        # unchanged, none re-added


class TestPaginationCap(unittest.TestCase):
    class EndlessPagesTransport:
        def __init__(self):
            self.calls = 0

        def text_search(self, body, mask):
            self.calls += 1
            return {"places": [{"id": f"pg{self.calls}_{i}"} for i in range(20)],
                    "nextPageToken": f"T{self.calls}"}   # always another page

        def place_details(self, place_id, mask):  # pragma: no cover
            return {"id": place_id}

    def test_max_three_pages_sixty_results(self):
        transport = self.EndlessPagesTransport()
        client = PlacesClient(transport, delay=0.0)
        results = list(client.search_text("q", max_results=999))
        self.assertEqual(transport.calls, MAX_PAGES)               # 3 pages, no more
        self.assertEqual(len(results), MAX_RESULTS_PER_QUERY)      # 60 results

    def test_field_mask_contains_all_lead_fields(self):
        for fld in ["places.id", "places.displayName", "places.formattedAddress",
                    "places.addressComponents", "places.nationalPhoneNumber",
                    "places.websiteUri", "places.rating", "places.userRatingCount",
                    "places.businessStatus", "places.primaryType", "places.types",
                    "nextPageToken"]:
            self.assertIn(fld, TEXT_SEARCH_FIELDS)


if __name__ == "__main__":
    unittest.main()
