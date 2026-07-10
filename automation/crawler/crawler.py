#!/usr/bin/env python3
"""Coders01 reusable website crawler (Stage 1 of the workflow).

Crawls the publicly accessible pages of a single site and stores the raw HTML
plus a JSON index and a crawl report inside a client's ``scraped/`` folder.

Design goals (see ../../docs/WORKFLOW.md and ../../docs/SCRAPING-POLICY.md):
  * Client-agnostic and reusable -- the target and output are CLI inputs.
  * Only crawls publicly accessible pages; respects robots.txt.
  * Configurable delay between requests (polite crawling).
  * Stays on the same registered domain by default.
  * De-duplicates URLs and guards against infinite loops.
  * Honours a configurable maximum number of pages.

It deliberately does NOT download images or other binary assets -- that is the
job of the separate ``automation/image-downloader`` tool.
"""

from __future__ import annotations

import argparse
import json
import logging
import re
import sys
import time
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from hashlib import sha1
from pathlib import Path
from typing import Iterable, Optional
from urllib.parse import urldefrag, urljoin, urlparse, urlunparse
from urllib.robotparser import RobotFileParser

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError as exc:  # pragma: no cover - exercised only without deps
    print(
        "Missing dependencies. Install them with:\n"
        "    pip install -r requirements.txt",
        file=sys.stderr,
    )
    raise SystemExit(1) from exc


DEFAULT_USER_AGENT = "Coders01Crawler/1.0 (+reusable-workspace-crawler)"
LOGGER = logging.getLogger("coders01.crawler")


# ---------------------------------------------------------------------------
# Pure helpers (unit-tested)
# ---------------------------------------------------------------------------

def normalize_url(url: str, base: Optional[str] = None) -> str:
    """Return a canonical form of ``url`` for de-duplication.

    * Resolves relative links against ``base`` when provided.
    * Lower-cases the scheme and host.
    * Drops fragments (``#section``).
    * Removes default ports (``:80`` / ``:443``).
    * Strips a trailing slash from the path (except the root ``/``).

    Query strings are preserved because they can select distinct content.
    """
    if base:
        url = urljoin(base, url)
    url, _frag = urldefrag(url)
    parts = urlparse(url)

    scheme = parts.scheme.lower()
    hostname = (parts.hostname or "").lower()

    # Rebuild netloc, dropping default ports and preserving credentials.
    netloc = hostname
    if parts.port and not (
        (scheme == "http" and parts.port == 80)
        or (scheme == "https" and parts.port == 443)
    ):
        netloc = f"{hostname}:{parts.port}"
    if parts.username:
        auth = parts.username
        if parts.password:
            auth += f":{parts.password}"
        netloc = f"{auth}@{netloc}"

    path = parts.path or "/"
    if len(path) > 1 and path.endswith("/"):
        path = path.rstrip("/")

    return urlunparse((scheme, netloc, path, parts.params, parts.query, ""))


def registered_host(url: str) -> str:
    """Return the lower-cased hostname of ``url`` (no port)."""
    return (urlparse(url).hostname or "").lower()


def is_same_domain(url: str, root_host: str, include_subdomains: bool = False) -> bool:
    """Return True when ``url`` belongs to ``root_host``.

    By default only the exact host matches. When ``include_subdomains`` is set,
    any host ending in ``.root_host`` also matches (e.g. ``www.`` / ``blog.``).
    """
    host = registered_host(url)
    if not host:
        return False
    root_host = root_host.lower()
    if host == root_host:
        return True
    if include_subdomains and host.endswith("." + root_host):
        return True
    return False


def url_to_filename(url: str, max_length: int = 100) -> str:
    """Build a safe, collision-resistant ``.html`` filename for ``url``.

    The path is slugified for readability and a short hash of the full
    normalized URL is appended so that different query strings never collide.
    """
    parts = urlparse(url)
    path = parts.path.strip("/")
    slug = re.sub(r"[^A-Za-z0-9]+", "_", path).strip("_").lower()
    if not slug:
        slug = "index"
    if len(slug) > max_length:
        slug = slug[:max_length].rstrip("_")

    digest = sha1(url.encode("utf-8")).hexdigest()[:10]
    return f"{slug}-{digest}.html"


