"""Website-audit pilot: a deterministic, isolated, direct-HTTP-only audit run
sampled from the prepared `website-audit-scope.json` population.

Scope and constraints (per the authorized pilot):
  * Direct HTTP/HTTPS fetch ONLY — no Brave, no Google Places, no browser
    automation. Reuses `leadfinder.audit.RealFetcher`/`MockFetcher`.
  * Up to 4 pages per site: homepage + up to 3 followed links (contact,
    services, appointment/booking) — never external domains, never forms,
    never logins.
  * Reuses already-tested detection: `garage_detect` (booking/vehicle lookup),
    `garage_messages`/`scoring` (opportunity classification + scores), and the
    identity-matching primitives already validated in `website_discovery.py`
    (phone/postcode/house-number/name matching) — applied here to VERIFY an
    already-assigned website rather than to pick a new candidate.
  * Never stores raw page HTML — only extracted, structured fields.
  * Fully isolated via `Paths.run_tag`: separate results/progress/report/CSV
    files, checkpointed after every completed lead, resumable independently
    of the legacy `website-audits.json` full-dataset audit.

FINAL-RESPONSE OUTCOME MODEL (v2): `reachable` means a usable SUCCESSFUL
response (final HTTP 200-399), not merely that a server replied. Every other
final outcome (access_blocked / page_not_found / client_error / server_error /
dns_failure / tls_failure / timeout / connection_failure / internal_error) is
UNSCORED: `garage_feature_score` and `website_quality_score` are both set to
the integer `0` (never `null` — one convention, used consistently across JSON,
CSV and reports), `manual_review_required` is always `True`, and the response
body (if any) is NEVER used for identity/service/booking/contact/technology/
quality extraction — only the transport-level facts (status, final URL,
redirect chain) are preserved.

INDUSTRY RELEVANCE (v2): every website source, INCLUDING `google_supplied`, is
assessed for automotive relevance using multiple signals (lead name/category +
candidate domain + — for a successfully-fetched page only — body content).
Absence of garage keywords ALONE is never sufficient for
`suspected_wrong_industry` (see `assess_industry_relevance`).

RUN-TAG SAFETY (v1): "audit-pilot1" and "audit-pilot1-reeval" are reserved,
immutable tags (`RESERVED_IMMUTABLE_TAGS`) — a normal pilot/production
creation call (`run_pilot`) refuses them unconditionally; only
`reevaluate_pilot` may write to one, and only as a first-time creation or an
exact scope/config fingerprint resume (`guard_pilot_write`). Every isolated
run persists a `scope_sha256`/`config_sha256` fingerprint
(`build_run_fingerprint`) so ANY resume — reserved tag or not — fails closed
(`ScopeFingerprintMismatchError`) on the slightest drift rather than silently
truncating, resetting, or replacing an existing run. A fresh production scope
is built by excluding another run's AUTHORITATIVE stored place_ids
(`build_production_scope`), never by position or name.
"""

from __future__ import annotations

import hashlib
import json
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urljoin, urlparse

from .logging_setup import get_logger
from . import storage
from . import garage_detect
from .scoring import score_audit, score_garage_audit
from .garage_messages import classify_opportunity
from .normalize import normalize_domain, normalize_phone
from .website_discovery import (
    _norm_postcode, _all_postcodes, _house_number, _phones_in,
    is_generic_name, _address_complete, _distinctive_tokens, classify_page_type,
    _visible_text, _PREP_WRONG_NAME, _PREP_AUTO_NAME, _PREP_AUTO_CATS,
)

LOGGER = get_logger()

MAX_PAGES_PER_SITE = 4          # homepage + up to 3 followed links
MAX_CONCURRENCY = 3
DEFAULT_TIMEOUT = 10.0

GOOGLE_SUPPLIED = "google_supplied"
CONFIRMED_DISCOVERED = "confirmed_discovered"


# ===========================================================================
# Part A — final-response outcome model
# ===========================================================================

OUTCOME_SUCCESS = "success"
OUTCOME_ACCESS_BLOCKED = "access_blocked"
OUTCOME_PAGE_NOT_FOUND = "page_not_found"
OUTCOME_CLIENT_ERROR = "client_error"
OUTCOME_SERVER_ERROR = "server_error"
OUTCOME_DNS_FAILURE = "dns_failure"
OUTCOME_TLS_FAILURE = "tls_failure"
OUTCOME_TIMEOUT = "timeout"
OUTCOME_CONNECTION_FAILURE = "connection_failure"
OUTCOME_INTERNAL_ERROR = "internal_error"

UNSCORED_OUTCOMES = {OUTCOME_ACCESS_BLOCKED, OUTCOME_PAGE_NOT_FOUND, OUTCOME_CLIENT_ERROR,
                     OUTCOME_SERVER_ERROR, OUTCOME_DNS_FAILURE, OUTCOME_TLS_FAILURE,
                     OUTCOME_TIMEOUT, OUTCOME_CONNECTION_FAILURE, OUTCOME_INTERNAL_ERROR}

# Maps the underlying fetcher's transport-failure `reason` string to a precise
# outcome — a transport failure is NEVER collapsed into a generic "unreachable".
_FETCH_FAILURE_MAP = {
    "dns_failure": OUTCOME_DNS_FAILURE,
    "ssl_error": OUTCOME_TLS_FAILURE,
    "timeout": OUTCOME_TIMEOUT,
    "connection_refused": OUTCOME_CONNECTION_FAILURE,
}


def _status_to_outcome(status: int | None) -> str:
    """Map a final HTTP status code to an outcome category. Shared by the live
    classifier and the offline re-evaluator so both apply identical rules."""
    if status is None or 200 <= status < 400:
        return OUTCOME_SUCCESS
    if status in (401, 403, 429):
        return OUTCOME_ACCESS_BLOCKED
    if status in (404, 410):
        return OUTCOME_PAGE_NOT_FOUND
    if 400 <= status < 500:
        return OUTCOME_CLIENT_ERROR
    if 500 <= status < 600:
        return OUTCOME_SERVER_ERROR
    return OUTCOME_SUCCESS   # defensive: an unrecognized 1xx/other code


def classify_final_response(fetch_result: dict, submitted_url: str) -> dict:
    """Classify the FINAL response (after following redirects) into one of the
    explicit outcome categories. A redirect is never an error by itself — only
    the final status code determines the outcome; the redirect chain and any
    external-domain redirect are preserved/flagged separately."""
    if not fetch_result.get("ok"):
        reason = fetch_result.get("reason") or "unknown"
        outcome = _FETCH_FAILURE_MAP.get(reason, OUTCOME_CONNECTION_FAILURE)
        return {"outcome": outcome, "reachable": False, "status_code": None,
                "final_url": None, "redirects": 0, "redirect_chain": [],
                "external_redirect": False, "raw_failure_reason": reason}

    status = fetch_result.get("status_code")
    final_url = fetch_result.get("final_url") or submitted_url
    chain = fetch_result.get("redirect_chain") or ([final_url] if final_url else [])
    sub_domain = normalize_domain(submitted_url)
    fin_domain = normalize_domain(final_url)
    external = bool(sub_domain and fin_domain and sub_domain != fin_domain)

    outcome = _status_to_outcome(status)

    return {"outcome": outcome, "reachable": outcome == OUTCOME_SUCCESS, "status_code": status,
            "final_url": final_url, "redirects": fetch_result.get("redirects", max(0, len(chain) - 1)),
            "redirect_chain": chain, "external_redirect": external, "raw_failure_reason": None}


