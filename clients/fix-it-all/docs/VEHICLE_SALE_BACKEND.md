# Auto verkopen — van mock-service naar productiebackend

_Verplichte deliverable (audit §12). Beschrijft hoe de auto-verkoopmodule van de frontend-mock
overgaat naar een echte lead-intake, **zonder** componentwijzigingen._

## Huidige architectuur (MVP)

```
AutoVerkopenPage ─▶ services/vehicleSaleService.ts (MOCK) ─▶ console.info (niets opgeslagen)
foto's ─▶ lib/image.ts (compressie + EXIF-GPS-strip, client-side)
```

- `VEHICLE_SALE_IS_MOCK = true`; de UI toont expliciet dat er niets echt wordt opgeslagen/verzonden.
- Servicefuncties (signatures blijven identiek na migratie):
  - `submitVehicleSaleLead(payload): Promise<VehicleSaleResult>`
  - `uploadVehicleSalePhotos(photos, onProgress): Promise<{ uploaded, mock }>`
  - `getVehicleSaleLead(referenceNumber): Promise<VehicleSaleResult | null>`
- Foto's worden **in de browser** verkleind (max. 1600px, JPEG q0.8) en van EXIF-metadata
  (incl. GPS) ontdaan door her-encodering via `<canvas>` — privacy-by-design. HEIC/HEIF die de
  browser niet kan decoderen wordt ongewijzigd doorgegeven met de melding "server-side converteren".

## Harde productregels (blijven gelden)
- **Geen prijsbeloftes.** Nooit: direct/gegarandeerd bod, automatische taxatie, "hoogste prijs",
  "bod binnen X minuten", gegarandeerde aankoop. Primaire CTA: *"Vraag een vrijblijvend bod aan"*.
- Verplichte privacytoestemming vóór verzenden. Geen automatische marketingtoestemming.
- Reactietermijn alleen tonen als Ali die zelf bevestigt (nu bewust niet getoond).

## Doelarchitectuur (fase 8 — ná MVP-akkoord)

Stack: **Django + DRF + PostgreSQL + externe object-storage (Cloudflare R2) + transactionele e-mail.**
Foto's **niet** permanent op Vercel/Render-fs.

### Endpoints

| Servicefunctie | HTTP | Endpoint |
|---|---|---|
| `submitVehicleSaleLead` | POST | `/api/vehicle-sale-leads/` |
| `uploadVehicleSalePhotos` | POST | `/api/vehicle-sale-leads/:ref/photos/` (multipart) |
| `getVehicleSaleLead` | GET | `/api/vehicle-sale-leads/:ref/` |

### Modellen
- **VehicleSaleLead**: `id, referenceNumber, status, RDW-data, mileage, condition (JSON),
  damageDescription, expectedPrice, saleTiming, customerName, phone, email, postcode, city,
  customerType, preferredContactMoment, whatsappOptIn, consentTimestamp, source, createdAt, updatedAt`.
- **VehicleSalePhoto**: `lead (fk), storageKey, contentType, width, height, sortIndex, createdAt`.
- **VehicleSaleNote**: `lead (fk), author, body, createdAt` (interne notities).

### Statussen
`nieuw · foto's ontbreken · te beoordelen · contact opgenomen · bod uitgebracht · afspraak gepland ·
geaccepteerd · afgewezen · ingetrokken · afgerond`.

### Beheer (Django Admin, voor Ali)
Aanvragen bekijken/zoeken/filteren/exporteren; alle voertuig- en fotogegevens; klikbaar
telefoonnummer; interne notities; status wijzigen; **intern bodbedrag** (nooit klantzichtbaar);
datum telefonisch contact. **Geen** automatische taxatiemodule.

### Meldingen
- Ali: e-mail met referentienummer + voertuig/km/telefoon/#foto's + **beveiligde** admin-link.
- Klant: ontvangstbevestiging (referentienummer). Foto's als beveiligde links, geen zware bijlagen.

### Veiligheid & privacy
Bestandstypecontrole front + back, max. grootte, rate limiting, spam-/malwarecontrole waar mogelijk,
unieke bestandsnamen, geen public directory listing, tijdelijke beveiligde image-URL's, verwijderbeleid,
privacyverklaring met bewaartermijn. **Geen kenteken/klantdata in publieke URL's of logs.**

## Migratiestappen
1. Bouw backend + endpoints; JSON-contract = `VehicleSalePayload` / `VehicleSaleResult`
   (`src/services/vehicleSaleService.ts`).
2. Vervang de mock-implementaties door `fetch()`-calls met dezelfde signatures; zet
   `VEHICLE_SALE_IS_MOCK = false` en verwijder de demo-melding in de UI.
3. `uploadVehicleSalePhotos`: stuur de al gecomprimeerde `ProcessedImage.file`-blobs als multipart;
   `onProgress` koppelen aan `XMLHttpRequest.upload.onprogress` voor echte voortgang.
4. Server-side: HEIC/HEIF converteren, EXIF nogmaals strippen (defensief), thumbnails genereren.
5. E-mail + Admin inrichten; end-to-end test van intake → melding → statusbeheer.
