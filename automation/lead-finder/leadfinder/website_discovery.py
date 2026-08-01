"""Website-discovery enrichment (phase 1).

Purpose: a missing Google Places `websiteUri` does NOT prove a garage has no
website. For every lead whose ORIGINAL Google website field is empty, this phase
searches an official web-search provider (Brave, via `search_provider.py`),
independently verifies any candidate against the lead's own identity signals
(phone, postcode, house number, city, business name) by fetching the candidate's
public site, and classifies the outcome.

Hard guarantees (matching the approved spec):
  * Reads leads.json READ-ONLY. Never writes leads.json. Never overwrites the
    Google website value. Makes ZERO Google Places API calls.
  * Its own cost-state / progress / output files, fully separate from the Places
    cost-state.json and batch-progress.json.
  * Reserve-before-send USD accounting with independent request + USD ceilings;
    retries count toward both.
  * Persists only MINIMUM operational data (query, candidate URL/domain, provider,
    timestamp, verification decision, independently-observed evidence, rejection
    reason). No search-result snippets/titles/rankings/bodies — Brave's TOS
    forbids storing results on the standard plan (see `search_provider.py`).

Lead statuses (final):
  not_attempted      — never processed (default / not in output).
  found_verified     — a candidate reached HIGH confidence → auto-accepted.
  manual_review      — best candidate reached MEDIUM confidence → queued.
  searched_not_found — required queries ran; real candidate(s) were verified (or
                       zero results) but none reached MEDIUM+.
  rejected_candidates— search returned results but ALL were blocklisted domains
                       (social/directory/marketplace/maps/shortener/parked/OEM);
                       no eligible candidate remained to verify.
  discovery_error    — a provider/network error prevented a conclusive result
                       (retried on resume; never mistaken for "not found").
"""

from __future__ import annotations

import csv
import re
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path

from .logging_setup import get_logger
from .normalize import normalize_domain, normalize_phone, normalize_name
from . import storage
from . import search_provider as sp

LOGGER = get_logger()

# --- Cost model ------------------------------------------------------------
# Brave Web Search standard rate ≈ $5 / 1000 queries = 5 mills/query.
SEARCH_PRICE_MILLS = 5
DEFAULT_MAX_USD = 5.0            # production hard USD ceiling
DEFAULT_MAX_REQUESTS = 1200     # independent request ceiling (also enforced)

# --- Per-lead request/fetch limits (approved) ------------------------------
MAX_NORMAL_QUERIES = 2          # name+city, then name+postcode/street
MAX_QUERIES_WITH_PHONE = 3      # +1 telephone fallback, only when ambiguous
MAX_RESULTS_PER_QUERY = 5
MAX_FETCHED_DOMAINS = 2         # candidate homepages fetched per lead
FETCH_TIMEOUT = 10.0
MAX_CONCURRENCY = 3             # hard cap; default sequential (=1)
MAX_FETCH_RETRIES = 2          # extra candidate-site fetch attempts on transient errors

# Terminal statuses are NOT reprocessed on resume. fetch_retry_pending and
# discovery_error are intentionally NOT terminal (a resume retries them).
TERMINAL_STATUSES = {
    "found_verified", "manual_review", "searched_not_found", "rejected_candidates",
    "fetch_failed",
}


# ===========================================================================
# Separate USD/request cost guard (never touches the Places cost-state)
# ===========================================================================

@dataclass
class SearchCostGuard:
    """Reserve-before-send guard for the search provider ONLY.

    Its own state file (paths.website_discovery_cost_state). A reserve records the
    charge and persists BEFORE the HTTP request, so a crash cannot make a resume
    reuse budget. Both a USD ceiling and an independent request ceiling apply;
    retries are charged like any other request.
    """
    max_usd: float = DEFAULT_MAX_USD
    max_requests: int = DEFAULT_MAX_REQUESTS
    state_path: Path | None = None
    spent_mills: int = 0
    count_search: int = 0
    count_retries: int = 0
    rejections: int = 0
    stopped: bool = False

    @property
    def max_mills(self) -> int:
        return int(round(self.max_usd * 1000))

    @property
    def total_requests(self) -> int:
        return self.count_search + self.count_retries

    def total_usd(self) -> float:
        return round(self.spent_mills / 1000.0, 4)

    def can_afford(self) -> bool:
        if self.total_requests + 1 > self.max_requests:
            return False
        return self.spent_mills + SEARCH_PRICE_MILLS <= self.max_mills

    def _reserve(self, *, retry: bool) -> bool:
        if self.total_requests + 1 > self.max_requests or \
                self.spent_mills + SEARCH_PRICE_MILLS > self.max_mills:
            self.stopped = True
            self.rejections += 1
            self.save()
            return False
        self.spent_mills += SEARCH_PRICE_MILLS
        if retry:
            self.count_retries += 1
        else:
            self.count_search += 1
        self.save()
        return True

    def reserve(self) -> bool:
        return self._reserve(retry=False)

    def reserve_retry(self) -> bool:
        return self._reserve(retry=True)

    def as_dict(self) -> dict:
        return {
            "max_usd": self.max_usd,
            "max_requests": self.max_requests,
            "price_per_request_usd": SEARCH_PRICE_MILLS / 1000.0,
            "provider": "brave",
            "spent_usd": self.total_usd(),
            "count_search": self.count_search,
            "count_retries": self.count_retries,
            "total_requests": self.total_requests,
            "rejections": self.rejections,
            "stopped": self.stopped,
            "_spent_mills": self.spent_mills,
            "updated_at": _now(),
        }

    def save(self) -> None:
        if self.state_path:
            storage.write_json_atomic(self.state_path, self.as_dict())

    @classmethod
    def load(cls, state_path, max_usd=DEFAULT_MAX_USD, max_requests=DEFAULT_MAX_REQUESTS):
        guard = cls(max_usd=float(max_usd), max_requests=int(max_requests),
                    state_path=Path(state_path) if state_path else None)
        p = Path(state_path) if state_path else None
        if p and p.exists():
            try:
                d = storage.read_json(p, default={}) or {}
                guard.spent_mills = int(d.get("_spent_mills", 0))
                guard.count_search = int(d.get("count_search", 0))
                guard.count_retries = int(d.get("count_retries", 0))
                guard.rejections = int(d.get("rejections", 0))
            except (ValueError, OSError):
                pass
        return guard


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


# ===========================================================================
# Domain blocklist
# ===========================================================================

# Substring-matched against the registrable host. Kept explicit and auditable.
_SOCIAL = ("facebook.", "fb.com", "instagram.", "linkedin.", "twitter.", "x.com",
           "tiktok.", "youtube.", "youtu.be", "pinterest.", "snapchat.",
           "wa.me", "whatsapp.", "t.me", "telegram.")
_DIRECTORIES = ("google.", "goo.gl", "detelefoongids.", "telefoonboek.", "telefoongids.",
                "goudengids.", "opendi.", "cylex.", "kvk.nl", "openingstijden.",
                "werkspot.", "trustpilot.", "yelp.", "tripadvisor.", "indebuurt.",
                "oozo.", "drimble.", "wieowie.", "local.nl", "bedrijvengids.",
                "bedrijvenpagina.", "companyinfo.", "118.", "findlocal.",
                "mkb", "startpagina.", "bizq.", "stipt.nl", "klachtenkompas.",
                "bovag.nl", "rdw.nl")
_MARKETPLACES = ("marktplaats.", "bol.com", "amazon.", "autoscout24.", "gaspedaal.",
                 "autotrader.", "autowereld.", "2dehands.", "speurders.", "viabovag.",
                 "kapaza.", "ebay.")
_REVIEWS = ("klantenvertellen.", "kiyoh.", "feedbackcompany.", "reviews.io",
            "reseller-ratings.", "beoordelingen.")
_SHORTENERS = ("bit.ly", "tinyurl.", "t.co", "ow.ly", "buff.ly", "lnkd.in",
               "rb.gy", "cutt.ly", "is.gd")
_MAPS = ("maps.app.goo.gl", "waze.com", "google.com/maps")
# Car MANUFACTURER (OEM) domains — an OEM page is never the local garage's own
# site. Franchise/chain GARAGE domains are intentionally NOT here (a legitimate
# branch page is allowed, provided verification finds this location's evidence).
_OEM = ("volkswagen.", "audi.", "bmw.", "mercedes-benz.", "mercedes.", "opel.",
        "renault.", "peugeot.", "citroen.", "ford.", "toyota.", "kia.", "hyundai.",
        "volvocars.", "nissan.", "fiat.", "seat.", "cupra.", "skoda.", "mazda.",
        "honda.", "suzuki.", "dacia.", "mini.", "tesla.", "mitsubishi-motors.",
        "jaguar.", "landrover.", "porsche.", "alfaromeo.", "jeep.", "chevrolet.",
        "lexus.", "subaru.", "ds automobiles", "dsautomobiles.")

_BLOCKLIST = (
    ("social", _SOCIAL),
    ("directory", _DIRECTORIES),
    ("marketplace", _MARKETPLACES),
    ("review_profile", _REVIEWS),
    ("url_shortener", _SHORTENERS),
    ("maps", _MAPS),
    ("manufacturer_oem", _OEM),
)


def classify_domain(domain: str | None) -> str | None:
    """Return a rejection reason (e.g. 'directory:detelefoongids.nl') or None.

    None means the domain is ELIGIBLE for identity verification. Multi-location /
    franchise garage domains are eligible on purpose — branch legitimacy is
    decided later by whether this lead's location evidence appears on the page.
    """
    if not domain:
        return "invalid_domain"
    host = domain.lower()
    for category, needles in _BLOCKLIST:
        for n in needles:
            if n in host:
                return f"{category}:{host}"
    return None


# ===========================================================================
# Identity signals (from the lead + independently observed on the candidate)
# ===========================================================================

_POSTCODE_RE = re.compile(r"\b(\d{4})\s?([A-Za-z]{2})\b")
_TEL_HREF_RE = re.compile(r"tel:\s*([+0-9()\s\-\.]{7,})", re.I)
_PHONE_TEXT_RE = re.compile(
    r"(?<![\d./])(\+?31[\s\-]?\(?0?\)?[\s\-0-9]{7,13}|0\d[\s\-0-9]{7,12})(?!\d)")
_TAG_RE = re.compile(r"<[^>]+>")
_PARKED_MARKERS = (
    "domain is for sale", "buy this domain", "this domain is for sale",
    "domein te koop", "sedoparking", "parkingcrew", "hugedomains",
    "godaddy.com/domainsearch", "under construction", "website coming soon",
)

# Generic garage/business tokens that carry no identity on their own.
_GENERIC_TOKENS = {
    "garage", "autogarage", "autobedrijf", "autoservice", "autoservicebedrijf",
    "auto", "autos", "service", "apk", "apkkeuring", "keuring", "onderhoud",
    "reparatie", "banden", "bandenservice", "automotive", "car", "cars",
    "carservice", "schade", "autoschade", "schadeherstel", "voertuig", "voertuigen",
    "bv", "vof", "nv", "en", "the", "de", "het", "een", "van", "der", "den",
}


def _norm_postcode(raw: str | None) -> str | None:
    if not raw:
        return None
    m = _POSTCODE_RE.search(raw)
    if not m:
        return None
    return (m.group(1) + m.group(2)).upper()


