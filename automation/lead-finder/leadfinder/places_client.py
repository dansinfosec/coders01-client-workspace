"""Google Places API (New) client.

Uses ONLY the official Places API — never scrapes maps.google.com. Requests are
sent with field masks so we fetch (and pay for) only the fields we need.

A `Transport` abstraction lets the exact same client run against the real API
(`RealTransport`) or against local fixtures (`MockTransport`). All development
and tests use the mock; real calls happen only when a user runs with a real key
and without --mock.
"""

from __future__ import annotations

import time
from dataclasses import dataclass, field
from typing import Protocol

from .logging_setup import get_logger
from . import mockdata

LOGGER = get_logger()

TEXT_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText"
PLACE_DETAILS_URL = "https://places.googleapis.com/v1/places/{place_id}"

# Field masks — request only what we need (cost + privacy control).
TEXT_SEARCH_FIELDS = ",".join([
    "places.id",
    "places.displayName",
    "places.formattedAddress",
    "places.location",
    "places.primaryType",
    "places.googleMapsUri",
    "places.businessStatus",
    "nextPageToken",
])

PLACE_DETAILS_FIELDS = ",".join([
    "id",
    "displayName",
    "formattedAddress",
    "nationalPhoneNumber",
    "internationalPhoneNumber",
    "websiteUri",
    "googleMapsUri",
    "businessStatus",
    "primaryType",
])


class Transport(Protocol):
    def text_search(self, body: dict, field_mask: str) -> dict: ...
    def place_details(self, place_id: str, field_mask: str) -> dict: ...


@dataclass
class Counters:
    text_search_requests: int = 0
    place_details_requests: int = 0
    retries: int = 0

    @property
    def total(self) -> int:
        return self.text_search_requests + self.place_details_requests

    def as_dict(self) -> dict:
        return {
            "text_search_requests": self.text_search_requests,
            "place_details_requests": self.place_details_requests,
            "retries": self.retries,
            "total_requests": self.total,
        }


# ---------------------------------------------------------------------------
# Transports
# ---------------------------------------------------------------------------

class MockTransport:
    """Returns local fixtures. Records the last field masks for assertions."""

    def __init__(self):
        self.last_text_search_mask = None
        self.last_details_mask = None

    def text_search(self, body: dict, field_mask: str) -> dict:
        self.last_text_search_mask = field_mask
        return mockdata.mock_textsearch(body.get("pageToken"))

    def place_details(self, place_id: str, field_mask: str) -> dict:
        self.last_details_mask = field_mask
        return mockdata.mock_place_details(place_id)


class RealTransport:
    """Calls the live Google Places API. Requires `requests` and an API key."""

    def __init__(self, api_key: str, timeout: float = 20.0):
        import requests  # imported lazily so mock/tests need no network stack
        self._requests = requests
        self.api_key = api_key
        self.timeout = timeout
        self.session = requests.Session()

    def _headers(self, field_mask: str) -> dict:
        return {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": self.api_key,
            "X-Goog-FieldMask": field_mask,
        }

    def text_search(self, body: dict, field_mask: str) -> dict:
        resp = self.session.post(
            TEXT_SEARCH_URL, json=body, headers=self._headers(field_mask), timeout=self.timeout,
        )
        resp.raise_for_status()
        return resp.json()

    def place_details(self, place_id: str, field_mask: str) -> dict:
        resp = self.session.get(
            PLACE_DETAILS_URL.format(place_id=place_id),
            headers=self._headers(field_mask), timeout=self.timeout,
        )
        resp.raise_for_status()
        return resp.json()


# ---------------------------------------------------------------------------
# Client
# ---------------------------------------------------------------------------

class PlacesClient:
    def __init__(self, transport: Transport, budget=None, delay: float = 0.5,
                 max_retries: int = 3):
        self.transport = transport
        self.budget = budget
        self.delay = delay
        self.max_retries = max_retries
        self.counters = Counters()

    def _spend(self, kind: str) -> bool:
        """Charge one request against the budget; return False if over budget."""
        if self.budget is not None and not self.budget.can_spend(1):
            LOGGER.warning("Request budget exhausted (%s used); stopping.",
                           self.budget.max_requests)
            return False
        if self.budget is not None:
            self.budget.spend(1)
        if kind == "text_search":
            self.counters.text_search_requests += 1
        else:
            self.counters.place_details_requests += 1
        return True

    def _with_retries(self, call):
        attempt = 0
        while True:
            try:
                return call()
            except Exception as exc:  # noqa: BLE001 - retry transient errors
                attempt += 1
                if attempt > self.max_retries or not _is_transient(exc):
                    raise
                self.counters.retries += 1
                backoff = min(8.0, 0.5 * (2 ** (attempt - 1)))
                LOGGER.warning("Transient error (%s); retry %d/%d in %.1fs",
                               exc, attempt, self.max_retries, backoff)
                time.sleep(backoff)

    @staticmethod
    def build_search_body(query: str, region=None, city=None, lat=None, lng=None,
                          radius=None, page_token=None) -> dict:
        """Build the Text Search request body."""
        text = query
        location_bits = " ".join(b for b in (city, region) if b)
        if location_bits:
            text = f"{query} in {location_bits}"
        body: dict = {"textQuery": text}
        if lat is not None and lng is not None:
            bias = {"circle": {"center": {"latitude": lat, "longitude": lng}}}
            if radius is not None:
                bias["circle"]["radius"] = float(radius)
            body["locationBias"] = bias
        if page_token:
            body["pageToken"] = page_token
        return body

    def search_text(self, query, region=None, city=None, lat=None, lng=None,
                    radius=None, max_results=50, resume_token=None):
        """Yield place summaries (dicts) across paginated Text Search results."""
        collected = 0
        page_token = resume_token
        first = True
        while collected < max_results:
            if not (first or page_token):
                break
            first = False
            if not self._spend("text_search"):
                break
            body = self.build_search_body(query, region, city, lat, lng, radius, page_token)

            def _call(body=body):
                return self.transport.text_search(body, TEXT_SEARCH_FIELDS)

            data = self._with_retries(_call)
            for place in data.get("places", []):
                yield place
                collected += 1
                if collected >= max_results:
                    break
            page_token = data.get("nextPageToken")
            if not page_token:
                break
            if self.delay:
                time.sleep(self.delay)
        # Expose the final token so callers can persist it for --resume.
        self.last_page_token = page_token

    def place_details(self, place_id: str) -> dict | None:
        if not self._spend("place_details"):
            return None

        def _call():
            return self.transport.place_details(place_id, PLACE_DETAILS_FIELDS)

        data = self._with_retries(_call)
        if self.delay:
            time.sleep(self.delay)
        return data


def _is_transient(exc: Exception) -> bool:
    """Heuristic: retry timeouts, connection errors and 429/5xx HTTP errors."""
    name = type(exc).__name__.lower()
    if "timeout" in name or "connection" in name:
        return True
    status = getattr(getattr(exc, "response", None), "status_code", None)
    return status in (429, 500, 502, 503, 504)
