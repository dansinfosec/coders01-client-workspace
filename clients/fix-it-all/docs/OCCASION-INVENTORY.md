# Fix-it All — Occasion-inventaris (live voorraad)

_Crawl 2026-07-30. **Bron van waarheid:** de Autodealers.nl-voorraadplugin die fix-itall.nl
embeddt (dealer-id **5359**). De WordPress-pagina `/occasions/` laadt deze voorraad via een
iframe `https://svl.autodealers.nl/occasions.aspx?did=5359` (JS/Angular). Vandaar dat een
gewone HTML/sitemap-crawl de auto's niet zag — de eerdere "2 occasions" was onjuist._

## Ontdekkingsketen

1. `robots.txt` → `wp-sitemap.xml` (WordPress core, geen Yoast-index).
2. `wp-sitemap-posts-product-1.xml` (WooCommerce) → **1** product (legacy VW Polo 2011).
3. `wp-json/wc/store/v1/products` → bevestigt: 1 WooCommerce-product.
4. `wp-json/wp/v2/types` → geen occasion-CPT in REST (autodealers-plugin niet in REST).
5. HTML van `/occasions/` → `<script src="…/autodealers/custom-jquery.js">` + externe
   `//svl.autodealers.nl/jsVoorraadPlugin.ashx?did=5359` (iframe-loader).
6. Loader-JS → iframe `//svl.autodealers.nl/occasions.aspx?did=5359&zoek=1`.
7. Die lijst + paginering (`pagesize=96`) → **25 voertuigen**; elke `…/details.aspx` bevat de
   specs in `data-*`-attributen en foto-ID's op `media-cdn.vwe.nl/Images/<id>`.

## Volledige voorraad: **25 voertuigen** (allemaal opgenomen in de rebuild)

