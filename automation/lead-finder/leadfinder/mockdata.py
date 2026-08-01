"""Synthetic Google Places responses + mock websites for development.

Nothing here touches the network. The mock transport returns Places-API-shaped
payloads; the mock website fetcher returns canned HTML/errors so the audit and
scoring pipeline can be demonstrated end-to-end without any real requests.

All businesses, domains and phone numbers below are FICTIONAL.
"""

from __future__ import annotations

# --- Places Text Search fixtures (paginated) -------------------------------
# Two pages, linked by nextPageToken, so pagination can be exercised.

def _components(city: str) -> list:
    """Minimal Places `addressComponents` carrying the locality."""
    return [{"longText": city, "shortText": city, "types": ["locality", "political"]}]


# Text Search now returns the FULL lead payload (phone, website, rating, …), so
# these fixtures mirror the production field mask — no Place Details needed.
_TEXTSEARCH_PAGE_1 = {
    "places": [
        {
            "id": "mock_place_001",
            "displayName": {"text": "Dakdekkersbedrijf De Nok"},
            "formattedAddress": "Nokstraat 1, 3511 AA Utrecht",
            "addressComponents": _components("Utrecht"),
            "nationalPhoneNumber": "030 123 4567",
            # No website => strongest possible opportunity.
            "rating": 4.6,
            "userRatingCount": 24,
            "primaryType": "roofing_contractor",
            "types": ["roofing_contractor", "point_of_interest"],
            "businessStatus": "OPERATIONAL",
        },
        {
            "id": "mock_place_002",
            "displayName": {"text": "Utrecht Dak & Zink"},
            "formattedAddress": "Zinklaan 22, 3512 BB Utrecht",
            "addressComponents": _components("Utrecht"),
            "nationalPhoneNumber": "030 222 2222",
            "websiteUri": "http://utrechtdakzink.nl",   # no HTTPS + old site
            "rating": 4.1,
            "userRatingCount": 8,
            "primaryType": "roofing_contractor",
            "types": ["roofing_contractor"],
            "businessStatus": "OPERATIONAL",
        },
        {
            "id": "mock_place_003",
            "displayName": {"text": "Van Dijk Dakwerken"},
            "formattedAddress": "Pannenweg 8, 3513 CC Utrecht",
            "addressComponents": _components("Utrecht"),
            "nationalPhoneNumber": "030 333 3333",
            "websiteUri": "https://vandijkdakwerken.nl",  # modern, healthy site
            "rating": 4.9,
            "userRatingCount": 63,
            "primaryType": "roofing_contractor",
            "types": ["roofing_contractor"],
            "businessStatus": "OPERATIONAL",
        },
    ],
    "nextPageToken": "MOCK_TOKEN_PAGE2",
}

_TEXTSEARCH_PAGE_2 = {
    "places": [
        {
            "id": "mock_place_004",
            "displayName": {"text": "Stad & Dak Utrecht"},
            "formattedAddress": "Leidijk 5, 3514 DD Utrecht",
            "addressComponents": _components("Utrecht"),
            "nationalPhoneNumber": "030 444 4444",
            "websiteUri": "https://stadendak.nl",   # unreachable in the mock fetcher
            "rating": 3.8,
            "userRatingCount": 5,
            "primaryType": "roofing_contractor",
            "types": ["roofing_contractor"],
            "businessStatus": "OPERATIONAL",
        },
        {
            # Duplicate of place_002 by domain — exercises de-duplication.
            "id": "mock_place_005",
            "displayName": {"text": "Utrecht Dak en Zink (2e vestiging)"},
            "formattedAddress": "Zinklaan 90, 3512 BZ Utrecht",
            "addressComponents": _components("Utrecht"),
            "nationalPhoneNumber": "030 222 2222",
            "websiteUri": "https://www.utrechtdakzink.nl/contact",  # same domain as 002
            "primaryType": "roofing_contractor",
            "types": ["roofing_contractor"],
            "businessStatus": "OPERATIONAL",
        },
    ],
}

