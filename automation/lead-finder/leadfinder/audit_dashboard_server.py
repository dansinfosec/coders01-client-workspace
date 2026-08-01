"""Local-only HTTP server for the Autogarage Audit & Sales Review dashboard.

Stdlib only (http.server) — no Flask/FastAPI/other framework dependency,
matching this project's minimal-dependency policy. Binds to 127.0.0.1 ONLY,
never 0.0.0.0 — this is a local review tool for one operator, not a service
to expose on a network.

Makes zero outbound network requests: every handler either serves the
dashboard HTML/data (leadfinder.audit_dashboard) or persists a human
decision / export (leadfinder.human_review) — both fully offline, reading
and writing only already-stored files under output/industries/<industry>/.

Request logging is method + path + status only — request BODIES (which can
contain business names/notes) are never logged, so no personal lead data
ever reaches stdout/log files via this server.

IMPORTANT — saving requires THIS server to be running. The dashboard HTML
(leadfinder/audit_dashboard.py) also gets written as a static file
(`audit-review-dashboard.html`) for viewing via `file://` when --serve isn't
used. Opening that file directly and trying to save a decision reproduces
"Failed to fetch" 100% of the time: a relative fetch("/api/decision") from a
`file://` document resolves to `file:///api/decision`, which Chrome refuses
outright (no server exists at that "URL"). This is not fixable by changing
the fetch URL — persistence fundamentally requires a live backend. The
frontend now detects `location.protocol === "file:"` on load and shows an
explicit banner instead of a bare "Failed to fetch" the first time a save is
attempted. Always start the server (`dashboard --audit-review --serve`) and
open the PRINTED http://127.0.0.1:<port>/ URL to review and save.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from . import audit_dashboard as ad
from . import human_review as hr
from . import audit_queues as aq
from .logging_setup import get_logger

LOGGER = get_logger()


def make_handler(industry: str, output_dir=None):
    from . import config
    paths = config.make_industry_paths(industry, output_dir)

    class Handler(BaseHTTPRequestHandler):
        server_version = "AutogarageAuditDashboard/1.0"

        def log_message(self, fmt, *args):
            # Method + path + status only — never the request body.
            LOGGER.info("[audit-dashboard] %s", (fmt % args))

        def _send_json(self, status: int, payload: dict) -> None:
            body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
            self.send_response(status)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(body)

        def _send_html(self, html: str) -> None:
            body = html.encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(body)

        def _read_json_body(self) -> dict:
            length = int(self.headers.get("Content-Length") or 0)
            if length <= 0:
                return {}
            raw = self.rfile.read(length)
            return json.loads(raw.decode("utf-8")) if raw else {}

        def do_GET(self):  # noqa: N802 - http.server API
            try:
                if self.path.startswith("/api/health"):
                    self._send_json(200, {"status": "ok", "industry": industry,
                                          "server_time": datetime.now(timezone.utc).isoformat()})
                elif self.path.startswith("/api/data"):
                    payload = ad.build_payload(industry, output_dir)
                    self._send_json(200, payload)
                elif self.path in ("/", "/index.html") or self.path.startswith("/?"):
                    payload = ad.build_payload(industry, output_dir)
                    self._send_html(ad.render(payload))
                else:
                    self._send_json(404, {"error": "not_found", "path": self.path})
            except Exception as exc:  # noqa: BLE001 - never crash the server on a bad request
                LOGGER.error("[audit-dashboard] GET %s failed: %s", self.path, exc)
                self._send_json(500, {"error": "internal_error", "detail": str(exc)})

        def do_POST(self):  # noqa: N802 - http.server API
            try:
                if self.path == "/api/decision":
                    body = self._read_json_body()
                    place_id = body.get("place_id")
                    fields = body.get("fields") or {}
                    if not place_id:
                        self._send_json(400, {"error": "place_id is required"})
                        return
                    latest, provenance, _ = aq.load_combined_latest(industry, output_dir)
                    record = latest.get(place_id)
                    decision = hr.save_decision(paths, place_id, fields, record=record,
                                                source_run=provenance.get(place_id))
                    self._send_json(200, {"decision": decision})
                elif self.path == "/api/export-human-review":
                    report = hr.export_completed_review_csv(industry, output_dir)
                    self._send_json(200, report)
                elif self.path == "/api/first-call-batch":
                    body = self._read_json_body()
                    max_n = int(body.get("max_n", 50))
                    report = hr.build_first_call_batch(industry, output_dir, max_n=max_n)
                    self._send_json(200, report)
                else:
                    self._send_json(404, {"error": "not_found", "path": self.path})
            except ValueError as exc:
                self._send_json(400, {"error": str(exc)})
            except Exception as exc:  # noqa: BLE001 - never crash the server on a bad request
                LOGGER.error("[audit-dashboard] POST %s failed: %s", self.path, exc)
                self._send_json(500, {"error": "internal_error", "detail": str(exc)})

    return Handler


def serve(industry: str, output_dir=None, host: str = "127.0.0.1", port: int = 8765) -> None:
    """Blocking call — runs the local review server until interrupted
    (Ctrl+C). Always binds to a loopback address; never 0.0.0.0."""
    handler = make_handler(industry, output_dir)
    httpd = ThreadingHTTPServer((host, port), handler)
    LOGGER.info("Autogarage audit dashboard serving at http://%s:%s/ (industry=%s)", host, port, industry)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        httpd.server_close()
