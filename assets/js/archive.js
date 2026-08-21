/* ============================================================
   archive.js — resmi istatistik dosyalarının tam arşivi
   Kategori → yıl → dosya listesi + arama
   ============================================================ */
(function () {
  "use strict";
  const A = window.ARCHIVE_DATA;
  const host = document.getElementById("archiveApp");
  if (!A || !host) return;

  const keys = Object.keys(A);
  const total = keys.reduce((s, k) => s + Object.values(A[k].yillar).reduce((t, v) => t + v.length, 0), 0);
  let active = keys[0];
  let query = "";
  let monthFilter = "all";

  const MONTHS = [
    { k: "1", name: "Ocak" }, { k: "2", name: "Şubat" }, { k: "3", name: "Mart" },
    { k: "4", name: "Nisan" }, { k: "5", name: "Mayıs" }, { k: "6", name: "Haziran" },
    { k: "7", name: "Temmuz" }, { k: "8", name: "Ağustos" }, { k: "9", name: "Eylül" },
    { k: "10", name: "Ekim" }, { k: "11", name: "Kasım" }, { k: "12", name: "Aralık" }
  ];

  const fileIcon = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M14 3v5h5M7 3h8l5 5v11a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z"/></svg>';

  host.innerHTML = `
    <div class="archive-bar">
      <div class="archive-tabs" id="archTabs">
        ${keys.map((k) => `<button data-k="${k}" class="${k === active ? "on" : ""}">${A[k].baslik}
          <span>${Object.values(A[k].yillar).reduce((t, v) => t + v.length, 0)}</span></button>`).join("")}
      </div>
      <div class="archive-controls">
        <select id="archMonth" class="archive-select">
          <option value="all">Tüm Aylar</option>
          ${MONTHS.map((m) => `<option value="${m.k}">${m.name}</option>`).join("")}
        </select>
        <div class="archive-search">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
          <input type="search" id="archQ" placeholder="Dosya adında ara…" aria-label="Dosya ara">
        </div>
      </div>
    </div>
    <div class="archive-total">Arşivde toplam <b>${total.toLocaleString("tr-TR")}</b> resmi istatistik dosyası listeleniyor.</div>
    <div id="archBody"></div>`;

  function matchesMonth(fileObj, mVal) {
    if (mVal === "all") return true;
    const name = fileObj.ad.toLocaleLowerCase("tr");
    const mObj = MONTHS.find((x) => x.k === mVal);
    if (!mObj) return true;
    const mName = mObj.name.toLocaleLowerCase("tr");
    const mPad = mVal.padStart(2, "0");
    return name.includes(mName) || name.includes(`-${mPad}`) || name.includes(`_${mPad}`) || name.includes(` ${mPad} `);
  }

  function render() {
    const cat = A[active];
    const body = document.getElementById("archBody");
    const q = query.trim().toLocaleLowerCase("tr");
    const years = Object.keys(cat.yillar).sort((a, b) => {
      const na = parseInt(a, 10), nb = parseInt(b, 10);
      if (isNaN(na)) return 1;
      if (isNaN(nb)) return -1;
      return nb - na;
    });
    let html = "";
    let shown = 0;

    years.forEach((y, i) => {
      let files = cat.yillar[y] || [];
      if (monthFilter !== "all") {
        files = files.filter((f) => matchesMonth(f, monthFilter));
      }
      if (q) {
        files = files.filter((f) => f.ad.toLocaleLowerCase("tr").includes(q));
      }
      if (!files.length) return;
      shown += files.length;
      const open = (q || monthFilter !== "all") ? true : i < 2;
      html += `<details class="arch-year" ${open ? "open" : ""}>
        <summary><span class="yr">${y}</span><span class="cnt">${files.length} dosya</span>
          <svg class="chev" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg></summary>
        <ul class="arch-files">
          ${files.map((f) => `<li><a href="${f.url}" target="_blank" rel="noopener">${fileIcon}<span>${f.ad}</span><em>XLS</em></a></li>`).join("")}
        </ul></details>`;
    });

    body.innerHTML = shown ? html
      : `<div class="arch-empty">Aradığınız kriterlere uygun dosya bulunamadı.</div>`;
  }

  document.getElementById("archTabs").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-k]"); if (!b) return;
    active = b.dataset.k;
    document.querySelectorAll("#archTabs button").forEach((x) => x.classList.toggle("on", x === b));
    render();
  });
  let t;
  document.getElementById("archQ").addEventListener("input", (e) => {
    clearTimeout(t); const v = e.target.value;
    t = setTimeout(() => { query = v; render(); }, 180);
  });
  document.getElementById("archMonth")?.addEventListener("change", (e) => {
    monthFilter = e.target.value;
    render();
  });

  render();
})();
