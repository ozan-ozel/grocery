# Product relaunch — ilk denetim (Bölüm 19)

_Durum: SNAPSHOT, 2026-10-27, `master` @ `6e65f11` üzerinden. Kod değiştirilmedi; yalnızca bu belge yazıldı._

Bu belge "GROCERY — MASTER PRODUCT & ENGINEERING PROMPT" yönergesinin yalnızca **Bölüm 19 (ilk görev)**
kapsamını karşılar. Yönergedeki `01`–`12` numaralı belgeler henüz **oluşturulmadı**; aşağıda hangi
bölümün hangi mevcut kaynakla zaten karşılandığı belirtiliyor, böylece tekrar yazılmaları gerekmiyor.

Kanıt sınıfları: **[Kod]** kaynak kodda okundu · **[Prod]** canlı URL'de doğrulandı · **[Belge]** depodaki
belgede yazıyor, ayrıca doğrulanmadı · **[Hesap]** bu oturumda bağımsız hesaplandı · **[Bilinmiyor]**.

---

## 0. Yönergenin varsayımlarından hangileri güncel değil

Yönerge bazı noktalarda deponun eski bir sürümünü anlatıyor. Bunlar düzeltilmeden ilerlenirse yanlış
işe zaman harcanır:

| Yönergedeki varsayım | Gerçek durum | Kanıt |
| --- | --- | --- |
| Backend Netlify Functions üzerinde (`netlify/functions/nutrition.ts`) | Netlify kaldırılmış. Frontend **ve** API Vercel'de. `netlify/` klasörü yok; Netlify yalnızca `.superpowers/sdd/` altındaki eski görev notlarında ve `docs/archive/` içinde geçiyor | [Kod] `api/*.ts`, `vercel.json`; [Prod] `server: Vercel`, `/api/auth-session` → 401 JSON |
| Yemek planı yalnızca bellekte, yenilemede kayboluyor | Sunucuda kalıcı: `meal_entries` tablosu, `/api/meal-entries`, TanStack Query. Yalnızca hane (household) seçilmemişken bellekte kalıyor; açılışta hane otomatik oluşturulduğu için bu normal kullanımda görülmeyen bir uç durum | [Kod] `src/hooks/useMealPlan.ts` (yorum satırları ~66-70, `enabled: !!householdId`), `supabase/07-meal-entries.sql` |
| `nutrition` PUT'ta yönetici kontrolü yok | Var: `requireUser` → `requireAdmin` (`ADMIN_EMAILS`, boşsa kimse yazamaz) → service role. RLS yalnızca SELECT'e izin veriyor | [Kod] `api/nutrition.ts:95-105`, `lib/auth.ts:335-341`, `supabase/24-nutrition-rls.sql`; checkpoint `2026-09-20-01-nutrition-write-lockdown` |
| ~120 karar | **112 karar** (`DEC-001`–`DEC-112`), tek tek kayıtlı | [Belge] `nutrition-curriculum/DEC_REGISTER.md` |
| 7 kitabın adı bilinmiyor | Yedisi de klasör adları ve dosya adlarıyla kayıtlı; 8. kaynak (*On Cooking*) Gate 6 ile eklenmiş | [Belge] `nutrition-curriculum/01_SOURCE_BOOKS/` (git-ignored, yalnızca yerelde) |
| Yeni testler yazılacak | **Proje kuralıyla çelişiyor.** `CLAUDE.md` test dosyası/framework eklemeyi açıkça yasaklıyor (Vitest bilinçli kaldırıldı). Doğrulama: `tsc -b`, canlı uygulama, gerekirse çalıştırılıp silinen tek seferlik betik | [Belge] `CLAUDE.md` § Commands |

---

## 1. Depo, branch'ler ve production

