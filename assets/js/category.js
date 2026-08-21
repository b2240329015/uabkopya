/* ============================================================
   category.js — kategori sayfası
   SOL: filtre (yıl dropdown + çoktan seçmeli ay + seri/bölge)
   SAĞ: KPI + kategoriye özel en az 2 grafik
   ============================================================ */
(function () {
  "use strict";
  if (!window.MARITIME_DATA) return;
  const U = window.MDUtil, C = window.MDCharts;
  const A = window.ARCHIVE_DATA || {};
  const icon = window.__icon, arrow = window.__arrow;
  const t = window.t || ((k) => k);
  const loc = (window.MDLang && window.MDLang.locale()) || "tr-TR";

  const lang = () => (window.MDLang && window.MDLang.get()) || "tr";
  // Ay adları da içerikten gelir (panelden düzenlenebilsin)
  const MON = () => Array.from({ length: 12 }, (_, i) => t("month." + (i + 1)));
  const nm = (o) => t(o.key);
  // Deniz bölgeleri: filtre DB'deki Türkçe değere göre, etiket içerik anahtarından
  const SEAS = [["Marmara", "sea.marmara"], ["Ege", "sea.ege"],
                ["Akdeniz", "sea.akdeniz"], ["Karadeniz", "sea.karadeniz"]];
  const seaKeyOf = (v) => (SEAS.find((s) => s[0] === v) || [null, v])[1];

  /* Kategori yapılandırması — seriler gerçek Excel sütunlarından türetildi */
  const CFG = {
    yuk: {
      ic: "yuk", accent: "--c-yuk", unit: "unit.ton", headKey: "yuk_ton", arch: "yuk",
      trendKey: "yuk_ton",
      series: [{ k: "yukleme", key: "series.yukleme" }, { k: "bosaltma", key: "series.bosaltma" }],
      quad: true, defaultYearSpan: 1,
      cards: [
        { type: "sum", seri: "toplam", labelKey: "yuk.kpiTotal", unitKey: "unit.ton" },
        { type: "topCountry", seri: "toplam", labelKey: "yuk.kpiTopCountry", unitKey: "unit.ton" },
        { type: "topPort", seri: "toplam", labelKey: "yuk.kpiTopPort", unitKey: "unit.ton" },
      ],
      charts: [
        { id: "dMonth", type: "monthly", titleKey: "cat.monthTitle", wide: true },
        { id: "dCountries", type: "countries", seri: "toplam", titleKey: "dim.yuk.bars" },
        { id: "dPorts", type: "ports", seri: "toplam", titleKey: "cat.portsTitle" },
      ],
    },
    konteyner: {
      ic: "konteyner", accent: "--c-konteyner", unit: "unit.teu", headKey: "konteyner_teu", arch: "konteyner",
      trendKey: "konteyner_teu",
      series: [{ k: "yukleme", key: "series.yukleme" }, { k: "bosaltma", key: "series.bosaltma" }],
      quad: true, defaultYearSpan: 2,
      composed: true, yearMin: 2020,
      filters: ["years", "months", "seri", "bayrak", "tip", "region"],
      cards: [
        { type: "sum", labelKey: "konteyner.kpiTotal", unitKey: "unit.teu" },
        { type: "topPort", labelKey: "konteyner.kpiTopPort", unitKey: "unit.teu" },
        { type: "topCountry", labelKey: "konteyner.kpiTopCountry", unitKey: "unit.teu" },
      ],
      charts: [
        { id: "dRegime", type: "regime", titleKey: "konteyner.chartRegime" },
        { id: "dTrend", type: "singleSeries", titleKey: "cat.trendTitle" },
        { id: "dPorts", type: "ports", titleKey: "cat.portsTitle" },
        { id: "dCountries", type: "countries", titleKey: "dim.konteyner.bars" },
      ],
    },
    gemi: {
      ic: "gemi", accent: "--c-gemi", unit: "unit.gemi", headKey: "gemi_sayisi", arch: "gemi",
      trendKey: "gemi_gros_ton",
      quad: true,
      defaultYearSpan: 2,
      cards: [
        { type: "sum", seri: "turk", labelKey: "gemi.kpiTurk", unitKey: "unit.gemi" },
        { type: "sum", seri: "yabanci", labelKey: "gemi.kpiYabanci", unitKey: "unit.gemi" },
        { type: "topPort", seri: "toplam", labelKey: "gemi.kpiTopPort", unitKey: "unit.gemi" },
        { type: "topPort", seri: "toplam_gt", labelKey: "gemi.kpiTopPortGt", unitKey: "unit.grosston" },
      ],
      charts: [
        { id: "dTurkTrend", type: "singleSeries", seri: "turk", seriKey: "series.turk", titleKey: "gemi.chartTurk" },
        { id: "dYabanciTrend", type: "singleSeries", seri: "yabanci", seriKey: "series.yabanci", titleKey: "gemi.chartYabanci", alt: true },
        { id: "dPorts", type: "ports", seri: "toplam", unitKey: "unit.gemi", titleKey: "cat.portsTitle" },
        { id: "dPortsGt", type: "ports", seri: "toplam_gt", unitKey: "unit.grosston", titleKey: "gemi.chartPortsGt" },
      ],
    },
    kruvaziyer: {
      ic: "kruvaziyer", accent: "--c-kruvaziyer", unit: "unit.yolcu", headKey: "kruvaziyer_yolcu", arch: "kruvaziyer",
      trendKey: "kruvaziyer_yolcu",
      series: [{ k: "gelen", key: "series.gelen" }, { k: "giden", key: "series.giden" },
               { k: "transit", key: "series.transit" }],
      quad: true, defaultYearSpan: 1,
      cards: [
        { type: "sum", seri: "toplam", labelKey: "kruvaziyer.kpiTotal", unitKey: "unit.yolcu" },
        { type: "topPortShare", seri: "toplam", labelKey: "kruvaziyer.kpiTopPort", unitKey: "unit.yolcu" },
        { type: "topMonth", seri: "toplam", labelKey: "kruvaziyer.kpiTopMonth", unitKey: "unit.yolcu" },
      ],
      charts: [
        { id: "dMonth", type: "monthly", titleKey: "cat.monthTitle" },
        { id: "dTrend", type: "singleSeries", titleKey: "cat.trendTitle" },
        { id: "dPorts", type: "portsShare", seri: "toplam", titleKey: "cat.portsTitle" },
        { id: "dPortsGemi", type: "ports", seri: "toplam", unitKey: "unit.yolcu", titleKey: "kruvaziyer.chartPortsGemi" },
      ],
    },
    roro: {
      ic: "roro", accent: "--c-roro", unit: "unit.arac", headKey: "roro_arac", arch: "roro",
      trendKey: "roro_arac_yil",
      series: [{ k: "gelen", key: "series.gelenArac" }, { k: "giden", key: "series.gidenArac" }],
      quad: true, defaultYearSpan: 1,
      cards: [
        { type: "sum", seri: "toplam", labelKey: "roro.kpiTotal", unitKey: "unit.arac" },
        { type: "topType", labelKey: "roro.kpiTopType" },
        { type: "topHat", labelKey: "roro.kpiTopHat", unitKey: "unit.arac" },
      ],
      charts: [
        { id: "dMonth", type: "monthly", titleKey: "cat.monthTitle", wide: true },
        { id: "dCins", type: "cinsBars", dim: "arac_cinsi", titleKey: "dim.roro.bars" },
        { id: "dHat", type: "cinsBars", dim: "hat", titleKey: "roro.chartHat" },
      ],
    },
    bogazlar: {
      ic: "bogaz", accent: "--c-bogaz", unit: "unit.gecis", headKey: "bogaz_gecis", arch: "bogazlar",
      trendKey: null, series: [],
      quad: true, defaultYearSpan: 1,
      filters: ["years", "months", "bogaz"],
      cards: [
        { type: "sum", seri: "toplam", labelKey: "bogazlar.kpiGemi", unitKey: "unit.gemi" },
        { type: "sum", seri: "gros_ton", labelKey: "bogazlar.kpiGrossTon", unitKey: "unit.grosston" },
        { type: "sum", seri: "ugraksiz", labelKey: "bogazlar.kpiUgraksiz", unitKey: "unit.gemi" },
      ],
      charts: [
        { id: "dTanker", type: "tankerLine", titleKey: "bogazlar.chartTanker", unitKey: "unit.gemi", wide: true },
        { id: "dGemi", type: "monthlySeries", seri: "toplam", titleKey: "bogazlar.chartGemi", unitKey: "unit.gemi" },
        { id: "dGrossTon", type: "monthlySeries", seri: "gros_ton", titleKey: "bogazlar.chartGrossTon", unitKey: "unit.grosston" },
      ],
    },
    kabotaj: {
      ic: "kabotaj", accent: "--c-kabotaj", headKey: "kabotaj_yolcu", arch: "kabotaj", series: [],
      yearsOnly: true, defaultYearSpan: 5,
      metrics: [
        { key: "kabotaj_yolcu", labelKey: "kabotaj.kpiYolcu", unitKey: "unit.yolcu" },
        { key: "kabotaj_arac", labelKey: "kabotaj.kpiArac", unitKey: "unit.arac" },
        { key: "kabotaj_yolcu_mil", labelKey: "kabotaj.kpiYolcuMil", unitKey: "unit.yolcumil" },
        { key: "kabotaj_arac_mil", labelKey: "kabotaj.kpiAracMil", unitKey: "unit.aracmil" },
      ],
    },
    filo: {
      ic: "filo", accent: "--c-filo", unit: "unit.gemi", headKey: "filo_gemi", arch: "filo",
      trendKey: null, series: [],
      yearsOnly: true, defaultYearSpan: 5,
      metrics: [
        { key: "filo_adet", labelKey: "filo.kpiAdet", unitKey: "unit.gemi", agg: "last" },
        { key: "filo_dwt", labelKey: "filo.kpiDwt", unitKey: "unit.dwt", agg: "last" },
        { key: "filo_yas_ort", labelKey: "filo.kpiYas", unitKey: "unit.yas", agg: "avg" },
      ],
      barsDim: { dim: "gemi_cinsi", key: "dim.filo.bars", top: 12 },
    },
  };

  const cat = document.body.dataset.cat;
  const cfg = CFG[cat];
  const host = document.getElementById("pageContent");
  if (!cfg || !host) return;

  // Pano ancak veri elde olunca çizilir; o ana kadar boş grafik yerine yükleniyor perdesi
  // durur. (i18n henüz hazır olmayabilir, bu yüzden metin doğrudan dilden seçilir.)
  // Ağ hatasında fetch zaten hemen reddediyor; bu süre yalnız "asılı kalan" bağlantılar
  // için emniyet supabı — normal yükleme (en ağır sayfa konteyner) ~5 sn sürüyor.
  const LIVE_TIMEOUT_MS = 12000;
  host.innerHTML = `<section class="page-loading"><div class="wrap">
      <span class="pl-spin" aria-hidden="true"></span>
      <p>${(window.MDLang && window.MDLang.get()) === "en" ? "Loading data…" : "Veriler yükleniyor…"}</p>
    </div></section>`;

  let H, P, T, DET, accent, alt2, m, state, years;

  const mRows = () => DET.monthly.filter((r) => r.kategori === cat);
  const pRows = () => DET.ports.filter((r) => r.kategori === cat);
  const bRows = () => DET.breakdown.filter((r) => r.kategori === cat);

  // Kategori yıllık trendi: DB trend → detail trend → aylık toplamdan türet
  function catTrend() {
    if (cfg.trendKey && T[cfg.trendKey]) return T[cfg.trendKey];
    if (cfg.useDetailTrend && DET.trend && Object.keys(DET.trend).length) return DET.trend;
    // aylık "toplam" serisinden yıllık toplam (sadece 12 ayı tam olan yıllar)
    const byYear = {};
    mRows().filter((r) => r.seri === "toplam").forEach((r) => {
      byYear[r.yil] = byYear[r.yil] || { sum: 0, months: new Set() };
      byYear[r.yil].sum += r.deger; byYear[r.yil].months.add(r.ay);
    });
    const out = {};
    Object.keys(byYear).forEach((y) => { if (byYear[y].months.size === 12) out[y] = byYear[y].sum; });
    return Object.keys(out).length >= 2 ? out : null;
  }

  const monthsFor = (y) => [...new Set(mRows().filter((r) => r.yil === y).map((r) => r.ay))].sort((a, b) => a - b);
  function mVal(y, mo, seri) {
    const r = mRows().find((x) => x.yil === y && x.ay === mo && x.seri === seri);
    return r ? r.deger : 0;
  }
  // state.years her sayfada dizi — tekli yıl sayfalarında hep 1 elemanlı. Seçili tüm
  // yılların ay kümesinin birleşimi (çoklu yıl sayfası için gerçek "hangi aylar mevcut").
  function curAvail() {
    const set = new Set();
    state.years.forEach((y) => monthsFor(y).forEach((mo) => set.add(mo)));
    return [...set].sort((a, b) => a - b);
  }
  const sumSel = (seri) => state.years.reduce((tot, y) =>
    tot + state.months.reduce((s, mo) => s + mVal(y, mo, seri), 0), 0);

  /* Bileşik seri adı: "{tip}__{akim}__{boyut}" (konteyner). Boyut verilmezse
     bayrak filtresi kullanılır. cfg.composed olmayan sayfalarda seri adı sabittir. */
  function seriFor(spec) {
    if (!cfg.composed) return spec;
    return state.tip + "__" + state.seri + "__" + (spec || state.bayrak);
  }

  // Konteyner cinsi kırılımı (20 / 40 / 40+) — Konteyner Tipi filtresi burada "hangi kayıt
  // grubu okunsun" anlamına gelir (cins verisi kaynakta zaten Dolu/Boş ayrı tutuluyor);
  // "Tümü" seçiliyse ikisi toplanır. Seri/Bayrak filtreleri de akım/bayrak sütununu seçer.
  function aggCins() {
    const suffix = "__" + state.seri + "__" + state.bayrak;
    const kinds = state.tip === "tumu" ? ["dolu", "bos"] : [state.tip];
    const wanted = new Set(kinds.map((k) => k + suffix));
    const rows = bRows().filter((r) => r.boyut === "konteyner_cinsi" && state.years.includes(r.yil)
      && wanted.has(r.seri));
    const agg = {};
    rows.forEach((r) => { agg[r.etiket] = (agg[r.etiket] || 0) + r.deger; });
    return ["20", "40", "40+"].map((e) => ({ etiket: e, deger: agg[e] || 0 }));
  }
  // Rejim türü dağılımı (Kabotaj / Transit / Yurt Dışı) — Seri (yükleme/boşaltma/toplam)
  // ve Tip/Bayrak filtrelerine göre değişir; hepsi seriFor() üstünden okunur.
  function aggRegime() {
    return ["disari", "kabotaj", "transit"].map((dim) => ({
      key: dim, deger: sumSel(seriFor(dim)),
    })).filter((x) => x.deger > 0);
  }

  // Liman bazlı toplam (seçili yılların toplamı; ay filtresine göre dinamik ölçeklenir).
  function aggPorts(seri) {
    let rows = pRows().filter((r) => r.seri === seri && state.years.includes(r.yil) && r.deger > 0);
    if (state.region !== "all") {
      const inR = new Set(P.filter((p) => p.sea === state.region).map((p) => p.name));
      rows = rows.filter((r) => inR.has(r.liman));
    }
    const avail = curAvail();
    const monthRatio = (avail.length && state.months.length < avail.length)
      ? state.months.length / avail.length : 1;
    const agg = {};
    rows.forEach((r) => { agg[r.liman] = (agg[r.liman] || 0) + (r.deger * monthRatio); });
    return Object.keys(agg).map((liman) => ({ liman, deger: Math.round(agg[liman]) })).sort((a, b) => b.deger - a.deger);
  }
  // Ülke bazlı toplam (seçili yılların toplamı; ay filtresine göre dinamik ölçeklenir).
  function aggCountries(seri) {
    const rows = bRows().filter((r) => r.boyut === "ulke" && (!r.seri || r.seri === seri || seri === "toplam") && state.years.includes(r.yil) && r.deger > 0);
    const avail = curAvail();
    const monthRatio = (avail.length && state.months.length < avail.length)
      ? state.months.length / avail.length : 1;
    const agg = {};
    rows.forEach((r) => { agg[r.etiket] = (agg[r.etiket] || 0) + (r.deger * monthRatio); });
    return Object.keys(agg).map((etiket) => ({ etiket, deger: Math.round(agg[etiket]) })).sort((a, b) => b.deger - a.deger);
  }
  // Genel amaçlı yıllık kırılım toplamı — herhangi bir boyut+seri için (roro: arac_cinsi, hat).
  function aggBreakdown(boyut, seri) {
    const rows = bRows().filter((r) => r.boyut === boyut && (!seri || !r.seri || r.seri === seri || seri === "toplam") && state.years.includes(r.yil));
    const avail = curAvail();
    const monthRatio = (avail.length && state.months.length < avail.length)
      ? state.months.length / avail.length : 1;
    const agg = {};
    rows.forEach((r) => { agg[r.etiket] = (agg[r.etiket] || 0) + (r.deger * monthRatio); });
    return Object.keys(agg).map((etiket) => ({ etiket, deger: Math.round(agg[etiket]) })).sort((a, b) => b.deger - a.deger);
  }
  // Ardışık ayları "Oca-Tem" gibi aralığa sıkıştırır; ardışık olmayanları virgülle ayırır
  // (örn. [1,2,3,6,7] → "Oca-Mar, Haz-Tem"). Genel amaçlı — başka sayfalarda da kullanılabilir.
  function compressMonths(mos) {
    if (!mos.length) return "";
    const sorted = [...mos].sort((a, b) => a - b);
    const runs = [];
    let start = sorted[0], prev = sorted[0];
    for (let i = 1; i <= sorted.length; i++) {
      const cur = sorted[i];
      if (cur === prev + 1) { prev = cur; continue; }
      runs.push([start, prev]);
      start = cur; prev = cur;
    }
    return runs.map(([a, b]) => (a === b ? MON()[a - 1] : `${MON()[a - 1]}-${MON()[b - 1]}`)).join(", ");
  }
  // Seçili yılların her biri için seçili ayların toplamı (küçükten büyüğe) — gemi Türk/Yabancı trend grafiği.
  function yearlySeriesFor(seri) {
    const ys = [...state.years].sort((a, b) => a - b);
    return { labels: ys.map(String), values: ys.map((y) => state.months.reduce((s, mo) => s + mVal(y, mo, seri), 0)) };
  }
  function yearsSummary() {
    if (state.years.length === 1) return String(state.years[0]);
    const sorted = [...state.years].sort((a, b) => a - b);
    if (sorted.length === years.length) return t("ui.all");
    if (sorted.length <= 4) return sorted.join(", ");
    return sorted.length + " " + t("ui.yearsSelected");
  }
  function monthsLabel(avail) {
    if (!avail.length) return t("ui.month");
    if (state.months.length === avail.length) return t("ui.all");
    return state.months.length + "/" + avail.length + " " + t("ui.monthSelected");
  }

  const dashCard = (id, title, s2, key, wide) =>
    `<div class="dash-card${wide ? " wide" : ""}"><h3${key ? ` data-i18n="${key}"` : ""}>${title}</h3>${s2 ? `<p class="csub">${s2}</p>` : ""}<div class="chart-holder" id="${id}"></div></div>`;

  /* ---------- İskelet ---------- */
  function skeleton() {
    host.innerHTML = `
    <section class="page-hero"><div class="wrap">
      <div class="breadcrumb"><a href="index.html" data-i18n="nav.home">${t("nav.home")}</a> ${arrow("right")} <span data-i18n="cat.${cat}">${t("cat." + cat)}</span></div>
      <div class="page-title">
        <span class="page-icon" style="color:${accent}">${icon(cfg.ic)}</span>
        <h1 data-i18n="cat.${cat}">${t("cat." + cat)}</h1>
      </div>
    </div></section>
    <section class="cat-wrap"><div class="wrap">
      <div class="cat-layout">
        <aside class="cat-filters" id="catFilters"></aside>
        <div class="cat-dash" id="catDash"></div>
      </div>
      <div class="cat-archive" id="catArchive"></div>
    </div></section>`;
  }

  /* ---------- Filtreler ---------- */
  const FILTER_OPTS = {
    seri: [["toplam", "ui.total"], ["yukleme", "series.yukleme"], ["bosaltma", "series.bosaltma"]],
    bayrak: [["toplam", "ui.all"], ["turk", "series.turk"], ["yabanci", "series.yabanci"]],
    tip: [["tumu", "ui.all"], ["dolu", "konteyner.dolu"], ["bos", "konteyner.bos"]],
    bogaz: [["istanbul", "bogazlar.istanbul"], ["canakkale", "bogazlar.canakkale"]],
  };

  function btnGroup(name, labelKey, opts, cur) {
    return `<div class="filter-group"><label data-i18n="${labelKey}">${t(labelKey)}</label>
      <div class="filter-regions">${opts.map(([v, k]) =>
        `<button type="button" data-${name}="${v}" class="${cur === v ? "on" : ""}" data-i18n="${k}">${t(k)}</button>`).join("")}</div></div>`;
  }
  function wireBtnGroup(box, name, field) {
    box.querySelectorAll("[data-" + name + "]").forEach((b) => b.addEventListener("click", () => {
      state[field] = b.dataset[name];
      renderFilters(); renderDash();
    }));
  }

  /* Çoklu seçim açılır listesi (yıl/ay) */
  let ddOpen = { years: false, months: false };
  function closeAllDD() {
    ddOpen.years = false; ddOpen.months = false;
    document.querySelectorAll(".filter-dd-panel").forEach((p) => (p.hidden = true));
    document.querySelectorAll(".filter-dd-btn").forEach((b) => b.setAttribute("aria-expanded", "false"));
  }
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".filter-dd")) closeAllDD();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAllDD();
  });

  function ddBlock(type, labelKey, summaryText, items, selSet) {
    const isOpen = ddOpen[type];
    return `<div class="filter-group">
      <label data-i18n="${labelKey}">${t(labelKey)}</label>
      <div class="filter-dd" data-dd="${type}">
        <button type="button" class="filter-dd-btn" aria-haspopup="true" aria-expanded="${isOpen}">
          <span>${summaryText}</span>
          <span class="dd-chev">▼</span>
        </button>
        <div class="filter-dd-panel" ${isOpen ? "" : "hidden"}>
          <div class="filter-dd-actions">
            <button type="button" class="btn-all" data-i18n="ui.selectAll">${t("ui.selectAll")}</button>
            <button type="button" class="btn-clear" data-i18n="ui.clear">${t("ui.clear")}</button>
          </div>
          <div class="filter-dd-list">
            ${items.map((it) => {
              const checked = selSet.has(it.v);
              return `<label class="filter-dd-item">
                <input type="checkbox" value="${it.v}" ${checked ? "checked" : ""}>
                <span>${it.l}</span>
              </label>`;
            }).join("")}
          </div>
        </div>
      </div>
    </div>`;
  }

  function renderFilters() {
    const box = document.getElementById("catFilters");
    if (!box) return;
    const avail = curAvail();
    const want = cfg.filters || (cfg.yearsOnly ? ["years"] : ["years", "months"]);
    let h = `<div class="filter-head">${icon(cfg.ic)} <span data-i18n="ui.filter">${t("ui.filter")}</span></div>`;

    // Yıl Çoklu Seçim Dropdown'ı
    const selYears = new Set(state.years);
    const yearItems = years.map((y) => ({ v: y, l: String(y) }));
    h += ddBlock("years", "ui.year", yearsSummary(), yearItems, selYears);

    // Ay Çoklu Seçim Dropdown'ı
    if (want.includes("months") && avail.length) {
      const selMonths = new Set(state.months);
      const monthItems = avail.map((mo) => ({ v: mo, l: MON()[mo - 1] }));
      h += ddBlock("months", "ui.month", monthsLabel(avail), monthItems, selMonths);
    }

    if (want.includes("bogaz")) h += btnGroup("bogaz", "ui.strait", FILTER_OPTS.bogaz, state.bogaz || "istanbul");
    if (want.includes("seri") && cfg.series && cfg.series.length) h += btnGroup("seri", "ui.series", FILTER_OPTS.seri, state.seri);
    if (want.includes("bayrak")) h += btnGroup("bayrak", "ui.flag", FILTER_OPTS.bayrak, state.bayrak);
    if (want.includes("tip")) h += btnGroup("tip", "ui.contType", FILTER_OPTS.tip, state.tip);
    if (want.includes("region") && pRows().length) {
      h += btnGroup("region", "ui.region", [["all", "ui.all"]].concat(SEAS.map(([v, k]) => [v, k])), state.region);
    }

    h += `<a class="btn btn-ghost filter-src" href="dosyalar.html?kat=${cfg.arch}"><span data-i18n="ui.viewFiles">${t("ui.viewFiles")}</span> ${arrow("right")}</a>`;
    box.innerHTML = h;

    // Yıl Dropdown Olayları
    const ddY = box.querySelector('.filter-dd[data-dd="years"]');
    const ddM = box.querySelector('.filter-dd[data-dd="months"]');

    function updateMonthList() {
      if (!ddM) return;
      const mAvail = curAvail();
      const mBtn = ddM.querySelector(".filter-dd-btn span:first-child");
      if (mBtn) mBtn.textContent = monthsLabel(mAvail);
      const list = ddM.querySelector(".filter-dd-list");
      if (list) {
        list.innerHTML = mAvail.map((mo) => {
          const checked = state.months.includes(mo);
          return `<label class="filter-dd-item">
            <input type="checkbox" value="${mo}" ${checked ? "checked" : ""}>
            <span>${MON()[mo - 1]}</span>
          </label>`;
        }).join("");
        wireMonthCheckboxes();
      }
    }

    function wireMonthCheckboxes() {
      if (!ddM) return;
      const mBtn = ddM.querySelector(".filter-dd-btn span:first-child");
      ddM.querySelectorAll("input[type=checkbox]").forEach((cb) => {
        cb.addEventListener("change", () => {
          const val = +cb.value;
          if (cb.checked) {
            if (!state.months.includes(val)) state.months.push(val);
          } else {
            if (state.months.length > 1) {
              state.months = state.months.filter((m) => m !== val);
            } else {
              cb.checked = true;
            }
          }
          if (mBtn) mBtn.textContent = monthsLabel(curAvail());
          renderDash();
        });
      });
    }

    if (ddY) {
      const btn = ddY.querySelector(".filter-dd-btn");
      const btnTxt = btn.querySelector("span:first-child");
      const panel = ddY.querySelector(".filter-dd-panel");
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const next = !ddOpen.years;
        closeAllDD();
        ddOpen.years = next;
        panel.hidden = !next;
        btn.setAttribute("aria-expanded", String(next));
      });
      panel.addEventListener("click", (e) => e.stopPropagation());
      ddY.querySelector(".btn-all")?.addEventListener("click", () => {
        state.years = [...years];
        ddY.querySelectorAll("input[type=checkbox]").forEach((c) => (c.checked = true));
        state.months = curAvail();
        btnTxt.textContent = yearsSummary();
        updateMonthList();
        renderDash();
      });
      ddY.querySelector(".btn-clear")?.addEventListener("click", () => {
        state.years = [years[0]];
        ddY.querySelectorAll("input[type=checkbox]").forEach((c) => (c.checked = (+c.value === years[0])));
        state.months = curAvail();
        btnTxt.textContent = yearsSummary();
        updateMonthList();
        renderDash();
      });
      ddY.querySelectorAll("input[type=checkbox]").forEach((cb) => {
        cb.addEventListener("change", () => {
          const val = +cb.value;
          if (cb.checked) {
            if (!state.years.includes(val)) state.years.push(val);
          } else {
            if (state.years.length > 1) {
              state.years = state.years.filter((y) => y !== val);
            } else {
              cb.checked = true;
            }
          }
          state.months = curAvail();
          btnTxt.textContent = yearsSummary();
          updateMonthList();
          renderDash();
        });
      });
    }

    // Ay Dropdown Olayları
    if (ddM) {
      const btn = ddM.querySelector(".filter-dd-btn");
      const btnTxt = btn.querySelector("span:first-child");
      const panel = ddM.querySelector(".filter-dd-panel");
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const next = !ddOpen.months;
        closeAllDD();
        ddOpen.months = next;
        panel.hidden = !next;
        btn.setAttribute("aria-expanded", String(next));
      });
      panel.addEventListener("click", (e) => e.stopPropagation());
      ddM.querySelector(".btn-all")?.addEventListener("click", () => {
        state.months = curAvail();
        ddM.querySelectorAll("input[type=checkbox]").forEach((c) => (c.checked = true));
        btnTxt.textContent = monthsLabel(curAvail());
        renderDash();
      });
      ddM.querySelector(".btn-clear")?.addEventListener("click", () => {
        const mAvail = curAvail();
        state.months = [mAvail[0]];
        ddM.querySelectorAll("input[type=checkbox]").forEach((c) => (c.checked = (+c.value === mAvail[0])));
        btnTxt.textContent = monthsLabel(mAvail);
        renderDash();
      });
      wireMonthCheckboxes();
    }

    wireBtnGroup(box, "bogaz", "bogaz");
    wireBtnGroup(box, "seri", "seri");
    wireBtnGroup(box, "bayrak", "bayrak");
    wireBtnGroup(box, "tip", "tip");
    wireBtnGroup(box, "region", "region");
  }

  /* ---------- Dashboard ---------- */
  function renderDash() {
    const box = document.getElementById("catDash");
    if (!box) return;
    if (cfg.quad) return renderDashQuad(box);
    if (cfg.yearsOnly) return renderDashYearsOnly(box);

    const avail = curAvail(), unit = t(cfg.unit);
    const partial = avail.length && state.months.length < avail.length;
    const y0 = state.years[0];

    let val, sub;
    if (avail.length) {
      val = sumSel(state.seri);
      sub = `${y0} · ${state.months.map((x) => MON()[x - 1]).join(", ")}`;
    } else {
      const tr = cfg.trendKey && T[cfg.trendKey];
      val = (tr && tr[y0]) || m.deger;
      sub = String(y0);
    }
    const hv = U.human(val);
    const sObj = cfg.series.find((s) => s.k === state.seri);
    const seriKey = state.seri === "toplam" ? "ui.total" : (sObj ? sObj.key : null);
    const seriName = seriKey ? t(seriKey) : "";

    const magSpan = hv.uKey ? `<span data-i18n="${hv.uKey}">${hv.u}</span> ` : "";
    const head = `<div class="dash-stat" style="--kc:${accent}">
      <div class="ds-top">
        <span class="ds-ic">${icon(cfg.ic)}</span>
        <span class="ds-year">${y0}</span>
      </div>
      <div class="ds-num" data-derived="Bu toplam, seçili ayların veritabanındaki değerlerinden hesaplanıyor.">${hv.v} <span class="ds-unit">${magSpan}<span data-i18n="${cfg.unit}">${unit}</span></span></div>
      <div class="ds-label"${seriKey ? ` data-i18n="${seriKey}"` : ""}>${seriName}</div>
      <div class="ds-sub">${sub}${partial ? " · " + t("ui.partial") : ""}</div>
    </div>`;

    let cards = "";
    if (avail.length) cards += dashCard("dMonth", t("cat.monthTitle"), `${y0} · ${unit}`, "cat.monthTitle", true);
    if (catTrend()) cards += dashCard("dTrend", t("cat.trendTitle"), unit, "cat.trendTitle");
    if (cfg.dual) cards += dashCard("dDual", t("cat.trendTitle"), "", "cat.trendTitle");
    if (pRows().length) cards += dashCard("dPorts", t("cat.portsTitle") + (state.region !== "all" ? " — " + t(seaKeyOf(state.region)) : ""), `${y0} · ${unit}`);
    if (cfg.split && cfg.series.length > 1)
      cards += dashCard("dSplit", t(cfg.splitKey || "ui.split"), String(y0), cfg.splitKey || "ui.split");
    if (cfg.donut && bRows().some((r) => r.boyut === cfg.donut.dim)) cards += dashCard("dDonut", t(cfg.donut.key), unit, cfg.donut.key);
    if (cfg.barsDim && bRows().some((r) => r.boyut === cfg.barsDim.dim)) cards += dashCard("dBars", t(cfg.barsDim.key), unit, cfg.barsDim.key);

    box.innerHTML = head + `<div class="dash-cards">${cards}</div>`;
    setTimeout(draw, 40);
  }

  /* ---------- Dashboard: bildirimli KPI panosu (cfg.cards/cfg.charts — gemi, yük, …) ---------- */
  function renderDashQuad(box) {
    const avail = curAvail(), unit = t(cfg.unit);
    const partial = avail.length && state.months.length < avail.length;
    const ysum = yearsSummary();
    const monthsTxt = compressMonths(state.months);
    const subCounts = `${monthsTxt ? monthsTxt : ""}${partial ? " · " + t("ui.partial") : ""}`;
    const subYearly = `<span data-i18n="ui.yearlyTotal">${t("ui.yearlyTotal")}</span>`;

    const cardsHtml = cfg.cards.map((cd) => {
      const r = computeCard(cd);
      return `<div class="dq-card" style="--kc:${accent}">
        <div class="dq-top">
          <span class="dq-ic">${icon(cfg.ic)}</span>
          <span class="dq-year">${r.year || ysum}</span>
        </div>
        <div class="dq-num"${r.note ? ` data-derived="${r.note}"` : ""}>${r.valueHtml}</div>
        <div class="dq-label" data-i18n="${cd.labelKey}">${t(cd.labelKey)}</div>
        ${r.port ? `<span class="dq-port">${r.port}</span>` : ""}
        <div class="dq-sub">${r.yearly ? subYearly : subCounts}</div>
      </div>`;
    }).join("");

    const capped = state.years.length > 10;
    const capNote = capped ? (lang() === "en" ? " · showing most recent 10 years" : " · en güncel 10 yıl gösteriliyor") : "";

    const chartsHtml = cfg.charts.map((ch, idx) => {
      let s2;
      if (ch.type === "monthly") s2 = `${ysum} · ${unit}${capNote}`;
      else if (ch.type === "singleSeries") s2 = `${subCounts}${capNote}`;
      else s2 = `${ysum} · ${t(ch.unitKey || cfg.unit)}`;
      const isWide = ch.wide || (ch.type === "monthly") || (ch.type === "tankerLine") || (cfg.charts.length % 2 === 1 && idx === 0);
      return dashCard(ch.id, t(ch.titleKey), s2, ch.titleKey, isWide);
    }).join("");

    box.innerHTML = `<div class="dash-quad" style="--card-count:${cfg.cards.length}">${cardsHtml}</div><div class="dash-cards">${chartsHtml}</div>`;
    setTimeout(draw, 40);
  }

  /* ---------- Dashboard: yalnız yıl (kabotaj, filo) ---------- */
  const YO_AGG = {
    sum: { calc: (vals) => vals.reduce((s, v) => s + v, 0), subKey: "ui.yearlyTotal",
           note: "Bu toplam, seçili yıl(lar)ın veritabanındaki değerlerinden hesaplanıyor." },
    avg: { calc: (vals) => vals.reduce((s, v) => s + v, 0) / vals.length, subKey: "ui.yearlyAvg",
           note: "Bu değer, seçili yılların veritabanındaki değerlerinin ortalamasıdır." },
    last: { calc: (vals, yrs) => vals[yrs.indexOf(Math.max(...yrs))], subKey: "ui.latestYear",
            note: "Bu bir stok değeridir (yılsonu filosu), seçili en güncel yılın veritabanındaki değeri gösteriliyor." },
  };

  function renderDashYearsOnly(box) {
    const ysum = yearsSummary();

    const cardsHtml = cfg.metrics.map((mt) => {
      const tr = T[mt.key] || {};
      const yrs = state.years.filter((y) => tr[y] != null);
      const agg = YO_AGG[mt.agg || "sum"];
      if (!yrs.length) {
        return `<div class="dq-card" style="--kc:${accent}">
          <div class="dq-top"><span class="dq-ic">${icon(cfg.ic)}</span><span class="dq-year">${ysum}</span></div>
          <div class="dq-num">—</div>
          <div class="dq-label" data-i18n="${mt.labelKey}">${t(mt.labelKey)}</div>
          <div class="dq-sub">${ysum}</div></div>`;
      }
      const val = agg.calc(yrs.map((y) => tr[y]), yrs);
      const hv = U.human(val);
      const mag = hv.uKey ? `<span data-i18n="${hv.uKey}">${hv.u}</span> ` : "";
      const sub = `<span data-i18n="${agg.subKey}">${t(agg.subKey)}</span>`;
      return `<div class="dq-card" style="--kc:${accent}">
        <div class="dq-top"><span class="dq-ic">${icon(cfg.ic)}</span><span class="dq-year">${ysum}</span></div>
        <div class="dq-num" data-derived="${agg.note}">${hv.v} <span class="dq-unit">${mag}<span data-i18n="${mt.unitKey}">${t(mt.unitKey)}</span></span></div>
        <div class="dq-label" data-i18n="${mt.labelKey}">${t(mt.labelKey)}</div>
        <div class="dq-sub">${sub}</div>
      </div>`;
    }).join("");

    let cards = cfg.metrics.map((mt) => dashCard(mt.key, t(mt.labelKey), ysum, mt.labelKey)).join("");
    if (cfg.barsDim && bRows().some((r) => r.boyut === cfg.barsDim.dim)) {
      const latestY = Math.max(...state.years);
      cards += dashCard("dBars", t(cfg.barsDim.key), `${latestY} · ${t(cfg.unit)}`, cfg.barsDim.key, true);
    }

    box.innerHTML = `<div class="dash-quad" style="--card-count:${cfg.metrics.length}">${cardsHtml}</div><div class="dash-cards">${cards}</div>`;
    setTimeout(draw, 40);
  }

  /* Grafik öğesi → kaynak veritabanı satırı (panelde tıklayınca düzenlenir).
     bogazlar'da "toplam"/"gros_ton"/"ugraksiz" fact_strait'ten türetilir (gerçek satır orada),
     "tanker_tta/lpg/tch" ise gerçek fact_monthly satırlarıdır — ikisi de aynı grafik ailesinde
     karışabildiği için hedef tablo seriye göre ayrıştırılır. */
  const BOGAZ_STRAIT_FIELD = { toplam: "gemi_adedi", gros_ton: "gros_ton", ugraksiz: "ugraksiz_gemi" };
  function monthEditForYear(avail, seriKey, seriName, y) {
    return (i) => {
      const mo = avail[i];
      if (mo == null) return null;
      const l = `${MON()[mo - 1]} ${y} · ${seriName}`;
      if (cat === "bogazlar") {
        const field = BOGAZ_STRAIT_FIELD[seriKey];
        if (field) return { t: "fact_strait", m: { bogaz: state.bogaz || "istanbul", yil: y, ay: mo }, f: field, l, k: "num" };
      }
      return { t: "fact_monthly", m: { kategori: cat, yil: y, ay: mo, seri: seriKey },
               f: "deger", l, k: "num" };
    };
  }
  function monthEdit(avail, seriKey, seriName) {
    return monthEditForYear(avail, seriKey, seriName, state.years[0]);
  }
  const RENAME_WARN = "Bu ad, aynı satırın kimliği. Değiştirirsen yalnız bu yılın kaydı yeniden adlandırılır; diğer yıllar eski adla kalır ve grafikte ayrı görünür.";

  function bdEdit(r) {
    // Ülke kırılımı fact_country'de, diğerleri fact_breakdown'da tutulur
    if (r._src === "fact_country") {
      return { t: "fact_country", m: { kategori: r.kategori, yil: r.yil, ulke: r.etiket, seri: r.seri },
               f: "deger", l: `${r.etiket} · ${r.yil}`, k: "num" };
    }
    return { t: "fact_breakdown", m: { kategori: r.kategori, yil: r.yil, boyut: r.boyut, etiket: r.etiket, seri: r.seri },
             f: "deger", l: `${r.etiket} · ${r.yil}`, k: "num" };
  }
  // Aynı satırın etiket (ad) sütunu
  function bdEditLabel(r) {
    const d = bdEdit(r);
    return Object.assign({}, d, { f: r._src === "fact_country" ? "ulke" : "etiket",
                                  l: `${r.etiket} — ad`, k: "text", w: RENAME_WARN });
  }

  // Liman çubuk grafiği — gemi (dPorts/dPortsGt) için ortak çizim; tek yıl seçiliyse
  // düzenlenebilir (tek satıra karşılık gelir), çoklu yılda salt-okunur (toplam).
  function drawPortsBars(host, top, seri, singleYear, unitLabel, shareTotal) {
    if (!top.length) { host.innerHTML = `<p class="csub" data-i18n="cat.noPortData">${t("cat.noPortData")}</p>`; return; }
    C.bars(host, { unit: unitLabel, shareTotal, items: top.map((r) => {
      if (singleYear == null) return { label: r.liman, value: r.deger, color: accent };
      const m = { kategori: cat, yil: singleYear, liman: r.liman, seri };
      return {
        label: r.liman, value: r.deger, color: accent,
        edit: { t: "fact_port", m, f: "deger", l: `${r.liman} · ${singleYear}`, k: "num" },
        editLabel: { t: "fact_port", m, f: "liman", l: `${r.liman} — ad`, k: "text", w: RENAME_WARN },
      };
    }) });
  }
  // Ülke çubuk grafiği — drawPortsBars ile aynı desen, fact_country'ye yazar.
  function drawCountriesBars(host, top, seri, singleYear, unitLabel) {
    if (!top.length) { host.innerHTML = `<p class="csub" data-i18n="cat.noPortData">${t("cat.noPortData")}</p>`; return; }
    C.bars(host, { unit: unitLabel, items: top.map((r) => {
      const label = short(r.etiket);
      if (singleYear == null) return { label, value: r.deger, color: accent };
      const m = { kategori: cat, yil: singleYear, ulke: r.etiket, seri };
      return {
        label, value: r.deger, color: accent,
        edit: { t: "fact_country", m, f: "deger", l: `${r.etiket} · ${singleYear}`, k: "num" },
        editLabel: { t: "fact_country", m, f: "ulke", l: `${r.etiket} — ad`, k: "text", w: RENAME_WARN },
      };
    }) });
  }

  // Ay filtresine duyarlı "toplam" kartı ile yıllık toplam kartları için ayrı açıklama
  // metinleri — hem KPI panosunda hem düzenleme modunda tutarlı kalsın diye tek yerde.
  const NOTE_SUM = "Bu toplam, seçili yıl(lar) ve ayların veritabanındaki değerlerinden hesaplanıyor. Değiştirmek için aşağıdaki ilgili grafikte ilgili sütuna tıkla.";
  const NOTE_TOP = "Bu değer, seçili yıllardaki toplamlardan hesaplanıyor. Değiştirmek için aşağıdaki ilgili grafikte ilgili sütuna tıkla.";
  const NOTE_SHARE = "Bu pazar payı, seçili yıllardaki araç cinsi toplamlarından hesaplanıyor (bu cinsin toplamı ÷ tüm cinslerin toplamı). Değiştirmek için aşağıdaki grafikte ilgili sütuna tıkla.";

  // Bildirimli kart hesaplama — cfg.cards'taki her girdi için değer/açıklama/not üretir.
  function computeCard(cd) {
    const y0 = state.years[0];
    const ysum = yearsSummary();
    if (cd.type === "sum") {
      const hv = U.human(sumSel(seriFor(cd.seri)));
      const mag = hv.uKey ? `<span data-i18n="${hv.uKey}">${hv.u}</span> ` : "";
      return {
        year: ysum,
        valueHtml: `${hv.v} <span class="dq-unit">${mag}<span data-i18n="${cd.unitKey}">${t(cd.unitKey)}</span></span>`,
        note: NOTE_SUM, yearly: false,
      };
    }
    if (cd.type === "topType") {
      // Lider araç cinsi + pazar payı (%) — o cinsin toplamı / tüm cinslerin toplamı
      const agg = aggBreakdown("arac_cinsi", "toplam");
      const total = agg.reduce((s, x) => s + x.deger, 0);
      const top = agg[0];
      if (!top || !total) return { year: ysum, valueHtml: "—", note: "", yearly: true };
      const pct = (top.deger / total) * 100;
      return {
        year: ysum,
        valueHtml: `%${pct.toFixed(1).replace(".", ",")}`,
        port: short(top.etiket),
        note: NOTE_SHARE, yearly: true,
      };
    }
    if (cd.type === "topPortShare") {
      // En yoğun liman + pazar payı (%) — o limanın toplamı / tüm limanların toplamı
      const seri = seriFor(cd.seri);
      const agg = aggPorts(seri);
      const total = agg.reduce((s, x) => s + x.deger, 0);
      const top = agg[0];
      if (!top || !total) return { year: ysum, valueHtml: "—", note: "", yearly: true };
      const pct = (top.deger / total) * 100;
      return {
        year: ysum,
        valueHtml: `%${pct.toFixed(1).replace(".", ",")}`,
        port: top.liman,
        note: NOTE_SHARE, yearly: true,
      };
    }
    if (cd.type === "topMonth") {
      // En yoğun ay — seçili yılların o ayki toplamları (ay filtresinden bağımsız, topPort/topHat ile tutarlı)
      const seri = seriFor(cd.seri);
      const avail = curAvail();
      const totals = avail.map((mo) => ({ mo, deger: state.years.reduce((s, y) => s + mVal(y, mo, seri), 0) }));
      const top = totals.sort((a, b) => b.deger - a.deger)[0];
      if (!top || !top.deger) return { year: ysum, valueHtml: "—", note: "", yearly: true };
      const hv = U.human(top.deger);
      const mag = hv.uKey ? `<span data-i18n="${hv.uKey}">${hv.u}</span> ` : "";
      return {
        year: ysum,
        valueHtml: `${hv.v} <span class="dq-unit">${mag}<span data-i18n="${cd.unitKey}">${t(cd.unitKey)}</span></span>`,
        port: MON()[top.mo - 1],
        note: NOTE_TOP, yearly: true,
      };
    }
    if (cd.type === "topHat") {
      // En yoğun hat — etiket "Bölge :: Hat" olarak saklanıyor, gösterimde hat adı yeterli
      const agg = aggBreakdown("hat", "toplam");
      const top = agg[0];
      if (!top) return { year: ysum, valueHtml: "—", note: "", yearly: true };
      const hatName = top.etiket.split(" :: ")[1] || top.etiket;
      const hv = U.human(top.deger);
      const mag = hv.uKey ? `<span data-i18n="${hv.uKey}">${hv.u}</span> ` : "";
      return {
        year: ysum,
        valueHtml: `${hv.v} <span class="dq-unit">${mag}<span data-i18n="${cd.unitKey}">${t(cd.unitKey)}</span></span>`,
        port: hatName,
        note: NOTE_TOP, yearly: true,
      };
    }
    const seri = seriFor(cd.seri);
    const agg = cd.type === "topPort" ? aggPorts(seri) : aggCountries(seri);
    const top = agg[0];
    if (!top) return { year: ysum, valueHtml: "—", note: "", yearly: true };
    const name = cd.type === "topPort" ? top.liman : short(top.etiket);
    const hv = U.human(top.deger);
    const mag = hv.uKey ? `<span data-i18n="${hv.uKey}">${hv.u}</span> ` : "";
    return {
      valueHtml: `${hv.v} <span class="dq-unit">${mag}<span data-i18n="${cd.unitKey}">${t(cd.unitKey)}</span></span><span class="dq-port">${name}</span>`,
      note: NOTE_TOP, yearly: true,
    };
  }

  // Aylara göre dağılım — tek yıl: cfg.series'e göre yığılmış/gruplu sütun (kategorinin
  // klasik görünümü). Çoklu yıl: her yıl ayrı çizgi, toplam seri (seri ayrımı kaybolur —
  // okunabilirlik için en yeni 10 yılla sınırlı). cfg.quad olmayan sayfalarda state.years
  // hep 1 elemanlı olduğu için ikinci dal hiç çalışmaz, davranış değişmez.
  function drawMonthlyChart(host) {
    const avail = curAvail(), unit = t(cfg.unit);
    if (!avail.length) return;
    const cs = getComputedStyle(document.documentElement);
    if (state.years.length > 1) {
      const palette = ["--c-yuk", "--c-konteyner", "--c-gemi", "--c-kruvaziyer", "--c-roro", "--c-bogaz"]
        .map((v) => cs.getPropertyValue(v).trim());
      const yrsSorted = [...state.years].sort((a, b) => b - a).slice(0, 10);
      const labels = avail.map((x) => MON()[x - 1]);
      const series = yrsSorted.map((y, i) => ({
        name: String(y), color: palette[i % palette.length],
        values: avail.map((mo) => mVal(y, mo, "toplam")),
        edit: monthEditForYear(avail, "toplam", t("ui.total"), y),
      }));
      C.lineArea(host, { labels, unit, series });
    } else {
      const y = state.years[0];
      const ramp = [accent, cs.getPropertyValue("--sea-600").trim(), cs.getPropertyValue("--sky-300").trim()];
      const labels = avail.map((x) => MON()[x - 1]);
      const series = cfg.series.length
        ? cfg.series.map((s, i) => ({ name: nm(s), color: ramp[i % ramp.length],
            values: avail.map((mo) => mVal(y, mo, s.k)),
            edit: monthEdit(avail, s.k, nm(s)) }))
        : [{ name: t("ui.total"), color: accent, values: avail.map((mo) => mVal(y, mo, "toplam")),
            edit: monthEdit(avail, "toplam", t("ui.total")) }];
      C.columns(host, { labels, series, unit, stacked: cfg.series.length > 1 });
    }
  }

  // cfg.quad sayfaları için bildirimli grafik çizimi — cfg.charts'taki her girdiyi kendi
  // tipine göre çizer. Gemi/yük şu an bunu kullanıyor, sıradaki sayfalar cfg.charts'a
  // girdi eklemesi yeterli.
  function drawQuadCharts() {
    const cs = getComputedStyle(document.documentElement);
    const accent2 = cs.getPropertyValue("--sea-600").trim();
    cfg.charts.forEach((ch) => {
      const host = document.getElementById(ch.id);
      if (!host) return;
      if (ch.type === "monthly") {
        drawMonthlyChart(host);
      } else if (ch.type === "singleSeries") {
        if (cat === "kruvaziyer") {
          const tr = catTrend();
          if (tr) {
            const ys = Object.keys(tr).sort();
            C.lineArea(host, { labels: ys, unit: t(cfg.unit), series: [{
              name: t("cat.trendTitle"), color: accent, values: ys.map((y) => tr[y])
            }] });
            return;
          }
        }
        const seri = seriFor(ch.seri);
        const { labels, values } = yearlySeriesFor(seri);
        if (labels.length < 2) { host.innerHTML = `<p class="csub" data-i18n="ui.needTwoYears">${t("ui.needTwoYears")}</p>`; return; }
        C.lineArea(host, { labels, unit: t(ch.unitKey || cfg.unit),
          series: [{ name: t(ch.seriKey || ("series." + ch.seri)), color: ch.alt ? accent2 : accent, values }] });
      } else if (ch.type === "ports") {
        const seri = seriFor(ch.seri);
        const singleYear = state.years.length === 1 ? state.years[0] : null;
        drawPortsBars(host, aggPorts(seri).slice(0, 10), seri, singleYear, t(ch.unitKey || cfg.unit));
      } else if (ch.type === "portsShare") {
        // "ports" ile aynı, yalnız tooltip'te ham sayının altında pazar payı yüzdesi de gösterilir
        // (kruvaziyer talebi) — yüzde tüm limanların toplamına göre (yalnız görünen ilk 10'a göre değil).
        const seri = seriFor(ch.seri);
        const singleYear = state.years.length === 1 ? state.years[0] : null;
        const all = aggPorts(seri);
        const total = all.reduce((s, x) => s + x.deger, 0);
        drawPortsBars(host, all.slice(0, 10), seri, singleYear, t(ch.unitKey || cfg.unit), total);
      } else if (ch.type === "countries") {
        const seri = seriFor(ch.seri);
        const singleYear = state.years.length === 1 ? state.years[0] : null;
        drawCountriesBars(host, aggCountries(seri).slice(0, 10), seri, singleYear, t(ch.unitKey || cfg.unit));
      } else if (ch.type === "regime") {
        const REGIME_KEY = { disari: "konteyner.regimeDisari", kabotaj: "konteyner.regimeKabotaj", transit: "konteyner.regimeTransit" };
        const palette = [accent, accent2, cs.getPropertyValue("--sky-300").trim()];
        const items = aggRegime().map((r, i) => ({ label: t(REGIME_KEY[r.key]), value: r.deger, color: palette[i % palette.length] }));
        if (items.length) C.donut(host, { unit: t(cfg.unit), items });
        else host.innerHTML = `<p class="csub">—</p>`;
      } else if (ch.type === "cins") {
        const CINS_KEY = { "20": "konteyner.size20", "40": "konteyner.size40", "40+": "konteyner.size40plus" };
        const items = aggCins().map((r) => ({ label: t(CINS_KEY[r.etiket]), value: r.deger, color: accent }));
        if (items.some((x) => x.value > 0)) C.bars(host, { unit: t(cfg.unit), items });
        else host.innerHTML = `<p class="csub">—</p>`;
      } else if (ch.type === "cinsBars") {
        // Serbest metinli cins listesi (roro: 27 araç tipi) — short() ile TR/EN kısaltılır,
        // punto normalden büyük (kullanıcı talebi: "yazılar büyütülsün"). Tek yıl seçiliyse
        // tek satıra karşılık geldiği için düzenlenebilir, çoklu yılda salt-okunur (toplam).
        const singleYear = state.years.length === 1 ? state.years[0] : null;
        const items = aggBreakdown(ch.dim, "toplam").slice(0, 10).map((r) => {
          const label = short(r.etiket);
          if (singleYear == null) return { label, value: r.deger, color: accent };
          const m = { kategori: cat, yil: singleYear, boyut: ch.dim, etiket: r.etiket, seri: "toplam" };
          return { label, value: r.deger, color: accent,
            edit: { t: "fact_breakdown", m, f: "deger", l: `${label} · ${singleYear}`, k: "num" },
            editLabel: { t: "fact_breakdown", m, f: "etiket", l: `${label} — ad`, k: "text", w: RENAME_WARN } };
        });
        if (items.length) C.bars(host, { unit: t(cfg.unit), items, labelFontSize: 16 });
        else host.innerHTML = `<p class="csub">—</p>`;
      } else if (ch.type === "treemap") {
        const cs2 = getComputedStyle(document.documentElement);
        const palette = ["--c-yuk", "--c-konteyner", "--c-gemi", "--c-kruvaziyer", "--c-roro", "--c-bogaz", "--c-kabotaj", "--c-filo"]
          .map((v) => cs2.getPropertyValue(v).trim());
        const groups = new Map();
        const singleYear = state.years.length === 1 ? state.years[0] : null;
        const items = aggBreakdown(ch.dim, "toplam").map((r) => {
          const [grp, name] = r.etiket.split(" :: ");
          if (!groups.has(grp)) groups.set(grp, palette[groups.size % palette.length]);
          const label = name || r.etiket;
          const base = { label, group: grp, value: r.deger, color: groups.get(grp) };
          if (singleYear == null) return base;
          // Tek dikdörtgen tek tıklama hedefi olduğu için yalnız değer düzenlenebilir
          // (ad değişikliği için ayrı bir tıklama alanı yok — treemap'in kompakt yapısı).
          const m = { kategori: cat, yil: singleYear, boyut: ch.dim, etiket: r.etiket, seri: "toplam" };
          return Object.assign(base, {
            edit: { t: "fact_breakdown", m, f: "deger", l: `${grp} — ${label} · ${singleYear}`, k: "num" },
          });
        });
        C.treemap(host, { unit: t(cfg.unit), items });
      } else if (ch.type === "monthlySeries") {
        // Tek seri, ay bazında — tek yıl seçiliyse sütun, çoklu yılda yıl başına ayrı çizgi
        // (drawMonthlyChart'ın "toplam" özel-hâline benzer, ancak seri cfg.charts'tan gelir).
        const avail = curAvail(), unit = t(ch.unitKey || cfg.unit), seri = ch.seri;
        if (!avail.length) { host.innerHTML = `<p class="csub">—</p>`; return; }
        const labels = avail.map((x) => MON()[x - 1]);
        if (state.years.length > 1) {
          const palette = ["--c-yuk", "--c-konteyner", "--c-gemi", "--c-kruvaziyer", "--c-roro", "--c-bogaz"]
            .map((v) => cs.getPropertyValue(v).trim());
          const yrsSorted = [...state.years].sort((a, b) => b - a).slice(0, 10);
          const series = yrsSorted.map((y, i) => ({
            name: String(y), color: palette[i % palette.length],
            values: avail.map((mo) => mVal(y, mo, seri)),
            edit: monthEditForYear(avail, seri, String(y), y),
          }));
          C.lineArea(host, { labels, unit, series });
        } else {
          const y = state.years[0];
          C.columns(host, { labels, unit, series: [{
            name: t(ch.titleKey), color: accent,
            values: avail.map((mo) => mVal(y, mo, seri)),
            edit: monthEditForYear(avail, seri, t(ch.titleKey), y),
          }] });
        }
      } else if (ch.type === "tankerLine") {
        // TTA/LPG/TCH — üç sabit seri, her zaman çizgi grafik; çoklu yıl seçiliyse aylar
        // bazında seçili yılların toplamı (liman/ülke grafikleriyle aynı toplama mantığı).
        const avail = curAvail(), unit = t(ch.unitKey || cfg.unit);
        if (!avail.length) { host.innerHTML = `<p class="csub">—</p>`; return; }
        const labels = avail.map((x) => MON()[x - 1]);
        const singleYear = state.years.length === 1 ? state.years[0] : null;
        const TANKERS = [
          ["tanker_tta", "TTA", accent],
          ["tanker_lpg", "LPG", accent2],
          ["tanker_tch", "TCH", cs.getPropertyValue("--sky-300").trim()],
        ];
        const series = TANKERS.map(([seri, name, color]) => ({
          name, color,
          values: avail.map((mo) => state.years.reduce((s, y) => s + mVal(y, mo, seri), 0)),
          edit: singleYear != null ? monthEditForYear(avail, seri, name, singleYear) : null,
        }));
        C.lineArea(host, { labels, unit, series });
      }
    });
  }

  // Her metrik → tek çizgi grafik, seçili yıllar küçükten büyüğe. Tek satıra karşılık
  // geldiği için (metrik+yıl) doğrudan düzenlenebilir.
  function drawYearsOnly() {
    cfg.metrics.forEach((mt) => {
      const host = document.getElementById(mt.key);
      if (!host) return;
      const tr = T[mt.key] || {};
      const ys = [...state.years].sort((a, b) => a - b);
      if (ys.length < 2) { host.innerHTML = `<p class="csub" data-i18n="ui.needTwoYears">${t("ui.needTwoYears")}</p>`; return; }
      const labels = ys.map(String);
      const values = ys.map((y) => tr[y] || 0);
      C.lineArea(host, { labels, unit: t(mt.unitKey), series: [{
        name: t(mt.labelKey), color: accent, values,
        edit: (i) => ({ t: "trends", m: { metric: mt.key, year: ys[i] }, f: "value",
                        l: `${ys[i]} · ${t(mt.labelKey)}`, k: "num" }),
      }] });
    });

    // Gemi cinsi kırılımı (filo) — bu bir STOK (yılsonu envanteri): yıllar toplanamaz
    // (topPort/topHat gibi akış boyutlarından farklı), bu yüzden aggBreakdown() kullanılmıyor —
    // seçili yılların en güncel olanının tek satırlık dağılımı gösterilir, her zaman düzenlenebilir.
    const bh = document.getElementById("dBars");
    if (bh && cfg.barsDim) {
      const y = Math.max(...state.years);
      const items = bRows().filter((r) => r.boyut === cfg.barsDim.dim && r.seri === "adet" && r.yil === y)
        .sort((a, b) => b.deger - a.deger).slice(0, cfg.barsDim.top).map((r) => {
        const label = short(r.etiket);
        const m = { kategori: cat, yil: y, boyut: cfg.barsDim.dim, etiket: r.etiket, seri: "adet" };
        return { label, value: r.deger, color: accent,
          edit: { t: "fact_breakdown", m, f: "deger", l: `${label} · ${y}`, k: "num" },
          editLabel: { t: "fact_breakdown", m, f: "etiket", l: `${label} — ad`, k: "text", w: RENAME_WARN } };
      });
      if (items.length) C.bars(bh, { unit: t(cfg.unit), items });
      else bh.innerHTML = `<p class="csub">—</p>`;
    }
  }

  function draw() {
    if (cfg.quad) { drawQuadCharts(); return; }
    if (cfg.yearsOnly) { drawYearsOnly(); return; }

    const unit = t(cfg.unit);
    const cs = getComputedStyle(document.documentElement);
    const palette = ["--c-yuk", "--c-konteyner", "--c-gemi", "--c-kruvaziyer", "--c-roro", "--c-bogaz"]
      .map((v) => cs.getPropertyValue(v).trim());
    // Uyumlu seri renkleri: accent'ten türeyen bir ramp
    const ramp = [accent, cs.getPropertyValue("--sea-600").trim(), cs.getPropertyValue("--sky-300").trim()];

    const mh = document.getElementById("dMonth");
    if (mh) drawMonthlyChart(mh);

    const th = document.getElementById("dTrend");
    const tr = catTrend();
    if (th && tr) {
      const ys = Object.keys(tr).sort();
      // Yalnız trends tablosundan geleni doğrudan düzenlenebilir yap; türetilmiş
      // trend (aylıklardan toplanan) tek bir satıra karşılık gelmiyor.
      const direct = !!(cfg.trendKey && T[cfg.trendKey]);
      C.lineArea(th, { labels: ys, unit, series: [{
        name: t("cat.trendTitle"), color: accent, values: ys.map((y) => tr[y]),
        edit: direct ? (i) => ({ t: "trends", m: { metric: cfg.trendKey, year: +ys[i] },
                                 f: "value", l: `${ys[i]} · ${t("cat.trendTitle")}`, k: "num" }) : null,
      }] });
    }

    const dh = document.getElementById("dDual");
    if (dh && cfg.dual) {
      const a = T[cfg.dual.a] || {}, b = T[cfg.dual.b] || {}, ys = Object.keys(a).sort();
      C.lineArea(dh, { labels: ys, unit: "", series: [
        { name: t(cfg.dual.aKey), color: accent, values: ys.map((y) => a[y] || 0),
          edit: (i) => ({ t: "trends", m: { metric: cfg.dual.a, year: +ys[i] }, f: "value",
                          l: `${ys[i]} · ${t(cfg.dual.aKey)}`, k: "num" }) },
        { name: t(cfg.dual.bKey), color: palette[2], values: ys.map((y) => b[y] || 0),
          edit: (i) => ({ t: "trends", m: { metric: cfg.dual.b, year: +ys[i] }, f: "value",
                          l: `${ys[i]} · ${t(cfg.dual.bKey)}`, k: "num" }) }] });
    }

    const ph = document.getElementById("dPorts");
    if (ph) {
      const seri = cfg.series.length && state.seri !== "toplam" ? state.seri : "toplam";
      const yrs = [...new Set(pRows().filter((r) => r.seri === seri).map((r) => r.yil))];
      const useYear = yrs.includes(state.years[0]) ? state.years[0] : Math.max(...yrs);
      let rows = pRows().filter((r) => r.yil === useYear && r.seri === seri && r.deger > 0);
      if (state.region !== "all") {
        const inR = new Set(P.filter((p) => p.sea === state.region).map((p) => p.name));
        rows = rows.filter((r) => inR.has(r.liman));
      }
      const top = rows.sort((a, b) => b.deger - a.deger).slice(0, 10).map((r) => ({ liman: r.liman, deger: r.deger }));
      drawPortsBars(ph, top, seri, useYear, unit);
    }

    const sh = document.getElementById("dSplit");
    if (sh) {
      // Seçili ayların toplamı — tek satır değil, bu yüzden düzenlenebilir değil
      const items = cfg.series.map((s, i) => ({ label: nm(s), value: sumSel(s.k), color: ramp[i % ramp.length] }))
        .filter((x) => x.value > 0);
      if (items.length > 1) C.donut(sh, { unit, items });
      else sh.innerHTML = `<p class="csub">—</p>`;
    }

    const dnh = document.getElementById("dDonut");
    if (dnh && cfg.donut) {
      const rows = bRows().filter((r) => r.boyut === cfg.donut.dim);
      const yr = Math.max(...rows.map((r) => r.yil));
      const items = rows.filter((r) => r.yil === yr).sort((a, b) => b.deger - a.deger).slice(0, 6)
        .map((r, i) => ({ label: short(r.etiket), value: r.deger, color: palette[i % palette.length], edit: bdEdit(r) }));
      if (items.length) C.donut(dnh, { unit, items });
    }

    const bh = document.getElementById("dBars");
    if (bh && cfg.barsDim) {
      const rows = bRows().filter((r) => r.boyut === cfg.barsDim.dim);
      const yr = Math.max(...rows.map((r) => r.yil));
      const items = rows.filter((r) => r.yil === yr).sort((a, b) => b.deger - a.deger).slice(0, cfg.barsDim.top)
        .map((r) => ({ label: short(r.etiket), value: r.deger, color: accent,
                       edit: bdEdit(r), editLabel: bdEditLabel(r) }));
      if (items.length) C.bars(bh, { unit, items });
    }
  }

  function short(s) {
    const p = String(s).split("/");
    const v = lang() === "en" && p[1] ? p[1] : p[0];
    return v.replace(/^[\s\-–]+/, "").trim().slice(0, 26);
  }

  function renderArchive() {
    const box = document.getElementById("catArchive");
    const a = A[cfg.arch];
    if (!box) return;
    if (!a) { box.innerHTML = ""; return; }
    const total = Object.values(a.yillar).reduce((s, v) => s + v.length, 0);
    box.innerHTML = `<a class="files-cta" href="dosyalar.html?kat=${cfg.arch}">
      <span class="fc-ic"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M14 3v5h5M7 3h8l5 5v11a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z"/></svg></span>
      <span class="fc-tx"><b data-i18n="ui.viewFiles">${t("ui.viewFiles")}</b><span>${total.toLocaleString(loc)} <span data-i18n="ui.files">${t("ui.files")}</span></span></span>
      ${arrow("right")}</a>`;
  }

  /* ---------- Detay veri: Supabase fact_* → yoksa statik detail/<kat>.js yedeği ---------- */
  const SUPA_URL = "https://mczowhdwwdidchtgeioo.supabase.co";
  const SUPA_KEY = "sb_publishable_0GoNDg3SAFC7dK1AOc2SsA_u7bN8Bc2";

  async function loadDetailFromSupabase(catSlug) {
    const h = { apikey: SUPA_KEY, Authorization: "Bearer " + SUPA_KEY };
    // Supabase projesinde sunucu tarafı sabit 1000 satır tavanı var (limit= parametresi
    // etkisiz) — Range header ile sayfalıyoruz. İlk istek toplam satır sayısını da
    // getirir (Prefer: count=exact), kalan sayfalar paralel çekilir: fact_country
    // 30 binden fazla satır tutuyor, seri sayfalama bunu ~30 gidiş-dönüşe yayıp
    // sayfayı on saniyelerce bekletiyordu.
    const PAGE = 1000, POOL = 16;
    async function page(path, offset, withCount) {
      const hdr = Object.assign({}, h, { Range: `${offset}-${offset + PAGE - 1}` });
      if (withCount) hdr.Prefer = "count=exact";
      const r = await fetch(`${SUPA_URL}/rest/v1/${path}`, { headers: hdr });
      if (!r.ok && r.status !== 206) throw new Error(path + " → HTTP " + r.status);
      const total = +((r.headers.get("content-range") || "").split("/")[1]);
      return { rows: await r.json(), total: Number.isFinite(total) ? total : null };
    }
    async function get(path) {
      const first = await page(path, 0, true);
      // Toplam bilinmiyorsa (count başlığı yoksa) eski davranış: dolu sayfa geldikçe devam et
      if (first.total == null) {
        let all = first.rows, offset = PAGE;
        while (all.length && all.length % PAGE === 0) {
          const nx = await page(path, offset, false);
          all = all.concat(nx.rows);
          if (nx.rows.length < PAGE) break;
          offset += PAGE;
        }
        return all;
      }
      const offsets = [];
      for (let o = PAGE; o < first.total; o += PAGE) offsets.push(o);
      const rest = [];
      // Aynı anda POOL kadar istek: hem hızlı hem de tarayıcı/Supabase kuyruğunu boğmuyor
      for (let i = 0; i < offsets.length; i += POOL) {
        const batch = await Promise.all(offsets.slice(i, i + POOL).map((o) => page(path, o, false)));
        batch.forEach((b) => rest.push(b.rows));
      }
      return first.rows.concat(...rest);
    }
    if (catSlug === "bogazlar") {
      // fact_strait: kendi kategorili değil, bogaz sütunuyla ayrışır — monthly şekline dönüştürülür.
      // Tanker (TTA/LPG/TCH) kırılımı ise gerçek fact_monthly satırları (kategori="bogazlar") —
      // ikisi aynı DET.monthly dizisinde birleşir, mVal()/sumSel() ayrım gözetmeden okur.
      const [rows, tankerRows] = await Promise.all([
        get("fact_strait?select=*&bogaz=eq.istanbul"),
        get("fact_monthly?select=*&kategori=eq.bogazlar"),
      ]);
      if (!Array.isArray(rows) || !rows.length) throw new Error("boş fact_strait");
      const monthly = [];
      rows.forEach((r) => {
        if (r.gemi_adedi != null) monthly.push({ kategori: "bogazlar", yil: r.yil, ay: r.ay, seri: "toplam", deger: +r.gemi_adedi });
        if (r.gros_ton != null) monthly.push({ kategori: "bogazlar", yil: r.yil, ay: r.ay, seri: "gros_ton", deger: +r.gros_ton });
        if (r.ugraksiz_gemi != null) monthly.push({ kategori: "bogazlar", yil: r.yil, ay: r.ay, seri: "ugraksiz", deger: +r.ugraksiz_gemi });
      });
      (tankerRows || []).forEach((r) => monthly.push({ kategori: "bogazlar", yil: r.yil, ay: r.ay, seri: r.seri, deger: +r.deger }));
      return { monthly, ports: [], breakdown: [] };
    }
    const q = `kategori=eq.${catSlug}`;
    const [monthly, ports, breakdown, country] = await Promise.all([
      get(`fact_monthly?select=*&${q}`),
      get(`fact_port?select=*&${q}`),
      get(`fact_breakdown?select=*&${q}`),
      get(`fact_country?select=*&${q}`),
    ]);
    // ülke kırılımı, diğer boyutlarla aynı fact_breakdown şekline (boyut='ulke') dönüştürülüp birleştirilir
    // _src: düzenleme sırasında hangi tabloya yazılacağını bilmek için
    const countryAsBreakdown = country.map((r) => ({
      kategori: r.kategori, yil: r.yil, boyut: "ulke", etiket: r.ulke, seri: r.seri, deger: r.deger,
      _src: "fact_country",
    }));
    if (!monthly.length && !ports.length && !breakdown.length) throw new Error("boş sonuç");
    const merged = breakdown.concat(countryAsBreakdown);
    const out = { monthly, ports, breakdown: merged };
    // Yalnız TEK boyutlu kırılıma sahip kategoriler için (örn. filo: sadece gemi_cinsi)
    // yıllık trend güvenle türetilebilir — birden çok boyut varsa toplamak çift sayım olur.
    const dims = new Set(merged.map((r) => r.boyut));
    if (merged.length && dims.size === 1) {
      const trend = {};
      merged.forEach((r) => { trend[r.yil] = (trend[r.yil] || 0) + r.deger; });
      out.trend = trend;
    }
    return out;
  }

  function computeYears() {
    const ys = new Set();
    if (cfg.yearsOnly) {
      cfg.metrics.forEach((mt) => { const tr2 = T[mt.key]; if (tr2) Object.keys(tr2).forEach((y) => ys.add(+y)); });
    } else {
      mRows().forEach((r) => ys.add(r.yil));
      pRows().forEach((r) => ys.add(r.yil));
      const tr = catTrend();
      if (tr) Object.keys(tr).forEach((y) => ys.add(+y));
    }
    if (!ys.size && m.yil) ys.add(m.yil);
    const yFiltered = cfg.yearMin ? [...ys].filter((y) => y >= cfg.yearMin) : [...ys];
    years = yFiltered.sort((a, b) => b - a);
  }

  function paint() {
    const span = cfg.defaultYearSpan || 1;
    computeYears();
    if (!state) {
      state = { years: years.slice(0, Math.min(span, years.length)), months: [], seri: "toplam",
        region: "all", tip: "tumu", bayrak: "toplam" };
      state.months = curAvail();
    } else if (!state.years.length || !state.years.some((y) => years.includes(y))) {
      // Yedek veriyle çizilmişken canlı veri gelirse seçili yıllar geçersiz kalabilir
      state.years = years.slice(0, Math.min(span, years.length));
      state.months = curAvail();
    }
    closeAllDD();

    skeleton();
    renderFilters();
    renderDash();
    renderArchive();
    window.MDScan && window.MDScan();
  }

  function start() {
    const MD = window.MARITIME_DATA || {};
    H = MD.headline || {}; P = MD.ports || []; T = MD.trend || {};
    DET = window.DETAIL_DATA || { monthly: [], ports: [], breakdown: [] };
    m = (H && H[cfg.headKey]) || { deger: 0, yil: 2026 };
    accent = getComputedStyle(document.documentElement).getPropertyValue(cfg.accent).trim();
    document.title = t("cat." + cat) + " — " + t("site.title");
    if (cfg.quad) document.body.classList.add("cat-quad");

    // Pano tek seferde, canlı veri elde olduğunda çizilir — yarım/boş grafik görünmesin.
    // Canlı veri LIVE_TIMEOUT_MS içinde gelmezse gömülü detail/<kat>.js yedeğiyle çizilir,
    // canlı veri sonradan gelirse pano bir kez tazelenir.
    let settled = false;
    loadDetailFromSupabase(cat).then((live) => {
      if (live && (live.monthly?.length || live.ports?.length || live.breakdown?.length)) {
        DET = live;
        const MD2 = window.MARITIME_DATA || {};
        H = MD2.headline || H; P = MD2.ports || P; T = MD2.trend || T;
      }
    }).catch(() => {
      console.info(`[category] ${cat}: yerel veri devrede.`);
    }).then(() => { settled = true; paint(); });

    setTimeout(() => { if (!settled) paint(); }, LIVE_TIMEOUT_MS);
  }

  Promise.all([window.MD_READY || Promise.resolve(), window.MD_I18N_READY || Promise.resolve()]).then(start);
})();