# ===========================================================================
# Extra static-HTML signal detection (opening hours, maps, privacy/cookies,
# technologies, and the garage service-line keyword bank)
# ===========================================================================

_OPENING_HOURS_RE = re.compile(
    r"openingstijden|maandag.{0,40}(dinsdag|vrijdag)|(\bma\b.{0,10}\bvr\b)|"
    r"\b\d{1,2}[:.]\d{2}\s*-\s*\d{1,2}[:.]\d{2}\b", re.I)
_MAPS_LINK_RE = re.compile(
    r'href=["\'][^"\']*(maps\.google\.|maps\.app\.goo\.gl|goo\.gl/maps|google\.com/maps)[^"\']*["\']', re.I)
_PRIVACY_RE = re.compile(r"privacybeleid|privacy[\s-]?verklaring|privacy\s*policy", re.I)
_COOKIE_RE = re.compile(
    r"cookiebot|onetrust|cookiefirst|cookie-consent|cookieconsent|\bcookie(s)?\b.{0,30}"
    r"(accepteren|toestemming|consent|akkoord)", re.I)

_TECH_SIGNATURES = {
    "WordPress": re.compile(r"wp-content|wp-includes|/wp-json/", re.I),
    "Wix": re.compile(r"static\.wixstatic\.com|wix\.com", re.I),
    "Shopify": re.compile(r"cdn\.shopify\.com|Shopify\.theme", re.I),
    "Squarespace": re.compile(r"squarespace\.com|static1\.squarespace", re.I),
    "Google Analytics": re.compile(r"google-analytics\.com/analytics\.js|gtag\(['\"]config", re.I),
    "Google Tag Manager": re.compile(r"googletagmanager\.com/gtm\.js", re.I),
    "Cloudflare": re.compile(r"cloudflare\.com|cf-ray", re.I),
    "Facebook Pixel": re.compile(r"connect\.facebook\.net.*fbevents\.js", re.I),
}

_SERVICE_KEYWORDS = {
    "mentions_apk": re.compile(r"\bapk\b", re.I),
    "mentions_maintenance": re.compile(r"onderhoud", re.I),
    "mentions_repair": re.compile(r"reparatie|herstel(?!lin)", re.I),
    "mentions_tires": re.compile(r"\bband(en)?\b", re.I),
    "mentions_diagnostics": re.compile(r"diagnose|storingzoeken|foutcode", re.I),
    "mentions_aircon": re.compile(r"\bairco\b|air[\s-]?conditioning", re.I),
    "mentions_bodywork": re.compile(r"schadeherstel|carrosserie|autoschade", re.I),
    "mentions_towing": re.compile(r"\bsleep(dienst)?\b|berging|pechhulp", re.I),
    "mentions_vehicle_sales": re.compile(r"occasions?\b|autoverkoop|te koop", re.I),
}

_CONTACT_LINK_RE = re.compile(
    r'href=["\']([^"\']*(?:contact|over-?ons|locatie|vestiging)[^"\']*)["\']', re.I)
_SERVICES_LINK_RE = re.compile(
    r'href=["\']([^"\']*(?:diensten|services|producten|aanbod)[^"\']*)["\']', re.I)


def detect_extra_signals(html: str) -> dict:
    """Static-HTML-only detection of the additional pilot fields. Never
    fabricates evidence — every flag is a direct regex match on the fetched
    page text/markup. MUST NOT be called on a non-success (error) page body."""
    text = html or ""
    hits = {name: bool(rx.search(text)) for name, rx in _SERVICE_KEYWORDS.items()}
    techs = sorted(name for name, rx in _TECH_SIGNATURES.items() if rx.search(text))
    return {
        "opening_hours_present": bool(_OPENING_HOURS_RE.search(text)),
        "maps_link_present": bool(_MAPS_LINK_RE.search(text)),
        "privacy_policy_present": bool(_PRIVACY_RE.search(text)),
        "cookie_banner_evidence": bool(_COOKIE_RE.search(text)),
        "detected_technologies": techs,
        **hits,
    }


def _merge_extra_signals(a: dict, b: dict) -> dict:
    out = dict(a)
    for k, v in b.items():
        if k == "detected_technologies":
            out[k] = sorted(set(out.get(k, [])) | set(v))
        else:
            out[k] = out.get(k, False) or v
    return out


def _find_extra_pages(html: str, base_url: str) -> dict:
    """Best-effort same-domain contact/services page URLs (never external)."""
    if not html or not base_url:
        return {}
    base_host = (urlparse(base_url).hostname or "").lower()
    out = {}
    for key, rx in (("contact", _CONTACT_LINK_RE), ("services", _SERVICES_LINK_RE)):
        m = rx.search(html)
        if not m:
            continue
        absolute = urljoin(base_url, m.group(1).strip())
        host = (urlparse(absolute).hostname or "").lower()
        if host and base_host and host != base_host:
            continue
        out[key] = absolute
    return out


# ===========================================================================
# Identity verification (re-confirming an ALREADY-ASSIGNED website)
# ===========================================================================

NOT_EVALUATED_IDENTITY = {
    "identity_confidence": "not_evaluated", "identity_match_outcome": "not_evaluated",
    "identity_evidence": [], "identity_conflicting_evidence": [],
}


def identity_evidence_for_audit(lead: dict, combined_html: str) -> dict:
    """Re-confirm that the audited site plausibly belongs to this lead, reusing
    the same phone/postcode/house-number/name primitives already validated in
    website_discovery.py. A phone MISMATCH alone is neutral (Google mobile vs
    site landline is common); a genuine conflict requires a differing address
    when the name is not strongly present — mirrors Verifier V2's rule.

    Uses `_distinctive_tokens` (drops generic garage words AND the city name)
    so a generic or city-only business name can NEVER by itself produce a
    strong ("name_strong") identity match."""
    phone_norm = normalize_phone(lead.get("phone"))
    postcode = _norm_postcode(lead.get("address"))
    house = _house_number(lead.get("address"))
    city = (lead.get("city") or "").strip().lower()
    name_tokens = _distinctive_tokens(lead.get("business_name"), lead.get("city"))

    text = _visible_text(combined_html)
    page_phones = _phones_in(combined_html)
    page_postcodes = _all_postcodes(combined_html)

    phone_match = bool(phone_norm and phone_norm in page_phones)
    postcode_match = bool(postcode and postcode in page_postcodes)
    house_match = bool(house and postcode_match and re.search(r"\b" + re.escape(house) + r"\b", text))
    city_match = bool(city and city in text)
    name_strong = any(tok in text for tok in name_tokens)

    phone_conflict = bool(page_phones) and bool(phone_norm) and not phone_match
    postcode_conflict = bool(page_postcodes) and bool(postcode) and not postcode_match
    conflict = postcode_conflict and not name_strong and not phone_match

    evidence = [s for s, present in (
        ("phone_match", phone_match), ("postcode_match", postcode_match),
        ("house_number_match", house_match), ("city_match", city_match),
        ("name_strong", name_strong),
    ) if present]
    conflicting = [s for s, present in (
        ("phone_conflict", phone_conflict), ("address_conflict", postcode_conflict),
    ) if present]

    if conflict:
        confidence = "conflict"
    elif phone_match or (postcode_match and house_match and name_strong):
        confidence = "high"
    elif name_strong and (city_match or postcode_match):
        confidence = "medium"
    elif evidence:
        confidence = "low"
    else:
        confidence = "unknown"

    return {
        "identity_confidence": confidence,
        "identity_match_outcome": "conflict" if conflict else ("match" if evidence else "no_evidence"),
        "identity_evidence": evidence,
        "identity_conflicting_evidence": conflicting,
    }


