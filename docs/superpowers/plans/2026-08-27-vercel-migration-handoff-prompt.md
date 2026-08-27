# Vercel migrasyonu — devir teslim prompt'u

Bu dosya, NUT-29 (Netlify → Vercel taşınması) işini başka bir Claude oturumuna veya
collaboratöre devretmek için hazırlanmış, kopyala-yapıştır kullanılabilecek bir prompt'tur.
Aşağıdaki blok olduğu gibi yeni bir Claude Code oturumuna yapıştırılabilir.

---

## PROMPT (buradan itibaren kopyala)

Bu repo (`ozan-ozel/grocery`, Turkish grocery/meal-planner app) Netlify'dan Vercel'e
taşınıyor — Linear'da **NUT-29** ("Netlify'dan Vercel'e taşınma", takım:
Nutrition-grocery-planner, https://linear.app/nutrition-grocery-planner/issue/NUT-29). Önce
o issue'yu oku, güncel durumu ve checklist'i gör. Aşağıdaki bilgiler o issue'yu
tamamlayacak/güncelleyecek şekilde yazıldı — issue zaten yoksa (silinmiş/taşınmışsa) aynı
başlık ve içerikle yeniden oluştur.

### Şu ana kadar tamamlanan (Adım 0-4, hepsi doğrulandı)

- **Adım 0**: `netlify/functions/state.ts` ve `households.ts`, Netlify Blobs yerine yeni bir
  Supabase tablosuna (`sync_state`, bkz. `supabase/06-sync-state.sql`) bağlandı. Mevcut
  production verisi `scripts/migrate-blobs-to-supabase.ts` ile taşındı (3 gerçek hane migrate
  edildi, 5 eski test hanesi FK constraint ile doğru şekilde atlandı). Bu commit zaten
  `master`'a merge edildi ve Netlify'da canlı — **geri dönüş yok, bu iş bitti**.
