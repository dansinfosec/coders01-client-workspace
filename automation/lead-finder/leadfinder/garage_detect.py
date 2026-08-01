"""Appointment-booking and Dutch vehicle/RDW lookup detection (garages).

Purpose: separate a *basic contact form* from a *real online booking system*, and
a *kenteken text field* from a *real vehicle-data lookup*. Both distinctions are
the actual sales opportunity, so the bar for a positive detection is deliberately
high and every positive stores evidence.

SAFETY / ETHICS (enforced by design, not by convention):
  * Detection is STATIC/RENDERED-HTML ONLY. Nothing here submits a form, posts
    data, logs in, bypasses authentication, or calls a site's private API.
  * No customer data — real or fabricated — is ever sent to a third-party site.
  * Only publicly reachable pages are read, via the same polite fetcher the rest
    of the audit uses (identifiable UA, timeout, low rate, robots-respecting).

Hard rules encoded below:
  * `<input type="date">` alone is a date FIELD, never proof of a calendar.
  * A "gewenste datum"/"voorkeursdatum" text field is an appointment REQUEST.
  * A contact form containing a date field is still a contact form.
  * A link labelled "afspraak maken" that opens a contact form is not a calendar.
  * The words RDW / APK / kenteken alone never prove a vehicle-data integration.
  * A kenteken field inside a contact form is not a vehicle lookup.
"""

from __future__ import annotations

import re

# ---------------------------------------------------------------------------
# Booking: known third-party scheduling platforms (host / script markers).
# A hit proves a real scheduling system is embedded, which by definition offers
# selectable availability. Kept conservative: only widely-used, verifiable names.
# ---------------------------------------------------------------------------
_BOOKING_PROVIDERS = [
    ("calendly", re.compile(r"calendly\.com", re.I)),
    ("setmore", re.compile(r"setmore\.com", re.I)),
    ("simplybook", re.compile(r"simplybook\.(?:me|it)", re.I)),
    ("timify", re.compile(r"timify\.com", re.I)),
    ("acuity", re.compile(r"acuityscheduling\.com|squarespacescheduling\.com", re.I)),
    ("ms_bookings", re.compile(r"bookings\.microsoft\.com|outlook\.office365\.com/owa/calendar", re.I)),
    ("salonized", re.compile(r"salonized\.com", re.I)),
    ("treatwell", re.compile(r"treatwell\.(?:nl|com)", re.I)),
    ("planity", re.compile(r"planity\.com", re.I)),
    ("appointlet", re.compile(r"appointlet\.com", re.I)),
    ("youcanbookme", re.compile(r"youcanbook\.me", re.I)),
    ("cal_com", re.compile(r"\bcal\.com\b", re.I)),
    ("bookeo", re.compile(r"bookeo\.com", re.I)),
    ("trafft", re.compile(r"trafft\.com", re.I)),
    ("amelia", re.compile(r"wpamelia|ameliabooking", re.I)),
    ("bookly", re.compile(r"bookly[-_/]?(?:pro|booking|form)?|/plugins/bookly", re.I)),
    ("woocommerce_bookings", re.compile(r"wc-bookings|woocommerce-bookings", re.I)),
    ("easy_appointments", re.compile(r"easyappointments|easy!appointments", re.I)),
    ("reserve_with_google", re.compile(r"google\.com/maps/reserve", re.I)),
]

# Calendar/date-picker WIDGETS (a real picker, not a bare <input type=date>).
_CALENDAR_WIDGET_RE = re.compile(
    r"(?:flatpickr|fullcalendar|air-datepicker|ui-datepicker|datepicker|"
    r"react-calendar|mat-calendar|vc-calendar|litepicker|pikaday|"
    r"class=[\"'][^\"']*\b(?:calendar|kalender)(?:-|__|\s|[\"']))", re.I)

# A plain date input — counts for can_select_date, NEVER for a calendar.
_DATE_INPUT_RE = re.compile(r"<input[^>]+type=[\"']date[\"']", re.I)