# ===========================================================================
# Part B — audit-time industry relevance (every source, including google_supplied)
# ===========================================================================

REL_AUTOMOTIVE_CONFIRMED = "automotive_confirmed"
REL_PROBABLY_AUTOMOTIVE = "probably_automotive"
REL_SUSPECTED_WRONG = "suspected_wrong_industry"
REL_INSUFFICIENT = "insufficient_evidence"

# Body-text bank (word-boundary safe — real prose has spaces/punctuation).
# Starts from the already-tested website_discovery wrong-industry name bank and
# adds terms surfaced by the pilot (watersport, boats) plus English dog/pet
# words often seen in Dutch business copy.
_WRONG_INDUSTRY_BODY_TERMS = _PREP_WRONG_NAME + (
    "watersport", "jachthaven", "botenverhuur", "zeilschool", "surfschool",
    "\\bboot\\b", "\\bboten\\b",
    "\\bhond\\b", "\\bhonden\\b", "\\bdog\\b", "\\bdogs\\b", "\\bkatten\\b",
)
# Domain/name substrings — deliberately LOOSER than body matching (domain names
# and business names often concatenate words with no separator, e.g.
# "dogdoc.nl", "amritwatersport.nl") — always paired with manual_review, never
# a silent auto-reject, so the slightly higher false-positive tolerance here is
# safe.
_WRONG_INDUSTRY_SUBSTRING_TERMS = _PREP_WRONG_NAME + (
    "watersport", "jachthaven", "botenverhuur", "zeilschool", "surfschool",
    "hondenuitlaat", "hondentrim", "hondenschool", "dierenpension", "dogwalk",
    "dogsitting", "dog", "hond",
)


def _body_terms_in(text: str, terms) -> list[str]:
    out = []
    for t in terms:
        pattern = t if t.startswith("\\b") else re.escape(t)
        if re.search(pattern, text, re.I):
            out.append(t.strip("\\b"))
    return out


def assess_industry_relevance(lead: dict, domain: str | None, body_text: str | None,
                              automotive_hit_count: int = 0) -> dict:
    """Multi-signal industry-relevance assessment, run for EVERY website source
    (including google_supplied). `body_text` is None whenever the final
    response was not a success (per Part A, error-page content is never used
    for this either) — in that case only lead-level name/category + the
    candidate domain are consulted. Absence of garage keywords ALONE is never
    sufficient for `suspected_wrong_industry` (needs an actual wrong-industry
    signal, not just a missing positive one)."""
    name = (lead.get("business_name") or "").lower()
    category = (lead.get("category") or "").lower()
    dom = (domain or "").lower()

    # Name uses the SAME extended bank as the domain check (business names, like
    # domains, are a single string that may contain a wrong-industry term as a
    # substring — e.g. "What's up dogs").
    name_wrong = [t for t in _WRONG_INDUSTRY_SUBSTRING_TERMS if t in name]
    domain_wrong = [t for t in _WRONG_INDUSTRY_SUBSTRING_TERMS if t in dom]
    body_wrong = _body_terms_in(body_text, _WRONG_INDUSTRY_BODY_TERMS) if body_text is not None else []

    name_auto = [t for t in _PREP_AUTO_NAME if t in name]
    cat_auto = category in _PREP_AUTO_CATS

    strong_wrong = bool(name_wrong or domain_wrong or body_wrong)
    strong_auto = bool(name_auto or cat_auto or automotive_hit_count >= 1)

    evidence, conflicting = [], []
    if name_auto:
        evidence.append({"source": "business_name", "signal": "automotive_term", "value": name_auto})
    if cat_auto:
        evidence.append({"source": "google_category", "signal": "automotive_category", "value": category})
    if automotive_hit_count:
        evidence.append({"source": "site_content", "signal": "automotive_service_keywords",
                         "value": automotive_hit_count})
    if name_wrong:
        conflicting.append({"source": "business_name", "signal": "wrong_industry_term", "value": name_wrong})
    if domain_wrong:
        conflicting.append({"source": "domain", "signal": "wrong_industry_term", "value": domain_wrong})
    if body_wrong:
        conflicting.append({"source": "site_content", "signal": "wrong_industry_term", "value": body_wrong})

    if strong_wrong:
        status = REL_SUSPECTED_WRONG
    elif strong_auto and automotive_hit_count >= 2:
        status = REL_AUTOMOTIVE_CONFIRMED
    elif strong_auto:
        status = REL_PROBABLY_AUTOMOTIVE
    else:
        status = REL_INSUFFICIENT

    return {
        "industry_relevance_status": status,
        "industry_relevance_evidence": evidence,
        "industry_conflicting_evidence": conflicting,
        "excluded_from_automatic_garage_outreach": status == REL_SUSPECTED_WRONG,
    }


# ===========================================================================
# Scores + classification (reuses the already-tested opportunity scorers)
# ===========================================================================

def garage_feature_score(audit: dict) -> int:
    """0-100, higher = more complete garage feature set. 0 for any non-success
    outcome (never scores an error page's body)."""
    if not audit.get("reachable"):
        return 0
    result = score_garage_audit(audit)
    return max(0, min(100, 100 - result.score))


def website_quality_score(audit: dict) -> int:
    """0-100, higher = better generic technical/UX quality. 0 for any
    non-success outcome (never scores an error page's body)."""
    if not audit.get("reachable"):
        return 0
    result = score_audit(audit)
    return max(0, min(100, 100 - result.score))


def is_score_eligible(record: dict) -> bool:
    """A record counts toward the score averages only when it is a successful
    fetch AND assessed as automotive/probably-automotive (never a
    suspected-wrong-industry or insufficient-evidence site, and never a
    non-success outcome)."""
    return (record.get("outcome") == OUTCOME_SUCCESS
            and record.get("industry_relevance_status") in
            (REL_AUTOMOTIVE_CONFIRMED, REL_PROBABLY_AUTOMOTIVE))


# ===========================================================================
# Per-lead audit orchestration (direct HTTP only, <=4 pages, no forms/logins)
# ===========================================================================

def _terminal_unscored_record(record: dict, classification: dict, lead: dict) -> dict:
    """Build the shared skeleton for any non-success final outcome: 0 scores,
    manual_review_required=True, no identity/industry content evaluation."""
    record.update(classification)
    record.update(NOT_EVALUATED_IDENTITY)
    domain = normalize_domain(record.get("submitted_url"))
    relevance = assess_industry_relevance(lead, domain, body_text=None, automotive_hit_count=0)
    record.update(relevance)
    warnings = [f"{classification['outcome']}"]
    if classification.get("raw_failure_reason"):
        warnings[-1] = f"{classification['outcome']}:{classification['raw_failure_reason']}"
    elif classification.get("status_code"):
        warnings[-1] = f"{classification['outcome']}:http_{classification['status_code']}"
    if relevance["industry_relevance_status"] == REL_SUSPECTED_WRONG:
        warnings.append("suspected_wrong_industry")
    record.update({
        "final_audit_classification": classification["outcome"],
        "audit_warnings": warnings,
        "manual_review_required": True,
        "garage_feature_score": 0,
        "website_quality_score": 0,
    })
    return record


