# Spoor 7 — website

Website voor de coverband **Spoor 7** (70s & 80s covers). Gebouwd met [Hugo](https://gohugo.io/)
en gehost op **Cloudflare Pages**. Het boekingsformulier verstuurt e-mail via een Cloudflare
Pages Function die de [Resend](https://resend.com/) API aanroept.

## Lokaal draaien

```bash
hugo server -D
```

Open <http://localhost:1313>.

## Structuur

- `hugo.toml` — siteconfiguratie (één taal: Nederlands, geen thema — layouts staan in `layouts/`).
- `content/` — pagina's in Markdown: `_index.md` (home), `over.md`, `fotos.md`, `contact.md`.
- `layouts/` — eigen templates + partials (geen thema).
- `assets/scss/` — SCSS, gecompileerd door Hugo Pipes.
- `assets/js/contact-form.js` — progressive-enhancement submit van het formulier.
- `assets/img/` — foto's en poster (worden door Hugo verkleind; nooit op ware grootte geserveerd).
- `static/img/` — logo's en favicons (direct gelinkt).
- `functions/api/contact.js` — Cloudflare Pages Function, backend van het contactformulier.

## Contactformulier (Resend)

De function `functions/api/contact.js` verwacht deze omgevingsvariabelen:

| Variabele        | Voorbeeld                                        |
| ---------------- | ------------------------------------------------ |
| `RESEND_API_KEY` | `re_iXVNk688_Ax6QgtgVGh73nU7VimayQddF` (Resend API key)                   |
| `CONTACT_TO`     | `marcvankessel@gmail.com`                          |
| `CONTACT_FROM`   | `Spoor 7 website <noreply@spoor7coverband.nl>`   |

De afzender (`CONTACT_FROM`) moet een op een geverifieerd domein in Resend gebaseerd adres zijn.

### Lokaal testen met het echte formulier

```bash
hugo --minify --gc
npx wrangler pages dev public --compatibility-date=2024-09-01
```

Wrangler leest de secrets uit een `.dev.vars`-bestand (niet in git):

```
RESEND_API_KEY=re_xxxxxxxx
CONTACT_TO=marc@vankessel-it.com
CONTACT_FROM=Spoor 7 website <noreply@spoor7coverband.nl>
```

## Deploy (Cloudflare Pages)

1. Push naar een GitHub-repo en koppel die in Cloudflare → Workers & Pages → Pages.
2. Framework preset: **Hugo**. Build command: `hugo --minify --gc`. Output: `public`.
3. Env vars: `HUGO_VERSION=0.160.1`, plus `RESEND_API_KEY`, `CONTACT_TO`, `CONTACT_FROM`.
4. De map `functions/` wordt automatisch als Pages Function gedeployed (`/api/contact`).
5. Custom domain `www.spoor7coverband.nl` toevoegen in het Pages-project + DNS.