def _all_postcodes(text: str) -> set[str]:
    return {(m.group(1) + m.group(2)).upper() for m in _POSTCODE_RE.finditer(text or "")}


def _house_number(address: str | None) -> str | None:
    """First street house number in a Dutch address, excluding the postcode."""
    if not address:
        return None
    # Drop postcode(s) so their digits are not mistaken for a house number.
    cleaned = _POSTCODE_RE.sub(" ", address)
    # House number is typically the first standalone 1–4 digit run.
    m = re.search(r"\b(\d{1,4})\s?([a-zA-Z]{0,2})\b", cleaned)
    if not m:
        return None
    return (m.group(1) + (m.group(2) or "")).lower()


def _phones_in(text: str) -> set[str]:
    found: set[str] = set()
    for raw in _TEL_HREF_RE.findall(text or ""):
        n = normalize_phone(raw)
        if n and 8 <= len(n.lstrip("+")) <= 15:
            found.add(n)
    for raw in _PHONE_TEXT_RE.findall(text or ""):
        n = normalize_phone(raw)
        if n and 8 <= len(n.lstrip("+")) <= 15:
            found.add(n)
    return found


def _distinctive_tokens(business_name: str | None, city: str | None) -> list[str]:
    """Identity-bearing name tokens (drop generic garage words, legal forms, city)."""
    if not business_name:
        return []
    city_norm = (city or "").strip().lower()
    tokens = re.split(r"[^a-z0-9]+", business_name.lower())
    out = []
    for t in tokens:
        if len(t) < 4 or t in _GENERIC_TOKENS or t == city_norm:
            continue
        out.append(t)
    return out


def is_generic_name(business_name: str | None, city: str | None) -> bool:
    """True when nothing distinctive remains after stripping generic tokens+city."""
    return not _distinctive_tokens(business_name, city)


def _visible_text(html: str) -> str:
    return _TAG_RE.sub(" ", html or "").lower()


# --- Industry relevance (wrong-industry noise detection) -------------------
# The Google Places dataset contains a little wrong-industry noise (e.g. a
# hondenuitlaatservice discovered by an automotive query). We annotate — never
# delete — such leads. The two lists are asymmetric ON PURPOSE:
#   * automotive terms are matched generously (a match only ever REDUCES
#     suspicion, so over-matching a real garage is the safe direction — rule 6);
#   * non-automotive terms are a short, explicit list of clearly-unrelated
#     SERVICES (never generic words), so a single one is strong evidence (rule 3)
#     without risking a legitimate garage (rule 2 / rule 6).
_AUTOMOTIVE_NAME_TERMS = (
    "garage", "autobedrijf", "autoservice", "autoschade", "schadeherstel", "apk",
    "bandenservice", "banden", "auto-onderhoud", "autoonderhoud", "autohandel",
    "autohuis", "autototaal", "autotechniek", "automotive", "automobiel",
    "autoreparatie", "autospuit", "autopoets", "autodemontage", "carrosserie",
    "occasion", "monteur", "voertuig", "camperservice", "caravanservice", "auto",
)
_AUTOMOTIVE_SITE_TERMS = (
    "garage", "autobedrijf", "autoservice", "apk", "onderhoud", "reparatie",
    "kenteken", "occasion", "werkplaats", "monteur", "banden", "voertuig",
    "autoschade", "distributieriem", "remmen", "airco service",
)
_NONAUTO_SERVICE_TERMS = (
    "hondenuitlaatservice", "hondenuitlaat", "hondentrim", "hondenschool",
    "dierenarts", "dierenasiel", "kapsalon", "kapper", "schoonheidssalon",
    "nagelstudio", "pedicure", "restaurant", "pizzeria", "snackbar", "cafetaria",
    "bakkerij", "slagerij", "fysiotherapie", "tandarts", "huisarts", "advocaat",
    "notaris", "makelaar", "uitvaart", "bloemist", "kinderopvang", "catering",
    "sportschool", "fitnessclub", "yogastudio", "fotograaf", "schoonmaakbedrijf",
    "loodgieter", "schildersbedrijf", "hoveniersbedrijf", "hovenier",
    "timmerbedrijf", "dakdekker",
)
# Google `primaryType` values that are unambiguously automotive.
_AUTO_CATEGORIES = {
    "car_repair", "car_dealer", "auto_parts_store", "car_wash", "tire_shop",
    "auto_body_shop", "car_detailing", "mechanic", "auto_glass_shop",
    "vehicle_inspection", "auto_machine_shop", "motorcycle_repair",
}

REL_AUTOMOTIVE_CONFIRMED = "automotive_confirmed"
REL_AUTOMOTIVE_LIKELY = "automotive_likely"
REL_SUSPECTED_WRONG = "suspected_wrong_industry"
REL_UNKNOWN = "unknown"


def _terms_in(text: str, terms) -> list[str]:
    low = (text or "").lower()
    return [t for t in terms if t in low]


def site_industry(text: str) -> tuple[str | None, list[str]]:
    """Classify a candidate page's industry from its visible text.

    Returns ('automotive'|'non_automotive'|None, matched_terms). 'mixed' evidence
    (both kinds present) is treated as inconclusive (None)."""
    auto = _terms_in(text, _AUTOMOTIVE_SITE_TERMS)
    nonauto = _terms_in(text, _NONAUTO_SERVICE_TERMS)
    if nonauto and not auto:
        return "non_automotive", nonauto
    if auto and not nonauto:
        return "automotive", auto
    return None, (auto + nonauto)


def classify_industry_relevance(lead: dict, site_signals: list[dict]) -> tuple[str, list[dict]]:
    """Return (status, evidence) for whether a lead is really an automotive business.

    evidence is a list of factual observations. Never deletes or edits the lead.
    """
    name = lead.get("business_name") or ""
    category = (lead.get("category") or "")
    name_auto = _terms_in(name, _AUTOMOTIVE_NAME_TERMS)
    name_nonauto = _terms_in(name, _NONAUTO_SERVICE_TERMS)
    cat_auto = category.lower() in _AUTO_CATEGORIES
    site_auto = [s for s in site_signals if s.get("industry") == "automotive"]
    site_nonauto = [s for s in site_signals if s.get("industry") == "non_automotive"]

    evidence: list[dict] = []
    for t in name_nonauto:
        evidence.append({"source": "business_name", "signal": "non_automotive_term", "value": t})
    for t in name_auto:
        evidence.append({"source": "business_name", "signal": "automotive_term", "value": t})
    if cat_auto:
        evidence.append({"source": "google_category", "signal": "automotive_category", "value": category})
    for s in site_nonauto:
        evidence.append({"source": "candidate_site", "signal": "non_automotive_content",
                         "value": s.get("terms", [])[:3], "domain": s.get("domain")})
    for s in site_auto:
        evidence.append({"source": "candidate_site", "signal": "automotive_content",
                         "value": s.get("terms", [])[:3], "domain": s.get("domain")})

    # Strong non-automotive evidence: an explicit unrelated-service NAME (with no
    # automotive term), or a candidate site that consistently reads non-automotive
    # when nothing else says automotive. Never triggered by a lone generic word.
    strong_nonauto = (bool(name_nonauto) and not name_auto) or \
                     (bool(site_nonauto) and not name_auto and not cat_auto and not site_auto)
    if strong_nonauto:
        return REL_SUSPECTED_WRONG, evidence
    if site_auto and (name_auto or cat_auto):
        return REL_AUTOMOTIVE_CONFIRMED, evidence
    if name_auto or cat_auto or site_auto:
        return REL_AUTOMOTIVE_LIKELY, evidence
    return REL_UNKNOWN, evidence


@dataclass
class LeadIdentity:
    place_id: str | None
    business_name: str | None
    city: str | None
    region: str | None
    address: str | None
    phone_norm: str | None
    postcode: str | None
    house_number: str | None
    tokens: list[str]
    generic: bool

    @classmethod
    def from_lead(cls, lead: dict) -> "LeadIdentity":
        name = lead.get("business_name")
        city = lead.get("city")
        addr = lead.get("address")
        return cls(
            place_id=lead.get("place_id"),
            business_name=name,
            city=city,
            region=lead.get("region"),
            address=addr,
            phone_norm=normalize_phone(lead.get("phone")),
            postcode=_norm_postcode(addr),
            house_number=_house_number(addr),
            tokens=_distinctive_tokens(name, city),
            generic=is_generic_name(name, city),
        )


# ===========================================================================
# Candidate page-type classification
# ===========================================================================
# Only these page types may ever become HIGH/MEDIUM. Anything else (a directory
# profile, a dealer locator, a news article, a vehicle listing, a marketplace or
# social page) is rejected even when name + city match — a listing that mentions
# the garage is not the garage's own website.
OFFICIAL_PAGE_TYPES = {"official_business_homepage", "official_business_branch_page",
                       "official_business_contact_page"}

# Narrow, evidence-based host lists derived from the four inspected noisy cases
# plus the obvious equivalents. Whole-domain classification is used ONLY for hosts
# whose entire purpose is aggregation/listing/news (never a single garage's site).
_DIRECTORY_HOSTS = ("misterwhat.", "garage-in.", "bestegarages.", "mijngarage.",
                    "kompass.", "bottin.", "nederlandinbedrijf.", "transfirm.",
                    "nextdoor.", "compadex.", "123auto.", "bizq.", "gemeentegids.",
                    "bedrijvenpagina.")
_VEHICLE_LISTING_HOSTS = ("schadeautos.", "schadeauto-zoeker.", "schadeauto.",
                          "autotrack.", "autoweek.", "gaspedaal.", "autoscout24.")
_NEWS_HOST_MARKERS = ("krant.", "nieuwsblad.", "dagblad.", "indebuurt.")

_LOCATOR_PATHS = ("dealer-locator", "dealerlocator", "store-locator", "storelocator",
                  "find-station", "vind-een", "vestiging-zoeker", "filiaal-zoeker",
                  "/locator", "dealer-zoeker")
_LISTING_PATHS = ("/occasions", "/voorraad", "/aanbod", "/inventory", "/lst/",
                  "/itm/", "/l/auto", "sloopauto", "schadeauto")
_DIRECTORY_PATHS = ("/bedrijf/", "/bedrijven/", "/company/", "/business/",
                    "/organisatie/", "/details/", "/dealer/")
_NEWS_PATHS = ("/nieuws/", "/artikel/", "/blog/", "/news/")
_CONTACT_PATHS = ("contact", "over-ons", "overons", "about", "kontakt")
_BRANCH_PATHS = ("/vestiging", "/filiaal", "/locatie", "/vestigingen")


def _host_has(host: str, needles) -> bool:
    return any(n in host for n in needles)