def audit_one_pilot_lead(lead: dict, website: str, website_source: str, fetcher,
                         max_pages: int = MAX_PAGES_PER_SITE) -> dict:
    """`website` MUST come from the audit-scope entry, not `lead.get("website")`:
    for `confirmed_discovered` leads, `leads.json`'s own `website` field is still
    None (discovered URLs were deliberately never merged back into leads.json),
    so only the audit-scope's `website` value is authoritative here."""
    pid = lead.get("place_id")
    record = {
        "place_id": pid, "business_name": lead.get("business_name"), "city": lead.get("city"),
        "website_source": website_source, "submitted_url": website,
        "final_url": None, "reachable": False, "status_code": None, "outcome": None,
        "redirects": 0, "redirect_chain": [], "external_redirect": False,
        "pages_fetched": [], "page_titles": [], "detected_page_types": [],
        "checked_at": datetime.now(timezone.utc).isoformat(),
    }

    home = fetcher.fetch(website)
    classification = classify_final_response(home, website)

    if classification["outcome"] != OUTCOME_SUCCESS:
        return _terminal_unscored_record(record, classification, lead)

    record.update({k: v for k, v in classification.items() if k != "raw_failure_reason"})
    final_url = classification["final_url"]
    html_pages = [home.get("html", "") or ""]
    record["https"] = home.get("https")
    record["response_time"] = home.get("response_time")
    record["pages_fetched"].append(final_url)

    title_re = re.compile(r"<title[^>]*>(.*?)</title>", re.I | re.S)
    m = title_re.search(html_pages[0])
    record["page_titles"].append((m.group(1).strip() if m else None))
    home_ptype, home_pev = classify_page_type(final_url, html=html_pages[0])
    record["detected_page_types"].append(home_ptype)

    if classification["external_redirect"]:
        record.setdefault("_pre_warnings", []).append(
            f"external_domain_redirect:{normalize_domain(final_url)}")

    # Follow up to 3 more SAME-DOMAIN pages: contact, services, appointment —
    # each is independently classified; a non-success secondary page is simply
    # not merged in (never scored, never used for identity/service content).
    extra_links = _find_extra_pages(html_pages[0], final_url)
    booking_links = garage_detect.find_booking_links(html_pages[0], final_url, limit=1)
    if booking_links:
        extra_links["booking"] = booking_links[0]
    for key in ("contact", "services", "booking"):
        if len(record["pages_fetched"]) >= max_pages:
            break
        url = extra_links.get(key)
        if not url or url in record["pages_fetched"]:
            continue
        fetched = fetcher.fetch(url)
        sub_cls = classify_final_response(fetched, url)
        if sub_cls["outcome"] != OUTCOME_SUCCESS:
            continue
        page_html = fetched.get("html", "") or ""
        html_pages.append(page_html)
        record["pages_fetched"].append(sub_cls["final_url"])
        tm = title_re.search(page_html)
        record["page_titles"].append((tm.group(1).strip() if tm else None))
        ptype, _ = classify_page_type(sub_cls["final_url"], html=page_html)
        record["detected_page_types"].append(ptype)

    combined_html = "\n".join(html_pages)

    from .audit import (_VIEWPORT_RE, _DESC_RE, _PHONE_RE, _EMAIL_RE, _WA_RE,
                        _CTA_RE, _SERVICE_LINK_RE)
    from .copyright_detect import detect_copyright
    from .form_detect import detect_form
    cr = detect_copyright(combined_html, current_year=datetime.now(timezone.utc).year)
    form = detect_form(html_pages[0], base_url=final_url, fetcher=fetcher)
    is_mobile_viewport = bool(_VIEWPORT_RE.search(html_pages[0]))
    record.update({
        "mobile_viewport": is_mobile_viewport,
        "mobile_responsive_evidence": is_mobile_viewport,
        "title": record["page_titles"][0] if record["page_titles"] else None,
        "meta_description": (lambda mm: mm.group(1) if mm else None)(_DESC_RE.search(html_pages[0])),
        "has_visible_phone": bool(_PHONE_RE.search(combined_html)),
        "has_visible_email": bool(_EMAIL_RE.search(combined_html)),
        "has_whatsapp_link": bool(_WA_RE.search(combined_html)),
        "has_cta": bool(_CTA_RE.search(combined_html)),
        "has_contact_form": form["found"],
        "has_service_pages": bool(_SERVICE_LINK_RE.search(html_pages[0])),
        "has_contact_page": "contact" in extra_links or home_ptype == "official_business_contact_page",
        "server_error": False,   # by construction: we only reach here on outcome==success
        "outdated_copyright": cr["outdated_copyright"],
        "copyright_year": cr["effective_copyright_year"],
    })

    booking = garage_detect.detect_booking(html_pages[0], page_url=final_url)
    vehicle = garage_detect.detect_vehicle_lookup(html_pages[0], page_url=final_url)
    for extra_html in html_pages[1:]:
        booking = garage_detect.merge_booking(booking, garage_detect.detect_booking(extra_html))
        vehicle = garage_detect.merge_vehicle(vehicle, garage_detect.detect_vehicle_lookup(extra_html))
    record.update(booking)
    record.update(vehicle)

    extra = detect_extra_signals(html_pages[0])
    for extra_html in html_pages[1:]:
        extra = _merge_extra_signals(extra, detect_extra_signals(extra_html))
    record.update(extra)

    identity = identity_evidence_for_audit(lead, combined_html)
    record.update(identity)

    automotive_hit_count = sum(1 for k in _SERVICE_KEYWORDS if record.get(k))
    domain = normalize_domain(final_url)
    relevance = assess_industry_relevance(lead, domain, body_text=_visible_text(combined_html),
                                          automotive_hit_count=automotive_hit_count)
    record.update(relevance)

    record["has_website"] = True
    record["website"] = website
    record["garage_feature_score"] = garage_feature_score(record)
    record["website_quality_score"] = website_quality_score(record)

    warnings = record.pop("_pre_warnings", [])
    manual_review = bool(warnings)   # external-domain redirect alone -> review
    if identity["identity_confidence"] == "conflict":
        warnings.append("identity_conflict")
        manual_review = True
    elif identity["identity_confidence"] in ("low", "unknown"):
        warnings.append("weak_identity_evidence")
        manual_review = True
    if relevance["industry_relevance_status"] == REL_SUSPECTED_WRONG:
        warnings.append("suspected_wrong_industry")
        manual_review = True
    elif relevance["industry_relevance_status"] == REL_INSUFFICIENT:
        warnings.append("insufficient_industry_evidence")
        manual_review = True
    if automotive_hit_count == 0:
        warnings.append("no_garage_service_keywords_detected")

    record["final_audit_classification"] = classify_opportunity(record)
    record["audit_warnings"] = warnings
    record["manual_review_required"] = manual_review
    return record


# ===========================================================================
# Deterministic pilot sampling from the prepared audit scope
# ===========================================================================

