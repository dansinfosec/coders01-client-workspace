# CURRENT-SITE-AUDIT — all-indaktechniek.nl

_Onderzocht met Claude Browser op 2026-07-21. Alleen publieke pagina's; niets gewijzigd._

## Technisch profiel

| Aspect | Bevinding |
|---|---|
| Platform | WordPress |
| Page builder | WPBakery Page Builder (meta `generator`) |
| SEO-plugin | Yoast SEO (robots.txt YOAST-block, `sitemap_index.xml`) |
| JS-framework | jQuery aanwezig |
| Assets | **11 CSS-bestanden + 12 JS-bestanden** op de homepage (zwaar voor een kleine site) |
| Analytics | Google Analytics / gtag **aanwezig** |
| Cookiebanner | **Geen** — analytics laadt zonder toestemming (AVG-risico) |
| Google Maps | Niet ingebed |
| Structured data | Yoast `WebPage`/`WebSite` JSON-LD — **geen `LocalBusiness`/`RoofingContractor`** |
| Taal | `nl-NL`, viewport correct |
| Laatste sitemap-update | page-sitemap 2023-12-14; projecten 2021-02 |

## Grootste problemen

1. **Onafgemaakte / verwaarloosde indruk.**
   - `<title>` homepage = `All-in Daktechniek - De Dakdekker met ervaring. ☎ nummer.`
     — het woord **"nummer." is een niet-ingevulde placeholder**.
   - Hero-afbeelding heeft `alt="Lorem ipsum"`.
   - Copyright-jaar verschilt per pagina: **2018, 2020, 2021** door elkaar.
   - Meerdere spelfouten in de kopij (`vershillende`, `geshikt`, `elastich`).

2. **SEO vrijwel afwezig.** Geen enkele pagina heeft een `meta description`. Geen
   `LocalBusiness`-schema, geen NAP-structuur voor Google, geen Google Maps. Voor een
   lokaal dakdekkersbedrijf is dit de grootste gemiste kans. Zie `SEO-AUDIT.md`.

3. **Zwakke informatiearchitectuur.**
   - "Diensten" in de navigatie linkt naar `#` (geen dienstenoverzicht-pagina).
   - Er is **geen "Over ons"-pagina**; het bedrijfsverhaal staat alleen als blok op de
     homepage.
   - Er is **geen "Werkgebied"-pagina**, terwijl lokale vindbaarheid een kerndoel is.
   - "Projecten" toont 3 vrijwel lege detailpagina's (alleen een titel + enkele foto's).

4. **Conversie onduidelijk.** Er staan drie losse formulieren ("Direct contact!",
   "Belverzoek", contactformulier) verspreid en dubbel op pagina's, zonder één heldere
   primaire CTA. Telefoon staat bovenaan maar zonder opvallende bel/WhatsApp-knop op
   mobiel.

5. **Prestaties & techniek.** Zware WordPress + WPBakery + jQuery-stack, veel
   losse CSS/JS-requests, ongecomprimeerde JPG-sliders (elk ± 1456×971). Trage,
   render-blocking laadervaring op mobiel te verwachten.

6. **Vertrouwen niet benut.** Reële troeven (VCA, 12 jaar garantie, team van 6,
   Facebook) staan verstopt in lopende tekst i.p.v. als vertrouwenselementen.

7. **Rest-/ruisverwijzing.** In footer/menu verschijnt **"Frisse Zonwering"** — relatie
   onduidelijk (zustermerk? oude link?). Markeren voor Borre.

## Mobiel gedrag

- Viewport-meta correct; layout schaalt mee. Bij smalle breedte (280 px) bleven de
  formuliervelden bruikbaar, maar de vele losse secties en dubbele formulieren maken
  de pagina lang en rommelig. Geen zichtbare sticky bel/WhatsApp-actie.
- Definitieve Core Web Vitals niet gemeten; op basis van de asset-zwaarte is een zwakke
  mobiele LCP aannemelijk. (Meting optioneel later.)

## Wat behouden / herschrijven / samenvoegen / verwijderen

| Onderdeel | Advies |
|---|---|
| Bedrijfsgegevens (NAP, KvK) | **Behouden** — exact overnemen |
| Dienstteksten (7 pagina's) | **Herschrijven** — inhoud is bruikbaar, spelling/toon oppoetsen, feiten intact |
| Losse "Belverzoek"/"Direct contact"-formulieren | **Samenvoegen** tot één offerteformulier + belknop |
| "Diensten → #" | **Vervangen** door echte dienstenoverzicht-pagina |
| Ontbrekende "Over ons" | **Nieuw** — op basis van bestaand homepage-blok |
| Ontbrekende "Werkgebied" | **Nieuw** — lokale SEO (regio bevestigen door Borre) |
| Projecten (3 lege detailpagina's) | **Samenvoegen** tot één sterke projectgalerij met echte foto's |
| Placeholder-title / Lorem ipsum / spelfouten | **Verwijderen/corrigeren** |
| "Frisse Zonwering"-verwijzing | **Verwijderen** tot Borre de relatie bevestigt |
| Google Analytics zonder consent | **Vervangen** door consent-vriendelijke opzet (later) |
