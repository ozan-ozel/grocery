# Sport Nutrition → Kişisel Plan entegrasyonu — devam notu

Bu dosya, önceki oturumdaki araştırmayı yeni bir oturumda devam ettirmek için.
Yeni oturuma bu dosyayı ver, kaldığımız yerden devam eder.

## Arka plan

"Sport Nutrition" (Jeukendrup & Gleeson, 4. baskı) kitabından `mealPersonalization.ts`
(Kişisel Plan hedef hesabı) ile ilgili bölümler okundu, literatürle çapraz doğrulandı,
kişisel bir profille (182cm/30y/70kg) test edildi.

- **Tam araştırma:** [Enerji Dengesi Analizi](https://claude.ai/code/artifact/3f66c912-c2a5-4615-b31b-f0f366b24890) (artifact)
- **Linear araştırma issue'su:** NUT-48 (+ bağlı döküman)
- **Bulgular/backlog notları:** NUT-28 (NUT-34'e bağlı bölüm)

Dört olası entegrasyon maddesi belirlendi: **A** protein/kilo verme, **B** karbonhidrat
g/kg modeli, **C** PAL'ı yaşam tarzı+egzersiz olarak ayırma, **D** sodyum/sıvı hedefi.

## Durum

**A — Protein (kilo verme hedefinde artış): TAMAMLANDI, canlıda.**
`goal==="loss"` artık 2.0 g/kg kullanıyor (`mealPersonalization.ts:108-114`).
Merge edildi, `master`'a push edildi (`a700419`), NUT-28 ve NUT-49 güncellendi.

**B — Karbonhidrat g/kg modeli: KODLANDI, `feature/personal-plan-carb-target-model`
dalında, henüz commit edilmedi (build temiz, kullanıcı test edecek).**
Tasarım kararları:
- Sedanter ve az aktif **aynı** kademeyi paylaşıyor (3-5 g/kg) — kitabın Ch.6 tablosunda
  sedanter'e özel bir kademe yok, ama Ch.4'te kitap "sedanter"i 1.4-1.6× RMR olarak
  tanımlıyor, bu da uygulamanın hem sedanter (1.4) hem az aktif (1.55) PAL'ını kapsıyor —
  yani birleştirme kitabın kendi mantığıyla tutarlı.
- Nihai tablo (g karbonhidrat/kg/gün): sedanter 3-5, az aktif 3-5, orta aktif 5-7,
  aktif 6-10, çok aktif 10-12. Monoton (hiçbir kademe bir öncekinden düşük değil —
  ilk denemede sedanter'i eski %-formülde bırakmıştım, az aktiften yüksek çıkıp
  mantıksız bir ters ilişki yaratmıştı, düzeltildi).
- Kaynak: kitap Ch.6 + AND/DC/ACSM ortak pozisyon bildirgesi (bağımsız doğrulama, aynı
  sayılar).
- Kapsam: sadece `mealPersonalization.ts:117-118` (calorie-based → weight-based,
  protein'in zaten kullandığı desenle aynı), `PersonalPlanView.tsx:362` civarındaki
  "%45-65" açıklama cümlesi, ve `SOURCE_GROUPS`'a yeni kaynak satırı.
- **Sıradaki adım: kullanıcı test etsin, sonra CMP.**

**C — PAL'ı yaşam tarzı + egzersiz olarak ayırma: henüz konuşulmadı.**
Büyük değişiklik — `personal_plan` tablosunda `activity` tek sütun, ayırmak şema
migration'ı + form UI + geri-uyumluluk gerektiriyor. NUT-28'de not olarak duruyor.

**D — Sodyum/sıvı hedefi: henüz konuşulmadı.**
Yeni mini-özellik — şema + tip + UI. NUT-48'de "sıradaki turlar"da not.

## Diğer önemli not

Bu oturumda ayrıca `feature/first-run-onboarding` (NUT-49, ilgisiz ama aynı gün
tamamlanmış bir iş) de merge edilip push edildi — Sport Nutrition işiyle doğrudan
alakası yok, sadece aynı LBCMP turunda birlikte gitti.

`feature/account-menu-logout-delete` dalındaki hesap silme/çıkış işi (NUT-50) hâlâ
commit edilmemiş, ayrı ve ilgisiz bir iş parçası — bu araştırmayla karıştırılmamalı.