| # | Titel | Bouwjaar | Prijs | Km | Brandstof | Transmissie | Kenteken | Foto's | Slug |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Audi A3 Limousine 2.0 TDI Sport Pro Line S | 2018 | € 15.500 | 199.119 | Diesel | Automaat | P-422-DD | 15 | `audi-a3-limousine-2-0-tdi-sport-pro-line-s` |
| 2 | Bmw 3-serie Touring 320i Business Line | 2009 | € 4.500 | 304.072 | Benzine | Handmatig | 00-HTD-1 | 10 | `bmw-3-serie-touring-320i-business-line` |
| 3 | Fiat 290 | 1994 | € 8.500 | 71.846 | Diesel | — | 24-VJ-KX | 21 | `fiat-290` |
| 4 | Fiat DOBLO CARGO/Camper | 2008 | € 4.750 | 153.378 | Benzine | Handmatig | VPX-39-K | 11 | `fiat-doblo-cargo-camper` |
| 5 | Fiat Grande Punto 1.2 Active | 2008 | € 1.750 | 216.112 | Benzine | Handmatig | 27-ZK-TZ | 15 | `fiat-grande-punto-1-2-active` |
| 6 | Ford Transit Westfalia Nugget Kampeerauto | 1992 | € 2.500 | 1.336 | Diesel | Handmatig | 11-HX-VK | 12 | `ford-transit-westfalia-nugget-kampeerauto` |
| 7 | Hyundai I 10 M52CZ1 | 2009 | € 1.300 | 250.935 | Diesel | Handmatig | NP-804-J | 12 | `hyundai-i-10-m52cz1` |
| 8 | Mazda Cx-5 2.0 S 2WD | 2012 | € 5.500 | op aanvraag | Diesel | Handmatig | — | 10 | `mazda-cx-5-2-0-s-2wd` |
| 9 | Mercedes-Benz 190-serie 2.0 E | 1992 | € 3.250 | 412.304 | Benzine | Handmatig | FT-NP-28 | 11 | `mercedes-benz-190-serie-2-0-e` |
| 10 | Opel Vivaro 1.9 DI L2H1 | 2003 | € 2.250 | 260.147 | Diesel | Handmatig | 74-BG-TX | 9 | `opel-vivaro-1-9-di-l2h1` |
| 11 | Peugeot 207 1.4 VTi XS Pack | 2008 | € 1.995 | 181.820 | Benzine | Handmatig | 10-GXP-2 | 12 | `peugeot-207-1-4-vti-xs-pack` |
| 12 | Peugeot 207 1.6 VTi XS Pack | 2008 | € 1.249 | 281.832 | Benzine | Handmatig | 10-GHG-2 | 9 | `peugeot-207-1-6-vti-xs-pack` |
| 13 | Peugeot 307 Cc 2.0- 16V | 2007 | € 2.000 | 153.414 | Benzine | Handmatig | 62-TP-PN | 11 | `peugeot-307-cc-2-0-16v` |
| 14 | Peugeot Partner 120 1.6 BlueHDi 75 L1 Première | 2017 | € 5.250 | 232.422 | Diesel | Handmatig | V-603-DK | 14 | `peugeot-partner-120-1-6-bluehdi-75-l1-premiere` |
| 15 | Renault Master T33 2.5dCi L2H2 | 2004 | € 3.000 | 190.809 | Diesel | Handmatig | 37-BL-FH | 12 | `renault-master-t33-2-5dci-l2h2` |
| 16 | Renault Mégane 1.5 dCi Expression | 2011 | € 2.000 | 314.562 | Diesel | Handmatig | 6-VKL-14 | 10 | `renault-megane-1-5-dci-expression` |
| 17 | Seat Ibiza 1.6i Vigo | 1998 | € 850 | 199.710 | Benzine | Automaat | TS-XG-70 | 10 | `seat-ibiza-1-6i-vigo` |
| 18 | Skoda Octavia Combi 1.6 TDI Elegance Business Line | 2011 | € 3.250 | 445.040 | Diesel | Automaat | 26-RTF-1 | 10 | `skoda-octavia-combi-1-6-tdi-elegance-business-line` |
| 19 | Toyota Yaris 1.3 VVTi Idols | 2008 | € 2.850 | 244.946 | Benzine | Handmatig | GD-686-Z | 10 | `toyota-yaris-1-3-vvti-idols` |
| 20 | Volkswagen Caddy 1.6 TDI | 2013 | € 5.000 | 119.127 | Diesel | Handmatig | VB-163-D | 11 | `volkswagen-caddy-1-6-tdi` |
| 21 | Volkswagen Crafter 30 2.5 TDI L2H2 | 2009 | € 5.000 | 277.340 | Diesel | Handmatig | 8-VZR-34 | 10 | `volkswagen-crafter-30-2-5-tdi-l2h2` |
| 22 | Volkswagen Polo 1.2 TDI BlueMotion | 2014 | € 2.200 | 333.056 | Diesel | Handmatig | 2-SZB-60 | 13 | `volkswagen-polo-1-2-tdi-bluemotion` |
| 23 | Volkswagen Touran 1.6- 16V FSI | 2003 | € 1.000 | 250.063 | Benzine | Handmatig | 2-ZJP-21 | 8 | `volkswagen-touran-1-6-16v-fsi` |
| 24 | Volkswagen Transporter 1.9 TDI 300 T800 Trendline DC | 2009 | € 4.500 | 404.738 | Diesel | Handmatig | 66-VZS-7 | 14 | `volkswagen-transporter-1-9-tdi-300-t800-trendline-dc` |
| 25 | Volvo V60 2.4 D5 Twin Engine Special Edition | 2015 | € 2.750 | 449.542 | Hybride | Automaat | HH-348-F | 12 | `volvo-v60-2-4-d5-twin-engine-special-edition` |

## Per voertuig — bron, ontbrekende gegevens, status