# A single page of 20 distinct results — used to prove that N Text Search results
# do NOT trigger N Place Details requests.
_TEXTSEARCH_BULK_20 = {
    "places": [
        {
            "id": f"bulk_place_{i:03d}",
            "displayName": {"text": f"Autogarage Bulk {i:03d}"},
            "formattedAddress": f"Sleutelweg {i}, 1011 AA Amsterdam",
            "addressComponents": _components("Amsterdam"),
            "nationalPhoneNumber": f"020 555 {1000 + i}",
            "websiteUri": f"https://bulkgarage{i:03d}.nl",
            "rating": 4.0,
            "userRatingCount": 10 + i,
            "primaryType": "car_repair",
            "types": ["car_repair", "point_of_interest"],
            "businessStatus": "OPERATIONAL",
        }
        for i in range(1, 21)
    ],
}

# Mixed operational/closed results — exercises the closed-business filter.
_TEXTSEARCH_CLOSED_MIX = {
    "places": [
        {
            "id": "open_place_1",
            "displayName": {"text": "Garage Open"},
            "formattedAddress": "Startweg 1, 1011 AA Amsterdam",
            "addressComponents": _components("Amsterdam"),
            "nationalPhoneNumber": "020 111 1111",
            "businessStatus": "OPERATIONAL",
        },
        {
            "id": "closed_place_1",
            "displayName": {"text": "Garage Permanent Dicht"},
            "formattedAddress": "Slotweg 2, 1011 AB Amsterdam",
            "addressComponents": _components("Amsterdam"),
            "nationalPhoneNumber": "020 222 2222",
            "businessStatus": "CLOSED_PERMANENTLY",
        },
        {
            "id": "closed_place_2",
            "displayName": {"text": "Garage Tijdelijk Dicht"},
            "formattedAddress": "Pauzeweg 3, 1011 AC Amsterdam",
            "addressComponents": _components("Amsterdam"),
            "nationalPhoneNumber": "020 333 3333",
            "businessStatus": "CLOSED_TEMPORARILY",
        },
    ],
}

# --- Place Details fixtures, keyed by place id -----------------------------

_DETAILS = {
    "mock_place_001": {
        "id": "mock_place_001",
        "displayName": {"text": "Dakdekkersbedrijf De Nok"},
        "formattedAddress": "Nokstraat 1, 3511 AA Utrecht",
        "nationalPhoneNumber": "030 123 4567",
        "internationalPhoneNumber": "+31 30 123 4567",
        # No website => strongest possible opportunity.
        "googleMapsUri": "https://maps.google.com/?cid=1001",
        "businessStatus": "OPERATIONAL",
        "primaryType": "roofing_contractor",
    },
    "mock_place_002": {
        "id": "mock_place_002",
        "displayName": {"text": "Utrecht Dak & Zink"},
        "formattedAddress": "Zinklaan 22, 3512 BB Utrecht",
        "nationalPhoneNumber": "030 222 2222",
        "internationalPhoneNumber": "+31 30 222 2222",
        "websiteUri": "http://utrechtdakzink.nl",  # no HTTPS + old site
        "googleMapsUri": "https://maps.google.com/?cid=1002",
        "businessStatus": "OPERATIONAL",
        "primaryType": "roofing_contractor",
    },
    "mock_place_003": {
        "id": "mock_place_003",
        "displayName": {"text": "Van Dijk Dakwerken"},
        "formattedAddress": "Pannenweg 8, 3513 CC Utrecht",
        "nationalPhoneNumber": "030 333 3333",
        "internationalPhoneNumber": "+31 30 333 3333",
        "websiteUri": "https://vandijkdakwerken.nl",  # modern, healthy site
        "googleMapsUri": "https://maps.google.com/?cid=1003",
        "businessStatus": "OPERATIONAL",
        "primaryType": "roofing_contractor",
    },
    "mock_place_004": {
        "id": "mock_place_004",
        "displayName": {"text": "Stad & Dak Utrecht"},
        "formattedAddress": "Leidijk 5, 3514 DD Utrecht",
        "nationalPhoneNumber": "030 444 4444",
        "internationalPhoneNumber": "+31 30 444 4444",
        "websiteUri": "https://stadendak.nl",  # unreachable in the mock fetcher
        "googleMapsUri": "https://maps.google.com/?cid=1004",
        "businessStatus": "OPERATIONAL",
        "primaryType": "roofing_contractor",
    },
    "mock_place_005": {
        "id": "mock_place_005",
        "displayName": {"text": "Utrecht Dak en Zink (2e vestiging)"},
        "formattedAddress": "Zinklaan 90, 3512 BZ Utrecht",
        "nationalPhoneNumber": "030 222 2222",
        "internationalPhoneNumber": "+31 30 222 2222",
        "websiteUri": "https://www.utrechtdakzink.nl/contact",  # same domain as 002
        "googleMapsUri": "https://maps.google.com/?cid=1005",
        "businessStatus": "OPERATIONAL",
        "primaryType": "roofing_contractor",
    },
}


