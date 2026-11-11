# Sushim Ranjan Dutta — Portfolio & Deck

Static site. No build step, no dependencies, no framework. Open `index.html` in a browser and it runs.

## Files

| File | What it is |
|---|---|
| `index.html` | The portfolio site |
| `deck.html` | The services & engagements deck — print-first, 13 A4 landscape sheets |
| `styles.css` | Styles for the site |
| `deck.css` | Styles for the deck, including the print rules |
| `script.js` | Typewriter, scroll reveal, the engagement slider, counters |
| `assets/` | Portrait image |
| `Sushim Ranjan Dutta — Services & Engagements.pdf` | The deck, already exported — hyperlinks live |

## Viewing it locally

Double-clicking `index.html` works. If anything looks off, serve it instead:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000

## Exporting the deck as a PDF

A ready-made PDF ships in this folder. To regenerate it after an edit:

1. Open `deck.html`
2. Click **Save as PDF** in the top-right (or press ⌘P / Ctrl+P)
3. In the print dialog set:
   - **Destination:** Save as PDF
   - **Layout:** Landscape
   - **Paper:** A4
   - **Margins:** Default
   - **Headers and footers:** off
   - **Background graphics:** on

That produces 13 pages with the email, phone, LinkedIn and portfolio links clickable.

## Deploying

Any static host — Netlify, Vercel, GitHub Pages, Cloudflare Pages, S3. Drag the folder in; there is nothing to compile.

## Editing content

Everything is plain HTML. The deck's six engagements are `<section class="page">` blocks with ids `#e01`–`#e06` in `deck.html`; the contents page links to them by those ids, so if you add a page, add a matching row to the `.toc` list.
