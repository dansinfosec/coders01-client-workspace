"""Central configuration for batch lead discovery: categories × locations.

This is the ONE place to edit which business categories and Dutch locations the
`batch` command searches. It produces natural Google-Maps-style Dutch queries
like "dakdekker Amsterdam" / "schoonmaakbedrijf Utrecht" / "kapper Haarlem".

Nothing here calls the API — it only generates the search matrix.
"""

from __future__ import annotations

import re

# --- Categories (business types) -------------------------------------------
CATEGORIES = [
    "Dakdekker", "Schilder", "Loodgieter", "Elektricien", "Aannemer",
    "Gevelspecialist", "Kozijnspecialist", "Isolatiebedrijf", "Installatiebedrijf",
    "Hovenier", "Schoonmaakbedrijf", "Glazenwasser", "Verhuisbedrijf",
    "Ongediertebestrijding", "Airco installateur", "Zonnepanelen installateur",
    "Warmtepomp installateur", "Autogarage", "Autoschadebedrijf", "Rijschool",
    "Kapper", "Barbershop", "Beautysalon", "Nagelstudio", "Pedicure",
    "Fysiotherapeut", "Chiropractor", "Tandarts", "Thuiszorg", "Zorgbureau",
    "Makelaar", "Woningtaxateur", "Hypotheekadviseur", "Administratiekantoor",
    "Boekhouder", "Advocatenkantoor", "Restaurant", "Cateringbedrijf",
    "Fotograaf", "Sportschool",
]

# --- Locations (cities) ----------------------------------------------------
LOCATIONS = [
    "Amsterdam", "Rotterdam", "Den Haag", "Utrecht", "Haarlem", "Almere",
    "Zaandam", "Leiden", "Hilversum", "Amstelveen", "Delft", "Zoetermeer",
    "Gouda", "Dordrecht", "Hoofddorp", "Purmerend", "Nieuwegein", "Woerden",
    "Alphen aan den Rijn", "Schiedam", "Vlaardingen", "Capelle aan den IJssel",
    "Rijswijk", "Leidschendam", "Katwijk", "Noordwijk", "Bussum", "Huizen",
    "Zeist", "Amersfoort",
]

# Map a category to an EXISTING industry folder slug so new results merge into
# already-collected data instead of creating a near-duplicate folder.
_SLUG_ALIASES = {
    "dakdekker": "dakdekkers",
    "makelaar": "makelaars",
    # "thuiszorg" already matches the existing folder.
}

# --- Municipality geography (for STRICT locationRestriction) ----------------
# Approximate city-centre coordinates, used ONLY to build a search rectangle.
# They do not need street-level precision — the rectangle is deliberately coarse
# (see HALF_SPAN_DEG) so a municipality and its immediate ring are covered.
CITY_GEO = {
    "Amsterdam": (52.3676, 4.9041),
    "Rotterdam": (51.9244, 4.4777),
    "Den Haag": (52.0705, 4.3007),
    "Utrecht": (52.0907, 5.1214),
    "Eindhoven": (51.4416, 5.4697),
    "Groningen": (53.2194, 6.5665),
    "Tilburg": (51.5555, 5.0913),
    "Almere": (52.3508, 5.2647),
    "Breda": (51.5719, 4.7683),
    "Nijmegen": (51.8126, 5.8372),
    "Apeldoorn": (52.2112, 5.9699),
    "Arnhem": (51.9851, 5.8987),
    "Haarlem": (52.3874, 4.6462),
    "Enschede": (52.2215, 6.8937),
    "Amersfoort": (52.1561, 5.3878),
    "Zaandam": (52.4389, 4.8267),
    "Haarlemmermeer": (52.3008, 4.6892),
    "'s-Hertogenbosch": (51.6978, 5.3037),
    "Zwolle": (52.5168, 6.0830),
    "Leiden": (52.1601, 4.4970),
    "Leeuwarden": (53.2012, 5.7999),
    "Maastricht": (50.8514, 5.6910),
    "Dordrecht": (51.8133, 4.6901),
    "Ede": (52.0402, 5.6649),
    "Alphen aan den Rijn": (52.1292, 4.6551),
    "Delft": (52.0116, 4.3571),
    "Venlo": (51.3704, 6.1724),
    "Deventer": (52.2551, 6.1639),
    "Helmond": (51.4793, 5.6570),
    "Oss": (51.7650, 5.5197),
    "Amstelveen": (52.3114, 4.8701),
    "Hilversum": (52.2292, 5.1669),
    "Zoetermeer": (52.0574, 4.4940),
    "Schiedam": (51.9194, 4.3889),
    "Vlaardingen": (51.9123, 4.3417),
    "Rijswijk": (52.0365, 4.3251),
    "Gouda": (52.0115, 4.7104),
    "Purmerend": (52.5050, 4.9592),
    "Nieuwegein": (52.0292, 5.0806),
    "Zeist": (52.0894, 5.2333),
}

