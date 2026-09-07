# Controlled Corpus Extension — The Eighth Source (Culinary / Food Preparation)

**Phase:** 8 (Practical Translation)
**Authorized by:** Gate 6, 2026-09-07 — `DECISIONS/2026-09-07-gate-6-culinary-corpus-extension.md`
**Status:** Steps 1–3 of the Gate 6 twelve-step sequence **COMPLETE**. Steps 4–7 **BLOCKED on source
acquisition** (§7).
**Scope of this document:** selection criteria, the complementarity baseline they are measured against,
candidate assessment, the selection itself, and the formal extension record.

> This document exists as a **separate artifact** because Gate 6 required the eighth source to be
> "recorded explicitly as a controlled practical-translation corpus extension" rather than absorbed
> silently into the Phase 1 corpus accounting. Keeping it separate is what makes the extension auditable.

---

## 1. What Gate 6 Authorized, and What It Did Not

**Authorized:** admit **one** bounded culinary/food-preparation source, to support recipe construction
and preparation as part of the application's practical execution layer.

**Explicitly preserved unchanged:** 7 core nutrition/science books · 213 topics · 112 application
decisions. **No stable ID is renamed, renumbered, merged, or deleted by this extension.** No Phase 1–7
artifact is regenerated. The seven-book corpus is **not** reinterpreted as having been incomplete in
every domain — the extension is confined to the culinary/food-preparation layer, which Phase 8 §4
established by full-text inspection to be genuinely absent.

**Explicitly forbidden (Gate 6 §10):** culinary arts curriculum · professional-chef technique ·
restaurant operations · unrestricted recipe generation · unrestricted food-safety claims · medical
dietary treatment recipes · arbitrary food-processing recommendations.

---

## 2. Step 1 — Selection Criteria

Derived from Gate 6 §1 (the eleven capabilities), §1's complementarity constraint, and §10's exclusions.
Stated as **testable** criteria so the selection can be audited rather than taken on trust.

| # | Criterion | Type |
|---|---|---|
| **C1** | **Substantive reference, not a recipe collection.** Must teach *principles* — why a preparation works — not merely enumerate dishes. Gate 6: *"Do NOT select a generic recipe collection merely because it contains many recipes."* | Disqualifying |
| **C2** | **Covers the eleven capabilities** of Gate 6 §1, or a documented majority of them, with the absent ones named rather than glossed. | Scored |
| **C3** | **Complements rather than duplicates** the existing corpus (§3 is the baseline this is measured against). A text organized around macronutrient *chemistry* largely re-covers HM4/BENDER3 and scores poorly here. | Disqualifying if duplicative |
| **C4** | **Compatible academic register.** Peer-reviewed or established textbook standing, comparable to KM16/SN4 — so that provenance chains (`DEC-107`) remain uniform across the corpus. | Disqualifying |
| **C5** | **Does not import §10's forbidden scope** as its organizing frame. A professional culinary-arts or restaurant-operations text fails here *even if* its capability coverage is excellent. | Disqualifying |
| **C6** | **Written for, or compatible with, a nutrition/dietetics audience** — so preparation knowledge attaches to the existing nutrition decision model instead of sitting beside it. | Scored |
| **C7** | **Addresses nutrient fate during preparation** — the single capability that bridges culinary knowledge back to the nutrition corpus, and the one this project needs most (`DEC-069`). | Scored, high weight |
| **C8** | **One source only.** The extension is bounded at exactly one book. | Structural |

---

## 3. Step 1a — The Complementarity Baseline (what the corpus already has)

C3 and C2 cannot be applied without knowing what the seven books already cover. This baseline was
derived programmatically over the full extracted text of all seven books (the same ~16 MB extraction
used in `PRACTICAL_TRANSLATION_ANALYSIS.md` §4 — **not** re-extracted).

### 3.1 Raw marker counts

