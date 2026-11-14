/* AI Prompt Hindi — photo tools. Everything runs in the visitor's browser:
   the photo is never uploaded anywhere. One engine drives every tool page;
   each page passes its mode and options in <div id="tool" data-mode data-opts>. */
(function () {
  "use strict";
  var root = document.getElementById("tool");
  if (!root) return;
  var MODE = root.getAttribute("data-mode");
  var OPTS = {};
  try { OPTS = JSON.parse(root.getAttribute("data-opts") || "{}"); } catch (e) {}

  // ---------- helpers ----------
  function el(html) { var d = document.createElement("div"); d.innerHTML = html.trim(); return d.firstChild; }
  function q(sel, ctx) { return (ctx || root).querySelector(sel); }
  function kb(b) { return (b / 1024).toFixed(b < 10240 ? 1 : 0) + " KB"; }
  function track(action) { try { if (window.gtag) gtag("event", "tool_use", { tool: MODE, action: action }); } catch (e) {} }
  function loadImage(file) {
    return new Promise(function (res, rej) {
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () { res(img); };
      img.onerror = function () { URL.revokeObjectURL(url); rej(new Error("decode")); };
      img.src = url;
    });
  }
  function canvas(w, h) { var c = document.createElement("canvas"); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; }
  function toBlob(c, type, qual) { return new Promise(function (res) { c.toBlob(function (b) { res(b); }, type, qual); }); }
  function white(ctx, w, h) { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h); }
  function drawScaled(src, w, h, bg) {
    var c = canvas(w, h), x = c.getContext("2d");
    if (bg) white(x, c.width, c.height);
    x.imageSmoothingQuality = "high";
    x.drawImage(src, 0, 0, c.width, c.height);
    return c;
  }
  function toPx(v, unit, dpi) {
    v = parseFloat(v) || 0;
    if (unit === "cm") return Math.round((v / 2.54) * dpi);
    if (unit === "mm") return Math.round((v / 25.4) * dpi);
    if (unit === "in") return Math.round(v * dpi);
    return Math.round(v);
  }
  function srcSize(s) { return { w: s.naturalWidth || s.width, h: s.naturalHeight || s.height }; }

  // JPEG at the best quality that stays under maxBytes (null if impossible at this size).
  async function jpegUnder(c, maxBytes) {
    var b = await toBlob(c, "image/jpeg", 0.92);
    if (b.size <= maxBytes) return b;
    var lo = 0.04, hi = 0.92, best = null;
    for (var i = 0; i < 8; i++) {
      var mid = (lo + hi) / 2, t = await toBlob(c, "image/jpeg", mid);
      if (t.size <= maxBytes) { best = t; lo = mid; } else hi = mid;
    }
    return best;
  }
  // Shrink dimensions step by step until the JPEG fits.
  async function compressTo(src, maxBytes, bg) {
    var s = srcSize(src), scale = Math.min(1, 4000 / Math.max(s.w, s.h));
    for (var i = 0; i < 30; i++) {
      var c = drawScaled(src, s.w * scale, s.h * scale, bg !== false);
      var b = await jpegUnder(c, maxBytes);
      if (b) return { blob: b, w: c.width, h: c.height };
      scale *= 0.82;
    }
    return null;
  }
  // Pad a JPEG with comment segments so it reaches minBytes (image unchanged).
  async function padJpeg(blob, minBytes) {
    var buf = new Uint8Array(await blob.arrayBuffer()), need = minBytes - buf.length;
    if (need <= 0) return blob;
    var parts = [buf.subarray(0, 2)];
    while (need > 0) {
      var n = Math.min(65533, Math.max(need - 4, 1));
      var seg = new Uint8Array(n + 4);
      seg[0] = 0xff; seg[1] = 0xfe; seg[2] = ((n + 2) >> 8) & 255; seg[3] = (n + 2) & 255;
      for (var i = 4; i < seg.length; i++) seg[i] = 32;
      parts.push(seg); need -= seg.length;
    }
    parts.push(buf.subarray(2));
    return new Blob(parts, { type: "image/jpeg" });
  }
  // Write print DPI into the JPEG JFIF header (pixels untouched).
  async function setDpi(blob, dpi) {
    var b = new Uint8Array(await blob.arrayBuffer());
    if (b[0] !== 0xff || b[1] !== 0xd8) return blob;
    var hi = (dpi >> 8) & 255, lo = dpi & 255;
    if (b[2] === 0xff && b[3] === 0xe0 && b[6] === 0x4a && b[7] === 0x46 && b[8] === 0x49 && b[9] === 0x46) {
      b[13] = 1; b[14] = hi; b[15] = lo; b[16] = hi; b[17] = lo;
      return new Blob([b], { type: "image/jpeg" });
    }
    var app0 = new Uint8Array([0xff, 0xe0, 0, 16, 0x4a, 0x46, 0x49, 0x46, 0, 1, 1, 1, hi, lo, hi, lo, 0, 0]);
    return new Blob([b.subarray(0, 2), app0, b.subarray(2)], { type: "image/jpeg" });
  }
  async function finishJpeg(c, o) {
    // o: {maxKB, minKB, dpi}. KB limits: max uses 1000 bytes/KB and min uses 1024,
    // so the file passes whichever definition the form uses.
    var b, warn = "";
    if (o.maxKB) {
      b = await jpegUnder(c, o.maxKB * 1000);
      if (!b) { b = await toBlob(c, "image/jpeg", 0.04); warn = "इस साइज़ (px) पर फोटो " + o.maxKB + " KB से छोटी नहीं हो पा रही। चौड़ाई/ऊंचाई कम करें।"; }
    } else b = await toBlob(c, "image/jpeg", 0.92);
    if (o.minKB && b.size < o.minKB * 1024) {
      var cap = o.maxKB ? o.maxKB * 1000 : Infinity, minB = o.minKB * 1024;
      var hq = await toBlob(c, "image/jpeg", 0.97);
      if (hq.size <= cap && hq.size > b.size) b = hq;
      if (b.size < minB) b = await padJpeg(b, Math.min(minB + 64, cap));
    }
    if (o.dpi) b = await setDpi(b, o.dpi);
    return { blob: b, warn: warn };
  }

  // ---------- shared UI ----------
  var multi = MODE === "pdf";
  root.innerHTML = "";
  var drop = el('<label class="drop"><input type="file" accept="' + (OPTS.accept || "image/*") + '"' + (multi ? " multiple" : "") + ' class="sr">' +
    '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></svg>' +
    "<b>" + (multi ? "फोटो चुनें (एक से ज़्यादा)" : "फोटो चुनें") + "</b><span>या यहाँ ड्रैग करें · फोटो आपके फोन से बाहर नहीं जाती</span></label>");
  var work = el('<div class="tl-work" hidden></div>');
  var out = el('<div class="tl-out" hidden aria-live="polite"></div>');
  root.appendChild(drop); root.appendChild(work); root.appendChild(out);
  var input = q("input", drop);
  var current = null, currentFile = null, lastUrl = null, lastPhoto = null, sheetBound = false;

  function showError(msg) { out.hidden = false; out.innerHTML = '<p class="tl-err">' + msg + "</p>"; }
  function showResult(blob, w, h, name, extra) {
    if (lastUrl) URL.revokeObjectURL(lastUrl);
    lastUrl = URL.createObjectURL(blob);
    out.hidden = false;
    var isImg = /^image\//.test(blob.type);
    out.innerHTML = (isImg ? '<img class="tl-prev" src="' + lastUrl + '" alt="नतीजा">' : "") +
      '<div class="tl-info"><b>' + kb(blob.size) + "</b>" + (w ? " · " + w + "×" + h + " px" : "") + (extra || "") + "</div>" +
      '<a class="copy" href="' + lastUrl + '" download="' + name + '">⬇ डाउनलोड करें</a>';
    track("download_ready");
  }
  function onFiles(files) {
    if (!files || !files.length) return;
    if (multi) return pdfAdd(files);
    var f = files[0];
    currentFile = f;
    loadImage(f).then(function (img) {
      current = img; work.hidden = false; out.hidden = true;
      drop.classList.add("small");
      q("b", drop).textContent = "दूसरी फोटो चुनें";
      setup(img, f);
      track("open");
    }, function () { showError("यह फ़ाइल नहीं खुली। JPG, PNG या WEBP फोटो चुनें (iPhone की HEIC फोटो को पहले JPG में सेव करें)।"); });
  }
  input.addEventListener("change", function () { onFiles(input.files); input.value = ""; });
  ["dragover", "dragenter"].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.add("over"); }); });
  ["dragleave", "drop"].forEach(function (t) { drop.addEventListener(t, function () { drop.classList.remove("over"); }); });
  drop.addEventListener("drop", function (e) { e.preventDefault(); onFiles(e.dataTransfer.files); });

  function baseName() { return (currentFile && currentFile.name ? currentFile.name.replace(/\.[^.]+$/, "") : "photo").replace(/[^\w\-]+/g, "_").slice(0, 40) || "photo"; }
  function field(label, html) { return '<label class="tl-f"><span>' + label + "</span>" + html + "</label>"; }
  function num(name, val, extra) { return '<input type="number" inputmode="decimal" min="0" step="any" name="' + name + '" value="' + (val == null ? "" : val) + '"' + (extra || "") + ">"; }
  function val(name) { var i = q('[name="' + name + '"]', work); return i ? i.value : ""; }
  function busy(btn, on) { if (btn) { btn.disabled = on; btn.textContent = on ? "बन रहा है…" : btn.getAttribute("data-label"); } }

  // ---------- cropper: drag to move, slider to zoom, rotate ----------
  function Cropper(host, img, ratio) {
    var self = this;
    self.src = img; self.ratio = ratio; self.zoom = 1; self.rot = 0;
    var wrap = el('<div class="crop"><canvas></canvas><div class="crop-bar"><button type="button" class="icon-btn" data-r aria-label="घुमाएं">⟳</button><input type="range" min="0.5" max="4" step="0.01" value="1" aria-label="ज़ूम"><span>खींचकर सेट करें</span></div></div>');
    host.appendChild(wrap);
    var cv = q("canvas", wrap), ctx = cv.getContext("2d"), range = q("input", wrap);
    self.reset = function () { var s = srcSize(self.src); self.cx = s.w / 2; self.cy = s.h / 2; self.zoom = 1; range.value = 1; self.draw(); };
    self.size = function () {
      var W = Math.min(host.clientWidth || 320, 440);
      var H = Math.round(W / self.ratio);
      if (H > 460) { H = 460; W = Math.round(H * self.ratio); }
      return { W: W, H: H };
    };
    self.scale = function (W, H) { var s = srcSize(self.src); return Math.max(W / s.w, H / s.h) * self.zoom; };
    self.clamp = function (W, H) {
      var s = srcSize(self.src), k = self.scale(W, H), hw = W / 2 / k, hh = H / 2 / k;
      self.cx = hw * 2 >= s.w ? s.w / 2 : Math.min(Math.max(self.cx, hw), s.w - hw);
      self.cy = hh * 2 >= s.h ? s.h / 2 : Math.min(Math.max(self.cy, hh), s.h - hh);
    };
    self.render = function (c, W, H, bg) {
      var x = c.getContext("2d"), k = self.scale(W, H);
      if (bg !== false) white(x, c.width, c.height);
      x.imageSmoothingQuality = "high";
      var sw = c.width / W;
      x.setTransform(k * sw, 0, 0, k * sw, (W / 2 - self.cx * k) * sw, (H / 2 - self.cy * k) * sw);
      x.drawImage(self.src, 0, 0);
      x.setTransform(1, 0, 0, 1, 0, 0);
    };
    self.draw = function () {
      var d = self.size(), dpr = window.devicePixelRatio || 1;
      cv.style.width = d.W + "px"; cv.style.height = d.H + "px";
      cv.width = Math.round(d.W * dpr); cv.height = Math.round(d.H * dpr);
      self.clamp(d.W, d.H);
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, cv.width, cv.height);
      self.render(cv, d.W, d.H, true);
      if (self.guide) self.guide(ctx, cv.width, cv.height);
    };
    // Output canvas of exactly outW×outH showing the framed area.
    self.output = function (outW, outH, bg) { var d = self.size(), c = canvas(outW, outH); self.render(c, d.W, d.H, bg); return c; };
    // The framed area in source pixels (for "keep original resolution").
    self.frameSize = function () { var d = self.size(), k = self.scale(d.W, d.H); return { w: Math.round(d.W / k), h: Math.round(d.H / k) }; };
    self.setRatio = function (r) { self.ratio = r; self.draw(); };
    var drag = null;
    cv.addEventListener("pointerdown", function (e) { drag = { x: e.clientX, y: e.clientY }; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener("pointermove", function (e) {
      if (!drag) return;
      var d = self.size(), k = self.scale(d.W, d.H);
      self.cx -= (e.clientX - drag.x) / k; self.cy -= (e.clientY - drag.y) / k;
      drag = { x: e.clientX, y: e.clientY }; self.draw();
    });
    cv.addEventListener("pointerup", function () { drag = null; if (self.onchange) self.onchange(); });
    cv.addEventListener("wheel", function (e) { e.preventDefault(); self.zoom = Math.min(4, Math.max(0.5, self.zoom * (e.deltaY < 0 ? 1.06 : 0.94))); range.value = self.zoom; self.draw(); }, { passive: false });
    range.addEventListener("input", function () { self.zoom = parseFloat(range.value); self.draw(); });
    q("[data-r]", wrap).addEventListener("click", function () {
      var s = srcSize(self.src), c = canvas(s.h, s.w), x = c.getContext("2d");
      x.translate(c.width, 0); x.rotate(Math.PI / 2); x.drawImage(self.src, 0, 0);
      self.src = c; self.reset();
    });
    window.addEventListener("resize", function () { self.draw(); });
    self.reset();
  }

  // ---------- modes ----------
  var setup = {
    compress: function (img, f) {
      work.innerHTML = '<div class="tl-row">' + field("ज़्यादा से ज़्यादा साइज़ (KB)", num("max", OPTS.maxKB || 50)) + "</div>" +
        '<p class="tl-note">ओरिजिनल: ' + kb(f.size) + " · " + img.naturalWidth + "×" + img.naturalHeight + " px</p>";
      var run = async function () {
        var m = parseFloat(val("max"));
        if (!(m > 0)) return;
        var r = await compressTo(img, m * 1000);
        if (!r) return showError("इतनी छोटी साइज़ नहीं बन पाई। KB थोड़ा बढ़ाकर देखें।");
        var b = OPTS.dpi ? await setDpi(r.blob, OPTS.dpi) : r.blob;
        var sm = r.w < img.naturalWidth ? ' · <span class="tl-note">साइज़ में लाने के लिए फोटो छोटी की गई</span>' : "";
        showResult(b, r.w, r.h, baseName() + "-" + Math.round(m) + "kb.jpg", sm);
      };
      q('[name="max"]', work).addEventListener("change", run);
      run();
    },
    increase: function (img, f) {
      work.innerHTML = '<div class="tl-row">' + field("कम से कम साइज़ (KB)", num("min", OPTS.minKB || 50)) + field("ज़्यादा से ज़्यादा (KB, वैकल्पिक)", num("max", OPTS.maxKB || "")) + "</div>" +
        '<p class="tl-note">ओरिजिनल: ' + kb(f.size) + " · " + img.naturalWidth + "×" + img.naturalHeight + " px · चौड़ाई-ऊंचाई वही रहेगी</p>";
      var run = async function () {
        var mn = parseFloat(val("min")), mx = parseFloat(val("max")) || 0;
        if (!(mn > 0)) return;
        if (mx && mx * 1000 < mn * 1024) return showError("ज़्यादा वाली KB, कम वाली से बड़ी होनी चाहिए।");
        var c = drawScaled(img, img.naturalWidth, img.naturalHeight, true);
        var r = await finishJpeg(c, { minKB: mn, maxKB: mx || null, dpi: OPTS.dpi });
        showResult(r.blob, c.width, c.height, baseName() + "-" + Math.round(mn) + "kb.jpg", r.warn ? '<p class="tl-err">' + r.warn + "</p>" : "");
      };
      [].forEach.call(work.querySelectorAll("input"), function (i) { i.addEventListener("change", run); });
      run();
    },
    photo: function (img) {
      var P = OPTS.presets || [{ label: "3.5×4.5 cm", w: 35, h: 45, unit: "mm", dpi: 300 }];
      var cap = !!OPTS.caption, today = new Date();
      var dd = ("0" + today.getDate()).slice(-2) + "-" + ("0" + (today.getMonth() + 1)).slice(-2) + "-" + today.getFullYear();
      work.innerHTML =
        (P.length > 1 ? '<div class="seg" role="group" aria-label="साइज़">' + P.map(function (p, i) { return '<button type="button" data-p="' + i + '"' + (i ? "" : ' class="on"') + ">" + p.label + "</button>"; }).join("") + "</div>" : "") +
        '<div class="tl-crop"></div>' +
        '<div class="tl-row">' + field("चौड़ाई", num("w", "")) + field("ऊंचाई", num("h", "")) +
        field("यूनिट", '<select name="unit"><option value="mm">mm</option><option value="cm">cm</option><option value="in">inch</option><option value="px">px</option></select>') +
        field("DPI", num("dpi", 300)) + "</div>" +
        '<div class="tl-row">' + field("कम से कम KB", num("min", "")) + field("ज़्यादा से ज़्यादा KB", num("max", "")) + "</div>" +
        (cap ? '<div class="tl-row">' + field("नाम", '<input name="cname" autocomplete="name" placeholder="RAHUL KUMAR">') + field("फोटो की तारीख", '<input name="cdate" value="' + dd + '">') + "</div>" : "") +
        (OPTS.clean ? '<label class="tl-chk"><input type="checkbox" name="clean" checked> बैकग्राउंड सफ़ेद और सिग्नेचर गहरा करें</label>' +
          field("सफ़ाई का लेवल", '<input type="range" name="thr" min="110" max="225" value="170">') : "") +
        '<button type="button" class="copy" data-go data-label="फोटो बनाएं">फोटो बनाएं</button>' +
        "";
      var cropper, preset;
      function dims() {
        var u = val("unit"), d = parseFloat(val("dpi")) || 300;
        return { u: u, dpi: d, W: toPx(val("w"), u, d), H: toPx(val("h"), u, d) };
      }
      function ratio() { var d = dims(); if (!(d.W > 0 && d.H > 0)) return 1; return cap ? d.W / (d.H * (1 - 0.2)) : d.W / d.H; }
      function apply(i) {
        preset = P[i];
        q('[name="w"]', work).value = preset.unit === "mm" && preset.showCm ? preset.w / 10 : preset.w;
        q('[name="h"]', work).value = preset.unit === "mm" && preset.showCm ? preset.h / 10 : preset.h;
        q('[name="unit"]', work).value = preset.unit === "mm" && preset.showCm ? "cm" : preset.unit;
        q('[name="dpi"]', work).value = preset.dpi || 300;
        q('[name="min"]', work).value = preset.minKB || "";
        q('[name="max"]', work).value = preset.maxKB || "";
        [].forEach.call(work.querySelectorAll("[data-p]"), function (b) { b.classList.toggle("on", +b.getAttribute("data-p") === i); });
        if (cropper) cropper.setRatio(ratio());
      }
      cropper = new Cropper(q(".tl-crop", work), img, 1);
      if (cap) cropper.guide = function (x, w, h) { x.fillStyle = "rgba(255,255,255,.7)"; x.fillRect(0, h * 0.8, w, h * 0.2); };
      apply(0);
      work.addEventListener("click", function (e) { var b = e.target.closest("[data-p]"); if (b) apply(+b.getAttribute("data-p")); });
      ["w", "h", "unit", "dpi"].forEach(function (n) { q('[name="' + n + '"]', work).addEventListener("change", function () { cropper.setRatio(ratio()); }); });
      lastPhoto = null;
      function build() {
        var d = dims();
        if (!(d.W > 0 && d.H > 0) || d.W > 6000 || d.H > 6000) { showError("चौड़ाई और ऊंचाई सही डालें।"); return null; }
        var c;
        if (cap) {
          var ph = Math.round(d.H * 0.8);
          c = canvas(d.W, d.H);
          var x = c.getContext("2d");
          white(x, d.W, d.H);
          x.drawImage(cropper.output(d.W, ph), 0, 0);
          var name = (val("cname") || "").trim().toUpperCase(), date = (val("cdate") || "").trim();
          var lines = [name, date].filter(Boolean), sh = d.H - ph;
          x.fillStyle = "#000"; x.textAlign = "center"; x.textBaseline = "middle";
          var fs = Math.floor(sh / (lines.length > 1 ? 2.5 : 1.8));
          lines.forEach(function (t, i) {
            var s = fs; x.font = "bold " + s + "px Arial, sans-serif";
            while (x.measureText(t).width > d.W * 0.94 && s > 6) { s--; x.font = "bold " + s + "px Arial, sans-serif"; }
            x.fillText(t, d.W / 2, ph + (sh / (lines.length + 1)) * (i + 1));
          });
        } else c = cropper.output(d.W, d.H);
        if (OPTS.clean && q('[name="clean"]', work).checked) {
          var t = parseFloat(val("thr")), cx = c.getContext("2d"), id = cx.getImageData(0, 0, c.width, c.height), p = id.data;
          for (var i = 0; i < p.length; i += 4) {
            var l = 0.299 * p[i] + 0.587 * p[i + 1] + 0.114 * p[i + 2];
            if (l > t) { p[i] = p[i + 1] = p[i + 2] = 255; } else { p[i] *= 0.55; p[i + 1] *= 0.55; p[i + 2] *= 0.55; }
          }
          cx.putImageData(id, 0, 0);
        }
        return { c: c, d: d };
      }
      q("[data-go]", work).addEventListener("click", async function () {
        var btn = this; busy(btn, true);
        try {
          var r = build(); if (!r) return;
          var mn = parseFloat(val("min")) || null, mx = parseFloat(val("max")) || null;
          if (mn && mx && mx * 1000 < mn * 1024) return showError("ज़्यादा वाली KB, कम वाली से बड़ी होनी चाहिए।");
          var res = await finishJpeg(r.c, { minKB: mn, maxKB: mx, dpi: Math.round(r.d.dpi) });
          lastPhoto = r;
          var phys = r.d.u === "px" ? "" : " · " + val("w") + "×" + val("h") + " " + (r.d.u === "in" ? "inch" : r.d.u) + " @ " + Math.round(r.d.dpi) + " DPI";
          showResult(res.blob, r.c.width, r.c.height, (OPTS.file || "photo") + "-" + r.c.width + "x" + r.c.height + ".jpg", phys + (res.warn ? '<p class="tl-err">' + res.warn + "</p>" : ""));
          if (OPTS.sheet && r.d.u !== "px") out.appendChild(el('<div class="tl-sheet"><p class="tl-note">प्रिंट करवाना है? एक शीट पर कई कॉपी:</p><button type="button" class="ghost" data-sheet="4x6">4×6 इंच शीट</button><button type="button" class="ghost" data-sheet="a4">A4 शीट</button></div>'));
        } finally { busy(btn, false); }
      });
      if (sheetBound) return;
      sheetBound = true;
      root.addEventListener("click", async function (e) {
        var b = e.target.closest("[data-sheet]"); if (!b || !lastPhoto) return;
        var d = lastPhoto.d, kind = b.getAttribute("data-sheet");
        // Lay copies out at real size on a 300 DPI sheet with thin cut lines.
        var pw = Math.round((d.W / d.dpi) * 300), ph = Math.round((d.H / d.dpi) * 300);
        var SW = kind === "a4" ? 2480 : 1800, SH = kind === "a4" ? 3508 : 1200, gap = 24, m = 60;
        var cols = Math.max(1, Math.floor((SW - 2 * m + gap) / (pw + gap))), rows = Math.max(1, Math.floor((SH - 2 * m + gap) / (ph + gap)));
        var s = canvas(SW, SH), x = s.getContext("2d"); white(x, SW, SH);
        var ox = Math.round((SW - cols * pw - (cols - 1) * gap) / 2), oy = Math.round((SH - rows * ph - (rows - 1) * gap) / 2);
        x.strokeStyle = "#bdbdbd"; x.lineWidth = 2;
        for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
          var px = ox + c * (pw + gap), py = oy + r * (ph + gap);
          x.drawImage(lastPhoto.c, px, py, pw, ph); x.strokeRect(px - 1, py - 1, pw + 2, ph + 2);
        }
        var blob = await setDpi(await toBlob(s, "image/jpeg", 0.95), 300);
        var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "print-sheet-" + kind + "-" + rows * cols + "-photos.jpg";
        document.body.appendChild(a); a.click(); a.remove();
        b.textContent = "✓ " + rows * cols + " फोटो वाली शीट डाउनलोड हुई";
        track("sheet_" + kind);
      });
    },
    crop: function (img, f) {
      var R = OPTS.ratios || [["ओरिजिनल", 0], ["1:1", 1], ["4:5", 0.8], ["3:4", 0.75], ["16:9", 16 / 9], ["9:16", 9 / 16]];
      var orig = img.naturalWidth / img.naturalHeight;
      work.innerHTML = '<div class="seg" role="group" aria-label="अनुपात">' + R.map(function (r, i) { return '<button type="button" data-r="' + i + '"' + (i ? "" : ' class="on"') + ">" + r[0] + "</button>"; }).join("") + "</div>" +
        '<div class="tl-crop"></div><button type="button" class="copy" data-go data-label="क्रॉप करें">क्रॉप करें</button>';
      var cr = new Cropper(q(".tl-crop", work), img, R[0][1] || orig);
      work.addEventListener("click", function (e) {
        var b = e.target.closest(".seg [data-r]"); if (!b) return;
        var r = R[+b.getAttribute("data-r")]; cr.setRatio(r[1] || orig);
        [].forEach.call(work.querySelectorAll(".seg [data-r]"), function (x) { x.classList.toggle("on", x === b); });
      });
      q("[data-go]", work).addEventListener("click", async function () {
        var fs = cr.frameSize(), k = Math.min(1, 4000 / Math.max(fs.w, fs.h));
        var png = f.type === "image/png", c = cr.output(fs.w * k, fs.h * k, !png);
        var b = png ? await toBlob(c, "image/png") : await toBlob(c, "image/jpeg", 0.92);
        showResult(b, c.width, c.height, baseName() + "-crop." + (png ? "png" : "jpg"));
      });
    },
    resize: function (img, f) {
      var u = OPTS.unit || "px", dpi = OPTS.dpi || 300;
      work.innerHTML = '<div class="tl-row">' + field("चौड़ाई", num("w", "")) + field("ऊंचाई", num("h", "")) +
        field("यूनिट", '<select name="unit"><option value="px">px</option><option value="cm">cm</option><option value="mm">mm</option><option value="in">inch</option></select>') +
        field("DPI", num("dpi", dpi)) + "</div>" +
        '<label class="tl-chk"><input type="checkbox" name="lock" checked> अनुपात (aspect ratio) लॉक रखें</label>' +
        '<div class="tl-row">' + field("ज़्यादा से ज़्यादा KB (वैकल्पिक)", num("max", "")) + "</div>" +
        '<p class="tl-note">ओरिजिनल: ' + img.naturalWidth + "×" + img.naturalHeight + " px · " + kb(f.size) + "</p>" +
        '<button type="button" class="copy" data-go data-label="रीसाइज़ करें">रीसाइज़ करें</button>';
      var W = q('[name="w"]', work), H = q('[name="h"]', work), U = q('[name="unit"]', work), D = q('[name="dpi"]', work), L = q('[name="lock"]', work);
      var ar = img.naturalWidth / img.naturalHeight;
      function fromPx(px) { var d = parseFloat(D.value) || 300, unit = U.value; var v = unit === "cm" ? (px / d) * 2.54 : unit === "mm" ? (px / d) * 25.4 : unit === "in" ? px / d : px; return unit === "px" ? Math.round(v) : Math.round(v * 100) / 100; }
      U.value = u; W.value = fromPx(img.naturalWidth); H.value = fromPx(img.naturalHeight);
      U.addEventListener("change", function () { W.value = fromPx(img.naturalWidth); H.value = fromPx(img.naturalHeight); });
      W.addEventListener("input", function () { if (L.checked) H.value = U.value === "px" ? Math.round(W.value / ar) : Math.round((W.value / ar) * 100) / 100; });
      H.addEventListener("input", function () { if (L.checked) W.value = U.value === "px" ? Math.round(H.value * ar) : Math.round(H.value * ar * 100) / 100; });
      q("[data-go]", work).addEventListener("click", async function () {
        var d = parseFloat(D.value) || 300, pw = toPx(W.value, U.value, d), ph = toPx(H.value, U.value, d);
        if (!(pw > 0 && ph > 0) || pw > 8000 || ph > 8000) return showError("चौड़ाई और ऊंचाई सही डालें (8000 px तक)।");
        var png = f.type === "image/png" && !val("max"), c = drawScaled(img, pw, ph, !png), b, warn = "";
        if (png) b = await toBlob(c, "image/png");
        else { var r = await finishJpeg(c, { maxKB: parseFloat(val("max")) || null, dpi: Math.round(d) }); b = r.blob; warn = r.warn; }
        showResult(b, pw, ph, baseName() + "-" + pw + "x" + ph + (png ? ".png" : ".jpg"), (U.value !== "px" ? " · " + W.value + "×" + H.value + " " + U.value + " @ " + Math.round(d) + " DPI" : "") + (warn ? '<p class="tl-err">' + warn + "</p>" : ""));
      });
    },
    dpi: function (img, f) {
      work.innerHTML = '<div class="tl-row">' + field("नया DPI", num("dpi", OPTS.dpi || 300)) + "</div>" +
        '<p class="tl-note">पिक्सल और क्वालिटी वही रहती है — सिर्फ़ फ़ाइल में DPI बदलता है। ' + img.naturalWidth + "×" + img.naturalHeight + " px</p>" +
        '<button type="button" class="copy" data-go data-label="DPI बदलें">DPI बदलें</button>';
      q("[data-go]", work).addEventListener("click", async function () {
        var d = Math.round(parseFloat(val("dpi")) || 300);
        if (d < 1 || d > 65535) return showError("DPI 1 से 65535 के बीच डालें।");
        var src = f.type === "image/jpeg" ? f : await toBlob(drawScaled(img, img.naturalWidth, img.naturalHeight, true), "image/jpeg", 0.95);
        var b = await setDpi(src, d);
        var cm = function (px) { return ((px / d) * 2.54).toFixed(2); };
        showResult(b, img.naturalWidth, img.naturalHeight, baseName() + "-" + d + "dpi.jpg", " · " + d + " DPI पर प्रिंट साइज़ " + cm(img.naturalWidth) + "×" + cm(img.naturalHeight) + " cm");
      });
    },
    convert: function (img, f) {
      var to = OPTS.to || "image/jpeg", ext = to === "image/png" ? "png" : to === "image/webp" ? "webp" : "jpg";
      var run = async function () {
        var c = drawScaled(img, img.naturalWidth, img.naturalHeight, to === "image/jpeg");
        var b = await toBlob(c, to, 0.92);
        showResult(b, c.width, c.height, baseName() + "." + ext);
      };
      work.innerHTML = '<p class="tl-note">ओरिजिनल: ' + (f.type || "image") + " · " + kb(f.size) + "</p>";
      run();
    }
  };
  setup = (function (s) { return function (img, f) { (s[MODE] || s.compress)(img, f); }; })(setup);

  // ---------- JPG → PDF ----------
  var pdfList = [];
  function pdfAdd(files) {
    work.hidden = false; drop.classList.add("small"); q("b", drop).textContent = "और फोटो जोड़ें";
    if (!q(".pdf-list", work)) {
      work.innerHTML = '<ol class="pdf-list"></ol><div class="tl-row">' +
        field("पेज साइज़", '<select name="page"><option value="a4">A4</option><option value="fit">फोटो जितना</option></select>') +
        field("मार्जिन", '<select name="margin"><option value="24">छोटा</option><option value="0">कोई नहीं</option><option value="48">बड़ा</option></select>') +
        field("क्वालिटी", '<select name="qual"><option value="0.85">अच्छी</option><option value="0.7">कम साइज़</option><option value="0.95">सबसे अच्छी</option></select>') + "</div>" +
        '<button type="button" class="copy" data-go data-label="PDF बनाएं">PDF बनाएं</button>';
      q("[data-go]", work).addEventListener("click", makePdf);
      q(".pdf-list", work).addEventListener("click", function (e) {
        var b = e.target.closest("[data-a]"); if (!b) return;
        var i = +b.getAttribute("data-i"), a = b.getAttribute("data-a");
        if (a === "x") pdfList.splice(i, 1);
        if (a === "u" && i > 0) pdfList.splice(i - 1, 0, pdfList.splice(i, 1)[0]);
        if (a === "d" && i < pdfList.length - 1) pdfList.splice(i + 1, 0, pdfList.splice(i, 1)[0]);
        pdfRender();
      });
    }
    var jobs = [].map.call(files, function (f) { return loadImage(f).then(function (img) { return { img: img, name: f.name }; }, function () { return null; }); });
    Promise.all(jobs).then(function (r) {
      var bad = r.filter(function (x) { return !x; }).length;
      pdfList = pdfList.concat(r.filter(Boolean)); pdfRender();
      if (bad) showError(bad + " फ़ाइल नहीं खुली — सिर्फ़ JPG/PNG/WEBP फोटो जोड़ें।"); else out.hidden = true;
      track("open");
    });
  }
  function pdfRender() {
    q(".pdf-list", work).innerHTML = pdfList.map(function (p, i) {
      return '<li><img src="' + p.img.src + '" alt=""><span>' + p.name.replace(/</g, "") + '</span><button type="button" class="icon-btn" data-a="u" data-i="' + i + '" aria-label="ऊपर">↑</button><button type="button" class="icon-btn" data-a="d" data-i="' + i + '" aria-label="नीचे">↓</button><button type="button" class="icon-btn" data-a="x" data-i="' + i + '" aria-label="हटाएं">✕</button></li>';
    }).join("");
  }
  async function makePdf() {
    if (!pdfList.length) return;
    var btn = this; busy(btn, true);
    try {
      var enc = new TextEncoder(), parts = [], offs = [], len = 0;
      var push = function (x) { var b = typeof x === "string" ? enc.encode(x) : x; parts.push(b); len += b.length; };
      var mode = val("page"), margin = parseFloat(val("margin")) || 0, qual = parseFloat(val("qual")) || 0.85;
      var n = pdfList.length, kids = [];
      // Objects: 1 catalog, 2 pages, then 3 per image (page, content, image).
      push("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
      var objs = [];
      for (var i = 0; i < n; i++) {
        var im = pdfList[i].img, s = srcSize(im), k = Math.min(1, 2200 / Math.max(s.w, s.h));
        var c = drawScaled(im, s.w * k, s.h * k, true);
        var jpg = new Uint8Array(await (await toBlob(c, "image/jpeg", qual)).arrayBuffer());
        var PW, PH, dw, dh;
        if (mode === "fit") { dw = c.width * 0.75; dh = c.height * 0.75; PW = dw + 2 * margin; PH = dh + 2 * margin; }
        else { PW = 595.28; PH = 841.89; var f = Math.min((PW - 2 * margin) / c.width, (PH - 2 * margin) / c.height); dw = c.width * f; dh = c.height * f; }
        var x = (PW - dw) / 2, y = (PH - dh) / 2, base = 3 + i * 3;
        kids.push(base + " 0 R");
        objs.push([base, "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " + PW.toFixed(2) + " " + PH.toFixed(2) + "] /Resources << /XObject << /Im" + i + " " + (base + 2) + " 0 R >> >> /Contents " + (base + 1) + " 0 R >>"]);
        var cs = "q " + dw.toFixed(2) + " 0 0 " + dh.toFixed(2) + " " + x.toFixed(2) + " " + y.toFixed(2) + " cm /Im" + i + " Do Q";
        objs.push([base + 1, "<< /Length " + cs.length + " >>\nstream\n" + cs + "\nendstream"]);
        objs.push([base + 2, "<< /Type /XObject /Subtype /Image /Width " + c.width + " /Height " + c.height + " /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length " + jpg.length + " >>\nstream\n", jpg]);
      }
      objs.unshift([2, "<< /Type /Pages /Kids [" + kids.join(" ") + "] /Count " + n + " >>"]);
      objs.unshift([1, "<< /Type /Catalog /Pages 2 0 R >>"]);
      objs.sort(function (a, b) { return a[0] - b[0]; });
      objs.forEach(function (o) {
        offs[o[0]] = len;
        push(o[0] + " 0 obj\n" + o[1]);
        if (o[2]) { push(o[2]); push("\nendstream"); }
        push("\nendobj\n");
      });
      var xref = len, total = objs.length + 1;
      var xr = "xref\n0 " + total + "\n0000000000 65535 f \n";
      for (var j = 1; j < total; j++) xr += ("0000000000" + offs[j]).slice(-10) + " 00000 n \n";
      push(xr + "trailer\n<< /Size " + total + " /Root 1 0 R >>\nstartxref\n" + xref + "\n%%EOF\n");
      var blob = new Blob(parts, { type: "application/pdf" });
      showResult(blob, 0, 0, "photos-" + n + "-pages.pdf", " · " + n + " पेज की PDF");
    } finally { busy(btn, false); }
  }
})();
