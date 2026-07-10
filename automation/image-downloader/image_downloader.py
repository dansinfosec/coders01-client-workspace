#!/usr/bin/env python3
"""Coders01 reusable image downloader (Stage 2 of the workflow).

Reads the Stage 1 crawler output for a client (``scraped/index.json`` + the
saved HTML in ``scraped/pages/``), extracts content image URLs, filters out
UI/theme junk, de-duplicates (including WordPress ``-WIDTHxHEIGHT`` resize
variants), and downloads the images into ``clients/<client>/assets/images/``.

See ../../docs/WORKFLOW.md (Stage 2) and ../../docs/SCRAPING-POLICY.md.

It is client-agnostic: the client (or explicit paths) are CLI inputs. It does
NOT crawl new pages -- it only works from what the crawler already saved.
"""

from __future__ import annotations

import argparse
import json
import logging
import mimetypes
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


DEFAULT_USER_AGENT = "Coders01ImageDownloader/1.0 (+reusable-workspace-tool)"
LOGGER = logging.getLogger("coders01.image_downloader")

# Formats we download by default (extension, no dot). Configurable via --formats.
DEFAULT_FORMATS = ("jpg", "jpeg", "png", "webp", "avif")

# Extensions that are never content images.
_SKIP_EXT = {"svg", "ico", "gif"}

# Filename / path fragments that mark obvious UI / theme / tracking assets.
_UI_NAME_PATTERNS = re.compile(
    r"(favicon|sprite|spinner|loader|loading|placeholder|blank|"
    r"pixel|spacer|tracking|avatar|badge|icon|logo|"
    r"bg[-_]|background|pattern|divider|separator|arrow|bullet)",
    re.IGNORECASE,
)
_UI_PATH_PATTERNS = re.compile(
    r"(/wp-includes/|/wp-content/plugins/|/wp-content/themes/|"
    r"/wp-content/cache/|/assets/icons?/|/static/icons?/)",
    re.IGNORECASE,
)

# WordPress resize suffix, e.g. "photo-1024x768.jpg" -> base "photo.jpg".
_WP_SIZE_RE = re.compile(r"-(\d+)x(\d+)(?=\.[A-Za-z0-9]+$)")


# ---------------------------------------------------------------------------
# Pure helpers (unit-tested)
# ---------------------------------------------------------------------------

def resolve_url(src: str, base: str) -> str:
    """Resolve ``src`` against the page ``base`` and drop any fragment.

    Query strings are preserved (they can be cache-busters or CDN params).
    """
    joined = urljoin(base, src.strip())
    joined, _frag = urldefrag(joined)
    parts = urlparse(joined)
    scheme = parts.scheme.lower()
    netloc = (parts.hostname or "").lower()
    if parts.port:
        netloc = f"{netloc}:{parts.port}"
    return urlunparse((scheme, netloc, parts.path, parts.params, parts.query, ""))


def parse_srcset(value: str) -> list[tuple[str, str]]:
    """Parse a ``srcset`` attribute into ``(url, descriptor)`` pairs.

    Handles width (``480w``) and density (``2x``) descriptors, and bare URLs.
    Empty / whitespace-only input yields an empty list.
    """
    pairs: list[tuple[str, str]] = []
    if not value:
        return pairs
    for candidate in value.split(","):
        candidate = candidate.strip()
        if not candidate:
            continue
        bits = candidate.split()
        url = bits[0]
        descriptor = bits[1] if len(bits) > 1 else ""
        if url:
            pairs.append((url, descriptor))
    return pairs


def descriptor_width(descriptor: str) -> Optional[int]:
    """Return the pixel width implied by a srcset descriptor, if any.

    ``"768w"`` -> 768; ``"2x"`` / ``""`` -> None.
    """
    if descriptor.endswith("w"):
        try:
            return int(descriptor[:-1])
        except ValueError:
            return None
    return None


def url_extension(url: str) -> str:
    """Lower-case file extension (no dot) of a URL's path, or ``""``."""
    return Path(urlparse(url).path).suffix.lower().lstrip(".")


