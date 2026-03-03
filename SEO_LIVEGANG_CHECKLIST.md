# SEO livegang checklist (Rainy Day Club)

Gebruik deze lijst direct na deployment van de SEO-wijzigingen.

> Let op: als `https://rainydayclub.nl` een parkeerpagina toont, gebruik dan overal `https://www.rainydayclub.nl` voor sitemap, canonical en URL-inspectie.

## 1) Technische basis check (5 min)

- Open: https://www.rainydayclub.nl/robots.txt
  - Verwacht: `Sitemap: https://www.rainydayclub.nl/sitemap.xml`
- Open: https://www.rainydayclub.nl/sitemap.xml
  - Verwacht: alle indexeerbare pagina’s aanwezig
- Open broncode van:
  - home.html
  - kleurplaat.html
  - challenge.html
  - Check op: title, meta description, canonical, og-tags

## 2) Google Search Console instellen

1. Ga naar Google Search Console.
2. Property toevoegen:
  - bij voorkeur **Domain property**: `rainydayclub.nl`
  - of tijdelijk **URL-prefix property**: `https://www.rainydayclub.nl/`
3. Verifieer via DNS (TXT record).
4. In menu **Sitemaps**:
  - Dien in: `https://www.rainydayclub.nl/sitemap.xml`
5. In **URL-inspectie**:
   - Inspecteer en vraag indexering aan voor:
    - `https://www.rainydayclub.nl/`
    - `https://www.rainydayclub.nl/kleurplaat.html`
    - `https://www.rainydayclub.nl/challenge.html`

## 3) Bing Webmaster Tools

1. Voeg site toe in Bing Webmaster Tools.
2. Importeer vanuit Search Console (sneller), of verifieer apart.
3. Dien sitemap in: `https://www.rainydayclub.nl/sitemap.xml`.

## 4) Pagina’s die bewust NIET moeten ranken

Controleer dat deze op `noindex` staan en niet in sitemap staan:
- `login.html`
- `abonnement-success.html`
- `abonnement-cancel.html`

> `index.html` mag **niet** op `noindex` staan zolang je root (`/`) daar soms op uitkomt.

## 5) 14-dagen monitoring

Meet elke 2-3 dagen in Search Console:
- **Prestaties > Zoekresultaten**
  - Klikken
  - Vertoningen
  - Gem. positie
  - CTR
- **Filter op pagina**:
  - `/`
  - `/kleurplaat.html`
  - `/challenge.html`
- **Filter op query**:
  - `ai kleurplaat maken`
  - `kleurplaat generator voor kinderen`
  - `challenge generator kinderen`

## 6) Snelle optimalisatie-loop (wekelijks)

- Als veel vertoningen maar lage CTR:
  - verbeter title/meta (meer zoekterm + voordeel)
- Als positie 8–20 blijft hangen:
  - voeg 120–200 woorden unieke content toe op pagina
  - voeg 2–3 interne links toe vanaf home naar de pagina
- Als pagina niet indexeert:
  - check canonical en robots
  - opnieuw URL-inspectie + indexeringsverzoek

## 7) Doel voor eerste 30 dagen

Realistische KPI’s:
- 3–10 relevante long-tail zoektermen met vertoningen
- Top 30 posities op:
  - `ai kleurplaat maken voor kinderen`
  - `challenge generator voor kinderen`
- Eerste organische klikken op kleurplaat/challenge pagina

## 8) Belangrijk om te onthouden

- Op brede termen als `AI`, `ChatGPT`, `kleurplaat` ga je meestal niet snel bovenaan komen.
- Focus op long-tail combinaties + contentkwaliteit + interne links + externe vermeldingen.
- Consistentie per week wint van eenmalige grote wijzigingen.