| Marker | AS3 | ACSM | HM4 | BENDER3 | NRM | SN4 | KM16 |
|---|---|---|---|---|---|---|---|
| `maillard` | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| `gelatiniz` | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `emulsif` | 5 | 7 | 12 | 5 | 0 | 3 | 12 |
| `leaven` | 0 | 3 | 0 | 3 | 0 | 0 | 2 |
| `blanch` | 7 | 4 | 0 | 1 | 0 | 0 | 18 |
| `braise`/`braising` | 0 | 1 | 0 | 0 | 0 | 0 | 2 |
| `saut` | 3 | 4 | 1 | 0 | 0 | 0 | 9 |
| `shelf life` | 1 | 1 | 0 | 0 | 0 | 4 | 2 |
| `batch cook` | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `nutrient retention` | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `recipe` | 1 | 2 | 0 | 0 | 11 | 0 | 24 |
| `yield` | 2 | 4 | 32 | 120 | 3 | 10 | 10 |

### 3.2 Three markers reverse on inspection — counts alone would have been wrong

Applying the lesson recorded during the Phase 7 domain-boundary correction (*count in context, never
trust an aggregate*), every non-trivial marker was read in context. **Three reverse completely:**

- **`emulsif` (44 hits) → ~0 culinary.** Every sampled hit is **physiological**: bile-salt emulsification
  of dietary fat, pancreatic lipase hydrolysis, lecithin as a bile-phase surfactant. The one non-
  physiological hit is Intralipid, a *parenteral nutrition* product. The corpus does not discuss forming
  or stabilizing a culinary emulsion.
- **`yield` (181 hits) → ~0 culinary.** Dominated by BENDER3/HM4's **metabolic energy yield** (ATP per
  gram, energy yield of fat vs carbohydrate, decarboxylation yielding an amine). Not recipe yield, and
  therefore **no support for scaling** (capability 6).
- **`blanch` (30 hits) → ~0 culinary.** KM16's hits are **clinical**: non-blanchable erythema in pressure-
  injury staging, and nail-blanching as the reference pressure in IDDSI texture testing.

Had these three been counted rather than read, the corpus would have appeared to cover emulsification,
scaling, and a core vegetable-cookery technique. **It covers none of them.**

### 3.3 One marker reverses the other way — and it bounds the extension

An initial sample of KM16's 74 `food safety` hits suggested a purely policy-level register (FDA CFSAN,
USDA FSIS, DGA guidance, dietetics practice areas) with no preparation-level instruction. **A targeted
re-check refuted that:**

| Preparation-safety marker | KM16 | ACSM | All 7 |
|---|---|---|---|
| `internal temperature` | 0 | 10 | 11 |
| `safe minimum` | 0 | 6 | 6 |
| `danger zone` | 2 | 0 | 2 |
| `refrigerat` | 31 | 2 | 35 |
| `reheat` | 8 | 1 | 11 |
| `40°F`/`140°F` | 7 | 0 | 9 |
| `leftover` | 4 | 1 | 5 |
| `thaw` | 1 | 0 | 5 |

**Operational food-safety content is thin but genuinely present**, concentrated in ACSM (safe minimum
internal temperatures) and KM16 (refrigeration, reheating, the 40–140°F danger zone). Recorded here
because it **bounds** the extension: capabilities 8 and 9 are *supplemented*, not *supplied*, by the
eighth source, and where the existing corpus speaks on food safety it remains authoritative.

### 3.4 Capability-by-capability verdict

| # | Gate 6 capability | Seven-book corpus | Extension role |
|---|---|---|---|
| 1 | Recipe construction/formulation | **Absent** | Supply |
| 2 | Ingredient functionality | **Absent** (culinary sense — §3.2) | Supply |
| 3 | Cooking methods | **Absent as instruction** (§4.3: 3 hits, all nutrient-fate observation) | Supply |
| 4 | Preparation constraints | **Absent** | Supply |
| 5 | Substitutions | **Example-level only** (§4.4) | Generalize — *carefully* |
| 6 | Scaling | **Absent** (§3.2) | Supply |
| 7 | Batch preparation | **Absent** (0 hits) | Supply |
| 8 | Storage | **Thin but present** | **Supplement only** |
| 9 | Food safety (prep/storage) | **Thin but present** (§3.3) | **Supplement only** |
| 10 | Nutrient retention/fate | **Very thin** (phrase absent; 4 substantive hits corpus-wide) | Supply — highest value (C7) |
| 11 | Texture/quality consequences | **Example-level only** (GF texture caveat; IDDSI in clinical register) | Generalize — *carefully* |

