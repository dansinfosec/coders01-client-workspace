"""Copyright-year detection with evidence.

The old auditor used ``(?:©|copyright)\\s*(\\d{4})`` and took the FIRST four-digit
year after the marker. For a range like "© 1998–2026" that captured 1998, so an
actively-maintained site was misflagged as outdated.

`detect_copyright()` instead:
  * locates the copyright/footer statement around each ©/copyright marker,
  * extracts ALL plausible four-digit years from that tight context,
  * uses the MOST RECENT year as the effective copyright year,
  * ignores obviously-unrelated numbers (KvK/VAT/phone are not isolated 4-digit
    tokens; out-of-range values and article dates outside the © context are
    excluded by the range + tight window).

Returns: copyright_text, copyright_years_found, effective_copyright_year,
outdated_copyright.
"""

from __future__ import annotations

import re

# Markers that introduce a copyright statement.
_MARKER_RE = re.compile(r"©|copyright", re.I)
# HTML entities for the © sign.
_ENTITY_RE = re.compile(r"&copy;|&#0*169;|&#x0*a9;", re.I)
_TAG_RE = re.compile(r"<[^>]+>")
# A bare four-digit token.
_YEAR_RE = re.compile(r"\b(\d{4})\b")

# How much text around a marker forms the "copyright statement".
_BEFORE = 12
_AFTER = 140


def _plain_text(html: str) -> str:
    """Entity-normalise ©, strip tags, collapse whitespace."""
    text = _ENTITY_RE.sub("©", html or "")
    text = _TAG_RE.sub(" ", text)
    return re.sub(r"\s+", " ", text).strip()


def _windows(text: str):
    """Yield the copyright-statement windows around each marker."""
    for m in _MARKER_RE.finditer(text):
        start = max(0, m.start() - _BEFORE)
        yield text[start:m.end() + _AFTER]


def detect_copyright(html: str, current_year: int = 2026) -> dict:
    """Extract the effective copyright year from a page's HTML.

    ``current_year`` defaults to 2026 per requirements. A site is "outdated" when
    its most-recent copyright year is older than ``current_year - 1`` (so 2025 and
    2026 both count as current).
    """
    result = {
        "copyright_text": None,
        "copyright_years_found": [],
        "effective_copyright_year": None,
        "outdated_copyright": False,
    }
    if not html:
        return result

    text = _plain_text(html)
    windows = list(_windows(text))
    if not windows:
        return result

    hi = current_year + 1
    years = set()
    for w in windows:
        for m in _YEAR_RE.finditer(w):
            y = int(m.group(1))
            if 1990 <= y <= hi:
                years.add(y)

    # Keep a short, readable copyright statement as evidence.
    result["copyright_text"] = windows[0].strip()[:160]

    if not years:
        return result

    result["copyright_years_found"] = sorted(years)
    effective = max(years)  # most recent year wins
    result["effective_copyright_year"] = effective
    result["outdated_copyright"] = effective < current_year - 1
    return result