- **Adım 1**: `netlify/functions/*.ts`'in Vercel-formatlı kopyaları `api/*.ts` altında
  oluşturuldu (branch: `refactor/vercel-api-functions`, henüz `master`'a merge edilmedi).
  Netlify hâlâ `netlify/functions/`'dan çalışıyor, `api/` klasörü ona görünmez —
  iki klasör bilinçli olarak paralel duruyor, cutover'a kadar böyle kalacak.
- **Adım 2**: Vercel projesi (`psymores-projects/grocery`) kuruldu. **Önemli**: Vercel
  hesabı (`psymore`) ile GitHub repo sahibi (`ozan-ozel`) farklı kişisel hesaplar (org değil),
  bu yüzden Vercel'in GitHub App'i repoyu göremedi ve git-entegrasyonlu otomatik deploy
  kurulamadı. Çözüm: `vercel` CLI (`package.json`'da devDependency) ile **manuel** deploy
  yapılıyor — `npx vercel login`, `npx vercel link` zaten yapıldı (yerel `.vercel/` klasörü
  linked durumda). **Netlify'ın aksine, `master`'a push Vercel'i hiç tetiklemiyor** — her
  güncelleme için elle `npx vercel --prod` çalıştırmak gerekiyor.
- **Adım 3**: Google Cloud Console'da OAuth redirect URI eklendi:
  `https://grocery-five-ecru.vercel.app/api/auth-google-callback`.
- **Adım 4**: Uçtan uca doğrulandı — login/logout, CRUD, sync, throttled bağlantı testi
  (Slow 3G'de ~9sn, kabul edilebilir — Cloudflare'deki soruna göre çok daha iyi).

### Yol boyunca bulunan Vercel'e özgü sürprizler (önemli, tekrar karşılaşılabilir)

1. **Vercel Deployment Protection** (Vercel Authentication / SSO) varsayılan olarak
   **Preview** deployment'ları koruyor ama **Production**'ı korumuyor. Bu yüzden test için
   `npx vercel` (preview) değil `npx vercel --prod` kullanıldı — bu güvenli, çünkü gerçek
   kullanıcı trafiği hâlâ Netlify'da, Vercel'in "production"ı henüz kimsenin bilmediği bir
   adres.
2. **`api/` klasöründeki route olmayan dosyalar deploy paketine hiç dahil edilmiyor**,
   isimlendirmeden bağımsız (alt çizgiyle başlasa da başlamasa da). Paylaşılan auth helper'ı
   `api/_auth.ts` → `lib/auth.ts`'e (repo kökünde, `api/` dışında) taşımak gerekti.
3. **Vercel'in Node runtime'ı gerçek Node ESM loader kullanıyor**, Netlify'ın esbuild
   bundler'ı gibi extensionless import'ları tolere etmiyor — tüm relative import'lara
   `.js` uzantısı eklemek gerekti (`from "../lib/auth.js"`), TypeScript dosyaları olsa bile.
   Lokal `tsc` bunu yakalamıyor (`moduleResolution: "bundler"` toleranslı), sadece gerçek
   deploy'da ortaya çıkıyor — yeni bir fonksiyon eklenirse bu hataya tekrar düşülebilir,
   dikkat.
4. Vercel deploy sayısı Hobby'de **günde 100** ile sınırlı (kredi bazlı değil, düz sayaç),
   bandwidth/invocation limitleri ayrı ve bağımsız sayaçlar — bizim ölçeğimizde pratikte
   sorun teşkil etmiyor.

### Kullanılan/kullanılacak komutlar

```bash
# Tip kontrolü (api/ klasörü root tsconfig'e dahil değil, ayrı kontrol edilmeli)
npx tsc -p api --noEmit

# Deploy (PowerShell'de çalıştır — Git Bash'te npx+node PATH sorunu çıkarıyor)
npx vercel            # preview deploy (Deployment Protection ile korumalı, dışarıdan test edilemez)
npx vercel --prod     # production deploy -> https://grocery-five-ecru.vercel.app (korumasız, gerçek test URL'i)

# Runtime hatalarını görmek için
npx vercel logs https://grocery-five-ecru.vercel.app
```

### Kalan iş: Adım 5 — Cutover

Custom domain yok (Netlify sitesi `house-chores-helper.netlify.app`'te duruyor), o yüzden
DNS yönlendirmeye gerek yok — cutover basitçe "artık Vercel linkini kullanıyoruz" demek.

1. `refactor/vercel-api-functions` branch'ini `master`'a merge et (güvenli — `api/` Netlify'ı
   etkilemiyor).
2. Netlify ile Vercel'i birkaç gün paralel çalışır bırakıp gözlemle.
3. Sorun çıkmazsa: `netlify/functions/`, `netlify.toml`, `scripts/migrate-blobs-to-supabase.ts`,
   `scripts/migrate-kv-to-blobs.ts` (eski, alakasız Cloudflare→Netlify script'i) sil;
   `package.json`'dan `@netlify/blobs` ve `netlify-cli`'yi kaldır; Netlify sitesini kapat.
4. **`README.md` ve `CLAUDE.md`'yi güncelle** — şu an ikisi de Netlify'ı "gerçek deploy
   hedefi" olarak anlatıyor (`npm run netlify:dev`, "All backend logic lives under
   netlify/functions/*" gibi ifadeler). Cutover sonrası bunlar Vercel'i yansıtmalı: build/dev
   komutları, `api/` klasörünün konumu, `npx vercel --prod` ile manuel deploy akışı, ve git
   entegrasyonu OLMADIĞI (bu önemli, aksi halde biri push'un otomatik deploy edeceğini sanıp
   yanlış varsayımla ilerleyebilir).
5. NUT-29'u tamamlandı olarak işaretle, son durumu özetleyen bir yorum ekle.

### Sana (yeni oturum) düşen

- Yukarıdaki NUT-29 issue'sunu güncel duruma göre güncelle (yoksa aynı içerikle yeniden
  oluştur).
- Kullanıcı ve/veya collaboratör ile birlikte Adım 5'in hangi adımının şimdi yapılacağını
  netleştir (hemen merge mi, yoksa gözlem süresi mi).
- README.md/CLAUDE.md güncellemesini, gerçek cutover (Netlify kapatılması) olmadan ERKEN
  yapma — o dosyalar hâlâ doğru mevcut durumu (Netlify canlı, Vercel paralel test'te)
  yansıtmalı; sadece cutover tamamlandığında güncelle.

---

## PROMPT SONU
