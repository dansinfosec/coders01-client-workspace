"""Dutch sales copy derived from garage audit facts.

Pure functions over the flat audit dict produced by
`audit.audit_lead(..., garage_features=True)`. No network, no side effects.
Every sentence is derived from a concrete, detected fact — nothing here invents
a claim the audit did not verify (no fabricated experience, certifications,
guarantees, or reviews).

`evaluate_lead()` is the single entry point used by both the CLI (CSV export)
and the dashboard: it auto-detects whether garage features were computed for a
given audit (presence of "has_basic_contact_form") and falls back to the
generic `score_audit` for every other industry, so non-garage leads are scored
exactly as before.
"""

from __future__ import annotations

from .scoring import score_audit, score_garage_audit

CATEGORY_NO_WEBSITE = "A_no_website"
CATEGORY_BASIC_WEBSITE = "B_basic_website"
CATEGORY_MANUAL_APPOINTMENT = "C_manual_appointment_website"
CATEGORY_BOOKING_NO_VEHICLE_LOOKUP = "D_booking_without_vehicle_lookup"
CATEGORY_ADVANCED = "E_advanced_garage_website"

CATEGORY_LABELS = {
    CATEGORY_NO_WEBSITE: "Geen website",
    CATEGORY_BASIC_WEBSITE: "Basiswebsite",
    CATEGORY_MANUAL_APPOINTMENT: "Handmatige afspraakaanvraag",
    CATEGORY_BOOKING_NO_VEHICLE_LOOKUP: "Boeken zonder kentekencheck",
    CATEGORY_ADVANCED: "Geavanceerde garagewebsite",
}


def classify_opportunity(audit: dict) -> str:
    """One of the 5 opportunity categories (A-E). Facts only, nothing inferred.

    A — NO WEBSITE: only after website discovery confirmed none was found.
    B — BASIC WEBSITE: company info, phone, or a basic contact form only.
    C — MANUAL APPOINTMENT: an appointment request form, no live calendar.
    D — BOOKING WITHOUT VEHICLE LOOKUP: real calendar, no RDW/vehicle data.
    E — ADVANCED: real calendar AND a verified vehicle-data integration.
    """
    if audit.get("has_website") is False:
        return CATEGORY_NO_WEBSITE
    real_calendar = bool(audit.get("has_real_booking_calendar"))
    rdw = bool(audit.get("has_rdw_or_vehicle_data_integration"))
    appointment_request = bool(audit.get("has_appointment_request_form"))
    if real_calendar and rdw:
        return CATEGORY_ADVANCED
    if real_calendar and not rdw:
        return CATEGORY_BOOKING_NO_VEHICLE_LOOKUP
    if appointment_request and not real_calendar:
        return CATEGORY_MANUAL_APPOINTMENT
    return CATEGORY_BASIC_WEBSITE


_BOOKING_GAP_MESSAGES = {
    "basic_contact_form_only": (
        "Klanten kunnen alleen een bericht sturen; afspraken moeten nog "
        "handmatig worden ingepland."),
    "appointment_request_no_calendar": (
        "Er is een afspraakformulier, maar klanten zien geen beschikbare tijden."),
    "no_booking_system": (
        "Klanten kunnen geen onderhoudsdienst, vestiging, datum en tijdstip "
        "in één flow kiezen."),
}


def booking_gap_reason(audit: dict) -> str | None:
    """Primary booking-capability gap sentence, or None when a real calendar exists."""
    if bool(audit.get("has_real_booking_calendar")):
        return None
    if bool(audit.get("has_appointment_request_form")):
        return _BOOKING_GAP_MESSAGES["appointment_request_no_calendar"]
    if bool(audit.get("has_basic_contact_form")):
        return _BOOKING_GAP_MESSAGES["basic_contact_form_only"]
    return _BOOKING_GAP_MESSAGES["no_booking_system"]


def branch_gap_reason(audit: dict) -> str | None:
    """Multi-location gap — only meaningful when the site itself claims multiple branches."""
    if audit.get("is_multi_location") and not audit.get("can_select_branch"):
        return ("Uw klanten kunnen nog niet eerst een vestiging kiezen en "
               "daarna alleen de beschikbaarheid van die locatie bekijken.")
    return None


_VEHICLE_GAP_MESSAGES = {
    "no_kenteken_input": (
        "Er is geen kentekencheck waarmee voertuiggegevens automatisch worden ingevuld."),
    "kenteken_no_lookup_result": (
        "De website vraagt om een kenteken, maar haalt geen voertuiggegevens op."),
    "no_verified_vehicle_integration": (
        "De website toont voertuiggegevens, maar er is geen geverifieerde "
        "RDW-koppeling zichtbaar."),
}


