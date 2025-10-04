
# Doctolib Live Widget (Scraper) - Vercel deployable
This project scrapes a public Doctolib practitioner page and exposes a small JSON API plus a lightweight embeddable widget script.
**Important legal note:** Scraping Doctolib may violate their Terms of Service. Use at your own risk. Prefer contacting Doctolib to request an official integration.

## Files
- `api/termine.js` - Vercel serverless function, scrapes the Doctolib page and returns JSON `{ ok, nextAppointment, link, scrapedAt }`
- `widget.js` - Embeddable widget script. Include via `<script src="https://<your-vercel>.vercel.app/widget.js"></script>` on your site.
- `index.html` - preview page for local/dev testing
- `package.json` - dependencies (cheerio)

## How it works (summary)
1. Deploy this repository to Vercel (connect GitHub repo).
2. Vercel exposes `https://<your-deploy>/api/termine` and `https://<your-deploy>/widget.js`.
3. On Squarespace, add a Code Block and include:
```html
<div id="doctolib-widget"></div>
<script src="https://<your-deploy>.vercel.app/widget.js"></script>
```
Or, if external scripts are blocked, paste the contents of `widget.js` inline inside a Code Block.

## Deployment steps
1. Create a GitHub repo under `fj4321` (or your account).
2. Push files (see commands below).
3. Connect repo to Vercel and deploy. No extra env vars required.
4. Test the API: `https://<your-deploy>/api/termine`
5. Embed widget in Squarespace as above.

### Git commands (run in project folder)
```
git init
git add .
git commit -m "Initial Doctolib widget scraper"
git branch -M main
git remote add origin https://github.com/fj4321/doctolib-widget-full.git
git push -u origin main
```

## Troubleshooting & Notes
- If the API returns `ok: false`, check Vercel function logs for fetch errors or blocking by Doctolib.
- Doctolib may block scrapers or change HTML structure; the parser uses heuristics (time tags, JSON-LD, regex). If it fails, parser updates will be needed.
- Respect Doctolib's robots and terms. Consider asking for an official integration for reliability.