# ---------------------------------------------------------------------------
# Data records
# ---------------------------------------------------------------------------

@dataclass
class PageRecord:
    url: str
    status_code: Optional[int]
    title: Optional[str]
    meta_description: Optional[str]
    canonical_url: Optional[str]
    filename: Optional[str]
    content_type: Optional[str] = None
    fetched_at: Optional[str] = None


@dataclass
class CrawlReport:
    start_url: str
    root_host: str
    started_at: str
    finished_at: Optional[str] = None
    max_pages: Optional[int] = None
    delay_seconds: float = 1.0
    include_subdomains: bool = False
    successful: list = field(default_factory=list)
    skipped: list = field(default_factory=list)
    errors: list = field(default_factory=list)

    def as_dict(self) -> dict:
        return asdict(self)


# ---------------------------------------------------------------------------
# Crawler
# ---------------------------------------------------------------------------

class Crawler:
    def __init__(
        self,
        start_url: str,
        output_dir: Path,
        *,
        max_pages: int = 50,
        delay: float = 1.0,
        include_subdomains: bool = False,
        respect_robots: bool = True,
        timeout: float = 15.0,
        user_agent: str = DEFAULT_USER_AGENT,
        session: Optional["requests.Session"] = None,
    ) -> None:
        self.start_url = normalize_url(start_url)
        self.root_host = registered_host(self.start_url)
        if not self.root_host:
            raise ValueError(f"Start URL has no host: {start_url!r}")

        self.output_dir = Path(output_dir)
        self.pages_dir = self.output_dir / "pages"
        self.max_pages = max_pages
        self.delay = max(0.0, delay)
        self.include_subdomains = include_subdomains
        self.respect_robots = respect_robots
        self.timeout = timeout
        self.user_agent = user_agent

        self.session = session or requests.Session()
        self.session.headers.update({"User-Agent": user_agent})

        self._robots: Optional[RobotFileParser] = None
        self.seen: set[str] = set()
        self.records: list[PageRecord] = []
        self.report = CrawlReport(
            start_url=self.start_url,
            root_host=self.root_host,
            started_at=_now_iso(),
            max_pages=max_pages,
            delay_seconds=self.delay,
            include_subdomains=include_subdomains,
        )

    # -- robots.txt --------------------------------------------------------

    def _load_robots(self) -> None:
        if not self.respect_robots:
            return
        parts = urlparse(self.start_url)
        robots_url = urlunparse((parts.scheme, parts.netloc, "/robots.txt", "", "", ""))
        parser = RobotFileParser()
        try:
            resp = self.session.get(robots_url, timeout=self.timeout)
            if resp.status_code >= 400:
                LOGGER.info("No robots.txt (HTTP %s); assuming allow-all", resp.status_code)
                parser.parse([])
            else:
                parser.parse(resp.text.splitlines())
                LOGGER.info("Loaded robots.txt from %s", robots_url)
        except requests.RequestException as exc:
            LOGGER.warning("Could not fetch robots.txt (%s); assuming allow-all", exc)
            parser.parse([])
        self._robots = parser

    def _allowed_by_robots(self, url: str) -> bool:
        if not self.respect_robots or self._robots is None:
            return True
        return self._robots.can_fetch(self.user_agent, url)

    # -- main loop ---------------------------------------------------------

    def crawl(self) -> CrawlReport:
        self.pages_dir.mkdir(parents=True, exist_ok=True)
        self._load_robots()

        queue: list[str] = [self.start_url]
        self.seen.add(self.start_url)

        while queue:
            if len(self.report.successful) >= self.max_pages:
                LOGGER.info("Reached max pages (%s); stopping.", self.max_pages)
                break

            url = queue.pop(0)

            if not self._allowed_by_robots(url):
                LOGGER.info("Skip (robots.txt disallows): %s", url)
                self.report.skipped.append({"url": url, "reason": "robots_disallowed"})
                continue

            record, links = self._fetch(url)
            if record is None:
                continue

            self.records.append(record)
            self.report.successful.append({
                "url": record.url,
                "status_code": record.status_code,
                "filename": record.filename,
            })

            # Enqueue newly discovered, in-scope links.
            for link in links:
                norm = normalize_url(link, base=url)
                if norm in self.seen:
                    continue
                if not is_same_domain(norm, self.root_host, self.include_subdomains):
                    self.report.skipped.append({"url": norm, "reason": "off_domain"})
                    self.seen.add(norm)
                    continue
                if not _looks_like_page(norm):
                    self.report.skipped.append({"url": norm, "reason": "non_html"})
                    self.seen.add(norm)
                    continue
                self.seen.add(norm)
                queue.append(norm)

            if queue and self.delay:
                time.sleep(self.delay)

        self.report.finished_at = _now_iso()
        self._write_outputs()
        return self.report

    # -- fetch one page ----------------------------------------------------

    def _fetch(self, url: str) -> tuple[Optional[PageRecord], list[str]]:
        LOGGER.info("Fetching: %s", url)
        try:
            resp = self.session.get(url, timeout=self.timeout, allow_redirects=True)
        except requests.Timeout:
            LOGGER.warning("Timeout: %s", url)
            self.report.errors.append({"url": url, "error": "timeout"})
            return None, []
        except requests.RequestException as exc:
            LOGGER.warning("Request error for %s: %s", url, exc)
            self.report.errors.append({"url": url, "error": str(exc)})
            return None, []

        content_type = resp.headers.get("Content-Type", "")
        if resp.status_code >= 400:
            LOGGER.warning("HTTP %s: %s", resp.status_code, url)
            self.report.errors.append({
                "url": url, "error": f"http_{resp.status_code}", "status_code": resp.status_code,
            })
            return None, []

        if "html" not in content_type.lower():
            LOGGER.info("Skip (not HTML: %s): %s", content_type or "unknown", url)
            self.report.skipped.append({"url": url, "reason": "non_html_response"})
            return None, []

        final_url = normalize_url(resp.url)
        soup = BeautifulSoup(resp.text, "html.parser")

        filename = url_to_filename(final_url)
        (self.pages_dir / filename).write_text(resp.text, encoding="utf-8")

        record = PageRecord(
            url=final_url,
            status_code=resp.status_code,
            title=_extract_title(soup),
            meta_description=_extract_meta_description(soup),
            canonical_url=_extract_canonical(soup, base=final_url),
            filename=filename,
            content_type=content_type or None,
            fetched_at=_now_iso(),
        )

        links = _extract_links(soup)
        return record, links

    # -- outputs -----------------------------------------------------------

    def _write_outputs(self) -> None:
        index_path = self.output_dir / "index.json"
        report_path = self.output_dir / "crawl-report.json"

        index = {
            "start_url": self.start_url,
            "root_host": self.root_host,
            "generated_at": _now_iso(),
            "page_count": len(self.records),
            "pages": [asdict(r) for r in self.records],
        }
        index_path.write_text(json.dumps(index, indent=2, ensure_ascii=False), encoding="utf-8")
        report_path.write_text(
            json.dumps(self.report.as_dict(), indent=2, ensure_ascii=False), encoding="utf-8"
        )

        LOGGER.info(
            "Done: %s ok, %s skipped, %s errors -> %s",
            len(self.report.successful), len(self.report.skipped),
            len(self.report.errors), self.output_dir,
        )


