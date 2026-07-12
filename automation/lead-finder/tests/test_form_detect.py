"""Regression tests for contact/quotation form detection. No network.

Covers the form types the old auditor missed: standard, Elementor, Contact
Form 7, iframe, JS-rendered marker, plus CTA-to-linked-page and rendered-DOM
fallback.
"""

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from leadfinder.form_detect import detect_form  # noqa: E402


# --- Realistic fixtures ----------------------------------------------------

STANDARD_FORM = """<!doctype html><html><body>
<h1>Contact</h1>
<form action="/verstuur" method="post">
  <input type="text" name="naam"><input type="email" name="email">
  <textarea name="bericht"></textarea>
  <button type="submit">Versturen</button>
</form></body></html>"""

# Elementor form rendered client-side: NO <form> tag in the static HTML,
# only the Elementor widget container + fields.
ELEMENTOR_FORM = """<!doctype html><html><body>
<div class="elementor-widget elementor-widget-form" data-widget_type="form.default">
  <div class="elementor-form-fields-wrapper">
    <div class="elementor-field-group"><input type="text" class="elementor-field"></div>
  </div>
</div></body></html>"""

# Contact Form 7 container without a literal <form> in the captured HTML.
CF7_FORM = """<!doctype html><html><body>
<div role="form" class="wpcf7" id="wpcf7-f572-p23-o1" lang="nl-NL">
  <div class="wpcf7-response-output"></div>
</div>
<link rel="stylesheet" href="/wp-content/plugins/contact-form-7/includes/css/styles.css">
</body></html>"""

# iframe-embedded form (e.g. JotForm).
IFRAME_FORM = """<!doctype html><html><body>
<h2>Offerte</h2>
<iframe title="offerteformulier" src="https://form.jotform.com/2233445566"
        style="width:100%;height:600px"></iframe>
</body></html>"""

# JS-rendered HubSpot form: only a script + placeholder div in static HTML.
JS_HUBSPOT_FORM = """<!doctype html><html><head>
<script src="https://js.hsforms.net/forms/embed/v2.js"></script></head><body>
<div class="hs-form-frame" data-region="eu1" data-form-id="abc-123"></div>
<script>hbspt.forms.create({region:"eu1",portalId:"1",formId:"abc-123"});</script>
</body></html>"""

# No form anywhere on the homepage, but a clear CTA to a /contact page.
HOMEPAGE_NO_FORM = """<!doctype html><html><body>
<h1>Dakdekker</h1>
<a href="/contact">Offerte aanvragen</a>
<a href="/diensten">Diensten</a>
</body></html>"""

# A JS-only homepage whose form appears only after rendering.
HOMEPAGE_JS_ONLY = """<!doctype html><html><body><div id="app"></div></body></html>"""
RENDERED_DOM = """<div id="app"><form><input type="email"><button>Verzenden</button></form></div>"""

NO_FORM_AT_ALL = """<!doctype html><html><body>
<h1>Welkom</h1><p>Bel ons op 010 1234567.</p></body></html>"""


class _MockFetcher:
    """Returns a mapping of url -> html as fetch results."""
    def __init__(self, pages):
        self.pages = pages
        self.calls = []

    def fetch(self, url):
        self.calls.append(url)
        html = self.pages.get(url)
        if html is None:
            return {"ok": False, "reason": "not_found"}
        return {"ok": True, "html": html}


class TestFormDetection(unittest.TestCase):
    def test_standard_form(self):
        r = detect_form(STANDARD_FORM, base_url="https://a.nl/")
        self.assertTrue(r["found"])
        self.assertEqual(r["detection_method"], "html_form")

    def test_elementor_form_without_form_tag(self):
        r = detect_form(ELEMENTOR_FORM, base_url="https://a.nl/")
        self.assertTrue(r["found"])
        self.assertEqual(r["detection_method"], "elementor")
        self.assertIn("elementor", r["matched_text"].lower())

    def test_contact_form_7(self):
        r = detect_form(CF7_FORM, base_url="https://a.nl/")
        self.assertTrue(r["found"])
        self.assertEqual(r["detection_method"], "contact_form_7")

    def test_iframe_form(self):
        r = detect_form(IFRAME_FORM, base_url="https://a.nl/")
        self.assertTrue(r["found"])
        self.assertIn(r["detection_method"], ("iframe_form", "jotform"))

    def test_js_rendered_hubspot_marker(self):
        r = detect_form(JS_HUBSPOT_FORM, base_url="https://a.nl/")
        self.assertTrue(r["found"])
        self.assertEqual(r["detection_method"], "hubspot")

    def test_cta_leads_to_linked_form_page(self):
        fetcher = _MockFetcher({"https://a.nl/contact": STANDARD_FORM})
        r = detect_form(HOMEPAGE_NO_FORM, base_url="https://a.nl/", fetcher=fetcher)
        self.assertTrue(r["found"])
        self.assertTrue(r["detection_method"].endswith("_on_linked_page"))
        self.assertEqual(r["form_page_url"], "https://a.nl/contact")
        self.assertIn("https://a.nl/contact", fetcher.calls)

    def test_rendered_dom_fallback(self):
        r = detect_form(HOMEPAGE_JS_ONLY, base_url="https://a.nl/",
                        rendered_html_provider=lambda url: RENDERED_DOM)
        self.assertTrue(r["found"])
        self.assertTrue(r["detection_method"].endswith("_rendered"))

    def test_no_form_is_not_detected(self):
        r = detect_form(NO_FORM_AT_ALL, base_url="https://a.nl/")
        self.assertFalse(r["found"])
        self.assertIsNone(r["detection_method"])

    def test_submit_button_dutch_text(self):
        html = ('<div class="cta"><input type="text" name="x">'
                '<button>Offerte aanvragen</button></div>')
        r = detect_form(html, base_url="https://a.nl/")
        self.assertTrue(r["found"])
        self.assertEqual(r["detection_method"], "submit_button")

    def test_evidence_fields_present(self):
        r = detect_form(STANDARD_FORM, base_url="https://a.nl/")
        for key in ("detection_method", "matched_selector", "matched_text", "form_page_url"):
            self.assertIn(key, r)


if __name__ == "__main__":
    unittest.main()
