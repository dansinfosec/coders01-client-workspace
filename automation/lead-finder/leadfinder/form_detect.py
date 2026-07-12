"""Contact / quotation form detection with evidence.

The old audit only matched a literal ``<form>`` tag in the server-rendered
homepage HTML. That misses:
  * embedded/JS-rendered forms (HubSpot, Typeform, JotForm) that ship only a
    ``<script>`` + placeholder ``<div>`` in the initial HTML;
  * plugin forms rendered client-side (Elementor / CF7 / WPForms / Gravity /
    Ninja / Formidable) whose ``<form>`` is injected after load;
  * iframe-embedded forms;
  * forms that live on a linked ``/contact`` or ``/offerte`` page, not the home.

`detect_form()` recognises all of the above from the static HTML (most JS forms
leave a detectable marker), optionally follows a contact/quote CTA to a linked
page, and — if a rendered-DOM provider is supplied (Playwright) — inspects the
rendered DOM as a last resort. It returns rich evidence so decisions are
auditable.
"""

from __future__ import annotations

import re
from urllib.parse import urljoin, urlparse

# --- Marker table: (method, selector_label, compiled regex) ----------------
# Ordered from most to least reliable; first hit wins.
_MARKERS = [
    ("html_form", "<form>", re.compile(r"<form\b", re.I)),
    ("elementor", ".elementor-form / .elementor-widget-form",
     re.compile(r'class=["\'][^"\']*elementor-(?:form|widget-form|field)', re.I)),
    ("contact_form_7", ".wpcf7",
     re.compile(r'(?:class=["\'][^"\']*wpcf7|id=["\']wpcf7|/wp-content/plugins/contact-form-7)', re.I)),
    ("wpforms", ".wpforms-container",
     re.compile(r'(?:wpforms-(?:container|form|field)|/wp-content/plugins/wpforms)', re.I)),
    ("gravity_forms", ".gform_wrapper",
     re.compile(r'(?:gform_(?:wrapper|body|fields|form)|gravityform|/gravityforms/)', re.I)),
    ("ninja_forms", ".nf-form",
     re.compile(r'(?:ninja[-_]forms|nf-form-|nf-field|/wp-content/plugins/ninja-forms)', re.I)),
    ("formidable", ".frm_forms",
     re.compile(r'(?:frm_forms|frm_form_field|formidable)', re.I)),
    ("hubspot", ".hs-form / hsforms.net",
     re.compile(r'(?:hbspt\.forms|hs-form-frame|hsforms\.net|js\.hsforms\.net|class=["\'][^"\']*hs-form)', re.I)),
    ("typeform", "typeform embed",
     re.compile(r'(?:typeform\.com|data-tf-widget|class=["\'][^"\']*typeform)', re.I)),
    ("jotform", "jotform embed",
     re.compile(r'(?:jotform\.com|jotform\.co|id=["\']JotFormIFrame)', re.I)),
]

_IFRAME_FORM_RE = re.compile(
    r'<iframe[^>]+src=["\'][^"\']*'
    r'(?:form|forms|typeform|jotform|hsforms|docs\.google\.com/forms|formstack|wufoo)'
    r'[^"\']*["\']', re.I)

# A real input field (text/email/tel/textarea) — not a search/hidden box.
_INPUT_FIELD_RE = re.compile(
    r'<textarea\b|<input[^>]+type=["\'](?:text|email|tel)["\']', re.I)

# Submit-style buttons commonly used on Dutch contact/quote forms.
_SUBMIT_BUTTON_RE = re.compile(
    r'(?:<button[^>]*>|<input[^>]+type=["\']submit["\'][^>]*value=["\'])\s*'
    r'[^<"\']*?'
    r'(versturen|verzenden|verstuur|aanvragen|offerte\s*aanvragen|'
    r'neem\s*contact\s*op|contact\s*opnemen|plan\s*inspectie|'
    r'inspectie\s*aanvragen|bericht\s*versturen|vraag.*offerte)',
    re.I)

# Links (href or anchor text) that likely lead to a form page.
_CONTACT_LINK_RE = re.compile(
    r'<a[^>]+href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', re.I | re.S)