# A free-text "preferred date/time" field — appointment REQUEST, not a slot.
_PREFERRED_DATE_RE = re.compile(
    r"(gewenste?\s*(?:datum|dag|tijd|tijdstip)|voorkeur(?:s)?\s*(?:datum|dag|tijd|moment)|"
    r"wanneer\s+(?:wilt|komt|schikt)|preferred\s*(?:date|time))", re.I)

# --- Selectable availability (the discriminator for a REAL calendar) --------
# Structural markers of a slot picker. [\s_-]* tolerates class-name spelling
# ("beschikbare-tijden", "beschikbare_tijden", "beschikbare tijden").
_SLOT_MARKER_RE = re.compile(
    r"(?:time[-_]?slot|timeslot|slot[-_]?picker|slot[-_]?button|available[-_]?(?:times|slots)|"
    r"data-slot|data-time|beschikbare[\s_-]*(?:tijden|tijdstippen|momenten)|"
    r"vrije[\s_-]*(?:tijden|tijdstippen)|kies[\s_-]*(?:een[\s_-]*)?(?:tijd|tijdstip))", re.I)

# Two or more CLOCK TIMES offered as selectable controls (button/option/radio).
_SELECTABLE_TIME_RE = re.compile(
    r"(?:<button[^>]*>\s*([01]?\d|2[0-3])[:.][0-5]\d\s*<|"
    r"<option[^>]+value=[\"']\s*([01]?\d|2[0-3])[:.][0-5]\d|"
    r"<input[^>]+type=[\"'](?:radio|checkbox)[\"'][^>]+value=[\"']\s*([01]?\d|2[0-3])[:.][0-5]\d)",
    re.I)

# --- Service / branch selection --------------------------------------------
_SERVICE_SELECT_RE = re.compile(
    r"<select[^>]+(?:name|id)=[\"'][^\"']*"
    r"(?:dienst|service|behandeling|werkzaamhed|type[-_]?afspraak|afspraaktype|onderhoud)"
    r"[^\"']*[\"']", re.I)
_SERVICE_OPTION_RE = re.compile(
    r"<option[^>]*>[^<]*\b(?:apk|onderhoud|grote\s*beurt|kleine\s*beurt|reparatie|"
    r"banden(?:wissel|service)?|airco(?:service)?|distributieriem|uitlaat|remmen)\b", re.I)
_SERVICE_RADIO_RE = re.compile(
    r"<input[^>]+type=[\"']radio[\"'][^>]+(?:name|value)=[\"'][^\"']*"
    r"(?:dienst|service|apk|onderhoud|beurt|reparatie)[^\"']*[\"']", re.I)

_BRANCH_SELECT_RE = re.compile(
    r"<select[^>]+(?:name|id)=[\"'][^\"']*"
    r"(?:vestiging|filiaal|locatie|branch|location|dealer)[^\"']*[\"']", re.I)

# Multi-location signals (only then is a missing branch picker a real gap).
_MULTI_LOCATION_RE = re.compile(
    r"(?:onze\s+vestiging|vestigingen|filialen|meerdere\s+locaties|"
    r"alle\s+vestigingen|locaties\s*:|our\s+branches)", re.I)

# --- Form intent -----------------------------------------------------------
_APPOINTMENT_INTENT_RE = re.compile(
    r"(?:afspraak|afspraken|inplannen|inplanning|reserveer|reservering|"
    r"boek(?:en|ing)?\s*(?:nu|online|afspraak)?|onderhoudsafspraak|apk[-\s]?afspraak|"
    r"book\s*(?:now|appointment)|make\s*an?\s*appointment)", re.I)
_QUOTE_INTENT_RE = re.compile(
    r"(?:offerte|prijsopgave|prijs\s*aanvragen|quote|kostenindicatie)", re.I)
_GENERIC_FIELD_RE = re.compile(
    r"(?:name|id|placeholder)=[\"'][^\"']*"
    r"(?:naam|name|e-?mail|telefoon|phone|tel|onderwerp|subject|bericht|message|vraag|opmerking)"
    r"[^\"']*[\"']", re.I)

