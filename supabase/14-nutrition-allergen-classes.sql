-- supabase/14-nutrition-allergen-classes.sql
-- Adds Türkiye/EU 14 allergen-class relationships to the nutrition table
-- (B3, following up on the type-level-only foundation from the previous
-- milestone) and seeds high-confidence mappings for this catalog's foods.
--
-- Each element of allergen_classes:
--   { "class": one of the 14 canonical IDs (gluten_cereals|crustaceans|
--       eggs|fish|peanuts|soybeans|milk|tree_nuts|celery|mustard|sesame|
--       sulphites|lupin|molluscs),
--     "status": "present" | "confirmed_absent",
--     "source": "regulatory" | "curated" }
--
-- A class ABSENT from a food's array is UNKNOWN for that class, never
-- inferred as confirmed_absent — see src/lib/allergenClasses.ts. A food
-- with no array at all (default '[]') is UNKNOWN for all 14.
--
-- Seed scope (Phase 9 B3 follow-up mapping strategy, tiered):
--   Tier 1 — regulatory: the food IS a directly-named regulatory example
--     (e.g. "almond" is named as a tree nut in Annex II / the Turkish
--     Codex list) — no inference step. Includes exactly one
--     confirmed_absent entry (pirinç / rice is not one of the named
--     gluten cereals or their hybrids) to prove the tri-state model is
--     real, not just declared.
--   Tier 2/3 — curated: Grocery's own high-confidence compositional
--     inference (e.g. "beyaz ekmek" is wheat bread) — not a literal
--     reading of the regulatory text, but not speculative either.
--   Tier 4 — everything else in the catalog stays UNKNOWN. Deliberately
--     NOT populated with confirmed_absent for anything not listed here —
--     asserting an absence is itself a safety claim this migration does
--     not make casually (processed/composite foods — sausage, salami,
--     dark chocolate — are conspicuously excluded for exactly this
--     reason: real products vary by brand).
--
-- Idempotent: the `where allergen_classes = '[]'::jsonb` guard means a food
-- already seeded (or later hand-curated with a real value) is never
-- overwritten by re-running this file.

alter table public.nutrition
  add column if not exists allergen_classes jsonb not null default '[]';

-- Tier 1 — regulatory (food name IS the regulation's own named example)
update public.nutrition set allergen_classes =
  '[{"class":"tree_nuts","status":"present","source":"regulatory"}]'::jsonb
where name_tr = 'badem' and allergen_classes = '[]'::jsonb;

update public.nutrition set allergen_classes =
  '[{"class":"tree_nuts","status":"present","source":"regulatory"}]'::jsonb
where name_tr = 'ceviz' and allergen_classes = '[]'::jsonb;

update public.nutrition set allergen_classes =
  '[{"class":"tree_nuts","status":"present","source":"regulatory"}]'::jsonb
where name_tr = 'fındık' and allergen_classes = '[]'::jsonb;

update public.nutrition set allergen_classes =
  '[{"class":"eggs","status":"present","source":"regulatory"}]'::jsonb
where name_tr = 'yumurta' and allergen_classes = '[]'::jsonb;

update public.nutrition set allergen_classes =
  '[{"class":"crustaceans","status":"present","source":"regulatory"}]'::jsonb
where name_tr = 'karides' and allergen_classes = '[]'::jsonb;

update public.nutrition set allergen_classes =
  '[{"class":"fish","status":"present","source":"regulatory"}]'::jsonb
where name_tr = 'somon' and allergen_classes = '[]'::jsonb;

update public.nutrition set allergen_classes =
  '[{"class":"sesame","status":"present","source":"regulatory"}]'::jsonb
where name_tr = 'tahin' and allergen_classes = '[]'::jsonb;

-- Rice (Oryza sativa) is not wheat/rye/barley/oats/spelt/kamut or a hybrid
-- of them — the only confirmed_absent seed in this migration, deliberately
-- kept to exactly one: this is a whole-food-identity fact traceable
-- directly to the regulatory definition (Tier 1), not a claim about any
-- particular product's cross-contact/facility risk.
update public.nutrition set allergen_classes =
  '[{"class":"gluten_cereals","status":"confirmed_absent","source":"regulatory"}]'::jsonb
where name_tr = 'pirinç' and allergen_classes = '[]'::jsonb;

-- Tier 2/3 — curated (Grocery's own high-confidence compositional inference)
update public.nutrition set allergen_classes =
  '[{"class":"milk","status":"present","source":"curated"}]'::jsonb
where name_tr = 'tereyağı' and allergen_classes = '[]'::jsonb;

update public.nutrition set allergen_classes =
  '[{"class":"milk","status":"present","source":"curated"}]'::jsonb
where name_tr = 'yoğurt' and allergen_classes = '[]'::jsonb;

update public.nutrition set allergen_classes =
  '[{"class":"milk","status":"present","source":"curated"}]'::jsonb
where name_tr = 'beyaz peynir' and allergen_classes = '[]'::jsonb;

update public.nutrition set allergen_classes =
  '[{"class":"milk","status":"present","source":"curated"}]'::jsonb
where name_tr = 'kaşar peyniri' and allergen_classes = '[]'::jsonb;

update public.nutrition set allergen_classes =
  '[{"class":"milk","status":"present","source":"curated"}]'::jsonb
where name_tr = 'eski kaşar' and allergen_classes = '[]'::jsonb;

update public.nutrition set allergen_classes =
  '[{"class":"milk","status":"present","source":"curated"}]'::jsonb
where name_tr = 'krem peynir' and allergen_classes = '[]'::jsonb;

update public.nutrition set allergen_classes =
  '[{"class":"gluten_cereals","status":"present","source":"curated"}]'::jsonb
where name_tr = 'un' and allergen_classes = '[]'::jsonb;

update public.nutrition set allergen_classes =
  '[{"class":"gluten_cereals","status":"present","source":"curated"}]'::jsonb
where name_tr = 'beyaz ekmek' and allergen_classes = '[]'::jsonb;

update public.nutrition set allergen_classes =
  '[{"class":"gluten_cereals","status":"present","source":"curated"}]'::jsonb
where name_tr = 'tam buğday ekmeği' and allergen_classes = '[]'::jsonb;

update public.nutrition set allergen_classes =
  '[{"class":"gluten_cereals","status":"present","source":"curated"}]'::jsonb
where name_tr = 'bulgur' and allergen_classes = '[]'::jsonb;

update public.nutrition set allergen_classes =
  '[{"class":"gluten_cereals","status":"present","source":"curated"}]'::jsonb
where name_tr = 'makarna' and allergen_classes = '[]'::jsonb;
