"""Tests for leadfinder/audit_dashboard.py + audit_dashboard_server.py — the
Autogarage Audit & Sales Review dashboard.

No Brave, no Google Places, no outbound HTTP fetch anywhere in these
modules. The local server tests bind to 127.0.0.1 on an OS-assigned port
(port 0) and are torn down at the end of each test.
"""

import json
import sys
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
from http.server import ThreadingHTTPServer
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from leadfinder import config, storage  # noqa: E402
from leadfinder import audit_dashboard as ad  # noqa: E402
from leadfinder import audit_dashboard_server as ads  # noqa: E402
from leadfinder import human_review as hr  # noqa: E402
from leadfinder import website_audit_pilot as wap  # noqa: E402


def _lead(pid, name="Garage X", city="Ede", phone="020 000 0000"):
    return {"place_id": pid, "business_name": name, "city": city, "phone": phone,
            "address": "Weg 1, 1000AA Ede", "website": f"https://{pid}.nl/"}


def _record(pid, **overrides):
    base = {
        "place_id": pid, "business_name": "Garage X", "city": "Ede",
        "website_source": wap.GOOGLE_SUPPLIED, "submitted_url": f"https://{pid}.nl/",
        "final_url": f"https://{pid}.nl/", "outcome": wap.OUTCOME_SUCCESS, "reachable": True,
        "industry_relevance_status": wap.REL_AUTOMOTIVE_CONFIRMED,
        "excluded_from_automatic_garage_outreach": False,
        "identity_confidence": "high", "identity_match_outcome": "match",
        "manual_review_required": False, "external_redirect": False,
        "final_audit_classification": "B_basic_website",
        "garage_feature_score": 50, "website_quality_score": 90,
        "has_visible_phone": True, "mobile_viewport": True,
    }
    base.update(overrides)
    return base


def _seed(n=5, business_names=None):
    d = tempfile.mkdtemp()
    base = config.make_industry_paths("autogarage", d)
    base.ensure()
    names = business_names or {}
    leads = [_lead(f"p{i}", name=names.get(f"p{i}", "Garage X")) for i in range(n)]
    storage.save_leads(base, leads)
    reeval = config.make_industry_paths("autogarage", d, run_tag="audit-pilot1-reeval")
    reeval.ensure()
    records = {f"p{i}": _record(f"p{i}", business_name=names.get(f"p{i}", "Garage X")) for i in range(n)}
    wap.save_pilot_results(reeval, records)
    return d, base