# Half-width/height of the search rectangle in degrees (~11 km N-S per 0.1°).
HALF_SPAN_DEG = 0.09


def location_restriction(location: str) -> dict | None:
    """Strict `locationRestriction` rectangle for a known city, else None.

    Returned shape matches the Places API: {"low": {...}, "high": {...}}.
    Unknown locations fall back to text-only targeting (no restriction).
    """
    geo = CITY_GEO.get(location)
    if not geo:
        return None
    lat, lng = geo
    return {
        "low": {"latitude": round(lat - HALF_SPAN_DEG, 6),
                "longitude": round(lng - HALF_SPAN_DEG, 6)},
        "high": {"latitude": round(lat + HALF_SPAN_DEG, 6),
                 "longitude": round(lng + HALF_SPAN_DEG, 6)},
    }


# --- Presets ----------------------------------------------------------------
# A preset is a self-contained target set: its own query list, its own locations
# and ONE industry folder, so every query's results merge into the same dataset.

AUTOMOTIVE_QUERIES = [
    "autogarage",
    "garagebedrijf",
    "autobedrijf",
    "auto reparatie",
    "auto onderhoud",
    "autoservice",
    "automonteur",
    "APK keuring",
    "APK station",
    "bandenservice",
    "bandengarage",
    "airco service auto",
    "uitlaatservice",
    "versnellingsbak specialist",
    "diesel specialist",
]

# Dutch municipalities/cities searched by the automotive preset (all have
# coordinates in CITY_GEO, so every combination gets a strict restriction).
AUTOMOTIVE_LOCATIONS = [
    "Amsterdam", "Rotterdam", "Den Haag", "Utrecht", "Eindhoven", "Groningen",
    "Tilburg", "Almere", "Breda", "Nijmegen", "Apeldoorn", "Arnhem", "Haarlem",
    "Enschede", "Amersfoort", "Zaandam", "Haarlemmermeer", "'s-Hertogenbosch",
    "Zwolle", "Leiden", "Leeuwarden", "Maastricht", "Dordrecht", "Ede",
    "Alphen aan den Rijn", "Delft", "Venlo", "Deventer", "Helmond", "Oss",
]

PRESETS = {
    "automotive-garages-nl": {
        "name": "automotive-garages-nl",
        "description": "Automotive only: garages, APK, banden, airco, uitlaat, "
                       "versnellingsbak and diesel specialists across NL cities.",
        # Writes into the EXISTING industry folder output/industries/autogarage/
        # so preset results merge with prior automotive leads (global dedup still
        # scans every industry). All 15 queries share this one folder slug — which
        # is exactly why the checkpoint key must ALSO include the query.
        "slug": "autogarage",
        "queries": AUTOMOTIVE_QUERIES,
        "locations": AUTOMOTIVE_LOCATIONS,
    },
}


def get_preset(name: str) -> dict:
    """Return a preset by name (case/format-insensitive). Raises KeyError."""
    key = slugify(name)
    for preset_name, preset in PRESETS.items():
        if slugify(preset_name) == key:
            return preset
    raise KeyError(f"Unknown preset '{name}'. Available: {', '.join(sorted(PRESETS))}")