**Six of eleven capabilities absent, two example-level, two thin-but-present, one very thin.** C3
(complementarity) is satisfiable: a preparation-oriented text overlaps the existing corpus in at most
two capabilities, and in those two it is explicitly subordinate.

---

## 4. Step 2 — Candidate Assessment and Selection

Four candidates were assessed. Tables of contents were **verified against publisher/catalogue sources**
rather than recalled, because selecting a source on a remembered table of contents is precisely the
failure mode this project's validation discipline exists to prevent.

| Candidate | C1 | C3 complementarity | C5 §10 scope | C7 nutrient fate | Verdict |
|---|---|---|---|---|---|
| **Brown, *Understanding Food: Principles and Preparation*** (Cengage, 7th ed. 2024) | Pass — principles-organized | **Strong** — organized by preparation, not by macronutrient chemistry | Pass — not culinary-arts framed | Strong — nutrient fate runs through the ingredient chapters | **SELECTED** |
| Vaclavik, Christian & Campbell, *Essentials of Food Science* (Springer, 5th ed.) | Pass | **Weak** — chapters are "Carbohydrates in Food," "Proteins in Food," "Fats in Food"; substantially re-covers HM4/BENDER3 | Pass | Moderate | Rejected on **C3** |
| McGee, *On Food and Cooking* (2nd ed.) | Pass — the canonical mechanism reference | Strong | Pass | Weak — mechanism-focused, not retention-focused | Rejected on **C2/C7** — no scaling, batch, or systematic food-safety layer |
| CIA, *The Professional Chef* | Pass | Strong | **FAIL** — professional-chef technique and restaurant operations are named exclusions | — | **Disqualified on C5** despite strong capability coverage |

### 4.1 The selection

> **Brown, Amy C. — *Understanding Food: Principles and Preparation*, Cengage Learning.
> 7th edition (2024), ISBN 9780357974148.** Any edition from the 4th onward is acceptable; the edition
> actually admitted must be recorded in §5 at acquisition time.

**Why it satisfies the criteria** — assessed against its verified table of contents:

- **C1/C2.** Thirty chapters in four parts. Part I *Food Science and Nutrition* (Food Selection; Food
  Evaluation; Chemistry of Food Composition) supplies capability 11 (texture/quality) via a dedicated
  sensory-evaluation chapter. Part II *Food Service* (Food Safety; Meal Management; Food Preparation
  Basics) supplies capabilities 1, 4, 6, 7 and supplements 9. Chapters 7–27 supply capabilities 2, 3, 5
  and 10 ingredient class by ingredient class. Part IV (Food Preservation; Government Food Regulations)
  supplies capability 8.
- **C3.** Organized by **preparation and food class**, not by macronutrient chemistry — the axis on which
  Vaclavik duplicates HM4/BENDER3. Overlap with the existing corpus is confined to capabilities 8 and 9,
  where §3.4 already subordinates it.
- **C5.** Publisher framing is "food, food science, food safety, food preparation and food service" for a
  nutrition/dietetics audience — not culinary arts, not restaurant operations.
- **C6.** Explicitly "integrates nutrition and food industry information." It is the standard
  food-preparation companion to a nutrition curriculum, which is exactly the bridge `DEC-067`–`069` need,
  and it sits in the same academic register as KM16 (C4).
- **C7.** Nutrient retention is treated where it actually occurs — within the vegetable, fruit, meat and
  grain preparation chapters — rather than as an isolated topic. This is the capability the existing
  corpus most conspicuously lacks (phrase count: **zero** across all seven books).

**What it will not fully supply, named rather than glossed (C2):** *batch preparation* (capability 7) is
covered only indirectly, through Meal Management rather than as quantity food production — the texts that
cover it properly (e.g. *Food for Fifty*) are quantity-production/operations texts excluded by C5. If
`DEC-068` turns out to require true batch-production knowledge, that is a **new scope decision and a new
gate**, per Gate 6 §10 — it must not be resolved by quietly admitting a ninth source.

---

## 5. Step 3 — The Controlled Extension Record