def select_pilot_sample(scope_entries: list[dict], leads_by_id: dict,
                        n_google: int = 40, n_discovered: int = 10,
                        exclude_place_ids: set | None = None) -> list[dict]:
    """Deterministic 50-lead sample (or fewer if a bucket is too small) from
    the prepared audit-ready scope: `n_google` Google-supplied + `n_discovered`
    confirmed-discovered leads, maximizing distinct cities and mixing generic
    and unique business names. No duplicate place_id or website domain."""
    exclude_place_ids = exclude_place_ids or set()

    def bucket(source):
        items = [e for e in scope_entries if e["website_source"] == source
                 and e["place_id"] not in exclude_place_ids
                 and e["place_id"] in leads_by_id]
        return sorted(items, key=lambda e: e["place_id"])

    def pick(items, n):
        seen_cities, seen_domains, chosen = set(), set(), []
        strata: dict[tuple, list] = {}
        for e in items:
            lead = leads_by_id[e["place_id"]]
            key = (is_generic_name(lead.get("business_name"), lead.get("city")),
                  _address_complete(lead))
            strata.setdefault(key, []).append(e)
        order = [(False, True), (True, False), (False, False), (True, True)]
        order += [k for k in strata if k not in order]
        while len(chosen) < n and any(strata.get(k) for k in order):
            progressed = False
            for k in order:
                b = strata.get(k)
                if not b:
                    continue
                lead_city = lambda e: (leads_by_id[e["place_id"]].get("city") or "").lower()
                idx = next((i for i, e in enumerate(b) if lead_city(e) not in seen_cities), 0)
                e = b.pop(idx)
                domain = normalize_domain(e["website"])
                if domain in seen_domains:
                    continue
                chosen.append(e)
                seen_domains.add(domain)
                seen_cities.add(lead_city(e))
                progressed = True
                if len(chosen) >= n:
                    break
            if not progressed:
                break
        return chosen

    google_pool = bucket(GOOGLE_SUPPLIED)
    disc_pool = bucket(CONFIRMED_DISCOVERED)
    sample = pick(google_pool, n_google) + pick(disc_pool, min(n_discovered, len(disc_pool)))
    return sample


# ===========================================================================
# Orchestrator: bounded concurrency, per-lead checkpointing, isolated resume
# ===========================================================================

def load_pilot_results(paths) -> dict:
    data = storage.read_json(paths.audit_pilot_results_json, default={}) or {}
    return {r["place_id"]: r for r in data.get("results", [])} if data else {}


def save_pilot_results(paths, results_by_id: dict) -> None:
    storage.write_json_atomic(paths.audit_pilot_results_json, {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "count": len(results_by_id), "results": list(results_by_id.values()),
    })


def load_pilot_progress(paths) -> dict:
    return storage.read_json(paths.audit_pilot_progress_json, default={}) or {}


def save_pilot_progress(paths, progress: dict) -> None:
    storage.write_json_atomic(paths.audit_pilot_progress_json, progress)


def run_pilot(paths, sample: list[dict], leads_by_id: dict, fetcher, *,
             max_concurrency: int = MAX_CONCURRENCY, resume: bool = True) -> dict:
    """Audit exactly `sample` leads with bounded concurrency (<=3), checkpointing
    after every completed lead. Resume is isolated to `paths` (i.e. to
    whatever run_tag the caller configured). Never touches the legacy
    website-audits.json, leads.json, or any discovery/canonical source file.

    This is a normal pilot/production CREATION command: it NEVER writes to a
    reserved, immutable tag (see `guard_pilot_write`), and refuses to resume
    into an existing run whose scope/config fingerprint doesn't exactly match
    what `sample`/`max_concurrency` would produce now."""
    fingerprint = guard_pilot_write(paths, paths.run_tag, sample,
                                    max_concurrency=max_concurrency, resume=resume,
                                    allow_reserved=False)
    save_fingerprint(paths, fingerprint)

    results_by_id = load_pilot_results(paths) if resume else {}
    progress = load_pilot_progress(paths) if resume else {}

    todo = [e for e in sample if e["place_id"] not in results_by_id]
    max_workers = max(1, min(max_concurrency, MAX_CONCURRENCY))
    processed_this_run = 0

    with ThreadPoolExecutor(max_workers=max_workers) as pool:
        futures = {}
        for e in todo:
            lead = leads_by_id[e["place_id"]]
            fut = pool.submit(audit_one_pilot_lead, lead, e["website"], e["website_source"], fetcher)
            futures[fut] = e["place_id"]
        for fut in as_completed(futures):
            pid = futures[fut]
            try:
                record = fut.result()
            except Exception as exc:  # noqa: BLE001 - never crash the whole pilot
                record = {"place_id": pid, "reachable": False, "outcome": OUTCOME_INTERNAL_ERROR,
                         "raw_failure_reason": f"internal_error:{exc}",
                         "final_audit_classification": OUTCOME_INTERNAL_ERROR,
                         "audit_warnings": ["internal_error"], "manual_review_required": True,
                         "garage_feature_score": 0, "website_quality_score": 0,
                         "industry_relevance_status": REL_INSUFFICIENT,
                         "excluded_from_automatic_garage_outreach": False}
            results_by_id[pid] = record
            progress[pid] = {"status": record.get("final_audit_classification"),
                             "checked_at": record.get("checked_at")}
            save_pilot_results(paths, results_by_id)   # checkpoint after EVERY lead
            save_pilot_progress(paths, progress)
            processed_this_run += 1
            LOGGER.info("[audit-pilot] %s -> %s", record.get("business_name"),
                        record.get("final_audit_classification"))

    ordered = [results_by_id[e["place_id"]] for e in sample if e["place_id"] in results_by_id]
    report = build_pilot_report(ordered)
    report["processed_this_run"] = processed_this_run
    storage.write_json_atomic(paths.audit_pilot_report_json, report)
    _write_pilot_csv(paths.audit_pilot_csv, ordered)
    return report


_PILOT_CSV_COLS = ["place_id", "business_name", "city", "website_source", "submitted_url",
                   "final_url", "outcome", "reachable", "status_code", "redirects",
                   "external_redirect", "identity_confidence", "identity_match_outcome",
                   "industry_relevance_status", "excluded_from_automatic_garage_outreach",
                   "final_audit_classification", "garage_feature_score", "website_quality_score",
                   "manual_review_required", "audit_warnings"]


def _write_pilot_csv(path: Path, records: list[dict]) -> None:
    import csv
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", newline="", encoding="utf-8-sig") as fh:
        w = csv.DictWriter(fh, fieldnames=_PILOT_CSV_COLS, extrasaction="ignore")
        w.writeheader()
        for r in records:
            row = dict(r)
            row["audit_warnings"] = " | ".join(r.get("audit_warnings", []))
            w.writerow(row)


# ===========================================================================
# Part C — reporting: score-eligibility + component distribution
# ===========================================================================

_QUALITY_COMPONENTS = {
    "successful_fetch": lambda r: True,   # trivially true for every score-eligible record
    "https": lambda r: bool(r.get("https")),
    "mobile_viewport": lambda r: bool(r.get("mobile_viewport")),
    "title": lambda r: bool(r.get("title")),
    "meta_description": lambda r: bool(r.get("meta_description")),
    "visible_phone": lambda r: bool(r.get("has_visible_phone")),
    "visible_email": lambda r: bool(r.get("has_visible_email")),
    "contact_form": lambda r: bool(r.get("has_contact_form")),
    "cta": lambda r: bool(r.get("has_cta")),
    "privacy_policy": lambda r: bool(r.get("privacy_policy_present")),
    "cookie_evidence": lambda r: bool(r.get("cookie_banner_evidence")),
    "contact_page": lambda r: bool(r.get("has_contact_page")),
    "service_pages": lambda r: bool(r.get("has_service_pages")),
}


