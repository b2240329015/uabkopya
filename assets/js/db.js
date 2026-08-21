/* ============================================================
   db.js — Supabase veri katmanı
   Tabloları REST API'den çeker, window.MARITIME_DATA'yı doldurur.
   Supabase erişilemezse gömülü veriye (data.js) düşer.
   Sayfa script'leri window.MD_READY promise'ini bekler.
   ============================================================ */
(function () {
  "use strict";
  const SUPABASE_URL = "https://mczowhdwwdidchtgeioo.supabase.co";
  // Publishable (anon) key — tarayıcıda güvenli: RLS ile yalnızca okuma izni var.
  const SUPABASE_KEY = "sb_publishable_0GoNDg3SAFC7dK1AOc2SsA_u7bN8Bc2";

  const FALLBACK = window.MARITIME_DATA || {};

  async function fromSupabase() {
    const h = { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY };
    const get = (path) => fetch(SUPABASE_URL + "/rest/v1/" + path, { headers: h }).then((r) => {
      if (!r.ok) throw new Error(path + " → HTTP " + r.status);
      return r.json();
    });
    const [m, p, t] = await Promise.all([
      get("metrics?select=*&order=ord"),
      get("ports?select=*"),
      get("trends?select=*"),
    ]);
    if (!Array.isArray(m) || !m.length) throw new Error("boş metrics");

    const headline = {};
    m.forEach((x) => {
      headline[x.key] = {
        deger: +x.value, yil: x.year,
        onceki: x.prev == null ? undefined : +x.prev,
        yoy: x.yoy == null ? undefined : +x.yoy,
        not: x.note || undefined,
      };
    });
    const ports = p.map((x) => ({
      name: x.name, sea: x.sea, lat: +x.lat, lon: +x.lon,
      mx: +x.mx, my: +x.my, yuk_ton: +x.yuk_ton, konteyner_teu: +x.konteyner_teu,
    }));
    const trend = {};
    t.forEach((x) => { (trend[x.metric] = trend[x.metric] || {})[x.year] = +x.value; });

    // Harita geometrisi (viewBox/outline/searoute) DB'de değil — gömülü veriden gelir.
    window.MARITIME_DATA = Object.assign({}, FALLBACK, { _source: "inline" });
    return window.MARITIME_DATA;
  }

  // Hemen kullanılabilir veri (anında render)
  window.MARITIME_DATA = Object.assign({}, FALLBACK, { _source: "inline" });
  window.MD_READY = Promise.resolve(window.MARITIME_DATA);

  // Arka planda Supabase'den güncelleme
  (async () => {
    try {
      const live = await fromSupabase();
      window.MARITIME_DATA = live;
      console.info("[db] Veri Supabase'den güncellendi.");
    } catch (e) {
      console.info("[db] Gömülü veri kullanılıyor.");
    }
  })();
})();
