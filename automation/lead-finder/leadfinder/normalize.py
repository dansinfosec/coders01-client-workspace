"""Normalization + de-duplication helpers (pure, unit-tested).

Leads are de-duplicated on three keys, in priority order:
  1. place_id      — Google's stable identifier
  2. normalized domain — same website => same business
  3. normalized phone  — same number => same business
"""

from __future__ import annotations

import re
from urllib.parse import urlparse


# ---------------------------------------------------------------------------
# Domain
# ---------------------------------------------------------------------------

def normalize_domain(url: str | None) -> str | None:
    """Return a canonical registrable host for a website URL, or None.

    Lower-cases, drops scheme, `www.`, port, path, query and trailing dot.
    ``https://WWW.Example.com:443/contact?x=1`` -> ``example.com``.
    """
    if not url:
        return None
    url = url.strip()
    if not url:
        return None
    if "//" not in url:
        url = "//" + url  # let urlparse find the host even without a scheme
    host = (urlparse(url).hostname or "").lower().strip(".")
    if not host:
        return None
    if host.startswith("www."):
        host = host[4:]
    return host or None


# ---------------------------------------------------------------------------
# Phone
# ---------------------------------------------------------------------------

_NON_DIGITS = re.compile(r"[^\d+]")


def normalize_phone(phone: str | None, default_country: str = "31") -> str | None:
    """Normalize a phone number to a compact E.164-ish string, or None.

    Tailored for the Netherlands by default but generic:
      - keeps a leading '+' and its digits;
      - '00xx...'  -> '+xx...';
      - a national number starting with '0' -> '+<default_country>' + rest;
      - otherwise returns '+' + digits.
    Examples (NL): '085 - 060 0397' -> '+31850600397';
                   '+31 85 060 0397' -> '+31850600397'.
    """
    if not phone:
        return None
    cleaned = _NON_DIGITS.sub("", phone)
    if not cleaned:
        return None

    if cleaned.startswith("+"):
        digits = cleaned[1:]
        return "+" + digits if digits else None
    if cleaned.startswith("00"):
        return "+" + cleaned[2:]
    if cleaned.startswith("0"):
        return "+" + default_country + cleaned[1:]
    # No recognizable prefix: assume it already includes a country code.
    return "+" + cleaned


# ---------------------------------------------------------------------------
# De-duplication
# ---------------------------------------------------------------------------

def dedupe_leads(leads: list[dict]) -> tuple[list[dict], int]:
    """Return (unique_leads, duplicates_removed).

    Two leads are duplicates if they share a place_id, a normalized domain, or a
    normalized phone. The first occurrence wins; later duplicates are dropped but
    may fill in missing website/phone fields on the kept record.
    """
    unique: list[dict] = []
    seen_place: dict[str, int] = {}
    seen_domain: dict[str, int] = {}
    seen_phone: dict[str, int] = {}
    duplicates = 0

    for lead in leads:
        place_id = lead.get("place_id")
        domain = normalize_domain(lead.get("website"))
        phone = normalize_phone(lead.get("phone"))

        idx = None
        if place_id and place_id in seen_place:
            idx = seen_place[place_id]
        elif domain and domain in seen_domain:
            idx = seen_domain[domain]
        elif phone and phone in seen_phone:
            idx = seen_phone[phone]

        if idx is not None:
            duplicates += 1
            _merge_missing(unique[idx], lead)
            # Register any newly-learned keys so later records still match.
            _register(seen_place, seen_domain, seen_phone, idx, unique[idx])
            continue

        idx = len(unique)
        unique.append(dict(lead))
        if place_id:
            seen_place[place_id] = idx
        if domain:
            seen_domain[domain] = idx
        if phone:
            seen_phone[phone] = idx

    return unique, duplicates


def _merge_missing(keep: dict, other: dict) -> None:
    """Fill only empty fields on `keep` from `other`."""
    for key, value in other.items():
        if value and not keep.get(key):
            keep[key] = value


def _register(seen_place, seen_domain, seen_phone, idx, lead) -> None:
    place_id = lead.get("place_id")
    domain = normalize_domain(lead.get("website"))
    phone = normalize_phone(lead.get("phone"))
    if place_id:
        seen_place.setdefault(place_id, idx)
    if domain:
        seen_domain.setdefault(domain, idx)
    if phone:
        seen_phone.setdefault(phone, idx)