def canonical_image_key(url: str) -> str:
    """Collapse WordPress resize variants to a single key.

    ``.../photo-1024x768.jpg`` and ``.../photo.jpg`` share the key
    ``host/path/photo.jpg`` (scheme and query ignored) so they de-duplicate.
    """
    parts = urlparse(url)
    path = _WP_SIZE_RE.sub("", parts.path)
    return f"{(parts.hostname or '').lower()}{path.lower()}"


def is_resized_variant(url: str) -> bool:
    """True if the URL path carries a WordPress ``-WIDTHxHEIGHT`` suffix."""
    return bool(_WP_SIZE_RE.search(urlparse(url).path))


def should_filter(
    url: str,
    *,
    width: Optional[int],
    height: Optional[int],
    root_host: str,
    formats: Iterable[str],
    min_dimension: int,
    include_external: bool,
    include_ui: bool,
) -> Optional[str]:
    """Return a skip-reason string if the image should be filtered, else None."""
    if url.startswith("data:"):
        return "data_url"

    host = (urlparse(url).hostname or "").lower()
    if not host:
        return "no_host"
    if not include_external and host != root_host:
        return "off_domain"

    ext = url_extension(url)
    if ext in _SKIP_EXT:
        return f"skip_ext_{ext}" if ext != "svg" else "svg"
    if ext and ext not in set(formats):
        return "unsupported_format"

    if not include_ui:
        path = urlparse(url).path
        if _UI_PATH_PATTERNS.search(path):
            return "ui_path"
        if _UI_NAME_PATTERNS.search(Path(path).name):
            return "ui_name"

    # Dimension-based filtering only when a dimension is actually known.
    if width is not None and height is not None and width <= 2 and height <= 2:
        return "tracking_pixel"
    known = [d for d in (width, height) if d is not None]
    if known and min(known) < min_dimension:
        return "too_small"

    return None


def sanitize_filename(name: str) -> str:
    """Reduce a basename to safe characters, keeping the extension."""
    name = name.strip().replace("%20", "-")
    name = re.sub(r"[^A-Za-z0-9._-]+", "-", name).strip("-._")
    return name or "image"


def build_filename(url: str, taken: dict) -> str:
    """Build a collision-safe filename, preserving the original where possible.

    ``taken`` maps already-assigned filename -> source URL. If a name is taken by
    a *different* URL, a short hash of the URL is inserted before the extension.
    The updated assignment is recorded in ``taken``.
    """
    raw = Path(urlparse(url).path).name
    name = sanitize_filename(raw)
    if "." not in name:
        name = f"{name}.img"

    if taken.get(name) in (None, url):
        taken[name] = url
        return name

    stem, dot, ext = name.rpartition(".")
    digest = sha1(url.encode("utf-8")).hexdigest()[:8]
    candidate = f"{stem}-{digest}{dot}{ext}"
    taken[candidate] = url
    return candidate


def sniff_image_size(data: bytes) -> Optional[tuple[int, int]]:
    """Best-effort (width, height) from image header bytes; None if unknown.

    Supports PNG, GIF, JPEG and WEBP (VP8/VP8L/VP8X) without external deps.
    """
    if len(data) < 24:
        return None
    # PNG
    if data[:8] == b"\x89PNG\r\n\x1a\n" and data[12:16] == b"IHDR":
        w = int.from_bytes(data[16:20], "big")
        h = int.from_bytes(data[20:24], "big")
        return w, h
    # GIF
    if data[:6] in (b"GIF87a", b"GIF89a"):
        w = int.from_bytes(data[6:8], "little")
        h = int.from_bytes(data[8:10], "little")
        return w, h
    # JPEG
    if data[:2] == b"\xff\xd8":
        i = 2
        n = len(data)
        while i + 9 < n:
            if data[i] != 0xFF:
                i += 1
                continue
            marker = data[i + 1]
            if 0xC0 <= marker <= 0xCF and marker not in (0xC4, 0xC8, 0xCC):
                h = int.from_bytes(data[i + 5:i + 7], "big")
                w = int.from_bytes(data[i + 7:i + 9], "big")
                return w, h
            seg_len = int.from_bytes(data[i + 2:i + 4], "big")
            if seg_len <= 0:
                break
            i += 2 + seg_len
        return None
    # WEBP
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        fmt = data[12:16]
        try:
            if fmt == b"VP8 ":
                w = int.from_bytes(data[26:28], "little") & 0x3FFF
                h = int.from_bytes(data[28:30], "little") & 0x3FFF
                return w, h
            if fmt == b"VP8L":
                b0, b1, b2, b3 = data[21], data[22], data[23], data[24]
                w = ((b1 & 0x3F) << 8 | b0) + 1
                h = ((b3 & 0x0F) << 10 | b2 << 2 | (b1 & 0xC0) >> 6) + 1
                return w, h
            if fmt == b"VP8X":
                w = int.from_bytes(data[24:27], "little") + 1
                h = int.from_bytes(data[27:30], "little") + 1
                return w, h
        except IndexError:
            return None
    return None


