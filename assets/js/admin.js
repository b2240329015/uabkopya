/* ============================================================
   admin.js — Yönetim paneli: giriş + metrics/ports/trends/detay editörleri
   Yazma yalnız Supabase Auth ile giriş yapan kullanıcı için (RLS).
   ============================================================ */
(function () {
  "use strict";
  const SUPA_URL = "https://mczowhdwwdidchtgeioo.supabase.co";
  const SUPA_KEY = "sb_publishable_0GoNDg3SAFC7dK1AOc2SsA_u7bN8Bc2";
  const sb = window.supabase.createClient(SUPA_URL, SUPA_KEY);

  const $ = (id) => document.getElementById(id);
  const nf = new Intl.NumberFormat("tr-TR");

  // Normalde giriş sonrası doğrudan sitede düzenlemeye gidilir; bu tablo görünümü
  // yalnız admin.html?gelismis=1 ile açılır (detay veri / liman / trend düzenleme).
  const SHOW_TABLES = new URLSearchParams(location.search).has("gelismis");

  /* ---------- Giriş / oturum ---------- */
  async function refreshSession() {
    const { data: { session } } = await sb.auth.getSession();
    if (session) {
      if (!SHOW_TABLES) { location.replace("./?edit=1"); return; }
      $("loginBox").hidden = true;
      $("adminBox").hidden = false;
      $("whoAmI").innerHTML = `${session.user.email} <button type="button" id="pwBtn" class="admin-linklike">şifre belirle/değiştir</button>`;
      $("pwBtn").addEventListener("click", showPasswordForm);
      loadTab(currentTab);
    } else {
      $("loginBox").hidden = false;
      $("adminBox").hidden = true;
    }
  }

  function showPasswordForm() {
    const np = prompt("Yeni şifreni gir (en az 6 karakter):");
    if (!np) return;
    if (np.length < 6) { alert("Şifre en az 6 karakter olmalı."); return; }
    sb.auth.updateUser({ password: np }).then(({ error }) => {
      alert(error ? "Hata: " + error.message : "Şifre güncellendi. Bir sonraki girişte bunu kullan.");
    });
  }

  $("loginBtn").addEventListener("click", async () => {
    const email = $("loginEmail").value.trim();
    const password = $("loginPass").value;
    $("loginMsg").textContent = "Giriş yapılıyor…";
    $("loginMsg").className = "admin-msg";
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) {
      $("loginMsg").textContent = "Hata: " + (error.message === "Invalid login credentials" ? "E-posta veya şifre hatalı." : error.message);
      $("loginMsg").className = "admin-msg err";
    } else {
      $("loginMsg").textContent = "";
      refreshSession();
    }
  });
  $("loginPass").addEventListener("keydown", (e) => { if (e.key === "Enter") $("loginBtn").click(); });

  $("logoutBtn").addEventListener("click", async () => { await sb.auth.signOut(); refreshSession(); });

  /* ---------- Sekmeler ---------- */
  let currentTab = "content";
  document.querySelectorAll(".admin-tabs button").forEach((b) => {
    b.addEventListener("click", () => {
      document.querySelectorAll(".admin-tabs button").forEach((x) => x.classList.remove("on"));
      b.classList.add("on");
      document.querySelectorAll(".admin-panel").forEach((p) => (p.hidden = true));
      currentTab = b.dataset.tab;
      $("tab-" + currentTab).hidden = false;
      loadTab(currentTab);
    });
  });

  const loaded = {};
  function loadTab(tab) {
    if (tab === "content") return renderContent();
    if (tab === "metrics") return renderMetrics();
    if (tab === "ports") return renderPorts();
    if (tab === "trends") return renderTrends();
    if (tab === "detail") return renderDetail();
  }

  function toast(container, msg, isErr) {
    let el = container.querySelector(".admin-toast");
    if (!el) { el = document.createElement("div"); el.className = "admin-toast"; container.prepend(el); }
    el.textContent = msg;
    el.className = "admin-toast" + (isErr ? " err" : " ok");
    clearTimeout(el._t); el._t = setTimeout(() => el.remove(), 3000);
  }

  /* ============================================================
     Jenerik düzenlenebilir tablo
     ============================================================ */
  function buildTable(container, opts) {
    // opts: {table, columns:[{key,label,type,editable,width}], pk:[keys], rows, onSaved}
    const cols = opts.columns;
    let html = `<div class="admin-tablewrap"><table class="admin-table"><thead><tr>`;
    cols.forEach((c) => (html += `<th>${c.label}</th>`));
    html += `<th></th></tr></thead><tbody>`;
    opts.rows.forEach((row, i) => {
      html += `<tr data-i="${i}">`;
      cols.forEach((c) => {
        const v = row[c.key] == null ? "" : row[c.key];
        if (c.editable === false) html += `<td>${v}</td>`;
        else html += `<td><input data-k="${c.key}" type="${c.type || "text"}" value="${String(v).replace(/"/g, "&quot;")}" ${c.step ? `step="${c.step}"` : ""}></td>`;
      });
      html += `<td class="admin-rowactions"><button type="button" class="ic-save" title="Kaydet">${ICON.save}</button><button type="button" class="ic-del" title="Sil">${ICON.trash}</button></td></tr>`;
    });
    html += `</tbody></table></div>`;
    html += `<button type="button" class="btn btn-ghost admin-addrow">+ Yeni satır ekle</button>`;
    container.innerHTML = html;

    container.querySelectorAll(".ic-save").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const tr = btn.closest("tr");
        const i = +tr.dataset.i;
        const orig = opts.rows[i];
        const patch = {};
        tr.querySelectorAll("input[data-k]").forEach((inp) => {
          const col = cols.find((c) => c.key === inp.dataset.k);
          patch[inp.dataset.k] = col.type === "number" ? (inp.value === "" ? null : Number(inp.value)) : inp.value;
        });
        const match = {}; opts.pk.forEach((k) => (match[k] = orig[k]));
        btn.disabled = true;
        const { error } = await sb.from(opts.table).update(patch).match(match);
        btn.disabled = false;
        if (error) toast(container, "Kaydedilemedi: " + error.message, true);
        else { Object.assign(orig, patch); toast(container, "Kaydedildi.", false); }
      });
    });
    container.querySelectorAll(".ic-del").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const tr = btn.closest("tr");
        const i = +tr.dataset.i;
        if (!confirm("Bu satırı silmek istediğine emin misin?")) return;
        const match = {}; opts.pk.forEach((k) => (match[k] = opts.rows[i][k]));
        const { error } = await sb.from(opts.table).delete().match(match);
        if (error) { toast(container, "Silinemedi: " + error.message, true); return; }
        opts.rows.splice(i, 1);
        buildTable(container, opts);
      });
    });
    container.querySelector(".admin-addrow").addEventListener("click", () => {
      const blank = {}; cols.forEach((c) => (blank[c.key] = c.type === "number" ? 0 : ""));
      opts.rows.push(blank);
      buildTable(container, opts);
      // yeni satırı gerçek insert yap: son satırın kaydet butonuna insert davranışı ekle
      const lastTr = container.querySelector(`tr[data-i="${opts.rows.length - 1}"]`);
      const saveBtn = lastTr.querySelector(".ic-save");
      const freshBtn = saveBtn.cloneNode(true);
      saveBtn.replaceWith(freshBtn);
      freshBtn.addEventListener("click", async () => {
        const patch = {};
        lastTr.querySelectorAll("input[data-k]").forEach((inp) => {
          const col = cols.find((c) => c.key === inp.dataset.k);
          patch[inp.dataset.k] = col.type === "number" ? (inp.value === "" ? null : Number(inp.value)) : inp.value;
        });
        freshBtn.disabled = true;
        const { error } = await sb.from(opts.table).insert(patch);
        freshBtn.disabled = false;
        if (error) { toast(container, "Eklenemedi: " + error.message, true); return; }
        toast(container, "Eklendi.", false);
        loadTab(currentTab);
      });
    });
  }

  const ICON = {
    save: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg>',
    trash: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6"/></svg>',
  };

  /* ============================================================
     Site Metinleri (content) — anasayfa/menü/footer vb. tüm metinler
     ============================================================ */
  async function renderContent() {
    const box = $("tab-content");
    box.innerHTML = `<div class="admin-card">Yükleniyor…</div>`;
    const { data, error } = await sb.from("content").select("*").order("key");
    if (error) { box.innerHTML = `<div class="admin-card err">Hata: ${error.message}</div>`; return; }
    const holder = document.createElement("div"); holder.className = "admin-card";
    holder.innerHTML = `
      <h2>Site Metinleri <span class="admin-hint">(anasayfa açıklamaları, menü, footer, kategori başlıkları vb. — ${data.length} metin)</span></h2>
      <div class="field" style="max-width:320px"><label>Ara</label><input type="search" id="cQ" placeholder="anahtar veya metin ara…"></div>
      <div id="contentTbl"></div>`;
    box.innerHTML = ""; box.appendChild(holder);
    const tbl = $("contentTbl");
    function draw(q) {
      const rows = q
        ? data.filter((r) => (r.key + " " + (r.tr || "") + " " + (r.en || "")).toLocaleLowerCase("tr").includes(q))
        : data;
      buildTable(tbl, {
        table: "content", pk: ["key"], rows,
        columns: [
          { key: "key", label: "Anahtar", editable: false },
          { key: "tr", label: "Türkçe" },
          { key: "en", label: "English" },
        ],
      });
    }
    draw("");
    let timer;
    $("cQ").addEventListener("input", (e) => {
      clearTimeout(timer);
      const v = e.target.value.trim().toLocaleLowerCase("tr");
      timer = setTimeout(() => draw(v), 150);
    });
  }

  /* ============================================================
     Metrikler
     ============================================================ */
  async function renderMetrics() {
    const box = $("tab-metrics");
    box.innerHTML = `<div class="admin-card">Yükleniyor…</div>`;
    const { data, error } = await sb.from("metrics").select("*").order("ord");
    if (error) { box.innerHTML = `<div class="admin-card err">Hata: ${error.message}</div>`; return; }
    const holder = document.createElement("div"); holder.className = "admin-card";
    holder.innerHTML = `<h2>Metrikler <span class="admin-hint">(anasayfa KPI kartları)</span></h2>`;
    const tbl = document.createElement("div"); holder.appendChild(tbl);
    box.innerHTML = ""; box.appendChild(holder);
    buildTable(tbl, {
      table: "metrics", pk: ["key"], rows: data,
      columns: [
        { key: "key", label: "Anahtar", editable: false },
        { key: "label", label: "Etiket" },
        { key: "value", label: "Değer", type: "number" },
        { key: "unit", label: "Birim" },
        { key: "year", label: "Yıl", type: "number" },
        { key: "prev", label: "Önceki", type: "number" },
        { key: "yoy", label: "YoY %", type: "number", step: "0.1" },
        { key: "ord", label: "Sıra", type: "number" },
      ],
    });
  }

  /* ============================================================
     Limanlar
     ============================================================ */
  async function renderPorts() {
    const box = $("tab-ports");
    box.innerHTML = `<div class="admin-card">Yükleniyor…</div>`;
    const { data, error } = await sb.from("ports").select("*").order("name");
    if (error) { box.innerHTML = `<div class="admin-card err">Hata: ${error.message}</div>`; return; }
    const holder = document.createElement("div"); holder.className = "admin-card";
    holder.innerHTML = `<h2>Limanlar <span class="admin-hint">(${data.length} liman — harita ve grafiklerde kullanılır)</span></h2>`;
    const tbl = document.createElement("div"); holder.appendChild(tbl);
    box.innerHTML = ""; box.appendChild(holder);
    buildTable(tbl, {
      table: "ports", pk: ["name"], rows: data,
      columns: [
        { key: "name", label: "Liman" },
        { key: "sea", label: "Deniz" },
        { key: "lat", label: "Enlem", type: "number", step: "0.01" },
        { key: "lon", label: "Boylam", type: "number", step: "0.01" },
        { key: "mx", label: "Harita X", type: "number", step: "0.1" },
        { key: "my", label: "Harita Y", type: "number", step: "0.1" },
        { key: "yuk_ton", label: "Yük (ton)", type: "number" },
        { key: "konteyner_teu", label: "Konteyner (TEU)", type: "number" },
      ],
    });
  }

  /* ============================================================
     Trendler
     ============================================================ */
  async function renderTrends() {
    const box = $("tab-trends");
    box.innerHTML = `
      <div class="admin-card">
        <h2>Trendler <span class="admin-hint">(yıllık zaman serileri)</span></h2>
        <div class="field" style="max-width:280px">
          <label>Metrik</label>
          <select id="trendMetric"></select>
        </div>
        <div id="trendTbl"></div>
      </div>`;
    const { data: metrics } = await sb.from("trends").select("metric").limit(1000);
    const uniq = [...new Set((metrics || []).map((r) => r.metric))].sort();
    const sel = $("trendMetric");
    sel.innerHTML = uniq.map((m) => `<option value="${m}">${m}</option>`).join("");
    async function load() {
      const metric = sel.value;
      const { data, error } = await sb.from("trends").select("*").eq("metric", metric).order("year", { ascending: false });
      const tbl = $("trendTbl");
      if (error) { tbl.innerHTML = `<p class="err">${error.message}</p>`; return; }
      buildTable(tbl, {
        table: "trends", pk: ["metric", "year"], rows: data,
        columns: [
          { key: "metric", label: "Metrik" },
          { key: "year", label: "Yıl", type: "number" },
          { key: "value", label: "Değer", type: "number" },
        ],
      });
    }
    sel.addEventListener("change", load);
    if (uniq.length) load();
  }

  /* ============================================================
     Detay veri (fact_*) — kategori + yıl filtreli
     ============================================================ */
  const CATS = ["yuk", "konteyner", "gemi", "kruvaziyer", "roro", "bogazlar", "kabotaj", "filo"];
  const TABLES = {
    monthly: { table: "fact_monthly", pk: ["kategori", "yil", "ay", "seri"],
      cols: [{ key: "kategori", label: "Kategori" }, { key: "yil", label: "Yıl", type: "number" },
             { key: "ay", label: "Ay", type: "number" }, { key: "seri", label: "Seri" }, { key: "deger", label: "Değer", type: "number" }] },
    port: { table: "fact_port", pk: ["kategori", "yil", "liman", "seri"],
      cols: [{ key: "kategori", label: "Kategori" }, { key: "yil", label: "Yıl", type: "number" },
             { key: "liman", label: "Liman" }, { key: "seri", label: "Seri" }, { key: "deger", label: "Değer", type: "number" }] },
    breakdown: { table: "fact_breakdown", pk: ["kategori", "yil", "boyut", "etiket", "seri"],
      cols: [{ key: "kategori", label: "Kategori" }, { key: "yil", label: "Yıl", type: "number" }, { key: "boyut", label: "Boyut" },
             { key: "etiket", label: "Etiket" }, { key: "seri", label: "Seri" }, { key: "deger", label: "Değer", type: "number" }] },
    country: { table: "fact_country", pk: ["kategori", "yil", "ulke", "seri"],
      cols: [{ key: "kategori", label: "Kategori" }, { key: "yil", label: "Yıl", type: "number" },
             { key: "ulke", label: "Ülke" }, { key: "seri", label: "Seri" }, { key: "deger", label: "Değer", type: "number" }],
      label: "ulke" },
    // Boğazlar sayfası aylık verisini fact_strait'ten okur; kategori sütunu yok,
    // satırlar "bogaz" ile ayrışır — bu yüzden kategori filtresi yerine boğaz seçilir.
    strait: { table: "fact_strait", pk: ["bogaz", "yil", "ay"], scope: "bogaz",
      cols: [{ key: "bogaz", label: "Boğaz" }, { key: "yil", label: "Yıl", type: "number" },
             { key: "ay", label: "Ay", type: "number" }, { key: "gemi_adedi", label: "Gemi adedi", type: "number" },
             { key: "gros_ton", label: "Gros ton", type: "number" }, { key: "ugraksiz_gemi", label: "Uğraksız", type: "number" },
             { key: "kilavuz_alan", label: "Kılavuz alan", type: "number" }, { key: "sp1_veren", label: "SP-1 veren", type: "number" }] },
  };
  // fact_monthly/port/breakdown/country'de arama yapılacak metin sütunu
  TABLES.monthly.label = "seri";
  TABLES.port.label = "liman";
  TABLES.breakdown.label = "etiket";
  const BOGAZLAR = ["istanbul", "canakkale"];
  const DETAIL_PAGE = 200;

  // Panel her açılışta yeniden çizilir; son seçim ve sayfa numarası burada yaşar
  const dState = { tur: "monthly", kat: "yuk", bogaz: "istanbul", yil: "", ara: "", page: 0, total: 0 };

  function renderDetail() {
    const box = $("tab-detail");
    const cfg = TABLES[dState.tur];
    const scoped = cfg.scope === "bogaz";
    box.innerHTML = `
      <div class="admin-card">
        <h2>Detay Veri <span class="admin-hint">(kategori sayfalarının okuduğu fact_* tabloları)</span></h2>
        <div class="admin-filters">
          <div class="field"><label>Tablo</label>
            <select id="dTur">
              <option value="monthly">Aylık</option>
              <option value="port">Liman</option>
              <option value="breakdown">Kırılım</option>
              <option value="country">Ülke</option>
              <option value="strait">Boğaz (aylık)</option>
            </select></div>
          <div class="field"><label>${scoped ? "Boğaz" : "Kategori"}</label>
            <select id="dKat">${(scoped ? BOGAZLAR : CATS).map((c) => `<option value="${c}">${c}</option>`).join("")}</select></div>
          <div class="field"><label>Yıl</label>
            <input type="number" id="dYil" placeholder="tümü" value="${dState.yil}"></div>
          <div class="field"><label>${cfg.label === "seri" ? "Seri içerir" : cfg.label ? cfg.label + " içerir" : "Ara"}</label>
            <input type="text" id="dAra" placeholder="${cfg.label === "seri" ? "örn. yukleme" : "örn. Mersin"}" value="${dState.ara}"
                   ${cfg.label ? "" : "disabled"}></div>
          <button class="btn btn-primary" id="dGetir" type="button">Getir</button>
        </div>
        <div id="detailInfo" class="admin-hint"></div>
        <div id="detailTbl"></div>
      </div>`;
    $("dTur").value = dState.tur;
    $("dKat").value = scoped ? dState.bogaz : dState.kat;
    $("dTur").addEventListener("change", () => {
      dState.yil = $("dYil").value.trim(); // yazılan yıl tablo değişince kaybolmasın
      dState.tur = $("dTur").value; dState.page = 0;
      dState.ara = ""; // arama sütunu tabloya göre değişiyor, taşınamaz
      renderDetail(); // sütun ve filtre etiketleri tabloya göre değişir
    });
    $("dKat").addEventListener("change", () => {
      if (TABLES[dState.tur].scope === "bogaz") dState.bogaz = $("dKat").value;
      else dState.kat = $("dKat").value;
      dState.page = 0;
    });
    ["dYil", "dAra"].forEach((id) => $(id).addEventListener("keydown", (e) => {
      if (e.key === "Enter") $("dGetir").click();
    }));
    $("dGetir").addEventListener("click", () => { dState.page = 0; loadDetail(); });
  }

  // Filtreler tek yerde kurulur: hem satırları hem toplam sayıyı aynı koşul üretsin
  function detailQuery(cfg, select, opts) {
    let q = sb.from(cfg.table).select(select, opts);
    q = cfg.scope === "bogaz" ? q.eq("bogaz", dState.bogaz) : q.eq("kategori", dState.kat);
    if (dState.yil) q = q.eq("yil", +dState.yil);
    if (dState.ara && cfg.label) q = q.ilike(cfg.label, `%${dState.ara}%`);
    return q;
  }

  async function loadDetail() {
    const cfg = TABLES[dState.tur];
    const tbl = $("detailTbl"), info = $("detailInfo");
    dState.yil = $("dYil").value.trim();
    dState.ara = $("dAra").value.trim();
    tbl.innerHTML = "Yükleniyor…";
    info.textContent = "";

    const from = dState.page * DETAIL_PAGE;
    // count:"exact" toplamı da getirir — kaç satırın filtreye uyduğu görünsün
    const { data, error, count } = await detailQuery(cfg, "*", { count: "exact" })
      .order("yil", { ascending: false })
      .range(from, from + DETAIL_PAGE - 1);

    if (error) {
      // Sonuç kümesi küçüldüğünde (silme/filtre değişimi) istenen aralık boşa düşebilir
      if (dState.page > 0 && /range not satisfiable/i.test(error.message)) {
        dState.page = 0; return loadDetail();
      }
      tbl.innerHTML = `<p class="err">${error.message}</p>`; return;
    }
    dState.total = count || 0;
    if (!data.length) {
      tbl.innerHTML = "";
      info.textContent = dState.page > 0 ? "Bu sayfada satır yok." : "Filtreye uyan satır yok.";
      return;
    }
    const last = Math.max(0, Math.ceil(dState.total / DETAIL_PAGE) - 1);
    info.innerHTML = `${nf.format(dState.total)} satır · ${from + 1}–${from + data.length} arası gösteriliyor`
      + (last > 0 ? ` · sayfa ${dState.page + 1}/${last + 1}` : "");
    buildTable(tbl, { table: cfg.table, pk: cfg.pk, rows: data, columns: cfg.cols });
    if (last > 0) {
      const nav = document.createElement("div");
      nav.className = "admin-pager";
      nav.innerHTML = `<button type="button" class="btn btn-ghost" id="dPrev" ${dState.page === 0 ? "disabled" : ""}>← Önceki</button>
        <button type="button" class="btn btn-ghost" id="dNext" ${dState.page >= last ? "disabled" : ""}>Sonraki →</button>`;
      tbl.appendChild(nav);
      $("dPrev").addEventListener("click", () => { dState.page--; loadDetail(); });
      $("dNext").addEventListener("click", () => { dState.page++; loadDetail(); });
    }
  }

  /* ---------- Başlat ---------- */
  sb.auth.onAuthStateChange(() => refreshSession());
  refreshSession();
})();