def build_pilot_report(records: list[dict]) -> dict:
    from collections import Counter

    def cnt(pred):
        return sum(1 for r in records if pred(r))

    by_outcome = Counter(r.get("outcome") for r in records)
    eligible = [r for r in records if is_score_eligible(r)]
    quality_scores = [r.get("website_quality_score", 0) for r in eligible]
    garage_scores = [r.get("garage_feature_score", 0) for r in eligible]
    component_counts = {name: sum(1 for r in eligible if pred(r))
                        for name, pred in _QUALITY_COMPONENTS.items()}

    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "count": len(records),
        # --- Part A/C: outcome buckets (mutually exclusive, sum to `count`) ---
        "successful_usable_websites": by_outcome.get(OUTCOME_SUCCESS, 0),
        "page_not_found": by_outcome.get(OUTCOME_PAGE_NOT_FOUND, 0),
        "access_blocked": by_outcome.get(OUTCOME_ACCESS_BLOCKED, 0),
        "other_client_error": by_outcome.get(OUTCOME_CLIENT_ERROR, 0),
        "server_error": by_outcome.get(OUTCOME_SERVER_ERROR, 0),
        "dns_failures": by_outcome.get(OUTCOME_DNS_FAILURE, 0),
        "tls_failures": by_outcome.get(OUTCOME_TLS_FAILURE, 0),
        "timeouts": by_outcome.get(OUTCOME_TIMEOUT, 0),
        "connection_failures": by_outcome.get(OUTCOME_CONNECTION_FAILURE, 0),
        "internal_errors": by_outcome.get(OUTCOME_INTERNAL_ERROR, 0),
        # --- industry relevance ---
        "suspected_wrong_industry": cnt(lambda r: r.get("industry_relevance_status") == REL_SUSPECTED_WRONG),
        "insufficient_industry_evidence": cnt(lambda r: r.get("industry_relevance_status") == REL_INSUFFICIENT),
        "automotive_confirmed": cnt(lambda r: r.get("industry_relevance_status") == REL_AUTOMOTIVE_CONFIRMED),
        "probably_automotive": cnt(lambda r: r.get("industry_relevance_status") == REL_PROBABLY_AUTOMOTIVE),
        # --- score eligibility ---
        "score_eligible_count": len(eligible),
        "unscored_website_count": len(records) - len(eligible),
        "average_garage_feature_score": round(sum(garage_scores) / len(garage_scores), 1) if garage_scores else 0,
        "average_website_quality_score": round(sum(quality_scores) / len(quality_scores), 1) if quality_scores else 0,
        "quality_score_component_distribution": component_counts,
        # --- identity / behavior signals (score-eligible-agnostic, all records) ---
        "identity_matches": cnt(lambda r: r.get("identity_match_outcome") == "match"),
        "identity_conflicts": cnt(lambda r: r.get("identity_match_outcome") == "conflict"),
        "manual_review_count": cnt(lambda r: r.get("manual_review_required")),
        "with_appointment_or_booking": cnt(lambda r: r.get("has_real_booking_calendar")
                                           or r.get("has_appointment_request_form")),
        "contact_form_only": cnt(lambda r: r.get("has_contact_form")
                                 and not (r.get("has_real_booking_calendar")
                                         or r.get("has_appointment_request_form"))),
        "with_whatsapp": cnt(lambda r: r.get("has_whatsapp_link")),
        "mentions_apk": cnt(lambda r: r.get("mentions_apk")),
        "mentions_maintenance_or_repair": cnt(lambda r: r.get("mentions_maintenance") or r.get("mentions_repair")),
        "no_garage_service_evidence": cnt(lambda r: "no_garage_service_keywords_detected" in (r.get("audit_warnings") or [])),
        "classification_counts": dict(Counter(r.get("final_audit_classification") for r in records)),
        "website_source_counts": dict(Counter(r.get("website_source") for r in records)),
        "redirects": cnt(lambda r: r.get("redirects")),
        "external_redirects": cnt(lambda r: r.get("external_redirect")),
    }


# ===========================================================================
# Part D — offline re-evaluation of an EXISTING pilot + targeted refetch only
# ===========================================================================
# Re-applies the Part A/B rules to an already-stored pilot run WITHOUT making
# any network request when the stored fields already contain enough evidence:
#   * a stored 404/410 that was (under the old rules) marked reachable is
#     corrected purely from its stored status code — no refetch needed;
#   * a stored transport failure's reason string maps directly to a precise
#     new outcome — no refetch needed;
#   * a lead whose business name or website domain already contains a
#     wrong-industry term is classified `suspected_wrong_industry` from that
#     alone — no refetch needed;
#   * a genuinely-old-successful fetch that already recorded >=1 automotive
#     service-keyword hit is classified automotive/probably-automotive from
#     those ALREADY-STORED booleans — no refetch needed.
# Only leads with NONE of the above (a success outcome, no name/domain signal,
# and zero previously-recorded automotive hits — the site's actual body content
# was never evidence for industry relevance under the old rules) are flagged
# `needs_refetch`; a real targeted refetch is performed ONLY for those.

def reevaluate_stored_record_offline(record: dict, lead: dict) -> tuple[dict, bool]:
    """Returns (new_record, needs_refetch). Never makes a network call."""
    domain = normalize_domain(record.get("submitted_url"))
    old_status = record.get("status_code")
    old_reachable = record.get("reachable")

    def _skeleton():
        return {"place_id": record.get("place_id"), "business_name": record.get("business_name"),
                "city": record.get("city"), "website_source": record.get("website_source"),
                "submitted_url": record.get("submitted_url"),
                "pages_fetched": record.get("pages_fetched", []),
                "page_titles": [], "detected_page_types": [],
                "checked_at": record.get("checked_at")}

    # 1. A stored non-2xx/3xx final status previously (mis)marked reachable:
    #    the status code alone is sufficient evidence to correct — discard all
    #    old content fields. Covers 404/410 as well as 401/403/429/other-4xx/5xx
    #    (the original pilot code treated ANY HTTP reply as reachable).
    old_outcome = _status_to_outcome(old_status)
    if old_reachable and old_outcome != OUTCOME_SUCCESS:
        classification = {
            "outcome": old_outcome, "reachable": False, "status_code": old_status,
            "final_url": record.get("final_url"), "redirects": record.get("redirects", 0),
            "redirect_chain": record.get("redirect_chain", []), "external_redirect": False,
            "raw_failure_reason": None,
        }
        return _terminal_unscored_record(_skeleton(), classification, lead), False

    # 2. A stored transport failure: map its reason to the precise new outcome.
    if not old_reachable:
        old_reason = (record.get("unreachable_reason") or "").split(":")[-1]
        outcome = _FETCH_FAILURE_MAP.get(old_reason, OUTCOME_CONNECTION_FAILURE)
        classification = {
            "outcome": outcome, "reachable": False, "status_code": None,
            "final_url": None, "redirects": 0, "redirect_chain": [],
            "external_redirect": False, "raw_failure_reason": old_reason,
        }
        return _terminal_unscored_record(_skeleton(), classification, lead), False

    # 3. Genuine old success: re-derive industry relevance from name/domain
    #    (always available) + already-stored automotive-hit booleans (no need
    #    to re-scan body text we never persisted).
    name = (lead.get("business_name") or "").lower()
    dom = (domain or "").lower()
    name_hit = bool([t for t in _WRONG_INDUSTRY_SUBSTRING_TERMS if t in name])
    dom_hit = bool([t for t in _WRONG_INDUSTRY_SUBSTRING_TERMS if t in dom])
    auto_hits = sum(1 for k in _SERVICE_KEYWORDS if record.get(k))

    if name_hit or dom_hit or auto_hits >= 1:
        relevance = assess_industry_relevance(lead, domain, body_text=None, automotive_hit_count=auto_hits)
        new = dict(record)
        new.update(relevance)
        # Old pilot-1 records predate the outcome/reachable model (Part A) —
        # backfill it here so `is_score_eligible` (which requires
        # outcome == OUTCOME_SUCCESS) recognizes genuinely-successful old
        # fetches instead of silently excluding every offline-reevaluated lead.
        new["outcome"] = OUTCOME_SUCCESS
        new["reachable"] = True
        warnings = [w for w in record.get("audit_warnings", [])
                   if not w.startswith(("suspected_wrong_industry", "insufficient_industry_evidence"))]
        if relevance["industry_relevance_status"] == REL_SUSPECTED_WRONG:
            warnings.append("suspected_wrong_industry")
            new["garage_feature_score"] = 0
        elif relevance["industry_relevance_status"] == REL_INSUFFICIENT:
            warnings.append("insufficient_industry_evidence")
        new["audit_warnings"] = warnings
        new["manual_review_required"] = bool(record.get("manual_review_required")) or \
            relevance["industry_relevance_status"] in (REL_SUSPECTED_WRONG, REL_INSUFFICIENT)
        return new, False

    # 4. Ambiguous: success, no name/domain wrong-industry signal, and the old
    #    run recorded zero automotive-service-keyword hits — the page's actual
    #    content was never captured as industry-relevance evidence. Cannot be
    #    resolved offline.
    return record, True


