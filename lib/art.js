// Sample-art generator for prompt cards.
// Every prompt card shows a small illustration whose colours, scene and motif
// are read from the prompt text (e.g. "red lehenga … garden at dusk" → red
// outfit, dusk garden background). It is our own generated art — no stock or
// copyrighted photos — and it is clearly labelled as a style preview on the
// page. To show a real result instead, put an image in static/samples/ and set
// "image": "/samples/<file>.webp" on the prompt block.
const COLORS = [
  [/\bmaroon|burgundy|wine\b/, "#7B1E2B"],
  [/\bred|crimson|scarlet\b/, "#C62828"],
  [/\bpink|rose\b/, "#E75A8C"],
  [/\bpeach|coral\b/, "#F2967A"],
  [/\bgold(en)?\b|zari/, "#C9971A"],
  [/\byellow|mustard|haldi\b/, "#F2C230"],
  [/\borange|saffron|marigold\b/, "#EE7F1E"],
  [/\bemerald|green|mint|olive\b/, "#2E7D4F"],
  [/\bteal|turquoise\b/, "#1F8A8A"],
  [/\bnavy\b/, "#1F2D5A"],
  [/\bblue|denim\b/, "#2F5DA8"],
  [/\bpurple|lavender|violet|lilac\b/, "#7E57C2"],
  [/\bblack\b/, "#26221F"],
  [/\bwhite|ivory|cream|off-white\b/, "#EFE6D6"],
  [/\bgr[ae]y|silver\b/, "#9EA3A8"],
  [/\bbrown|tan|khaki|beige\b/, "#8A5A35"]
];
const SCENES = [
  [/christmas|santa|xmas/, ["#123F2F", "#7A1E22"], "snow"],
  [/new year|countdown|fireworks|confetti|party/, ["#14123A", "#4B2A6B"], "stars"],
  [/snow|winter|frost|ice\b|himalaya/, ["#DCE7F2", "#8AA6C1"], "snow"],
  [/diya|diwali|rangoli|lamp|ghat|candle|deepak/, ["#2E140B", "#B4521B"], "diya"],
  [/night|neon|moon|dark\b|starry/, ["#161A36", "#3D2C5C"], "stars"],
  [/sunset|golden hour|dusk|sunrise|evening/, ["#F5A25A", "#7B3B5E"], "sun"],
  [/beach|sea\b|ocean|waves/, ["#7ED0E2", "#F2DCAE"], "sun"],
  [/rain|monsoon|cloud/, ["#8E9EAE", "#4D5D6E"], null],
  [/mountain|valley|hill/, ["#B7CCE0", "#5D7993"], "sun"],
  [/garden|park|flower|field|mehndi|haldi|bloom|petal/, ["#CDE8BF", "#5E9F6B"], "flowers"],
  [/palace|haveli|fort|royal|mandap|temple/, ["#E9CBA1", "#9B5A3A"], "flowers"],
  [/city|street|cafe|metro|urban|road|bike|car\b/, ["#3D4B5E", "#9AA8B6"], null],
  [/studio|plain background|white background|backdrop/, ["#EEE7DE", "#C8BAA9"], null],
  [/vintage|retro|polaroid|sepia|90s|black and white/, ["#E6D3B3", "#8C6B4A"], null]
];
const DEFAULT_BG = [["#FCE3D3", "#E07A5F"], ["#DDE6F7", "#6C7FBF"], ["#F7E8C8", "#C98B3B"], ["#E3F1E8", "#5B9C7A"], ["#F3DDE8", "#A5577E"], ["#E6E1F5", "#6E5AA8"]];

const FEMALE = /\b(woman|girl|bride|she|her|lady|mother|wife|saree|lehenga|daughter|sister)\b/;
const MALE = /\b(man|boy|groom|he|his|father|husband|sherwani|son|brother)\b/;
const hash = (s) => { let h = 2166136261; for (const c of s) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const rng = (seed) => () => ((seed = (Math.imul(seed ^ (seed >>> 15), 2246822507) + 0x9e3779b9) >>> 0) / 4294967296);
const shade = (hex, f) => {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v) => Math.max(0, Math.min(255, Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f)));
  return "#" + [n >> 16, (n >> 8) & 255, n & 255].map((v) => ch(v).toString(16).padStart(2, "0")).join("");
};