# ---------------------------------------------------------------------------
# Data records
# ---------------------------------------------------------------------------

@dataclass
class ImageRecord:
    source_page: str
    image_url: str
    local_filename: Optional[str] = None
    mime_type: Optional[str] = None
    file_size: Optional[int] = None
    width: Optional[int] = None
    height: Optional[int] = None
    status: str = "pending"          # downloaded | skipped | duplicate | error | planned
    error: Optional[str] = None


@dataclass
class DownloadReport:
    client: str
    root_host: str
    started_at: str
    finished_at: Optional[str] = None
    dry_run: bool = False
    max_images: Optional[int] = None
    delay_seconds: float = 1.0
    totals: dict = field(default_factory=dict)
    skip_reasons: dict = field(default_factory=dict)

    def as_dict(self) -> dict:
        return asdict(self)


# ---------------------------------------------------------------------------
# Downloader
# ---------------------------------------------------------------------------

class ImageDownloader:
    def __init__(
        self,
        scraped_dir: Path,
        assets_dir: Path,
        *,
        client: str = "",
        formats: Iterable[str] = DEFAULT_FORMATS,
        min_dimension: int = 100,
        include_external: bool = False,
        include_ui: bool = False,
        keep_resized: bool = False,
        include_og: bool = True,
        max_images: Optional[int] = None,
        delay: float = 1.0,
        timeout: float = 20.0,
        respect_robots: bool = True,
        dry_run: bool = False,
        user_agent: str = DEFAULT_USER_AGENT,
        session: Optional["requests.Session"] = None,
    ) -> None:
        self.scraped_dir = Path(scraped_dir)
        self.pages_dir = self.scraped_dir / "pages"
        self.index_path = self.scraped_dir / "index.json"
        self.assets_dir = Path(assets_dir)
        self.images_dir = self.assets_dir / "images"

        self.client = client
        self.formats = tuple(f.lower().lstrip(".") for f in formats)
        self.min_dimension = min_dimension
        self.include_external = include_external
        self.include_ui = include_ui
        self.keep_resized = keep_resized
        self.include_og = include_og
        self.max_images = max_images
        self.delay = max(0.0, delay)
        self.timeout = timeout
        self.respect_robots = respect_robots
        self.dry_run = dry_run
        self.user_agent = user_agent

        self.session = session or requests.Session()
        self.session.headers.update({"User-Agent": user_agent})

        self.root_host = ""
        self._robots: Optional[RobotFileParser] = None
        self.records: list[ImageRecord] = []
        self._taken: dict = {}
        self.counts = {
            "discovered": 0, "downloaded": 0, "skipped": 0,
            "duplicates": 0, "errors": 0, "planned": 0,
        }
        self.skip_reasons: dict = {}

    # -- load crawler output ----------------------------------------------

    def _load_index(self) -> list[dict]:
        if not self.index_path.exists():
            raise FileNotFoundError(
                f"Crawler index not found: {self.index_path}. Run the crawler first."
            )
        data = json.loads(self.index_path.read_text(encoding="utf-8"))
        self.root_host = (data.get("root_host") or "").lower()
        if not self.root_host and data.get("start_url"):
            self.root_host = (urlparse(data["start_url"]).hostname or "").lower()
        return data.get("pages", [])

    # -- robots.txt --------------------------------------------------------

    def _load_robots(self) -> None:
        if not self.respect_robots or not self.root_host:
            return
        robots_url = f"https://{self.root_host}/robots.txt"
        parser = RobotFileParser()
        try:
            resp = self.session.get(robots_url, timeout=self.timeout)
            if resp.status_code >= 400:
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

    # -- extraction --------------------------------------------------------

    def _extract_from_page(self, page_url: str, html: str) -> list[dict]:
        """Return raw candidates: {url, width, height, origin} for one page."""
        soup = BeautifulSoup(html, "html.parser")
        candidates: list[dict] = []

        def add(raw_src: str, origin: str, width=None, height=None):
            if not raw_src or raw_src.strip().startswith("data:"):
                if raw_src.strip().startswith("data:"):
                    candidates.append({"url": raw_src.strip(), "width": None,
                                       "height": None, "origin": origin})
                return
            candidates.append({
                "url": resolve_url(raw_src, page_url),
                "width": width, "height": height, "origin": origin,
            })

        # <img>: src + lazy attrs + srcset/data-srcset
        for img in soup.find_all("img"):
            w = _int_or_none(img.get("width"))
            h = _int_or_none(img.get("height"))
            for attr in ("src", "data-src", "data-lazy-src", "data-original"):
                if img.get(attr):
                    add(img[attr], f"img[{attr}]", w, h)
            for attr in ("srcset", "data-srcset", "data-lazy-srcset"):
                if img.get(attr):
                    for url, desc in parse_srcset(img[attr]):
                        add(url, f"img[{attr}]", descriptor_width(desc), None)

        # <picture><source srcset>
        for source in soup.find_all("source"):
            for attr in ("srcset", "data-srcset"):
                if source.get(attr):
                    for url, desc in parse_srcset(source[attr]):
                        add(url, f"source[{attr}]", descriptor_width(desc), None)

        # Open Graph images
        if self.include_og:
            for meta in soup.find_all("meta"):
                prop = (meta.get("property") or meta.get("name") or "").lower()
                if prop in ("og:image", "og:image:url", "twitter:image") and meta.get("content"):
                    add(meta["content"], f"meta[{prop}]")

        return candidates

    # -- main run ----------------------------------------------------------

    def run(self) -> DownloadReport:
        report = DownloadReport(
            client=self.client, root_host="", started_at=_now_iso(),
            dry_run=self.dry_run, max_images=self.max_images, delay_seconds=self.delay,
        )
        pages = self._load_index()
        report.root_host = self.root_host
        self._load_robots()

        # 1) Gather candidates from every saved page.
        raw: list[dict] = []
        for page in pages:
            fname = page.get("filename")
            page_url = page.get("url")
            if not fname or not page_url:
                continue
            path = self.pages_dir / fname
            if not path.exists():
                LOGGER.warning("Saved page missing: %s", path)
                continue
            html = path.read_text(encoding="utf-8", errors="replace")
            raw.extend(self._extract_from_page(page_url, html))

        self.counts["discovered"] = len(raw)
        LOGGER.info("Discovered %d raw image references across %d pages", len(raw), len(pages))

        # 2) Filter, then group by canonical key to de-duplicate. Every
        # non-filtered reference beyond the first in its group (including the
        # same URL repeated across pages, and WordPress resize variants) counts
        # as a duplicate, so totals reconcile: discovered = skipped + duplicates
        # + unique.
        groups: dict[str, dict] = {}
        refs_in_groups = 0
        for cand in raw:
            url = cand["url"]
            reason = should_filter(
                url, width=cand["width"], height=cand["height"],
                root_host=self.root_host, formats=self.formats,
                min_dimension=self.min_dimension,
                include_external=self.include_external, include_ui=self.include_ui,
            )
            if reason:
                self._bump_skip(reason)
                self.records.append(ImageRecord(
                    source_page=_short(cand["origin"], cand.get("source_page")),
                    image_url=url, status="skipped", error=reason,
                ))
                continue

            refs_in_groups += 1
            key = canonical_image_key(url)
            entry = groups.setdefault(key, {
                "best_url": url, "best_width": cand["width"] or 0,
                "source_page": cand["origin"], "width": cand["width"], "height": cand["height"],
            })
            # Prefer the non-resized original; otherwise the widest variant.
            better = False
            if is_resized_variant(entry["best_url"]) and not is_resized_variant(url):
                better = True
            elif is_resized_variant(entry["best_url"]) == is_resized_variant(url):
                if (cand["width"] or 0) > entry["best_width"]:
                    better = True
            if better:
                entry["best_url"] = url
                entry["best_width"] = cand["width"] or entry["best_width"]
            if cand["width"] and not entry["width"]:
                entry["width"] = cand["width"]
            if cand["height"] and not entry["height"]:
                entry["height"] = cand["height"]

        # Duplicates = non-filtered references that collapsed into an existing group.
        self.counts["duplicates"] = refs_in_groups - len(groups)

        unique = list(groups.values())
        LOGGER.info("After filtering + de-duplication: %d unique images", len(unique))

        # 3) Download (or plan, in dry-run).
        for entry in unique:
            if self.max_images is not None and \
                    (self.counts["downloaded"] + self.counts["planned"]) >= self.max_images:
                LOGGER.info("Reached max images (%s); stopping.", self.max_images)
                break
            self._handle(entry)

        report.totals = dict(self.counts)
        report.skip_reasons = dict(self.skip_reasons)
        report.finished_at = _now_iso()
        self._write_outputs(report)
        return report

    def _handle(self, entry: dict) -> None:
        url = entry["best_url"]
        if not self._allowed_by_robots(url):
            self._bump_skip("robots_disallowed")
            self.records.append(ImageRecord(
                source_page=url, image_url=url, status="skipped", error="robots_disallowed",
            ))
            return

        filename = build_filename(url, self._taken)
        mime = mimetypes.guess_type(filename)[0]
        record = ImageRecord(
            source_page=url, image_url=url, local_filename=filename,
            mime_type=mime, width=entry.get("width"), height=entry.get("height"),
        )

        if self.dry_run:
            record.status = "planned"
            self.counts["planned"] += 1
            self.records.append(record)
            LOGGER.debug("PLAN %s -> %s", url, filename)
            return

        try:
            resp = self.session.get(url, timeout=self.timeout, stream=True)
            resp.raise_for_status()
            data = resp.content
            self.images_dir.mkdir(parents=True, exist_ok=True)
            (self.images_dir / filename).write_bytes(data)
            record.file_size = len(data)
            record.mime_type = resp.headers.get("Content-Type", mime) or mime
            dims = sniff_image_size(data)
            if dims:
                record.width, record.height = dims
            record.status = "downloaded"
            self.counts["downloaded"] += 1
            LOGGER.info("Downloaded %s (%d bytes) -> %s", url, len(data), filename)
        except requests.RequestException as exc:
            record.status = "error"
            record.error = str(exc)
            self.counts["errors"] += 1
            LOGGER.warning("Error downloading %s: %s", url, exc)

        self.records.append(record)
        if self.delay:
            time.sleep(self.delay)

    # -- helpers -----------------------------------------------------------

    def _bump_skip(self, reason: str) -> None:
        self.counts["skipped"] += 1
        self.skip_reasons[reason] = self.skip_reasons.get(reason, 0) + 1

    def _write_outputs(self, report: DownloadReport) -> None:
        self.assets_dir.mkdir(parents=True, exist_ok=True)
        index = {
            "client": self.client,
            "root_host": self.root_host,
            "generated_at": _now_iso(),
            "dry_run": self.dry_run,
            "image_count": len(self.records),
            "images": [asdict(r) for r in self.records],
        }
        (self.assets_dir / "image-index.json").write_text(
            json.dumps(index, indent=2, ensure_ascii=False), encoding="utf-8")
        (self.assets_dir / "download-report.json").write_text(
            json.dumps(report.as_dict(), indent=2, ensure_ascii=False), encoding="utf-8")
        LOGGER.info(
            "Totals: %s | outputs -> %s",
            {k: v for k, v in self.counts.items() if v}, self.assets_dir,
        )


