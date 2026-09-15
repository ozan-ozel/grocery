# Netlify → Vercel taşınma planı — efor tahminleri

Kaynak: [NUT-29](https://linear.app/nutrition-grocery-planner/issue/NUT-29/netlifydan-vercele-tasinma) ·
Karşılaştırma: [Deployment Karnesi](https://claude.ai/code/artifact/7d4c4220-e17d-41fd-8831-9f5204a89e75)

Efor puanları 1 (birkaç dakika) – 5 (yarım gün+) arası, kabaca. Amaç kesin tahmin değil,
işi iki kişi arasında bölüştürülebilir hale getirmek. Adımlar sırayla yapılmalı (her adım
bir öncekine bağlı).

Önerilen bölüşüm: **Bölüm A** kod tarafı + Vercel projesinin ilk kurulumu — bu repoya ve
fonksiyonlara hakim olan taraf yapar. **Bölüm B** OAuth console ayarı, uçtan uca doğrulama ve
cutover — panellerde gezinme ve test ağırlıklı, koda derin hakimiyet gerektirmiyor. Sınır nette
değil, rahatça kaydırılabilir.

## Bağımlılık notu

İş tamamen sıralı — Bölüm B, Bölüm A bitmeden gerçek anlamda başlayamaz:

- **Adım 3**, Adım 2.3'te oluşan preview URL'e ihtiyaç duyar (Google Console'a kaydedecek adres olmadan yapılamaz).
- **Adım 4**, canlı ve çalışan bir deploy gerektirir — Adım 0 bitmeden `/api/state` Vercel'de çalışmaz
  (`@netlify/blobs` Netlify runtime'ına bağımlı), Adım 1 bitmeden fonksiyonlar doğru yerde olmaz.
- **Adım 5**, Adım 4'ün geçmesine bağlı.

Tek istisna: collaborator bu süre boyunca hazırlık yapabilir (Google Cloud Console'daki OAuth
client'a erişimi olduğundan emin olmak, Vercel projesine davet edilmek) — ama puanlanan işlerin
hiçbiri gerçek anlamda paralel yürümez.

## Bölüm A — Kod tarafı + Vercel kurulumu (öneri: biz)

### Adım 0 — Netlify Blobs → Supabase tablosu

| # | İş | Efor |
|---|---|---|
| 0.1 | `sync_state` tablosunu oluştur (household_id FK, version, state jsonb, `on delete cascade`) | 1 |
| 0.2 | `state.ts`'i tabloya bağla — GET/PUT, optimistic-concurrency (409) mantığını PostgREST'e taşı | 3 |
| 0.3 | `households.ts`'teki manuel blob-cleanup'ı kaldır, `@netlify/blobs`'u package.json'dan sil | 1 |

**Alt toplam: 5**

### Adım 1 — Fonksiyonları Vercel formatına taşı

| # | İş | Efor |
|---|---|---|
| 1.1 | `netlify/functions/*.ts` → `api/*.ts`, import yollarını düzelt | 2 |
| 1.2 | `_auth.ts`'nin route olarak açığa çıkmadığını doğrula (Vercel docs) | 1 |
| 1.3 | İki OAuth fonksiyonunda `CONTEXT` → `VERCEL_ENV` kontrolü | 1 |
| 1.4 | `package.json`'da `engines.node` ile Node sürümünü sabitle | 1 |

**Alt toplam: 5**

### Adım 2 — Vercel projesini kur

| # | İş | Efor |
|---|---|---|
| 2.1 | Yeni Vercel projesi, aynı GitHub reposuna bağla | 1 |
| 2.2 | Env var'ları gir (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, JWT_SECRET) | 1 |
| 2.3 | İlk deploy → preview URL | 1 |

**Alt toplam: 3**

**Bölüm A toplam efor: 13**

---

## Bölüm B — Doğrulama & cutover (öneri: collaborator)

### Adım 3 — Google OAuth redirect URI

| # | İş | Efor |
|---|---|---|
| 3.1 | Google Cloud Console'da preview (sonra production) domain'ini yetkili redirect URI olarak ekle | 1 |

**Alt toplam: 1**

### Adım 4 — Uçtan uca doğrulama (preview URL'de)

| # | İş | Efor |
|---|---|---|
| 4.1 | Google login/logout akışı | 2 |
| 4.2 | Household/list/item CRUD + `/api/state` sync (409 conflict dahil) | 2 |
| 4.3 | Yavaş/throttled bağlantı testi (Cloudflare'de sorun tam olarak buydu — atlanmamalı) | 2 |

**Alt toplam: 6**

### Adım 5 — Cutover

| # | İş | Efor |
|---|---|---|
| 5.1 | Custom domain varsa DNS'i Vercel'e yönlendir | 2 |
| 5.2 | Netlify ile birkaç gün paralel çalıştır, izle | 1 |
| 5.3 | Netlify'ı kapat | 1 |

**Alt toplam: 4**

**Bölüm B toplam efor: 11**

---

## Yedek plan (efora dahil değil)

Vercel Hobby'de cold start tamamen sıfırlanmıyor (Fluid Compute Pro-only). Adım 4.3 sorun
çıkarırsa **Render Starter'a ($7/ay, always-on) geçiş** — ek olarak ~13 fonksiyonun tek bir
Express/Fastify app'e konsolide edilmesi gerekir (bu ek iş burada puanlanmadı, o an ayrı
değerlendirilmeli).