**Corpus status after this extension:**

```
CORE NUTRITION/SCIENCE CORPUS (Phase 1 baseline — UNCHANGED)
  01  AS3      Advanced Sports Nutrition 3e
  02  ACSM     ACSM's Nutrition for Exercise Science
  03  HM4      Human Metabolism: A Regulatory Perspective 4e
  04  BENDER3  Introduction to Nutrition and Metabolism 3e
  05  NRM      Nutrition Research Methodologies
  06  SN4      Sport Nutrition 4e
  07  KM16     Krause & Mahan's Food and the Nutrition Care Process 16e
      → 213 topics, 112 application decisions. NOT regenerated. NOT renumbered.

PRACTICAL-TRANSLATION CORPUS EXTENSION (Gate 6, 2026-09-07 — bounded)
  08  BROWN    Understanding Food: Principles and Preparation
      → scope: culinary/food-preparation knowledge ONLY
      → admitted to serve: DEC-067, DEC-068, DEC-069 (+ directly dependent
        practical-translation relationships identified AFTER inspection)
      → subordinate to the core corpus on capabilities 8 (storage) and 9 (food safety)
      → NOT a source of nutrition-science claims, targets, thresholds, or clinical guidance
```

**Binding rules attached to source 08:**

1. **It does not create nutrition-science claims.** Where BROWN and the core corpus touch the same
   question (storage, food safety), the core corpus governs. BROWN may add operational detail; it may not
   contradict, and it may not be used to revise any Phase 1–7 nutrition specification.
2. **It does not expand the topic universe.** The 213 topic IDs are fixed. If mapping requires a
   culinary knowledge unit, it is recorded in Phase 8's layer with its own identifier space — never by
   inserting into `MASTER_TOPIC_UNIVERSE.md`.
3. **It does not create new decisions.** Gate 6: *"Do not manufacture new decisions merely to justify the
   new source."* Only `DEC-067`–`069` and post-inspection dependents may be mapped to it.
4. **It does not license §10's exclusions**, regardless of what its chapters happen to contain. Chapters
   on candy, frozen desserts and beverages exist in the book; they are **not** thereby in scope.
5. **Prior phases keep their accounting.** Every "213 topics from 7 books" statement in Phases 1–7 stays
   true as written and is **not** retroactively edited. This document is the sole record of the change.

**Edition admitted:** *to be recorded at acquisition.* Selection is edition-independent from the 4th
edition onward; the verified table of contents above is the 7th (2024).

---

## 6. What Changes for `DEC-067`–`069` — and What Does Not Change Yet

| Decision | Phase 7 status | Status now | Status after inspection |
|---|---|---|---|
| `DEC-067` (recipe detail level) | `BLOCKED (GAP-A)` | **Corpus-extension work — pending inspection** | Specifiable |
| `DEC-068` (preparation constraints) | `BLOCKED (GAP-A)` | **Corpus-extension work — pending inspection** | Specifiable, *except* any true batch-production requirement (§4.1) |
| `DEC-069` (batch cooking / storage) | `BLOCKED (GAP-A)` | **Corpus-extension work — pending inspection** | Partially specifiable; storage/food-safety portions remain governed by the core corpus |

**These are not yet specified, and this document does not specify them.** Gate 6 was explicit: *"Do not
pretend the knowledge existed in the original seven-book corpus."* The reclassification from `GAP-A` is
**contingent on the extension actually completing**, not on the decision permitting it. Until the source
is inspected, the honest status is *"blocked, with an authorized and identified route out"* — which is a
materially different thing from *"resolved."*

---

## 7. Step 4 Is Blocked — Source Acquisition Required

**Steps 1–3 are complete. Steps 4–7 cannot proceed.** `01_SOURCE_BOOKS/` contains exactly seven
directories; the selected source is not present, and I cannot acquire it.

**To unblock, place the file at:**

```
nutrition-curriculum/01_SOURCE_BOOKS/08_Understanding_Food_Principles_and_Preparation/
```

A PDF or EPUB is equally usable — the extraction tooling handles both (`pdftotext` for PDF; `unzip` plus
tag-strip for EPUB). The directory is git-ignored, consistent with the existing seven.