class TestBuildPayload(unittest.TestCase):
    def test_overview_counts_match_underlying_data(self):
        d, base = _seed(5)
        payload = ad.build_payload("autogarage", d)
        self.assertEqual(payload["overview"]["sales_ready_priority"] + payload["overview"]["sales_ready_secondary"],
                         payload["overview"]["strict_sales_ready_total"])
        self.assertEqual(len(payload["tabs"]["priority"]), payload["overview"]["sales_ready_priority"])

    def test_progress_counts_update_after_decision_saved(self):
        d, base = _seed(5)
        paths = config.make_industry_paths("autogarage", d)
        before = ad.build_payload("autogarage", d)
        self.assertEqual(before["overview"]["human_review_sample_completed"], 0)
        hr.save_decision(paths, "p0", {"verdict": "approve"})
        # p0 isn't necessarily in the fixed 100-sample CSV (none seeded here),
        # so seed a minimal sample CSV to exercise the "sample" counting path.
        import csv
        cols = ["place_id", "business_name", "city"]
        with open(base.output / "sales-ready-validation-human-review.csv", "w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=cols)
            w.writeheader()
            w.writerow({"place_id": "p0", "business_name": "Garage X", "city": "Ede"})
        after = ad.build_payload("autogarage", d)
        self.assertEqual(after["overview"]["human_review_sample_completed"], 1)
        self.assertEqual(after["overview"]["human_review_sample_remaining"], 0)
        self.assertEqual(after["overview"]["verdict_approve"], 1)

    def test_no_hardcoded_counts_reflect_current_files(self):
        d, base = _seed(3)
        payload = ad.build_payload("autogarage", d)
        self.assertEqual(payload["overview"]["total_audited"], 3)


class TestHtmlEscaping(unittest.TestCase):
    def test_malicious_business_name_is_escaped_in_rendered_html(self):
        malicious = "</script><img src=x onerror=alert(1)>"
        d, base = _seed(1, business_names={"p0": malicious})
        payload = ad.build_payload("autogarage", d)
        html = ad.render(payload)
        # The dangerous literal sequence must never appear unescaped — the
        # JSON-embedding step replaces every "<" with "\u003c" (same
        # technique as leadfinder/dashboard.py), so "</script>" can never
        # break out of the inline <script> block.
        self.assertNotIn("</script><img", html)
        # Every literal "<" in the embedded JSON is escaped to \u003c (same
        # technique as leadfinder/dashboard.py) — the trailing ">" needs no
        # escaping since a lone ">" cannot close a <script> block.
        self.assertIn("\\u003c/script>", html)
        # And the JS renders every field via textContent, never innerHTML —
        # structural guarantee, checked here at the source level.
        import inspect
        src = inspect.getsource(ad)
        self.assertNotIn(".innerHTML", src)

    def test_html_is_valid_around_embedded_json(self):
        d, base = _seed(2)
        payload = ad.build_payload("autogarage", d)
        html = ad.render(payload)
        self.assertTrue(html.strip().startswith("<!doctype html>"))
        self.assertTrue(html.strip().endswith("</html>"))


class TestNoNetworkImports(unittest.TestCase):
    def test_dashboard_module_has_no_network_import(self):
        import inspect
        for mod in (ad, ads, hr):
            src = inspect.getsource(mod)
            for forbidden in ("import requests", "BraveSearchProvider", "PlacesClient",
                             "from .search_provider", "from .places_client"):
                self.assertNotIn(forbidden, src, f"{mod.__name__} references {forbidden}")

    def test_server_binds_loopback_by_default(self):
        import inspect
        src = inspect.getsource(ads)
        self.assertIn('host: str = "127.0.0.1"', src)


class _ServerCase(unittest.TestCase):
    def setUp(self):
        self.dir, self.base = _seed(5)
        handler = ads.make_handler("autogarage", self.dir)
        self.httpd = ThreadingHTTPServer(("127.0.0.1", 0), handler)
        self.port = self.httpd.server_address[1]
        self.thread = threading.Thread(target=self.httpd.serve_forever, daemon=True)
        self.thread.start()

    def tearDown(self):
        self.httpd.shutdown()
        self.httpd.server_close()
        self.thread.join(timeout=5)

    def _get(self, path):
        with urllib.request.urlopen(f"http://127.0.0.1:{self.port}{path}", timeout=5) as resp:
            return resp.status, resp.read().decode("utf-8")

    def _post(self, path, body):
        data = json.dumps(body).encode("utf-8")
        req = urllib.request.Request(f"http://127.0.0.1:{self.port}{path}", data=data,
                                     headers={"Content-Type": "application/json"}, method="POST")
        with urllib.request.urlopen(req, timeout=5) as resp:
            return resp.status, resp.read().decode("utf-8")


class TestServerEndpoints(_ServerCase):
    def test_get_root_serves_html(self):
        status, body = self._get("/")
        self.assertEqual(status, 200)
        self.assertIn("<!doctype html>", body)

    def test_get_api_data_serves_json(self):
        status, body = self._get("/api/data")
        self.assertEqual(status, 200)
        payload = json.loads(body)
        self.assertIn("overview", payload)

    def test_post_decision_persists_and_is_readable_after(self):
        status, body = self._post("/api/decision", {"place_id": "p0", "fields": {"verdict": "approve"}})
        self.assertEqual(status, 200)
        result = json.loads(body)
        self.assertEqual(result["decision"]["verdict"], "approve")
        paths = config.make_industry_paths("autogarage", self.dir)
        decisions = hr.load_decisions(paths)
        self.assertEqual(decisions["p0"]["verdict"], "approve")

    def test_post_decision_missing_place_id_is_400(self):
        with self.assertRaises(urllib.error.HTTPError) as ctx:
            self._post("/api/decision", {"fields": {"verdict": "approve"}})
        self.assertEqual(ctx.exception.code, 400)

    def test_post_export_human_review(self):
        import csv
        cols = ["place_id", "business_name", "city"]
        with open(self.base.output / "sales-ready-validation-human-review.csv", "w",
                 newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=cols)
            w.writeheader()
            w.writerow({"place_id": "p0", "business_name": "Garage X", "city": "Ede"})
        status, body = self._post("/api/export-human-review", {})
        self.assertEqual(status, 200)
        result = json.loads(body)
        self.assertEqual(result["total"], 1)

    def test_post_first_call_batch(self):
        paths = config.make_industry_paths("autogarage", self.dir)
        for pid in ("p0", "p1"):
            hr.save_decision(paths, pid, {"verdict": "approve", "business_identity_correct": "yes",
                                          "real_autogarage": "yes", "valid_sales_opportunity": "yes",
                                          "phone_usable": "yes"})
        status, body = self._post("/api/first-call-batch", {})
        self.assertEqual(status, 200)
        result = json.loads(body)
        self.assertEqual(result["count"], 2)

    def test_unknown_route_is_404(self):
        with self.assertRaises(urllib.error.HTTPError) as ctx:
            self._get("/api/does-not-exist")
        self.assertEqual(ctx.exception.code, 404)

    def test_get_health_endpoint(self):
        status, body = self._get("/api/health")
        self.assertEqual(status, 200)
        payload = json.loads(body)
        self.assertEqual(payload["status"], "ok")
        self.assertEqual(payload["industry"], "autogarage")
        self.assertIn("server_time", payload)

    def test_post_decision_repeated_does_not_duplicate(self):
        # Save the same place_id 3 times via the live server (as "Opslaan en
        # volgende" would if clicked repeatedly) — must still be exactly one
        # decision, last write wins, never appended/duplicated.
        for verdict in ("manual_review", "reject", "approve"):
            status, body = self._post("/api/decision", {"place_id": "p0", "fields": {"verdict": verdict}})
            self.assertEqual(status, 200)
        paths = config.make_industry_paths("autogarage", self.dir)
        decisions = hr.load_decisions(paths)
        self.assertEqual(len(decisions), 1)
        self.assertEqual(decisions["p0"]["verdict"], "approve")

    def test_server_error_returns_structured_json_with_detail_and_keeps_serving(self):
        import unittest.mock as mock
        with mock.patch.object(hr, "save_decision", side_effect=RuntimeError("boom - disk full")):
            with self.assertRaises(urllib.error.HTTPError) as ctx:
                self._post("/api/decision", {"place_id": "p0", "fields": {"verdict": "approve"}})
            self.assertEqual(ctx.exception.code, 500)
            body = json.loads(ctx.exception.read().decode("utf-8"))
            self.assertEqual(body["error"], "internal_error")
            self.assertIn("boom - disk full", body["detail"])
        # The server must still be usable after an internal error — it must
        # never crash or leave the socket in a bad state.
        status, body2 = self._get("/api/health")
        self.assertEqual(status, 200)

    def test_original_files_unchanged_by_server_interactions(self):
        leads_before = (self.base.output / "leads.json").read_bytes()
        reeval_paths = config.make_industry_paths("autogarage", self.dir, run_tag="audit-pilot1-reeval")
        reeval_before = reeval_paths.audit_pilot_results_json.read_bytes()

        self._post("/api/decision", {"place_id": "p0", "fields": {"verdict": "approve"}})
        try:
            self._get("/api/does-not-exist")
        except urllib.error.HTTPError:
            pass

        self.assertEqual((self.base.output / "leads.json").read_bytes(), leads_before)
        self.assertEqual(reeval_paths.audit_pilot_results_json.read_bytes(), reeval_before)


class TestUnreachableServer(unittest.TestCase):
    """Simulates the reported bug: the page was loaded while a server was up,
    then the server stopped (crashed / terminal closed) — a save attempt must
    fail with a clean, catchable connection error, never hang."""

    def test_request_to_stopped_server_fails_cleanly(self):
        d, base = _seed(2)
        handler = ads.make_handler("autogarage", d)
        httpd = ThreadingHTTPServer(("127.0.0.1", 0), handler)
        port = httpd.server_address[1]
        thread = threading.Thread(target=httpd.serve_forever, daemon=True)
        thread.start()
        httpd.shutdown()
        httpd.server_close()
        thread.join(timeout=5)

        data = json.dumps({"place_id": "p0", "fields": {"verdict": "approve"}}).encode("utf-8")
        req = urllib.request.Request(f"http://127.0.0.1:{port}/api/decision", data=data,
                                     headers={"Content-Type": "application/json"}, method="POST")
        with self.assertRaises(OSError):   # ConnectionRefusedError / URLError wraps OSError
            urllib.request.urlopen(req, timeout=5)

    def test_stopped_server_does_not_corrupt_decisions_file(self):
        d, base = _seed(2)
        paths = config.make_industry_paths("autogarage", d)
        hr.save_decision(paths, "p0", {"verdict": "approve"})
        before = paths.human_review_decisions_json.read_bytes()

        handler = ads.make_handler("autogarage", d)
        httpd = ThreadingHTTPServer(("127.0.0.1", 0), handler)
        port = httpd.server_address[1]
        thread = threading.Thread(target=httpd.serve_forever, daemon=True)
        thread.start()
        httpd.shutdown()
        httpd.server_close()
        thread.join(timeout=5)

        data = json.dumps({"place_id": "p1", "fields": {"verdict": "reject"}}).encode("utf-8")
        req = urllib.request.Request(f"http://127.0.0.1:{port}/api/decision", data=data,
                                     headers={"Content-Type": "application/json"}, method="POST")
        try:
            urllib.request.urlopen(req, timeout=5)
        except OSError:
            pass
        self.assertEqual(paths.human_review_decisions_json.read_bytes(), before)


class TestFrontendErrorClassification(unittest.TestCase):
    """The JS-side ApiError classification (server unreachable / not found /
    validation / server error / invalid JSON) is structural JS, which this
    Python suite can't execute — verified here at the source level, and
    interactively in a real browser during implementation."""

    def test_api_error_kinds_present_in_source(self):
        import inspect
        src = inspect.getsource(ad)
        for kind in ("unreachable", "not_found", "validation", "server_error", "invalid_json"):
            self.assertIn(f'"{kind}"', src)

    def test_file_protocol_warning_present_in_source(self):
        import inspect
        src = inspect.getsource(ad)
        self.assertIn('location.protocol === "file:"', src)

    def test_health_check_and_connectivity_badge_present_in_source(self):
        import inspect
        src = inspect.getsource(ad)
        self.assertIn("checkHealth", src)
        self.assertIn("connStatus", src)

    def test_failed_save_never_advances_or_clears_state(self):
        import inspect
        src = inspect.getsource(ad)
        persist_start = src.index("async function persist(advance)")
        persist_body = src[persist_start:persist_start + 900]
        catch_start = persist_body.index("} catch(e){")
        catch_block = persist_body[catch_start:]
        self.assertNotIn("goNext()", catch_block[:200])
        self.assertNotIn("renderAll()", catch_block[:200])


if __name__ == "__main__":
    unittest.main()
