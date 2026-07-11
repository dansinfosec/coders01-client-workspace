"""Synthetic Google Places responses + mock websites for development.

Nothing here touches the network. The mock transport returns Places-API-shaped
payloads; the mock website fetcher returns canned HTML/errors so the audit and
scoring pipeline can be demonstrated end-to-end without any real requests.

All businesses, domains and phone numbers below are FICTIONAL.
"""

from __future__ import annotations

# --- Places Text Search fixtures (paginated) -------------------------------
# Two pages, linked by nextPageToken, so pagination can be exercised.

_TEXTSEARCH_PAGE_1 = {
    "places": [
        {
            "id": "mock_place_001",
            "displayName": {"text": "Dakdekkersbedrijf De Nok"},
            "formattedAddress": "Nokstraat 1, 3511 AA Utrecht",
            "location": {"latitude": 52.0907, "longitude": 5.1214},
            "primaryType": "roofing_contractor",
            "googleMapsUri": "https://maps.google.com/?cid=1001",
            "businessStatus": "OPERATIONAL",
        },
        {
            "id": "mock_place_002",
            "displayName": {"text": "Utrecht Dak & Zink"},
            "formattedAddress": "Zinklaan 22, 3512 BB Utrecht",
            "location": {"latitude": 52.0930, "longitude": 5.1180},
            "primaryType": "roofing_contractor",
            "googleMapsUri": "https://maps.google.com/?cid=1002",
            "businessStatus": "OPERATIONAL",
        },
        {
            "id": "mock_place_003",
            "displayName": {"text": "Van Dijk Dakwerken"},
            "formattedAddress": "Pannenweg 8, 3513 CC Utrecht",
            "location": {"latitude": 52.0951, "longitude": 5.1099},
            "primaryType": "roofing_contractor",
            "googleMapsUri": "https://maps.google.com/?cid=1003",
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
            "location": {"latitude": 52.1001, "longitude": 5.1000},
            "primaryType": "roofing_contractor",
            "googleMapsUri": "https://maps.google.com/?cid=1004",
            "businessStatus": "OPERATIONAL",
        },
        {
            # Duplicate of place_002 by domain — exercises de-duplication.
            "id": "mock_place_005",
            "displayName": {"text": "Utrecht Dak en Zink (2e vestiging)"},
            "formattedAddress": "Zinklaan 90, 3512 BZ Utrecht",
            "location": {"latitude": 52.0940, "longitude": 5.1170},
            "primaryType": "roofing_contractor",
            "googleMapsUri": "https://maps.google.com/?cid=1005",
            "businessStatus": "OPERATIONAL",
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


def mock_textsearch(page_token: str | None):
    """Return the mock Text Search payload for the given page token."""
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
}


def mock_fetch_site(domain: str):
    """Return a canned fetch descriptor for a domain, or a generic 'no data'."""
    return MOCK_SITES.get(domain, {"kind": "unreachable", "reason": "dns_failure"})
