-- Catalog corrections and non-destructive duplicate retirement.
-- Apply manually in Supabase SQL Editor before relying on the new catalog.
-- Existing food UUIDs, meal entries, saved meals, batches and profiles are NOT deleted or rewritten.
-- Macro values are current-catalog lookups, so corrected values also affect past totals.
-- References and source decisions: data/catalog-review-2026-10-29.md.
-- One-shot, transactional and re-runnable: the private marker prevents later edits being overwritten.
begin;
alter table public.nutrition
  add column if not exists source text,
  add column if not exists preparation_state text,
  add column if not exists is_active boolean not null default true,
  add column if not exists canonical_name text,
  add column if not exists equivalent_food_ids text[] not null default '{}',
  add column if not exists equivalent_names text[] not null default '{}';

create table if not exists app_private.nutrition_polish_20261029_backup (
  name_tr text primary key,
  before_row jsonb,
  recorded_at timestamptz not null default now()
);
revoke all on app_private.nutrition_polish_20261029_backup from public, anon, authenticated;

do $migration$
begin
  if exists (select 1 from app_private.nutrition_polish_20261029_backup where name_tr = '__applied__') then
    raise notice 'Catalog polish already applied; preserving subsequent edits.';
    return;
  end if;
  -- Lock only nutrition while taking the snapshot and updating its reviewed rows.
  lock table public.nutrition in share row exclusive mode;
  insert into app_private.nutrition_polish_20261029_backup(name_tr,before_row)
    select name_tr,to_jsonb(n) from public.nutrition n on conflict do nothing;

  insert into public.nutrition
    (name_tr,aliases,kcal_per_100,protein_g,fat_g,carbs_g,fiber_g,source,preparation_state,is_active,canonical_name)
  select name_tr,aliases,kcal_per_100,protein_g,fat_g,carbs_g,fiber_g,source,preparation_state,is_active,canonical_name
  from jsonb_to_recordset($catalog$
[
  {
    "name_tr": "antep fıstığı",
    "aliases": [],
    "kcal_per_100": 560.0,
    "protein_g": 20.2,
    "fat_g": 45.3,
    "carbs_g": 27.2,
    "fiber_g": 10.6,
    "source": "USDA FoodData Central 170184: Nuts, pistachio nuts, raw",
    "is_active": true,
    "preparation_state": "çiğ / kuru yenilebilir ağırlık"
  },
  {
    "name_tr": "armut",
    "aliases": [],
    "kcal_per_100": 57,
    "protein_g": 0.4,
    "fat_g": 0.1,
    "carbs_g": 15.2,
    "fiber_g": 3.1,
    "source": "USDA fdc_id 169118",
    "is_active": true,
    "preparation_state": "yenilebilir ağırlık"
  },
  {
    "name_tr": "arpa",
    "aliases": [],
    "kcal_per_100": 354.0,
    "protein_g": 12.5,
    "fat_g": 2.3,
    "carbs_g": 73.5,
    "fiber_g": 17.3,
    "source": "USDA FoodData Central 170283: Barley, hulled",
    "is_active": true,
    "preparation_state": "kuru"
  },
  {
    "name_tr": "ayçiçek yağı",
    "aliases": [],
    "kcal_per_100": 884,
    "protein_g": 0,
    "fat_g": 100,
    "carbs_g": 0,
    "fiber_g": 0,
    "source": "USDA fdc_id 171017",
    "is_active": true,
    "preparation_state": "yenilebilir ağırlık"
  },
  {
    "name_tr": "badem",
    "aliases": [
      "iç badem"
    ],
    "kcal_per_100": 579,
    "protein_g": 21.2,
    "fat_g": 49.9,
    "carbs_g": 21.6,
    "fiber_g": 12.5,
    "source": "USDA fdc_id 170567",
    "is_active": true,
    "preparation_state": "yenilebilir ağırlık"
  },
  {
    "name_tr": "bal",
    "aliases": [
      "çiçek balı",
      "çam balı"
    ],
    "kcal_per_100": 304,
    "protein_g": 0.3,
    "fat_g": 0,
    "carbs_g": 82.4,
    "fiber_g": 0.2,
    "source": "USDA fdc_id 169640",
    "is_active": true,
    "preparation_state": "yenilebilir ağırlık"
  },
  {
    "name_tr": "baldo pirinç",
    "aliases": [
      "baldo"
    ],
    "kcal_per_100": 358,
    "protein_g": 6.7,
    "fat_g": 0.7,
    "carbs_g": 79,
    "fiber_g": 1.4,
    "source": "Kaynak doğrulanmadı; üretici etiketi gerekli",
    "is_active": true,
    "preparation_state": "kuru"
  },
  {
    "name_tr": "beyaz ekmek",
    "aliases": [
      "ekmek"
    ],
    "kcal_per_100": 266,
    "protein_g": 8.9,
    "fat_g": 3.3,
    "carbs_g": 49.4,
    "fiber_g": 2.7,
    "source": "USDA fdc_id 174924",
    "is_active": true,
    "preparation_state": "tüketime hazır"
  },
  {
    "name_tr": "beyaz peynir",
    "aliases": [],
    "kcal_per_100": 265,
    "protein_g": 14.2,
    "fat_g": 21.5,
    "carbs_g": 3.9,
    "fiber_g": 0,
    "source": "USDA fdc_id 173420; yakın karşılık: feta",
    "is_active": true,
    "preparation_state": "tüketime hazır"
  },
  {
    "name_tr": "beyaz pirinç",
    "aliases": [],
    "kcal_per_100": 365.0,
    "protein_g": 7.1,
    "fat_g": 0.7,
    "carbs_g": 80.0,
    "fiber_g": 1.3,
    "source": "USDA FoodData Central 169756: Rice, white, long-grain, regular, raw, unenriched",
    "is_active": false,
    "preparation_state": "kuru",
    "canonical_name": "pirinç"
  },
  {
    "name_tr": "biftek (antrikot)",
    "aliases": [
      "biftek",
      "antrikot"
    ],
    "kcal_per_100": 228.0,
    "protein_g": 19.3,
    "fat_g": 16.7,
    "carbs_g": 0.1,
    "fiber_g": 0.0,
    "source": "USDA FoodData Central 173402: Beef, rib eye steak, boneless, lip off, separable lean and fat, trimmed to 0\" fat, all grades, raw",
    "is_active": true,
    "preparation_state": "çiğ, kemiksiz yenilebilir kısım"
  },
  {
    "name_tr": "bitter çikolata",
    "aliases": [],
    "kcal_per_100": 598,
    "protein_g": 7.8,
    "fat_g": 42.6,
    "carbs_g": 45.9,
    "fiber_g": 10.9,
    "source": "USDA fdc_id 170273",
    "is_active": true,
    "preparation_state": "yenilebilir ağırlık"
  },
  {
    "name_tr": "brokoli",
    "aliases": [],
    "kcal_per_100": 34,
    "protein_g": 2.8,
    "fat_g": 0.4,
    "carbs_g": 6.6,
    "fiber_g": 2.6,
    "source": "USDA fdc_id 170379",
    "is_active": true,
    "preparation_state": "yenilebilir ağırlık"
  },
  {
    "name_tr": "bulgur",
    "aliases": [
      "pilavlık bulgur"
    ],
    "kcal_per_100": 342,
    "protein_g": 12.3,
    "fat_g": 1.3,
    "carbs_g": 75.9,
    "fiber_g": 12.5,
    "source": "USDA fdc_id 170688",
    "is_active": true,
    "preparation_state": "kuru"
  },
  {
    "name_tr": "bulgur pilavı",
    "aliases": [
      "pişmiş bulgur"
    ],
    "kcal_per_100": 115,
    "protein_g": 3.5,
    "fat_g": 0.8,
    "carbs_g": 24,
    "fiber_g": 3.8,
    "source": "Kaynak doğrulanmadı; üretici etiketi gerekli",
    "is_active": false,
    "preparation_state": "pişmiş; yalnızca eski kayıtlar"
  },
  {
    "name_tr": "ceviz",
    "aliases": [
      "iç ceviz",
      "ceviz içi"
    ],
    "kcal_per_100": 654,
    "protein_g": 15.2,
    "fat_g": 65.2,
    "carbs_g": 13.7,
    "fiber_g": 6.7,
    "source": "USDA fdc_id 170187",
    "is_active": true,
    "preparation_state": "yenilebilir ağırlık"
  },
  {
    "name_tr": "ceviz içi",
    "aliases": [],
    "kcal_per_100": 654.0,
    "protein_g": 15.2,
    "fat_g": 65.2,
    "carbs_g": 13.7,
    "fiber_g": 6.7,
    "source": "USDA FoodData Central 170187: Nuts, walnuts, english",
    "is_active": false,
    "preparation_state": "çiğ / kuru yenilebilir ağırlık",
    "canonical_name": "ceviz"
  },
  {
    "name_tr": "chia tohumu",
    "aliases": [
      "chia"
    ],
    "kcal_per_100": 486.0,
    "protein_g": 16.5,
    "fat_g": 30.7,
    "carbs_g": 42.1,
    "fiber_g": 34.4,
    "source": "USDA FoodData Central 170554: Seeds, chia seeds, dried",
    "is_active": true,
    "preparation_state": "çiğ / kuru yenilebilir ağırlık"
  },
  {
    "name_tr": "dana kıyma",
    "aliases": [
      "dana kıyma yüzde 15 yağ",
      "orta yağlı dana kıyma"
    ],
    "kcal_per_100": 215,
    "protein_g": 18.6,
    "fat_g": 15,
    "carbs_g": 0,
    "fiber_g": 0,
    "source": "USDA fdc_id 171796",
    "is_active": true,
    "preparation_state": "çiğ, %15 yağ"
  },
  {
    "name_tr": "domates",
    "aliases": [
      "kırmızı domates"
    ],
    "kcal_per_100": 18,
    "protein_g": 0.9,
    "fat_g": 0.2,
    "carbs_g": 3.9,
    "fiber_g": 1.2,
    "source": "USDA fdc_id 170457",
    "is_active": true,
    "preparation_state": "yenilebilir ağırlık"
  },
  {
    "name_tr": "elma",
    "aliases": [],
    "kcal_per_100": 61.8,
    "protein_g": 0.2,
    "fat_g": 0.2,
    "carbs_g": 14.8,
    "fiber_g": 2,
    "source": "USDA fdc_id 1750339",
    "is_active": true,
    "preparation_state": "yenilebilir ağırlık"
  },
  {
    "name_tr": "eski kaşar",
    "aliases": [],
    "kcal_per_100": 360,
    "protein_g": 26,
    "fat_g": 26,
    "carbs_g": 1.5,
    "fiber_g": 0,
    "source": "Kaynak doğrulanmadı; mevcut eski kayıt",
    "is_active": true,
    "preparation_state": "tüketime hazır"
  },
  {
    "name_tr": "esmer pirinç",
    "aliases": [
      "kahverengi pirinç",
      "kepekli pirinç"
    ],
    "kcal_per_100": 367.0,
    "protein_g": 7.5,
    "fat_g": 3.2,
    "carbs_g": 76.2,
    "fiber_g": 3.6,
    "source": "USDA FoodData Central 169703: Rice, brown, long-grain, raw (Includes foods for USDA's Food Distribution Program)",
    "is_active": true,
    "preparation_state": "kuru"
  },
  {
    "name_tr": "fındık",
    "aliases": [
      "iç fındık"
    ],
    "kcal_per_100": 628,
    "protein_g": 15,
    "fat_g": 60.8,
    "carbs_g": 16.7,
    "fiber_g": 9.7,
    "source": "USDA fdc_id 170581",
    "is_active": true,
    "preparation_state": "yenilebilir ağırlık"
  },
  {
    "name_tr": "hamsi konserve",
    "aliases": [],
    "kcal_per_100": 323,
    "protein_g": 21,
    "fat_g": 25.9,
    "carbs_g": 5.1,
    "fiber_g": 0,
    "source": "Dardanel Hamsi; https://www.dardanel.com.tr/EN/2-lezzetlerimiz/191-kucuk-balik/246-hamsi/; erişim 2026-10-29",
    "preparation_state": "konserve; yağ ve sos dahil",
    "is_active": true
  },
  {
    "name_tr": "hardal",
    "aliases": [
      "sarı hardal"
    ],
    "kcal_per_100": 66,
    "protein_g": 4,
    "fat_g": 2.2,
    "carbs_g": 5.9,
    "fiber_g": 3.3,
    "source": "Pınar Hardal; https://www.pinar.com.tr/urunler/detay-sut/Hardal/3712/5011/0; erişim 2026-10-29",
    "is_active": true,
    "preparation_state": "tüketime hazır"
  },
  {
    "name_tr": "havuç",
    "aliases": [],
    "kcal_per_100": 41,
    "protein_g": 0.9,
    "fat_g": 0.2,
    "carbs_g": 9.6,
    "fiber_g": 2.8,
    "source": "USDA fdc_id 170393",
    "is_active": true,
    "preparation_state": "yenilebilir ağırlık"
  },
  {
    "name_tr": "hindi fileto konserve",
    "aliases": [
      "hindi konserve"
    ],
    "kcal_per_100": 122,
    "protein_g": 26,
    "fat_g": 2,
    "carbs_g": 0,
    "fiber_g": 0,
    "source": "Pınar Hindi Fileto; https://www.pinar.com.tr/urunler/detay-et/Pinar-Hindi-Fileto-Konserve/3770/5170/0; erişim 2026-10-29",
    "preparation_state": "konserve; süzülmüş yenilebilir miktar",
    "is_active": true
  },
  {
    "name_tr": "hindi göğsü",
    "aliases": [
      "hindi göğüs"
    ],
    "kcal_per_100": 114,
    "protein_g": 23.7,
    "fat_g": 1.5,
    "carbs_g": 0.1,
    "fiber_g": 0,
    "source": "USDA fdc_id 171098",
    "is_active": true,
    "preparation_state": "çiğ, kemiksiz yenilebilir kısım"
  },
  {
    "name_tr": "hindi tandır konserve",
    "aliases": [
      "hindi but konserve"
    ],
    "kcal_per_100": 158,
    "protein_g": 24,
    "fat_g": 6.5,
    "carbs_g": 0,
    "fiber_g": 0,
    "source": "Bahar Hindi Tandır; https://baharlezzeti.com/product/bahar-hindi-tandir-120-g-2/; erişim 2026-10-29",
    "preparation_state": "konserve; etiketteki ürün temeli",
    "is_active": true
  },
  {
    "name_tr": "instant maya",
    "aliases": [
      "kuru maya",
      "aktif kuru maya"
    ],
    "kcal_per_100": 325.0,
    "protein_g": 40.4,
    "fat_g": 7.6,
    "carbs_g": 41.2,
    "fiber_g": 26.9,
    "source": "USDA FoodData Central 175043: Leavening agents, yeast, baker's, active dry",
    "is_active": true,
    "preparation_state": "çiğ / kuru yenilebilir ağırlık"
  },
  {
    "name_tr": "jambon",
    "aliases": [],
    "kcal_per_100": 164,
    "protein_g": 16.6,
    "fat_g": 8.8,
    "carbs_g": 3.6,
    "fiber_g": 1.3,
    "source": "USDA fdc_id 173864",
    "is_active": true,
    "preparation_state": "tüketime hazır"
  },
  {
    "name_tr": "kabak",
    "aliases": [],
    "kcal_per_100": 17.0,
    "protein_g": 1.2,
    "fat_g": 0.3,
    "carbs_g": 3.1,
    "fiber_g": 1.0,
    "source": "USDA FoodData Central 169291: Squash, summer, zucchini, includes skin, raw",
    "is_active": true,
    "preparation_state": "çiğ / kuru yenilebilir ağırlık"
  },
  {
    "name_tr": "kabak çekirdeği",
    "aliases": [],
    "kcal_per_100": 559.0,
    "protein_g": 30.2,
    "fat_g": 49.0,
    "carbs_g": 10.7,
    "fiber_g": 6.0,
    "source": "USDA FoodData Central 170556: Seeds, pumpkin and squash seed kernels, dried",
    "is_active": true,
    "preparation_state": "çiğ / kuru yenilebilir ağırlık"
  },
  {
    "name_tr": "kahve",
    "aliases": [
      "filtre kahve"
    ],
    "kcal_per_100": 1,
    "protein_g": 0.1,
    "fat_g": 0,
    "carbs_g": 0,
    "fiber_g": 0,
    "source": "USDA fdc_id 171890",
    "is_active": true,
    "preparation_state": "yenilebilir ağırlık"
  },
  {
    "name_tr": "kaju",
    "aliases": [
      "çiğ kaju"
    ],
    "kcal_per_100": 553.0,
    "protein_g": 18.2,
    "fat_g": 43.9,
    "carbs_g": 30.2,
    "fiber_g": 3.3,
    "source": "USDA FoodData Central 170162: Nuts, cashew nuts, raw",
    "is_active": true,
    "preparation_state": "çiğ / kuru yenilebilir ağırlık"
  },
  {
    "name_tr": "karabuğday",
    "aliases": [
      "greçka"
    ],
    "kcal_per_100": 343.0,
    "protein_g": 13.2,
    "fat_g": 3.4,
    "carbs_g": 71.5,
    "fiber_g": 10.0,
    "source": "USDA FoodData Central 170286: Buckwheat",
    "is_active": true,
    "preparation_state": "kuru"
  },
  {
    "name_tr": "karabuğday ekmeği",
    "aliases": [],
    "kcal_per_100": 250,
    "protein_g": 8,
    "fat_g": 3,
    "carbs_g": 47,
    "fiber_g": 6.5,
    "source": "Kaynak doğrulanmadı; üretici etiketi gerekli",
    "is_active": true,
    "preparation_state": "tüketime hazır"
  },
  {
    "name_tr": "karalahana",
    "aliases": [
      "kara lahana"
    ],
    "kcal_per_100": 35.0,
    "protein_g": 2.9,
    "fat_g": 1.5,
    "carbs_g": 4.4,
    "fiber_g": 4.1,
    "source": "USDA FoodData Central 168421: Kale, raw; yakın karşılık: kale",
    "is_active": true,
    "preparation_state": "çiğ / kuru yenilebilir ağırlık"
  },
  {
    "name_tr": "karides",
    "aliases": [],
    "kcal_per_100": 85,
    "protein_g": 20.1,
    "fat_g": 0.5,
    "carbs_g": 0,
    "fiber_g": 0,
    "source": "USDA fdc_id 175179",
    "is_active": true,
    "preparation_state": "çiğ, kemiksiz yenilebilir kısım"
  },
  {
    "name_tr": "karnabahar",
    "aliases": [],
    "kcal_per_100": 25,
    "protein_g": 1.9,
    "fat_g": 0.3,
    "carbs_g": 5,
    "fiber_g": 2,
    "source": "USDA fdc_id 169986",
    "is_active": true,
    "preparation_state": "yenilebilir ağırlık"
  },
  {
    "name_tr": "karpuz",
    "aliases": [],
    "kcal_per_100": 30,
    "protein_g": 0.6,
    "fat_g": 0.2,
    "carbs_g": 7.6,
    "fiber_g": 0.4,
    "source": "USDA fdc_id 167765",
    "is_active": true,
    "preparation_state": "yenilebilir ağırlık"
  },
  {
    "name_tr": "kavun",
    "aliases": [],
    "kcal_per_100": 34,
    "protein_g": 0.8,
    "fat_g": 0.2,
    "carbs_g": 8.2,
    "fiber_g": 0.9,
    "source": "USDA fdc_id 169092",
    "is_active": true,
    "preparation_state": "yenilebilir ağırlık"
  },
  {
    "name_tr": "kayısı",
    "aliases": [],
    "kcal_per_100": 48,
    "protein_g": 1.4,
    "fat_g": 0.4,
    "carbs_g": 11.1,
    "fiber_g": 2,
    "source": "USDA fdc_id 171697",
    "is_active": true,
    "preparation_state": "yenilebilir ağırlık"
  },
  {
    "name_tr": "kaşar peyniri",
    "aliases": [
      "kaşar"
    ],
    "kcal_per_100": 403,
    "protein_g": 22.9,
    "fat_g": 33.3,
    "carbs_g": 3.4,
    "fiber_g": 0,
    "source": "USDA fdc_id 173414; yakın karşılık: cheddar",
    "is_active": true,
    "preparation_state": "tüketime hazır"
  },
  {
    "name_tr": "ketçap",
    "aliases": [
      "domates ketçap"
    ],
    "kcal_per_100": 101,
    "protein_g": 1.2,
    "fat_g": 0,
    "carbs_g": 24,
    "fiber_g": 0,
    "source": "Pınar Ketçap; lif beyan edilmedi (0: veri sözleşmesinin bilinmeyen değeri); https://www.pinar.com.tr/urunler/detay-sut/Ketcap/618/163/0; erişim 2026-10-29",
    "is_active": true,
    "preparation_state": "tüketime hazır"
  },
  {
    "name_tr": "kinoa",
    "aliases": [],
    "kcal_per_100": 368.0,
    "protein_g": 14.1,
    "fat_g": 6.1,
    "carbs_g": 64.2,
    "fiber_g": 7.0,
    "source": "USDA FoodData Central 168874: Quinoa, uncooked",
    "is_active": true,
    "preparation_state": "kuru"
  },
  {
    "name_tr": "kontrfile",
    "aliases": [
      "dana kontrfile"
    ],
    "kcal_per_100": 171.0,
    "protein_g": 22.2,
    "fat_g": 9.2,
    "carbs_g": 0.0,
    "fiber_g": 0.0,
    "source": "USDA FoodData Central 171751: Beef, loin, top loin steak, boneless, lip off, separable lean and fat, trimmed to 0\" fat, choice, raw",
    "is_active": true,
    "preparation_state": "çiğ, kemiksiz yenilebilir kısım"
  },
  {
    "name_tr": "krem peynir",
    "aliases": [],
    "kcal_per_100": 350,
    "protein_g": 6.2,
    "fat_g": 34.4,
    "carbs_g": 5.5,
    "fiber_g": 0,
    "source": "USDA fdc_id 173418",
    "is_active": true,
    "preparation_state": "tüketime hazır"
  },
  {
    "name_tr": "kuru fasulye",
    "aliases": [],
    "kcal_per_100": 333,
    "protein_g": 23.6,
    "fat_g": 0.8,
    "carbs_g": 60,
    "fiber_g": 24.9,
    "source": "USDA fdc_id 175193",
    "is_active": true,
    "preparation_state": "kuru"
  },
  {
    "name_tr": "kuru soğan",
    "aliases": [],
    "kcal_per_100": 40.0,
    "protein_g": 1.1,
    "fat_g": 0.1,
    "carbs_g": 9.3,
    "fiber_g": 1.7,
    "source": "USDA FoodData Central 170000: Onions, raw",
    "is_active": false,
    "preparation_state": "çiğ / kuru yenilebilir ağırlık",
    "canonical_name": "soğan"
  },
  {
    "name_tr": "kuru üzüm",
    "aliases": [],
    "kcal_per_100": 301,
    "protein_g": 3.3,
    "fat_g": 0.2,
    "carbs_g": 80,
    "fiber_g": 3.3,
    "source": "USDA fdc_id 168164",
    "is_active": true,
    "preparation_state": "yenilebilir ağırlık"
  },
  {
    "name_tr": "kuzu but",
    "aliases": [],
    "kcal_per_100": 230,
    "protein_g": 17.9,
    "fat_g": 17.1,
    "carbs_g": 0,
    "fiber_g": 0,
    "source": "USDA fdc_id 174311",
    "is_active": true,
    "preparation_state": "çiğ, kemiksiz yenilebilir kısım"
  },
  {
    "name_tr": "kırmızı mercimek",
    "aliases": [],
    "kcal_per_100": 358,
    "protein_g": 23.9,
    "fat_g": 2.2,
    "carbs_g": 63.1,
    "fiber_g": 10.8,
    "source": "USDA fdc_id 174284",
    "is_active": true,
    "preparation_state": "kuru"
  },
  {
    "name_tr": "kıyma",
    "aliases": [
      "dana kıyma yüzde 20 yağ",
      "yağlı dana kıyma"
    ],
    "kcal_per_100": 254.0,
    "protein_g": 17.2,
    "fat_g": 20.0,
    "carbs_g": 0.0,
    "fiber_g": 0.0,
    "source": "USDA FoodData Central 174036: Beef, ground, 80% lean meat / 20% fat, raw",
    "is_active": true,
    "preparation_state": "çiğ, %20 yağ"
  },
  {
    "name_tr": "limon",
    "aliases": [],
    "kcal_per_100": 29,
    "protein_g": 1.1,
    "fat_g": 0.3,
    "carbs_g": 9.3,
    "fiber_g": 2.8,
    "source": "USDA fdc_id 167746",
    "is_active": true,
    "preparation_state": "yenilebilir ağırlık"
  },
  {
    "name_tr": "makarna",
    "aliases": [
      "spagetti"
    ],
    "kcal_per_100": 371,
    "protein_g": 13,
    "fat_g": 1.5,
    "carbs_g": 74.7,
    "fiber_g": 3.2,
    "source": "USDA fdc_id 168927",
    "is_active": true,
    "preparation_state": "kuru"
  },
  {
    "name_tr": "mantar",
    "aliases": [
      "kültür mantarı"
    ],
    "kcal_per_100": 22,
    "protein_g": 3.1,
    "fat_g": 0.3,
    "carbs_g": 3.3,
    "fiber_g": 1,
    "source": "USDA fdc_id 169251",
    "is_active": true,
    "preparation_state": "yenilebilir ağırlık"
  },
  {
    "name_tr": "marul",
    "aliases": [
      "iceberg marul"
    ],
    "kcal_per_100": 14,
    "protein_g": 0.9,
    "fat_g": 0.1,
    "carbs_g": 3,
    "fiber_g": 1.2,
    "source": "USDA fdc_id 169248",
    "is_active": true,
    "preparation_state": "yenilebilir ağırlık"
  },
  {
    "name_tr": "muz",
    "aliases": [],
    "kcal_per_100": 89,
    "protein_g": 1.1,
    "fat_g": 0.3,
    "carbs_g": 22.8,
    "fiber_g": 2.6,
    "source": "USDA fdc_id 173944",
    "is_active": true,
    "preparation_state": "yenilebilir ağırlık"
  },
  {
    "name_tr": "mısır",
    "aliases": [
      "kuru mısır"
    ],
    "kcal_per_100": 365.0,
    "protein_g": 9.4,
    "fat_g": 4.7,
    "carbs_g": 74.3,
    "fiber_g": 7.3,
    "source": "USDA FoodData Central 170288: Corn grain, yellow",
    "is_active": true,
    "preparation_state": "kuru"
  },
  {
    "name_tr": "mısır makarnası",
    "aliases": [
      "mısır bazlı makarna"
    ],
    "kcal_per_100": 357.0,
    "protein_g": 7.5,
    "fat_g": 2.1,
    "carbs_g": 79.3,
    "fiber_g": 11.0,
    "source": "USDA FoodData Central 168899: Pasta, gluten-free, corn, dry",
    "preparation_state": "kuru; alerjen ve çapraz temas için ambalajı kontrol et",
    "is_active": true
  },
  {
    "name_tr": "nohut",
    "aliases": [],
    "kcal_per_100": 378,
    "protein_g": 20.5,
    "fat_g": 6,
    "carbs_g": 63,
    "fiber_g": 12.2,
    "source": "USDA fdc_id 173756",
    "is_active": true,
    "preparation_state": "kuru"
  },
  {
    "name_tr": "patates",
    "aliases": [],
    "kcal_per_100": 77,
    "protein_g": 2.1,
    "fat_g": 0.1,
    "carbs_g": 17.5,
    "fiber_g": 2.1,
    "source": "USDA fdc_id 170026",
    "is_active": true,
    "preparation_state": "yenilebilir ağırlık"
  },
  {
    "name_tr": "patlıcan",
    "aliases": [],
    "kcal_per_100": 25,
    "protein_g": 1,
    "fat_g": 0.2,
    "carbs_g": 5.9,
    "fiber_g": 3,
    "source": "USDA fdc_id 169228",
    "is_active": true,
    "preparation_state": "yenilebilir ağırlık"
  },
  {
    "name_tr": "pirinç",
    "aliases": [
      "uzun taneli pirinç",
      "beyaz pirinç"
    ],
    "kcal_per_100": 365,
    "protein_g": 7.1,
    "fat_g": 0.7,
    "carbs_g": 80,
    "fiber_g": 1.3,
    "source": "USDA fdc_id 169756",
    "is_active": true,
    "preparation_state": "kuru"
  },
  {
    "name_tr": "portakal",
    "aliases": [],
    "kcal_per_100": 47,
    "protein_g": 0.9,
    "fat_g": 0.1,
    "carbs_g": 11.8,
    "fiber_g": 2.4,
    "source": "USDA fdc_id 169097",
    "is_active": true,
    "preparation_state": "yenilebilir ağırlık"
  },
  {
    "name_tr": "salam",
    "aliases": [],
    "kcal_per_100": 299,
    "protein_g": 10.9,
    "fat_g": 26.1,
    "carbs_g": 4.3,
    "fiber_g": 0,
    "source": "USDA fdc_id 172012",
    "is_active": true,
    "preparation_state": "tüketime hazır"
  },
  {
    "name_tr": "salatalık",
    "aliases": [
      "hıyar"
    ],
    "kcal_per_100": 15,
    "protein_g": 0.7,
    "fat_g": 0.1,
    "carbs_g": 3.6,
    "fiber_g": 0.5,
    "source": "USDA fdc_id 168409",
    "is_active": true,
    "preparation_state": "yenilebilir ağırlık"
  },
  {
    "name_tr": "sardalya konserve",
    "aliases": [
      "zeytinyağlı sardalya"
    ],
    "kcal_per_100": 213,
    "protein_g": 21.8,
    "fat_g": 13.8,
    "carbs_g": 0.4,
    "fiber_g": 0,
    "source": "Dardanel Çanakkale Sardalya; https://www.dardanel.com.tr/2-lezzetlerimiz/232-canakkale-sardalya/; erişim 2026-10-29",
    "preparation_state": "konserve, yağ dahil",
    "is_active": true
  },
  {
    "name_tr": "sarımsak",
    "aliases": [],
    "kcal_per_100": 149,
    "protein_g": 6.4,
    "fat_g": 0.5,
    "carbs_g": 33.1,
    "fiber_g": 2.1,
    "source": "USDA fdc_id 169230",
    "is_active": true,
    "preparation_state": "yenilebilir ağırlık"
  },
  {
    "name_tr": "siyah zeytin",
    "aliases": [
      "zeytin"
    ],
    "kcal_per_100": 81,
    "protein_g": 1,
    "fat_g": 6.9,
    "carbs_g": 5.6,
    "fiber_g": 2.5,
    "source": "USDA fdc_id 169095",
    "is_active": true,
    "preparation_state": "tüketime hazır"
  },
  {
    "name_tr": "somon",
    "aliases": [
      "somon fileto"
    ],
    "kcal_per_100": 142,
    "protein_g": 19.8,
    "fat_g": 6.3,
    "carbs_g": 0,
    "fiber_g": 0,
    "source": "USDA fdc_id 173686",
    "is_active": true,
    "preparation_state": "çiğ, kemiksiz yenilebilir kısım"
  },
  {
    "name_tr": "somon konserve",
    "aliases": [
      "türk somonu konserve"
    ],
    "kcal_per_100": 305,
    "protein_g": 21.3,
    "fat_g": 24.5,
    "carbs_g": 0,
    "fiber_g": 0,
    "source": "Dardanel Somon; https://www.dardanel.com.tr/2-lezzetlerimiz/246-somon/; erişim 2026-10-29",
    "preparation_state": "konserve, yağ dahil; Türk somonu",
    "is_active": true
  },
  {
    "name_tr": "sosis",
    "aliases": [],
    "kcal_per_100": 322,
    "protein_g": 11.7,
    "fat_g": 29.4,
    "carbs_g": 2.7,
    "fiber_g": 0,
    "source": "USDA fdc_id 174614",
    "is_active": true,
    "preparation_state": "tüketime hazır"
  },
  {
    "name_tr": "soğan",
    "aliases": [
      "kuru soğan"
    ],
    "kcal_per_100": 40,
    "protein_g": 1.1,
    "fat_g": 0.1,
    "carbs_g": 9.3,
    "fiber_g": 1.7,
    "source": "USDA fdc_id 170000",
    "is_active": true,
    "preparation_state": "yenilebilir ağırlık"
  },
  {
    "name_tr": "su",
    "aliases": [
      "içme suyu",
      "damacana su"
    ],
    "kcal_per_100": 0.0,
    "protein_g": 0.0,
    "fat_g": 0.0,
    "carbs_g": 0.0,
    "fiber_g": 0.0,
    "source": "USDA FoodData Central 173647: Beverages, water, tap, drinking",
    "is_active": true,
    "preparation_state": "çiğ / kuru yenilebilir ağırlık"
  },
  {
    "name_tr": "süt",
    "aliases": [
      "tam yağlı süt"
    ],
    "kcal_per_100": 61.0,
    "protein_g": 3.1,
    "fat_g": 3.2,
    "carbs_g": 4.8,
    "fiber_g": 0.0,
    "source": "USDA FoodData Central 171265: Milk, whole, 3.25% milkfat, with added vitamin D",
    "is_active": true,
    "preparation_state": "çiğ / kuru yenilebilir ağırlık"
  },
  {
    "name_tr": "süzme yoğurt",
    "aliases": [
      "süzme yogurt"
    ],
    "kcal_per_100": 102,
    "protein_g": 7.5,
    "fat_g": 5.5,
    "carbs_g": 6.5,
    "fiber_g": 0,
    "source": "Gıdapro süzme yoğurt %5,5 yağ; https://www.gidapro.com/tr/prd/1/suzme-yogurt; erişim 2026-10-29",
    "preparation_state": "hazır, %5,5 yağ; marka etiketiyle karşılaştır",
    "is_active": true
  },
  {
    "name_tr": "tahin",
    "aliases": [],
    "kcal_per_100": 570,
    "protein_g": 17.8,
    "fat_g": 48,
    "carbs_g": 26.2,
    "fiber_g": 9.3,
    "source": "USDA fdc_id 169410",
    "is_active": true,
    "preparation_state": "yenilebilir ağırlık"
  },
  {
    "name_tr": "tam buğday ekmeği",
    "aliases": [
      "tam buğday ekmek"
    ],
    "kcal_per_100": 252,
    "protein_g": 12.5,
    "fat_g": 3.5,
    "carbs_g": 42.7,
    "fiber_g": 6,
    "source": "USDA fdc_id 172688",
    "is_active": true,
    "preparation_state": "tüketime hazır"
  },
  {
    "name_tr": "tam buğday makarna",
    "aliases": [
      "kepekli makarna",
      "tam buğday spagetti"
    ],
    "kcal_per_100": 352.0,
    "protein_g": 13.9,
    "fat_g": 2.9,
    "carbs_g": 73.4,
    "fiber_g": 9.2,
    "source": "USDA FoodData Central 169738: Pasta, whole-wheat, dry (Includes foods for USDA's Food Distribution Program)",
    "preparation_state": "kuru",
    "is_active": true
  },
  {
    "name_tr": "tavuk but (kemikli)",
    "aliases": [
      "tavuk but",
      "kemikli but"
    ],
    "kcal_per_100": 216,
    "protein_g": 16.8,
    "fat_g": 15.7,
    "carbs_g": 0,
    "fiber_g": 0,
    "source": "Kaynak doğrulanmadı; mevcut eski kayıt",
    "is_active": false,
    "preparation_state": "kemikli ağırlık belirsiz; yalnızca eski kayıtlar"
  },
  {
    "name_tr": "tavuk but eti",
    "aliases": [
      "kemiksiz tavuk but",
      "derisiz tavuk but"
    ],
    "kcal_per_100": 121.0,
    "protein_g": 19.7,
    "fat_g": 4.1,
    "carbs_g": 0.0,
    "fiber_g": 0.0,
    "source": "USDA FoodData Central 173627: Chicken, broilers or fryers, dark meat, thigh, meat only, raw",
    "preparation_state": "çiğ, kemiksiz ve derisiz",
    "is_active": true
  },
  {
    "name_tr": "tavuk göğsü",
    "aliases": [],
    "kcal_per_100": 120,
    "protein_g": 22.5,
    "fat_g": 2.6,
    "carbs_g": 0,
    "fiber_g": 0,
    "source": "USDA fdc_id 171077",
    "is_active": true,
    "preparation_state": "çiğ, kemiksiz yenilebilir kısım"
  },
  {
    "name_tr": "tereyağı",
    "aliases": [
      "tuzlu tereyağı"
    ],
    "kcal_per_100": 717,
    "protein_g": 0.9,
    "fat_g": 81.1,
    "carbs_g": 0.1,
    "fiber_g": 0,
    "source": "USDA fdc_id 173410",
    "is_active": true,
    "preparation_state": "yenilebilir ağırlık"
  },
  {
    "name_tr": "ton balığı",
    "aliases": [
      "suda ton balığı",
      "ton balığı suda",
      "light ton balığı"
    ],
    "kcal_per_100": 95,
    "protein_g": 21.4,
    "fat_g": 0.4,
    "carbs_g": 0.8,
    "fiber_g": 0,
    "source": "Dardanel Light Ton / Pınar Light; https://www.dardanel.com.tr/EN/2-lezzetlerimiz/159-ton-baligi/190-light-ton/; erişim 2026-10-29",
    "is_active": true,
    "preparation_state": "konserve; üreticinin 100 g temeli, süzme dönüşümü yok"
  },
  {
    "name_tr": "ton balığı (yağlı)",
    "aliases": [
      "zeytinyağlı ton balığı",
      "yağlı ton balığı"
    ],
    "kcal_per_100": 212,
    "protein_g": 23.5,
    "fat_g": 12.4,
    "carbs_g": 0.1,
    "fiber_g": 0,
    "source": "Dardanel Zeytinyağlı Ton; https://www.dardanel.com.tr/EN/2-lezzetlerimiz/159-ton-baligi/180-zeytinyagli-ton/; erişim 2026-10-29",
    "preparation_state": "konserve, yağ dahil; süzülmüş ürüne uygulanmaz",
    "is_active": true
  },
  {
    "name_tr": "tuz",
    "aliases": [],
    "kcal_per_100": 0,
    "protein_g": 0,
    "fat_g": 0,
    "carbs_g": 0,
    "fiber_g": 0,
    "source": "USDA fdc_id 173468",
    "is_active": true,
    "preparation_state": "yenilebilir ağırlık"
  },
  {
    "name_tr": "un",
    "aliases": [
      "buğday unu"
    ],
    "kcal_per_100": 364,
    "protein_g": 10.3,
    "fat_g": 1,
    "carbs_g": 76.3,
    "fiber_g": 2.7,
    "source": "USDA fdc_id 168894",
    "is_active": true,
    "preparation_state": "kuru"
  },
  {
    "name_tr": "uskumru konserve",
    "aliases": [
      "zeytinyağlı uskumru"
    ],
    "kcal_per_100": 207,
    "protein_g": 22.3,
    "fat_g": 13,
    "carbs_g": 0.2,
    "fiber_g": 0,
    "source": "Dardanel Uskumru; https://www.dardanel.com.tr/2-lezzetlerimiz/244-uskumru/; erişim 2026-10-29",
    "preparation_state": "konserve, yağ dahil",
    "is_active": true
  },
  {
    "name_tr": "yer fıstığı",
    "aliases": [
      "fıstık"
    ],
    "kcal_per_100": 567.0,
    "protein_g": 25.8,
    "fat_g": 49.2,
    "carbs_g": 16.1,
    "fiber_g": 8.5,
    "source": "USDA FoodData Central 172430: Peanuts, all types, raw",
    "is_active": true,
    "preparation_state": "çiğ / kuru yenilebilir ağırlık"
  },
  {
    "name_tr": "yeşil biber",
    "aliases": [
      "sivri biber",
      "çarliston biber"
    ],
    "kcal_per_100": 20,
    "protein_g": 0.9,
    "fat_g": 0.2,
    "carbs_g": 4.6,
    "fiber_g": 1.7,
    "source": "USDA fdc_id 170427",
    "is_active": true,
    "preparation_state": "yenilebilir ağırlık"
  },
  {
    "name_tr": "yoğurt",
    "aliases": [
      "tam yağlı yoğurt"
    ],
    "kcal_per_100": 61,
    "protein_g": 3.5,
    "fat_g": 3.3,
    "carbs_g": 4.7,
    "fiber_g": 0,
    "source": "USDA fdc_id 171284",
    "is_active": true,
    "preparation_state": "tüketime hazır"
  },
  {
    "name_tr": "yulaf ezmesi",
    "aliases": [
      "yulaf"
    ],
    "kcal_per_100": 389.0,
    "protein_g": 16.9,
    "fat_g": 6.9,
    "carbs_g": 66.3,
    "fiber_g": 10.6,
    "source": "USDA FoodData Central 169705: Oats (Includes foods for USDA's Food Distribution Program)",
    "is_active": true,
    "preparation_state": "kuru"
  },
  {
    "name_tr": "yumurta",
    "aliases": [],
    "kcal_per_100": 143,
    "protein_g": 12.6,
    "fat_g": 9.5,
    "carbs_g": 0.7,
    "fiber_g": 0,
    "source": "USDA fdc_id 171287",
    "is_active": true,
    "preparation_state": "yenilebilir ağırlık"
  },
  {
    "name_tr": "zeytinyağı",
    "aliases": [
      "sızma zeytinyağı"
    ],
    "kcal_per_100": 884,
    "protein_g": 0,
    "fat_g": 100,
    "carbs_g": 0,
    "fiber_g": 0,
    "source": "USDA fdc_id 171413",
    "is_active": true,
    "preparation_state": "yenilebilir ağırlık"
  },
  {
    "name_tr": "çay",
    "aliases": [
      "siyah çay"
    ],
    "kcal_per_100": 1,
    "protein_g": 0,
    "fat_g": 0,
    "carbs_g": 0.3,
    "fiber_g": 0,
    "source": "USDA fdc_id 173227",
    "is_active": true,
    "preparation_state": "yenilebilir ağırlık"
  },
  {
    "name_tr": "çilek",
    "aliases": [],
    "kcal_per_100": 32,
    "protein_g": 0.7,
    "fat_g": 0.3,
    "carbs_g": 7.7,
    "fiber_g": 2,
    "source": "USDA fdc_id 167762",
    "is_active": true,
    "preparation_state": "yenilebilir ağırlık"
  },
  {
    "name_tr": "üzüm",
    "aliases": [
      "yaş üzüm"
    ],
    "kcal_per_100": 69,
    "protein_g": 0.7,
    "fat_g": 0.2,
    "carbs_g": 18.1,
    "fiber_g": 0.9,
    "source": "USDA fdc_id 174683",
    "is_active": true,
    "preparation_state": "yenilebilir ağırlık"
  },
  {
    "name_tr": "ıspanak",
    "aliases": [],
    "kcal_per_100": 23,
    "protein_g": 2.9,
    "fat_g": 0.4,
    "carbs_g": 3.6,
    "fiber_g": 2.2,
    "source": "USDA fdc_id 168462",
    "is_active": true,
    "preparation_state": "yenilebilir ağırlık"
  },
  {
    "name_tr": "şeftali",
    "aliases": [],
    "kcal_per_100": 39,
    "protein_g": 0.9,
    "fat_g": 0.3,
    "carbs_g": 9.5,
    "fiber_g": 1.5,
    "source": "USDA fdc_id 169928",
    "is_active": true,
    "preparation_state": "yenilebilir ağırlık"
  },
  {
    "name_tr": "şeker",
    "aliases": [
      "toz şeker"
    ],
    "kcal_per_100": 387,
    "protein_g": 0,
    "fat_g": 0,
    "carbs_g": 100,
    "fiber_g": 0,
    "source": "USDA fdc_id 169655",
    "is_active": true,
    "preparation_state": "yenilebilir ağırlık"
  }
]
$catalog$::jsonb) as r(
    name_tr text, aliases text[], kcal_per_100 numeric, protein_g numeric,
    fat_g numeric, carbs_g numeric, fiber_g numeric, source text,
    preparation_state text, is_active boolean, canonical_name text
  )
  on conflict (name_tr) do update set
    aliases=excluded.aliases, kcal_per_100=excluded.kcal_per_100,
    protein_g=excluded.protein_g,fat_g=excluded.fat_g,carbs_g=excluded.carbs_g,
    fiber_g=excluded.fiber_g,source=excluded.source,preparation_state=excluded.preparation_state,
    is_active=excluded.is_active,canonical_name=excluded.canonical_name;

  -- A retired UUID remains readable. Both members carry the reviewed identity
  -- group so an old food-level allergy/exclusion still blocks the active twin.
  with groups as (
    select coalesce(canonical_name,name_tr) as canonical,
      array_agg(food_id::text) as ids, array_agg(name_tr) as names
    from public.nutrition
    where name_tr in ('ceviz','ceviz içi','soğan','kuru soğan','pirinç','beyaz pirinç')
    group by coalesce(canonical_name,name_tr)
  )
  update public.nutrition n set equivalent_food_ids=g.ids,equivalent_names=g.names
  from groups g where n.name_tr=any(g.names);

  -- Add only known PRESENT allergens, never infer absence for a packaged food.
  -- Existing curator decisions remain intact; classes with no mapping stay UNKNOWN.
  with mapping(name_tr,class) as (values
    ('ton balığı','fish'),('ton balığı (yağlı)','fish'),('sardalya konserve','fish'),
    ('uskumru konserve','fish'),('somon konserve','fish'),('hamsi konserve','fish'),
    ('tam buğday makarna','gluten_cereals'),('süzme yoğurt','milk'),('süt','milk'),
    ('antep fıstığı','tree_nuts'),('ceviz içi','tree_nuts'),('kaju','tree_nuts'),
    ('yer fıstığı','peanuts'),('arpa','gluten_cereals'),('bulgur pilavı','gluten_cereals'),
    ('hardal','mustard')
  )
  update public.nutrition n set allergen_classes =
    coalesce((select jsonb_agg(entry) from jsonb_array_elements(coalesce(n.allergen_classes,'[]'::jsonb)) entry
      where entry->>'class'<>m.class),'[]'::jsonb) ||
    jsonb_build_array(jsonb_build_object('class',m.class,'status','present','source','curated'))
  from mapping m where n.name_tr=m.name_tr;

  insert into app_private.nutrition_polish_20261029_backup(name_tr,before_row)
    values ('__applied__',jsonb_build_object('version',29));
end;
$migration$;
notify pgrst, 'reload schema';
commit;

-- Post-apply check: expected 103 total rows / 98 active on the inspected 92-row catalog.
-- A catalog with additional pre-existing rows legitimately has larger counts.
select count(*) as total, count(*) filter (where is_active) as active from public.nutrition;
select name_tr,canonical_name,equivalent_food_ids from public.nutrition where canonical_name is not null;