def reevaluate_pilot(source_paths, dest_paths, leads_by_id: dict, refetch_fetcher=None, *,
                     max_concurrency: int = MAX_CONCURRENCY) -> dict:
    """Offline re-evaluation of an EXISTING pilot run (`source_paths`), writing
    to SEPARATE `dest_paths` (never overwrites the original). When
    `refetch_fetcher` is given, performs a TARGETED direct-HTTP refetch (same
    per-lead pipeline, <=4 pages, <=3 concurrency) for exactly the leads whose
    stored evidence was insufficient — never all 50, never a new Brave/Places
    call, never a new audit-scope lead.

    This is THE specifically-supported operation allowed to write to a
    reserved, immutable dest tag (e.g. "audit-pilot1-reeval") — but only as a
    first-time creation or an exact-fingerprint resume; any scope/config drift
    is refused (see `guard_pilot_write`)."""
    stored = load_pilot_results(source_paths)
    scope_entries = _scope_entries_from_results(stored)
    fingerprint = guard_pilot_write(dest_paths, dest_paths.run_tag, scope_entries,
                                    max_concurrency=max_concurrency, resume=True,
                                    allow_reserved=dest_paths.run_tag in RESERVED_IMMUTABLE_TAGS)
    save_fingerprint(dest_paths, fingerprint)

    reevaluated: dict[str, dict] = {}
    needs_refetch: list[str] = []

    for pid, record in stored.items():
        lead = leads_by_id.get(pid, {"place_id": pid, "business_name": record.get("business_name"),
                                     "city": record.get("city")})
        new_record, ambiguous = reevaluate_stored_record_offline(record, lead)
        reevaluated[pid] = new_record
        if ambiguous:
            needs_refetch.append(pid)

    refetched_ids: list[str] = []
    if refetch_fetcher is not None and needs_refetch:
        max_workers = max(1, min(max_concurrency, MAX_CONCURRENCY))
        with ThreadPoolExecutor(max_workers=max_workers) as pool:
            futures = {}
            for pid in needs_refetch:
                lead = leads_by_id[pid]
                website = stored[pid].get("submitted_url")
                source = stored[pid].get("website_source")
                fut = pool.submit(audit_one_pilot_lead, lead, website, source, refetch_fetcher)
                futures[fut] = pid
            for fut in as_completed(futures):
                pid = futures[fut]
                try:
                    reevaluated[pid] = fut.result()
                except Exception as exc:  # noqa: BLE001
                    reevaluated[pid] = {**stored[pid], "final_audit_classification": OUTCOME_INTERNAL_ERROR,
                                       "manual_review_required": True,
                                       "audit_warnings": stored[pid].get("audit_warnings", []) + ["internal_error"]}
                refetched_ids.append(pid)
                save_pilot_results(dest_paths, reevaluated)   # checkpoint per lead
                LOGGER.info("[audit-pilot reeval] targeted refetch %s -> %s",
                            reevaluated[pid].get("business_name"),
                            reevaluated[pid].get("final_audit_classification"))

    save_pilot_results(dest_paths, reevaluated)
    ordered = [reevaluated[pid] for pid in stored]
    report = build_pilot_report(ordered)
    report["reevaluated_offline_count"] = len(stored) - len(refetched_ids)
    report["targeted_refetch_count"] = len(refetched_ids)
    report["targeted_refetch_place_ids"] = refetched_ids
    report["still_needs_refetch"] = [pid for pid in needs_refetch if pid not in refetched_ids]
    storage.write_json_atomic(dest_paths.audit_pilot_report_json, report)
    _write_pilot_csv(dest_paths.audit_pilot_csv, ordered)
    return report


def diff_reeval(old_stored: dict, new_records: dict) -> list[dict]:
    """Old vs new classification for every lead whose classification changed."""
    changes = []
    for pid, new in new_records.items():
        old = old_stored.get(pid, {})
        old_cls = old.get("final_audit_classification")
        new_cls = new.get("final_audit_classification")
        if old_cls != new_cls:
            changes.append({
                "place_id": pid, "business_name": new.get("business_name"),
                "old_classification": old_cls, "new_classification": new_cls,
                "old_garage_score": old.get("garage_feature_score"),
                "new_garage_score": new.get("garage_feature_score"),
                "old_quality_score": old.get("website_quality_score"),
                "new_quality_score": new.get("website_quality_score"),
                "old_industry_relevance": old.get("industry_relevance_status"),
                "new_industry_relevance": new.get("industry_relevance_status"),
            })
    return changes


# ===========================================================================
# Part E — run-tag immutability + scope/config fingerprinting (production
# safety layer)
# ===========================================================================
# Two run tags hold already-approved, finalized results and must never be
# silently overwritten, truncated, or resumed-into with a different scope or
# configuration:
#   * "audit-pilot1"          — the original 50-site pilot.
#   * "audit-pilot1-reeval"   — its corrected re-evaluation.
# `run_pilot()` (a normal pilot/production CREATION command) refuses these
# tags unconditionally. `reevaluate_pilot()` (the one specifically-supported
# re-evaluation operation) may write to a reserved tag ONLY as either a
# genuine first-time creation (no prior results at all) or an EXACT-fingerprint
# resume of an already-finalized run — any drift in scope or configuration is
# refused, never silently applied.

RESERVED_IMMUTABLE_TAGS = frozenset({"audit-pilot1", "audit-pilot1-reeval"})

# Bump these when the outcome classification or industry-relevance logic
# changes in a way that could alter a stored record's meaning — this forces
# any fingerprint comparison to detect the drift instead of silently resuming.
OUTCOME_MODEL_VERSION = "outcome-model-v2"
INDUSTRY_RELEVANCE_MODEL_VERSION = "industry-relevance-v2"


class RunTagImmutableError(RuntimeError):
    """Raised when a command attempts to create or overwrite a reserved,
    already-finalized audit run tag outside its one specifically-supported
    operation."""


class ScopeFingerprintMismatchError(RuntimeError):
    """Raised when resuming an existing audit run whose stored scope/config
    fingerprint does not exactly match what the current command would use —
    refusing to silently truncate, reset, or replace an existing run."""


def _scope_fingerprint_payload(scope_entries: list[dict]) -> list[tuple]:
    return sorted(
        [(e.get("place_id"), e.get("website"), e.get("website_source")) for e in scope_entries],
        key=lambda t: (t[0] or ""))


def compute_scope_sha256(scope_entries: list[dict]) -> str:
    """Hash of sorted (place_id, website, website_source) triples — the exact
    identity of WHICH leads/URLs a run covers, independent of fetch config."""
    blob = json.dumps(_scope_fingerprint_payload(scope_entries), ensure_ascii=True).encode("utf-8")
    return hashlib.sha256(blob).hexdigest()


