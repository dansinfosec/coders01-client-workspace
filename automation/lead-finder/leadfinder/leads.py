"""Mapping Places API payloads into the flat lead schema we store."""

from __future__ import annotations

from datetime import datetime, timezone

from .normalize import normalize_phone

LEAD_FIELDS = [
    "place_id", "industry", "business_name", "category", "address", "city", "region",
    "phone", "website", "google_maps_uri", "business_status",
    "google_rating", "google_review_count", "source_checked_at",
]


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def has_sufficient_identity(lead: dict) -> bool:
    """True if a lead has enough identifying info to be worth storing.

    Requires at least ONE of: place_id, phone, website, or a business name
    together with a location (city/region). Prevents adding empty/ghost records.
    """
    if lead.get("place_id") or lead.get("phone") or lead.get("website"):
        return True
    return bool(lead.get("business_name") and (lead.get("city") or lead.get("region")))


def has_valid_phone(lead: dict) -> bool:
    """True only if the lead has a plausibly-callable telephone number.

    A number is valid when it normalizes (E.164-ish) to a '+' followed by a
    reasonable count of digits (8–15, per E.164). Missing, empty, or obviously
    too-short/too-long numbers are rejected — such businesses are not saved.
    """
    normalized = normalize_phone(lead.get("phone"))
    if not normalized:
        return False
    digits = normalized.lstrip("+")
    return 8 <= len(digits) <= 15


# Places `businessStatus` values that mean "do not pitch this business".
CLOSED_STATUSES = {"CLOSED_PERMANENTLY", "CLOSED_TEMPORARILY"}


def is_open_business(lead: dict) -> bool:
    """False for permanently/temporarily closed businesses.

    An absent status is treated as open — Google omits the field for many
    healthy listings, so absence must not silently drop good leads.
    """
    status = (lead.get("business_status") or "").strip().upper()
    return status not in CLOSED_STATUSES


def needs_details_fallback(lead: dict) -> bool:
    """True when a lead lacks EVERY contact route the Text Search mask provides.

    Text Search already returns phone + website, so a Place Details call can only
    help in the rare case where both are absent. Anything less strict would
    re-introduce the per-result Details cost this refactor removed.
    """
    return not lead.get("phone") and not lead.get("website")


def map_to_lead(summary: dict, details: dict | None = None, *, region=None, city=None,
                industry=None) -> dict:
    """Build a lead from a Text Search result (+ optional Details fallback).

    The Text Search field mask now returns every lead field, so `details` is
    normally None. When the narrow --details-fallback runs, its values take
    precedence only for the contact fields it requests.

    `industry` is the branche slug (e.g. "autogarage") the search was run for;
    it lets one dashboard hold multiple industries. The schema is unchanged.
    """
    d = details or {}
    s = summary or {}

    def name(obj):
        dn = obj.get("displayName")
        return dn.get("text") if isinstance(dn, dict) else dn

    place_id = d.get("id") or s.get("id")
    return {
        "place_id": place_id,
        "industry": industry,
        "business_name": name(s) or name(d),
        "category": s.get("primaryType") or d.get("primaryType"),
        "address": s.get("formattedAddress") or d.get("formattedAddress"),
        # addressComponents (now in the mask) is far more reliable than parsing
        # the formatted string; fall back to the string parser.
        "city": (city or _city_from_components(s.get("addressComponents"))
                 or _city_from_address(s.get("formattedAddress") or d.get("formattedAddress"))),
        "region": region,
        # Details (fallback) wins for contact fields; otherwise Text Search.
        "phone": (d.get("internationalPhoneNumber") or d.get("nationalPhoneNumber")
                  or s.get("nationalPhoneNumber")),
        "website": d.get("websiteUri") or s.get("websiteUri"),
        # googleMapsUri is no longer requested (it would widen the field mask);
        # the canonical place-id Maps URL is derived locally at zero cost.
        "google_maps_uri": _maps_uri(place_id) or s.get("googleMapsUri"),
        "business_status": s.get("businessStatus") or d.get("businessStatus"),
        # Google review data (never invented — None when the API omits it).
        "google_rating": s.get("rating") if s.get("rating") is not None else d.get("rating"),
        "google_review_count": (s.get("userRatingCount")
                                if s.get("userRatingCount") is not None
                                else d.get("userRatingCount")),
        "source_checked_at": _now_iso(),
    }


def _maps_uri(place_id: str | None) -> str | None:
    """Canonical Google Maps URL for a place id (documented URL format)."""
    if not place_id:
        return None
    return f"https://www.google.com/maps/place/?q=place_id:{place_id}"


# Address component types that identify the locality, most specific first.
_CITY_TYPES = ("locality", "postal_town", "administrative_area_level_2")


def _city_from_components(components) -> str | None:
    """City from Places `addressComponents` (preferred over string parsing)."""
    if not isinstance(components, list):
        return None
    for wanted in _CITY_TYPES:
        for comp in components:
            if not isinstance(comp, dict):
                continue
            if wanted in (comp.get("types") or []):
                value = comp.get("longText") or comp.get("shortText")
                if value:
                    return value
    return None


_COUNTRY_TOKENS = {"netherlands", "the netherlands", "nederland"}


def _city_from_address(address: str | None) -> str | None:
    """Best-effort city extraction from a Dutch-style formatted address.

    "Zinklaan 22, 3512 BB Utrecht, Netherlands" -> "Utrecht". Google's
    formattedAddress appends the country, so a trailing country token is dropped
    before reading the city. Falls back to None.
    """
    if not address:
        return None
    segments = [s.strip() for s in address.split(",") if s.strip()]
    if not segments:
        return None
    # Drop a trailing country name ("..., Netherlands").
    if segments[-1].lower() in _COUNTRY_TOKENS and len(segments) > 1:
        segments = segments[:-1]
    last = segments[-1]
    # Drop a leading Dutch postcode ("3512 BB ") if present.
    parts = last.split()
    if len(parts) >= 3 and parts[0].isdigit() and parts[1].isalpha() and len(parts[1]) == 2:
        return " ".join(parts[2:]) or None
    return last or None