_APPOINTMENT_CTA_RE = re.compile(
    r"(?:<a[^>]*>|<button[^>]*>|<input[^>]+type=[\"']submit[\"'][^>]*value=[\"'])[^<\"']{0,60}?"
    r"(?:afspraak\s*(?:maken|inplannen|plannen|bevestigen)|maak\s*(?:een\s*)?afspraak|"
    r"bevestig\s*(?:uw|je|de)?\s*afspraak|"
    r"online\s*(?:afspraak|inplannen|boeken)|plan\s*(?:uw|je|een)?\s*(?:afspraak|onderhoud|apk)|"
    r"book\s*(?:now|appointment))", re.I)

# ---------------------------------------------------------------------------
# Vehicle / kenteken
# ---------------------------------------------------------------------------
_PLATE_INPUT_RE = re.compile(
    r"<input[^>]+(?:name|id|placeholder|aria-label)=[\"'][^\"']*"
    r"(?:kenteken|licenseplate|license[-_]plate|numberplate|number[-_]plate|nummerbord)"
    r"[^\"']*[\"']", re.I)
# Dutch plate format used as a pattern/placeholder (sidecode-style masks).
_PLATE_FORMAT_RE = re.compile(
    r"(?:pattern=[\"'][^\"']*[A-Z]\{?2\}?[-\\]?[0-9]|"
    r"placeholder=[\"']\s*(?:[A-Z]{2}-[A-Z0-9]{2}-[A-Z0-9]{2}|XX-\d\d-XX|\d\d-[A-Z]{3}-\d)|"
    r"sidecode|kentekenformaat|kenteken[-_]?pattern)", re.I)

# Vehicle-data API / integration endpoints (STRONG proof of a real lookup).
# Deliberately narrow: must look like a technical identifier/URL (an "api"
# suffix), never a prose phrase — "kenteken-check" in marketing copy must NOT
# match (that is exactly the false positive the brief warns against).
_VEHICLE_API_PROVIDERS = [
    ("rdw_opendata", re.compile(r"opendata\.rdw\.nl|api\.rdw\.nl|rdw\.nl/[^\"']*api", re.I)),
    ("overheid_io", re.compile(r"overheid\.io[^\"']*(?:rdw|voertuig)", re.I)),
    ("kenteken_api", re.compile(r"kenteken[-_]?api\b", re.I)),
    ("vehicle_api", re.compile(r"(?:voertuig(?:gegevens|data)[-_]?api|vehicle[-_]?(?:data|lookup)[-_]?api)", re.I)),
]

# A JS lookup call keyed on the plate (medium proof; needs a result container).
_LOOKUP_CALL_RE = re.compile(
    r"(?:getVehicle|fetchVehicle|lookupVehicle|kentekenCheck|checkKenteken|"
    r"haalVoertuig|vehicleLookup|zoekKenteken)\s*\(|"
    r"(?:fetch|axios\.get|\$\.(?:get|ajax))\s*\([^)]{0,120}"
    r"(?:kenteken|voertuig|vehicle|licenseplate)", re.I)

# A container that DISPLAYS returned vehicle data.
_VEHICLE_RESULT_CONTAINER_RE = re.compile(
    r"(?:id|class)=[\"'][^\"']*"
    r"(?:voertuig[-_]?(?:gegevens|data|result(?:aat)?|info)|vehicle[-_]?(?:result|data|details|info)|"
    r"kenteken[-_]?(?:result(?:aat)?|info)|auto[-_]?gegevens|car[-_]?details)"
    r"[^\"']*[\"']", re.I)

# Individual vehicle attributes that only appear once data is returned.
_VEHICLE_ATTRS = [
    ("merk", re.compile(r"\bmerk\b|\bbrand\b(?!ing)", re.I)),
    ("model", re.compile(r"\bmodel\b|handelsbenaming", re.I)),
    ("brandstof", re.compile(r"brandstof|fuel[-_ ]?type", re.I)),
    ("bouwjaar", re.compile(r"bouwjaar|datum\s*eerste\s*toelating|year\s*of\s*(?:manufacture|build)", re.I)),
    ("apk_vervaldatum", re.compile(r"apk[-\s]?(?:vervaldatum|verloopdatum|geldig\s*tot)|vervaldatum\s*apk", re.I)),
    ("massa", re.compile(r"\bmassa\b|ledig\s*gewicht|voertuiggewicht", re.I)),
    ("variant", re.compile(r"\bvariant\b|uitvoering", re.I)),
    ("cilinderinhoud", re.compile(r"cilinderinhoud|motorinhoud", re.I)),
]


