"""Mapping Places API payloads into the flat lead schema we store."""

from __future__ import annotations

from datetime import datetime, timezone

LEAD_FIELDS = [
    "place_id", "business_name", "category", "address", "city", "region",
    "phone", "website", "google_maps_uri", "business_status", "source_checked_at",
]


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def map_to_lead(summary: dict, details: dict | None, *, region=None, city=None) -> dict:
    """Combine a Text Search summary + optional Place Details into a lead dict."""
    d = details or {}

    def name(obj):
        dn = obj.get("displayName")
        return dn.get("text") if isinstance(dn, dict) else dn

    return {
        "place_id": d.get("id") or summary.get("id"),
        "business_name": name(d) or name(summary),
        "category": d.get("primaryType") or summary.get("primaryType"),
        "address": d.get("formattedAddress") or summary.get("formattedAddress"),
        "city": city or _city_from_address(summary.get("formattedAddress")),
        "region": region,
        "phone": d.get("internationalPhoneNumber") or d.get("nationalPhoneNumber"),
        "website": d.get("websiteUri"),
        "google_maps_uri": d.get("googleMapsUri") or summary.get("googleMapsUri"),
        "business_status": d.get("businessStatus") or summary.get("businessStatus"),
        "source_checked_at": _now_iso(),
    }


def _city_from_address(address: str | None) -> str | None:
    """Best-effort city extraction from a Dutch-style formatted address.

    "Zinklaan 22, 3512 BB Utrecht" -> "Utrecht". Falls back to None.
    """
    if not address:
        return None
    last = address.split(",")[-1].strip()
    # Drop a leading Dutch postcode ("3512 BB ") if present.
    parts = last.split()
    if len(parts) >= 3 and parts[0].isdigit() and parts[1].isalpha() and len(parts[1]) == 2:
        return " ".join(parts[2:]) or None
    return last or None