# ---------------------------------------------------------------------------
# Parsing helpers
# ---------------------------------------------------------------------------

def _extract_title(soup: "BeautifulSoup") -> Optional[str]:
    if soup.title and soup.title.string:
        return soup.title.string.strip()
    return None


def _extract_meta_description(soup: "BeautifulSoup") -> Optional[str]:
    tag = soup.find("meta", attrs={"name": re.compile(r"^description$", re.I)})
    if tag and tag.get("content"):
        return tag["content"].strip()
    return None


def _extract_canonical(soup: "BeautifulSoup", base: str) -> Optional[str]:
    tag = soup.find("link", attrs={"rel": re.compile(r"canonical", re.I)})
    if tag and tag.get("href"):
        return normalize_url(tag["href"], base=base)
    return None


def _extract_links(soup: "BeautifulSoup") -> list[str]:
    links: list[str] = []
    for a in soup.find_all("a", href=True):
        href = a["href"].strip()
        if not href or href.startswith(("#", "mailto:", "tel:", "javascript:")):
            continue
        links.append(href)
    return links


# File extensions that are clearly not crawlable HTML pages.
_NON_PAGE_EXT = {
    ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".ico", ".bmp",
    ".pdf", ".zip", ".gz", ".tar", ".rar", ".7z",
    ".mp3", ".mp4", ".avi", ".mov", ".webm", ".wav",
    ".css", ".js", ".json", ".xml", ".rss", ".woff", ".woff2", ".ttf", ".eot",
    ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".csv",
}