### Audi A3 Limousine 2.0 TDI Sport Pro Line S
- **Bron-URL:** https://svl.autodealers.nl/Audi/A3-Limousine/2.0-TDI-Sport-Pro-Line-S-6719644/5359/1/14/details.aspx?zoek=&so=gallerij
- **Ontdekkingsbron:** Autodealers.nl voorraad-iframe (did=5359), detailpagina `details.aspx` (aid 6719644)
- **Lokaal afbeeldingspad:** `public/assets/occasions/audi-a3-limousine-2-0-tdi-sport-pro-line-s/` (15 foto's, `audi-a3-limousine-2-0-tdi-sport-pro-line-s-NN.jpg`)
- **Datavelden:** bouwjaar 2018, prijs € 15.500, brandstof Diesel, carrosserie Sedan, vermogen 110 Kw / 151 Pk
- **Ontbrekende gegevens:** geen
- **Status in rebuild:** opgenomen, status `beschikbaar`, 15 echte foto's gekoppeld

### Bmw 3-serie Touring 320i Business Line
- **Bron-URL:** https://svl.autodealers.nl/BMW/3-serie-Touring/320i-Business-Line-6608402/5359/1/17/details.aspx?zoek=&so=gallerij
- **Ontdekkingsbron:** Autodealers.nl voorraad-iframe (did=5359), detailpagina `details.aspx` (aid 6608402)
- **Lokaal afbeeldingspad:** `public/assets/occasions/bmw-3-serie-touring-320i-business-line/` (10 foto's, `bmw-3-serie-touring-320i-business-line-NN.jpg`)
- **Datavelden:** bouwjaar 2009, prijs € 4.500, brandstof Benzine, carrosserie Stationwagen, vermogen 125 Kw / 171 Pk
- **Ontbrekende gegevens:** geen
- **Status in rebuild:** opgenomen, status `beschikbaar`, 10 echte foto's gekoppeld

### Fiat 290
- **Bron-URL:** https://svl.autodealers.nl/Fiat/290/--6430596/5359/1/20/details.aspx?zoek=&so=gallerij
- **Ontdekkingsbron:** Autodealers.nl voorraad-iframe (did=5359), detailpagina `details.aspx` (aid 6430596)
- **Lokaal afbeeldingspad:** `public/assets/occasions/fiat-290/` (21 foto's, `fiat-290-NN.jpg`)
- **Datavelden:** bouwjaar 1994, prijs € 8.500, brandstof Diesel, carrosserie Overig, vermogen 60 Kw / 82 Pk
- **Ontbrekende gegevens:** transmissie, aantal deuren, zitplaatsen, kleur
- **Status in rebuild:** opgenomen, status `beschikbaar`, 21 echte foto's gekoppeld

### Fiat DOBLO CARGO/Camper
- **Bron-URL:** https://svl.autodealers.nl/Fiat/FIAT-DOBLO-CARGOCamper/--5509714/5359/1/25/details.aspx?zoek=&so=gallerij
- **Ontdekkingsbron:** Autodealers.nl voorraad-iframe (did=5359), detailpagina `details.aspx` (aid 5509714)
- **Lokaal afbeeldingspad:** `public/assets/occasions/fiat-doblo-cargo-camper/` (11 foto's, `fiat-doblo-cargo-camper-NN.jpg`)
- **Datavelden:** bouwjaar 2008, prijs € 4.750, brandstof Benzine, carrosserie Overig, vermogen 76 Kw / 104 Pk
- **Ontbrekende gegevens:** aantal deuren, zitplaatsen
- **Status in rebuild:** opgenomen, status `beschikbaar`, 11 echte foto's gekoppeld

### Fiat Grande Punto 1.2 Active
- **Bron-URL:** https://svl.autodealers.nl/Fiat/Grande-Punto/1.2-Active-6697767/5359/1/16/details.aspx?zoek=&so=gallerij
- **Ontdekkingsbron:** Autodealers.nl voorraad-iframe (did=5359), detailpagina `details.aspx` (aid 6697767)
- **Lokaal afbeeldingspad:** `public/assets/occasions/fiat-grande-punto-1-2-active/` (15 foto's, `fiat-grande-punto-1-2-active-NN.jpg`)
- **Datavelden:** bouwjaar 2008, prijs € 1.750, brandstof Benzine, carrosserie Hatchback, vermogen 48 Kw / 66 Pk
- **Ontbrekende gegevens:** geen
- **Status in rebuild:** opgenomen, status `beschikbaar`, 15 echte foto's gekoppeld

### Ford Transit Westfalia Nugget Kampeerauto
- **Bron-URL:** https://svl.autodealers.nl/Ford/TRANSIT-WESTFALIA-NUGGET-KAMPEERAUTO/--6156747/5359/1/22/details.aspx?zoek=&so=gallerij
- **Ontdekkingsbron:** Autodealers.nl voorraad-iframe (did=5359), detailpagina `details.aspx` (aid 6156747)
- **Lokaal afbeeldingspad:** `public/assets/occasions/ford-transit-westfalia-nugget-kampeerauto/` (12 foto's, `ford-transit-westfalia-nugget-kampeerauto-NN.jpg`)
- **Datavelden:** bouwjaar 1992, prijs € 2.500, brandstof Diesel, carrosserie Overig, vermogen —
- **Ontbrekende gegevens:** zitplaatsen
- **Status in rebuild:** opgenomen, status `beschikbaar`, 12 echte foto's gekoppeld

### Hyundai I 10 M52CZ1
- **Bron-URL:** https://svl.autodealers.nl/Hyundai/I-10/M52CZ1-6794592/5359/1/5/details.aspx?zoek=&so=gallerij
- **Ontdekkingsbron:** Autodealers.nl voorraad-iframe (did=5359), detailpagina `details.aspx` (aid 6794592)
- **Lokaal afbeeldingspad:** `public/assets/occasions/hyundai-i-10-m52cz1/` (12 foto's, `hyundai-i-10-m52cz1-NN.jpg`)
- **Datavelden:** bouwjaar 2009, prijs € 1.300, brandstof Diesel, carrosserie Overig, vermogen 55 Kw / 75 Pk
- **Ontbrekende gegevens:** zitplaatsen
- **Status in rebuild:** opgenomen, status `beschikbaar`, 12 echte foto's gekoppeld

### Mazda Cx-5 2.0 S 2WD
- **Bron-URL:** https://svl.autodealers.nl/Mazda/CX-5/2.0-S-2WD-6741981/5359/1/11/details.aspx?zoek=&so=gallerij
- **Ontdekkingsbron:** Autodealers.nl voorraad-iframe (did=5359), detailpagina `details.aspx` (aid 6741981)
- **Lokaal afbeeldingspad:** `public/assets/occasions/mazda-cx-5-2-0-s-2wd/` (10 foto's, `mazda-cx-5-2-0-s-2wd-NN.jpg`)
- **Datavelden:** bouwjaar 2012, prijs € 5.500, brandstof Diesel, carrosserie SUV, vermogen —
- **Ontbrekende gegevens:** kilometerstand, kenteken, aantal deuren, zitplaatsen, kleur
- **Status in rebuild:** opgenomen, status `beschikbaar`, 10 echte foto's gekoppeld

### Mercedes-Benz 190-serie 2.0 E
- **Bron-URL:** https://svl.autodealers.nl/Mercedes-Benz/190-serie/2.0-E-6727740/5359/1/13/details.aspx?zoek=&so=gallerij
- **Ontdekkingsbron:** Autodealers.nl voorraad-iframe (did=5359), detailpagina `details.aspx` (aid 6727740)
- **Lokaal afbeeldingspad:** `public/assets/occasions/mercedes-benz-190-serie-2-0-e/` (11 foto's, `mercedes-benz-190-serie-2-0-e-NN.jpg`)
- **Datavelden:** bouwjaar 1992, prijs € 3.250, brandstof Benzine, carrosserie Sedan, vermogen 90 Kw / 123 Pk
- **Ontbrekende gegevens:** zitplaatsen
- **Status in rebuild:** opgenomen, status `beschikbaar`, 11 echte foto's gekoppeld

### Opel Vivaro 1.9 DI L2H1
- **Bron-URL:** https://svl.autodealers.nl/Opel/Vivaro/1.9-DI-L2H1-6802584/5359/1/4/details.aspx?zoek=&so=gallerij
- **Ontdekkingsbron:** Autodealers.nl voorraad-iframe (did=5359), detailpagina `details.aspx` (aid 6802584)
- **Lokaal afbeeldingspad:** `public/assets/occasions/opel-vivaro-1-9-di-l2h1/` (9 foto's, `opel-vivaro-1-9-di-l2h1-NN.jpg`)
- **Datavelden:** bouwjaar 2003, prijs € 2.250, brandstof Diesel, carrosserie Bedrijfswagen, vermogen 60 Kw / 82 Pk
- **Ontbrekende gegevens:** zitplaatsen, kleur
- **Status in rebuild:** opgenomen, status `beschikbaar`, 9 echte foto's gekoppeld

### Peugeot 207 1.4 VTi XS Pack
- **Bron-URL:** https://svl.autodealers.nl/Peugeot/207/1.4-VTi-XS-Pack-5974895/5359/1/23/details.aspx?zoek=&so=gallerij
- **Ontdekkingsbron:** Autodealers.nl voorraad-iframe (did=5359), detailpagina `details.aspx` (aid 5974895)
- **Lokaal afbeeldingspad:** `public/assets/occasions/peugeot-207-1-4-vti-xs-pack/` (12 foto's, `peugeot-207-1-4-vti-xs-pack-NN.jpg`)
- **Datavelden:** bouwjaar 2008, prijs € 1.995, brandstof Benzine, carrosserie Hatchback, vermogen 70 Kw / 96 Pk
- **Ontbrekende gegevens:** geen
- **Status in rebuild:** opgenomen, status `beschikbaar`, 12 echte foto's gekoppeld

### Peugeot 207 1.6 VTi XS Pack
- **Bron-URL:** https://svl.autodealers.nl/Peugeot/207/1.6-VTi-XS-Pack-6348654/5359/1/21/details.aspx?zoek=&so=gallerij
- **Ontdekkingsbron:** Autodealers.nl voorraad-iframe (did=5359), detailpagina `details.aspx` (aid 6348654)
- **Lokaal afbeeldingspad:** `public/assets/occasions/peugeot-207-1-6-vti-xs-pack/` (9 foto's, `peugeot-207-1-6-vti-xs-pack-NN.jpg`)
- **Datavelden:** bouwjaar 2008, prijs € 1.249, brandstof Benzine, carrosserie Hatchback, vermogen 88 Kw / 121 Pk
- **Ontbrekende gegevens:** geen
- **Status in rebuild:** opgenomen, status `beschikbaar`, 9 echte foto's gekoppeld

### Peugeot 307 Cc 2.0- 16V
- **Bron-URL:** https://svl.autodealers.nl/Peugeot/307-CC/2.0-16V-6742044/5359/1/10/details.aspx?zoek=&so=gallerij
- **Ontdekkingsbron:** Autodealers.nl voorraad-iframe (did=5359), detailpagina `details.aspx` (aid 6742044)
- **Lokaal afbeeldingspad:** `public/assets/occasions/peugeot-307-cc-2-0-16v/` (11 foto's, `peugeot-307-cc-2-0-16v-NN.jpg`)
- **Datavelden:** bouwjaar 2007, prijs € 2.000, brandstof Benzine, carrosserie Cabriolet, vermogen 103 Kw / 141 Pk
- **Ontbrekende gegevens:** geen
- **Status in rebuild:** opgenomen, status `beschikbaar`, 11 echte foto's gekoppeld

### Peugeot Partner 120 1.6 BlueHDi 75 L1 Première
- **Bron-URL:** https://svl.autodealers.nl/Peugeot/Partner/120-1.6-BlueHDi-75-L1-Premire-6522068/5359/1/18/details.aspx?zoek=&so=gallerij
- **Ontdekkingsbron:** Autodealers.nl voorraad-iframe (did=5359), detailpagina `details.aspx` (aid 6522068)
- **Lokaal afbeeldingspad:** `public/assets/occasions/peugeot-partner-120-1-6-bluehdi-75-l1-premiere/` (14 foto's, `peugeot-partner-120-1-6-bluehdi-75-l1-premiere-NN.jpg`)
- **Datavelden:** bouwjaar 2017, prijs € 5.250, brandstof Diesel, carrosserie Bedrijfswagen, vermogen 55 Kw / 75 Pk
- **Ontbrekende gegevens:** zitplaatsen, kleur
- **Status in rebuild:** opgenomen, status `beschikbaar`, 14 echte foto's gekoppeld

### Renault Master T33 2.5dCi L2H2
- **Bron-URL:** https://svl.autodealers.nl/Renault/Master/T33-2.5dCi-L2H2-6787116/5359/1/6/details.aspx?zoek=&so=gallerij
- **Ontdekkingsbron:** Autodealers.nl voorraad-iframe (did=5359), detailpagina `details.aspx` (aid 6787116)
- **Lokaal afbeeldingspad:** `public/assets/occasions/renault-master-t33-2-5dci-l2h2/` (12 foto's, `renault-master-t33-2-5dci-l2h2-NN.jpg`)
- **Datavelden:** bouwjaar 2004, prijs € 3.000, brandstof Diesel, carrosserie Bedrijfswagen, vermogen 73 Kw / 100 Pk
- **Ontbrekende gegevens:** zitplaatsen, kleur
- **Status in rebuild:** opgenomen, status `beschikbaar`, 12 echte foto's gekoppeld

### Renault Mégane 1.5 dCi Expression
- **Bron-URL:** https://svl.autodealers.nl/Renault/Megane/1.5-dCi-Expression-6735611/5359/1/12/details.aspx?zoek=&so=gallerij
- **Ontdekkingsbron:** Autodealers.nl voorraad-iframe (did=5359), detailpagina `details.aspx` (aid 6735611)
- **Lokaal afbeeldingspad:** `public/assets/occasions/renault-megane-1-5-dci-expression/` (10 foto's, `renault-megane-1-5-dci-expression-NN.jpg`)
- **Datavelden:** bouwjaar 2011, prijs € 2.000, brandstof Diesel, carrosserie Overig, vermogen 66 Kw / 90 Pk
- **Ontbrekende gegevens:** zitplaatsen, kleur
- **Status in rebuild:** opgenomen, status `beschikbaar`, 10 echte foto's gekoppeld

### Seat Ibiza 1.6i Vigo
- **Bron-URL:** https://svl.autodealers.nl/Seat/Ibiza/1.6i-Vigo-6697899/5359/1/15/details.aspx?zoek=&so=gallerij
- **Ontdekkingsbron:** Autodealers.nl voorraad-iframe (did=5359), detailpagina `details.aspx` (aid 6697899)
- **Lokaal afbeeldingspad:** `public/assets/occasions/seat-ibiza-1-6i-vigo/` (10 foto's, `seat-ibiza-1-6i-vigo-NN.jpg`)
- **Datavelden:** bouwjaar 1998, prijs € 850, brandstof Benzine, carrosserie Hatchback, vermogen 55 Kw / 75 Pk
- **Ontbrekende gegevens:** geen
- **Status in rebuild:** opgenomen, status `beschikbaar`, 10 echte foto's gekoppeld

### Skoda Octavia Combi 1.6 TDI Elegance Business Line
- **Bron-URL:** https://svl.autodealers.nl/Skoda/Octavia-Combi/1.6-TDI-Elegance-Business-Line-6782700/5359/1/7/details.aspx?zoek=&so=gallerij
- **Ontdekkingsbron:** Autodealers.nl voorraad-iframe (did=5359), detailpagina `details.aspx` (aid 6782700)
- **Lokaal afbeeldingspad:** `public/assets/occasions/skoda-octavia-combi-1-6-tdi-elegance-business-line/` (10 foto's, `skoda-octavia-combi-1-6-tdi-elegance-business-line-NN.jpg`)
- **Datavelden:** bouwjaar 2011, prijs € 3.250, brandstof Diesel, carrosserie Stationwagen, vermogen 77 Kw / 105 Pk
- **Ontbrekende gegevens:** geen
- **Status in rebuild:** opgenomen, status `beschikbaar`, 10 echte foto's gekoppeld

### Toyota Yaris 1.3 VVTi Idols
- **Bron-URL:** https://svl.autodealers.nl/Toyota/Yaris/1.3-VVTi-Idols-6774445/5359/1/8/details.aspx?zoek=&so=gallerij
- **Ontdekkingsbron:** Autodealers.nl voorraad-iframe (did=5359), detailpagina `details.aspx` (aid 6774445)
- **Lokaal afbeeldingspad:** `public/assets/occasions/toyota-yaris-1-3-vvti-idols/` (10 foto's, `toyota-yaris-1-3-vvti-idols-NN.jpg`)
- **Datavelden:** bouwjaar 2008, prijs € 2.850, brandstof Benzine, carrosserie Hatchback, vermogen 64 Kw / 88 Pk
- **Ontbrekende gegevens:** geen
- **Status in rebuild:** opgenomen, status `beschikbaar`, 10 echte foto's gekoppeld

### Volkswagen Caddy 1.6 TDI
- **Bron-URL:** https://svl.autodealers.nl/Volkswagen/Caddy/1.6-TDI-6804753/5359/1/1/details.aspx?zoek=&so=gallerij
- **Ontdekkingsbron:** Autodealers.nl voorraad-iframe (did=5359), detailpagina `details.aspx` (aid 6804753)
- **Lokaal afbeeldingspad:** `public/assets/occasions/volkswagen-caddy-1-6-tdi/` (11 foto's, `volkswagen-caddy-1-6-tdi-NN.jpg`)
- **Datavelden:** bouwjaar 2013, prijs € 5.000, brandstof Diesel, carrosserie Bedrijfswagen, vermogen 55 Kw / 75 Pk
- **Ontbrekende gegevens:** zitplaatsen, kleur
- **Status in rebuild:** opgenomen, status `beschikbaar`, 11 echte foto's gekoppeld

### Volkswagen Crafter 30 2.5 TDI L2H2
- **Bron-URL:** https://svl.autodealers.nl/Volkswagen/Crafter/30-2.5-TDI-L2H2-6439553/5359/1/19/details.aspx?zoek=&so=gallerij
- **Ontdekkingsbron:** Autodealers.nl voorraad-iframe (did=5359), detailpagina `details.aspx` (aid 6439553)
- **Lokaal afbeeldingspad:** `public/assets/occasions/volkswagen-crafter-30-2-5-tdi-l2h2/` (10 foto's, `volkswagen-crafter-30-2-5-tdi-l2h2-NN.jpg`)
- **Datavelden:** bouwjaar 2009, prijs € 5.000, brandstof Diesel, carrosserie Bedrijfswagen, vermogen 100 Kw / 137 Pk
- **Ontbrekende gegevens:** zitplaatsen, kleur
- **Status in rebuild:** opgenomen, status `beschikbaar`, 10 echte foto's gekoppeld

### Volkswagen Polo 1.2 TDI BlueMotion
- **Bron-URL:** https://svl.autodealers.nl/Volkswagen/Polo/1.2-TDI-BlueMotion-6742301/5359/1/9/details.aspx?zoek=&so=gallerij
- **Ontdekkingsbron:** Autodealers.nl voorraad-iframe (did=5359), detailpagina `details.aspx` (aid 6742301)
- **Lokaal afbeeldingspad:** `public/assets/occasions/volkswagen-polo-1-2-tdi-bluemotion/` (13 foto's, `volkswagen-polo-1-2-tdi-bluemotion-NN.jpg`)
- **Datavelden:** bouwjaar 2014, prijs € 2.200, brandstof Diesel, carrosserie Hatchback, vermogen 55 Kw / 75 Pk
- **Ontbrekende gegevens:** geen
- **Status in rebuild:** opgenomen, status `beschikbaar`, 13 echte foto's gekoppeld

### Volkswagen Touran 1.6- 16V FSI
- **Bron-URL:** https://svl.autodealers.nl/Volkswagen/Touran/1.6-16V-FSI-Zonder-APK-Motor-loopt-op-drie-cilinders-5516872/5359/1/24/details.aspx?zoek=&so=gallerij
- **Ontdekkingsbron:** Autodealers.nl voorraad-iframe (did=5359), detailpagina `details.aspx` (aid 5516872)
- **Lokaal afbeeldingspad:** `public/assets/occasions/volkswagen-touran-1-6-16v-fsi/` (8 foto's, `volkswagen-touran-1-6-16v-fsi-NN.jpg`)
- **Datavelden:** bouwjaar 2003, prijs € 1.000, brandstof Benzine, carrosserie MPV, vermogen 85 Kw / 116 Pk
- **Ontbrekende gegevens:** geen
- **Status in rebuild:** opgenomen, status `beschikbaar`, 8 echte foto's gekoppeld

### Volkswagen Transporter 1.9 TDI 300 T800 Trendline DC
- **Bron-URL:** https://svl.autodealers.nl/Volkswagen/Transporter/1.9-TDI-300-T800-Trendline-DC-6802683/5359/1/3/details.aspx?zoek=&so=gallerij
- **Ontdekkingsbron:** Autodealers.nl voorraad-iframe (did=5359), detailpagina `details.aspx` (aid 6802683)
- **Lokaal afbeeldingspad:** `public/assets/occasions/volkswagen-transporter-1-9-tdi-300-t800-trendline-dc/` (14 foto's, `volkswagen-transporter-1-9-tdi-300-t800-trendline-dc-NN.jpg`)
- **Datavelden:** bouwjaar 2009, prijs € 4.500, brandstof Diesel, carrosserie Bedrijfswagen, vermogen 62 Kw / 85 Pk
- **Ontbrekende gegevens:** zitplaatsen, kleur
- **Status in rebuild:** opgenomen, status `beschikbaar`, 14 echte foto's gekoppeld

### Volvo V60 2.4 D5 Twin Engine Special Edition
- **Bron-URL:** https://svl.autodealers.nl/Volvo/V60/2.4-D5-Twin-Engine-Special-Edition-6804439/5359/1/2/details.aspx?zoek=&so=gallerij
- **Ontdekkingsbron:** Autodealers.nl voorraad-iframe (did=5359), detailpagina `details.aspx` (aid 6804439)
- **Lokaal afbeeldingspad:** `public/assets/occasions/volvo-v60-2-4-d5-twin-engine-special-edition/` (12 foto's, `volvo-v60-2-4-d5-twin-engine-special-edition-NN.jpg`)
- **Datavelden:** bouwjaar 2015, prijs € 2.750, brandstof Hybride, carrosserie Stationwagen, vermogen 120 Kw / 164 Pk
- **Ontbrekende gegevens:** geen
- **Status in rebuild:** opgenomen, status `beschikbaar`, 12 echte foto's gekoppeld

## Uitgesloten

- **Legacy WooCommerce-product** `VW Polo 1.2 TDI BlueMotion 2011` (€6.450, kenteken 78-RZR-1, `/product/…`): losstaand oud product, **niet** in de live `/occasions/`-voorraadfeed. Niet opgenomen om geen verouderde/dubbele Polo te tonen (de live feed heeft een VW Polo 1.2 TDI BlueMotion 2014). De 7 eerder gearchiveerde foto's stonden op het eigen WP-domein; folder verwijderd.