def vehicle_lookup_gap_reason(audit: dict) -> str | None:
    """Primary vehicle-lookup gap sentence, or None when a verified integration exists."""
    if bool(audit.get("has_rdw_or_vehicle_data_integration")):
        return None
    if not audit.get("can_enter_license_plate"):
        return _VEHICLE_GAP_MESSAGES["no_kenteken_input"]
    if not audit.get("has_vehicle_lookup_result"):
        return _VEHICLE_GAP_MESSAGES["kenteken_no_lookup_result"]
    return _VEHICLE_GAP_MESSAGES["no_verified_vehicle_integration"]


def sales_reason(audit: dict) -> str:
    """Composed, factual sales-reason sentence(s) for one lead."""
    parts = [p for p in (
        booking_gap_reason(audit), branch_gap_reason(audit), vehicle_lookup_gap_reason(audit),
    ) if p]
    if not parts:
        return "Website heeft al een volledig afsprakensysteem met kentekencheck."
    return " ".join(parts)


_OPENING_LINES = {
    "no_website": (
        "Wij zagen dat {name} nog geen eigen website heeft. Wij kunnen een "
        "moderne website bouwen met een volledig afsprakensysteem en kentekencheck."),
    "basic_contact_form_only": (
        "Op uw website kunnen klanten nu alleen een bericht achterlaten. Wij "
        "kunnen daar een volledig afsprakensysteem aan toevoegen waarin ze "
        "direct een dienst, datum en beschikbaar tijdstip kiezen."),
    "appointment_request_no_calendar": (
        "Klanten kunnen bij u wel een afspraak aanvragen, maar nog geen vrij "
        "tijdstip reserveren. Daardoor blijft de planning handmatig."),
    "no_booking_system": (
        "Wij kunnen voor {name} een online afspraaksysteem toevoegen waarin "
        "klanten zelf een dienst, datum en tijdstip kiezen."),
    "no_vehicle_lookup": (
        "Wij kunnen vóór de afspraak een kentekencheck toevoegen, zodat "
        "voertuiggegevens automatisch worden ingevuld en u minder gegevens "
        "hoeft over te nemen."),
    "no_branch_selection": (
        "Uw klanten kunnen nog niet eerst een vestiging kiezen en daarna "
        "alleen de beschikbaarheid van die locatie bekijken."),
    "advanced": (
        "Uw website heeft al een volledig afsprakensysteem met kentekencheck "
        "— sterk vergeleken met de meeste garages in uw regio."),
}


def recommended_opening_line(audit: dict) -> str:
    """One outbound-sales opening line, chosen by the single most impactful gap."""
    name = audit.get("business_name") or "uw bedrijf"
    if audit.get("has_website") is False:
        return _OPENING_LINES["no_website"].format(name=name)
    real_calendar = bool(audit.get("has_real_booking_calendar"))
    if bool(audit.get("has_appointment_request_form")) and not real_calendar:
        return _OPENING_LINES["appointment_request_no_calendar"]
    if bool(audit.get("has_basic_contact_form")) and not real_calendar:
        return _OPENING_LINES["basic_contact_form_only"]
    if not real_calendar:
        return _OPENING_LINES["no_booking_system"].format(name=name)
    if audit.get("is_multi_location") and not audit.get("can_select_branch"):
        return _OPENING_LINES["no_branch_selection"]
    if not bool(audit.get("has_rdw_or_vehicle_data_integration")):
        return _OPENING_LINES["no_vehicle_lookup"]
    return _OPENING_LINES["advanced"]


def is_garage_audit(audit: dict) -> bool:
    """True when garage booking/vehicle-lookup features were computed for this audit."""
    return "has_basic_contact_form" in audit


def evaluate_lead(audit: dict) -> dict:
    """Score + (for garage audits) opportunity classification/messaging.

    Single entry point for both the CLI CSV export and the dashboard, so the
    two never diverge. Non-garage audits get exactly the same result as calling
    `score_audit()` directly — unchanged behaviour for every other industry.
    """
    if is_garage_audit(audit):
        result = score_garage_audit(audit)
        return {
            "score": result.score,
            "reasons": result.reasons,
            "top_problems": result.top_problems(),
            "website_opportunity_category": classify_opportunity(audit),
            "booking_gap_reason": booking_gap_reason(audit),
            "vehicle_lookup_gap_reason": vehicle_lookup_gap_reason(audit),
            "sales_reason": sales_reason(audit),
            "recommended_opening_line": recommended_opening_line(audit),
        }
    result = score_audit(audit)
    return {"score": result.score, "reasons": result.reasons, "top_problems": result.top_problems()}
