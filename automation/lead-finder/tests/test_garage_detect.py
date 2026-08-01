"""Tests for appointment-booking and Dutch kenteken/RDW vehicle-lookup
detection. No network, no real form submission — static HTML only.

Covers the exact distinctions the feature exists for:
  * a generic contact form is NOT a booking calendar;
  * a bare <input type="date"> is NOT a booking calendar;
  * a "preferred time" TEXT field is NOT a selectable time slot;
  * service + date + real selectable time slots together ARE a booking calendar;
  * a kenteken input alone is NOT an RDW/vehicle lookup;
  * a kenteken input that returns vehicle data IS a vehicle lookup;
  * every positive detection stores evidence.
"""

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from leadfinder.garage_detect import (  # noqa: E402
    detect_booking, detect_vehicle_lookup, merge_booking, merge_vehicle,
    find_booking_links,
)

# --- Fixtures ----------------------------------------------------------------

BASIC_CONTACT_FORM = """<!doctype html><html><body>
<h1>Contact</h1>
<form action="/verstuur" method="post">
  <input type="text" name="naam" placeholder="Naam">
  <input type="email" name="email" placeholder="E-mail">
  <input type="tel" name="telefoon" placeholder="Telefoon">
  <textarea name="bericht" placeholder="Uw bericht"></textarea>
  <button type="submit">Versturen</button>
</form></body></html>"""

DATE_INPUT_ONLY_FORM = """<!doctype html><html><body>
<h1>Contact</h1>
<form>
  <input type="text" name="naam">
  <input type="date" name="datum">
  <button type="submit">Versturen</button>
</form></body></html>"""

APPOINTMENT_REQUEST_PREFERRED_TIME = """<!doctype html><html><body>
<h1>Afspraak aanvragen</h1>
<form action="/afspraak">
  <input type="text" name="naam" placeholder="Naam">
  <input type="tel" name="telefoon" placeholder="Telefoon">
  <input type="text" name="voorkeurstijd" placeholder="Gewenste tijd">
  <button type="submit">Afspraak aanvragen</button>
</form></body></html>"""

REAL_BOOKING_CALENDAR = """<!doctype html><html><body>
<h1>Plan uw afspraak</h1>
<form action="/boeken">
  <select name="dienst">
    <option value="">Kies uw dienst</option>
    <option value="apk">APK keuring</option>
    <option value="onderhoud">Onderhoud</option>
  </select>
  <input type="date" name="datum">
  <div class="beschikbare-tijden">
    <button type="button" data-time="09:00">09:00</button>
    <button type="button" data-time="10:30">10:30</button>
    <button type="button" data-time="13:00">13:00</button>
  </div>
  <button type="submit">Bevestig afspraak</button>
</form></body></html>"""

# "Afspraak maken" link that only opens a contact form — must NOT count as a
# real calendar, per the explicit rule in the brief.
FAKE_APPOINTMENT_LINK = """<!doctype html><html><body>
<a href="/contact">Afspraak maken</a>
</body></html>"""

MULTI_LOCATION_NO_BRANCH = """<!doctype html><html><body>
<h1>Onze vestigingen</h1>
<p>Wij hebben meerdere vestigingen in de regio.</p>
<form action="/afspraak">
  <select name="dienst"><option>APK</option><option>Onderhoud</option></select>
  <input type="date" name="datum">
  <div class="beschikbare-tijden">
    <button type="button">09:00</button><button type="button">10:00</button>
  </div>
  <button>Bevestig</button>
</form></body></html>"""

CALENDLY_EMBED = """<!doctype html><html><body>
<div class="calendly-inline-widget" data-url="https://calendly.com/mijngarage/apk"></div>
<script src="https://assets.calendly.com/assets/external/widget.js"></script>
</body></html>"""

KENTEKEN_ALONE = """<!doctype html><html><body>
<form>
  <input type="text" name="kenteken" placeholder="Kenteken">
  <input type="text" name="naam">
  <button type="submit">Verzenden</button>
</form></body></html>"""

KENTEKEN_WITH_VEHICLE_RESULT = """<!doctype html><html><body>
<input type="text" id="kenteken" placeholder="Kenteken">
<button onclick="checkKenteken()">Zoek voertuig</button>
<div id="voertuig-resultaat">
  <p>Merk: Volkswagen</p>
  <p>Model: Golf</p>
  <p>Brandstof: Benzine</p>
  <p>Bouwjaar: 2019</p>
</div>
<script>function checkKenteken(){ fetch('/api/kenteken?plate=1'); }</script>
</body></html>"""

