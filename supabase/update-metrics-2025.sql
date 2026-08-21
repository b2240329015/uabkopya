-- ============================================================
-- Anasayfa KPI'larını en güncel TAM yıla taşır.
--
-- 2026 verisi tabloda var ama yalnız 7 ay (bazı seriler 6 ay) — yıllık toplam
-- olarak kullanılırsa rakamlar yarım çıkar. Bu yüzden 12 ayı tam olan en yeni
-- yıl seçildi: 2025. Önceki yıl (prev) 2024, yoy bu ikisinden hesaplandı.
--
-- Değerler fact_* tablolarından türetildi (mevcut 2024 kayıtları da bu formülle
-- birebir tutuyor, formül doğrulandı):
--   yuk_ton, konteyner_teu, kruvaziyer_yolcu, roro_arac  → SUM(fact_monthly.deger) seri='toplam'
--   gemi_sayisi                                          → SUM(fact_monthly.deger) seri='toplam'
--   bogaz_gecis                                          → SUM(fact_strait.gemi_adedi) bogaz='istanbul'
--   kabotaj_yolcu                                        → trends.kabotaj_yolcu (2025)
--   filo_gemi                                            → zaten 2025, dokunulmadı
--
-- Supabase → SQL Editor'de çalıştır.
-- ============================================================

begin;

update metrics set value = 553265898, year = 2025, prev = 531737358, yoy =  4.0 where key = 'yuk_ton';
update metrics set value =  13996578, year = 2025, prev =  13529729, yoy =  3.5 where key = 'konteyner_teu';
update metrics set value =     62656, year = 2025, prev =     60594, yoy =  3.4 where key = 'gemi_sayisi';
update metrics set value =     40172, year = 2025, prev =     41363, yoy = -2.9 where key = 'bogaz_gecis';
update metrics set value =   2138136, year = 2025, prev =   1889426, yoy = 13.2 where key = 'kruvaziyer_yolcu';
update metrics set value =   2967284, year = 2025, prev =   2722081, yoy =  9.0 where key = 'roro_arac';
update metrics set value = 118891577, year = 2025, prev = 117832340, yoy =  0.9 where key = 'kabotaj_yolcu';
-- filo_gemi: 2025 / 398 / prev 405 — zaten güncel.

-- Anasayfadaki trend grafikleri de 2024'te kalmıştı; 2025 noktaları eklenir.
insert into trends (metric, year, value) values
  ('yuk_ton',          2025, 553265898),
  ('konteyner_teu',    2025,  13996578),
  ('kruvaziyer_yolcu', 2025,   2138136),
  ('roro_arac_yil',    2025,   2967284),
  ('gemi_gros_ton',    2025, 966509361)
on conflict (metric, year) do update set value = excluded.value;

commit;

-- Kontrol:
-- select key, year, value, prev, yoy from metrics order by ord;
-- select metric, max(year) from trends group by metric order by 1;