def _looks_like_page(url: str) -> bool:
    ext = Path(urlparse(url).path).suffix.lower()
    return ext not in _NON_PAGE_EXT


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def _resolve_output_dir(args: argparse.Namespace) -> Path:
    if args.output_dir:
        return Path(args.output_dir)
    if args.client:
        # Resolve relative to the workspace root (two levels up from this file).
        workspace_root = Path(__file__).resolve().parents[2]
        return workspace_root / "clients" / args.client / "scraped"
    raise SystemExit("You must provide either --client or --output-dir.")


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="crawler",
        description="Coders01 reusable website crawler (Stage 1). "
                    "Crawls public pages of one site and saves HTML + a JSON index.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "Examples (Windows PowerShell):\n"
            "  python crawler.py https://example.com --client hk-vastgoed\n"
            "  python crawler.py https://example.com --output-dir ..\\..\\clients\\hk-vastgoed\\scraped `\n"
            "      --max-pages 100 --delay 1.5 --include-subdomains\n"
        ),
    )
    parser.add_argument("url", help="Start URL, e.g. https://example.com")
    parser.add_argument(
        "--client",
        help="Client name; output goes to clients/<name>/scraped/ (relative to workspace root).",
    )
    parser.add_argument(
        "--output-dir",
        help="Explicit output directory (overrides --client).",
    )
    parser.add_argument("--max-pages", type=int, default=50, help="Max pages to crawl (default: 50).")
    parser.add_argument("--delay", type=float, default=1.0, help="Delay in seconds between requests (default: 1.0).")
    parser.add_argument("--timeout", type=float, default=15.0, help="Per-request timeout in seconds (default: 15).")
    parser.add_argument(
        "--include-subdomains", action="store_true",
        help="Also crawl subdomains of the start host (default: same host only).",
    )
    parser.add_argument(
        "--ignore-robots", action="store_true",
        help="Do NOT fetch/respect robots.txt. Use only on sites you own/are authorized to crawl.",
    )
    parser.add_argument("--user-agent", default=DEFAULT_USER_AGENT, help="Custom User-Agent header.")
    parser.add_argument(
        "--log-level", default="INFO",
        choices=["DEBUG", "INFO", "WARNING", "ERROR"], help="Logging verbosity (default: INFO).",
    )
    return parser


def main(argv: Optional[Iterable[str]] = None) -> int:
    args = build_arg_parser().parse_args(list(argv) if argv is not None else None)

    logging.basicConfig(
        level=getattr(logging, args.log_level),
        format="%(asctime)s %(levelname)-7s %(message)s",
        datefmt="%H:%M:%S",
    )

    output_dir = _resolve_output_dir(args)
    LOGGER.info("Output directory: %s", output_dir)

    try:
        crawler = Crawler(
            start_url=args.url,
            output_dir=output_dir,
            max_pages=args.max_pages,
            delay=args.delay,
            include_subdomains=args.include_subdomains,
            respect_robots=not args.ignore_robots,
            timeout=args.timeout,
            user_agent=args.user_agent,
        )
    except ValueError as exc:
        LOGGER.error("%s", exc)
        return 2

    report = crawler.crawl()

    print(
        f"\nCrawl finished for {report.start_url}\n"
        f"  successful : {len(report.successful)}\n"
        f"  skipped    : {len(report.skipped)}\n"
        f"  errors     : {len(report.errors)}\n"
        f"  output     : {output_dir}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