RDW_API_INTEGRATION = """<!doctype html><html><body>
<input type="text" name="kenteken" placeholder="Kenteken">
<script>fetch('https://opendata.rdw.nl/resource/m9d7-ebf2.json?kenteken='+plate);</script>
</body></html>"""

WORDS_ONLY_NO_LOOKUP = """<!doctype html><html><body>
<h1>Wij checken uw APK en RDW-gegevens</h1>
<p>Bel ons voor een kenteken-check en APK advies.</p>
</body></html>"""

NO_FORM_NO_CTA = """<!doctype html><html><body>
<h1>Welkom</h1><p>Bel ons op 010 1234567.</p></body></html>"""


class TestBasicContactFormNotBookingCalendar(unittest.TestCase):
    def test_basic_form_detected_as_basic(self):
        r = detect_booking(BASIC_CONTACT_FORM)
        self.assertTrue(r["has_basic_contact_form"])
        self.assertFalse(r["has_appointment_request_form"])
        self.assertFalse(r["has_real_booking_calendar"])

    def test_basic_form_has_no_availability_signals(self):
        r = detect_booking(BASIC_CONTACT_FORM)
        self.assertFalse(r["can_select_service"])
        self.assertFalse(r["can_select_available_time_slot"])


class TestDateInputAloneIsNotCalendar(unittest.TestCase):
    def test_date_field_present_but_not_a_calendar(self):
        r = detect_booking(DATE_INPUT_ONLY_FORM)
        self.assertTrue(r["can_select_date"])           # the field exists
        self.assertFalse(r["has_real_booking_calendar"])  # but it proves nothing alone
        self.assertFalse(r["can_select_available_time_slot"])

    def test_date_field_does_not_upgrade_basic_form(self):
        r = detect_booking(DATE_INPUT_ONLY_FORM)
        # No appointment/quote intent -> still classified as a basic contact form.
        self.assertTrue(r["has_basic_contact_form"])


class TestPreferredTimeTextFieldIsNotASlot(unittest.TestCase):
    def test_preferred_time_is_appointment_request_not_calendar(self):
        r = detect_booking(APPOINTMENT_REQUEST_PREFERRED_TIME)
        self.assertTrue(r["has_appointment_request_form"])
        self.assertFalse(r["has_real_booking_calendar"])

    def test_preferred_time_text_field_is_not_a_selectable_slot(self):
        r = detect_booking(APPOINTMENT_REQUEST_PREFERRED_TIME)
        self.assertFalse(r["can_select_available_time_slot"])

    def test_appointment_request_does_not_also_count_as_basic_form(self):
        r = detect_booking(APPOINTMENT_REQUEST_PREFERRED_TIME)
        self.assertFalse(r["has_basic_contact_form"])


class TestRealBookingCalendar(unittest.TestCase):
    def test_service_date_and_selectable_slots_is_a_real_calendar(self):
        r = detect_booking(REAL_BOOKING_CALENDAR)
        self.assertTrue(r["can_select_service"])
        self.assertTrue(r["can_select_date"])
        self.assertTrue(r["can_select_available_time_slot"])
        self.assertTrue(r["has_real_booking_calendar"])

    def test_real_calendar_is_not_also_flagged_as_basic_or_request(self):
        r = detect_booking(REAL_BOOKING_CALENDAR)
        self.assertFalse(r["has_basic_contact_form"])
        self.assertFalse(r["has_appointment_request_form"])

    def test_appointment_link_to_contact_form_is_not_a_calendar(self):
        r = detect_booking(FAKE_APPOINTMENT_LINK)
        self.assertTrue(r["has_appointment_cta"])
        self.assertFalse(r["has_real_booking_calendar"])

    def test_known_booking_provider_is_a_real_calendar(self):
        r = detect_booking(CALENDLY_EMBED)
        self.assertEqual(r["booking_provider"], "calendly")
        self.assertTrue(r["has_real_booking_calendar"])
        self.assertTrue(r["can_select_available_time_slot"])

    def test_multi_location_without_branch_selection_detected(self):
        r = detect_booking(MULTI_LOCATION_NO_BRANCH)
        self.assertTrue(r["is_multi_location"])
        self.assertFalse(r["can_select_branch"])
        self.assertTrue(r["has_real_booking_calendar"])  # calendar itself still real


