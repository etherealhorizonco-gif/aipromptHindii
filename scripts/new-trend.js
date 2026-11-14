#!/usr/bin/env node
// Fast path for a new AI photo trend: scaffold a gallery page in seconds.
// Usage: node scripts/new-trend.js <slug> "<Trend name>" ["keyword, keyword"]
//   e.g. node scripts/new-trend.js gemini-ai-photo-prompt-3d-figure "3D Figurine" "3d figure ai photo prompt, gemini 3d figure"
// Then fill the prompt texts in content/<slug>.json, run scripts/publish.sh.
// The page gets "trend": true → 🔥 badge, top of the home page and /prompts/.
const fs = require("fs");
const path = require("path");
const [slug, name, kw] = process.argv.slice(2);
if (!slug || !name || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
  console.error('Usage: node scripts/new-trend.js <lowercase-slug> "<Trend name>" ["keywords"]');
  process.exit(2);
}
const file = path.join(__dirname, "..", "content", `${slug}.json`);
if (fs.existsSync(file)) { console.error(`content/${slug}.json already exists`); process.exit(1); }
const today = new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10); // IST date
const tpl = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "templates", "trend.json"), "utf8"));
const fill = (v) => (typeof v === "string" ? v.replace(/\{\{NAME\}\}/g, name).replace(/\{\{SLUG\}\}/g, slug) : Array.isArray(v) ? v.map(fill) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, fill(x)])) : v);
const page = fill(tpl);
page.slug = slug;
page.date = today;
page.keywords = kw || `${name.toLowerCase()} ai photo prompt, gemini ${name.toLowerCase()} prompt, ${name.toLowerCase()} ai photo editing prompt`;
fs.writeFileSync(file, JSON.stringify(page, null, 1) + "\n");
console.log(`✓ Created content/${slug}.json (date ${today}, trend: true).
Next: replace every "TODO" with real text (6–12 prompts), then
  scripts/publish.sh "Trend: ${slug}"
When the trend fades, remove "trend": true so the page drops into the normal gallery.`);
