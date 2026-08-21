/* ============================================================
   harita.js — tam sayfa interaktif liman haritası + tablo
   ============================================================ */
(function () {
  "use strict";
  if (!window.MARITIME_DATA) return;
  const U = window.MDUtil;
  const t = window.t || ((k) => k);
  let D, P;
  const host = document.getElementById("pageContent");
  if (!host) return;

  function start() {
  D = window.MARITIME_DATA; P = D.ports;
  host.innerHTML = `
    <section class="page-hero"><div class="wrap">
      <div class="breadcrumb reveal"><a href="index.html" data-i18n="nav.home">${t("nav.home")}</a> ${window.__arrow("right")} <span data-i18n="nav.map">${t("nav.map")}</span></div>
      <h1 class="reveal" data-i18n="map.title">${t("map.title")}</h1>
      <p class="intro reveal d1" data-i18n="map.lead">${t("map.lead")}</p>
    </div></section>
    <section class="section" style="padding-top:10px"><div class="wrap">
      <div class="reveal mapviz" id="haritaMap"></div>
    </div></section>
    <section class="section" style="padding-top:0"><div class="wrap">
      <div class="section-head reveal"><h2 data-i18n="map.table">${t("map.table")}</h2></div>
      <div class="chart-card reveal" style="padding:0;overflow:hidden">
        <div class="table-scroll"><table class="data-table" id="portsTable"></table></div>
      </div>
    </div></section>`;

  /* Harita */
  (function map() {
    let mode = "yuk_ton";
    const wrap = document.getElementById("haritaMap");
    const frame = document.createElement("div"); frame.className = "frame";
    const tip = document.createElement("div"); tip.className = "map-tooltip";
    frame.innerHTML = `<div class="controls">
        <button data-mode="yuk_ton" class="on" data-i18n="map.cargo">${t("map.cargo")}</button>
        <button data-mode="konteyner_teu" data-i18n="map.container">${t("map.container")}</button></div>`;
    const sv = document.createElement("div"); frame.appendChild(sv); frame.appendChild(tip); wrap.appendChild(frame);
    function draw() {
      const vals = P.map((p) => p[mode]).filter((v) => v > 0), max = Math.max(...vals);
      const R = (v) => (v > 0 ? 6 + 34 * Math.sqrt(v / max) : 0);
      const fill = mode === "yuk_ton" ? "rgba(0,184,174,0.30)" : "rgba(224,118,47,0.28)";
      const stroke = mode === "yuk_ton" ? "var(--c-yuk)" : "var(--c-konteyner)";
      sv.innerHTML = `<svg class="bigmap" viewBox="${D.map.viewBox}" preserveAspectRatio="xMidYMid meet">
        ${D.map.outline.map((d) => `<path class="land" d="${d}"></path>`).join("")}
        ${P.filter((p) => p[mode] > 0).sort((a, b) => b[mode] - a[mode]).map((p) =>
          `<circle class="bubble" data-port="${p.name}" cx="${p.mx}" cy="${p.my}" r="${R(p[mode])}" style="fill:${fill};stroke:${stroke}"></circle>`).join("")}</svg>`;
      sv.querySelectorAll(".bubble").forEach((b) => {
        b.addEventListener("mousemove", (ev) => {
          const p = P.find((x) => x.name === b.dataset.port);
          tip.innerHTML = `<h4>${p.name} <span style="font-size:.7rem;color:var(--text-dim)">${p.sea}</span></h4>
            <div class="row"><span>${t("map.cargo")}</span><b>${U.fmt(p.yuk_ton)}</b></div>
            <div class="row"><span>${t("map.container")}</span><b>${U.fmt(p.konteyner_teu)}</b></div>`;
          const r = frame.getBoundingClientRect();
          tip.style.left = ev.clientX - r.left + "px"; tip.style.top = ev.clientY - r.top + "px"; tip.classList.add("show");
        });
        b.addEventListener("mouseleave", () => tip.classList.remove("show"));
      });
    }
    draw();
    frame.querySelectorAll(".controls button").forEach((btn) => btn.addEventListener("click", () => {
      frame.querySelectorAll(".controls button").forEach((x) => x.classList.remove("on"));
      btn.classList.add("on"); mode = btn.dataset.mode; draw();
    }));
  })();

  /* Tablo */
  (function table() {
    const tbl = document.getElementById("portsTable");
    let sortKey = "yuk_ton", asc = false;
    function render() {
      const rows = [...P].sort((a, b) => (asc ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey]));
      tbl.innerHTML = `<thead><tr>
        <th data-k="name" data-i18n="map.port">${t("map.port")}</th><th data-k="sea" data-i18n="map.sea">${t("map.sea")}</th>
        <th data-k="yuk_ton" style="cursor:pointer"><span data-i18n="map.cargo">${t("map.cargo")}</span> ↕</th>
        <th data-k="konteyner_teu" style="cursor:pointer"><span data-i18n="map.container">${t("map.container")}</span> ↕</th></tr></thead>
        <tbody>${rows.map((p) => {
          const ed = (f, l, k, w) => `data-edit='${JSON.stringify({ t: "ports", m: { name: p.name }, f: f, l: p.name + " — " + l, k: k, w: w }).replace(/'/g, "&#39;")}'`;
          return `<tr>
          <td><b ${ed("name", t("map.port"), "text", "Bu ad, kategori sayfalarındaki liman kırılımıyla eşleşmede kullanılıyor. Değiştirirsen o grafiklerde bu liman görünmeyebilir.")}>${p.name}</b></td>
          <td style="color:var(--text-dim)"><span ${ed("sea", t("map.sea"), "text")}>${p.sea}</span></td>
          <td><span ${ed("yuk_ton", t("map.cargo"), "num")}>${U.fmt(p.yuk_ton)}</span></td>
          <td><span ${ed("konteyner_teu", t("map.container"), "num")}>${U.fmt(p.konteyner_teu)}</span></td></tr>`;
        }).join("")}</tbody>`;
      tbl.querySelectorAll("th[data-k='yuk_ton'],th[data-k='konteyner_teu']").forEach((th) =>
        th.addEventListener("click", () => { const k = th.dataset.k; asc = k === sortKey ? !asc : false; sortKey = k; render(); }));
    }
    render();
  })();

  window.MDScan && window.MDScan();
  }

  Promise.all([window.MD_READY || Promise.resolve(), window.MD_I18N_READY || Promise.resolve()]).then(start);
})();