class TestKentekenAloneIsNotRdwLookup(unittest.TestCase):
    def test_plate_field_detected(self):
        r = detect_vehicle_lookup(KENTEKEN_ALONE)
        self.assertTrue(r["can_enter_license_plate"])

    def test_no_result_no_integration(self):
        r = detect_vehicle_lookup(KENTEKEN_ALONE)
        self.assertFalse(r["has_vehicle_lookup_result"])
        self.assertFalse(r["has_rdw_or_vehicle_data_integration"])

    def test_words_rdw_apk_kenteken_alone_prove_nothing(self):
        r = detect_vehicle_lookup(WORDS_ONLY_NO_LOOKUP)
        self.assertFalse(r["can_enter_license_plate"])
        self.assertFalse(r["has_vehicle_lookup_result"])
        self.assertFalse(r["has_rdw_or_vehicle_data_integration"])


class TestKentekenWithVehicleDataIsALookup(unittest.TestCase):
    def test_plate_plus_returned_attributes_is_a_result(self):
        r = detect_vehicle_lookup(KENTEKEN_WITH_VEHICLE_RESULT)
        self.assertTrue(r["can_enter_license_plate"])
        self.assertTrue(r["has_vehicle_lookup_result"])
        self.assertTrue(r["has_rdw_or_vehicle_data_integration"])

    def test_named_rdw_api_is_strong_evidence(self):
        r = detect_vehicle_lookup(RDW_API_INTEGRATION)
        self.assertEqual(r["vehicle_lookup_provider"], "rdw_opendata")
        self.assertTrue(r["has_vehicle_lookup_result"])
        self.assertTrue(r["has_rdw_or_vehicle_data_integration"])


class TestEvidenceStoredForEveryPositive(unittest.TestCase):
    def test_booking_evidence_present_for_real_calendar(self):
        r = detect_booking(REAL_BOOKING_CALENDAR)
        self.assertTrue(r["booking_evidence"])
        for item in r["booking_evidence"]:
            self.assertIn("signal", item)
            self.assertIn("matched_selector", item)

    def test_booking_evidence_present_for_basic_form(self):
        r = detect_booking(BASIC_CONTACT_FORM)
        self.assertTrue(r["booking_evidence"])
        signals = {e["signal"] for e in r["booking_evidence"]}
        self.assertIn("basic_contact_form", signals)

    def test_vehicle_evidence_present_for_lookup(self):
        r = detect_vehicle_lookup(KENTEKEN_WITH_VEHICLE_RESULT)
        self.assertTrue(r["vehicle_lookup_evidence"])
        signals = {e["signal"] for e in r["vehicle_lookup_evidence"]}
        self.assertTrue({"plate_input", "vehicle_result_container", "vehicle_attributes"} & signals)

    def test_no_evidence_when_nothing_detected(self):
        r = detect_booking(NO_FORM_NO_CTA)
        self.assertEqual(r["booking_evidence"], [])
        self.assertFalse(r["has_basic_contact_form"])
        self.assertFalse(r["has_appointment_cta"])


class TestMergeAcrossPages(unittest.TestCase):
    def test_merge_booking_upgrades_basic_to_real_calendar(self):
        homepage = detect_booking(BASIC_CONTACT_FORM)
        booking_page = detect_booking(REAL_BOOKING_CALENDAR)
        merged = merge_booking(homepage, booking_page)
        self.assertTrue(merged["has_real_booking_calendar"])
        self.assertFalse(merged["has_basic_contact_form"])  # demoted once real calendar found
        self.assertGreater(len(merged["booking_evidence"]),
                           len(homepage["booking_evidence"]))

    def test_merge_vehicle_combines_facts(self):
        page1 = detect_vehicle_lookup(KENTEKEN_ALONE)
        page2 = detect_vehicle_lookup(KENTEKEN_WITH_VEHICLE_RESULT)
        merged = merge_vehicle(page1, page2)
        self.assertTrue(merged["can_enter_license_plate"])
        self.assertTrue(merged["has_vehicle_lookup_result"])
        self.assertTrue(merged["has_rdw_or_vehicle_data_integration"])


class TestFindBookingLinks(unittest.TestCase):
    def test_finds_afspraak_link(self):
        html = '<a href="/afspraak-maken">Maak een afspraak</a><a href="/over-ons">Over ons</a>'
        links = find_booking_links(html, "https://garage.nl/")
        self.assertIn("https://garage.nl/afspraak-maken", links)
        self.assertNotIn("https://garage.nl/over-ons", links)

    def test_stays_on_same_host(self):
        html = '<a href="https://external.nl/afspraak">Afspraak</a>'
        links = find_booking_links(html, "https://garage.nl/")
        self.assertEqual(links, [])


if __name__ == "__main__":
    unittest.main()