DATASETS = {
    "default": None,        # paginated 3 + 2 fixture (see mock_textsearch)
    "bulk20": _TEXTSEARCH_BULK_20,
    "closed_mix": _TEXTSEARCH_CLOSED_MIX,
}


def mock_textsearch(page_token: str | None, dataset: str = "default"):
    """Return the mock Text Search payload for the given page token/dataset."""
    if dataset and dataset != "default":
        return DATASETS.get(dataset) or {"places": []}
    if page_token == "MOCK_TOKEN_PAGE2":
        return _TEXTSEARCH_PAGE_2
    return _TEXTSEARCH_PAGE_1


def mock_place_details(place_id: str):
    return _DETAILS.get(place_id, {"id": place_id})


# --- Mock websites for the audit demo --------------------------------------
# Maps a normalized domain to a canned "fetch result" the audit understands.

_HEALTHY_HTML = """<!doctype html><html lang="nl"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Van Dijk Dakwerken — Dakdekker Utrecht</title>
<meta name="description" content="Uw dakdekker in Utrecht voor reparatie en renovatie.">
</head><body>
<a href="tel:+31303333333">030 333 3333</a>
<a href="mailto:info@vandijkdakwerken.nl">info@vandijkdakwerken.nl</a>
<a class="cta" href="/offerte">Offerte aanvragen</a>
<form action="/contact"><input name="naam"></form>
<a href="/diensten">Diensten</a>
<img src="/img/dak.jpg" alt="dak">
<footer>© 2025 Van Dijk Dakwerken</footer>
</body></html>"""

_OLD_HTML = """<!doctype html><html><head>
<title>Utrecht Dak en Zink</title>
</head><body>
Bel ons: 030 222 2222
<img src="/broken.jpg">
<a href="/kapot">dode link</a>
<footer>Copyright 2016 Utrecht Dak en Zink</footer>
</body></html>"""

# --- Garage (autogarage) audit fixtures -------------------------------------
# One basic-contact-form garage and one fully advanced garage (real booking
# calendar + kenteken/RDW lookup), so the full audit_lead(garage_features=True)
# pipeline can be exercised end-to-end without any network access.

_GARAGE_BASIC_HTML = """<!doctype html><html lang="nl"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Garage Klaassen — Autogarage in Deventer</title>
<meta name="description" content="Uw garage voor onderhoud en reparatie in Deventer.">
</head><body>
<a href="tel:+31570123456">0570 123456</a>
<a href="mailto:info@garageklaassen.nl">info@garageklaassen.nl</a>
<h1>Garage Klaassen</h1>
<form action="/contact">
  <input type="text" name="naam" placeholder="Naam">
  <input type="email" name="email" placeholder="E-mail">
  <textarea name="bericht" placeholder="Uw bericht"></textarea>
  <button type="submit">Versturen</button>
</form>
<footer>© 2025 Garage Klaassen</footer>
</body></html>"""

_GARAGE_ADVANCED_HTML = """<!doctype html><html lang="nl"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Moderne Garage — APK, onderhoud en reparatie</title>
<meta name="description" content="Boek direct online uw afspraak, inclusief kentekencheck.">
</head><body>
<a href="tel:+31201234567">020 1234567</a>
<a href="mailto:info@modernegarage.nl">info@modernegarage.nl</a>
<h1>Plan uw afspraak</h1>
<form action="/boeken">
  <input type="text" id="kenteken" name="kenteken" placeholder="Kenteken">
  <button type="button" onclick="checkKenteken()">Zoek voertuig</button>
  <div id="voertuig-resultaat">
    <p>Merk: Volkswagen</p>
    <p>Model: Golf</p>
    <p>Brandstof: Benzine</p>
  </div>
  <select name="dienst">
    <option value="">Kies uw dienst</option>
    <option value="apk">APK keuring</option>
    <option value="onderhoud">Onderhoud</option>
  </select>
  <input type="date" name="datum">
  <div class="beschikbare-tijden">
    <button type="button">09:00</button>
    <button type="button">10:30</button>
  </div>
  <button type="submit">Bevestig afspraak</button>
</form>
<script>function checkKenteken(){ fetch('/api/kenteken?plate=1'); }</script>
<footer>© 2026 Moderne Garage</footer>
</body></html>"""