# ---------------------------------------------------------------------------
# small utils
# ---------------------------------------------------------------------------

def _int_or_none(value) -> Optional[int]:
    try:
        return int(str(value).strip())
    except (TypeError, ValueError):
        return None


def _short(origin, page=None):
    return page or origin


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def _resolve_dirs(args: argparse.Namespace) -> tuple[Path, Path]:
    if args.scraped_dir and args.assets_dir:
        return Path(args.scraped_dir), Path(args.assets_dir)
    if args.client:
        workspace_root = Path(__file__).resolve().parents[2]
        base = workspace_root / "clients" / args.client
        return base / "scraped", base / "assets"
    raise SystemExit("Provide --client, or both --scraped-dir and --assets-dir.")


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="image_downloader",
        description="Coders01 reusable image downloader (Stage 2). Reads the "
                    "crawler output for a client and downloads content images.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "Examples (Windows PowerShell):\n"
            "  python image_downloader.py --client hk-vastgoed --dry-run\n"
            "  python image_downloader.py --client hk-vastgoed --max-images 200 --delay 1.0\n"
            "  python image_downloader.py --client hk-vastgoed --include-ui --min-dimension 0\n"
        ),
    )
    parser.add_argument("--client", help="Client name; uses clients/<name>/scraped and .../assets.")
    parser.add_argument("--scraped-dir", help="Explicit scraped/ dir (with index.json + pages/).")
    parser.add_argument("--assets-dir", help="Explicit assets/ output dir.")
    parser.add_argument("--dry-run", action="store_true", help="Discover + plan only; download nothing.")
    parser.add_argument("--max-images", type=int, default=None, help="Cap on images to download.")
    parser.add_argument("--delay", type=float, default=1.0, help="Delay between downloads (default: 1.0s).")
    parser.add_argument("--timeout", type=float, default=20.0, help="Per-request timeout (default: 20s).")
    parser.add_argument("--min-dimension", type=int, default=100,
                        help="Skip images whose known width/height is below this (default: 100). 0 = keep all.")
    parser.add_argument("--formats", default=",".join(DEFAULT_FORMATS),
                        help="Comma-separated allowed extensions (default: %(default)s).")
    parser.add_argument("--include-ui", action="store_true",
                        help="Do NOT filter icons/logos/theme assets (default: they are filtered).")
    parser.add_argument("--include-external", action="store_true",
                        help="Allow images from other domains (default: same domain only).")
    parser.add_argument("--keep-resized", action="store_true",
                        help="Keep WordPress -WxH resize variants instead of collapsing to the original.")
    parser.add_argument("--no-og", action="store_true", help="Ignore Open Graph / social images.")
    parser.add_argument("--ignore-robots", action="store_true",
                        help="Do NOT respect robots.txt (only for sites you own).")
    parser.add_argument("--user-agent", default=DEFAULT_USER_AGENT, help="Custom User-Agent header.")
    parser.add_argument("--log-level", default="INFO",
                        choices=["DEBUG", "INFO", "WARNING", "ERROR"], help="Logging verbosity.")
    return parser