def classify_page_type(url: str, *, html: str | None = None,
                       postcodes=None, lead_postcode: str | None = None) -> tuple[str, list[dict]]:
    """Classify what a candidate URL/page IS. Returns (page_type, evidence).

    Works with just the URL (offline) and, when `html`/`postcodes` are supplied,
    additionally detects a multi-location/locator homepage (many postcodes, none
    the lead's) so a chain root page cannot pass as this lead's site.
    """
    from urllib.parse import urlparse
    domain = normalize_domain(url) or ""
    path = (urlparse(url if "//" in url else "//" + url).path or "/").lower()
    ev: list[dict] = []

    def done(t, why):
        ev.append({"signal": t, "why": why})
        return t, ev

    if _host_has(domain, ("facebook.", "instagram.", "linkedin.", "twitter.", "x.com",
                          "tiktok.", "youtube.")):
        return done("social_profile", f"social host {domain}")
    if _host_has(domain, ("marktplaats.", "bol.com", "amazon.", "ebay.")):
        return done("marketplace_listing", f"marketplace host {domain}")
    if _host_has(domain, _NEWS_HOST_MARKERS) or any(p in path for p in _NEWS_PATHS):
        return done("news_or_editorial", f"news host/path ({domain}{path})")
    if _host_has(domain, _VEHICLE_LISTING_HOSTS) or any(p in path for p in _LISTING_PATHS):
        return done("vehicle_listing", f"vehicle-listing host/path ({domain}{path})")
    if any(p in path for p in _LOCATOR_PATHS):
        return done("dealer_or_service_locator", f"locator path ({path})")
    # Multi-location signal (needs page evidence): many distinct postcodes on the
    # page and NOT the lead's -> a chain/locator page, not this branch.
    if postcodes is not None:
        distinct = {p for p in postcodes}
        if len(distinct) >= 3 and lead_postcode and lead_postcode not in distinct:
            return done("dealer_or_service_locator",
                        f"{len(distinct)} postcodes on page, lead's not among them")
    if _host_has(domain, _DIRECTORY_HOSTS) or any(p in path for p in _DIRECTORY_PATHS):
        return done("directory_profile", f"directory host/path ({domain}{path})")
    if any(seg in path for seg in _CONTACT_PATHS):
        return done("official_business_contact_page", f"contact path ({path})")
    if any(seg in path for seg in _BRANCH_PATHS):
        # A branch page counts as official ONLY if it identifies THIS lead's
        # locality (postcode present); otherwise it's an unresolved branch page.
        if lead_postcode and postcodes and lead_postcode in postcodes:
            return done("official_business_branch_page", "branch path + lead postcode present")
        if lead_postcode is None or postcodes is None:
            return done("official_business_branch_page", "branch path (locality unverified offline)")
        return done("dealer_or_service_locator", "branch path without this lead's locality")
    if path in ("", "/") or path.count("/") <= 1:
        return done("official_business_homepage", f"own-domain homepage ({domain}{path})")
    return done("official_business_homepage", f"own-domain page ({domain}{path})")


# ===========================================================================
# Phone-kind + transient-fetch helpers
# ===========================================================================

def phone_kind(phone_norm: str | None) -> str:
    """Classify a normalized NL number: 'mobile' (+316…), 'landline' (+31…), else."""
    if not phone_norm:
        return "unknown"
    d = phone_norm.lstrip("+")
    if d.startswith("316"):
        return "mobile"
    if d.startswith("31"):
        return "landline"
    return "other"


def is_mobile_vs_landline(lead_phone: str | None, candidate_phones) -> bool:
    """True when the lead's number is mobile and the candidate shows only landlines
    (or vice-versa) with no exact match — the benign case that must stay neutral."""
    if not lead_phone or not candidate_phones:
        return False
    lead_kind = phone_kind(lead_phone)
    cand_kinds = {phone_kind(p) for p in candidate_phones}
    if lead_phone in candidate_phones:
        return False
    return (lead_kind == "mobile" and "mobile" not in cand_kinds) or \
           (lead_kind == "landline" and cand_kinds == {"mobile"})


# DNS/SSL/timeout/connection + HTTP 408/429/5xx are retryable; other 4xx are not.
_TRANSIENT_FETCH_REASONS = ("timeout", "ssl_error", "dns_failure", "connection_refused",
                            "server_error")


def is_transient_fetch_reason(reason: str | None) -> bool:
    if not reason:
        return False
    r = reason.lower()
    if ":" in r:
        r = r.split(":", 1)[1]
    if r in _TRANSIENT_FETCH_REASONS:
        return True
    if r.startswith("http_"):
        r = r[5:]
    if r in ("408", "429"):
        return True
    if r.isdigit() and 500 <= int(r) < 600:
        return True
    return False


def _classify_fetch(res: dict) -> tuple[bool, str | None, bool]:
    """Return (ok, reason_or_None, transient). A 4xx/5xx status is a failure even
    though the HTTP call itself 'succeeded'."""
    if res.get("ok"):
        st = res.get("status_code")
        if st and st >= 400:
            transient = st in (408, 429) or 500 <= st < 600
            return False, f"http_{st}", transient
        return True, None, False
    reason = res.get("reason", "unknown")
    return False, f"unreachable:{reason}", is_transient_fetch_reason(reason)


def _fetch_candidate(fetcher, url: str, max_retries: int, sleeper) -> tuple[dict, bool, str | None, bool]:
    """Fetch a candidate homepage with conservative backoff on TRANSIENT errors
    only (max_retries extra attempts). Permanent 4xx (except 408/429) is not
    retried. Returns (result, ok, reason, transient)."""
    attempt = 0
    while True:
        res = fetcher.fetch(url)
        ok, reason, transient = _classify_fetch(res)
        if ok or not transient or attempt >= max_retries:
            return res, ok, reason, transient
        attempt += 1
        sleeper(min(4.0, 0.5 * (2 ** (attempt - 1))))


# ===========================================================================
# Candidate verification (independent fetch of the candidate's own site)
# ===========================================================================

_CONTACT_LINK_RE = re.compile(
    r'href=["\']([^"\']*(?:contact|over-?ons|about|vestiging|locatie)[^"\']*)["\']', re.I)


def _resolve(base_url: str, href: str) -> str:
    from urllib.parse import urljoin
    return urljoin(base_url, href)


def _observe(html: str, ident: LeadIdentity, source_url: str) -> dict:
    """Independently observe identity signals on one fetched page."""
    text = _visible_text(html)
    page_phones = _phones_in(html)
    page_postcodes = _all_postcodes(html)
    obs = {
        "phones": page_phones,
        "postcodes": page_postcodes,
        "phone_match": bool(ident.phone_norm and ident.phone_norm in page_phones),
        "postcode_match": bool(ident.postcode and ident.postcode in page_postcodes),
        "city_match": bool(ident.city and ident.city.strip().lower() in text),
        "house_present": bool(ident.house_number and re.search(
            r"\b" + re.escape(ident.house_number) + r"\b", text)),
        "name_strong": _name_strong(ident, text, source_url),
        "source_url": source_url,
    }
    return obs


def _name_strong(ident: LeadIdentity, page_text: str, source_url: str) -> bool:
    if not ident.tokens:
        return False
    domain = normalize_domain(source_url) or ""
    compact = normalize_name(ident.business_name) or ""
    if compact and compact in domain.replace(".", "").replace("-", ""):
        return True
    for tok in ident.tokens:
        if tok in domain or tok in page_text:
            return True
    return False


def verify_candidate(url: str, ident: LeadIdentity, fetcher, *,
                     max_fetch_retries: int = MAX_FETCH_RETRIES, sleeper=None) -> dict:
    """Fetch the candidate's own site and decide confidence from observed facts.

    The homepage fetch retries TRANSIENT failures (DNS/SSL/timeout/429/5xx) up to
    `max_fetch_retries` times with backoff; a persisting transient failure sets
    `fetch_transient=True` so the lead can be marked fetch_failed rather than
    searched_not_found. Plus (only if identity is not yet confirmed) one same-domain
    contact/about page. Returns a decision dict with evidence.
    """
    import time
    sleeper = sleeper or time.sleep
    domain = normalize_domain(url)
    home_url = ("https://" + domain) if domain else url
    result = {"url": url, "domain": domain, "decision": "rejected",
              "confidence": "low", "rejection_reason": None, "evidence": [],
              "site_industry": None, "site_industry_terms": [], "fetch_transient": False,
              "candidate_page_type": "unknown", "candidate_page_type_evidence": []}

    home, ok, reason, transient = _fetch_candidate(fetcher, home_url, max_fetch_retries, sleeper)
    if not ok:
        result["rejection_reason"] = reason
        result["fetch_transient"] = transient
        result["candidate_page_type"] = "parked_or_unreachable"
        result["candidate_page_type_evidence"] = [{"signal": "parked_or_unreachable", "why": reason}]
        return result

    # A redirect can land on a blocklisted host (e.g. a Facebook page) — re-check.
    final_url = home.get("final_url") or home_url
    final_domain = normalize_domain(final_url)
    if final_domain and final_domain != domain:
        redir_reason = classify_domain(final_domain)
        if redir_reason:
            result["rejection_reason"] = f"redirected_{redir_reason}"
            return result
        result["domain"] = final_domain

    html = home.get("html", "") or ""
    if any(m in html.lower() for m in _PARKED_MARKERS) or len(html.strip()) < 200:
        result["rejection_reason"] = "parked_or_empty"
        result["candidate_page_type"] = "parked_or_unreachable"
        result["candidate_page_type_evidence"] = [{"signal": "parked_or_unreachable",
                                                   "why": "parked marker or empty page"}]
        return result

    obs = _observe(html, ident, final_url)
    page_texts = [html]

    # Follow ONE contact/about page only if phone/address not yet confirmed.
    need_more = not (obs["phone_match"] or (obs["postcode_match"] and obs["house_present"]))
    if need_more:
        m = _CONTACT_LINK_RE.search(html)
        if m:
            contact_url = _resolve(final_url, m.group(1))
            if normalize_domain(contact_url) == result["domain"]:
                cpage = fetcher.fetch(contact_url)
                if cpage.get("ok"):
                    chtml = cpage.get("html", "") or ""
                    page_texts.append(chtml)
                    obs = _merge_obs(obs, _observe(chtml, ident, contact_url))

    # Independently observe which industry the candidate site represents.
    ind, terms = site_industry(_visible_text(" ".join(page_texts)))
    result["site_industry"] = ind
    result["site_industry_terms"] = terms

    # What KIND of page is this? The ORIGINAL candidate URL carries the strongest
    # signal (its path — /dealer-locator, /company/, /nl/dealer/, a news slug),
    # while the fetched homepage HTML + postcodes drive multi-location detection.
    ptype, pev = classify_page_type(url, html=" ".join(page_texts),
                                    postcodes=obs["postcodes"], lead_postcode=ident.postcode)
    result["candidate_page_type"] = ptype
    result["candidate_page_type_evidence"] = pev

    _decide(result, ident, obs)
    _gate_non_official(result, ptype)
    return result


def _gate_non_official(result: dict, page_type: str) -> None:
    """A non-official page (directory/locator/news/listing/marketplace/social) may
    never be an accepted or manual-review website — even on a name + city match."""
    if page_type not in OFFICIAL_PAGE_TYPES and result["decision"] in ("accepted", "manual"):
        result["decision"] = "rejected"
        result["confidence"] = "low"
        result["rejection_reason"] = f"non_official_page:{page_type}"


def _merge_obs(a: dict, b: dict) -> dict:
    out = dict(a)
    out["phones"] = a["phones"] | b["phones"]
    out["postcodes"] = a["postcodes"] | b["postcodes"]
    for k in ("phone_match", "postcode_match", "city_match", "house_present", "name_strong"):
        out[k] = a[k] or b[k]
    out["source_url"] = a["source_url"]
    return out