**This is an execution dependency, not a new decision, and not a new gate.** Gate 6 authorized the
selection and I have made it; nothing about the architecture is waiting on a human judgment. When the
file appears, steps 4–7 proceed without further authorization:

4. Inspect the source (targeted extraction against the eleven capabilities, method as in §4 of the
   analysis).
5. Map only the necessary knowledge to `DEC-067`–`069`.
6. Distinguish construction · modification · preparation · batch · storage · food safety · retention.
7. Update `PRACTICAL_TRANSLATION_ANALYSIS.md`.

**If the source cannot be obtained**, that is itself a consequential outcome and returns to a gate — it
would mean Option A is unexecutable and the reviewer's rejection of Options B and C needs revisiting.
It must not be resolved by silently falling back to Option C.

---

## 8. Validation

- **Selection criteria precede selection.** §2 was derived from Gate 6's text before candidates were
  assessed, not reverse-engineered to fit the chosen book.
- **Tables of contents were verified against publisher/catalogue sources**, not recalled. Brown's is the
  Cengage title page for ISBN 9780357974148; Vaclavik's is the Google Books record for the Springer 5th
  edition (partial listing — sufficient to establish its macronutrient-chemistry organizing axis, which
  is the only fact C3 turns on).
- **The complementarity baseline (§3) is programmatic**, over the same extraction already used in §4 of
  the analysis. No book was re-extracted; no earlier finding was re-derived.
- **Every non-trivial marker was read in context** — which reversed three markers (§3.2) and, in the
  other direction, refuted an over-claim of mine about food-safety absence (§3.3). Both directions are
  recorded, because recording only the corrections that flatter the conclusion would defeat the purpose.
- **No stable ID altered.** 213 topics, 112 decisions, all `DEC` numbering intact.
- **No Phase 1–6 artifact modified** by this document.
- **No decision specified.** `DEC-067`–`069` are reclassified as to *route*, not resolved as to *content*
  (§6).
- **No production code, schema, UI, or executable algorithm** — the §28 Phase-9 boundary holds.
- **`DEC-099`/`DEC-100` untouched**, and the culinary decision was not used to approach clinical scope.

---

## 9. Self-Audit (per `PROJECT_AI_PROTOCOL.md` §19 Step 6)

- **What could be wrong.** The selection rests on a **table of contents, not on the book's actual text.**
  A TOC establishes that chapters exist, not that their treatment is deep enough for `DEC-067`–`069`.
  This is the same TOC-versus-content distinction that Phase 8 §4 was created to resolve for the original
  corpus — and I am now, unavoidably, on the weaker side of it. Step 4 exists precisely to close this,
  and **the selection should be treated as provisional until inspection confirms depth.** If inspection
  finds the treatment too shallow, the correct response is to report that and return to the gate, not to
  make the book work.
- **What was assumed.** That "select the source" (Gate 6 §9 step 2) means *identify and justify a
  specific title*, not *obtain the file*. If the reviewer meant acquisition, §7 is the blocker and no
  interpretation of mine removes it.
- **What could be over-claimed.** §3.4's "six of eleven absent" is built from marker searches, and
  markers have blind spots — the same limitation §8 of the analysis records for the original inspection.
  The claim is well-supported for the markers chosen and corroborated by Phase 1's independent TOC-level
  finding, but it is not a page-by-page proof.
- **A judgment worth flagging.** Disqualifying *The Professional Chef* on C5 while selecting a book that
  also contains dessert and candy chapters could look inconsistent. The distinction I drew is
  **organizing frame, not incidental content**: Gate 6 §10 excludes professional-chef technique and
  restaurant operations as a *scope*, and rule 4 in §5 confirms that BROWN's own out-of-scope chapters
  gain nothing by being bound into an admitted book. A reviewer could reasonably want that line drawn
  differently.
- **What was silently resolved:** nothing. The selection was explicitly authorized by Gate 6 §9 step 2.
  The acquisition blocker is reported, not worked around. No decision content was specified.
- **What changed from Phase 1–7:** nothing in any prior artifact. One new document; one authorized,
  bounded, separately-recorded corpus extension.