- **Branch'ler** [Kod]: `master` = `origin/master` = `6e65f11`. 10 yerel branch'in hepsi `master`'a merge
  edilmiş (CURRENT_STATE'e göre); `feature/personal-plan-book-sources` da merge edilmiş görünüyor.
  `origin/docs/organize-roadmap-mvp-files` merge edilmemiş ve içeriği incelenmedi (**NOT REVIEWED**).
- **Production** [Prod]: portfolyodaki bağlantı `https://grocery-five-ecru.vercel.app`. `/` → 200 (Vercel,
  `fra1`), `/api/auth-session` ve `/api/nutrition` oturumsuz → 401 JSON (API de Vercel'de çalışıyor),
  `/api/agent-login` → 404 (yerel giriş uç noktası yayında değil — doğru).
- **Production ile `master` aynı mı?** [Bilinmiyor] Deploy'lar elle yapılıyor ve git ref'i değil **yerel dosya
  sistemini** gönderiyor (`npm run deploy:prod`). Hangi commit'in canlıda olduğu hiçbir yerde kayıtlı değil.
  Doğrulamak için geliştiricinin Vercel panelinde son production deploy'unun tarihini `master` geçmişiyle
  karşılaştırması gerekiyor (`last-modified` başlığı tek başına kanıt değil).
- **OAuth callback, cookie domain, env değişkenleri** [Belge]: `docs/operations.md` § External configuration.
  Bu denetimde değerleri incelenmedi (gizli bilgi sınırı); yalnızca adlar `vercel env ls` ile listelenebilir.

---

## 2. Karar kayıtları (yönergedeki "120 karar")

`nutrition-curriculum/DEC_REGISTER.md` bu işi zaten yapıyor: 112 kararın her biri için alan, durum ve not
var. Dağılım [Belge]:

| Durum | Sayı | Anlamı |
| --- | --- | --- |
| SHIPPED | 11 | Uygulandı ve doğrulandı |
| PROVISIONAL | 4 | Geçici MVP seçimi uygulandı (`DEC-009`, `033`, `046`, `071`) |
| COVERED | 15 | Uygulama bu alanda yeterli bir şey yapıyor; tam versiyon değil |
| PARTIAL | 1 | `DEC-061` (alerjen sınıfı verisi 35/103 besinde) |
| DEFERRED | 7 | v1 kapsamı dışında, bilinçli |
| BLOCKED | 74 | Var olmayan bir alt sisteme (kilo trendi, mikro besin verisi, antrenman verisi, kiler, fiyat) ya da insan güvenlik kararına bağlı |

Ayrıntılar: kararların içeriği `05_PHASE_3_APP_DECISION_MODEL/APP_DECISION_INVENTORY.md`, formüller
`10_PHASE_7_DECISION_ENGINE_SPECIFICATION/DECISION_LOGIC_SPECIFICATION.md`, insan onayları
`00_PROJECT_CONTROL/DECISIONS/` (11 gate/ratification kaydı, 2026-09-05 → 09-09).

**Öneri:** yönergedeki `01-decision-register.md` yeni bir tablo olarak **yazılmamalı**; ikinci bir kayıt
mevcut kayıtla ayrışır (CLAUDE.md'deki trio kuralı tam olarak bunu önlemeye çalışıyor). Gerekirse
`01-…` yalnızca DEC_REGISTER'a yönlendiren ve aşağıdaki düzeltmeleri listeleyen kısa bir belge olmalı.

**Kayıtta bulunan hata:**

- **`DEC-022` notu kodla ters.** Notta "+400/−250 kcal" yazıyor; kod kilo verme için **−400**, kilo alma için
  **+250** uyguluyor [Kod] `src/lib/mealPersonalization.ts:163-168`. Not düzeltilmeli (yalnızca belge).

**Yönergenin listelediği ama karar kaydında olmayan alanlar:** alışveriş listesi senkronizasyonu, veri
güvenliği, arayüz kararları. Bunlar karar kaydına değil `docs/architecture.md` ve
`docs/superpowers/specs/` + `plans/` içine yazılmış (28 plan, durumları `plans/README.md`'de).

---

## 3. Kaynak kitaplar (7 beslenme + 1 mutfak)

[Belge] `nutrition-curriculum/01_SOURCE_BOOKS/` (dosyalar yerelde, git'te değil):

| # | Kitap | Yazar / editör | Baskı, yıl, yayıncı | Tür |
| --- | --- | --- | --- | --- |
| 1 | *Advanced Sports Nutrition* | Dan Benardot | 3. baskı, 2021, Human Kinetics | Spor beslenmesi, uygulayıcıya yönelik |
| 2 | *ACSM's Nutrition for Exercise Science* | ACSM, Dan Benardot | 1. baskı, 2018, Wolters Kluwer | Ders kitabı |
| 3 | *Human Metabolism: A Regulatory Perspective* | Keith N. Frayn, Rhys D. Evans | 4. baskı, (yıl dosya adında yok), Wiley | Akademik ders kitabı (metabolizma) |
| 4 | *An Introduction to Nutrition and Metabolism* | David A. Bender | 3. baskı, 2002, CRC Press | Ders kitabı — **en eski kaynak** |
| 5 | *Nutrition Research Methodologies* | Lovegrove, Hodson, Sharma, Lanham-New (ed.) | The Nutrition Society Textbook | Araştırma yöntemleri ders kitabı |
| 6 | *Sport Nutrition* | Asker Jeukendrup, Michael Gleeson | 4. baskı, 2025, Human Kinetics (dosya adında 2024 yazıyor; künye © 2025) | Akademik ders kitabı |
| 7 | *Krause and Mahan's Food and the Nutrition Care Process* | Janice L. Raymond, Kelly Morrow | 16. baskı, 2022, Elsevier | Klinik beslenme referansı |
| 8 | *On Cooking* | Labensky, Martel, Hause | 2023, Pearson | Mutfak ders kitabı (Gate 6 ile eklendi; `08_On_Cooking/`) |

Kitapların rolleri, kapsamları ve örtüşmeleri zaten analiz edilmiş: `03_PHASE_1_CURRICULUM_ANALYSIS/BOOK_ROLES.md`,
`BOOK_TOPIC_COVERAGE.md`, `TOPIC_OVERLAPS.md`, `02_TOC_AND_SOURCE_ANALYSIS/`. Bu denetimde kitap metinleri
**açılmadı**; sayfa/bölüm iddiası yapılmıyor.

Gözlemler:
- Uygulamada kullanıcıya gösterilen tek kitap atfı SN4 (Jeukendrup & Gleeson) — `DEC-031` protein
  kademeleri için (`src/components/PersonalPlanView.tsx`). Diğer "Kaynakları göster" bağlantıları NIDDK,
  Endotext, WHO ve DRI tablolarına gidiyor.
- Bender 2002 güncelliği en düşük kaynak; enerji/makro sayıları için tek başına dayanak olmamalı.
- Yedi kitaptan hiçbiri enerji denklemi için birincil kaynak değil. Enerji tarafının birincil kaynakları
  makaleler ve NASEM — bunlar `12_ENERGY_INDIVIDUALIZATION/` içinde zaten derlenmiş (aşağıda).

---

## 4. Kalori ve makro motoru

Kod: `calculateTargets()` [Kod] `src/lib/mealPersonalization.ts:150-235`. Tek saf fonksiyon; tüm ekranlar
bunu kullanıyor (`useMealPersonalization`, `useRemainingToday`, `MealPlanView`, `PersonalPlanView`).

### 4.1 Enerji

| Kontrol | Sonuç |
| --- | --- |
| Mifflin–St Jeor katsayıları | **Doğru.** `9.99·kg + 6.25·cm − 4.92·yaş + 5 (erkek) / −161 (kadın)` — Mifflin 1990'ın yayımlanmış hali [Kod] |
| Birimler | kg, cm, yıl; kcal/gün. Doğru |
| Girdi aralıkları | Yaş 18-100, boy 120-230, kilo 35-300; BMI <12 veya >60 uyarı. Makul [Kod] |
| BMR / TDEE / hedef ayrımı | Ayrı alanlar: `bmrKcal`, `maintenanceKcal`, `targetKcal`. Karışmıyor [Kod] |
| Hedef fazlası | Kilo alma +250, verme −400, tek seferde ekleniyor. **Çift sayım yok** [Kod] |
| Alt sınır | 1200 kcal tabanı + uyarı [Kod] |
| Yuvarlama | Yalnızca çıktı aşamasında `Math.round`. Sorun yok |
| Aktivite katsayıları (PAL) | 1.4 / 1.55 / 1.7 / 1.9 / 2.1. **Tartışmalı** — aşağıda |
| Belirsizliğin anlatımı | Metin uyarısı var ("gerçek ihtiyaç kişiden kişiye değişir"); sayısal aralık yok |
| Kilo değiştikçe güncelleme | Profil elle güncellenirse yeniden hesaplanıyor; otomatik değil (`DEC-023` BLOCKED) |

**Aktivite katsayıları.** IOM 2005 PAL kategorilerine göre (bellekten, kitaptan doğrulanmalı): hareketsiz
1.0–1.39, düşük aktif 1.4–1.59, aktif 1.6–1.89, çok aktif 1.9–2.49. Uygulamanın "Hareketsiz = 1.4" değeri
IOM'un *düşük aktif* sınıfının alt sınırı. Yani etiketler bir sınıf yukarı kaymış görünüyor; masa başı
çalışan ve haftada birkaç kez spor yapan biri "Orta aktif" (1.7) seçerse tahmin yükseliyor. Önceki
araştırma da aynı sonuca varmış ("shipped PAL points sit at or above the top of their own drafted bands",
`12_ENERGY_INDIVIDUALIZATION/ENERGY_INDIVIDUALIZATION_MVP_ARCHITECTURE.html`). Ancak o belge karşılaştırma
için 1.2–1.9 aralıklı "aktivite faktörü" tablosunu kullanıyor; bu, PAL'den farklı bir uzlaşım. Yönü doğru,
ama sayılar hangi tabloya göre yeniden düzenlenecekse kaynağın kendisinden alınmalı. Aktivite seçicisindeki
açıklama metni (`ACTIVITY_INFO_INTRO`) bu riski kullanıcıya zaten anlatıyor.

**2023 NASEM DRI for Energy.** `12_ENERGY_INDIVIDUALIZATION/ENERGY_INDIVIDUALIZATION_CALCULATIONS.md` §3.1
bunu "Candidate — established" olarak almış ve **tahmin standart hatası** (SEPV) yayımladığını not etmiş:
erkekte ≈342, kadında ≈241 kcal/gün. Avantajı mevcut girdilerle çalışması (yaş, cinsiyet, boy, kilo, PAL
kategorisi) ve belirsizliği sayıyla vermesi. Benimsenip benimsenmeyeceği araştırma belgesindeki §16 madde
1'de insan kararı olarak bekliyor. NASEM katsayıları depoya hiç aktarılmamış; bu denetimde de aktarılmadı.

### 4.2 Özel vaka: 2700 ve 3300 kcal

Ürün sahibinin profili bilinmediği için örnek bir profil kullanıldı: **erkek, 25 yaş, 180 cm, 75 kg, kilo
alma** [Hesap]:

| Aktivite | PAL | BMR | Koruma | Hedef (+250) |
| --- | --- | --- | --- | --- |
| Hareketsiz | 1.4 | 1756 | 2459 | **2709** |
| Az aktif | 1.55 | 1756 | 2722 | 2972 |
| Orta aktif | 1.7 | 1756 | 2986 | **3236** |
| Aktif | 1.9 | 1756 | 3337 | 3587 |

Sonuçlar:
- 3300 civarı, **aktivite seçimiyle** oluşuyor. Bu profilde "Hareketsiz" ile "Orta aktif" arasındaki fark
  ≈530 kcal ve tamamen PAL'den geliyor. Fazla ekleme iki kez yapılmıyor, enerji ihtiyacı ile hedef
  karışmıyor.
- ≈2700 kcal'de kilo almak, bu profil için "Hareketsiz + 250 kcal" tahminine denk düşüyor. Yani gözlem
  formülle çelişmiyor; yalnızca daha düşük bir aktivite sınıfına işaret ediyor.
- 2700 ile 3050 (Orta aktif koruma) arası ≈ 1 SEPV (342 kcal). Bu fark, popülasyon denkleminin beklenen
  bireysel hata payı içinde.
- Kişisel gözlemden sonuç çıkarmak için gerekenler: en az birkaç haftalık düzenli tartım (günlük değil,
  trend), tutarlı alım kaydı ve kayıt hatasının hesaba katılması. Birkaç günlük veri su ve glikojen
  dalgalanmasından ayırt edilemez. Uygulamada kilo kaydı yok (`DEC-020`, `DEC-025`–`030` BLOCKED).

**Kullanıcıdan istenen:** gerçek profil (yaş, boy, kilo, cinsiyet katsayısı, seçtiğin aktivite) — tabloyu
senin için yeniden hesaplamak için.

### 4.3 Makrolar

| Konu | Kod | Değerlendirme |
| --- | --- | --- |
| Protein | Kilo verme 2.0, alma veya yüksek aktivite 1.6, diğer 1.2 g/kg; aralık = `[p, p+20 g]` | Kademeler savunulabilir (`DEC-031`, SN4). Üst sınırın `+20 g` sabit olması kiloyla ölçeklenmiyor; küçük bir tutarsızlık |
| Yağ | Hedef enerjinin %20-35'i | AMDR ile uyumlu |
| Karbonhidrat | Hareketsiz/az aktif: enerjinin %45-65'i; orta ve üstü: 5-7 / 6-10 g/kg, en az 130 g | Ayrı ayrı her biri kaynaklı (`DEC-034`) |
| Lif | `max(25, 14 g/1000 kcal)` – `max(30, …)` | 14 g/1000 kcal IOM AI yaklaşımı. 3300+ kcal'de 46-55 g'a çıkıyor; yüksek ama tehlikeli değil |

**Bulgu — makro hedefleri birbiriyle tutarlı değil** [Hesap]. Protein, yağ ve karbonhidrat birbirinden
bağımsız hesaplanıyor; karbonhidrat "kalan enerji" değil. Sonuç:

| Profil | Hedef kcal | P + C(min) + F(min) | Fark |
| --- | --- | --- | --- |
| Kadın 30 y, 165 cm, 60 kg, Aktif, kilo verme | 2112 | 2342 | **+230** (alt sınırlar bile hedefi aşıyor) |
| Erkek 25 y, 180 cm, 75 kg, Aktif, kilo verme | 2937 | 2987 | +51 |

Üstelik Yemek Planı'ndaki makro kartı aralıkların **orta noktasını** hedef olarak gösteriyor
[Kod] `src/components/MealPlanView.tsx:168-182`. İlk profilde orta noktaların toplamı ≈3020 kcal, yani
gösterilen kalori hedefinin ≈%43 üstü. Kullanıcı protein/karbonhidrat/yağ çubuklarını doldurmaya çalışırsa
kalori hedefini aşar. Bu, bulunan **en önemli bilimsel/hesaplama hatası**.

### 4.4 Varsayılan profil ve onboarding

- `DEFAULT_PROFILE` = kadın katsayısı, 30 yaş, 170 cm, 70 kg, **orta aktif**, koruma → 2470 kcal
  [Kod] `src/hooks/useMealPersonalization.ts:14-23`.
- Kaydetme tarafı doğru: varsayılan profil sunucuya veya önbelleğe yazılmıyor (`profile === DEFAULT_PROFILE`
  kontrolleri, aynı dosya ~148, ~175).
- **Bulgu:** Yemek Planı'nın üstündeki "GÜNLÜK MAKROLAR" kartı, profil yokken bu örnek hedefleri
  `isEstimated={false}` ile gösteriyor [Kod] `MealPlanView.tsx:442-446`. "Tahmini" rozeti hiç görünmüyor.
  Aynı ekranın Yemekler sayfası ise `targetsEstimated={!hasSavedProfile}` ile doğru işaretliyor
  (`MealPlanView.tsx:580`). Kart, 30 yaşında bir kadının sayılarını kişisel hedef gibi gösteriyor.
- Profil atlama akışı: `src/hooks/useOnboarding.ts` (`grocery.onboarding.v1:<userId>`). Bu denetimde
  akışın tamamı tıklanarak test edilmedi (**NOT REVIEWED**, canlı test).

### 4.5 Planlanan ve yenen

- `meal_entries` tablosunda planlandı/yendi ayrımı yok [Kod] `src/lib/mealPlan.ts:3-16`. Makro kartı günün
  **tüm** girişlerini `consumed` olarak topluyor (`MealPlanView.tsx:110`). Yönergenin istediği
  "henüz yenmemiş öğünü tüketilmiş gibi gösterme" şartı karşılanmıyor.
- `meal_entries` hane bazlı, hedefler kullanıcı bazlı. Paylaşılan bir hanede tek plan, tek kişinin
  hedefleriyle karşılaştırılıyor. Ürün kararı gerektiriyor.

---

## 5. Besin verisi ve kaynak izlenebilirliği

[Kod/Hesap] `data/nutrition.json`: 67 satır. Canlı tabloda daha fazla satır var (`DEC-061` notu 89 besinden
söz ediyor); fark **NOT REVIEWED** (veritabanı erişimi yok).

- **Kaynak:** 63 satırda `USDA fdc_id <n>`. 4 satır zayıf: `eski kaşar: "Google"`, iki "USDA (typical, …)"
  sığır kesimi, "USDA (typical, …)" kemikli tavuk but. USDA kayıt türü (Foundation / SR Legacy) ve sürüm
  saklanmıyor.
- **Kaynak, veritabanına yazılıyor ama geri okunmuyor.** `scripts/upload-nutrition.ts:74` `source` yazıyor;
  `api/nutrition.ts`'nin `SELECT_COLS` listesi `source`'u içermiyor. Kaynak bilgisi kullanıcıya hiçbir
  zaman ulaşmıyor. (Canlı tabloda bu sütunun gerçekten var olup olmadığı şema dökümü olmadan
  bilinemiyor — açık madde: `CURRENT_STATE.md` #4.)
- **4-4-9 kontrolü:** 14 satır %15'ten fazla sapıyor; hepsi düşük kalorili sebze/meyve veya çay/kahve.
  USDA'nın "farkla toplam karbonhidrat" (lif dahil) ve besine özgü Atwater faktörleriyle beklenen bir
  sonuç; **veri hatası sayılmadı**.
- **Lif:** 24 satırda 0. Hepsi et, süt ürünü, yumurta, yağ, şeker, tuz, çay/kahve, yani 0 makul. Ancak
  yükleme betiği eksik lifi sessizce `?? 0` yapıyor; ileride eklenecek bitkisel bir besin "bilinmiyor"
  yerine "0" görünür.
- **Eşleşmeyen besin:** `calculateItemsNutrition` katalogda bulunmayan girişi sessizce atlıyor
  [Kod] `src/lib/localMealPlan.ts:32-43`. Toplam eksik olduğu halde kesin gibi görünebilir.
- Çiğ/pişmiş ayrımı, yenilebilir kısım, pişirme verimi: **NOT REVIEWED** (satır satır inceleme gerekir).

---

## 6. Güvenlik ve kalıcılık (özet)

- Ortak besin tablosuna yazma: **kapalı** (bkz. §0). Ek bulgu yok.
- Yemek planı kalıcılığı: **var** (bkz. §0). Kalan risk: `CURRENT_STATE.md` #6 — 2026-09-21 öncesi
  girişler yenilemede sıralama değiştirebilir.
- `docs/architecture.md` § Security boundaries iki katmanlı yetkilendirmeyi (fonksiyon + RLS) ve
  service-role kullanım listesini belgeliyor. OWASP API Top 10'a karşı tam tarama, rate limit, CORS/CSRF ve
  KVKK: **NOT REVIEWED** — ayrı bir denetim oturumu gerektirir.

---

## 7. "Bugün ne pişirsem?" için mevcut parçalar

Deneyimin büyük kısmı zaten var; eksik olan bir araya getirilmesi ve tarif içeriği [Kod]:

| Parça | Nerede |
| --- | --- |
| Günlük makro kartı (kalori, P, K, Y, lif, hedefle karşılaştırma) | `src/components/MacroSummaryCard.tsx`, Yemek Planı'nın üstünde |
| Kalan makroya göre öğün önerisi ("Sana uygun") | `src/lib/mealRecommend.ts` — saf, AI yok |
| Akşam yemeği önerisi (kalan makroya göre gram çözen) | `src/lib/eveningRecommend.ts` (`DEC-060`) |
| Hazır yemekler | `data/combos.json` — **20 kombinasyon**, `prep_minutes` + `prep_note`, adım yok |
| Tarifler | Kullanıcının kendi `saved_meals` kayıtları (adımlı olanlar); tarif tablosu yok |
| Plana ekleme, "Yedim", alışveriş listesine aktarma | `MealPlanView.tsx`, `MealsSheet.tsx`, `DEC-071` |
| Kahvaltı/öğle/akşam/ara planı | `MEAL_SLOTS` (`src/lib/localMealPlan.ts`) |

**Kısıt:** `DEC-067` hazırlık detayını Grocery'nin kendi yemekleri için **Level 1**'de onaylamış (adım adım
tarif değil). Grocery adına adımlı tarif yayımlamak bu kararın yeniden açılmasını gerektirir. `DEC-068`
(süre/beceri kısıtları) v1 için ertelenmiş.

---

## 8. Makro grafikleri

`MacroSummaryCard` (Yemek Planı) ve `src/lib/nutritionChart.ts` + `NutritionView` (Besin Değerleri)
`master`'da mevcut [Kod]. Alışveriş sekmesinin "Besin değerleri" toplamları `75abe85` ile eklendi.

---

## 9. Uygulama planı (etki ve risk sırasıyla, en fazla 10 madde)

| # | İş | Etki | Risk | Onay |
| --- | --- | --- | --- | --- |
| 1 | Makro kartında profil yokken "Örnek hedef" rozeti + "Hedeflerini kişiselleştir" bağlantısı (`isEstimated={!hasSavedProfile}`) | Yüksek (güven) | Çok düşük, tek satır + metin | Hayır |
| 2 | Makro tutarlılığı: karbonhidratı kalan enerjiden hesapla veya aralıkları hedefe sıkıştır; kartta orta nokta yerine aralık göster | Yüksek (doğruluk) | Orta — gösterilen sayıları değiştirir | **Evet** (`DEC-034`/`036`, trio kuralı) |
| 3 | Planlanan / yenen ayrımı: kısa vadede kart etiketini "Planlanan" yap; kalıcı çözüm `meal_entries`'e `eaten_at` sütunu | Yüksek | Etiket düşük; sütun = canlı DB migrasyonu | Migrasyon için **evet** |
| 4 | `DEC-022` notundaki ters işareti düzelt | Düşük | Yok (belge) | Hayır |
| 5 | Aktivite sınıflarını yeniden bağla (PAL kaynağı seçimi: IOM 2005 / NASEM 2023) ve tahmini ±SEPV aralığıyla göster | Yüksek (3300 sorunu) | Orta — çoğu kullanıcının hedefini düşürür | **Evet** (araştırma §16 madde 1) |
| 6 | `nutrition.source`'u API'den döndür ve besin detayında göster; yüklemede eksik lifi `null` bırak | Orta (izlenebilirlik) | Düşük; önce sütunun canlıda varlığı doğrulanmalı | Şema dökümü gerekiyor |
| 7 | `nutrition` için `CREATE TABLE` migrasyonu (canlı şema dökümünden) | Orta | Düşük (yalnızca repo) | Dökümü geliştirici alır |
| 8 | "Bugün ne pişirsem?": Yemek Planı'nda bugün için mevcut akşam önerilerini + "Sana uygun"u en üste taşıyan bir bölüm; yeni motor yok | Yüksek (ürün) | Düşük-orta (UI) | Tasarım onayı |
| 9 | Tarif havuzu: veri modeli + 20 combo'nun genişletilmesi | Yüksek | Orta — `DEC-067` Level 1 sınırı | **Evet** (`DEC-067` yeniden açılır) |
| 10 | Kişisel kalibrasyon (kilo trendi) — önce yalnızca tasarım | Orta-yüksek | Yüksek (yeni alt sistem, `DEC-020`/`021`) | **Evet** |

Sonra: hane/kullanıcı kapsamı kararı (§4.5), OWASP/rate-limit denetimi, production'daki commit'in
doğrulanması.

**Uygulama durumu (2026-10-27, `docs/product-relaunch-audit`):** #1 yapıldı (`MacroSummaryCard`'da
"Örnek hedef" rozeti, açıklama ve Kişisel Plan'a giden "Hedeflerini kişiselleştir" bağlantısı; Yemekler
sayfası da aynı bayrağı kullanıyor; rozet sunucu "profil yok" dedikten sonra çıkıyor). #3'ün etiket kısmı
yapıldı (kart başlığı "PLANDAKİ MAKROLAR"). #4 yapıldı (`DEC_REGISTER.md` satırı ve kelime-dağarcığı notu 3).
`tsc -b` temiz; tarayıcıda canlı test edilmedi. `PSM_ITERATION_1_IMPLEMENTATION_LEDGER.md:97` ve
`specs/2026-09-10-dec-register-…` aynı ters ifadeyi taşıyor; tarihsel kayıt oldukları için dokunulmadı.

---

## 11. Ürün sahibinin profili: 70 kg, 182 cm, orta aktif, kilo alma

Yaş verilmedi; erkek denklem katsayısı varsayıldı [Hesap]:

| Yaş | BMR | Hareketsiz → alma | Az aktif → alma | **Orta aktif → alma** | Aktif → alma |
| --- | --- | --- | --- | --- | --- |
| 22 | 1734 | 2677 | 2937 | **3197** | 3544 |
| 25 | 1719 | 2656 | 2914 | **3172** | 3516 |
| 30 | 1694 | 2622 | 2876 | **3130** | 3469 |

Uygulama "Orta aktif" ile ≈3150-3200 kcal veriyor. Gözlemlenen ≈2700, "Hareketsiz" satırına denk düşüyor.
Fark (≈500 kcal) tamamen aktivite katsayısından geliyor. Bu profilde makroların orta noktaları toplamı
≈3040 kcal, hedefin 132 kcal altında, yani §4.3'teki tutarsızlık bu profilde görünmüyor; ağırlıkla aktif +
kilo verme kombinasyonunda ortaya çıkıyor.

---

## 12. Özet tablo: gerekli, eksik, fazla

| Alan | Var ve yeterli | Eksik (gerekli) | Fazla / yanlış |
| --- | --- | --- | --- |
| Enerji hesabı | Mifflin doğru; hedef fazlası tek sefer | Belirsizlik aralığı (±SEPV); kişisel kalibrasyon | Aktivite etiketleri bir kademe yüksek (PAL) |
| Makrolar | Protein, yağ, karbonhidrat, lif ayrı ayrı kaynaklı | Üçünün kalori hedefiyle birlikte tutarlı olması | Kartta orta nokta hedef gibi gösteriliyor |
| Profil / onboarding | Örnek profil kaydedilmiyor; profil atlanabiliyor | — | ~~Örnek hedef kişisel gibi görünüyordu~~ (düzeltildi) |
| Planlanan / yenen | Plan sunucuda kalıcı | `meal_entries`'te "yendi" alanı | ~~Kart "günlük" diyordu~~ (etiket düzeltildi) |
| Besin verisi | 63/67 satırda USDA FDC kimliği | Kaynağın API'den kullanıcıya ulaşması; `nutrition` şeması | "Google" kaynaklı 1 satır; eksik lif → 0 |
| Güvenlik | Admin yazma kilidi, RLS, iki katmanlı yetki | OWASP/rate-limit/KVKK denetimi | — |
| "Bugün ne pişirsem?" | Öneri motorları, 20 hazır yemek, plana ve listeye ekleme | Bunları bir araya getiren ana bölüm; tarif havuzu | — |
| Dağıtım | Vercel, elle deploy, `agent-login` yayında değil | Canlıdaki commit'in kaydı | Netlify izleri yalnızca tarihsel notlarda |
| Karar kayıtları | 112 DEC, 11 gate kaydı, 7 beslenme + 1 mutfak kitabı | — | ~~DEC-022 notu tersti~~ (düzeltildi) |

---

## 10. Yönergenin diğer belgeleri

| Belge | Durum |
| --- | --- |
| `01-decision-register.md` | Yazılmadı — `DEC_REGISTER.md` zaten karşılıyor (§2) |
| `02-scientific-source-audit.md` | Yazılmadı — `03_PHASE_1_…/BOOK_ROLES.md` + `12_ENERGY_INDIVIDUALIZATION/` büyük kısmını karşılıyor; İddia → Kaynak → Kod zinciri **NOT REVIEWED** |
| `03-energy-and-macro-audit.md` | Bu belgenin §4'ü ilk sürüm |
| `04-calculation-test-cases.md` | Yazılmadı. Test dosyası değil, belge olarak (vaka tablosu) yazılmalı — CLAUDE.md |
| `05`–`12` | Yazılmadı (**NOT REVIEWED**) |