def _decide(result: dict, ident: LeadIdentity, obs: dict) -> dict:
    """Confidence from observed facts under the phone-tolerant rules.

    A phone MISMATCH is NEUTRAL (Google often stores a mobile while a garage site
    shows a landline) — it never rejects on its own. A hard identity CONTRADICTION
    requires meaningful contradictory evidence (a different address, i.e. a
    conflicting postcode, when the name does not strongly match and the phone does
    not match). See `_confidence_from_signals` for the shared decision logic used
    by both live verification and the offline re-evaluation.
    """
    evidence = []

    def ev(signal, value=None):
        evidence.append({"signal": signal, "observed": value, "source_url": obs["source_url"]})

    phone_match = obs["phone_match"]
    phone_present = bool(obs["phones"])
    postcode_match = obs["postcode_match"]
    postcode_present = bool(obs["postcodes"])
    house_match = obs["house_present"] and postcode_match
    city_match = obs["city_match"]
    name_strong = obs["name_strong"]
    site_auto = result.get("site_industry") == "automotive"

    if phone_match:
        ev("phone_match", ident.phone_norm)
    elif phone_present and ident.phone_norm:
        # Neutral: preserve BOTH numbers + their kinds; never a conflict alone.
        ev("phone_differs_neutral", {
            "lead": ident.phone_norm, "lead_kind": phone_kind(ident.phone_norm),
            "candidate": sorted(obs["phones"])[:3],
            "candidate_kinds": sorted({phone_kind(p) for p in obs["phones"]}),
            "mobile_vs_landline": is_mobile_vs_landline(ident.phone_norm, obs["phones"]),
        })
    if postcode_match:
        ev("postcode_match", ident.postcode)
    if house_match:
        ev("house_number_match", ident.house_number)
    if city_match:
        ev("city_match", ident.city)
    if name_strong:
        ev("name_strong")
    if postcode_present and not postcode_match and ident.postcode:
        ev("address_conflict", sorted(obs["postcodes"])[:3])

    result["evidence"] = evidence
    conf, decision, reason = _confidence_from_signals(
        phone_match=phone_match, phone_present=phone_present,
        postcode_match=postcode_match, postcode_present=postcode_present,
        house_match=house_match, city_match=city_match, name_strong=name_strong,
        site_auto=site_auto, generic=ident.generic)
    result["confidence"] = conf
    result["decision"] = decision
    result["rejection_reason"] = reason
    return result


def _confidence_from_signals(*, phone_match, phone_present, postcode_match,
                             postcode_present, house_match, city_match, name_strong,
                             site_auto, generic) -> tuple[str, str, str | None]:
    """Shared decision logic. Returns (confidence, decision, rejection_reason).

    Rules:
      * phone mismatch alone = NEUTRAL (never rejects);
      * hard CONTRADICTION = a conflicting postcode when neither the name matches
        nor the phone matches (meaningful evidence of a different business);
      * HIGH  = (A) exact phone match with no strong contradiction, or
                (B) strong name + exact postcode + exact house number;
      * MEDIUM= strong name + (city | postcode | automotive content).
    """
    postcode_conflict = postcode_present and not postcode_match
    contradiction = postcode_conflict and not name_strong and not phone_match

    # (A) Exact phone match — strong identity. A stray/second-location postcode does
    # not veto it unless the name is absent AND the address plainly contradicts.
    if phone_match:
        if not (postcode_conflict and not name_strong):
            return "high", "accepted", None
        return "medium", "manual", None            # phone matches but address differs -> review

    # (B) Name + full address.
    if name_strong and postcode_match and house_match:
        return "high", "accepted", None

    if contradiction:
        return "low", "rejected", "identity_conflict"

    # MEDIUM tiers (no contradiction). Generic-named leads still need a hard signal.
    if name_strong and (city_match or postcode_match or site_auto):
        return "medium", "manual", None

    # LOW / reject.
    if name_strong:
        return "low", "rejected", "name_only"
    if city_match:
        return "low", "rejected", "city_only"
    if phone_present:
        return "low", "rejected", "phone_differs_no_other_evidence"
    if generic:
        return "low", "rejected", "generic_name_insufficient_evidence"
    return "low", "rejected", "insufficient_evidence"


# ===========================================================================
# Query construction
# ===========================================================================

def build_queries(ident: LeadIdentity) -> dict:
    """Return the ordered query plan for one lead.

    primary  : exact business name + city
    fallback : exact business name + postcode (or street+house number)
    phone    : the telephone number — ONLY used when identity is ambiguous
    """
    name = (ident.business_name or "").strip()
    primary = f"{name} {ident.city}".strip() if name else (ident.city or "")
    if ident.postcode:
        # Re-insert the space Dutch postcodes are written with (1234 AB).
        pc = f"{ident.postcode[:4]} {ident.postcode[4:]}"
        fallback = f"{name} {pc}".strip()
    elif ident.address:
        street_seg = ident.address.split(",")[0].strip()
        fallback = f"{name} {street_seg}".strip()
    else:
        fallback = None
    phone_q = ident.phone_norm if ident.phone_norm else None
    return {"primary": primary or None, "fallback": fallback, "phone": phone_q}


# ===========================================================================
# Per-lead discovery
# ===========================================================================

def _search_with_retries(provider, query, guard, *, max_retries=2):
    """Reserve-before-send a search + bounded transient retries.

    Returns (results, error_str_or_None). A reservation failure (budget/requests
    exhausted) returns ([], "budget_exhausted"). Retries reserve their own cost.
    """
    if not guard.reserve():
        return [], "budget_exhausted"
    attempt = 0
    while True:
        try:
            return provider.search(query, count=MAX_RESULTS_PER_QUERY), None
        except sp.SearchError as exc:
            if not sp.is_transient(exc) or attempt >= max_retries:
                return [], f"search_error:{type(exc).__name__}"
            if not guard.reserve_retry():
                return [], "budget_exhausted"
            attempt += 1


def _name_collision(ident: LeadIdentity, name_counts: dict) -> bool:
    key = normalize_name(ident.business_name)
    return bool(key and name_counts.get(key, 0) > 1)


def discover_one(lead: dict, provider, fetcher, guard, name_counts: dict, *,
                 max_fetch_retries: int = MAX_FETCH_RETRIES, sleeper=None) -> dict:
    """Run the full discovery + verification pipeline for one lead."""
    ident = LeadIdentity.from_lead(lead)
    plan = build_queries(ident)
    record = {
        "place_id": ident.place_id,
        "business_name": ident.business_name,
        "city": ident.city,
        "region": ident.region,
        "original_google_website": lead.get("website"),  # preserved (always empty here)
        "status": "not_attempted",
        "confidence": None,
        "accepted_website": None,
        "queries": [],
        "candidates": [],
        "ambiguity_reason": None,
        "industry_relevance_status": "unknown",
        "industry_relevance_evidence": [],
        "error": None,
        "updated_at": _now(),
    }

    fetched: list[str] = []
    seen_urls: set[str] = set()
    site_signals: list[dict] = []
    best = None                 # best accepted/manual candidate dict
    eligible_verified = False   # at least one non-blocklisted domain was fetched
    had_results = False
    hard_error = False
    transient_fetch = False     # a candidate fetch failed transiently after retries

    def run_query(query, stage):
        nonlocal best, eligible_verified, had_results, hard_error, transient_fetch
        if not query:
            return
        results, err = _search_with_retries(provider, query, guard)
        record["queries"].append({"query": query, "provider": provider.name,
                                  "stage": stage, "timestamp": _now()})
        if err:
            if err == "budget_exhausted":
                record["error"] = "budget_exhausted"
                hard_error = True
            else:
                record["error"] = err
                hard_error = True
            return
        if results:
            had_results = True
        for res in results[:MAX_RESULTS_PER_QUERY]:
            if res.url in seen_urls:
                continue
            seen_urls.add(res.url)
            domain = normalize_domain(res.url)
            reason = classify_domain(domain)
            if reason:
                record["candidates"].append({
                    "url": res.url, "domain": domain, "decision": "rejected",
                    "confidence": "low", "rejection_reason": reason, "evidence": [],
                })
                continue
            if domain in fetched:
                continue
            if len(fetched) >= MAX_FETCHED_DOMAINS:
                continue
            fetched.append(domain)
            verdict = verify_candidate(res.url, ident, fetcher,
                                       max_fetch_retries=max_fetch_retries, sleeper=sleeper)
            # Pull the site-industry observation out of the verdict (used only to
            # compute lead-level relevance) so the persisted candidate stays minimal.
            ind = verdict.pop("site_industry", None)
            terms = verdict.pop("site_industry_terms", [])
            is_transient = verdict.pop("fetch_transient", False)
            if ind:
                site_signals.append({"industry": ind, "terms": terms,
                                     "domain": verdict.get("domain")})
            record["candidates"].append(verdict)
            if is_transient:
                transient_fetch = True   # unresolved fetch error -> not "not found"
            if verdict["decision"] != "rejected":
                eligible_verified = True
            elif is_transient or verdict.get("rejection_reason", "").startswith(("unreachable", "parked", "http_")):
                pass  # fetched-but-unusable / transient — not proof of identity either way
            else:
                eligible_verified = True  # a real site we verified and rejected
            if verdict["confidence"] == "high":
                best = verdict
                return
            if verdict["confidence"] == "medium" and (best is None or best["confidence"] != "high"):
                best = verdict

    # Stage 1: primary (name + city)
    run_query(plan["primary"], "primary")

    # Stage 2: fallback — only when no acceptable (high) candidate yet.
    if not (best and best["confidence"] == "high") and not hard_error:
        run_query(plan["fallback"], "fallback")

    # Stage 3: telephone fallback — only when identity is AMBIGUOUS and a phone
    # exists; raises the per-lead maximum to 3, with the reason recorded.
    if (not (best and best["confidence"] == "high") and not hard_error
            and plan["phone"] and len(record["queries"]) < MAX_QUERIES_WITH_PHONE):
        ambiguity = None
        if ident.generic:
            ambiguity = "generic_business_name"
        elif _name_collision(ident, name_counts):
            ambiguity = "multiple_similar_names"
        elif best is None and had_results:
            ambiguity = "identity_unresolved_after_two_queries"
        if ambiguity:
            record["ambiguity_reason"] = ambiguity
            run_query(plan["phone"], "phone_fallback")

    # Resolve final status.
    if best and best["confidence"] == "high":
        record["status"] = "found_verified"
        record["confidence"] = "high"
        record["accepted_website"] = best["url"]
    elif best and best["confidence"] == "medium":
        record["status"] = "manual_review"
        record["confidence"] = "medium"
        record["accepted_website"] = best["url"]
    elif hard_error and not eligible_verified and not transient_fetch:
        record["status"] = "discovery_error"
    elif transient_fetch:
        # An unresolved transient candidate-fetch failure — a viable site may be
        # hiding behind it, so this is NOT "searched_not_found" (retries already
        # attempted inline; a resume/refetch may recover it).
        record["status"] = "fetch_failed"
    elif eligible_verified:
        record["status"] = "searched_not_found"
    elif had_results:
        # Results existed but every one was a blocklisted domain.
        record["status"] = "rejected_candidates"
    else:
        record["status"] = "searched_not_found"

    # Industry-relevance annotation (never mutates the lead; separate output only).
    rel_status, rel_evidence = classify_industry_relevance(lead, site_signals)
    record["industry_relevance_status"] = rel_status
    record["industry_relevance_evidence"] = rel_evidence
    if rel_status == REL_SUSPECTED_WRONG and record["status"] != "discovery_error":
        # A suspected wrong-industry lead is preserved, must NOT be auto-accepted,
        # and is routed to manual review with the factual evidence attached.
        if record["status"] == "found_verified":
            rel_evidence.append({
                "source": "policy", "signal": "auto_accept_blocked_wrong_industry",
                "value": record["accepted_website"],
            })
        record["status"] = "manual_review"

    record["updated_at"] = _now()
    return record


