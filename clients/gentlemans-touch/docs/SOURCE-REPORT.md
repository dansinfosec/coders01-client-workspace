# SOURCE REPORT — Gentleman's Touch preview

_Compiled 2026-07-22. Data verified against live sources. Nothing invented._

## Branding mismatch (⚠ must be resolved by owner)

Four different names appear across the sources for what is treated as one business:

| Source | Name shown |
|---|---|
| Google Maps (business listing) | **Gentleman's touch** (💈Gentleman's touch💈) |
| Storefront sign (in a Google photo) | **GENTLEMAN'S TOUCH — Luxury Men's Grooming** |
| Setmore booking account | Two-in-one-barberstudio |
| Logo artwork (Setmore, phone screenshot) | 2&1 Barber Studio · Fusion Pigment Barber Studio |
| Instagram handle (on logo art) | @2in1BarberStudio |

**Decision (per brief):** public brand = **"Gentleman's Touch"** (confirmed by the
Google listing AND the physical storefront sign). All legacy names are kept OUT of
the frontend and appear only in this report.

## Location / contact mismatch (⚠ owner must confirm)

The two sources point to **different locations and phone numbers**:

| Field | Google Maps (used) | Setmore booking page |
|---|---|---|
| Address | **Fransenstraat 27, 3131 CC Vlaardingen** | Visseringlaan 19, 2288 ER Rijswijk |
| Phone | **06 42507856** | +31 6 47747131 |
| Rating | **4.9 (97 reviews)** | 5.0 (2 reviews) |

Per the brief, **Google Maps is authoritative** for address/phone/hours/rating, so the
frontend uses the **Vlaardingen** data. The **Setmore booking flow is kept as-is** for
appointments. The owner must confirm whether Rijswijk is an old/second location.

## Verified data used

**Google Maps (Places API New):**
- Name: Gentleman's touch · Place ID `ChIJ9dhzWrFLxEcR8tiTyHrZhAA`
- Address: Fransenstraat 27, 3131 CC Vlaardingen
- Phone: 06 42507856 → `tel:+31642507856`
- Rating: 4.9 / 97 reviews
- Maps link: `https://maps.google.com/?cid=37393818300176626`
- Opening hours: Mo–Do 09:00–18:00 · Vr 09:00–20:00 · Za 09:00–18:00 · Zo 11:00–17:00
- Website field: none returned

**Setmore (booking source):**
- Services & prices (verified live):
  - Herenknippen — contant **€25**
  - Herenknippen — pinnen **€28**
  - Kinderknippen **€20**
  - Haarpigmentatie — price on request (no bookable product)
  - Tattoo removal — price on request (no bookable product)
- Email: e.rd123@hotmail.com
- Booking base: `https://two-in-one-barberstudio.setmore.com/book` (+ 3 per-service product links)
- Real review text (verbatim): "Super goede kapper, neemt de tijd en maakt het gemakkelijk
  voor kinderen 👍" — Cinderella, 3 jaar geleden. (A second "😎"-only review was omitted.)

**Brand palette — MEASURED from the Setmore logo artwork:**
- black `#000000` · warm cream `#EEE2C2` · deep red `#A31E1F`
- Supporting neutrals (charcoal ramp, warm off-white text, muted grays) ADDED for
  accessibility — see `rebuild/src/index.css`.

## Google Places API usage & cost

| Request | Count | Purpose | Est. cost |
|---|---|---|---|
| Text Search (New), Enterprise+Atmosphere | 2 | 1st returned the wrong same-named shop; a 2nd, location-restricted search returned the correct Vlaardingen business (all fields + photo refs in one response) | ~$0.08 |
| Place Photos (New) | 10 | Downloaded photos to curate the gallery | ~$0.07 |
| **Total** | **12 requests** | | **~$0.15** |

`reviews` field was NOT requested (kept to the specified minimal field mask). API key was
read from `automation/lead-finder/.env` and never printed.

## Photos (TEMPORARY — Google-sourced)

10 downloaded, **8 used** (curated; 2 darker/weaker duplicates dropped). Stored in
`rebuild/public/images/google-preview/` (**git-ignored**), converted to WebP. Attribution
preserved per image (mostly "Gentleman's touch"; one by "Mohammad Karam"). **Must be
replaced with owner-provided originals before production.**

## Still needed from the owner

- Confirm the correct location & phone (Vlaardingen vs Rijswijk).
- Confirm the definitive public brand name + supply a real logo (vector/hi-res).
- Own high-quality photos to replace the temporary Google images.
- Prices for haarpigmentatie & tattoo removal (currently "op aanvraag").
- Confirm email address (Setmore lists a hotmail address).
- Correct/public social media handles.
