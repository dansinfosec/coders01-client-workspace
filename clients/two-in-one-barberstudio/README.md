# Two in one barberstudio — Coders01 preview

Premium local **sales preview** for **Two in one barberstudio**, a barbershop in
**Rijswijk** (Visseringlaan 19). Business details (NAP / hours / rating / reviews /
photos) come from the **verified** Google Maps listing; services, prices, booking links
and the measured brand palette come from Setmore.

**Status: local preview only — do not deploy, commit or push yet.**

## Structure

```
two-in-one-barberstudio/
├─ assets/original/      banner + logo screenshots, raw Google photos (git-ignored)
├─ assets/optimized/     (reserved)
├─ docs/                 SOURCE-REPORT.md (+ git-ignored API responses)
├─ rebuild/              React + Vite + TS preview  ← the site
│  └─ public/images/google-preview/   7 optimized WebP (tracked) + raw (ignored)
└─ README.md
```

## Key facts (verified)

- **Brand:** Two in one barberstudio.
- **Address:** Visseringlaan 19, 2288 ER Rijswijk.
- **Phone (Google):** 06 48539573 · **Rating:** 5.0 (45 reviews).
- **Hours:** Ma 12–20 · Di–Za 10–20 · Zo gesloten.
- **Booking:** real Setmore links (per-service + general).
- **Palette (measured from logo):** black `#000000` · cream `#EEE2C2` · red `#A31E1F`.
- Photos are temporary Google previews — replace with owner originals for production.

## Run

```powershell
cd C:\Users\dschu\Desktop\coders01-hk-vastgoed-clean\clients\two-in-one-barberstudio\rebuild
npm install
npm run dev        # http://localhost:5173
npm run lint; npm run typecheck; npm run build; npm run preview
```