def _snip(match, span=90) -> str:
    return re.sub(r"\s+", " ", match.group(0))[:span].strip()


def _ev(kind, selector, match, page_url=None) -> dict:
    return {"signal": kind, "matched_selector": selector,
            "matched_text": _snip(match) if match is not None else None,
            "page_url": page_url}


# ---------------------------------------------------------------------------
# Booking detection
# ---------------------------------------------------------------------------

def detect_booking(html: str, page_url: str | None = None) -> dict:
    """Analyse one page for appointment/booking capability. Facts + evidence."""
    out = {
        "has_basic_contact_form": False,
        "has_quote_request_form": False,
        "has_appointment_request_form": False,
        "has_real_booking_calendar": False,
        "can_select_service": False,
        "can_select_branch": False,
        "can_select_date": False,
        "can_select_available_time_slot": False,
        "is_multi_location": False,
        "has_appointment_cta": False,
        "booking_provider": None,
        "booking_evidence": [],
    }
    if not html:
        return out
    ev = out["booking_evidence"]

    # --- known third-party scheduling platform (strongest signal) ----------
    provider_hit = None
    for name, rx in _BOOKING_PROVIDERS:
        m = rx.search(html)
        if m:
            provider_hit = name
            out["booking_provider"] = name
            ev.append(_ev("booking_provider", name, m, page_url))
            break

    # --- selectable availability ------------------------------------------
    slot_marker = _SLOT_MARKER_RE.search(html)
    time_hits = _SELECTABLE_TIME_RE.findall(html)
    has_slot_controls = len(time_hits) >= 2
    if slot_marker:
        ev.append(_ev("slot_marker", "time-slot / beschikbare tijden", slot_marker, page_url))
    if has_slot_controls:
        m = _SELECTABLE_TIME_RE.search(html)
        ev.append(_ev("selectable_times", f"{len(time_hits)} selectable clock times", m, page_url))
    # A slot is "selectable" when a picker structure AND/OR >=2 time controls
    # exist — or a real scheduling provider is embedded (it supplies its own).
    out["can_select_available_time_slot"] = bool(
        has_slot_controls or (slot_marker and provider_hit) or provider_hit)

    # --- date selection ----------------------------------------------------
    cal_widget = _CALENDAR_WIDGET_RE.search(html)
    date_input = _DATE_INPUT_RE.search(html)
    if cal_widget:
        ev.append(_ev("calendar_widget", "date-picker widget", cal_widget, page_url))
    if date_input:
        ev.append(_ev("date_input", "<input type=date> (field only, not a calendar)",
                      date_input, page_url))
    out["can_select_date"] = bool(cal_widget or date_input or provider_hit)

    # --- service / branch selection ---------------------------------------
    svc = _SERVICE_SELECT_RE.search(html) or _SERVICE_RADIO_RE.search(html)
    svc_opts = _SERVICE_OPTION_RE.findall(html)
    if svc:
        ev.append(_ev("service_select", "service/appointment-type control", svc, page_url))
    elif len(svc_opts) >= 2:
        m = _SERVICE_OPTION_RE.search(html)
        ev.append(_ev("service_options", f"{len(svc_opts)} service options", m, page_url))
    out["can_select_service"] = bool(svc or len(svc_opts) >= 2)

    branch = _BRANCH_SELECT_RE.search(html)
    if branch:
        ev.append(_ev("branch_select", "vestiging/locatie selector", branch, page_url))
    out["can_select_branch"] = bool(branch)

    multi = _MULTI_LOCATION_RE.search(html)
    if multi:
        ev.append(_ev("multi_location", "multiple branches mentioned", multi, page_url))
    out["is_multi_location"] = bool(multi)

    # --- appointment CTA ---------------------------------------------------
    cta = _APPOINTMENT_CTA_RE.search(html)
    if cta:
        ev.append(_ev("appointment_cta", "afspraak-maken CTA", cta, page_url))
    out["has_appointment_cta"] = bool(cta)

    # --- form intent -------------------------------------------------------
    has_form_fields = bool(_GENERIC_FIELD_RE.search(html)) or "<form" in html.lower()
    appointment_intent = _APPOINTMENT_INTENT_RE.search(html)
    preferred_date = _PREFERRED_DATE_RE.search(html)
    quote_intent = _QUOTE_INTENT_RE.search(html)

    # REAL calendar: a complete flow — service/appointment type + date +
    # ACTUAL selectable slots. A known provider satisfies this by definition.
    real_calendar = bool(
        provider_hit
        or (out["can_select_available_time_slot"]
            and out["can_select_date"]
            and (out["can_select_service"] or appointment_intent))
    )
    out["has_real_booking_calendar"] = real_calendar
    if real_calendar and not provider_hit:
        ev.append({"signal": "real_calendar_composed",
                   "matched_selector": "service/appointment + date + selectable slots",
                   "matched_text": None, "page_url": page_url})

    if quote_intent and has_form_fields:
        out["has_quote_request_form"] = True
        ev.append(_ev("quote_form", "offerte/prijsopgave form", quote_intent, page_url))

    # APPOINTMENT REQUEST: asks for an appointment/preferred date/vehicle or
    # service, but shows NO real availability. Still a sales opportunity.
    if not real_calendar and has_form_fields and (appointment_intent or preferred_date):
        out["has_appointment_request_form"] = True
        ev.append(_ev("appointment_request_form",
                      "appointment intent without selectable availability",
                      preferred_date or appointment_intent, page_url))

    # BASIC CONTACT FORM: generic fields only, no appointment/quote intent and
    # no real calendar. A date field inside it does NOT upgrade it.
    if (has_form_fields and not real_calendar
            and not out["has_appointment_request_form"]
            and not out["has_quote_request_form"]):
        m = _GENERIC_FIELD_RE.search(html)
        out["has_basic_contact_form"] = True
        ev.append(_ev("basic_contact_form", "generic name/email/message fields",
                      m, page_url))

    return out


