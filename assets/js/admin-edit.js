/* ============================================================
   admin-edit.js — Sitenin kendisi üzerinde düzenleme
   Yalnız admin.html'den giriş yapıp ?edit=1 ile gelindiğinde devreye girer.
   Oturum yoksa VEYA ?edit=1 yoksa hiçbir şey yapmaz — giriş yapmış admin
   sitede normal geziniyorsa bile hiçbir görsel iz bırakmaz (floating
   düğme/şerit yok); düzenleme yalnız admin panelinden başlar.

   Düzenlenebilir olanlar:
   · [data-i18n]        → content tablosu (metin, TR/EN)
   · [data-metric-key]  → metrics tablosu (anasayfa KPI sayıları)
   ============================================================ */
(function () {
  "use strict";
  const SUPA_URL = "https://mczowhdwwdidchtgeioo.supabase.co";
  const SUPA_KEY = "sb_publishable_0GoNDg3SAFC7dK1AOc2SsA_u7bN8Bc2";
  const SESSION_KEY = "sb-mczowhdwwdidchtgeioo-auth-token";

  /* ---------- Oturum ---------- */
  function readSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      return s && s.access_token ? s : null;
    } catch { return null; }
  }
  // skew: kaç saniye sonrasını da "dolmuş" say (peşinen tazelemek için)
  const isExpired = (s, skew) => !!(s.expires_at && s.expires_at * 1000 < Date.now() + (skew || 0) * 1000);

  async function refreshSession(s) {
    if (!s || !s.refresh_token) return null;
    try {
      const r = await fetch(SUPA_URL + "/auth/v1/token?grant_type=refresh_token", {
        method: "POST",
        headers: { apikey: SUPA_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: s.refresh_token }),
      });
      if (!r.ok) return null;
      const n = await r.json();
      if (!n || !n.access_token) return null;
      // supabase-js'in okuduğu şemayı koru; yanıt access/refresh/expires_at getirir
      const merged = Object.assign({}, s, n);
      localStorage.setItem(SESSION_KEY, JSON.stringify(merged));
      return merged;
    } catch { return null; }
  }

  let session = readSession();
  if (!session) return; // Giriş yok → tamamen sessiz

  // 401 alırsak bir kez tazeleyip tekrar dener
  async function authFetch(url, opts) {
    const go = () => fetch(url, Object.assign({}, opts, {
      headers: Object.assign({
        apikey: SUPA_KEY,
        Authorization: "Bearer " + session.access_token,
        "Content-Type": "application/json",
      }, opts.headers || {}),
    }));
    let r = await go();
    if (r.status === 401) {
      const ns = await refreshSession(session);
      if (ns) { session = ns; r = await go(); }
    }
    return r;
  }

  async function saveContent(key, tr, en) {
    const r = await authFetch(SUPA_URL + "/rest/v1/content", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ key, tr, en }),
    });
    if (!r.ok) throw new Error(r.status === 401 ? "oturum" : "HTTP " + r.status);
  }

  async function saveMetric(key, value) {
    const r = await authFetch(SUPA_URL + "/rest/v1/metrics?key=eq." + encodeURIComponent(key), {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ value }),
    });
    if (!r.ok) throw new Error(r.status === 401 ? "oturum" : "HTTP " + r.status);
  }

  /* ---------- Genel veritabanı hücresi (grafikler, tablolar) ----------
     data-edit = {t:tablo, m:{eşleşme}, f:sütun, l:etiket, k:"num"|"text"} */
  const matchQuery = (m) =>
    Object.keys(m).map((k) => `${encodeURIComponent(k)}=eq.${encodeURIComponent(m[k])}`).join("&");

  async function readCell(d) {
    const r = await authFetch(`${SUPA_URL}/rest/v1/${d.t}?${matchQuery(d.m)}&select=${encodeURIComponent(d.f)}`,
      { method: "GET" });
    if (!r.ok) throw new Error(r.status === 401 ? "oturum" : "HTTP " + r.status);
    const rows = await r.json();
    if (!rows.length) throw new Error("kayıt yok");
    return rows[0][d.f];
  }

  async function saveCell(d, value) {
    const body = {}; body[d.f] = value;
    const r = await authFetch(`${SUPA_URL}/rest/v1/${d.t}?${matchQuery(d.m)}`, {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error(r.status === 401 ? "oturum" : "HTTP " + r.status);
    const rows = await r.json();
    // Sessiz başarısızlık olmasın: eşleşen satır yoksa kullanıcıya söyle
    if (!rows.length) throw new Error("eşleşen kayıt bulunamadı");
  }

  /* ---------- Sayfalar (üst şerit menüsü) ---------- */
  // Adresler artık uzantısız (index → "./"); eski .html bağlantıları da
  // çalışmaya devam eder, sayfa kimliği ikisini de aynı şeye indirger.
  const pageId = (p) =>
    ((p || "").split(/[?#]/)[0].split("/").pop() || "index").replace(/\.html$/, "") || "index";
  const PAGES = [
    ["./", "index", "Anasayfa"],
    ["yuk", "yuk", "Yük"],
    ["konteyner", "konteyner", "Konteyner"],
    ["bogazlar", "bogazlar", "Türk Boğazları"],
    ["kabotaj", "kabotaj", "Kabotaj Hattı"],
    ["kruvaziyer", "kruvaziyer", "Kruvaziyer"],
    ["roro", "roro", "RO-RO Araç"],
    ["gemi", "gemi", "Gemi"],
    ["filo", "filo", "Filo"],
    ["dosyalar", "dosyalar", "Dosyalar"],
    ["iletisim", "iletisim", "İletişim"],
  ];

  /* Anahtar adı yerine insan dili — "home.title" değil "Anasayfa yazısı" */
  const KEY_LABELS = {
    site: "Site adı", nav: "Menü bağlantısı", ui: "Arayüz yazısı",
    home: "Anasayfa yazısı", kpi: "Kart başlığı", unit: "Birim", num: "Sayı birimi",
    cat: "Sayfa başlığı", files: "Dosyalar sayfası", map: "Harita sayfası",
    contact: "İletişim bilgisi", footer: "Alt bilgi",
    gemi: "Kart açıklaması", series: "Seri adı", sea: "Deniz bölgesi", dim: "Grafik başlığı",
    month: "Ay adı",
  };
  const friendly = (key) => KEY_LABELS[String(key).split(".")[0]] || "Bu yazı";

  const currentPage = pageId(location.pathname);
  const inShell = new URLSearchParams(location.search).get("edit") === "1";

  const ICON = {
    pencil: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>',
    close: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    gear: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 008 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 8a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 3.6 1.65 1.65 0 0010 2.09V2a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 8v0c.14.35.4.64.73.83H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>',
  };

  let popover = null, toast = null;

  function closePopover() { if (popover) { popover.remove(); popover = null; } }

  function showToast(msg, kind) {
    if (toast) toast.remove();
    toast = document.createElement("div");
    toast.id = "mdEditToast";
    toast.className = kind || "ok";
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => { if (toast) { toast.remove(); toast = null; } }, 3000);
  }

  function sessionLost() {
    closePopover();
    showToast("Oturumun sona ermiş. Tekrar giriş yapman gerekiyor.", "err");
    setTimeout(() => { location.href = "admin"; }, 1800);
  }

  /* ---------- Üst şerit ---------- */
  function buildBar() {
    const bar = document.createElement("div");
    bar.id = "mdEditBar";
    const known = PAGES.some((p) => p[1] === currentPage);
    bar.innerHTML = `
      <span class="meb-brand">${ICON.pencil}<span>Düzenleme modu</span></span>
      <label class="meb-page">Sayfa
        <select id="mdEditPage">
          ${known ? "" : `<option value="" selected>(bu sayfa)</option>`}
          ${PAGES.map(([href, id, n]) =>
            `<option value="${href}"${id === currentPage ? " selected" : ""}>${n}</option>`).join("")}
        </select>
      </label>
      <span class="meb-hint">Değiştirmek istediğin yazıya tıkla</span>
      <span class="meb-spacer"></span>
      <a class="meb-link" href="admin?gelismis=1">${ICON.gear}<span>Gelişmiş</span></a>
      <span class="meb-user">${(session.user && session.user.email) || ""}</span>
      <button type="button" class="meb-out" id="mdEditLogout">Çıkış</button>`;
    document.body.appendChild(bar);

    document.getElementById("mdEditPage").addEventListener("change", (e) => {
      if (e.target.value) location.href = e.target.value + "?edit=1";
    });
    document.getElementById("mdEditLogout").addEventListener("click", async () => {
      try {
        await fetch(SUPA_URL + "/auth/v1/logout", {
          method: "POST",
          headers: { apikey: SUPA_KEY, Authorization: "Bearer " + session.access_token },
        });
      } catch { /* çevrimdışı olsa da yerel oturumu temizle */ }
      localStorage.removeItem(SESSION_KEY);
      location.href = "./";
    });
  }

  /* ---------- Düzenleme pencereleri ---------- */
  function barHeight() {
    const b = document.getElementById("mdEditBar");
    return b ? b.offsetHeight : 0;
  }

  function positionNear(box, el) {
    const r = el.getBoundingClientRect();
    document.body.appendChild(box);
    let top = window.scrollY + r.bottom + 8;
    // Üst şeridin altında kalsın, ekranın dışına taşmasın
    top = Math.max(top, window.scrollY + barHeight() + 8);
    top = Math.min(top, window.scrollY + window.innerHeight - box.offsetHeight - 12);
    let left = window.scrollX + r.left;
    const bw = box.offsetWidth;
    if (left + bw > window.scrollX + window.innerWidth - 16) left = window.scrollX + window.innerWidth - bw - 16;
    if (left < window.scrollX + 12) left = window.scrollX + 12;
    box.style.top = top + "px";
    box.style.left = left + "px";
  }

  const raw = (k) => ((window.MDLang && window.MDLang.raw) ? window.MDLang.raw(k) : { tr: "", en: "" });

  function openTextPopover(el) {
    closePopover();
    const key = el.dataset.i18n || null;
    const hrefKey = el.dataset.i18nHref || null;
    const cur = key ? raw(key) : null;
    const curHref = hrefKey ? raw(hrefKey) : null;
    const headKey = key || hrefKey;

    const box = document.createElement("div");
    box.className = "md-edit-pop";
    box.innerHTML = `
      <div class="mep-head">
        <span class="mep-title">${key ? friendly(key) : "Bağlantı adresi"}<em>${headKey}</em></span>
        <button type="button" class="mep-close" title="Kapat">${ICON.close}</button>
      </div>
      ${key ? `<label>Türkçe</label><textarea class="mep-tr" rows="2"></textarea>
      <label>İngilizcesi <span class="mep-opt">(isteğe bağlı)</span></label>
      <textarea class="mep-en" rows="2"></textarea>` : ""}
      ${hrefKey ? `<label>Bağlantı adresi <span class="mep-opt">(tıklayınca gidilecek yer)</span></label>
      <input type="text" class="mep-href" spellcheck="false">` : ""}
      ${key === "home.year" ? `<p class="mep-note">Boş bırakırsan yıl otomatik olarak veritabanındaki en güncel yıldan gelir.</p>` : ""}
      <div class="mep-actions">
        <button type="button" class="btn btn-ghost mep-cancel">Vazgeç</button>
        <button type="button" class="btn btn-primary mep-save">Kaydet</button>
      </div>`;
    if (key) {
      box.querySelector(".mep-tr").value = cur.tr;
      box.querySelector(".mep-en").value = cur.en;
    }
    if (hrefKey) box.querySelector(".mep-href").value = curHref.tr;
    positionNear(box, el);
    popover = box;
    (box.querySelector(".mep-tr") || box.querySelector(".mep-href")).focus();

    box.querySelector(".mep-close").addEventListener("click", closePopover);
    box.querySelector(".mep-cancel").addEventListener("click", closePopover);
    box.querySelector(".mep-save").addEventListener("click", async () => {
      const save = box.querySelector(".mep-save");
      save.disabled = true; save.textContent = "Kaydediliyor…";
      try {
        if (key) {
          const tr = box.querySelector(".mep-tr").value;
          const en = box.querySelector(".mep-en").value;
          await saveContent(key, tr, en);
          if (window.MDLang && window.MDLang.setRaw) window.MDLang.setRaw(key, tr, en);
        }
        if (hrefKey) {
          const u = box.querySelector(".mep-href").value.trim();
          await saveContent(hrefKey, u, u); // adres dile göre değişmez
          if (window.MDLang && window.MDLang.setRaw) window.MDLang.setRaw(hrefKey, u, u);
        }
        closePopover();
        showToast("Kaydedildi.");
      } catch (e) {
        if (e.message === "oturum") { sessionLost(); return; }
        save.disabled = false; save.textContent = "Kaydet";
        showToast("Kaydedilemedi: " + e.message, "err");
      }
    });
  }

  /* Grafik sütunu / tablo hücresi → kaynak satırı düzenle */
  async function openCellPopover(el) {
    closePopover();
    let d;
    try { d = JSON.parse(el.getAttribute("data-edit")); } catch { return; }
    const isNum = d.k !== "text";
    const box = document.createElement("div");
    box.className = "md-edit-pop";
    box.innerHTML = `
      <div class="mep-head">
        <span class="mep-title">${d.l || "Veri"}<em>${d.t} · ${d.f}</em></span>
        <button type="button" class="mep-close" title="Kapat">${ICON.close}</button>
      </div>
      <label>${isNum ? "Değer" : "Metin"}</label>
      <input type="${isNum ? "number" : "text"}" class="mep-val" ${isNum ? 'step="any"' : ""} placeholder="Yükleniyor…" disabled>
      ${d.w ? `<p class="mep-note warn">${d.w}</p>` : ""}
      <p class="mep-note">Bu değer veritabanında saklanıyor; kaydedince grafikler yeniden hesaplanır.</p>
      <div class="mep-actions">
        <button type="button" class="btn btn-ghost mep-cancel">Vazgeç</button>
        <button type="button" class="btn btn-primary mep-save" disabled>Kaydet</button>
      </div>`;
    positionNear(box, el);
    popover = box;
    box.querySelector(".mep-close").addEventListener("click", closePopover);
    box.querySelector(".mep-cancel").addEventListener("click", closePopover);

    const input = box.querySelector(".mep-val");
    const save = box.querySelector(".mep-save");
    try {
      const v = await readCell(d);
      if (popover !== box) return; // arada kapatılmış
      input.value = v == null ? "" : v;
      input.disabled = false; input.placeholder = ""; save.disabled = false;
      input.focus(); input.select();
    } catch (e) {
      if (e.message === "oturum") { sessionLost(); return; }
      input.placeholder = "Okunamadı: " + e.message;
      return;
    }

    save.addEventListener("click", async () => {
      save.disabled = true; save.textContent = "Kaydediliyor…";
      try {
        await saveCell(d, isNum ? Number(input.value) : input.value);
        showToast("Kaydedildi, sayfa yenileniyor…");
        setTimeout(() => location.reload(), 700);
      } catch (e2) {
        if (e2.message === "oturum") { sessionLost(); return; }
        save.disabled = false; save.textContent = "Kaydet";
        showToast("Kaydedilemedi: " + e2.message, "err");
      }
    });
  }

  /* Hesaplanmış (türetilmiş) sayı — nereden düzenleneceğini anlat */
  function openInfoPopover(el) {
    closePopover();
    const box = document.createElement("div");
    box.className = "md-edit-pop";
    box.innerHTML = `
      <div class="mep-head">
        <span class="mep-title">Hesaplanan değer<em>doğrudan düzenlenmez</em></span>
        <button type="button" class="mep-close" title="Kapat">${ICON.close}</button>
      </div>
      <p class="mep-note">${el.getAttribute("data-derived")}</p>
      <div class="mep-actions"><button type="button" class="btn btn-primary mep-cancel">Anladım</button></div>`;
    positionNear(box, el);
    popover = box;
    box.querySelector(".mep-close").addEventListener("click", closePopover);
    box.querySelector(".mep-cancel").addEventListener("click", closePopover);
  }

  function openMetricPopover(el) {
    closePopover();
    const key = el.dataset.metricKey;
    const md = window.MARITIME_DATA && window.MARITIME_DATA.headline && window.MARITIME_DATA.headline[key];
    const box = document.createElement("div");
    box.className = "md-edit-pop";
    box.innerHTML = `
      <div class="mep-head">
        <span class="mep-title">Kart sayısı<em>${key}</em></span>
        <button type="button" class="mep-close" title="Kapat">${ICON.close}</button>
      </div>
      <label>Değer <span class="mep-opt">(tam sayı, noktasız)</span></label>
      <input type="number" class="mep-num" step="any">
      <div class="mep-actions">
        <button type="button" class="btn btn-ghost mep-cancel">Vazgeç</button>
        <button type="button" class="btn btn-primary mep-save">Kaydet</button>
      </div>`;
    box.querySelector(".mep-num").value = md ? md.deger : "";
    positionNear(box, el);
    popover = box;
    box.querySelector(".mep-num").focus();

    box.querySelector(".mep-close").addEventListener("click", closePopover);
    box.querySelector(".mep-cancel").addEventListener("click", closePopover);
    box.querySelector(".mep-save").addEventListener("click", async () => {
      const val = Number(box.querySelector(".mep-num").value);
      const save = box.querySelector(".mep-save");
      save.disabled = true; save.textContent = "Kaydediliyor…";
      try {
        await saveMetric(key, val);
        closePopover();
        showToast("Kaydedildi, sayfa yenileniyor…");
        setTimeout(() => location.reload(), 700);
      } catch (e) {
        if (e.message === "oturum") { sessionLost(); return; }
        save.disabled = false; save.textContent = "Kaydet";
        showToast("Kaydedilemedi: " + e.message, "err");
      }
    });
  }

  /* ---------- Tıklama yönlendirmesi ---------- */
  function wireClicks() {
    document.addEventListener("click", (e) => {
      if (e.target.closest("#mdEditBar")) return;          // şerit kendi işini görür
      if (popover && popover.contains(e.target)) return;   // pencere içi
      if (popover) closePopover();
      if (!inShell) return;

      const cEl = e.target.closest("[data-edit]");
      if (cEl) { e.preventDefault(); e.stopPropagation(); openCellPopover(cEl); return; }

      const mEl = e.target.closest("[data-metric-key]");
      if (mEl) { e.preventDefault(); e.stopPropagation(); openMetricPopover(mEl); return; }

      const tEl = e.target.closest("[data-i18n], [data-i18n-href]");
      if (tEl) { e.preventDefault(); e.stopPropagation(); openTextPopover(tEl); return; }

      const dEl = e.target.closest("[data-derived]");
      if (dEl) { e.preventDefault(); e.stopPropagation(); openInfoPopover(dEl); return; }

      // Düzenleme modunda bağlantılar kapalı — sayfa geçişi üstteki menüden
      const a = e.target.closest("a[href]");
      if (a) {
        e.preventDefault(); e.stopPropagation();
        showToast("Sayfa değiştirmek için üstteki “Sayfa” menüsünü kullan.", "info");
      }
    }, true);

    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closePopover(); });
  }

  /* ---------- Başlat ----------
     Düzenleme yalnız admin panelinden gelen ?edit=1 ile açılır. Onun dışında
     normal gezinme — giriş yapmış olsan bile — sıradan bir ziyaretçiden
     hiçbir görsel farkı olmasın diye burada hiçbir şey oluşturulmaz. */
  function start() {
    if (!inShell) return;
    document.documentElement.classList.add("md-edit-mode", "md-edit-shell");
    buildBar();
    wireClicks();
  }

  (async function init() {
    if (!inShell) return; // ?edit=1 yoksa oturum kontrolüne bile gerek yok
    if (isExpired(session, 60)) {
      session = await refreshSession(session);
      if (!session) return; // tazeleyemedik → ziyaretçi gibi davran
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
    else start();
  })();
})();
