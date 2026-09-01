/* ============================================================
   i18n.js — TR / EN dil katmanı
   Kullanım: t("nav.yuk") · data-i18n="nav.yuk" · MDLang.set("en")
   ============================================================ */
(function () {
  "use strict";

  const DICT = {
    tr: {
      "site.title": "Denizcilik İstatistikleri",
      "site.org": "T.C. Ulaştırma ve Altyapı Bakanlığı",
      "site.sub1": "Denizcilik", "site.sub2": "İstatistikleri",

      "nav.yuk": "Yük", "nav.konteyner": "Konteyner", "nav.bogazlar": "Türk Boğazları",
      "nav.kabotaj": "Kabotaj Hattı", "nav.kruvaziyer": "Kruvaziyer", "nav.roro": "RO-RO Araç",
      "nav.gemi": "Gemi", "nav.filo": "Filo", "nav.dosyalar": "Dosyalar",
      "nav.home": "Anasayfa", "nav.map": "Harita", "nav.contact": "İletişim",
      "nav.sitemap": "Site Haritası", "nav.other": "Diğer İstatistikler",

      "ui.theme": "Temayı değiştir", "ui.lang": "English", "ui.menu": "Menü",
      "ui.search": "Dosya adında ara…", "ui.all": "Tümü", "ui.year": "Yıl",
      "ui.region": "Deniz bölgesi", "ui.filter": "Filtrele", "ui.files": "dosya",
      "ui.detail": "Ayrıntılı incele", "ui.source": "Resmi kaynak sayfası",
      "ui.viewFiles": "Bu kategorinin dosyaları",
      "ui.notFound": "Sonuç bulunamadı.",
      "ui.month": "Ay", "ui.clear": "Temizle", "ui.series": "Seri", "ui.total": "Toplam",
      "ui.monthSelected": "ay seçili", "ui.partial": "kısmi dönem",

      "home.eyebrow": "Resmi Denizcilik İstatistikleri Panosu",
      "home.title": "Türkiye'nin Denizcilik Verileri",
      "home.lead": "Türkiye'nin deniz ticareti tek bakışta.",
      "home.yearCap": "güncel veri yılı",
      "home.source": "Kaynak: T.C. Ulaştırma ve Altyapı Bakanlığı — Denizcilik Genel Müdürlüğü.",

      "kpi.yuk": "Elleçlenen Yük", "kpi.konteyner": "Konteyner", "kpi.gemi": "Uğrayan Gemi",
      "kpi.bogaz": "Boğaz Gemi Geçişi", "kpi.kruvaziyer": "Kruvaziyer Yolcusu",
      "kpi.roro": "RO-RO ile Araç", "kpi.kabotaj": "Kabotaj Yolcusu", "kpi.filo": "Türk Ticaret Filosu",
      "kpi.vsYear": "{y}'e göre",

      "unit.ton": "ton", "unit.teu": "TEU", "unit.gemi": "gemi", "unit.gecis": "geçiş",
      "unit.yolcu": "yolcu", "unit.arac": "araç", "unit.grosston": "gros ton",
      "num.milyon": "milyon", "num.milyar": "milyar", "num.bin": "bin",

      "cat.yuk": "Yük İstatistikleri", "cat.konteyner": "Konteyner İstatistikleri",
      "cat.gemi": "Gemi İstatistikleri", "cat.kruvaziyer": "Kruvaziyer İstatistikleri",
      "cat.roro": "RO-RO Araç İstatistikleri", "cat.kabotaj": "Kabotaj İstatistikleri",
      "cat.bogazlar": "Türk Boğazları Gemi Geçiş İstatistikleri", "cat.filo": "Filo İstatistikleri",

      "yuk.kpiTotal": "Toplam Taşınan Yük",
      "yuk.kpiTopCountry": "En Çok Elleçleyen Ülke",
      "yuk.kpiTopPort": "En Çok Elleçleyen Liman",

      "konteyner.kpiTotal": "Toplam Elleçleme",
      "konteyner.kpiTopPort": "En Çok Elleçleyen Liman",
      "konteyner.kpiTopCountry": "En Çok Elleçleyen Ülke",
      "konteyner.chartRegime": "Rejim türlerine göre dağılım",
      "konteyner.chartCins": "Konteyner cinslerine göre elleçleme",
      "konteyner.regimeDisari": "Yurt Dışı",
      "konteyner.regimeKabotaj": "Kabotaj",
      "konteyner.regimeTransit": "Transit",
      "konteyner.size20": "20' lik",
      "konteyner.size40": "40' lık",
      "konteyner.size40plus": "40' dan büyük",
      "konteyner.dolu": "Dolu",
      "konteyner.bos": "Boş",
      "ui.flag": "Bayrak Türü",
      "ui.contType": "Konteyner Tipi",

      "cat.prevYear": "Önceki yıl", "cat.topPort": "En büyük liman",
      "cat.monthTitle": "Aylara Göre Dağılım",
      "cat.trendTitle": "Yıllara Göre Gelişim", "cat.portsTitle": "Limanlara Göre Dağılım",
      "cat.noPortData": "Bu kategori için liman kırılımı bulunmuyor.",
      "cat.latestNote": "Liman kırılımı en güncel yıla aittir.",

      "files.title": "Dosyalar", "files.lead": "Denizcilik Genel Müdürlüğü'nün yayımladığı resmi istatistik dosyaları.",
      "files.total": "Arşivde toplam", "files.totalSuffix": "resmi istatistik dosyası.",

      "map.title": "Türkiye Limanları Haritası",
      "map.lead": "Balon büyüklüğü liman hacmini gösterir.",
      "map.table": "Limanlar sıralaması", "map.port": "Liman", "map.sea": "Deniz",
      "map.cargo": "Yük (ton)", "map.container": "Konteyner (TEU)",

      "contact.title": "İletişim", "contact.address": "Adres", "contact.phone": "Santral",
      "contact.callcenter": "Çağrı Merkezi", "contact.web": "Web",
      "contact.lead": "Denizcilik istatistikleriyle ilgili soru, görüş ve talepleriniz için Denizcilik Genel Müdürlüğü ile iletişime geçebilirsiniz.",
      "contact.dept": "Denizcilik Genel Müdürlüğü",
      "contact.addressValue": "Hakkı Turayliç Cad. No:5, 06338 Emek / Ankara",
      "contact.phoneValue": "0312 203 10 00",
      "contact.fax": "Faks", "contact.faxValue": "0312 232 42 24",
      "contact.webValue": "denizcilik.uab.gov.tr", "contact.callcenterValue": "ALO 123",
      "contact.formTitle": "Mesaj gönderin",
      "contact.formNote": "Formu doldurduğunuzda varsayılan e-posta uygulamanız açılır.",
      "contact.formName": "Ad Soyad", "contact.formEmail": "E-posta",
      "contact.formMsg": "Mesajınız", "contact.formSend": "Gönder",

      "footer.stats": "İstatistikler", "footer.corp": "Kurumsal",
      "footer.note": "Bu sayfa bir arayüz tasarım çalışmasıdır. Resmi yayın:",
      "footer.rights": "Tüm hakları saklıdır.",
      "footer.dataSource": "Veri kaynağı",
      "footer.affiliates": "Bağlı kuruluşlar",
      "footer.dgm": "Denizcilik Genel Müdürlüğü",
      "footer.kvkk": "KVKK Dokümanları",

      "month.1": "Ocak", "month.2": "Şubat", "month.3": "Mart", "month.4": "Nisan",
      "month.5": "Mayıs", "month.6": "Haziran", "month.7": "Temmuz", "month.8": "Ağustos",
      "month.9": "Eylül", "month.10": "Ekim", "month.11": "Kasım", "month.12": "Aralık",
      "month.long.1": "Ocak", "month.long.2": "Şubat", "month.long.3": "Mart", "month.long.4": "Nisan",
      "month.long.5": "Mayıs", "month.long.6": "Haziran", "month.long.7": "Temmuz", "month.long.8": "Ağustos",
      "month.long.9": "Eylül", "month.long.10": "Ekim", "month.long.11": "Kasım", "month.long.12": "Aralık",

      "series.yukleme": "Yükleme", "series.bosaltma": "Boşaltma",
      "series.turk": "Türk bayraklı", "series.yabanci": "Yabancı bayraklı",
      "series.gelen": "Gelen", "series.giden": "Giden", "series.transit": "Transit",
      "series.gelenArac": "Gelen Araç", "series.gidenArac": "Giden Araç",

      "sea.marmara": "Marmara", "sea.ege": "Ege",
      "sea.akdeniz": "Akdeniz", "sea.karadeniz": "Karadeniz",

      "ui.split": "Dağılım",
      "dim.yuk.donut": "Kargo tipine göre", "dim.yuk.bars": "En çok yük taşınan ülkeler",
      "dim.konteyner.bars": "En çok konteyner taşınan ülkeler",
      "dim.gemi.split": "Bayrak dağılımı", "dim.kruvaziyer.split": "Yolcu yönü",
      "dim.roro.split": "Araç Yönü", "dim.roro.bars": "Araç Cinsine Göre",
      "dim.kabotaj.a": "Yolcu", "dim.kabotaj.b": "Araç",
      "dim.filo.bars": "Gemi cinsine göre", "dim.filo.donut": "Filo bileşimi",

      "gemi.kpiTurk": "Türk Bayraklı Gemi",
      "gemi.kpiYabanci": "Yabancı Bayraklı Gemi",
      "gemi.kpiTopPort": "En Yoğun Liman",
      "gemi.kpiTopPortGt": "Gross Tonajda Lider Liman",
      "gemi.chartTurk": "Türk bayraklı gemi",
      "gemi.chartYabanci": "Yabancı bayraklı gemi",
      "gemi.chartPortsGt": "Gross tonaja göre dağılım",
      "roro.kpiTotal": "Toplam Taşınan Araç",
      "roro.kpiTopType": "En Çok Taşınan Araç <span style='text-transform: lowercase'>ve</span> Pazar Payı",
      "roro.kpiTopHat": "En Yoğun Hat",
      "roro.chartHat": "Hat Yoğunlukları",
      "roro.chartCinsYil": "Yıllara Göre Toplam Taşınan Araç",
      "bogazlar.kpiGemi": "Toplam Gemi Geçişi",
      "bogazlar.kpiGrossTon": "Toplam Gross Ton",
      "bogazlar.kpiUgraksiz": "Uğraksız Gemi",
      "bogazlar.chartTanker": "Aylara Göre Tanker dağılımı (TTA / LPG / TCH)",
      "bogazlar.chartGemi": "Aylara Göre Gemi adedi",
      "bogazlar.chartGrossTon": "Aylara Göre Toplam gross ton",
      "kruvaziyer.kpiTotal": "Toplam Yolcu",
      "kruvaziyer.kpiTopPort": "En Yoğun Liman",
      "kruvaziyer.kpiTopMonth": "En Yoğun Ay",
      "ui.marketShare": "pazar payı",
      "ui.shareOfTotal": "toplam oranı",
      "kabotaj.kpiArac": "Taşınan Araç",
      "kabotaj.kpiAracMil": "Araç x Mil",
      "kabotaj.kpiYolcu": "Taşınan Yolcu",
      "kabotaj.kpiYolcuMil": "Yolcu x Mil",
      "unit.aracmil": "araç-mil",
      "unit.yolcumil": "yolcu-mil",
      "unit.yas": "yaş",
      "unit.dwt": "DWT",
      "filo.kpiYas": "Ortalama Gemi Yaşı",
      "filo.kpiAdet": "Gemi Sayısı",
      "filo.kpiDwt": "Toplam Deadweight",
      "ui.yearlyTotal": "Yıllık Toplam",
      "ui.yearlyAvg": "yılların ortalaması",
      "ui.latestYear": "en güncel yıl",
      "ui.yearsSelected": "yıl seçili",
      "ui.monthSelected": "ay seçili",
      "ui.selectAll": "Tümünü seç",
      "ui.clear": "Temizle",
      "ui.dateRange": "Tarih aralığı",
      "ui.pickStart": "Başlangıç ayını seç",
      "ui.pickEnd": "Bitiş ayını seç",
      "ui.prevYear": "Önceki yıl",
      "ui.nextYear": "Sonraki yıl",
      "ui.needTwoMonths": "En az iki ay seçilmeli.",
      "ui.quickSelect": "Hızlı Seçim",
      "ui.customRange": "Özel Aralık",
      "ui.last12m": "Son 12 Ay",
      "ui.last24m": "Son 24 Ay",
      "ui.allTime": "Tüm Veriler",
      "ui.periodsSelected": "dönem seçili",
      "bogazlar.istanbul": "İstanbul Boğazı",
      "bogazlar.canakkale": "Çanakkale Boğazı",
      "ui.strait": "Boğaz",
      "kruvaziyer.chartPortsGemi": "Limanlara göre kruvaziyer dağılımı",
      "nav.uab": "UAB.GOV.TR",
      "url.uab": "https://www.uab.gov.tr",
      "url.dgm": "https://denizcilik.uab.gov.tr/",
      "url.kvkk": "https://www.uab.gov.tr/kvkkdokuman",
      "url.callcenter": "https://www.uab.gov.tr/cagri-merkezi",
      "url.contactWeb": "https://denizcilik.uab.gov.tr/",
      "url.phone": "tel:03122031000",
      "url.mail": "mailto:denizcilik@uab.gov.tr",

      // Boş = anasayfadaki veri yılı metriklerden otomatik gelsin
      "home.year": "",
    },

    en: {
      "site.title": "Maritime Statistics",
      "site.org": "Republic of Türkiye Ministry of Transport and Infrastructure",
      "site.sub1": "Maritime", "site.sub2": "Statistics",

      "nav.yuk": "Cargo", "nav.konteyner": "Container", "nav.bogazlar": "Turkish Straits",
      "nav.kabotaj": "Cabotage", "nav.kruvaziyer": "Cruise", "nav.roro": "RO-RO Vehicles",
      "nav.gemi": "Vessels", "nav.filo": "Fleet", "nav.dosyalar": "Files",
      "nav.home": "Home", "nav.map": "Map", "nav.contact": "Contact",
      "nav.sitemap": "Sitemap", "nav.other": "Other Statistics",

      "ui.theme": "Switch theme", "ui.lang": "Türkçe", "ui.menu": "Menu",
      "ui.search": "Search file name…", "ui.all": "All", "ui.year": "Year",
      "ui.region": "Sea region", "ui.filter": "Filter", "ui.files": "files",
      "ui.detail": "View details", "ui.source": "Official source page",
      "ui.viewFiles": "Files for this category",
      "ui.notFound": "No results found.",
      "ui.month": "Month", "ui.clear": "Clear", "ui.series": "Series", "ui.total": "Total",
      "ui.monthSelected": "months selected", "ui.partial": "partial period",

      "home.eyebrow": "Official Maritime Statistics Dashboard",
      "home.title": "Türkiye's Maritime Data",
      "home.lead": "Türkiye's maritime trade at a glance.",
      "home.yearCap": "current data year",
      "home.source": "Source: Ministry of Transport and Infrastructure — Directorate General of Maritime Affairs.",

      "kpi.yuk": "Cargo Handled", "kpi.konteyner": "Containers", "kpi.gemi": "Calling Vessels",
      "kpi.bogaz": "Strait Transits", "kpi.kruvaziyer": "Cruise Passengers",
      "kpi.roro": "RO-RO Vehicles", "kpi.kabotaj": "Cabotage Passengers", "kpi.filo": "Turkish Merchant Fleet",
      "kpi.vsYear": "vs {y}",

      "unit.ton": "tonnes", "unit.teu": "TEU", "unit.gemi": "vessels", "unit.gecis": "transits",
      "unit.yolcu": "passengers", "unit.arac": "vehicles", "unit.grosston": "gross tonnage",
      "num.milyon": "million", "num.milyar": "billion", "num.bin": "thousand",

      "cat.yuk": "Cargo Statistics", "cat.konteyner": "Container Statistics",
      "cat.gemi": "Vessel Statistics", "cat.kruvaziyer": "Cruise Statistics",
      "cat.roro": "RO-RO Vehicle Statistics", "cat.kabotaj": "Cabotage Statistics",
      "cat.bogazlar": "Turkish Straits Vessel Transit Statistics", "cat.filo": "Fleet Statistics",

      "yuk.kpiTotal": "Total Cargo Handled",
      "yuk.kpiTopCountry": "Top Handling Country",
      "yuk.kpiTopPort": "Top Handling Port",

      "konteyner.kpiTotal": "Total Handling",
      "konteyner.kpiTopPort": "Top Handling Port",
      "konteyner.kpiTopCountry": "Top Handling Country",
      "konteyner.chartRegime": "Breakdown by regime type",
      "konteyner.chartCins": "Handling by container type",
      "konteyner.regimeDisari": "Foreign Trade",
      "konteyner.regimeKabotaj": "Cabotage",
      "konteyner.regimeTransit": "Transit",
      "konteyner.size20": "20 FT",
      "konteyner.size40": "40 FT",
      "konteyner.size40plus": "Larger than 40 FT",
      "konteyner.dolu": "Loaded",
      "konteyner.bos": "Empty",
      "ui.flag": "Flag Type",
      "ui.contType": "Container Type",

      "cat.prevYear": "Previous year", "cat.topPort": "Largest port",
      "cat.monthTitle": "Monthly Breakdown",
      "cat.trendTitle": "Development By Year", "cat.portsTitle": "Breakdown By Port",
      "cat.noPortData": "No port breakdown available for this category.",
      "cat.latestNote": "Port breakdown is for the most recent year.",

      "files.title": "Files", "files.lead": "Official statistics files published by the Directorate General of Maritime Affairs.",
      "files.total": "A total of", "files.totalSuffix": "official statistics files.",

      "map.title": "Ports of Türkiye Map",
      "map.lead": "Bubble size indicates port volume.",
      "map.table": "Port ranking", "map.port": "Port", "map.sea": "Sea",
      "map.cargo": "Cargo (tonnes)", "map.container": "Containers (TEU)",

      "contact.title": "Contact", "contact.address": "Address", "contact.phone": "Switchboard",
      "contact.callcenter": "Call Centre", "contact.web": "Web",
      "contact.lead": "For questions, feedback and requests regarding maritime statistics, you can contact the Directorate General of Maritime Affairs.",
      "contact.dept": "Directorate General of Maritime Affairs",
      "contact.addressValue": "Hakkı Turayliç Cad. No:5, 06338 Emek / Ankara",
      "contact.phoneValue": "0312 203 10 00",
      "contact.fax": "Fax", "contact.faxValue": "0312 232 42 24",
      "contact.webValue": "denizcilik.uab.gov.tr", "contact.callcenterValue": "ALO 123",
      "contact.formTitle": "Send a message",
      "contact.formNote": "When you submit the form, your default email application opens.",
      "contact.formName": "Full name", "contact.formEmail": "Email",
      "contact.formMsg": "Your message", "contact.formSend": "Send",

      "footer.stats": "Statistics", "footer.corp": "Corporate",
      "footer.note": "This page is an interface design study. Official publication:",
      "footer.rights": "All rights reserved.",
      "footer.dataSource": "Data source",
      "footer.affiliates": "Affiliated institutions",
      "footer.dgm": "Directorate General of Maritime Affairs",
      "footer.kvkk": "Data Protection Documents",

      "month.1": "January", "month.2": "February", "month.3": "March", "month.4": "April",
      "month.5": "May", "month.6": "June", "month.7": "July", "month.8": "August",
      "month.9": "September", "month.10": "October", "month.11": "November", "month.12": "December",
      "month.long.1": "January", "month.long.2": "February", "month.long.3": "March", "month.long.4": "April",
      "month.long.5": "May", "month.long.6": "June", "month.long.7": "July", "month.long.8": "August",
      "month.long.9": "September", "month.long.10": "October", "month.long.11": "November", "month.long.12": "December",

      "series.yukleme": "Loading", "series.bosaltma": "Unloading",
      "series.turk": "Turkish flag", "series.yabanci": "Foreign flag",
      "series.gelen": "Inbound", "series.giden": "Outbound", "series.transit": "Transit",
      "series.gelenArac": "Inbound Vehicles", "series.gidenArac": "Outbound Vehicles",

      "sea.marmara": "Marmara", "sea.ege": "Aegean",
      "sea.akdeniz": "Mediterranean", "sea.karadeniz": "Black Sea",

      "ui.split": "Split",
      "dim.yuk.donut": "By cargo type", "dim.yuk.bars": "Top partner countries",
      "dim.konteyner.bars": "Top partner countries",
      "dim.gemi.split": "Flag split", "dim.kruvaziyer.split": "Passenger direction",
      "dim.roro.split": "Vehicle direction", "dim.roro.bars": "By vehicle type",
      "dim.kabotaj.a": "Passengers", "dim.kabotaj.b": "Vehicles",
      "dim.filo.bars": "By ship type", "dim.filo.donut": "Fleet composition",

      "gemi.kpiTurk": "Turkish-Flagged Vessels",
      "gemi.kpiYabanci": "Foreign-Flagged Vessels",
      "gemi.kpiTopPort": "Busiest Port",
      "gemi.kpiTopPortGt": "Top Port By Gross Tonnage",
      "gemi.chartTurk": "Turkish-flagged vessels",
      "gemi.chartYabanci": "Foreign-flagged vessels",
      "gemi.chartPortsGt": "Distribution by gross tonnage",
      "roro.kpiTotal": "Total Vehicles Carried",
      "roro.kpiTopType": "Top Vehicle Type & Market Share",
      "roro.kpiTopHat": "Busiest Line",
      "roro.chartHat": "Line Intensity",
      "roro.chartCinsYil": "Total Vehicles By Year",
      "bogazlar.kpiGemi": "Total Vessel Transits",
      "bogazlar.kpiGrossTon": "Total Gross Tonnage",
      "bogazlar.kpiUgraksiz": "Non-Calling Vessels",
      "bogazlar.chartTanker": "Monthly tanker breakdown (TTA / LPG / TCH)",
      "bogazlar.chartGemi": "Monthly vessel count",
      "bogazlar.chartGrossTon": "Monthly total gross tonnage",
      "kruvaziyer.kpiTotal": "Total Passengers",
      "kruvaziyer.kpiTopPort": "Busiest Port",
      "kruvaziyer.kpiTopMonth": "Busiest Month",
      "ui.marketShare": "market share",
      "ui.shareOfTotal": "share of total",
      "kabotaj.kpiArac": "Vehicles Carried",
      "kabotaj.kpiAracMil": "Vehicle x Miles",
      "kabotaj.kpiYolcu": "Passengers Carried",
      "kabotaj.kpiYolcuMil": "Passenger x Mile",
      "unit.aracmil": "vehicle-miles",
      "unit.yolcumil": "passenger-miles",
      "unit.yas": "years",
      "unit.dwt": "DWT",
      "filo.kpiYas": "Average Fleet Age",
      "filo.kpiAdet": "Number Of Vessels",
      "filo.kpiDwt": "Total Deadweight",
      "ui.yearlyTotal": "Yearly Total",
      "ui.yearlyAvg": "average across years",
      "ui.latestYear": "latest year",
      "ui.yearsSelected": "years selected",
      "ui.dateRange": "Date range",
      "ui.pickStart": "Select start month",
      "ui.pickEnd": "Select end month",
      "ui.prevYear": "Previous year",
      "ui.nextYear": "Next year",
      "ui.needTwoMonths": "Select at least two months.",
      "ui.quickSelect": "Quick Selection",
      "ui.customRange": "Custom Range",
      "ui.last12m": "Last 12 Months",
      "ui.last24m": "Last 24 Months",
      "ui.allTime": "All Time",
      "ui.periodsSelected": "periods selected",
      "bogazlar.istanbul": "Istanbul Strait",
      "bogazlar.canakkale": "Canakkale Strait",
      "ui.strait": "Strait",
      "kruvaziyer.chartPortsGemi": "Cruise distribution by ports",
      "nav.uab": "UAB.GOV.TR",
      "url.uab": "https://www.uab.gov.tr",
      "url.dgm": "https://denizcilik.uab.gov.tr/",
      "url.kvkk": "https://www.uab.gov.tr/kvkkdokuman",
      "url.callcenter": "https://www.uab.gov.tr/cagri-merkezi",
      "url.contactWeb": "https://denizcilik.uab.gov.tr/",
      "url.phone": "tel:03122031000",
      "url.mail": "mailto:denizcilik@uab.gov.tr",

      "home.year": "",
    },
  };

  const KEY = "md-lang";
  let lang = (function () {
    const q = new URLSearchParams(location.search).get("lang");
    if (q === "en" || q === "tr") return q;
    return localStorage.getItem(KEY) || "tr";
  })();

  function t(key) {
    return (DICT[lang] && DICT[lang][key]) || (DICT.tr[key] != null ? DICT.tr[key] : key);
  }

  function apply(root) {
    (root || document).querySelectorAll("[data-i18n]").forEach((el) => {
      const v = t(el.dataset.i18n);
      // Boş değer = "karışma": sayfanın kendi hesapladığı metin (örn. veri yılı) kalsın
      if (v !== "") el.textContent = v;
    });
    (root || document).querySelectorAll("[data-i18n-ph]").forEach((el) => {
      el.setAttribute("placeholder", t(el.dataset.i18nPh));
    });
    (root || document).querySelectorAll("[data-i18n-title]").forEach((el) => {
      el.setAttribute("title", t(el.dataset.i18nTitle));
      el.setAttribute("aria-label", t(el.dataset.i18nTitle));
    });
    // Bağlantı adresleri de içerikten gelir (panelden düzenlenebilsin)
    (root || document).querySelectorAll("[data-i18n-href]").forEach((el) => {
      const v = t(el.dataset.i18nHref);
      if (v) el.setAttribute(el.tagName === "FORM" ? "action" : "href", v);
    });
    document.documentElement.lang = lang;
  }

  window.MDLang = {
    get: () => lang,
    t: t,
    apply: apply,
    locale: () => (lang === "en" ? "en-GB" : "tr-TR"),
    set(next) {
      if (next !== "tr" && next !== "en") return;
      lang = next;
      localStorage.setItem(KEY, next);
      location.reload();
    },
    toggle() { this.set(lang === "tr" ? "en" : "tr"); },
    // Düzenleme modu için: bir anahtarın ham TR/EN metnini döndürür (görüntülenen dilden bağımsız)
    raw: (key) => ({ tr: DICT.tr[key] != null ? DICT.tr[key] : "", en: DICT.en[key] != null ? DICT.en[key] : "" }),
    // Düzenleme modu için: kaydedilen değeri sözlüğe yazar ve sayfayı yeniden boyar
    setRaw(key, tr, en) {
      DICT.tr[key] = tr; DICT.en[key] = en;
      apply();
    },
  };
  window.t = t;

  document.documentElement.lang = lang;

  /* ---------- İçerik override: admin panelden düzenlenen metinler ----------
     Supabase 'content' tablosundaki değerler DICT'in üzerine yazılır. Sayfa
     script'leri window.MD_I18N_READY'yi bekleyip sonra t()/render çağırmalı
     (aksi halde ilk boyama hardcoded metinle olur — kabul edilebilir, apply()
     ile [data-i18n] işaretli elemanlar zaten yeniden boyanır). */
  window.MD_I18N_READY = (async () => {
    try {
      const URL = "https://mczowhdwwdidchtgeioo.supabase.co";
      const KEY = "sb_publishable_0GoNDg3SAFC7dK1AOc2SsA_u7bN8Bc2";
      const r = await fetch(URL + "/rest/v1/content?select=key,tr,en", {
        headers: { apikey: KEY, Authorization: "Bearer " + KEY },
      });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const rows = await r.json();
      if (!Array.isArray(rows) || !rows.length) throw new Error("boş content");
      rows.forEach((row) => {
        if (row.tr) DICT.tr[row.key] = row.tr;
        if (row.en) DICT.en[row.key] = row.en;
      });
      apply();
      console.info("[i18n] İçerik Supabase'den yüklendi (" + rows.length + " metin).");
    } catch (e) {
      // Yedeğe düşsek de apply() şart: HTML'deki sabit metinler Türkçe yazılı,
      // dil EN ise gömülü sözlükle yeniden boyanmaları gerekiyor.
      apply();
      console.warn("[i18n] İçerik Supabase'den yüklenemedi, gömülü metinler kullanılıyor:", e.message);
    }
  })();
})();