MOCK_SITES = {
    # domain -> dict describing what the mock fetcher should return
    "vandijkdakwerken.nl": {
        "kind": "ok",
        "https": True,
        "status_code": 200,
        "response_time": 0.4,
        "html": _HEALTHY_HTML,
        "broken_links": 0,
        "broken_images": 0,
    },
    "utrechtdakzink.nl": {
        "kind": "ok",
        "https": False,  # served over http:// only
        "status_code": 200,
        "response_time": 6.2,  # slow
        "html": _OLD_HTML,
        "broken_links": 1,
        "broken_images": 1,
    },
    "stadendak.nl": {
        "kind": "unreachable",
        "reason": "connection_refused",
    },
    "garageklaassen.nl": {
        "kind": "ok",
        "https": True,
        "status_code": 200,
        "response_time": 0.3,
        "html": _GARAGE_BASIC_HTML,
        "broken_links": 0,
        "broken_images": 0,
    },
    "modernegarage.nl": {
        "kind": "ok",
        "https": True,
        "status_code": 200,
        "response_time": 0.3,
        "html": _GARAGE_ADVANCED_HTML,
        "broken_links": 0,
        "broken_images": 0,
    },
}


def mock_fetch_site(domain: str):
    """Return a canned fetch descriptor for a domain, or a generic 'no data'."""
    return MOCK_SITES.get(domain, {"kind": "unreachable", "reason": "dns_failure"})


# --- Website-discovery fixtures --------------------------------------------
# Synthetic search results + candidate sites so the whole discovery pipeline
# (search -> domain filter -> fetch -> verify -> classify) runs offline. All
# businesses, domains and numbers are FICTIONAL.

def _ok_site(html: str) -> dict:
    return {"kind": "ok", "https": True, "status_code": 200,
            "response_time": 0.2, "html": html, "broken_links": 0, "broken_images": 0}


_DISCO_VERIFIED_HTML = """<!doctype html><html lang="nl"><head>
<meta charset="utf-8"><title>Autobedrijf Verified — Onderhoud en APK in Amsterdam</title>
</head><body>
<h1>Autobedrijf Verified Amsterdam</h1>
<p>Welkom bij Autobedrijf Verified aan de Testweg 1, 1011 AA Amsterdam.
Al meer dan 20 jaar uw vertrouwde garage voor onderhoud, reparatie en APK.</p>
<a href="tel:+31201112222">020 111 2222</a>
<a href="mailto:info@garageverified.nl">info@garageverified.nl</a>
<footer>© 2026 Autobedrijf Verified, Testweg 1, 1011 AA Amsterdam</footer>
</body></html>"""

_DISCO_MEDIUM_HTML = """<!doctype html><html lang="nl"><head>
<meta charset="utf-8"><title>Garage Medium Uniek — uw garage in Rotterdam</title>
</head><body>
<h1>Garage Medium Uniek</h1>
<p>Garage Medium Uniek is gevestigd in Rotterdam en verzorgt onderhoud en
reparatie van alle merken. Kom langs bij onze vestiging in Rotterdam voor een
vrijblijvende afspraak. Wij helpen u graag verder met uw auto.</p>
<a href="mailto:info@garagemedium.nl">info@garagemedium.nl</a>
<footer>© 2026 Garage Medium Uniek — Rotterdam</footer>
</body></html>"""

_DISCO_CONFLICT_HTML = """<!doctype html><html lang="nl"><head>
<meta charset="utf-8"><title>Garage Van Elders — Autobedrijf in Almere</title>
</head><body>
<h1>Garage Van Elders</h1>
<p>Uw autobedrijf in Almere voor onderhoud, reparatie en APK. Gevestigd aan de
Marktweg 5, 1311 AA Almere. Bel ons gerust voor een afspraak of vrijblijvend advies.</p>
<a href="tel:+31365551234">036 555 1234</a>
<footer>© 2026 Garage Van Elders, Marktweg 5, 1311 AA Almere</footer>
</body></html>"""

