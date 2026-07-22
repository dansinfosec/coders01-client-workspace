# Gentleman's Touch — Coders01 preview

Premium local **sales preview** for the barbershop publicly branded **Gentleman's
Touch** (Vlaardingen). Business details (contact/hours/rating/photos) come from
Google Maps; services, prices and the measured brand palette come from the owner's
published materials.

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

- **Public brand:** Gentleman's Touch (Google listing + storefront sign). Other
  names appearing on old logo artwork are **not** shown publicly.
- **Location/contact (Google):** Fransenstraat 27, 3131 CC Vlaardingen · 06 42507856 ·
  4.9 (97 reviews).
- **Booking:** no online booking system is linked yet. Appointment CTAs fall back to
  calling the shop. See `docs/SOURCE-REPORT.md`.
- **Palette (measured from logo):** black `#000000` · cream `#EEE2C2` · red `#A31E1F`.
- **Photos are temporary Google previews** — replace with owner originals before production.

## Run

```powershell
cd C:\Users\dschu\Desktop\coders01-hk-vastgoed-clean\clients\gentlemans-touch\rebuild
npm install
npm run dev        # http://localhost:5173
npm run lint; npm run typecheck; npm run build; npm run preview
```
