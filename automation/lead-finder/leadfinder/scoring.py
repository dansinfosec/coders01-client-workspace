"""Explainable opportunity scoring (pure, unit-tested).

Turns a website audit into a 0–100 "redesign opportunity" score. Higher = more
reason to pitch a rebuild. Every rule that fires is recorded with its points and
a human-readable reason, so the score is fully explainable and auditable.
"""

from __future__ import annotations

from dataclasses import dataclass, field


# Each rule: code -> (points, human explanation). Kept as data so the README and
# the dashboard can render the same table the scorer uses.
RULES = {
    "no_website": (100, "Geen website gevonden"),
    "unreachable": (40, "Website onbereikbaar"),
    "server_error": (30, "Herhaalde serverfout (5xx)"),
    "no_https": (15, "Geen HTTPS"),
    "no_mobile_viewport": (15, "Geen mobiele viewport meta-tag"),
    "slow_response": (15, "Reactietijd boven 5 seconden"),
    "no_contact_form": (10, "Geen contact- of offerteformulier"),
    "no_cta": (10, "Geen duidelijke call-to-action"),
    "broken_assets": (10, "Kapotte links of afbeeldingen"),
    "outdated_copyright": (5, "Verouderd copyright-jaartal"),
    "missing_title_or_contact": (5, "Titel of contactgegevens ontbreken"),
}

MAX_SCORE = 100


@dataclass
class ScoreResult:
    score: int
    reasons: list[dict] = field(default_factory=list)

    def top_problems(self, limit: int = 3) -> list[str]:
        ordered = sorted(self.reasons, key=lambda r: r["points"], reverse=True)
        return [r["reason"] for r in ordered[:limit]]

    def as_dict(self) -> dict:
        return {"score": self.score, "reasons": self.reasons}


def _add(reasons, code, detail=None):
    points, text = RULES[code]
    reasons.append({
        "code": code,
        "points": points,
        "reason": text if not detail else f"{text} ({detail})",
    })


def score_audit(audit: dict, current_year: int | None = None) -> ScoreResult:
    """Compute an opportunity score from an audit dict.

    Expected audit keys (all optional; missing => not penalized unless implied):
      has_website (bool), reachable (bool), status_code (int|None),
      server_error (bool), https (bool), mobile_viewport (bool),
      response_time (float seconds), has_contact_form (bool),
      has_cta (bool), broken_links (int), broken_images (int),
      copyright_year (int|None), title (str|None),
      has_visible_phone (bool), has_visible_email (bool).
    """
    from datetime import datetime, timezone

    if current_year is None:
        current_year = datetime.now(timezone.utc).year

    reasons: list[dict] = []

    # No website dominates everything else.
    if not audit.get("has_website", False):
        _add(reasons, "no_website")
        return ScoreResult(score=MAX_SCORE, reasons=reasons)

    # If there IS a website but we couldn't reach it, most content checks are moot.
    if not audit.get("reachable", True):
        _add(reasons, "unreachable", audit.get("unreachable_reason"))
        if audit.get("server_error"):
            _add(reasons, "server_error")
        return ScoreResult(score=_capped(reasons), reasons=reasons)

    if audit.get("server_error"):
        _add(reasons, "server_error")

    if audit.get("https") is False:
        _add(reasons, "no_https")

    if audit.get("mobile_viewport") is False:
        _add(reasons, "no_mobile_viewport")

    rt = audit.get("response_time")
    if rt is not None and rt > 5.0:
        _add(reasons, "slow_response", f"{rt:.1f}s")

    if audit.get("has_contact_form") is False:
        _add(reasons, "no_contact_form")

    if audit.get("has_cta") is False:
        _add(reasons, "no_cta")

    broken = (audit.get("broken_links") or 0) + (audit.get("broken_images") or 0)
    if broken > 0:
        _add(reasons, "broken_assets", f"{broken} kapot")

    cy = audit.get("copyright_year")
    if cy is not None and cy < current_year - 1:
        _add(reasons, "outdated_copyright", str(cy))

    missing_title = not audit.get("title")
    missing_contact = not (audit.get("has_visible_phone") or audit.get("has_visible_email"))
    if missing_title or missing_contact:
        _add(reasons, "missing_title_or_contact")

    return ScoreResult(score=_capped(reasons), reasons=reasons)


def _capped(reasons) -> int:
    return min(MAX_SCORE, sum(r["points"] for r in reasons))


# ---------------------------------------------------------------------------
# Garage (autogarage) opportunity scoring — appointment booking + Dutch
# license-plate/RDW vehicle-data lookup. Additive: `score_audit`/`RULES` above
# are UNCHANGED, so every other industry keeps its exact existing scores.
#
# `score_garage_audit` reuses the same technical checks (unreachable, HTTPS,
# viewport, speed, broken assets, copyright, title/contact) and REPLACES the
# generic "no_contact_form"/"no_cta" checks with booking- and vehicle-lookup-
# aware rules built from the facts in `leadfinder.garage_detect`.
#
# Double-counting is avoided with two explicit design choices:
#   1. Booking-capability "ladder" — exactly ONE of basic_contact_form_only /
#      appointment_request_no_calendar / no_booking_system fires, chosen by
#      severity, never more than one.
#   2. Booking-detail gaps (service/branch/time-slot selection) are only
#      evaluated when a booking-oriented feature (an appointment request or a
#      real calendar) actually exists — a bare contact-form site is already
#      fully captured by the ladder above and does not additionally get
#      penalized for lacking service/time-slot pickers it was never close to
#      having.
#   3. Vehicle-lookup "ladder" — exactly ONE of no_kenteken_input /
#      kenteken_no_lookup_result / no_verified_vehicle_integration fires.
# ---------------------------------------------------------------------------