# ===========================================================================
# Deterministic pilot sampler
# ===========================================================================

def leads_missing_website(leads: list[dict]) -> list[dict]:
    return [l for l in leads if not (l.get("website") and str(l.get("website")).strip())]


def already_discovered_ids(paths) -> set[str]:
    """place_ids already processed by ANY website-discovery run under this industry
    (every `website-discovery*.json` results file — the base run plus any tagged
    pilot). Used so a later pilot excludes earlier ones. Read-only."""
    import glob
    ids: set[str] = set()
    base = str(paths.output / "website-discovery")
    current = paths.website_discovery_json.name   # this run's OWN results file
    for path in glob.glob(base + "*.json"):
        name = path.replace("\\", "/").rsplit("/", 1)[-1]
        # Only OTHER runs' results files, not the analysis reports or this run.
        if name == current or any(k in name for k in ("reeval", "report", "progress", "cost-state")):
            continue
        data = storage.read_json(path, default={}) or {}
        for r in data.get("results", []):
            if r.get("place_id"):
                ids.add(r["place_id"])
    return ids


def _address_complete(lead: dict) -> bool:
    addr = lead.get("address")
    return bool(_norm_postcode(addr) and _house_number(addr))


# --- Preparation-only industry classification (does NOT affect the verifier) ---
# These labels shape a pilot's COMPOSITION for measurement; the real per-lead
# outcome is decided at run time by Verifier V2 + page-type + wrong-industry logic.
_PREP_AUTO_NAME = (
    "autogarage", "autobedrijf", "autoservice", "autotechniek", "apk", "bandenservice",
    "banden", "auto-onderhoud", "autoonderhoud", "autoreparatie", "autoschade",
    "schadeherstel", "garage", "monteur", "autospecialist", "autocentrum", "automobiel",
    "car repair", "automobielbedrijf",
)
_PREP_AUTO_CATS = {"car_repair", "tire_shop", "car_wash", "auto_body_shop",
                   "vehicle_inspection", "mechanic", "car_detailing"}
_PREP_WRONG_NAME = (
    "honden", "hondenuitlaat", "uitlaatservice", "wandelservice", "kyno", "dieren",
    "dierenbalans", "trimsalon", "asiel", "dierenarts", "wellness", "massage", "beauty",
    "kapper", "kapsalon", "schoonheid", "nagelstudio", "restaurant", "pizzeria",
    "snackbar", "cafetaria", "bakkerij", "slagerij", "fysio", "tandarts", "huisarts",
    "advocaat", "notaris", "makelaar", "uitvaart", "bloemist", "kinderopvang",
    "catering", "sportschool", "fitness", "yoga", "fotograaf", "schildersbedrijf",
    "hoveniersbedrijf", "hovenier", "dakdekker", "loodgieter", "timmerbedrijf",
    "bouwbedrijf", "kledingzaak", "kleding", "mode ",
)
_PREP_WRONG_CATS = {"pet_care", "clothing_store", "general_contractor",
                    "veterinary_care", "beauty_salon", "hair_care", "restaurant"}
# STRONG adjacent name signals OVERRIDE an automotive Google category (a Vespa or
# scooter service tagged car_repair is still NOT a car garage for our purposes).
_PREP_STRONG_ADJ_NAME = (
    "vespa", "scooter", "brommer", "bromfiets", "tweewieler", "motorfiets",
    "fietsenmaker", "taxi", "chauffeur", "autoverhuur", "autolease", "takel",
    "berging", "sloopauto", "autosloop",
)
# WEAK adjacent signals apply only when the lead is NOT strongly automotive.
_PREP_ADJ_NAME = (
    "montage", "trading", "import", "export", "verhuur", "lease", "autohandel",
    "auto's", "cars", "handel", "groep",
)
_PREP_ADJ_CATS = {"car_dealer", "gas_station", "chauffeur_service", "auto_parts_store",
                  "store", "service", "market", "wholesaler", "corporate_office",
                  "point_of_interest", "association_or_organization"}

PREP_AUTOMOTIVE = "automotive_likely"
PREP_WRONG = "wrong_industry_control"
PREP_ADJACENT = "adjacent_industry_control"
PREP_OTHER = "other"


def prep_classification_detail(lead: dict) -> tuple[str, dict]:
    """Preparation-only label + the factual evidence for the decision (NOT used by
    the verifier). Priority: clearly wrong industry → two-wheeler/taxi name (which
    overrides an automotive category) → automotive (name or category) → adjacent →
    other."""
    name = (lead.get("business_name") or "").lower()
    cat = (lead.get("category") or "").lower()
    wrong_names = [t for t in _PREP_WRONG_NAME if t in name]
    if cat in _PREP_WRONG_CATS or wrong_names:
        return PREP_WRONG, {"rule": "wrong_industry", "google_primary_category": cat,
                            "name_terms": wrong_names, "category_match": cat in _PREP_WRONG_CATS}
    strong = [t for t in _PREP_STRONG_ADJ_NAME if t in name]
    if strong:
        return PREP_ADJACENT, {"rule": "two_wheeler_or_taxi_name_overrides_category",
                               "google_primary_category": cat, "name_terms": strong}
    auto_names = [t for t in _PREP_AUTO_NAME if t in name]
    if cat in _PREP_AUTO_CATS or auto_names:
        return PREP_AUTOMOTIVE, {"rule": "automotive", "google_primary_category": cat,
                                 "name_terms": auto_names, "category_match": cat in _PREP_AUTO_CATS}
    adj_names = [t for t in _PREP_ADJ_NAME if t in name]
    if cat in _PREP_ADJ_CATS or adj_names:
        return PREP_ADJACENT, {"rule": "adjacent", "google_primary_category": cat,
                               "name_terms": adj_names, "category_match": cat in _PREP_ADJ_CATS}
    return PREP_OTHER, {"rule": "other", "google_primary_category": cat}


def prep_classification(lead: dict) -> str:
    """Preparation-only label (NOT used by the verifier). See detail variant."""
    return prep_classification_detail(lead)[0]


def select_by_prep_class(leads: list[dict], prep_class: str,
                         exclude_ids: set[str] | None = None) -> list[dict]:
    """Deterministic list of website-missing leads with the given prep class,
    excluding `exclude_ids` (sorted by place_id). The label selects the population
    only — it never overrides Verifier V2 during actual candidate verification."""
    excl = exclude_ids or set()
    out = [l for l in leads_missing_website(leads)
           if l.get("place_id") not in excl and prep_classification(l) == prep_class]
    return sorted(out, key=lambda l: l.get("place_id") or "")


WRONG_INDUSTRY_REVIEW_OUTCOMES = [
    "confirmed_wrong_industry", "automotive_business_confirmed",
    "adjacent_vehicle_business", "insufficient_information",
]


def _prep_review_rows(leads: list[dict], exclude_ids, label: str) -> list[dict]:
    rows = []
    for l in select_by_prep_class(leads, label, exclude_ids=exclude_ids):
        _lbl, ev = prep_classification_detail(l)
        rows.append({
            "place_id": l.get("place_id"),
            "business_name": l.get("business_name"),
            "city": l.get("city"),
            "google_primary_category": l.get("category"),
            "preparation_evidence": ev,
            "name_signal": ev.get("name_terms", []),
        })
    return rows


def build_wrong_industry_review(paths, leads: list[dict], exclude_ids=None) -> dict:
    """Persistent review output for prep-classified wrong-industry leads. Preserves
    their Google data (read-only), never calls Brave/fetch, never marks them
    'no website'. Deterministic + idempotent: existing per-lead `review_status`
    (a human decision) is preserved across rebuilds."""
    prev = {r["place_id"]: r for r in
            (storage.read_json(paths.wrong_industry_review_json, default={}) or {}).get("leads", [])}
    rows = _prep_review_rows(leads, exclude_ids, PREP_WRONG)
    for r in rows:
        r["preparation_status"] = "suspected_wrong_industry_pending_review"
        r["review_status"] = prev.get(r["place_id"], {}).get("review_status", "pending")
        r["reviewer_outcomes"] = WRONG_INDUSTRY_REVIEW_OUTCOMES
        r["excluded_from_brave"] = True
        r["excluded_from_no_website_outreach"] = True
    doc = {"generated_at": _now(), "count": len(rows),
           "reviewer_outcomes": WRONG_INDUSTRY_REVIEW_OUTCOMES, "leads": rows}
    storage.write_json_atomic(paths.wrong_industry_review_json, doc)
    cols = ["place_id", "business_name", "city", "google_primary_category",
            "name_signal", "preparation_status", "review_status", "reviewer_outcomes"]
    _write_csv(paths.wrong_industry_review_csv, [{
        **{k: r.get(k) for k in ("place_id", "business_name", "city",
                                 "google_primary_category", "preparation_status", "review_status")},
        "name_signal": " | ".join(r["name_signal"]) or f'category:{r["google_primary_category"]}',
        "reviewer_outcomes": " / ".join(WRONG_INDUSTRY_REVIEW_OUTCOMES),
    } for r in rows], cols)
    return {"count": len(rows), "leads": rows}


def build_adjacent_review(paths, leads: list[dict], exclude_ids=None) -> dict:
    """Read-only report for prep-classified adjacent leads (held, no Brave)."""
    rows = _prep_review_rows(leads, exclude_ids, PREP_ADJACENT)
    for r in rows:
        ev = r["preparation_evidence"]
        r["classified_adjacent_reason"] = (
            f'name: {", ".join(ev["name_terms"])}' if ev.get("name_terms")
            else f'Google category: {ev.get("google_primary_category")}')
        r["held_no_brave"] = True
    doc = {"generated_at": _now(), "count": len(rows), "leads": rows}
    storage.write_json_atomic(paths.adjacent_industry_review_json, doc)
    cols = ["place_id", "business_name", "city", "google_primary_category",
            "name_signal", "classified_adjacent_reason"]
    _write_csv(paths.adjacent_industry_review_csv, [{
        **{k: r.get(k) for k in ("place_id", "business_name", "city",
                                 "google_primary_category", "classified_adjacent_reason")},
        "name_signal": " | ".join(r["name_signal"]) or f'category:{r["google_primary_category"]}',
    } for r in rows], cols)
    return {"count": len(rows), "leads": rows}


def _diverse_pick(cands: list[dict], n: int, seen_cities: set[str]) -> list[dict]:
    """Deterministically take up to n leads, preferring not-yet-seen cities.
    `cands` must already be sorted (by place_id) for determinism."""
    picked, remaining = [], list(cands)
    while len(picked) < n and remaining:
        idx = next((j for j, l in enumerate(remaining)
                    if (l.get("city") or "").lower() not in seen_cities), 0)
        l = remaining.pop(idx)
        picked.append(l)
        seen_cities.add((l.get("city") or "").lower())
    return picked