# ---------------------------------------------------------------------------
# Vehicle / kenteken detection
# ---------------------------------------------------------------------------

def detect_vehicle_lookup(html: str, page_url: str | None = None) -> dict:
    """Analyse one page for kenteken input and real vehicle-data lookup."""
    out = {
        "can_enter_license_plate": False,
        "has_vehicle_lookup_result": False,
        "has_rdw_or_vehicle_data_integration": False,
        "vehicle_lookup_provider": None,
        "vehicle_lookup_evidence": [],
    }
    if not html:
        return out
    ev = out["vehicle_lookup_evidence"]

    # --- plate input -------------------------------------------------------
    plate = _PLATE_INPUT_RE.search(html)
    plate_fmt = _PLATE_FORMAT_RE.search(html)
    if plate:
        ev.append(_ev("plate_input", "kenteken/licenseplate input", plate, page_url))
    if plate_fmt:
        ev.append(_ev("plate_format", "Dutch plate pattern/placeholder", plate_fmt, page_url))
    out["can_enter_license_plate"] = bool(plate or plate_fmt)

    # --- vehicle-data API provider (STRONG) --------------------------------
    provider = None
    for name, rx in _VEHICLE_API_PROVIDERS:
        m = rx.search(html)
        if m:
            provider = name
            out["vehicle_lookup_provider"] = name
            ev.append(_ev("vehicle_api", name, m, page_url))
            break

    # --- returned-data evidence (MEDIUM) -----------------------------------
    container = _VEHICLE_RESULT_CONTAINER_RE.search(html)
    if container:
        ev.append(_ev("vehicle_result_container", "vehicle-data result container",
                      container, page_url))
    attrs = [name for name, rx in _VEHICLE_ATTRS if rx.search(html)]
    if attrs:
        ev.append({"signal": "vehicle_attributes",
                   "matched_selector": ", ".join(attrs),
                   "matched_text": None, "page_url": page_url})
    lookup_call = _LOOKUP_CALL_RE.search(html)
    if lookup_call:
        ev.append(_ev("lookup_call", "JS lookup keyed on plate", lookup_call, page_url))

    # A lookup RESULT requires proof that vehicle data comes back — never the
    # mere words RDW/APK/kenteken, and never a plate field on its own.
    result = bool(
        provider
        or (container and len(attrs) >= 2)
        or (lookup_call and (container or len(attrs) >= 2))
    )
    out["has_vehicle_lookup_result"] = result

    # Integration = a named vehicle-data API, or a plate field that demonstrably
    # returns vehicle data into the page/process.
    out["has_rdw_or_vehicle_data_integration"] = bool(
        provider or (result and out["can_enter_license_plate"]))

    return out