_CONTACT_HINT_RE = re.compile(
    r'(contact|offerte|aanvraag|aanvragen|quote|inspectie|afspraak)', re.I)


def _snippet(match, span=70) -> str:
    text = match.group(0)
    return re.sub(r"\s+", " ", text)[:span].strip()


def _scan_html(html: str, page_url):
    """Scan one page's HTML for a form marker. Returns evidence dict or None."""
    if not html:
        return None

    for method, selector, rx in _MARKERS:
        m = rx.search(html)
        if m:
            return {"detection_method": method, "matched_selector": selector,
                    "matched_text": _snippet(m), "form_page_url": page_url}

    m = _IFRAME_FORM_RE.search(html)
    if m:
        return {"detection_method": "iframe_form", "matched_selector": "<iframe src=…form…>",
                "matched_text": _snippet(m), "form_page_url": page_url}

    m = _SUBMIT_BUTTON_RE.search(html)
    if m and _INPUT_FIELD_RE.search(html):
        return {"detection_method": "submit_button", "matched_selector": "submit button + input",
                "matched_text": _snippet(m), "form_page_url": page_url}

    # Visible input fields present even without a <form> tag (client-rendered),
    # combined with a submit-like control anywhere on the page.
    if _INPUT_FIELD_RE.search(html) and _SUBMIT_BUTTON_RE.search(html):
        return {"detection_method": "input_fields", "matched_selector": "input/textarea + submit",
                "matched_text": _snippet(_INPUT_FIELD_RE.search(html)), "form_page_url": page_url}

    return None


def _find_contact_links(html: str, base_url: str, limit: int = 2):
    """Return up to `limit` absolute URLs of likely contact/quote pages."""
    if not html or not base_url:
        return []
    base_host = (urlparse(base_url).hostname or "").lower()
    found, seen = [], set()
    for m in _CONTACT_LINK_RE.finditer(html):
        href, text = m.group(1).strip(), re.sub(r"<[^>]+>", "", m.group(2))
        if href.startswith(("#", "mailto:", "tel:", "javascript:")):
            continue
        if not (_CONTACT_HINT_RE.search(href) or _CONTACT_HINT_RE.search(text)):
            continue
        absolute = urljoin(base_url, href)
        host = (urlparse(absolute).hostname or "").lower()
        if host and base_host and host != base_host:
            continue  # stay on-site
        if absolute not in seen:
            seen.add(absolute)
            found.append(absolute)
        if len(found) >= limit:
            break
    return found


def detect_form(html, base_url=None, fetcher=None, allow_link_follow=True,
                rendered_html_provider=None):
    """Detect a contact/quotation form and return evidence.

    Returns a dict:
      found (bool), detection_method, matched_selector, matched_text,
      form_page_url (the URL where the form was found — homepage or a linked page).

    Strategy: scan homepage HTML → follow a contact/quote CTA (one page) →
    inspect the rendered DOM if a provider is given. `fetcher` is any object with
    a `.fetch(url) -> {"ok":bool, "html":str}` method (Real/Mock fetcher).
    """
    result = {"found": False, "detection_method": None, "matched_selector": None,
              "matched_text": None, "form_page_url": None}

    ev = _scan_html(html, base_url)
    if ev:
        return {"found": True, **ev}

    # Follow a contact/quotation CTA to a linked page (one hop).
    if allow_link_follow and fetcher is not None and base_url:
        for link in _find_contact_links(html, base_url):
            try:
                fetched = fetcher.fetch(link)
            except Exception:  # noqa: BLE001 - never fail the audit on a bad link
                continue
            if fetched and fetched.get("ok"):
                ev = _scan_html(fetched.get("html", ""), link)
                if ev:
                    ev["detection_method"] += "_on_linked_page"
                    return {"found": True, **ev}

    # Rendered-DOM fallback (Playwright), if a provider is supplied.
    if rendered_html_provider is not None and base_url:
        try:
            rendered = rendered_html_provider(base_url)
        except Exception:  # noqa: BLE001
            rendered = None
        if rendered:
            ev = _scan_html(rendered, base_url)
            if ev:
                ev["detection_method"] += "_rendered"
                return {"found": True, **ev}

    return result
