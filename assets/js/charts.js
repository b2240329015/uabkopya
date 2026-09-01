/* ============================================================
   charts.js — hafif, animasyonlu SVG grafik kütüphanesi
   line/area · bar · donut · counter — hepsi hover-etkileşimli
   ============================================================ */
(function () {
  "use strict";
  const SVGNS = "http://www.w3.org/2000/svg";
  const el = (n, a = {}) => {
    const e = document.createElementNS(SVGNS, n);
    for (const k in a) e.setAttribute(k, a[k]);
    return e;
  };
  const nf = (window.MDUtil && window.MDUtil.nf0) || new Intl.NumberFormat("tr-TR");

  /* Yönetim panelinde tıklanıp düzenlenebilsin diye, grafik öğesine kaynak
     veritabanı satırını iliştirir. Panel yoksa hiçbir etkisi olmaz. */
  function markEdit(node, desc) {
    if (!desc) return;
    node.setAttribute("data-edit", JSON.stringify(desc));
  }

  // Ortak tooltip
  let tip;
  function getTip() {
    if (!tip) { tip = document.createElement("div"); tip.className = "chart-tip"; document.body.appendChild(tip); }
    return tip;
  }
  function showTip(html, x, y) {
    const t = getTip(); t.innerHTML = html; t.style.opacity = "1"; t.style.transform = "translate(-50%,-100%)";
    t.style.left = x + "px"; t.style.top = y - 12 + "px";
    // Kenar sütunlarda (ilk/son ay gibi) balon ekran dışına taşmasın
    requestAnimationFrame(() => {
      if (t.style.opacity !== "1") return; // hover bu arada bitmiş olabilir
      const r = t.getBoundingClientRect();
      let dx = 0;
      if (r.left < 8) dx = 8 - r.left;
      else if (r.right > window.innerWidth - 8) dx = window.innerWidth - 8 - r.right;
      t.style.transform = dx ? `translate(calc(-50% + ${dx}px), -100%)` : "translate(-50%,-100%)";
    });
  }
  function hideTip() { if (tip) tip.style.opacity = "0"; }

  // Smooth path (Catmull-Rom → bezier)
  function smooth(pts) {
    if (pts.length < 2) return "";
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
      const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += `C${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
    }
    return d;
  }

  // Düz path (Straight lines)
  function straight(pts) {
    if (pts.length < 2) return "";
    return `M${pts[0][0]},${pts[0][1]}` + pts.slice(1).map(p => `L${p[0]},${p[1]}`).join("");
  }

  /* ---------- Line / Area ---------- */
  function lineArea(host, opts) {
    host.innerHTML = "";
    const W = 720, H = 220, pad = { t: 16, r: 16, b: 28, l: 52 };
    const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: "xMidYMid meet" });
    const xs = opts.labels;
    const allVals = opts.series.flatMap((s) => s.values);
    let max = Math.max(...allVals), min = Math.min(0, ...allVals);
    max = max * 1.08 || 1;
    const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
    const X = (i) => pad.l + (iw * i) / (xs.length - 1);
    const Y = (v) => pad.t + ih - (ih * (v - min)) / (max - min);

    // ızgara + y etiketleri
    const ticks = 4;
    for (let i = 0; i <= ticks; i++) {
      const v = min + ((max - min) * i) / ticks, y = Y(v);
      svg.appendChild(el("line", { x1: pad.l, y1: y, x2: W - pad.r, y2: y, class: "grid-line" }));
      const tx = el("text", { x: pad.l - 12, y: y + 4, class: "axis-label", "text-anchor": "end" });
      const hv = window.MDUtil.human(v); tx.textContent = hv.v + (hv.u ? " " + hv.u[0].toUpperCase() : "");
      svg.appendChild(tx);
    }
    // x etiketleri
    xs.forEach((lb, i) => {
      const t = el("text", { x: X(i), y: H - 12, class: "axis-label", "text-anchor": "middle" });
      t.textContent = lb; svg.appendChild(t);
    });

    const grad = el("linearGradient", { id: "areaG" + Math.random().toString(36).slice(2, 7), x1: 0, y1: 0, x2: 0, y2: 1 });
    const gid = grad.getAttribute("id");
    grad.appendChild(el("stop", { offset: "0%", "stop-color": opts.series[0].color, "stop-opacity": 0.35 }));
    grad.appendChild(el("stop", { offset: "100%", "stop-color": opts.series[0].color, "stop-opacity": 0 }));
    svg.appendChild(grad);

    opts.series.forEach((s, si) => {
      const pts = s.values.map((v, i) => [X(i), Y(v)]);
      const d = opts.straight ? straight(pts) : smooth(pts);
      if (si === 0) {
        const area = el("path", { d: `${d}L${X(xs.length - 1)},${Y(min)}L${X(0)},${Y(min)}Z`, fill: `url(#${gid})` });
        svg.appendChild(area);
      }
      const line = el("path", { d, fill: "none", stroke: s.color, "stroke-width": 3, "stroke-linecap": "round" });
      svg.appendChild(line);
      const len = line.getTotalLength();
      line.style.strokeDasharray = len; line.style.strokeDashoffset = len;
      line.style.transition = "stroke-dashoffset 1.4s cubic-bezier(0.22,1,0.36,1)";
      requestAnimationFrame(() => (line.style.strokeDashoffset = "0"));
      // noktalar + hover
      pts.forEach((p, i) => {
        const dot = el("circle", { cx: p[0], cy: p[1], r: 4, fill: "#ffffff", stroke: s.color, "stroke-width": 2, style: "cursor:pointer" });
        if (s.edit) markEdit(dot, s.edit(i));
        dot.addEventListener("mouseenter", () => {
          dot.setAttribute("r", 6);
          const rect = host.getBoundingClientRect(), sc = rect.width / W;
          showTip(`<b>${xs[i]}</b> — ${s.name}<br><b>${nf.format(s.values[i])}</b> ${opts.unit || ""}`,
            rect.left + p[0] * sc, rect.top + p[1] * sc + window.scrollY);
        });
        dot.addEventListener("mouseleave", () => { dot.setAttribute("r", 4); hideTip(); });
        svg.appendChild(dot);
      });
    });
    host.appendChild(svg);
  }

  /* ---------- Bars ---------- */
  function bars(host, opts) {
    host.innerHTML = "";
    const items = opts.items;
    const fs = opts.labelFontSize || 12.5;
    const barH = 16;
    const W = 720, rowH = Math.max(32, barH + 14), H = items.length * rowH + 16;
    const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: "xMidYMid meet" });
    const max = Math.max(...items.map((d) => d.value)) * 1.02;
    const labelW = Math.max(170, fs * 11), barMax = W - labelW - 85;
    items.forEach((d, i) => {
      const y = 8 + i * rowH, barY = y + (rowH - barH) / 2, mid = barY + barH / 2 + fs * 0.35;
      const lbl = el("text", { x: 0, y: mid, class: "axis-label", "font-size": fs });
      lbl.setAttribute("fill", "var(--text-soft)"); lbl.textContent = d.label;
      markEdit(lbl, d.editLabel);
      svg.appendChild(lbl);
      svg.appendChild(el("rect", { x: labelW, y: barY, width: barMax, height: barH, rx: 7, fill: "var(--surface-2)" }));
      const w = (barMax * d.value) / max;
      const bar = el("rect", { x: labelW, y: barY, width: 0, height: barH, rx: 7, fill: d.color || "var(--accent)", class: "bar-rect", style: "cursor:pointer" });
      markEdit(bar, d.edit);
      svg.appendChild(bar);
      bar.style.transition = "width 1.2s cubic-bezier(0.22,1,0.36,1)";
      bar.style.transitionDelay = i * 60 + "ms";
      requestAnimationFrame(() => (bar.width.baseVal.value = w));
      const val = el("text", { x: labelW + barMax + 12, y: mid, class: "axis-label", "font-size": fs, "font-weight": 700 });
      val.setAttribute("fill", "var(--white)");
      const hv = window.MDUtil.human(d.value); val.textContent = hv.v + (hv.u ? " " + hv.u : "");
      svg.appendChild(val);
      bar.addEventListener("mouseenter", () => {
        bar.style.opacity = "0.85";
        const rect = host.getBoundingClientRect(), sc = rect.width / W;
        // shareTotal verilmişse: ham sayının altında toplam içindeki oran (yalnız yüzde) gösterilir
        const shareLine = opts.shareTotal ? `<br><span style="opacity:.75">%${((d.value / opts.shareTotal) * 100).toFixed(1).replace(".", ",")}</span>` : "";
        showTip(`<b>${d.label}</b><br><b>${nf.format(d.value)}</b> ${opts.unit || ""}${shareLine}`,
          rect.left + (labelW + w) * sc, rect.top + barY * sc + window.scrollY);
      });
      bar.addEventListener("mouseleave", () => { bar.style.opacity = "1"; hideTip(); });
    });
    host.appendChild(svg);
  }

  /* ---------- Donut ---------- */
  function donut(host, opts) {
    host.innerHTML = "";
    const W = 220, R = 75, r = 46, cx = W / 2, cy = W / 2;
    const svg = el("svg", {
      viewBox: `0 0 ${W} ${W}`,
      width: "180",
      height: "180",
      preserveAspectRatio: "xMidYMid meet",
      style: "width:180px;height:180px;max-height:180px;max-width:180px;display:block;margin:8px auto;"
    });
    const total = opts.items.reduce((s, d) => s + d.value, 0);
    let ang = -Math.PI / 2;
    opts.items.forEach((d, i) => {
      const frac = d.value / total, a2 = ang + frac * Math.PI * 2;
      const large = frac > 0.5 ? 1 : 0;
      const x1 = cx + R * Math.cos(ang), y1 = cy + R * Math.sin(ang);
      const x2 = cx + R * Math.cos(a2), y2 = cy + R * Math.sin(a2);
      const xi1 = cx + r * Math.cos(a2), yi1 = cy + r * Math.sin(a2);
      const xi2 = cx + r * Math.cos(ang), yi2 = cy + r * Math.sin(ang);
      const path = el("path", {
        d: `M${x1},${y1}A${R},${R} 0 ${large} 1 ${x2},${y2}L${xi1},${yi1}A${r},${r} 0 ${large} 0 ${xi2},${yi2}Z`,
        fill: d.color, style: "cursor:pointer;opacity:0;transition:opacity 0.5s,transform 0.25s;transform-origin:center",
      });
      markEdit(path, d.edit);
      setTimeout(() => (path.style.opacity = "1"), i * 90);
      path.addEventListener("mouseenter", () => {
        path.style.transform = "scale(1.03)";
        const rect = host.getBoundingClientRect(), sc = rect.width / W, mid = (ang + a2) / 2;
        showTip(`<b>${d.label}</b><br><b>${nf.format(d.value)}</b> — %${(frac * 100).toFixed(1)}`,
          rect.left + (cx + 100 * Math.cos(mid)) * sc, rect.top + (cy + 100 * Math.sin(mid)) * sc + window.scrollY);
      });
      path.addEventListener("mouseleave", () => { path.style.transform = "scale(1)"; hideTip(); });
      svg.appendChild(path);
      ang = a2;
    });
    const cLabel = el("text", { x: cx, y: cy - 3, "text-anchor": "middle", "font-family": "var(--font-display)", "font-weight": 800, "font-size": 19, fill: "var(--white)" });
    const hv = window.MDUtil.human(total); cLabel.textContent = hv.v;
    svg.appendChild(cLabel);
    const cSub = el("text", { x: cx, y: cy + 16, "text-anchor": "middle", "font-size": 11, fill: "var(--text-dim)" });
    cSub.textContent = (hv.u ? hv.u + " " : "") + (opts.unit || ""); svg.appendChild(cSub);
    host.appendChild(svg);
  }

  /* ---------- Sparkline (mini trend, eksensiz) ---------- */
  function spark(host, values, color) {
    host.innerHTML = "";
    if (!values || values.length < 2) return;
    const W = 220, Hh = 56, pad = 4;
    const svg = el("svg", { viewBox: `0 0 ${W} ${Hh}`, preserveAspectRatio: "none", style: "width:100%;height:56px;overflow:visible" });
    const min = Math.min(...values), max = Math.max(...values);
    const X = (i) => pad + ((W - 2 * pad) * i) / (values.length - 1);
    const Y = (v) => Hh - pad - ((Hh - 2 * pad) * (v - min)) / (max - min || 1);
    const pts = values.map((v, i) => [X(i), Y(v)]);
    const d = smooth(pts);
    const gid = "spk" + Math.random().toString(36).slice(2, 7);
    const grad = el("linearGradient", { id: gid, x1: 0, y1: 0, x2: 0, y2: 1 });
    grad.appendChild(el("stop", { offset: "0%", "stop-color": color, "stop-opacity": 0.28 }));
    grad.appendChild(el("stop", { offset: "100%", "stop-color": color, "stop-opacity": 0 }));
    svg.appendChild(grad);
    svg.appendChild(el("path", { d: `${d}L${X(values.length - 1)},${Hh} L${X(0)},${Hh} Z`, fill: `url(#${gid})` }));
    const line = el("path", { d, fill: "none", stroke: color, "stroke-width": 2.4, "stroke-linecap": "round", "vector-effect": "non-scaling-stroke" });
    svg.appendChild(line);
    svg.appendChild(el("circle", { cx: X(values.length - 1), cy: Y(values[values.length - 1]), r: 3.2, fill: color }));
    host.appendChild(svg);
  }


  /* ---------- Gruplu / yığılmış sütun (aylık) ---------- */
  function columns(host, opts) {
    host.innerHTML = "";
    const labels = opts.labels, series = opts.series, stacked = !!opts.stacked;
    const W = 760, H = 420, pad = { t: 14, r: 14, b: 38, l: 50 };
    const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: "xMidYMid meet" });
    const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
    const totals = labels.map((_, i) =>
      stacked ? series.reduce((s2, se) => s2 + (se.values[i] || 0), 0)
              : Math.max(...series.map((se) => se.values[i] || 0)));
    let max = Math.max(...totals, 1) * 1.12;
    const Y = (v) => pad.t + ih - (ih * v) / max;
    const bw = iw / labels.length;
    const inner = Math.min(bw * 0.82, 58);

    for (let i = 0; i <= 4; i++) {
      const v = (max * i) / 4, y = Y(v);
      svg.appendChild(el("line", { x1: pad.l, y1: y, x2: W - pad.r, y2: y, class: "grid-line" }));
      const tx = el("text", { x: pad.l - 10, y: y + 4, class: "axis-label", "text-anchor": "end" });
      const hv = window.MDUtil.human(v);
      tx.textContent = hv.v + (hv.u ? " " + hv.u[0].toUpperCase() : "");
      svg.appendChild(tx);
    }
    const axisFs = labels.length > 6 ? 9 : 11;
    labels.forEach((lb, i) => {
      const cx = pad.l + bw * i + bw / 2;
      const tx = el("text", { x: cx, y: H - 6, class: "axis-label", "text-anchor": "middle", "font-size": axisFs });
      tx.textContent = lb; svg.appendChild(tx);
      // MIN_H: küçük değerlerin hover edilebilmesi için minimum görünür yükseklik
      const MIN_H = 14;
      if (stacked) {
        let acc = 0;
        series.forEach((se) => {
          const v = se.values[i] || 0; if (!v) return;
          const y0 = Y(acc + v), h = Math.max(Y(acc) - Y(acc + v), MIN_H);
          const r = el("rect", { x: cx - inner / 2, y: y0, width: inner, height: h, fill: se.color, style: "cursor:pointer" });
          attach(r, lb, se, v, opts, host, W, i, cx, y0);
          svg.appendChild(r); acc += v;
        });
      } else {
        const n = series.length, sw = inner / n;
        series.forEach((se, si) => {
          const v = se.values[i] || 0; if (!v) return;
          const x = cx - inner / 2 + si * sw;
          const bw2 = Math.max(sw - 2, 2);
          const h = Math.max(ih - (Y(v) - pad.t), MIN_H);
          const r = el("rect", { x: x, y: Y(v), width: bw2, height: h, rx: 3, fill: se.color, style: "cursor:pointer" });
          attach(r, lb, se, v, opts, host, W, i, x + bw2 / 2, Y(v));
          svg.appendChild(r);
        });
      }
    });
    host.appendChild(svg);

    // tipX/tipY: sütunun kendi SVG konumu (bars()/lineArea() ile aynı dönüşüm) —
    // eskiden fare imlecinin ekran konumu kullanılıyordu, balon sağa/aşağı kayıyordu.
    function attach(node, lb, se, v, opts2, hostEl, WW, idx, tipX, tipY) {
      if (se.edit) markEdit(node, se.edit(idx));
      node.addEventListener("mouseenter", () => {
        node.style.opacity = "0.82";
        const rect = hostEl.getBoundingClientRect(), sc = rect.width / WW;
        showTip(`<b>${lb}</b> — ${se.name}<br><b>${nf.format(v)}</b> ${opts2.unit || ""}`,
          rect.left + tipX * sc, rect.top + tipY * sc + window.scrollY);
      });
      node.addEventListener("mouseleave", () => { node.style.opacity = "1"; hideTip(); });
    }
  }

  /* ---------- Treemap (squarified) ----------
     opts.items: [{label, group, value, color, edit}]. Karesel oranlara yakın
     dikdörtgenler için klasik "squarified" algoritma (Bruls/Huizing/van Wijk). */
  function squarify(items, x, y, w, h) {
    const total = items.reduce((s, it) => s + it.value, 0);
    if (!total || !items.length) return [];
    const scale = (w * h) / total;
    const worstRatio = (row, sideLen) => {
      const sum = row.reduce((s, it) => s + it.area, 0);
      const rowLen = sum / sideLen;
      let worst = 0;
      row.forEach((it) => {
        const other = it.area / rowLen;
        worst = Math.max(worst, rowLen / other, other / rowLen);
      });
      return worst;
    };
    let remain = items.map((it) => Object.assign({}, it, { area: it.value * scale }));
    const out = [];
    let rx = x, ry = y, rw = w, rh = h;
    while (remain.length) {
      const shortSide = Math.min(rw, rh);
      let row = [remain[0]], best = worstRatio(row, shortSide);
      for (let i = 1; i < remain.length; i++) {
        const trial = row.concat(remain[i]);
        const w2 = worstRatio(trial, shortSide);
        if (w2 <= best) { row = trial; best = w2; } else break;
      }
      const rowSum = row.reduce((s, it) => s + it.area, 0);
      const rowLen = rowSum / shortSide;
      const horizontal = rw <= rh; // dar kenar dikeyse satırı yatay dizeriz
      let offset = 0;
      row.forEach((it) => {
        const side = it.area / rowLen;
        if (horizontal) out.push(Object.assign({}, it, { x: rx + offset, y: ry, w: side, h: rowLen }));
        else out.push(Object.assign({}, it, { x: rx, y: ry + offset, w: rowLen, h: side }));
        offset += side;
      });
      if (horizontal) { ry += rowLen; rh -= rowLen; } else { rx += rowLen; rw -= rowLen; }
      remain = remain.slice(row.length);
    }
    return out;
  }

  function treemap(host, opts) {
    host.innerHTML = "";
    const items = (opts.items || []).filter((d) => d.value > 0).sort((a, b) => b.value - a.value);
    if (!items.length) { host.innerHTML = '<p class="csub">—</p>'; return; }
    const W = 720, H = 240;
    const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: "xMidYMid meet" });
    const rects = squarify(items, 0, 0, W, H);
    rects.forEach((r) => {
      const pad = 1.5, rx0 = r.x + pad, ry0 = r.y + pad, rw0 = Math.max(r.w - pad * 2, 0), rh0 = Math.max(r.h - pad * 2, 0);
      const rect = el("rect", { x: rx0, y: ry0, width: rw0, height: rh0, rx: 6,
        fill: r.color || "var(--accent)", style: "cursor:pointer;opacity:0;transition:opacity .5s" });
      markEdit(rect, r.edit);
      svg.appendChild(rect);
      requestAnimationFrame(() => (rect.style.opacity = "1"));
      // ---- Metin sığdırma: kelime sarma + clipPath ile kutu sınırını aşmama ----
      if (rw0 > 18 && rh0 > 12) {
        const px = 5, py = 4;
        const availW = rw0 - px * 2;
        const availH = rh0 - py * 2;
        // Font büyüklüğü: kutu genişliği ve yüksekliğiyle sınırlı
        const fs = Math.max(7, Math.min(12, Math.min(availW / 5, availH / 1.5)));
        const charW = fs * 0.54;   // Poppins ortalama karakter genişliği
        const lineH = fs * 1.28;
        // Değer satırı için rezerv alan (kutu yeterince büyükse)
        const hasVal = rh0 > 32;
        const linesArea = hasVal ? availH - fs * 1.3 : availH;
        const maxLines = Math.max(1, Math.floor(linesArea / lineH));

        // Kelime sarma
        function wrapWords(text, wAvail) {
          const words = text.split(" ");
          const out = [];
          let cur = "";
          for (const w of words) {
            const trial = cur ? cur + " " + w : w;
            if (trial.length * charW <= wAvail) {
              cur = trial;
            } else {
              if (cur) out.push(cur);
              // Kelime tek başına sığmıyorsa kes
              const fit = Math.max(1, Math.floor(wAvail / charW) - 1);
              cur = w.length * charW > wAvail ? w.slice(0, fit) + "…" : w;
            }
          }
          if (cur) out.push(cur);
          return out;
        }

        let lines = wrapWords(r.label, availW);
        if (lines.length > maxLines) {
          lines = lines.slice(0, maxLines);
          // Son satırın sonuna üç nokta ekle
          const last = lines[maxLines - 1];
          const fit = Math.max(1, Math.floor(availW / charW) - 1);
          lines[maxLines - 1] = (last[last.length - 1] === "…")
            ? last : last.slice(0, fit) + "…";
        }

        // clipPath: metin kutunun dışına taşmaz
        const clipId = "tc" + Math.random().toString(36).slice(2, 7);
        const clip = el("clipPath", { id: clipId });
        clip.appendChild(el("rect", { x: rx0, y: ry0, width: rw0, height: rh0 }));
        svg.appendChild(clip);

        const tg = el("g", { "clip-path": `url(#${clipId})`, "pointer-events": "none" });
        const startY = ry0 + py + fs;
        lines.forEach((line, li) => {
          const t2 = el("text", {
            x: rx0 + px, y: startY + li * lineH,
            "font-size": fs, "font-weight": 600, fill: "#fff",
          });
          t2.textContent = line;
          tg.appendChild(t2);
        });

        if (hasVal) {
          const hv = window.MDUtil.human(r.value);
          const subFs = Math.max(7, fs - 1);
          const subY = ry0 + rh0 - py - 1;
          const sub = el("text", {
            x: rx0 + px, y: subY,
            "font-size": subFs, fill: "rgba(255,255,255,.82)",
          });
          sub.textContent = hv.v + (hv.u ? " " + hv.u : "");
          tg.appendChild(sub);
        }
        svg.appendChild(tg);
      }
      rect.addEventListener("mouseenter", () => {
        rect.style.filter = "brightness(1.15)";
        const hostRect = host.getBoundingClientRect(), sc = hostRect.width / W;
        const tipHtml = r.tipHtml || `<b>${r.label}</b><br>${nf.format(r.value)}`;
        showTip(tipHtml,
          hostRect.left + (r.x + r.w / 2) * sc, hostRect.top + r.y * sc + window.scrollY);
      });
      rect.addEventListener("mouseleave", () => { rect.style.filter = ""; hideTip(); });
    });
    host.appendChild(svg);
  }

  window.MDCharts = { lineArea, bars, donut, spark, columns, treemap };
})();
