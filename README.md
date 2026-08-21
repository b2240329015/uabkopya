# Türkiye'nin Denizcilik Verileri

Türkiye'nin deniz ticareti, limanları, gemileri ve yolcularına ait resmi
istatistikleri **vatandaş dostu, görsel ve etkileşimli** bir veri platformuna
dönüştüren statik web sitesi.

> Amaç: Siteye giren sıradan bir vatandaş, istatistik uzmanı olmadan verileri
> anlayabilsin; isteyen detaya inip profesyonel verileri de inceleyebilsin.

## Öne çıkanlar

- **Hikâye anlatan anasayfa** — dashboard değil; İstanbul'dan Trabzon'a kıyı
  boyunca ilerleyen bir gemiyle scroll tabanlı veri yolculuğu.
- **Modern grafikler** — animasyonlu smooth line/area, bar ve donut; hover
  etkileşimli (Excel değil, elle yazılmış SVG).
- **Vatandaş dili** — TEU, RO-RO, elleçleme gibi teknik terimler tooltip ile
  sadeleştirilir; her bölümde "bu veri ne anlatıyor?" açıklaması.
- **Çok sayfalı** — Yük, Konteyner, Gemi, Kruvaziyer, RO-RO, Kabotaj,
  Türk Boğazları, Filo kategorileri + Arşiv, İletişim, Site Haritası.
  "Harita" menüsü artık bakanlığın resmi liman haritasına
  ([limanlargis.uab.gov.tr](https://limanlargis.uab.gov.tr/)) yönlendirir.

## Veri kaynağı

Tüm rakamlar T.C. Ulaştırma ve Altyapı Bakanlığı — Denizcilik Genel
Müdürlüğü'nün resmi istatistiklerinden ([denizcilikistatistikleri.uab.gov.tr](https://denizcilikistatistikleri.uab.gov.tr/))
derlenmiştir. Derlenmiş veri `data/data.json` içinde tutulur ve
`assets/js/data.js` olarak sayfalara gömülür.

## Teknik

- Saf HTML/CSS/JavaScript — build adımı yok.
- Grafikler bağımlılıksız, elle yazılmış SVG.
- Yazı tipleri: Sora + Inter (Google Fonts).
- Masaüstü öncelikli tasarım (1920×1080 ve üzeri için optimize).

## Yerelde çalıştırma

```bash
python -m http.server 8000
# tarayıcıda http://localhost:8000
```

## Dizin yapısı

```
index.html            Anasayfa (veri yolculuğu)
yuk / konteyner / ...  Kategori sayfaları
arsiv / iletisim ...   Bilgi sayfaları
assets/css/style.css  Tasarım sistemi
assets/js/            data · main · charts · layout · home · category
data/data.json        Derlenmiş resmi veri
```