function person(x, scale, outfit, skin, hair, female) {
  // A faceless, stylised bust — clearly an illustration, never a real face.
  const s = scale;
  const body = `M${x - 92 * s} 500 C${x - 90 * s} ${430 - 40 * s} ${x - 60 * s} ${388 - 60 * s} ${x} ${380 - 60 * s} C${x + 60 * s} ${388 - 60 * s} ${x + 90 * s} ${430 - 40 * s} ${x + 92 * s} 500 Z`;
  const headY = 300 - 95 * s;
  const hairPath = female
    ? `<path d="M${x - 44 * s} ${headY} C${x - 50 * s} ${headY - 64 * s} ${x + 50 * s} ${headY - 64 * s} ${x + 44 * s} ${headY} L${x + 50 * s} ${headY + 70 * s} C${x + 30 * s} ${headY + 40 * s} ${x - 30 * s} ${headY + 40 * s} ${x - 50 * s} ${headY + 70 * s} Z" fill="${hair}"/>`
    : `<path d="M${x - 40 * s} ${headY - 4 * s} C${x - 42 * s} ${headY - 56 * s} ${x + 42 * s} ${headY - 56 * s} ${x + 40 * s} ${headY - 4 * s} C${x + 20 * s} ${headY - 26 * s} ${x - 20 * s} ${headY - 26 * s} ${x - 40 * s} ${headY - 4 * s} Z" fill="${hair}"/>`;
  return `<g>
<path d="${body}" fill="${outfit}"/>
<path d="M${x - 92 * s} 500 C${x - 90 * s} ${430 - 40 * s} ${x - 60 * s} ${388 - 60 * s} ${x} ${380 - 60 * s} L${x} 500 Z" fill="${shade(outfit, 0.12)}" opacity=".5"/>
<rect x="${x - 15 * s}" y="${headY + 30 * s}" width="${30 * s}" height="${40 * s}" rx="${10 * s}" fill="${shade(skin, -0.08)}"/>
${female ? hairPath : ""}
<ellipse cx="${x}" cy="${headY}" rx="${38 * s}" ry="${46 * s}" fill="${skin}"/>
${female ? `<path d="M${x - 40 * s} ${headY - 6 * s} C${x - 40 * s} ${headY - 54 * s} ${x + 40 * s} ${headY - 54 * s} ${x + 40 * s} ${headY - 6 * s} C${x + 14 * s} ${headY - 30 * s} ${x - 14 * s} ${headY - 30 * s} ${x - 40 * s} ${headY - 6 * s} Z" fill="${hair}"/>` : hairPath}
</g>`;
}

function motif(kind, r, accent) {
  const out = [];
  if (kind === "snow") for (let i = 0; i < 26; i++) out.push(`<circle cx="${(r() * 400) | 0}" cy="${(r() * 330) | 0}" r="${(1.5 + r() * 3.5).toFixed(1)}" fill="#fff" opacity="${(0.55 + r() * 0.4).toFixed(2)}"/>`);
  if (kind === "stars") for (let i = 0; i < 22; i++) { const x = (r() * 400) | 0, y = (r() * 260) | 0, s = 2 + r() * 4; out.push(`<path d="M${x} ${y - s}L${x + s * 0.3} ${y - s * 0.3}L${x + s} ${y}L${x + s * 0.3} ${y + s * 0.3}L${x} ${y + s}L${x - s * 0.3} ${y + s * 0.3}L${x - s} ${y}L${x - s * 0.3} ${y - s * 0.3}Z" fill="${i % 3 ? "#FFE9A8" : accent}" opacity=".9"/>`); }
  if (kind === "diya") for (let i = 0; i < 5; i++) { const x = 40 + i * 80 + ((r() * 20) | 0), y = 470 - ((r() * 10) | 0); out.push(`<path d="M${x - 16} ${y} Q${x} ${y + 14} ${x + 16} ${y} Z" fill="#8A3B12"/><path d="M${x} ${y - 18} Q${x + 7} ${y - 6} ${x} ${y - 1} Q${x - 7} ${y - 6} ${x} ${y - 18}Z" fill="#FFC23D"/><circle cx="${x}" cy="${y - 8}" r="16" fill="#FFB347" opacity=".25"/>`); }
  if (kind === "flowers") for (let i = 0; i < 9; i++) { const x = (r() * 400) | 0, y = (r() * 200) | 0, c = ["#F59E2B", "#F2C230", "#E75A8C", "#fff"][i % 4]; out.push(`<g fill="${c}" opacity=".85">${[0, 72, 144, 216, 288].map((a) => `<circle cx="${(x + 6 * Math.cos((a * Math.PI) / 180)).toFixed(1)}" cy="${(y + 6 * Math.sin((a * Math.PI) / 180)).toFixed(1)}" r="4.5"/>`).join("")}</g>`); }
  if (kind === "sun") out.push(`<circle cx="${300 + ((r() * 60) | 0)}" cy="${90 + ((r() * 40) | 0)}" r="46" fill="#FFE2A6" opacity=".75"/>`);
  return out.join("");
}