def _stratified_diverse_pick(cands: list[dict], n: int, seen_cities: set[str]) -> list[dict]:
    """Like `_diverse_pick` but also round-robins across (generic vs unique name) ×
    (complete vs partial address) strata, so the pick contains a healthy mix of
    both. Deterministic (strata sorted by place_id)."""
    strata: dict[tuple, list[dict]] = {}
    for l in sorted(cands, key=lambda x: x.get("place_id") or ""):
        key = (is_generic_name(l.get("business_name"), l.get("city")), _address_complete(l))
        strata.setdefault(key, []).append(l)
    order = [(False, True), (True, False), (False, False), (True, True)]
    order += [k for k in strata if k not in order]
    picked: list[dict] = []
    while len(picked) < n and any(strata.get(k) for k in order):
        progressed = False
        for k in order:
            b = strata.get(k)
            if not b:
                continue
            idx = next((j for j, l in enumerate(b)
                        if (l.get("city") or "").lower() not in seen_cities), 0)
            l = b.pop(idx)
            picked.append(l)
            seen_cities.add((l.get("city") or "").lower())
            progressed = True
            if len(picked) >= n:
                break
        if not progressed:
            break
    return picked


def select_pilot_composition(leads: list[dict], exclude_ids: set[str] | None = None,
                             n_auto: int = 21, n_wrong: int = 2, n_adj: int = 2) -> list[dict]:
    """Deterministic pilot sample with a fixed industry composition (default
    21 automotive_likely + 2 wrong_industry_control + 2 adjacent_industry_control),
    disjoint from `exclude_ids`, maximising distinct cities. The returned leads are
    plain records (no label mutation); call `prep_classification` to label them."""
    exclude_ids = exclude_ids or set()
    pool = [l for l in leads_missing_website(leads) if l.get("place_id") not in exclude_ids]
    pool.sort(key=lambda l: (l.get("place_id") or ""))
    buckets: dict[str, list[dict]] = {PREP_AUTOMOTIVE: [], PREP_WRONG: [], PREP_ADJACENT: []}
    for l in pool:
        label = prep_classification(l)
        if label in buckets:
            buckets[label].append(l)
    seen_cities: set[str] = set()
    chosen = _stratified_diverse_pick(buckets[PREP_AUTOMOTIVE], n_auto, seen_cities)
    chosen += _diverse_pick(buckets[PREP_WRONG], n_wrong, seen_cities)
    chosen += _diverse_pick(buckets[PREP_ADJACENT], n_adj, seen_cities)
    return chosen


def select_pilot_sample(leads: list[dict], n: int = 25,
                        exclude_ids: set[str] | None = None) -> list[dict]:
    """Deterministic, representative sample of leads missing a website.

    Stratifies across (generic vs unique name) × (complete vs less-complete
    address) and round-robins those buckets while preferring unseen cities, so
    the sample always contains generic AND unique names, complete AND partial
    addresses, and many distinct cities. Fully deterministic: sorted by place_id,
    no randomness — the same N leads are chosen every run. `exclude_ids` removes
    already-processed leads (e.g. an earlier pilot) so a later pilot is disjoint.
    """
    exclude_ids = exclude_ids or set()
    pool = [l for l in leads_missing_website(leads) if l.get("place_id") not in exclude_ids]
    pool = sorted(pool, key=lambda l: (l.get("place_id") or ""))
    buckets: dict[tuple, list[dict]] = {}
    for lead in pool:
        gen = is_generic_name(lead.get("business_name"), lead.get("city"))
        comp = _address_complete(lead)
        buckets.setdefault((gen, comp), []).append(lead)
    order = [(True, True), (False, False), (True, False), (False, True)]
    order += [k for k in buckets if k not in order]

    chosen: list[dict] = []
    seen_cities: set[str] = set()
    seen_ids: set[str] = set()
    # Round-robin across buckets; within a bucket prefer an unseen city first.
    while len(chosen) < n and any(buckets.get(k) for k in order):
        progressed = False
        for k in order:
            b = buckets.get(k)
            if not b:
                continue
            pick_idx = next((i for i, l in enumerate(b)
                             if (l.get("city") or "").lower() not in seen_cities), 0)
            lead = b.pop(pick_idx)
            if lead.get("place_id") in seen_ids:
                continue
            chosen.append(lead)
            seen_ids.add(lead.get("place_id"))
            seen_cities.add((lead.get("city") or "").lower())
            progressed = True
            if len(chosen) >= n:
                break
        if not progressed:
            break
    return chosen


# ===========================================================================
# Persistence + reporting
# ===========================================================================

def load_progress(paths) -> dict:
    return storage.read_json(paths.website_discovery_progress, default={}) or {}


def save_progress(paths, progress: dict) -> None:
    storage.write_json_atomic(paths.website_discovery_progress, progress)


def load_results(paths) -> dict:
    data = storage.read_json(paths.website_discovery_json, default={}) or {}
    return {r["place_id"]: r for r in data.get("results", [])} if data else {}


def save_results(paths, results_by_id: dict) -> None:
    results = list(results_by_id.values())
    storage.write_json_atomic(paths.website_discovery_json, {
        "generated_at": _now(),
        "count": len(results),
        "results": results,
    })