# Candidate whose only differing signal is the phone (Google mobile vs site
# landline) — must stay NEUTRAL and reach MEDIUM via name + city.
_DISCO_MOBILE_LANDLINE_HTML = """<!doctype html><html lang="nl"><head>
<meta charset="utf-8"><title>Garage Mobiel — Autobedrijf in Haarlem</title>
</head><body>
<h1>Garage Mobiel</h1>
<p>Garage Mobiel is uw vertrouwde autobedrijf in Haarlem voor onderhoud,
reparatie en APK. Kom langs bij onze vestiging in Haarlem voor een afspraak.</p>
<a href="tel:+31235551000">023 555 1000</a>
<footer>© 2026 Garage Mobiel — Haarlem</footer>
</body></html>"""

# Candidate showing MULTIPLE numbers incl. the lead's mobile — any match counts.
_DISCO_MULTINUMBER_HTML = """<!doctype html><html lang="nl"><head>
<meta charset="utf-8"><title>Garage Multi — Autobedrijf in Haarlem</title>
</head><body>
<h1>Garage Multi</h1>
<p>Bel onze werkplaats of de mobiele storingsdienst. Autobedrijf Multi in Haarlem
voor onderhoud, reparatie en APK.</p>
<a href="tel:+31235559000">023 555 9000</a>
<a href="tel:+31612345678">06 12 34 56 78</a>
<footer>© 2026 Garage Multi — Haarlem</footer>
</body></html>"""

# Candidate confirming name + exact postcode + house number, but a landline that
# differs from the lead's Google mobile — must still be HIGH (rule B).
_DISCO_ADDR_HTML = """<!doctype html><html lang="nl"><head>
<meta charset="utf-8"><title>Garage Sterk — Kerkstraat Haarlem</title>
</head><body>
<h1>Garage Sterk</h1>
<p>Garage Sterk aan de Kerkstraat 12, 2011 AB Haarlem. Uw adres voor onderhoud,
reparatie en APK. Bel onze werkplaats voor een afspraak.</p>
<a href="tel:+31235552222">023 555 2222</a>
<footer>© 2026 Garage Sterk, Kerkstraat 12, 2011 AB Haarlem</footer>
</body></html>"""

# Multi-location chain pages: one reached via a locator path (must be rejected as
# non-official) and one genuine branch page carrying the lead's own postcode.
_DISCO_CHAIN_HTML = """<!doctype html><html lang="nl"><head>
<meta charset="utf-8"><title>Garage Keten — vestiging Haarlem</title>
</head><body>
<h1>Garage Keten Haarlem</h1>
<p>Garage Keten in Haarlem voor onderhoud, reparatie en APK. Vind uw dichtstbijzijnde
vestiging en maak een afspraak bij Garage Keten Haarlem.</p>
<a href="tel:+31235557000">023 555 7000</a>
<footer>© 2026 Garage Keten — Haarlem</footer>
</body></html>"""

_DISCO_CHAIN_BRANCH_HTML = """<!doctype html><html lang="nl"><head>
<meta charset="utf-8"><title>Garage Keten — vestiging Haarlem</title>
</head><body>
<h1>Garage Keten Haarlem</h1>
<p>Welkom bij Garage Keten, vestiging Haarlem, Kerkstraat 12, 2011 AB Haarlem.
Uw adres voor onderhoud, reparatie en APK in Haarlem.</p>
<a href="tel:+31235557001">023 555 7001</a>
<footer>© 2026 Garage Keten, Kerkstraat 12, 2011 AB Haarlem</footer>
</body></html>"""

# Reachable candidate with no identifying overlap at all — insufficient evidence.
_DISCO_NOMATCH_HTML = """<!doctype html><html lang="nl"><head>
<meta charset="utf-8"><title>Willekeurig Autobedrijf</title>
</head><body>
<h1>Willekeurig Autobedrijf</h1>
<p>Een compleet autobedrijf voor onderhoud, reparatie en APK. Wij helpen u graag
verder met vakkundige service en scherpe tarieven in de hele regio.</p>
<footer>© 2026 Willekeurig Autobedrijf</footer>
</body></html>"""