module.exports = function sampleSvg(prompt, seedKey) {
  const t = (prompt.title + " " + prompt.text + " " + (prompt.for || "")).toLowerCase();
  const r = rng(hash(seedKey + t));
  const scene = SCENES.find(([re]) => re.test(t));
  const [bgTop, bgBottom] = scene ? scene[1] : DEFAULT_BG[hash(seedKey) % DEFAULT_BG.length];
  const found = COLORS.map(([re, c]) => [t.search(re), c]).filter(([i]) => i > -1).sort((a, b) => a[0] - b[0]).map(([, c]) => c);
  const outfit = found[0] || ["#B93D0B", "#2F5DA8", "#2E7D4F", "#7E57C2"][hash(t) % 4];
  const accent = found[1] || shade(outfit, 0.35);
  const skins = ["#C98B63", "#B57A55", "#D9A27C", "#A86E4C"];
  const skin = skins[hash(t) % skins.length];
  const hair = "#2A1D17";
  const many = /\b(family|parents|siblings|friends|group)\b/.test(t);
  const two = many || /\b(couple|both|husband|wife|bride and groom|brother and sister|sister and brother|mother and|father and|two people|duo|partner|together)\b/.test(t);
  const female = FEMALE.test(t);
  const male = MALE.test(t);
  let people;
  if (many) people = [person(110, 0.72, accent, skin, hair, true), person(290, 0.72, outfit, shade(skin, 0.06), hair, false), person(200, 0.86, shade(outfit, 0.25), shade(skin, -0.05), hair, false)];
  else if (two) people = [person(135, 0.86, outfit, skin, hair, female || !male), person(268, 0.9, accent, shade(skin, -0.06), hair, false)];
  else {
    const fi = t.search(FEMALE), mi = t.search(MALE);
    people = [person(200, 1, outfit, skin, hair, fi > -1 && (mi === -1 || fi < mi))];
  }
  const bokeh = [];
  for (let i = 0; i < 7; i++) bokeh.push(`<circle cx="${(r() * 400) | 0}" cy="${(r() * 300) | 0}" r="${(18 + r() * 46) | 0}" fill="#fff" opacity="${(0.06 + r() * 0.12).toFixed(2)}"/>`);
  const id = "g" + (hash(seedKey) % 1e6);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500" preserveAspectRatio="xMidYMid slice">
<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${bgTop}"/><stop offset="1" stop-color="${bgBottom}"/></linearGradient>
<radialGradient id="${id}v" cx=".5" cy=".42" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></radialGradient></defs>
<rect width="400" height="500" fill="url(#${id})"/>
${bokeh.join("")}
${motif(scene ? scene[2] : null, r, accent)}
<ellipse cx="200" cy="505" rx="260" ry="70" fill="${shade(bgBottom, -0.25)}" opacity=".45"/>
${people.join("\n")}
<rect width="400" height="500" fill="url(#${id}v)"/>
</svg>`;
};