def _write_csv(path: Path, rows: list[dict], columns: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", newline="", encoding="utf-8-sig") as fh:
        w = csv.DictWriter(fh, fieldnames=columns, extrasaction="ignore")
        w.writeheader()
        for r in rows:
            w.writerow(r)


def write_outputs(paths, results_by_id: dict, guard: SearchCostGuard) -> dict:
    """Write the CSV splits, rejected-candidates.json and the summary report."""
    results = list(results_by_id.values())
    by_status: dict[str, list[dict]] = {}
    for r in results:
        by_status.setdefault(r["status"], []).append(r)

    def _row(r):
        return {
            "place_id": r["place_id"], "business_name": r["business_name"],
            "city": r["city"], "region": r["region"],
            "status": r["status"], "confidence": r["confidence"],
            "discovered_website": r["accepted_website"],
            "industry_relevance_status": r.get("industry_relevance_status"),
            "queries_run": len(r["queries"]),
            "ambiguity_reason": r["ambiguity_reason"],
        }

    cols = ["place_id", "business_name", "city", "region", "status", "confidence",
            "discovered_website", "industry_relevance_status", "queries_run",
            "ambiguity_reason"]
    _write_csv(paths.discovered_websites_csv,
               [_row(r) for r in by_status.get("found_verified", [])], cols)
    _write_csv(paths.manual_website_review_csv,
               [_row(r) for r in by_status.get("manual_review", [])], cols)
    _write_csv(paths.website_not_found_csv,
               [_row(r) for r in (by_status.get("searched_not_found", [])
                                  + by_status.get("rejected_candidates", []))], cols)

    rejected = []
    for r in results:
        for c in r["candidates"]:
            if c["decision"] == "rejected":
                rejected.append({
                    "place_id": r["place_id"], "business_name": r["business_name"],
                    "domain": c["domain"], "url": c["url"],
                    "rejection_reason": c["rejection_reason"],
                    "evidence": c.get("evidence", []),
                })
    storage.write_json_atomic(paths.rejected_candidates_json, {
        "generated_at": _now(), "count": len(rejected), "rejected_candidates": rejected,
    })

    rel_counts: dict[str, int] = {}
    for r in results:
        rc = r.get("industry_relevance_status", "unknown")
        rel_counts[rc] = rel_counts.get(rc, 0) + 1

    report = {
        "generated_at": _now(),
        "provider": provider_name_or(results),
        "total_processed": len(results),
        "status_counts": {k: len(v) for k, v in sorted(by_status.items())},
        "industry_relevance_counts": dict(sorted(rel_counts.items())),
        "cost": guard.as_dict(),
    }
    storage.write_json_atomic(paths.website_discovery_report, report)
    return report


def provider_name_or(results: list[dict]) -> str | None:
    for r in results:
        for q in r.get("queries", []):
            if q.get("provider"):
                return q["provider"]
    return None


# ===========================================================================
# Orchestrator
# ===========================================================================

def run_discovery(leads: list[dict], provider, fetcher, paths, *,
                  max_usd: float = DEFAULT_MAX_USD,
                  max_requests: int = DEFAULT_MAX_REQUESTS,
                  limit: int | None = None,
                  sample: list[dict] | None = None,
                  resume: bool = True,
                  max_fetch_retries: int = MAX_FETCH_RETRIES,
                  sleeper=None) -> dict:
    """Process leads missing a website. Resumable, checkpointed after every lead.

    Never writes leads.json. Writes only the website-discovery.* artifacts under
    `paths`. Returns the summary report dict.
    """
    scope = sample if sample is not None else leads_missing_website(leads)
    if limit is not None:
        scope = scope[:limit]

    name_counts: dict[str, int] = {}
    for l in leads:
        k = normalize_name(l.get("business_name"))
        if k:
            name_counts[k] = name_counts.get(k, 0) + 1

    guard = SearchCostGuard.load(paths.website_discovery_cost_state,
                                 max_usd=max_usd, max_requests=max_requests)
    progress = load_progress(paths) if resume else {}
    results_by_id = load_results(paths) if resume else {}

    processed = 0
    for lead in scope:
        pid = lead.get("place_id")
        prev = progress.get(pid)
        if resume and prev and prev.get("status") in TERMINAL_STATUSES:
            continue
        if not guard.can_afford():
            LOGGER.warning("Search budget/request ceiling reached "
                           "($%.2f/%.2f, %d/%d req) — stopping; resume later.",
                           guard.total_usd(), guard.max_usd,
                           guard.total_requests, guard.max_requests)
            break
        record = discover_one(lead, provider, fetcher, guard, name_counts,
                               max_fetch_retries=max_fetch_retries, sleeper=sleeper)
        results_by_id[pid] = record
        progress[pid] = {"status": record["status"], "updated_at": record["updated_at"]}
        # Frequent, atomic persistence after EVERY lead.
        save_results(paths, results_by_id)
        save_progress(paths, progress)
        processed += 1
        LOGGER.info("[discovery] %s (%s) -> %s%s",
                    record["business_name"], record["city"], record["status"],
                    f" [{record['confidence']}]" if record["confidence"] else "")
        if record["status"] == "discovery_error" and record.get("error") == "budget_exhausted":
            break

    report = write_outputs(paths, results_by_id, guard)
    report["processed_this_run"] = processed
    return report


# ===========================================================================
# Offline re-evaluation of an existing discovery run (NO network)
# ===========================================================================

_BLOCK_PREFIXES = ("social", "directory", "marketplace", "review_profile",
                   "url_shortener", "maps", "manufacturer_oem")


def _is_blocklist_reason(reason: str | None) -> bool:
    if not reason:
        return False
    return (reason.split(":")[0] in _BLOCK_PREFIXES or reason == "invalid_domain"
            or reason.startswith("redirected_"))


def _candidate_phones_from_evidence(evidence: list[dict]) -> list[str]:
    """Recover the candidate-site phone numbers persisted in a candidate's evidence."""
    phones: list[str] = []
    for e in evidence or []:
        if e.get("signal") == "phone_conflict" and isinstance(e.get("observed"), list):
            phones += e["observed"]
        elif e.get("signal") == "phone_differs_neutral" and isinstance(e.get("observed"), dict):
            phones += e["observed"].get("candidate", []) or []
    return sorted(set(phones))


def _redecide_stored_candidate(cand: dict, ident: LeadIdentity) -> dict:
    """Re-classify ONE persisted candidate under the new rules, from stored signals.

    Returns {'kind': ...}. 'need_refetch' means the new outcome depends on evidence
    that was not persisted per-candidate (site industry for a name-only match), so
    we must refetch rather than guess.
    """
    reason = cand.get("rejection_reason")
    if _is_blocklist_reason(reason):
        return {"kind": "blocklist"}
    if is_transient_fetch_reason(reason):
        return {"kind": "transient", "reason": reason}
    if reason and (reason.startswith("unreachable") or reason == "parked_or_empty"
                   or reason.startswith("http_")):
        return {"kind": "permanent_fetch_fail", "reason": reason}

    # URL-based page-type gate (offline: no page body, so multi-location detection
    # is skipped). A non-official page can never be MEDIUM/HIGH.
    ptype, _pev = classify_page_type(cand.get("url", ""))
    if ptype not in OFFICIAL_PAGE_TYPES:
        return {"kind": "non_official", "page_type": ptype}

    sig = {e.get("signal") for e in cand.get("evidence", [])}
    phone_match = "phone_match" in sig
    postcode_match = "postcode_match" in sig
    house_match = "house_number_match" in sig
    city_match = "city_match" in sig
    name_strong = "name_strong" in sig
    postcode_present = postcode_match or ("address_conflict" in sig)
    phone_present = phone_match or ("phone_conflict" in sig) or ("phone_differs_neutral" in sig)

    # The only new upgrade path that needs data we did NOT persist per candidate is
    # "strong name + automotive site content" (site industry was aggregated to the
    # lead, not stored per candidate). If a name-only match could hinge on that,
    # require a refetch instead of guessing.
    if name_strong and not (city_match or postcode_match) and not phone_match \
            and not ("address_conflict" in sig):
        return {"kind": "need_refetch", "reason": "name_only_needs_site_industry"}

    conf, decision, rej = _confidence_from_signals(
        phone_match=phone_match, phone_present=phone_present,
        postcode_match=postcode_match, postcode_present=postcode_present,
        house_match=house_match, city_match=city_match, name_strong=name_strong,
        site_auto=False, generic=ident.generic)
    return {"kind": "decided", "confidence": conf, "decision": decision, "reason": rej}


def reevaluate_lead(record: dict, lead: dict) -> dict:
    """Re-evaluate one stored lead record under the new rules (offline)."""
    ident = LeadIdentity.from_lead(lead)
    cand_results = [_redecide_stored_candidate(c, ident) for c in record.get("candidates", [])]

    best_conf = None
    for cr in cand_results:
        if cr["kind"] == "decided" and cr.get("confidence") == "high":
            best_conf = "high"
            break
        if cr["kind"] == "decided" and cr.get("confidence") == "medium" and best_conf is None:
            best_conf = "medium"

    transient = any(cr["kind"] == "transient" for cr in cand_results)
    needs_refetch = transient or any(cr["kind"] == "need_refetch" for cr in cand_results)
    rel = record.get("industry_relevance_status", "unknown")

    if best_conf == "high":
        new_status, new_conf = "found_verified", "high"
    elif best_conf == "medium":
        new_status, new_conf = "manual_review", "medium"
    elif needs_refetch:
        new_status, new_conf = "fetch_retry_pending", None
    else:
        had_any = bool(record.get("candidates"))
        only_block = had_any and all(cr["kind"] == "blocklist" for cr in cand_results)
        new_status = "rejected_candidates" if only_block else "searched_not_found"
        new_conf = None

    # Wrong-industry protection stays active: never auto-accept; always route to
    # manual review so a human sees the mismatch (refetch_required stays flagged).
    if rel == REL_SUSPECTED_WRONG:
        new_status = "manual_review"

    # Evidence summary for the comparison report.
    all_ev = [e for c in record.get("candidates", []) for e in c.get("evidence", [])]
    sigset = {e.get("signal") for e in all_ev}
    cand_phones = sorted({p for c in record.get("candidates", [])
                          for p in _candidate_phones_from_evidence(c.get("evidence", []))})
    google_phone = normalize_phone(lead.get("phone"))
    transient_failures = [{"domain": c.get("domain"), "reason": c.get("rejection_reason")}
                          for c, cr in zip(record.get("candidates", []), cand_results)
                          if cr["kind"] == "transient"]

    old_status = record.get("status")
    old_conf = record.get("confidence")
    reason_change = _reeval_reason(old_status, new_status, sigset, transient, needs_refetch, cand_results)

    return {
        "place_id": record.get("place_id"),
        "business_name": record.get("business_name"),
        "city": lead.get("city"),
        "address": lead.get("address"),
        "industry_relevance_status": rel,
        "previous_status": old_status,
        "new_status": new_status,
        "previous_confidence": old_conf,
        "new_confidence": new_conf,
        "reason_for_change": reason_change,
        "google_phone": google_phone,
        "google_phone_kind": phone_kind(google_phone),
        "candidate_site_phones": cand_phones,
        "candidate_phone_kinds": sorted({phone_kind(p) for p in cand_phones}),
        "mobile_vs_landline": is_mobile_vs_landline(google_phone, cand_phones),
        "name_evidence": "name_strong" in sigset,
        "postcode_evidence": "postcode_match" in sigset,
        "house_number_evidence": "house_number_match" in sigset,
        "city_evidence": "city_match" in sigset,
        "address_conflict_evidence": "address_conflict" in sigset,
        "transient_fetch_failures": transient_failures,
        "refetch_required": needs_refetch,
        "queries_executed": [q.get("query") for q in record.get("queries", [])],
    }


def _reeval_reason(old, new, sigset, transient, needs_refetch, cand_results) -> str:
    if old == new:
        return "unchanged"
    bits = []
    if new in ("found_verified", "manual_review") and old in ("searched_not_found", "rejected_candidates"):
        if "phone_differs_neutral" in sigset or any(c.get("reason") for c in cand_results):
            bits.append("phone mismatch reclassified as neutral (mobile-vs-landline)")
        pos = [s for s in ("name_strong", "postcode_match", "house_number_match", "city_match")
               if s in sigset]
        if pos:
            bits.append("positive identity: " + ", ".join(pos))
    if new == "fetch_retry_pending":
        if transient:
            bits.append("unresolved transient candidate-fetch failure -> refetch")
        elif needs_refetch:
            bits.append("stored evidence insufficient (site industry) -> refetch")
    if not bits:
        bits.append(f"{old} -> {new}")
    return "; ".join(bits)


def reevaluate_pilot(paths, leads: list[dict]) -> dict:
    """Offline re-evaluation of the persisted discovery run. Makes NO network calls
    (no Brave, no candidate fetch): it reasons purely over already-persisted minimal
    data + leads.json identity. Writes a comparison report; never touches leads.json
    or the original discovery artifacts."""
    data = storage.read_json(paths.website_discovery_json, default={}) or {}
    records = data.get("results", []) if isinstance(data, dict) else []
    leads_by_id = {l.get("place_id"): l for l in leads}

    per_lead = []
    for rec in records:
        lead = leads_by_id.get(rec.get("place_id"), {"place_id": rec.get("place_id"),
                                                     "business_name": rec.get("business_name"),
                                                     "city": rec.get("city")})
        per_lead.append(reevaluate_lead(rec, lead))

    def _tally(key):
        out: dict[str, int] = {}
        for r in per_lead:
            out[r[key]] = out.get(r[key], 0) + 1
        return dict(sorted(out.items()))

    upgraded_phone_neutral = sum(
        1 for r in per_lead
        if r["previous_status"] in ("searched_not_found", "rejected_candidates")
        and r["new_status"] in ("found_verified", "manual_review")
        and r["mobile_vs_landline"])
    upgraded_pc_house_name = sum(
        1 for r in per_lead
        if r["new_status"] == "found_verified" and r["previous_status"] != "found_verified"
        and r["postcode_evidence"] and r["house_number_evidence"] and r["name_evidence"])
    moved_out_transient = sum(
        1 for r in per_lead
        if r["previous_status"] == "searched_not_found"
        and r["new_status"] == "fetch_retry_pending" and r["transient_fetch_failures"])

    summary = {
        "generated_at": _now(),
        "note": "OFFLINE re-evaluation — no Brave requests, no candidate fetches.",
        "count": len(per_lead),
        "status_before": _tally("previous_status"),
        "status_after": _tally("new_status"),
        "suspected_wrong_industry": sum(1 for r in per_lead
                                        if r["industry_relevance_status"] == REL_SUSPECTED_WRONG),
        "upgraded_because_mobile_vs_landline": upgraded_phone_neutral,
        "upgraded_by_postcode_house_name": upgraded_pc_house_name,
        "moved_out_of_searched_not_found_by_transient": moved_out_transient,
        "leads": per_lead,
    }
    storage.write_json_atomic(paths.website_discovery_reeval, summary)
    return summary


# ===========================================================================
# Retry ONLY known candidate-fetch failures (no Brave, no new queries)
# ===========================================================================

RETRY_FETCH_TIMEOUT = 12.0
RETRY_MAX_CONCURRENCY = 2   # hard cap; retries run sequentially (<= 2)


def summarize_discovery_runs(paths, leads: list[dict] | None = None) -> dict:
    """Read-only combined summary across every website-discovery run (base + each
    tagged run: pilot2, full1-auto, …), plus the review queues (fetch_failed
    manual-review, wrong-industry pending, adjacent held) and the remaining
    unprocessed population. Makes no network calls."""
    import glob
    from collections import Counter
    runs = []
    combined_status: Counter = Counter()
    processed_ids: set[str] = set()
    fetch_failed_ids: set[str] = set()
    total_req = total_cost = 0.0
    for path in sorted(glob.glob(str(paths.output / "website-discovery*.json"))):
        name = Path(path).name
        if any(k in name for k in ("progress", "cost-state", "report", "reeval",
                                   "combined-summary")):
            continue
        data = storage.read_json(path, default={}) or {}
        if "results" not in data:
            continue
        results = data.get("results", [])
        tag = name[len("website-discovery"):-len(".json")].lstrip("-") or "base"
        sc = Counter(r.get("status") for r in results)
        combined_status.update(sc)
        for r in results:
            processed_ids.add(r.get("place_id"))
            if r.get("status") == "fetch_failed":
                fetch_failed_ids.add(r.get("place_id"))
        cs_name = (f"website-discovery-cost-state-{tag}.json" if tag != "base"
                   else "website-discovery-cost-state.json")
        cs = storage.read_json(paths.output / cs_name, default={}) or {}
        req = cs.get("total_requests") or 0
        cost = cs.get("spent_usd") or 0.0
        total_req += req
        total_cost += cost
        runs.append({"run": tag, "processed": len(results),
                     "verified": sc.get("found_verified", 0),
                     "status_counts": dict(sorted(sc.items())),
                     "brave_requests": req, "brave_cost_usd": round(cost, 4)})

    # Retry report also contributes fetch_failed leads (pilot-1's).
    retry = storage.read_json(paths.website_fetch_retry_report, default={}) or {}
    for r in retry.get("leads", []):
        if r.get("new_status") == "fetch_failed":
            fetch_failed_ids.add(r.get("place_id"))

    wrong = storage.read_json(paths.wrong_industry_review_json, default={}) or {}
    adj = storage.read_json(paths.adjacent_industry_review_json, default={}) or {}
    review = {
        "manual_review_fetch_failed": len(fetch_failed_ids),
        "wrong_industry_pending_review": wrong.get("count", 0),
        "adjacent_held": adj.get("count", 0),
    }
    remaining = None
    if leads is not None:
        missing = {l.get("place_id") for l in leads_missing_website(leads)}
        remaining = len(missing - processed_ids)

    summary = {
        "generated_at": _now(),
        "runs": runs,
        "combined_status_counts": dict(sorted(combined_status.items())),
        "combined_processed": len(processed_ids),
        "combined_brave_requests": total_req,
        "combined_brave_cost_usd": round(total_cost, 4),
        "review_queues": review,
        "remaining_unprocessed": remaining,
    }
    storage.write_json_atomic(paths.output / "website-discovery-combined-summary.json", summary)
    return summary


def select_retry_place_ids(paths, status: str = "fetch_retry_pending") -> list[str]:
    """place_ids whose re-evaluated status matches `status` (default the retry set)."""
    data = storage.read_json(paths.website_discovery_reeval, default={}) or {}
    return [r["place_id"] for r in data.get("leads", []) if r.get("new_status") == status]


def _minimal_candidate(v: dict) -> dict:
    return {"url": v["url"], "domain": v["domain"], "decision": v["decision"],
            "confidence": v["confidence"], "rejection_reason": v["rejection_reason"],
            "candidate_page_type": v.get("candidate_page_type"),
            "candidate_page_type_evidence": v.get("candidate_page_type_evidence", []),
            "evidence": v.get("evidence", [])}


def retry_fetch_lead(record: dict, lead: dict, fetcher, *, max_fetch_retries: int = MAX_FETCH_RETRIES,
                     sleeper=None) -> dict:
    """Re-fetch and re-verify a lead's ALREADY-KNOWN candidate URLs (no Brave)."""
    ident = LeadIdentity.from_lead(lead)
    # Only non-blocklisted candidate domains; transient-failed ones first; cap at 2.
    eligible = [c for c in record.get("candidates", [])
                if classify_domain(normalize_domain(c.get("url"))) is None]
    eligible.sort(key=lambda c: 0 if is_transient_fetch_reason(c.get("rejection_reason")) else 1)
    seen, to_fetch = set(), []
    for c in eligible:
        d = normalize_domain(c.get("url"))
        if d in seen:
            continue
        seen.add(d)
        to_fetch.append(c["url"])
        if len(to_fetch) >= MAX_FETCHED_DOMAINS:
            break

    verdicts, transient, eligible_verified, best = [], False, False, None
    for u in to_fetch:
        v = verify_candidate(u, ident, fetcher, max_fetch_retries=max_fetch_retries, sleeper=sleeper)
        if v.pop("fetch_transient", False):
            transient = True
        v.pop("site_industry", None)
        v.pop("site_industry_terms", None)
        verdicts.append(v)
        if v["decision"] != "rejected":
            eligible_verified = True
        elif not (v.get("rejection_reason", "") or "").startswith(("unreachable", "parked", "http_")):
            eligible_verified = True
        if v["confidence"] == "high":
            best = v
        elif v["confidence"] == "medium" and (best is None or best["confidence"] != "high"):
            best = v

    rel = record.get("industry_relevance_status", "unknown")
    if best and best["confidence"] == "high":
        status, conf, site = "found_verified", "high", best["url"]
    elif best and best["confidence"] == "medium":
        status, conf, site = "manual_review", "medium", best["url"]
    elif transient:
        status, conf, site = "fetch_failed", None, None
    elif eligible_verified:
        status, conf, site = "searched_not_found", None, None
    elif verdicts:
        status, conf, site = "searched_not_found", None, None
    else:
        status, conf, site = "fetch_failed", None, None   # nothing fetchable

    if rel == REL_SUSPECTED_WRONG:            # protection stays active
        status, site = "manual_review", (site if best else None)

    return {
        "place_id": record.get("place_id"),
        "business_name": record.get("business_name"),
        "city": lead.get("city"),
        "industry_relevance_status": rel,
        "previous_status": record.get("status"),
        "new_status": status,
        "confidence": conf,
        "accepted_website": site,
        "refetched_urls": to_fetch,
        "candidates": [_minimal_candidate(v) for v in verdicts],
    }


def retry_fetches(paths, leads: list[dict], place_ids: list[str], fetcher, *,
                  max_fetch_retries: int = MAX_FETCH_RETRIES, sleeper=None) -> dict:
    """Retry ONLY the given place_ids' known candidate URLs. Never touches Brave,
    leads.json, Places state, or the original pilot/re-eval reports; writes a
    dedicated website-fetch-retry-report.json atomically."""
    data = storage.read_json(paths.website_discovery_json, default={}) or {}
    recs = {r["place_id"]: r for r in data.get("results", [])}
    leads_by_id = {l.get("place_id"): l for l in leads}

    out = []
    for pid in place_ids:
        rec = recs.get(pid)
        if not rec:
            out.append({"place_id": pid, "new_status": "missing_record"})
            continue
        lead = leads_by_id.get(pid, {"place_id": pid, "business_name": rec.get("business_name"),
                                     "city": rec.get("city")})
        out.append(retry_fetch_lead(rec, lead, fetcher,
                                    max_fetch_retries=max_fetch_retries, sleeper=sleeper))

    def _tally(key):
        t = {}
        for r in out:
            t[r.get(key)] = t.get(r.get(key), 0) + 1
        return dict(sorted(t.items(), key=lambda kv: str(kv[0])))

    report = {
        "generated_at": _now(),
        "note": "Retry of KNOWN candidate URLs only — no Brave, no new queries.",
        "count": len(out),
        "status_before": _tally("previous_status"),
        "status_after": _tally("new_status"),
        "leads": out,
    }
    storage.write_json_atomic(paths.website_fetch_retry_report, report)
    return report


# ===========================================================================
# Manual-review queue for fetch_failed leads (unresolved website status)
# ===========================================================================
# `fetch_failed` means the website status is UNRESOLVED — it is NOT a claim that
# the garage has no website. Such leads are queued for a human, kept out of any
# automatic "no website" outreach, and never reclassified to searched_not_found.
MANUAL_REVIEW_OUTCOMES = [
    "official_website_confirmed_manually",
    "website_permanently_unavailable",
    "directory_or_listing_only",
    "no_reliable_website_found",
    "wrong_business_identity",
]

# Statuses that, on their own, justify automatic "no website" outreach.
# INTENTIONALLY EMPTY: only a human reviewer may confirm "no reliable website".
NO_WEBSITE_OUTREACH_STATUSES: set[str] = set()


def is_no_website_for_outreach(status: str) -> bool:
    """Whether a discovery status may drive automatic 'no website' outreach.

    Always False for `fetch_failed` (unresolved) — and for everything else until a
    human confirms it. Prevents pitching a website to a garage that may have one."""
    return status in NO_WEBSITE_OUTREACH_STATUSES


def _annotate_fetch_failed(report: dict, records_key: str, status_key: str, source: str,
                           leads_by_id: dict) -> list[dict]:
    """ADDITIVELY annotate each fetch_failed record in one report and return queue
    rows. Never changes the factual status/candidate fields. Idempotent."""
    queue = []
    for r in report.get(records_key, []):
        if r.get(status_key) != "fetch_failed":
            continue
        r.setdefault("manual_review_status", "pending")     # idempotent
        r["reviewer_options"] = MANUAL_REVIEW_OUTCOMES
        r["excluded_from_no_website_outreach"] = True
        r["website_status_note"] = "unresolved — do NOT claim 'no website'"
        lead = leads_by_id.get(r.get("place_id"), {})
        failure_ev = [{"domain": c.get("domain"), "fetch_reason": c.get("rejection_reason"),
                       "candidate_page_type": c.get("candidate_page_type")}
                      for c in r.get("candidates", [])]
        queue.append({
            "source": source,
            "place_id": r.get("place_id"),
            "business_name": r.get("business_name"),
            "city": r.get("city") or lead.get("city"),
            "fetch_status": "fetch_failed",                 # preserved
            "manual_review_status": r["manual_review_status"],
            "candidate_domains": sorted({c.get("domain") for c in r.get("candidates", [])
                                         if c.get("domain")}),
            "failure_evidence": failure_ev,
            "reviewer_options": MANUAL_REVIEW_OUTCOMES,
            "excluded_from_no_website_outreach": True,
        })
    return queue


def build_manual_review_queue(paths, leads: list[dict] | None = None,
                              extra_sources: list[dict] | None = None) -> dict:
    """Build/refresh ONE combined manual-review queue for all `fetch_failed` leads.

    Sources: the pilot-1 retry report (records under 'leads', status 'new_status')
    plus any `extra_sources` (e.g. a pilot-2 discovery-results file: records under
    'results', status 'status', with a `run_tag` for its own paths). Each source is
    ADDITIVELY annotated in place (manual_review_status default "pending" + reviewer
    options) WITHOUT touching factual status/candidate fields, and written back
    atomically. Idempotent (human decisions survive). Writes one combined
    `manual-review-queue.csv`. Never modifies leads.json; makes no network calls."""
    leads_by_id = {l.get("place_id"): l for l in (leads or [])}
    sources = [{"path": paths.website_fetch_retry_report, "records_key": "leads",
                "status_key": "new_status", "source": "pilot1_retry"}]
    sources += extra_sources or []

    combined: list[dict] = []
    for src in sources:
        report = storage.read_json(src["path"], default={}) or {}
        rows = _annotate_fetch_failed(report, src["records_key"], src["status_key"],
                                      src["source"], leads_by_id)
        # Record the (subset) queue on each source too, additively.
        report["manual_review_queue"] = rows
        report["manual_review_outcomes"] = MANUAL_REVIEW_OUTCOMES
        storage.write_json_atomic(src["path"], report)
        combined += rows

    cols = ["source", "place_id", "business_name", "city", "fetch_status",
            "manual_review_status", "candidate_domains", "candidate_page_types",
            "fetch_reasons", "reviewer_options"]
    csv_rows = []
    for q in combined:
        csv_rows.append({
            "source": q["source"], "place_id": q["place_id"],
            "business_name": q["business_name"], "city": q["city"],
            "fetch_status": q["fetch_status"], "manual_review_status": q["manual_review_status"],
            "candidate_domains": " | ".join(q["candidate_domains"]),
            "candidate_page_types": " | ".join(sorted({e["candidate_page_type"] or "-"
                                                       for e in q["failure_evidence"]})),
            "fetch_reasons": " | ".join(f'{e["domain"]}:{e["fetch_reason"]}' for e in q["failure_evidence"]),
            "reviewer_options": " / ".join(MANUAL_REVIEW_OUTCOMES),
        })
    _write_csv(paths.manual_review_queue_csv, csv_rows, cols)
    return {"count": len(combined), "queue": combined}
