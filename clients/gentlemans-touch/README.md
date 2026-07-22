# Gentleman's Touch — Coders01 preview

Premium local **sales preview** for the barbershop publicly branded **Gentleman's
Touch** (Vlaardingen). Built from Google Maps (contact/hours/rating/photos) and
Setmore (services/prices/booking/brand colours).

**Status: local preview only — do not deploy, do not commit yet.**

## Structure

```
gentlemans-touch/
├─ assets/original/      logo + banner screenshots, raw Google photos (git-ignored)
├─ assets/optimized/     (reserved)
├─ docs/                 SOURCE-REPORT.md, places-response.json
├─ rebuild/              React + Vite + TS preview  ← the site
│  └─ public/images/google-preview/   TEMP Google photos (git-ignored)
└─ README.md
```

## Key facts

- **Public brand:** Gentleman's Touch (Google listing + storefront sign). Legacy names
  (Two-in-one-barberstudio, 2&1 Barber Studio, Fusion Pigment) are **not** shown publicly.
- **⚠ Source mismatch:** Google = Vlaardingen / 06 42507856; Setmore booking = Rijswijk /
  different phone. Google is authoritative per brief. See `docs/SOURCE-REPORT.md`.
- **Palette (measured from logo):** black `#000000` · cream `#EEE2C2` · red `#A31E1F`.
- **Photos are temporary Google previews** — replace with owner originals before production.

## Run

```powershell
cd C:\Users\dschu\Desktop\coders01-hk-vastgoed-clean\clients\gentlemans-touch\rebuild
npm install
npm run dev        # http://localhost:5173
npm run lint; npm run typecheck; npm run build; npm run preview
```
