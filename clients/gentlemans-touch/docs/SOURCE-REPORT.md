# SOURCE REPORT — Gentleman's Touch preview

_Compiled 2026-07-22. Data verified against live sources. Nothing invented._

## Brand name

The public brand is **"Gentleman's Touch"**, confirmed by both the Google Maps
business listing and the physical **storefront sign** ("GENTLEMAN'S TOUCH — Luxury
Men's Grooming", visible in a Google photo). The owner's available logo artwork is a
phone screenshot with inconsistent naming and phone UI, so it is **not** used as a
public logo — a temporary text wordmark is used instead. Any other names on that old
artwork are kept out of the frontend.

## Verified business data (Google Maps — Places API New)

- Name: Gentleman's touch · Place ID `ChIJ9dhzWrFLxEcR8tiTyHrZhAA`
- Address: **Fransenstraat 27, 3131 CC Vlaardingen**
- Phone: **06 42507856** → `tel:+31642507856`
- Rating: **4.9 / 97 reviews**
- Maps link: `https://maps.google.com/?cid=37393818300176626`
- Opening hours: Mo–Do 09:00–18:00 · Vr 09:00–20:00 · Za 09:00–18:00 · Zo 11:00–17:00
- Website field: none returned

## Services & prices (owner's published rates)

- Herenknippen — contant **€25**
- Herenknippen — pinnen **€28**
- Kinderknippen **€20**
- Haarpigmentatie — price on request
- Tattoo removal — price on request

## Booking

**No online booking system is linked** for Gentleman's Touch. All appointment
call-to-actions ("Afspraak aanvragen") fall back to calling the shop until the owner
confirms the correct booking system. No external booking page is referenced anywhere
in the frontend.

## Brand palette — MEASURED from the owner's logo artwork

- black `#000000` · warm cream `#EEE2C2` · deep red `#A31E1F`
- Supporting neutrals (charcoal ramp, warm off-white text, muted grays) were ADDED for
  accessibility — see `rebuild/src/index.css`.

## Google Places API usage & cost (historical — no new calls in this cleanup)

| Request | Count | Purpose | Est. cost |
|---|---|---|---|
| Text Search (New), Enterprise+Atmosphere | 2 | 1st returned a wrong same-named shop; a 2nd, location-restricted search returned the correct Vlaardingen business | ~$0.08 |
| Place Photos (New) | 10 | Downloaded photos to curate the gallery | ~$0.07 |
| **Total** | **12 requests** | | **~$0.15** |

API key was read from `automation/lead-finder/.env` and never printed.

## Photos (TEMPORARY — Google-sourced)

10 downloaded, **8 used** (curated). Stored in `rebuild/public/images/google-preview/`,
converted to WebP. Attribution preserved per image (mostly "Gentleman's touch"; one by
"Mohammad Karam"). **Must be replaced with owner-provided originals before production.**

## Still needed from the owner

- Confirm the correct booking system (none is linked yet).
- Supply a real logo (vector / hi-res) to replace the temporary text wordmark.
- Own high-quality photos to replace the temporary Google images.
- Prices for haarpigmentatie & tattoo removal (currently "op aanvraag").
- A public e-mail address to display.
- Correct/public social media handles.
