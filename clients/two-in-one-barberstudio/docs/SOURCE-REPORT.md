# SOURCE REPORT — Two in one barberstudio preview

_Compiled 2026-07-22. Data verified against live sources. Nothing invented._

## Verification gate (passed before any photo download)

The Places API result was checked against the supplied Maps URL **before** downloading
photos:

| Check | Expected | Returned | OK |
|---|---|---|---|
| displayName | Two in one barberstudio | Two in one barberstudio | ✅ |
| address | Visseringlaan 19 / Rijswijk | Visseringlaan 19, 2288 ER Rijswijk | ✅ |
| coordinates | 52.0379497, 4.3328132 | 52.037950, 4.332813 (Δ ≈ 0) | ✅ |

Place ID `ChIJLetXr0y3xUcRdmjVD5Cqb9U`.

## Verified business data (Google Maps — Places API New)

- Name: **Two in one barberstudio**
- Address: **Visseringlaan 19, 2288 ER Rijswijk**
- Phone: **06 48539573** → `tel:+31648539573`
  - (The Setmore page lists a different number; Google is authoritative for NAP.)
- Rating: **5.0 / 45 reviews**
- Maps link: `https://maps.google.com/?cid=15379698788211189878`
- Opening hours: Ma 12:00–20:00 · Di–Za 10:00–20:00 · Zo gesloten
- 4 real Google review texts used (verbatim) in the Reviews section.

## Services & prices — SOURCE: Setmore (verified live)

Setmore labels → presented as: Herenknippen (contant) **€25** · Herenknippen (pinnen)
**€28** · Kinderknippen **€20** · Haarpigmentatie (op aanvraag) · Tattoo removal
(op aanvraag). Each priced service links to its **real** Setmore booking product.
Booking base: `https://two-in-one-barberstudio.setmore.com/book`. Email:
`e.rd123@hotmail.com`.

## Brand palette — MEASURED from the Setmore logo artwork

- black `#000000` · warm cream `#EEE2C2` · deep red `#A31E1F`
- Supporting neutrals (charcoal ramp, warm off-white text, muted grays) ADDED for
  accessibility — see `rebuild/src/index.css`.

## Google Places API usage & cost

| Request | Count | SKU | Est. cost |
|---|---|---|---|
| Text Search (New) — location-restricted, verified | 1 | Enterprise + Atmosphere | ~$0.04 |
| Place Photos (New) | 8 | Place Photo | ~$0.06 |
| **Total** | **9 requests** | | **~$0.10** |

`reviews` field WAS requested this time (real reviews needed). API key was read from
`automation/lead-finder/.env` and never printed.

## Photos

**8 downloaded** from the verified listing; **7 selected**. Excluded: one photo that is
a logo graphic bearing a phone number conflicting with the verified Google NAP (not a
shop/work photo). Hero = shop interior. All converted to WebP, descriptive filenames,
attribution preserved (owner + individual Google contributors). Verified every selected
photo belongs to the Rijswijk listing. **No images from the incorrect Vlaardingen
business were used.**

## Still needed from the owner

- Real logo (vector / hi-res) to replace the temporary text wordmark.
- Own high-quality photos to replace the temporary Google images.
- Confirm the correct public phone (Google vs the Setmore-listed number).
- Prices for haarpigmentatie & tattoo removal (currently "op aanvraag").
- Public social media handles.