def compute_config_sha256(max_pages: int, max_concurrency: int, *,
                          outcome_model_version: str = OUTCOME_MODEL_VERSION,
                          industry_relevance_model_version: str = INDUSTRY_RELEVANCE_MODEL_VERSION) -> str:
    """Hash of the audit CONFIGURATION (page/concurrency limits + model
    versions) — independent of which leads are in scope."""
    payload = {
        "max_pages": max_pages, "max_concurrency": max_concurrency,
        "outcome_model_version": outcome_model_version,
        "industry_relevance_model_version": industry_relevance_model_version,
    }
    blob = json.dumps(payload, sort_keys=True, ensure_ascii=True).encode("utf-8")
    return hashlib.sha256(blob).hexdigest()


def build_run_fingerprint(scope_entries: list[dict], run_tag: str, *,
                          max_pages: int = MAX_PAGES_PER_SITE,
                          max_concurrency: int = MAX_CONCURRENCY) -> dict:
    return {
        "run_tag": run_tag,
        "scope_count": len(scope_entries),
        "scope_sha256": compute_scope_sha256(scope_entries),
        "config_sha256": compute_config_sha256(max_pages, max_concurrency),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }


def _fingerprints_match(a: dict, b: dict) -> bool:
    return (a.get("scope_sha256") == b.get("scope_sha256")
            and a.get("config_sha256") == b.get("config_sha256")
            and a.get("scope_count") == b.get("scope_count")
            and a.get("run_tag") == b.get("run_tag"))


def load_fingerprint(paths) -> dict | None:
    return storage.read_json(paths.audit_pilot_fingerprint_json, default=None)


def save_fingerprint(paths, fingerprint: dict) -> None:
    storage.write_json_atomic(paths.audit_pilot_fingerprint_json, fingerprint)


def _scope_entries_from_results(results_by_id: dict) -> list[dict]:
    """Reconstruct scope entries (place_id/website/website_source) from an
    already-stored results file — used to fingerprint a run after the fact,
    e.g. before re-evaluating it or backfilling a pre-fingerprint run."""
    return [{"place_id": r.get("place_id"), "website": r.get("submitted_url"),
             "website_source": r.get("website_source")} for r in results_by_id.values()]


def guard_pilot_write(paths, run_tag: str, scope_entries: list[dict], *,
                      max_pages: int = MAX_PAGES_PER_SITE,
                      max_concurrency: int = MAX_CONCURRENCY,
                      resume: bool = True, allow_reserved: bool = False) -> dict:
    """MUST be called before any write to a pilot/production run's result
    files. Fails CLOSED (raises) rather than silently truncating, resetting,
    or replacing an existing run. Returns the fingerprint that should be
    persisted (the caller is responsible for calling `save_fingerprint`).

    `allow_reserved=True` is set ONLY by `reevaluate_pilot` — the one
    specifically-supported operation permitted to touch a reserved tag, and
    only as a first-time creation or an exact-fingerprint resume."""
    new_fp = build_run_fingerprint(scope_entries, run_tag, max_pages=max_pages,
                                   max_concurrency=max_concurrency)
    existing_fp = load_fingerprint(paths)
    results_exist = Path(paths.audit_pilot_results_json).exists()

    if run_tag in RESERVED_IMMUTABLE_TAGS:
        if not allow_reserved:
            raise RunTagImmutableError(
                f"'{run_tag}' is a reserved, immutable audit run tag. A normal "
                f"audit/production command may never create or write to it.")
        if not results_exist and existing_fp is None:
            # Genuine first-time creation via the supported re-evaluation
            # operation (e.g. in a fresh/isolated output directory).
            return new_fp
        if existing_fp is None:
            raise RunTagImmutableError(
                f"'{run_tag}' already has stored results but no recorded "
                f"fingerprint. Refusing to guess whether writing is safe — "
                f"run the explicit one-time fingerprint backfill first "
                f"(backfill_fingerprint_for_existing_run).")
        if not resume or not _fingerprints_match(existing_fp, new_fp):
            raise ScopeFingerprintMismatchError(
                f"Scope/config fingerprint for reserved tag '{run_tag}' does "
                f"not match its stored, already-finalized fingerprint — "
                f"refusing to modify an approved, immutable audit run.")
        return existing_fp   # exact match: an idempotent resume, nothing changes

    if results_exist:
        if not resume:
            raise RunTagImmutableError(
                f"Audit run '{run_tag}' already has results. Refusing to start "
                f"a fresh run over it — resume it, or choose a new --run-tag.")
        if existing_fp is None or not _fingerprints_match(existing_fp, new_fp):
            raise ScopeFingerprintMismatchError(
                f"Existing run '{run_tag}' has a different scope/config "
                f"fingerprint than requested — refusing to resume blindly. "
                f"Choose a new --run-tag for a genuinely different run.")
        return existing_fp

    return new_fp


def backfill_fingerprint_for_existing_run(paths, *, max_pages: int = MAX_PAGES_PER_SITE,
                                          max_concurrency: int = MAX_CONCURRENCY) -> dict:
    """One-time, explicit bootstrap for a run that already has results but
    predates the fingerprinting feature. Idempotent: if a fingerprint already
    exists it is returned UNCHANGED, never recomputed or overwritten (a
    stored fingerprint is itself immutable once set)."""
    existing = load_fingerprint(paths)
    if existing is not None:
        return existing
    results_by_id = load_pilot_results(paths)
    if not results_by_id:
        raise RunTagImmutableError(
            f"No stored results found for '{paths.run_tag}'; nothing to backfill.")
    scope_entries = _scope_entries_from_results(results_by_id)
    fp = build_run_fingerprint(scope_entries, paths.run_tag, max_pages=max_pages,
                               max_concurrency=max_concurrency)
    save_fingerprint(paths, fp)
    return fp


def build_production_scope(scope_entries: list[dict], excluded_place_ids) -> list[dict]:
    """All `scope_entries` NOT in `excluded_place_ids`, deterministically
    sorted by place_id. Excludes by place_id ONLY — never by list position or
    business name — so the exclusion set can safely come from another run's
    authoritative stored results."""
    excluded = set(excluded_place_ids)
    return sorted([e for e in scope_entries if e.get("place_id") not in excluded],
                  key=lambda e: e.get("place_id") or "")


# ===========================================================================
# Part F — combined latest-audit summary (read-only; no fetches)
# ===========================================================================

def combine_latest_audit_records(*sources: dict) -> dict:
    """Merge several {place_id: record} maps into ONE latest record per
    place_id. `sources` are given in ASCENDING precedence — a later source
    overrides an earlier one for the same place_id. Intended call order:
    combine_latest_audit_records(pilot1_original, pilot1_reeval, production)
    so pilot1 is historical provenance only, reeval supersedes it for the
    original 50, and production supersedes nothing (disjoint place_ids)."""
    latest: dict = {}
    for source in sources:
        for pid, record in (source or {}).items():
            latest[pid] = record
    return latest


def build_combined_audit_summary(audit_ready_count: int, latest_by_id: dict) -> dict:
    """Read-only summary over the combined latest-per-place_id audit records.
    Never fetches anything; purely aggregates what is already stored."""
    records = list(latest_by_id.values())
    base = build_pilot_report(records)
    base["audit_ready_total"] = audit_ready_count
    base["audited_count"] = len(records)
    base["remaining_count"] = max(0, audit_ready_count - len(records))
    base["excluded_from_automatic_garage_outreach_count"] = sum(
        1 for r in records if r.get("excluded_from_automatic_garage_outreach"))
    return base
