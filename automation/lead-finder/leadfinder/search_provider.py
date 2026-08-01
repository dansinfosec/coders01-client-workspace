"""Web-search provider abstraction for the website-discovery enrichment phase.

Only the OFFICIAL, documented API of each provider is used — never HTML scraping
of a search-results page. A `SearchProvider` Protocol lets the exact same
discovery pipeline run against local fixtures (`MockSearchProvider`, zero network)
or the live Brave Web Search API (`BraveSearchProvider`). All development and
tests use the mock; a real call happens only with a real key and a non-mock run.

Phase 1 implements Brave as the ONLY real provider (Brave Web Search endpoint —
NOT Brave's summarizer/answer or any LLM endpoint). Serper/SerpApi/Google CSE are
intentionally NOT implemented yet.

IMPORTANT — Brave result-storage restriction (checked against Brave's Terms of
Service): the standard subscription PROHIBITS storing/caching Search Results
(titles, snippets, rankings, response bodies) beyond transient in-process use,
unless a plan with explicit storage rights is held. Therefore:
  * `SearchResult` objects live ONLY in memory during processing of one lead;
  * the discovery layer persists NONE of Brave's returned content — it keeps only
    the candidate URL/domain it chose to verify, and derives every stored fact by
    independently fetching the candidate's own public website.
This module never writes anything to disk.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol, runtime_checkable

from .logging_setup import get_logger

LOGGER = get_logger()

# Brave Web Search API (the classic search endpoint — not the summarizer).
BRAVE_WEB_SEARCH_URL = "https://api.search.brave.com/res/v1/web/search"


@dataclass
class SearchResult:
    """One organic web result. TRANSIENT — never persisted (see module docstring).

    `snippet`/`title` are carried only so a provider adapter can normalize its
    payload uniformly; the discovery layer reads `url` and immediately discards
    the rest. Nothing here is written to any output file.
    """
    url: str
    title: str = ""
    snippet: str = ""


class SearchError(Exception):
    """A non-retryable search failure (bad request, auth, unexpected payload)."""


class TransientSearchError(SearchError):
    """A retryable search failure (timeout, HTTP 429, or 5xx)."""


@runtime_checkable
class SearchProvider(Protocol):
    name: str

    def search(self, query: str, *, count: int = 5) -> list[SearchResult]:
        """Return up to `count` organic web results for `query`.

        Performs exactly ONE billable request. Raises TransientSearchError for
        retryable conditions (timeout/429/5xx) and SearchError otherwise, so the
        caller controls retry + cost reservation.
        """
        ...


# ---------------------------------------------------------------------------
# Mock provider (fixtures, zero network)
# ---------------------------------------------------------------------------

class MockSearchProvider:
    """Returns local fixtures keyed by normalized query. Records calls for tests."""

    name = "mock"

    def __init__(self):
        self.queries: list[str] = []

    def search(self, query: str, *, count: int = 5) -> list[SearchResult]:
        from . import mockdata
        self.queries.append(query)
        results = mockdata.mock_web_search(query, count=count)
        return [SearchResult(url=r["url"], title=r.get("title", ""),
                             snippet=r.get("snippet", "")) for r in results[:count]]


# ---------------------------------------------------------------------------
# Brave Web Search (the only real provider in phase 1)
# ---------------------------------------------------------------------------

class BraveSearchProvider:
    """Live Brave Web Search API. Requires `requests` and a subscription token.

    The token is passed via the X-Subscription-Token header and is NEVER logged
    or included in any exception message.
    """

    name = "brave"

    def __init__(self, api_key: str, timeout: float = 10.0,
                 country: str = "nl", search_lang: str = "nl"):
        import requests  # lazy import so mock/tests need no network stack
        self._requests = requests
        self._api_key = api_key
        self.timeout = timeout
        self.country = country
        self.search_lang = search_lang
        self.session = requests.Session()
        self.session.headers.update({
            "Accept": "application/json",
            "Accept-Encoding": "gzip",
            "X-Subscription-Token": api_key,
        })

    def search(self, query: str, *, count: int = 5) -> list[SearchResult]:
        params = {
            "q": query,
            "count": max(1, min(int(count), 20)),
            "country": self.country,
            "search_lang": self.search_lang,
            # Ask only for web results; no summarizer/answer, no extra features.
            "result_filter": "web",
            "safesearch": "off",
        }
        try:
            resp = self.session.get(BRAVE_WEB_SEARCH_URL, params=params, timeout=self.timeout)
        except self._requests.exceptions.Timeout as exc:
            raise TransientSearchError("brave request timed out") from exc
        except self._requests.exceptions.ConnectionError as exc:
            raise TransientSearchError("brave connection error") from exc
        except self._requests.RequestException as exc:  # noqa: BLE001
            # Deliberately do NOT include exc text — it could echo the request URL
            # (harmless) but we keep provider errors opaque and key-free.
            raise SearchError("brave request failed") from None

        status = resp.status_code
        if status == 429 or 500 <= status < 600:
            raise TransientSearchError(f"brave transient HTTP {status}")
        if status != 200:
            raise SearchError(f"brave HTTP {status}")
        try:
            data = resp.json()
        except ValueError as exc:
            raise SearchError("brave returned non-JSON") from exc
        return _parse_brave(data, count)


def _parse_brave(data: dict, count: int) -> list[SearchResult]:
    """Extract organic web results from a Brave Web Search payload."""
    web = (data or {}).get("web") or {}
    items = web.get("results") or []
    out: list[SearchResult] = []
    for item in items:
        if not isinstance(item, dict):
            continue
        url = item.get("url")
        if not url:
            continue
        out.append(SearchResult(url=url,
                                title=item.get("title", "") or "",
                                snippet=item.get("description", "") or ""))
        if len(out) >= count:
            break
    return out


def is_transient(exc: Exception) -> bool:
    return isinstance(exc, TransientSearchError)
