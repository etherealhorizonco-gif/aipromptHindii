# AI Prompt Hindi (aiprompthindi.netlify.app)

Free tool + prompt site for Indian searchers: a gallery of copy-paste AI photo prompts (each prompt is a card with sample art and a copy button), 17 in-browser photo tools at `/tools/` (compress to 20/50/100 KB, 3.5×4.5 cm photo, signature resize, passport print sheet, JPG→PDF…), plus AI video and AI tool guides. Static site, zero dependencies, built by `node build.js` into `dist/`. Netlify runs `node build.js && node scripts/check.js` on every push to `main` (see `netlify.toml`). **How to publish: see [WORKFLOW.md](WORKFLOW.md).**

## Add a new article
1. Copy `templates/post.json` to `content/<slug>.json`.
2. Required fields: `slug`, `category` (one of the slugs in `site.config.js`), `date` (YYYY-MM-DD), `title`, `description`, `keywords`, `blocks`.
3. Optional: `seoTitle` (≤ 65 chars, keyword first), `intro`, `featured`, `related` (slugs), `faq` (`[{q, a}]`), `updated`, `draft`.
4. A post with a future `date` stays hidden until that day's build.
5. Run `scripts/publish.sh "Add: <slug>"` — it builds, checks, commits and pushes; Netlify deploys.

Block types: `p` (`html`), `h2`/`h3` (`text`, optional `id`), `ul`/`ol` (`items`), `note` (`html`, optional `title`, `tone: "warn"`), `table` (`head`, `rows`), `prompt` (`title`, `text`, optional `for`, `tip`, `image`, `imageAlt`).

## Prompt gallery
- Consecutive `prompt` blocks render as a card grid. Each card shows sample art generated at build time from the prompt text (`lib/art.js` → `dist/samples/<slug>-<n>.svg`, labelled "स्टाइल प्रीव्यू"). No stock or copyrighted photos.
- To show a real result instead, save it as `static/samples/<name>.webp` (own photo or a consenting model, never a celebrity or stranger) and set `"image": "/samples/<name>.webp"` on the prompt block.
- `/prompts/` lists every photo-prompt page (≥ 4 prompts). `"trend": true` adds a 🔥 badge and puts the page first on `/prompts/` and the home page.
- New viral trend: `node scripts/new-trend.js <slug> "<Trend name>"`, fill the TODOs, publish. See WORKFLOW.md.

## Photo tools
- Defined in `tools.config.js` (text, FAQ, presets) and run by one browser script, `static/tool-engine.js`. Nothing is uploaded.
- Modes: `compress`, `increase`, `photo` (fixed size with crop frame; options `presets`, `caption`, `clean`, `sheet`), `crop`, `resize`, `dpi`, `convert`, `pdf`.
- Add a tool = add an entry to `tools.config.js`; `check.js` validates it. Keep exam sizes generic and tell people to check their notification.

## Content rules
- Photo prompts are in English and always end with a face-preservation line.
- Use single quotes inside JSON HTML strings (`<a href='/x/'>`).
- Don't claim prompts were tested unless they actually were.
- No CapCut recommendations (banned in India). No deepfakes of real people. No unverified prices.
- Festival dates must be checked against at least two panchang/government sources.

## Settings
`site.config.js`: site URL, GA4 ID (`GA4_ID` env var) and Search Console token (`GSC_TOKEN` env var) — set them as Netlify environment variables.