# ---------------------------------------------------------------------------
# Multi-page merge
# ---------------------------------------------------------------------------

_BOOL_FIELDS_BOOKING = (
    "has_basic_contact_form", "has_quote_request_form", "has_appointment_request_form",
    "has_real_booking_calendar", "can_select_service", "can_select_branch",
    "can_select_date", "can_select_available_time_slot", "is_multi_location",
    "has_appointment_cta",
)
_BOOL_FIELDS_VEHICLE = (
    "can_enter_license_plate", "has_vehicle_lookup_result",
    "has_rdw_or_vehicle_data_integration",
)


def merge_booking(primary: dict, other: dict) -> dict:
    """OR-merge booking facts across pages; evidence is concatenated."""
    out = dict(primary)
    for f in _BOOL_FIELDS_BOOKING:
        out[f] = bool(primary.get(f)) or bool(other.get(f))
    out["booking_provider"] = primary.get("booking_provider") or other.get("booking_provider")
    out["booking_evidence"] = (primary.get("booking_evidence") or []) + \
                              (other.get("booking_evidence") or [])
    # A real calendar found anywhere demotes the "basic form only" verdict.
    if out["has_real_booking_calendar"] or out["has_appointment_request_form"]:
        out["has_basic_contact_form"] = False
    return out


def merge_vehicle(primary: dict, other: dict) -> dict:
    """OR-merge vehicle facts across pages; evidence is concatenated."""
    out = dict(primary)
    for f in _BOOL_FIELDS_VEHICLE:
        out[f] = bool(primary.get(f)) or bool(other.get(f))
    out["vehicle_lookup_provider"] = (primary.get("vehicle_lookup_provider")
                                      or other.get("vehicle_lookup_provider"))
    out["vehicle_lookup_evidence"] = (primary.get("vehicle_lookup_evidence") or []) + \
                                     (other.get("vehicle_lookup_evidence") or [])
    return out


# --- Pages worth following for booking evidence ----------------------------
_BOOKING_LINK_RE = re.compile(r'<a[^>]+href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', re.I | re.S)
_BOOKING_HINT_RE = re.compile(
    r"(afspraak|afspraken|online[-_\s]?afspraak|reserveer|reservering|booking|boeken|"
    r"apk|onderhoud|kenteken|planner)", re.I)


def find_booking_links(html: str, base_url: str, limit: int = 2) -> list[str]:
    """Up to `limit` same-host URLs likely to hold the booking/kenteken flow."""
    if not html or not base_url:
        return []
    from urllib.parse import urljoin, urlparse
    base_host = (urlparse(base_url).hostname or "").lower()
    found, seen = [], set()
    for m in _BOOKING_LINK_RE.finditer(html):
        href, text = m.group(1).strip(), re.sub(r"<[^>]+>", "", m.group(2))
        if href.startswith(("#", "mailto:", "tel:", "javascript:")):
            continue
        if not (_BOOKING_HINT_RE.search(href) or _BOOKING_HINT_RE.search(text)):
            continue
        absolute = urljoin(base_url, href)
        host = (urlparse(absolute).hostname or "").lower()
        if host and base_host and host != base_host:
            continue
        if absolute not in seen:
            seen.add(absolute)
            found.append(absolute)
        if len(found) >= limit:
            break
    return found