def preset_combinations(preset: dict, queries=None, locations=None,
                        query_limit=None, location_limit=None) -> list[dict]:
    """Query × location combinations for a preset, in query-major order.

    Each combo carries the strict `restriction` rectangle when the location is
    known, so the caller can pass it straight to the Places client.
    """
    qs = list(queries or preset["queries"])
    ls = list(locations or preset["locations"])
    if query_limit is not None:
        qs = qs[:max(0, query_limit)]
    if location_limit is not None:
        ls = ls[:max(0, location_limit)]
    combos = []
    for q in qs:
        for loc in ls:
            combos.append({
                "category": q,
                "slug": preset["slug"],
                "location": loc,
                "query": f"{q} {loc}",
                "restriction": location_restriction(loc),
                "preset": preset["name"],
            })
    return combos


def preset_round_robin(preset: dict, **kw) -> list[dict]:
    """Preset combos reordered so early stops still cover many queries/cities."""
    combos = preset_combinations(preset, **kw)
    if not combos:
        return []
    locs = []
    for c in combos:
        if c["location"] not in locs:
            locs.append(c["location"])
    queries = []
    for c in combos:
        if c["category"] not in queries:
            queries.append(c["category"])
    by_key = {(c["category"], c["location"]): c for c in combos}
    ordered = []
    n_loc = len(locs)
    for r in range(n_loc):
        for i, q in enumerate(queries):
            combo = by_key.get((q, locs[(i + r) % n_loc]))
            if combo is not None:
                ordered.append(combo)
    return ordered


def slugify(label: str) -> str:
    """Lower-case, ASCII-safe slug: "Airco installateur" -> "airco-installateur"."""
    s = (label or "").strip().lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s


def category_slug(label: str) -> str:
    """Industry-folder slug for a category (honouring existing-folder aliases)."""
    base = slugify(label)
    return _SLUG_ALIASES.get(base, base)


def build_query(category: str, location: str) -> str:
    """Natural Dutch Maps query: ("Dakdekker", "Amsterdam") -> "dakdekker Amsterdam"."""
    return f"{category.strip().lower()} {location.strip()}"


def _match(name: str, label: str) -> bool:
    n = slugify(name)
    return n == slugify(label) or n == category_slug(label)


def select_categories(names=None, limit: int | None = None, exclude=None) -> list[str]:
    """Pick categories by explicit name(s) (case-insensitive), an `exclude` list,
    and/or a leading limit. `exclude` is applied after name selection."""
    chosen = CATEGORIES
    if names:
        chosen = [c for c in CATEGORIES if any(_match(n, c) for n in names)]
    if exclude:
        chosen = [c for c in chosen if not any(_match(n, c) for n in exclude)]
    if limit is not None:
        chosen = chosen[:max(0, limit)]
    return chosen


def select_locations(names=None, limit: int | None = None) -> list[str]:
    chosen = LOCATIONS
    if names:
        wanted = {slugify(n) for n in names}
        chosen = [loc for loc in LOCATIONS if slugify(loc) in wanted]
    if limit is not None:
        chosen = chosen[:max(0, limit)]
    return chosen


def _combo(cat: str, loc: str) -> dict:
    return {
        "category": cat,
        "slug": category_slug(cat),
        "location": loc,
        "query": build_query(cat, loc),
    }


def iter_combinations(categories=None, locations=None):
    """Yield every category × location combo as a dict.

    {category, slug, location, query}. Order is stable (category-major).
    """
    cats = categories if categories is not None else CATEGORIES
    locs = locations if locations is not None else LOCATIONS
    for cat in cats:
        for loc in locs:
            yield _combo(cat, loc)


def iter_round_robin(categories=None, locations=None):
    """Yield the full matrix in a *diagonal* round-robin order for broad spread.

    Round r (0..L-1) pairs category c_i with location[(i + r) % L]. Every round
    touches all categories and many different cities, and each category covers
    all locations exactly once across the L rounds — so an early stop still
    leaves broad coverage instead of finishing one category or one city first.
    Covers exactly the same combos as iter_combinations, just reordered.
    """
    cats = list(categories if categories is not None else CATEGORIES)
    locs = list(locations if locations is not None else LOCATIONS)
    if not cats or not locs:
        return
    n_loc = len(locs)
    for r in range(n_loc):
        for i, cat in enumerate(cats):
            yield _combo(cat, locs[(i + r) % n_loc])
