"""Website audit — turns a lead's website into a structured findings dict.

Design:
  * A `fetcher` abstraction returns a normalized "fetch result" for a URL. The
    real fetcher uses `requests`; the mock fetcher returns canned pages so the
    whole pipeline runs offline. This keeps concurrency-low, polite behaviour and
    makes the audit fully testable without the network.
  * Only lightweight, public homepage checks are done (plus a couple of linked
    pages). We respect the Scraping Policy: identifiable UA, timeouts, low rate.

The audit does NOT judge — it records facts. `scoring.py` turns facts into a
score.
"""

from __future__ import annotations

import re
from datetime import datetime, timezone

from .logging_setup import get_logger
from .normalize import normalize_domain
from .form_detect import detect_form
from .copyright_detect import detect_copyright
from . import mockdata

LOGGER = get_logger()

USER_AGENT = "Coders01LeadFinder/1.0 (+website-opportunity-audit)"

_VIEWPORT_RE = re.compile(r'<meta[^>]+name=["\']viewport["\']', re.I)
_TITLE_RE = re.compile(r"<title[^>]*>(.*?)</title>", re.I | re.S)
_DESC_RE = re.compile(r'<meta[^>]+name=["\']description["\'][^>]+content=["\'](.*?)["\']', re.I)
_PHONE_RE = re.compile(r'(tel:|\b0\d[\d\s\-]{7,}\d)', re.I)
_EMAIL_RE = re.compile(r'mailto:|[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}')
_CTA_RE = re.compile(r"(offerte|contact|afspraak|inspectie|bel\s|quote|request)", re.I)
_WA_RE = re.compile(r"(wa\.me/|api\.whatsapp\.com|whatsapp)", re.I)
_SERVICE_LINK_RE = re.compile(r'href=["\'][^"\']*(diensten|services|producten|aanbod)[^"\']*["\']', re.I)


# ---------------------------------------------------------------------------
# Fetchers
# ---------------------------------------------------------------------------

class MockFetcher:
    """Returns canned pages keyed by domain (see mockdata.MOCK_SITES)."""

    def fetch(self, url: str) -> dict:
        domain = normalize_domain(url)
        site = mockdata.mock_fetch_site(domain or "")
        if site.get("kind") != "ok":
            return {"ok": False, "reason": site.get("reason", "unreachable")}
        return {
            "ok": True,
            "https": site["https"],
            "status_code": site["status_code"],
            "response_time": site["response_time"],
            "html": site["html"],
            "final_url": ("https://" if site["https"] else "http://") + (domain or ""),
            "redirects": 0,
            "broken_links": site.get("broken_links", 0),
            "broken_images": site.get("broken_images", 0),
        }


class RealFetcher:
    """Fetches a live site politely (single request, identifiable UA, timeout)."""

    def __init__(self, timeout: float = 15.0):
        import requests
        self._requests = requests
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": USER_AGENT})

    def fetch(self, url: str) -> dict:
        import time
        if "//" not in url:
            url = "https://" + url
        start = time.time()
        try:
            resp = self.session.get(url, timeout=self.timeout, allow_redirects=True)
        except self._requests.exceptions.SSLError:
            return {"ok": False, "reason": "ssl_error"}
        except self._requests.exceptions.Timeout:
            return {"ok": False, "reason": "timeout"}
        except self._requests.exceptions.ConnectionError as exc:
            reason = "dns_failure" if "NameResolution" in str(exc) else "connection_refused"
            return {"ok": False, "reason": reason}
        except self._requests.RequestException as exc:
            return {"ok": False, "reason": str(exc)}
        elapsed = time.time() - start
        return {
            "ok": True,
            "https": resp.url.lower().startswith("https://"),
            "status_code": resp.status_code,
            "response_time": elapsed,
            "html": resp.text,
            "final_url": resp.url,
            "redirects": len(resp.history),
            # Deep link/image checking is left to a follow-up pass to stay polite;
            # counted as 0 here unless a richer crawl is enabled.
            "broken_links": 0,
            "broken_images": 0,
        }


# ---------------------------------------------------------------------------
# Audit
# ---------------------------------------------------------------------------

def audit_lead(lead: dict, fetcher, current_year: int | None = None,
               rendered_html_provider=None) -> dict:
    """Return a structured audit dict for one lead's website.

    `rendered_html_provider(url) -> html` is an optional callback (e.g. backed by
    Playwright) used only as a last-resort fallback for JS-rendered forms.
    """
    if current_year is None:
        current_year = datetime.now(timezone.utc).year

    website = lead.get("website")
    audit = {
        "place_id": lead.get("place_id"),
        "business_name": lead.get("business_name"),
        "website": website,
        "has_website": bool(website),
        "checked_at": datetime.now(timezone.utc).isoformat(),
    }

    if not website:
        audit["reachable"] = False
        return audit

    result = fetcher.fetch(website)
    if not result.get("ok"):
        audit["reachable"] = False
        audit["unreachable_reason"] = result.get("reason")
        audit["server_error"] = result.get("reason") == "server_error"
        return audit

    html = result.get("html", "")
    status = result.get("status_code")
    final_url = result.get("final_url") or website

    # Robust contact/quotation form detection (embedded/JS/iframe/plugin forms,
    # and forms on a linked contact/offerte page). Records evidence.
    form = detect_form(html, base_url=final_url, fetcher=fetcher,
                       rendered_html_provider=rendered_html_provider)

    # Copyright year: take the MOST RECENT year in the copyright statement.
    cr = detect_copyright(html, current_year=current_year)

    audit.update({
        "reachable": True,
        "https": result.get("https"),
        "status_code": status,
        "server_error": bool(status and 500 <= status < 600),
        "response_time": result.get("response_time"),
        "final_url": final_url,
        "redirects": result.get("redirects", 0),
        "mobile_viewport": bool(_VIEWPORT_RE.search(html)),
        "title": _first(_TITLE_RE.search(html)),
        "meta_description": _first(_DESC_RE.search(html)),
        "has_visible_phone": bool(_PHONE_RE.search(html)),
        "has_visible_email": bool(_EMAIL_RE.search(html)),
        "has_contact_form": form["found"],
        "form_detection": form,
        "has_cta": bool(_CTA_RE.search(html)),
        "has_whatsapp": bool(_WA_RE.search(html)),
        "has_service_pages": bool(_SERVICE_LINK_RE.search(html)),
        "broken_links": result.get("broken_links", 0),
        "broken_images": result.get("broken_images", 0),
        # copyright_year holds the EFFECTIVE (most recent) year, so scoring's
        # `cy < current_year - 1` rule works correctly for ranges.
        "copyright_year": cr["effective_copyright_year"],
        "copyright_text": cr["copyright_text"],
        "copyright_years_found": cr["copyright_years_found"],
        "effective_copyright_year": cr["effective_copyright_year"],
        "outdated_copyright": cr["outdated_copyright"],
        "screenshot_desktop": None,
        "screenshot_mobile": None,
    })
    return audit


def _first(match):
    if not match:
        return None
    return (match.group(1) if match.groups() else match.group(0)).strip() or None