GARAGE_RULES = {
    # Booking ladder (mutually exclusive — see module docstring).
    "basic_contact_form_only": (25, "Alleen een contactformulier, geen afsprakenmogelijkheid"),
    "appointment_request_no_calendar": (20, "Afspraakformulier zonder live kalender met beschikbare tijden"),
    "no_booking_system": (25, "Geen enkel online afspraaksysteem aanwezig"),
    # Booking-detail gaps (only scored when a booking-oriented feature exists).
    "no_service_selection": (10, "Klant kan geen dienst/onderhoudstype kiezen"),
    "no_branch_selection": (10, "Meerdere vestigingen maar geen vestigingskeuze"),
    "no_selectable_time_slots": (15, "Geen selecteerbare beschikbare tijdstippen"),
    "no_appointment_cta": (10, "Geen duidelijke oproep tot het maken van een afspraak"),
    # Vehicle-lookup ladder (mutually exclusive).
    "no_kenteken_input": (10, "Geen kentekenveld aanwezig"),
    "kenteken_no_lookup_result": (10, "Kentekenveld aanwezig maar geen voertuiggegevens opgehaald"),
    "no_verified_vehicle_integration": (10, "Geen geverifieerde RDW/voertuigdata-koppeling"),
}

# Merged table so garage scoring can reuse the shared technical rule codes
# (unreachable/no_https/…) by name without duplicating their text/points.
GARAGE_ALL_RULES = {**RULES, **GARAGE_RULES}


def _add_from(reasons, table, code, detail=None):
    points, text = table[code]
    reasons.append({
        "code": code,
        "points": points,
        "reason": text if not detail else f"{text} ({detail})",
    })


def score_garage_audit(audit: dict, current_year: int | None = None) -> ScoreResult:
    """Opportunity score for an autogarage audit (booking + vehicle-lookup aware).

    Expects the same technical keys as `score_audit`, PLUS the flat garage facts
    produced by `audit.audit_lead(..., garage_features=True)`:
      has_basic_contact_form, has_appointment_request_form,
      has_real_booking_calendar, can_select_service, can_select_branch,
      can_select_available_time_slot, is_multi_location, has_appointment_cta,
      can_enter_license_plate, has_vehicle_lookup_result,
      has_rdw_or_vehicle_data_integration.
    """
    from datetime import datetime, timezone

    if current_year is None:
        current_year = datetime.now(timezone.utc).year

    reasons: list[dict] = []
    table = GARAGE_ALL_RULES

    if not audit.get("has_website", False):
        _add_from(reasons, table, "no_website")
        return ScoreResult(score=MAX_SCORE, reasons=reasons)

    if not audit.get("reachable", True):
        _add_from(reasons, table, "unreachable", audit.get("unreachable_reason"))
        if audit.get("server_error"):
            _add_from(reasons, table, "server_error")
        return ScoreResult(score=_capped(reasons), reasons=reasons)

    if audit.get("server_error"):
        _add_from(reasons, table, "server_error")
    if audit.get("https") is False:
        _add_from(reasons, table, "no_https")
    if audit.get("mobile_viewport") is False:
        _add_from(reasons, table, "no_mobile_viewport")

    rt = audit.get("response_time")
    if rt is not None and rt > 5.0:
        _add_from(reasons, table, "slow_response", f"{rt:.1f}s")

    broken = (audit.get("broken_links") or 0) + (audit.get("broken_images") or 0)
    if broken > 0:
        _add_from(reasons, table, "broken_assets", f"{broken} kapot")

    cy = audit.get("copyright_year")
    if cy is not None and cy < current_year - 1:
        _add_from(reasons, table, "outdated_copyright", str(cy))

    missing_title = not audit.get("title")
    missing_contact = not (audit.get("has_visible_phone") or audit.get("has_visible_email"))
    if missing_title or missing_contact:
        _add_from(reasons, table, "missing_title_or_contact")

    # --- Booking ladder: exactly one of these three fires ------------------
    real_calendar = bool(audit.get("has_real_booking_calendar"))
    appointment_request = bool(audit.get("has_appointment_request_form"))
    basic_form = bool(audit.get("has_basic_contact_form"))
    if not real_calendar:
        if appointment_request:
            _add_from(reasons, table, "appointment_request_no_calendar")
        elif basic_form:
            _add_from(reasons, table, "basic_contact_form_only")
        else:
            _add_from(reasons, table, "no_booking_system")

    # --- Booking-detail gaps: only when a booking-oriented feature exists --
    booking_present = real_calendar or appointment_request
    if booking_present:
        if not audit.get("can_select_service"):
            _add_from(reasons, table, "no_service_selection")
        if audit.get("is_multi_location") and not audit.get("can_select_branch"):
            _add_from(reasons, table, "no_branch_selection")
        if not audit.get("can_select_available_time_slot"):
            _add_from(reasons, table, "no_selectable_time_slots")

    if not audit.get("has_appointment_cta"):
        _add_from(reasons, table, "no_appointment_cta")

    # --- Vehicle-lookup ladder: exactly one of these three fires -----------
    plate = bool(audit.get("can_enter_license_plate"))
    lookup_result = bool(audit.get("has_vehicle_lookup_result"))
    integration = bool(audit.get("has_rdw_or_vehicle_data_integration"))
    if not plate:
        _add_from(reasons, table, "no_kenteken_input")
    elif not lookup_result:
        _add_from(reasons, table, "kenteken_no_lookup_result")
    elif not integration:
        _add_from(reasons, table, "no_verified_vehicle_integration")

    return ScoreResult(score=_capped(reasons), reasons=reasons)