_DISCO_PHONE_HTML = """<!doctype html><html lang="nl"><head>
<meta charset="utf-8"><title>De Garage — Eindhoven</title>
</head><body>
<h1>De Garage Eindhoven</h1>
<p>Welkom bij De Garage aan de Ringweg 3, 5611 AA Eindhoven. Onderhoud, reparatie
en APK voor alle merken. Maak vandaag nog een afspraak met onze monteurs.</p>
<a href="tel:+31401212121">040 121 2121</a>
<footer>© 2026 De Garage, Eindhoven</footer>
</body></html>"""

_DISCO_DOGWALK_HTML = """<!doctype html><html lang="nl"><head>
<meta charset="utf-8"><title>Hondenuitlaatservice Rex — uitlaten en dagopvang in Tilburg</title>
</head><body>
<h1>Hondenuitlaatservice Rex</h1>
<p>Wij laten uw hond met veel liefde uit in Tilburg en omgeving. Persoonlijke
aandacht, vaste groepjes en dagopvang voor uw trouwe viervoeter. Neem contact op
voor een gratis kennismaking met onze hondenuitlaatservice.</p>
<a href="tel:+31131002000">013 100 2000</a>
<footer>© 2026 Hondenuitlaatservice Rex, Tilburg</footer>
</body></html>"""

MOCK_SITES.update({
    "garageverified.nl": _ok_site(_DISCO_VERIFIED_HTML),
    "garagemedium.nl": _ok_site(_DISCO_MEDIUM_HTML),
    "garagevanelders.nl": _ok_site(_DISCO_CONFLICT_HTML),
    "garagephone.nl": _ok_site(_DISCO_PHONE_HTML),
    "hondenrex.nl": _ok_site(_DISCO_DOGWALK_HTML),
    "garagemobiel.nl": _ok_site(_DISCO_MOBILE_LANDLINE_HTML),
    "garagemulti.nl": _ok_site(_DISCO_MULTINUMBER_HTML),
    "garagesterk.nl": _ok_site(_DISCO_ADDR_HTML),
    "garagewillekeurig.nl": _ok_site(_DISCO_NOMATCH_HTML),
    "chainlocator.nl": _ok_site(_DISCO_CHAIN_HTML),
    "chainofficial.nl": _ok_site(_DISCO_CHAIN_BRANCH_HTML),
})


# Query-trigger -> organic results. The discovery layer only reads `url`; the
# title/snippet fields exist purely to mirror a real provider's shape (and are
# never persisted). Matched case-insensitively as substrings of the query.
_MOCK_SEARCH_TRIGGERS = [
    ("hondenuitlaat", [{"url": "https://hondenrex.nl/", "title": "Hondenuitlaatservice Rex",
                        "snippet": "hondenuitlaat Tilburg"}]),
    ("+31401212121", [{"url": "https://garagephone.nl/", "title": "De Garage",
                       "snippet": "Garage in Eindhoven"}]),
    ("401212121", [{"url": "https://garagephone.nl/", "title": "De Garage",
                    "snippet": "Garage in Eindhoven"}]),
    ("verified", [{"url": "https://garageverified.nl/", "title": "Autobedrijf Verified",
                   "snippet": "Garage Amsterdam"}]),
    ("medium", [{"url": "https://garagemedium.nl/", "title": "Garage Medium Uniek",
                 "snippet": "Garage Rotterdam"}]),
    ("conflict", [{"url": "https://garagevanelders.nl/", "title": "Garage Van Elders",
                   "snippet": "Garage Utrecht"}]),
    ("directory", [{"url": "https://www.detelefoongids.nl/bedrijf/12345", "title": "Gids",
                    "snippet": "directory"},
                   {"url": "https://www.facebook.com/somegarage", "title": "FB",
                    "snippet": "social"}]),
    ("transientfetch", [{"url": "https://garage-gone-xyz.nl/", "title": "gone",
                         "snippet": "unreachable"}]),
    ("nomatch", [{"url": "https://garagewillekeurig.nl/", "title": "willekeurig",
                  "snippet": "geen match"}]),
]


def mock_web_search(query: str, count: int = 5):
    """Return synthetic organic results for a query (or [] for 'nothing found')."""
    q = (query or "").lower()
    for trigger, results in _MOCK_SEARCH_TRIGGERS:
        if trigger in q:
            return results[:count]
    return []