def main(argv: Optional[Iterable[str]] = None) -> int:
    args = build_arg_parser().parse_args(list(argv) if argv is not None else None)
    logging.basicConfig(
        level=getattr(logging, args.log_level),
        format="%(asctime)s %(levelname)-7s %(message)s", datefmt="%H:%M:%S",
    )
    scraped_dir, assets_dir = _resolve_dirs(args)
    LOGGER.info("Scraped input: %s", scraped_dir)
    LOGGER.info("Assets output: %s", assets_dir)

    try:
        downloader = ImageDownloader(
            scraped_dir=scraped_dir, assets_dir=assets_dir, client=args.client or "",
            formats=[f for f in args.formats.split(",") if f.strip()],
            min_dimension=args.min_dimension, include_external=args.include_external,
            include_ui=args.include_ui, keep_resized=args.keep_resized,
            include_og=not args.no_og, max_images=args.max_images, delay=args.delay,
            timeout=args.timeout, respect_robots=not args.ignore_robots, dry_run=args.dry_run,
            user_agent=args.user_agent,
        )
        report = downloader.run()
    except (FileNotFoundError, ValueError) as exc:
        LOGGER.error("%s", exc)
        return 2

    t = report.totals
    mode = "DRY-RUN (nothing downloaded)" if args.dry_run else "download"
    print(
        f"\nImage {mode} finished for client '{args.client or scraped_dir}'\n"
        f"  discovered refs : {t.get('discovered', 0)}\n"
        f"  unique planned  : {t.get('planned', 0)}\n"
        f"  downloaded      : {t.get('downloaded', 0)}\n"
        f"  duplicates      : {t.get('duplicates', 0)}\n"
        f"  skipped         : {t.get('skipped', 0)}\n"
        f"  errors          : {t.get('errors', 0)}\n"
        f"  skip reasons    : {report.skip_reasons or '{}'}\n"
        f"  output          : {assets_dir}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
