# Evidence & Content-Inspection Register — Phase 5

**Phase:** Phase 5 — Evidence & Knowledge Expansion (`PROJECT_AI_PROTOCOL.md` §13)
**Question:** Where does the existing 7-book corpus stop being sufficient?
**Method:** source-book content inspection (reading the actual books, not just their TOCs) against the
worklist Phase 3/4 already isolated, **plus** targeted external web research for the items that
genuinely require current literature beyond the 7-book corpus (§3.9–§3.11) — added in this document's
second working session, per explicit authorization that web research is an ordinary Phase 5 workflow
step where current evidence is required. Both kinds of finding are clearly labeled by source throughout,
and evidence findings are kept strictly separate from any product/decision implication (§1 point 4).
**Built on (read-only, not modified):** `APP_DECISION_GAPS.md` §17 (Content Inspection Priorities) and
§18 (Current Evidence Priorities) — reused verbatim as the starting worklist, not re-derived;
`KNOWLEDGE_DECISION_DEPTH_MAP.md` and `DECISION_KNOWLEDGE_READINESS.md` (Phase 4) for which
`CONDITIONAL`-tiered topics and `GATED` decisions this work should target first.
**Gate 2 constraints applied here:** the three flagged bookkeeping discrepancies are deferred, not
touched. `DEC-099`/`DEC-100` are not resolved and are out of this document's scope (per instruction).

---

## 1. Purpose and Scope

`PROJECT_AI_PROTOCOL.md` §13 lists several methods Phase 5 may use: source-book content inspection,
current scientific literature, guidelines, consensus statements, systematic reviews, evidence
methodology, practical nutrition sources. This document uses the first of these — **actual source-book
content inspection**, not TOC-level inference — against the exact worklist `APP_DECISION_GAPS.md` §17/
§18 already prioritized. Three things follow from this scoping choice, stated explicitly:

1. **This is not "no web research forever"** — it is this artifact's own bounded first pass. Phase 1–4
   consistently avoided external research because their own scope (curriculum taxonomy, decision
   inventory, knowledge mapping) never required it. Phase 5 is the first phase whose stated purpose is
   exactly this kind of evidence work, and later Phase 5 artifacts may reasonably use external sources —
   that is an ordinary Phase 5 workflow choice, not a Review Gate question, per explicit instruction.
2. **A book can itself BE "current evidence."** Two of the seven books are recent (`SN4`, Sport
   Nutrition 4th ed., 2024; `KM16`, Krause and Mahan 16th ed., 2022) and cite peer-reviewed literature
   through 2023. Where a question's answer is already stated, sourced, and dated inside one of these
   books, that *is* a current-evidence answer — re-fetching the same finding from the open web would add
   nothing. Where a question needs literature the corpus cannot possibly contain (e.g. GLP-1 receptor
   agonist protocols, continuous glucose monitoring guidance — both moving fast enough that even a
   2022–2024 textbook can lag), that is flagged as still requiring external research, not answered here.
3. **Established vs. emerging evidence is preserved** (`PROJECT_AI_PROTOCOL.md` §5): every finding below
   is dated to its source and stated as "the current position as of [book/citation year]," never as a
   permanent fact. None is converted into a threshold, rule, or algorithm (§25 step 7; §28).
4. **A scientific-evidence finding is not a product/architectural decision, and this document never
   conflates the two.** Where a finding has an obvious downstream implication (e.g. "the evidence does
   not support X" suggesting "therefore the application should not build X"), that implication is stated
   as a separate, explicitly-labeled note — never folded into the finding itself, and never applied to
   any Phase 3/4 document without the separate authorization `PROJECT_AI_PROTOCOL.md` §36 requires. This
   applies throughout, and is called out again explicitly at `SPORT-11` (§3.3) given its two-part nature.

---

## 2. Method

For each Priority 1/2 item in `APP_DECISION_GAPS.md` §17, and each item in §18's evidence-priority list,
this document records: the exact question, the source consulted, what was found, and the resulting
verdict (`CONFIRMED ADEQUATE` / `CONFIRMED THIN` / `CONFIRMED GAP` / `NOT YET INSPECTED`). Tooling used:
`pdftotext` (PDF source books) and `unzip` + tag-stripping (EPUB source books) to extract real page/
chapter text — not the TOC extraction files, which Phase 1 explicitly built to avoid claiming depth
they couldn't verify. Page offsets between each book's printed numbering and its PDF's absolute page
count were calibrated per-book by checking a footer page number against a known reference before
extracting the target range (recorded per finding below, so the extraction is reproducible).

---

## 3. Findings — Content Inspection (Completed This Pass)

### 3.1 `BODY-01`'s appetite/satiety subsection (feeds `DEC-058`) — **CONFIRMED ADEQUATE**

**Question** (`APP_DECISION_GAPS.md` §17 Priority 1): is HM4's "Energy Intake" content deep enough to
move `DEC-058` from `MAPPING UNCERTAIN` toward `COVERED`?

**Source consulted:** `Human Metabolism: A Regulatory Perspective, 4e` (Frayn & Evans), §11.2.1 "Energy
intake" and Box 11.1 "Regulation of energy intake" (printed pp. 327–329; PDF absolute pages ~340–342,
offset +13 calibrated against the Chapter 10 footer at PDF page 320 = printed p. 307).

**What was found:** a substantive, well-organized treatment of the neuroendocrine appetite-regulation
system — long-term signals (leptin, insulin) and short-term signals (ghrelin, GLP-1, CCK,
apolipoprotein AIV) converging on hypothalamic pathways (NPY as the hunger signal; POMC/MSH/MC4R as the
satiety pathway); the endocannabinoid system; a dedicated summary figure (Fig. 11.1.1); real-world
grounding via leptin-deficiency case data (Fig. 11.2) and single-gene obesity mutations (MC4R). This is
comparable in depth to other MET-domain physiological content already tiered `FULL`/`WORKING` elsewhere
in this project (e.g. `MET-05`'s hormonal-coordination treatment) — not the "thin subsection" its mere
absence from the book's own chapter/section-level TOC bookmarks implied.

**Verdict:** `CONFIRMED ADEQUATE`. `DEC-058`'s `MAPPING UNCERTAIN` flag (`APP_DECISION_KNOWLEDGE_
MAPPING.md` §16, §6 row 058; `APP_DECISION_GAPS.md` §6) was based on a TOC-level absence-of-a-named-
topic, not on the actual page content — content inspection resolves that specific uncertainty. **Not
applied to Phase 3's documents in this pass** (see §5 — flagged as a recommendation only).

### 3.2 `NUT-03`'s Exchange List content (feeds `DEC-060`/`062`, the Portion/Quantity translation layer) — **CONFIRMED SUBSTANTIVE, STRONGER THAN PREVIOUSLY CHARACTERIZED**

**Question** (`APP_DECISION_GAPS.md` §17 Priority 2): does KM16 Appendix 18 provide only a "genuine, if
thin" portioning-methodology precedent (as `APP_DECISION_GAPS.md` §9 characterized it), or something
more substantial?

**Source consulted:** `Krause and Mahan's Food and the Nutrition Care Process, 16e`, Appendix 18
"Exchange Lists and Carbohydrate Counting for Meal Planning" (printed pp. 1120–1122+; PDF absolute pages
~1128–1135, offset +8 calibrated against Appendix 21's footer at PDF page 1150 = printed p. 1142).

**What was found:** a genuinely structured food-exchange system, not a thin lookup table — food
categories (nonstarchy vegetables, lean/medium/high-fat meat and meat substitutes, etc.) each with
explicit per-exchange macronutrient gram values, concrete household-measure portion guidance ("a 1-cup
portion of broccoli is about the size of a regular light bulb"), and practical selection/substitution
tips (e.g. converting a breaded-meat carbohydrate contribution into an exchange). This is a real,
usable nutrient-to-food-and-portion translation methodology, materially more developed than "thin
precedent" suggests.

**Verdict:** `CONFIRMED SUBSTANTIVE`. This does not close the Practical Translation Gap (`APP_DECISION_
GAPS.md` §9/§14 remain correct that recipe/preparation and shopping-logistics content is absent — this
appendix is about portioning within a known meal, not meal construction or preparation) — but it does
suggest the Portion/Quantity link specifically may deserve a higher confidence/coverage rating than
"the gap is entirely the scope decision" framing implies. See §3.3 for a second, independent source
that reinforces this.

### 3.3 `SPORT-11` (Personalized/Precision Sport Nutrition, feeds `DEC-098`) — **THREE findings, all `CONFIRMED`**

**Source consulted:** `Sport Nutrition, 4e` (Jeukendrup & Gleeson, 2024), Chapter 17 "Personalized
Nutrition" — the entire chapter (extracted via EPUB unzip + tag-stripping, `chapter17.xhtml`, ~700
lines of running text).

**Finding A — Genetic/nutrigenomic personalization: current-evidence verdict, not a gap.** The chapter
states directly (its own words, 2024 publication): athlete-specific genetic testing for performance
"virtually no studies," nutrigenomics "studies in this area are very limited," and offers exactly **one**
confirmed exception — caffeine sensitivity, mediated by the `CYP1A2` (metabolism rate) and `ADORA2A`
(sensitivity) genes. Every other proposed genetic-personalization angle (e.g. carbohydrate-feeding
response) is explicitly called "pure speculation" by the book itself.
**Verdict:** `CONFIRMED THIN — BY THE SOURCE'S OWN CURRENT (2024) ASSESSMENT`, not merely by this
project's own Phase 1 currency flag. This is itself the current-evidence answer Phase 1/3 asked for —
`SPORT-11`'s `current-evidence-primary` flag and `CONDITIONAL` Phase 4 tier are confirmed correct, and
now have a dated, sourced justification rather than an unverified caveat.

**Finding B — Menstrual-cycle-phase nutrition/training tailoring: a direct, current, negative finding.**
The chapter's own "Menstrual Cycle and Nutrition" section states: "there is no solid physiological basis
to make such recommendations, nor is there any scientific evidence on which such recommendations could
be based," citing a systematic review (Colenso-Semple et al. 2023) whose stated conclusion is that "it is
premature to conclude that short-term fluctuations in reproductive hormones appreciably influence acute
exercise performance or longer-term strength or hypertrophic adaptations to resistance exercise
training."
**Evidence finding (scientific, this document's actual claim):** as of 2023–2024, the peer-reviewed
literature does not support a claim that short-term menstrual-cycle-phase fluctuations meaningfully
affect acute exercise performance or resistance-training adaptation. This is `CONFIRMED — CURRENT
EVIDENCE SAYS NO`, a resolved status distinct from `MAPPING UNCERTAIN` — the uncertainty was *whether
the evidence exists*, and it is now known that it does not, which is itself a completed finding, not an
open question.

**Product/decision implication (separate note, explicitly not applied here):** *if* this application
were to decide how to handle cycle-phase-related requests, one reasonable implication of the evidence
finding above is that building menstrual-cycle-phase-tailored nutrition/training logic would mean
asserting a claim the current evidence does not support. That is a product/architectural decision about
what the application should or shouldn't build — it belongs to a future phase (Phase 7 decision-engine
specification at the earliest, per `PROJECT_AI_PROTOCOL.md` §15/§28's premature-implementation rule) and
is not made here. This document records the evidence finding only.

**Finding C — Bonus: direct food-translation content relevant to the Practical Translation Gap.** The
chapter's own "Turning Nutrient Recommendations Into Foods" section (Table 17.1: foods providing 20g of
protein, with portion sizes and energy/leucine content; Table 17.2: leucine/BCAA content by protein
source; Figure 17.2: common foods containing 30g of carbohydrate) is a second, independent, food-
composition-to-portion translation precedent — reinforcing §3.2's finding that this specific translation
link (nutrient target → food amount) is better-supported across the corpus than "thin, single precedent"
suggested. The same chapter's periodized-nutrition content (train-high/train-low/train-the-gut
methodology) is a further layer of practical, decision-adjacent content not previously surfaced at this
depth in Phase 1–4's TOC-level treatment of `SPORT-06`/`SPORT-13`.

### 3.4 `GI-03` (Gut Microbiome and Gastrointestinal Health, feeds `DEC-051`/`054`) — **COMPLETE: CONFIRMED ADEQUATELY COVERED OVERALL, WITH ONE NEW SOURCING-CITATION ERROR FOUND**

**Question** (`APP_DECISION_GAPS.md` §17 Priority 1; `TOPIC_LEARNING_LEVELS.md`'s own still-open Phase 1
deferral): is `GI-03`'s TOC-level characterization as "thin-everywhere-developed-nowhere across 3 books"
accurate?

**Source 1 — `Sport Nutrition, 4e`, Chapter 5, "Gut Microbiota" section** (full section, EPUB
extraction): a genuinely developed treatment — microbiota/microbiome definitions and regional GI
distribution (with a data table of viable-bacteria-per-gram by GI region); the five dominant bacterial
phyla; short-chain-fatty-acid production and its role in energy harvest, immune modulation, and
inflammation; a named "Important Functions of the Gut Microbiota" summary; a dedicated "Maintaining Gut
Health" section with athlete-specific practical guidance; and a substantial, currently-sourced (citations
through 2022–2023) treatment of probiotics, prebiotics, and polyphenols, including an honest account of
mixed/inconclusive evidence (e.g. a 2022 review found probiotics had "minimal effect on SCFA production
and no effect on any other GI status marker at rest" in athletes) rather than overstating benefit.
**Verdict: `CONFIRMED SUBSTANTIVE`.**

**Source 2 — `Krause and Mahan's`, Chapter 1, "Intestinal Microbiota: The Microbiome"** (PDF, `pdftotext`,
extracted from the book's first ~400 pages, located by full-text search rather than page-offset
calculation): a substantial, clinically-oriented treatment (2022 publication) — microbiome-development
factors (genetics, birth route, diet, drugs) with a dedicated figure; six named physiologic functions;
the concept of dysbiosis; a detailed probiotics/prebiotics/synbiotics discussion with practical selection
criteria and food sources. **Verdict: `CONFIRMED SUBSTANTIVE`** — independently corroborating Source 1's
finding from a different book with a different (clinical rather than sport-performance) framing.

**Source 3 — `Krause and Mahan's`, Chapter 16, "The Gut Microbiome"** (same extraction): a short,
pediatric-context paragraph explicitly calling the topic "an emerging topic in nutrition" and
cross-referencing Chapter 1 for the fuller treatment. **Verdict: `CONFIRMED THIN`** — but this is the
*expected*, minor kind of thinness (a second, deliberately-brief mention of a topic already covered in
depth elsewhere in the same book), not evidence that KM16 as a whole under-covers the topic.

**Source 4 — `Nutrition Research Methodologies`, "Microbiome" subsection** (PDF, `pdftotext`, located by
full-text search): a short (~half-page) conceptual/philosophical treatment, framed as one example within
the book's opening chapter on "structure and function" in nutritional science generally — not a
physiological, mechanistic, or practical treatment. **Verdict: `CONFIRMED THIN`** — this is a genuine,
non-trivial thinness, not an artifact of citation error (see below).

**New discrepancy found and independently verified (same category as the three already flagged, not
yet a fourth item on that list until confirmed against the standing three — recorded here and cross-
referenced in `AI_SESSION_STATE.md`):** `MASTER_TOPIC_UNIVERSE.md`'s own sourcing line for `GI-03` cites
NRM's gut-microbiome content as **"Chapter 9 (within 'Nutrients: Consumption & Metabolism' section)."**
Direct inspection shows: NRM's actual Chapter 9 is "Use of Biobanks in Nutrition Research" (confirmed via
`02_TOC_AND_SOURCE_ANALYSIS/05_Nutrition_Research_Methodologies/05_nutrition_research_methodologies_
2015.md` line 242) — an entirely unrelated chapter; the book's only "Microbiome"-titled heading is on
page 7, inside **Chapter 1** (line 48 of the same TOC file); no "Nutrients: Consumption & Metabolism"
section title appears anywhere in NRM's TOC (confirmed by a full case-insensitive text search of the TOC
file, zero matches). This is a **Phase 1 sourcing-citation error** — a different kind of mistake from the
three already-flagged bookkeeping items (which were internal count/rollup mismatches within Phase 3), but
the same severity class: it does not change `GI-03`'s classification, decision mapping, or topic ID, only
the accuracy of one citation string. **Not corrected in `MASTER_TOPIC_UNIVERSE.md`** — flagged only, per
the same deferred-bookkeeping treatment as the other three (see §5).

**Overall `GI-03` topic-level verdict: `CONFIRMED ADEQUATELY COVERED`.** Two of the topic's three
sourcing books (`SN4`, `KM16`) treat it substantively from independent angles (performance/practical vs.
clinical/mechanistic); the third (`NRM`) is genuinely thin, but only contributes one philosophical
paragraph to the topic's overall citation set, not its primary depth. The original Phase 1 "thin-
everywhere-developed-nowhere across 3 books" characterization does not hold up against actual content —
it was based on TOC-heading absence, not page-level inspection, and TOC headings systematically
undersell depth (as this entire content-inspection effort has now shown for `BODY-01`, `NUT-03`, and
`GI-03` alike). **This is a recommendation candidate for Phase 3 (§5), not applied here.**

### 3.5 `CHO-04`'s fiber subsection (feeds `DEC-037`) — **CONFIRMED GENUINELY THIN**

**Question:** does `DEC-037`'s `LOW`-confidence "no dedicated fiber topic ID" characterization
(`APP_DECISION_KNOWLEDGE_MAPPING.md` §6 row 037) hold up, or is it a mapping artifact like the other
"thin" findings this document has been overturning?

**Sources consulted:** `Sport Nutrition, 4e`, Chapter 6 ("Carbohydrate," full chapter, EPUB extraction) —
fiber is mentioned only three times, each in passing (as a factor lowering glycemic index, or as a factor
that slows gastric emptying/absorption during exercise), never as its own subsection with dedicated
intake recommendations. `Krause and Mahan's`, Chapter 16, "Fiber" subsection (PDF, same extraction as
§3.4) — a short, pediatric-specific paragraph (dietary fiber intake in children vs. the adult-derived DRI,
no broader general-population treatment).

**Verdict: `CONFIRMED GENUINELY THIN`** — unlike `BODY-01`/`NUT-03`/`GI-03`, this is a case where the
original Phase 3 "thin" characterization is **correct on inspection**, not an artifact of TOC-level
under-reading. Fiber genuinely has no dedicated, general-population topic treatment across the books
checked — it appears only as a passing modifier within other topics' discussions (glycemic index,
gastric emptying, pediatric nutrition). This is useful precisely because it's a negative control for this
document's own method: content inspection does not automatically overturn every "thin" flag, only the
ones where the TOC-level absence didn't match the actual page-level depth.

### 3.6 AS3/ACSM supplement-chapter redundancy (feeds `DEC-097`; `PHASE_2_HUMAN_REVIEW.md` item 10) — **CONFIRMED COMPLEMENTARY, NOT REDUNDANT**

**Question:** `PHASE_2_HUMAN_REVIEW.md` item 10 flagged AS3's "Ergogenic Aids" chapter and ACSM's
"Dietary Supplements, Foods, and Ergogenic Aids..." chapter as a possible FLAT-risk pair (one chapter
merely restating the other rather than adding distinct value) — is that risk realized?

**Sources consulted:** AS3 Chapter 4 "Ergogenic Aids" (PDF, `pdftotext`, printed pp. 140–145); ACSM's
supplement chapter (EPUB, located by content search rather than TOC page number, since the ACSM epub's
internal file names don't correspond to chapter numbers) — for reference, `SN4` Chapter 11 (already
inspected in the prior Phase 5 session, §3.3) provides the third point of comparison.

**What was found:** the three books take three genuinely different pedagogical approaches to
substantially the same core compound list (caffeine, creatine, beta-alanine, nitrate/beet juice,
bicarbonate, BCAAs):
- **AS3** opens with a regulatory/conceptual framework — the legal definition of a dietary supplement
  under the U.S. Dietary Supplement Health and Education Act of 1994, the nutritional-vs-non-nutritional
  ergogenic-aid distinction, and a historical framing table — before any compound-specific detail.
- **ACSM** teaches via worked case studies with mechanistic troubleshooting (e.g. a runner's beet-juice
  supplementation failing because antibacterial mouthwash killed the oral bacteria that convert dietary
  nitrate to nitrite) — a curated, evidence-emphasis treatment of roughly 7–8 compounds (caffeine and
  creatine dominate the chapter's own word count) rather than a broad catalog.
- **SN4** (per §3.3's prior finding) is the broad reference catalog — roughly 35 named compounds,
  encyclopedia-style, from historically-used substances through contemporary ones.

**Verdict: `CONFIRMED COMPLEMENTARY`, not a realized FLAT-risk.** The three chapters serve three different
functions (regulatory/conceptual framing; mechanistic/critical-thinking pedagogy; comprehensive
reference) around an overlapping compound core — this is redundancy of *subject matter*, which is normal
and expected across textbooks covering the same field, not redundancy of *treatment*, which is what
`PHASE_2_HUMAN_REVIEW.md` item 10 was actually asking about. **This is a recommendation candidate for
Phase 2 (§5), not applied here** — item 10 can likely be closed as "not a FLAT-risk" rather than left
open, though that closure is Phase 2's own document to update, not this one's.

### 3.7 `RESEARCH-15` vs. `DEC-111`'s governance-process framing — **CONFIRMED: SUBSTANTIAL BUT GENUINELY MISALIGNED, NOT THIN**

**Question:** Phase 3 flagged `DEC-111` (an internal evidence-governance-process decision) as `MAPPING
UNCERTAIN` against `RESEARCH-15` because that topic is "framed around public-health/policy translation
rather than internal app governance." Is this framing mismatch real, or does the chapter contain
internal-governance-relevant content Phase 1/3 missed?

**Source consulted:** `Nutrition Research Methodologies`, Chapter 20, "Translation of Nutrition
Research" (full chapter opening, `pdftotext`, located by direct full-text search).

**What was found:** a substantial, well-developed chapter — but entirely about **public** communication
of nutrition science: media/internet channels for reaching the public (with survey data on where people
get health information), legislation shaping what can be communicated, and the food industry's role.
There is no content addressing an *internal* evidence-grading, confidence-tracking, or update-governance
process of the kind an application's own decision-engine would need (which is what `DEC-111` actually
asks about, per its own inventory description).

**Verdict: `CONFIRMED — GENUINE FRAMING MISMATCH, NOT A DEPTH PROBLEM`.** This is a different kind of
finding from `BODY-01`/`NUT-03`/`GI-03` (where TOC-level "thin" undersold real depth) and from `CHO-04`
(where "thin" was correct because the content is genuinely sparse). Here, the content is substantial but
answers a different question than the one `DEC-111` asks — closer to a `GAP-A`-style "no knowledge
representation for *this specific* need" finding than a confidence-tier problem, even though the topic
itself is well-covered for its own (public-communication) purpose. `Phase 3's `MAPPING UNCERTAIN` flag
undersold this slightly — it reads as if the fit might be partial; the fit is closer to nonexistent for
`DEC-111`'s actual internal-governance question specifically, while remaining a legitimate, well-developed
topic for what it's actually about.

### 3.8 Caffeine/alcohol/doping subsection depth (Priority 3, lowest urgency) — **MIXED: CAFFEINE SUBSTANTIVE, ALCOHOL ABSENT, DOPING SCATTERED-BUT-REAL**

**Question:** Phase 1 flagged these three as TOC-thin subsections; is that accurate?

**Source consulted:** `Sport Nutrition, 4e`, Chapter 11 ("Nutrition Supplements," full chapter, EPUB
extraction) — the chapter already established as SN4's ergogenic-aid catalog (§3.6).

**What was found:** **Caffeine** has an extensive, multi-part dedicated treatment (origin and chemistry;
absorption/metabolism/half-life; a full IOC/WADA regulatory history including a since-rescinded urinary
concentration threshold; a dedicated food/beverage/medication caffeine-content table; delivery-method
comparisons including caffeinated chewing gum; cognitive-performance effects) — genuinely substantive,
not thin. **Alcohol** as an ergogenic/doping-adjacent substance is essentially absent from this chapter
(a single incidental mention of "a solid white alcohol" is a chemistry term for octacosanol, unrelated to
alcohol as a beverage) — this specific chapter does not treat alcohol at all; any alcohol content in the
corpus lives elsewhere (`NUT-02.05`, a different domain/topic entirely, general nutrient classification
rather than sport/ergogenic framing). **Doping** has real, if scattered rather than singly-headed,
treatment (15 mentions across the chapter, including the androstenedione ban history and WADA-list
cross-references) — genuine content exists, just not under one dedicated heading in this book; Phase 1's
own sourcing already correctly attributes doping's more concentrated, dedicated treatment to `KM16`
Chapter 23's "Performance Enhancement Substances and Drugs: Doping In Sport" subsection, not re-inspected
here.

**Verdict:** `CONFIRMED SUBSTANTIVE` (caffeine); `CONFIRMED ABSENT IN THIS CHAPTER, LIKELY MISCLASSIFIED
DOMAIN` (alcohol — a different-topic question, not a gap in the sport-nutrition corpus); `CONFIRMED
REAL BUT SCATTERED` (doping, in this book specifically). Matches `APP_DECISION_GAPS.md` §17's own
characterization that "no current `DEC` depends on them directly beyond `DEC-097`'s general supplement-
safety net" — none of these three findings changes that assessment; this was a low-priority item and
confirms, rather than overturns, its low-priority status.

---

## 3.9–3.12 Current-Evidence Items — External Research (Web)

Per explicit authorization, web research was performed for the three items flagged as likely requiring
literature beyond the 7-book corpus (§4 of the prior session's version of this register). Each finding
below keeps the scientific claim and any downstream implication in clearly separate paragraphs, per §1
point 4.

### 3.9 `DEC-027` — target rate of weight change

**Question:** the corpus (`BODY-04`/`BODY-05`) provides conceptual grounding for weight-management
prescription but, per the inventory's own flag, not a defensible current *rate*. Does current literature
supply one?

**Evidence finding:** a stable, long-standing clinical consensus exists and has not materially changed
in over a decade: **approximately 1–2 lb (0.45–0.9 kg) per week** for general weight-loss prescription,
originating in the 2013 AHA/ACC/TOS "Guideline for the Management of Overweight and Obesity in Adults"
and still restated as current in 2025 guidance (e.g. a 2025 Brazilian multi-society evidence-based
obesity-management position statement). The rationale given consistently across sources: rates
meaningfully above this threshold are associated with disproportionate lean-mass loss, gallstone
formation risk, and electrolyte disturbance, without adherence or outcome benefits over the slower rate.
**This is an established, not emerging, position** — it has persisted across a 2013–2025 span of
guidance, unlike the genuinely fast-moving GLP-1/CGM questions below.

**Product/decision implication (separate note, not applied here):** *if* a future phase builds `DEC-027`'s
actual prescription logic, this finding suggests the "acceptable target rate itself not in corpus" gap
flagged in `APP_DECISION_KNOWLEDGE_MAPPING.md` §15/§6 may be closeable using this externally-sourced,
well-established figure — a candidate recommendation (§5), not a resolution performed here. No numerical
threshold is introduced into any Phase 1–4 document by this finding.

**Sources:** [2013 AHA/ACC/TOS Guideline, restated via multiple current summaries](https://www.health.harvard.edu/weight-loss/what-does-a-healthy-realistic-rate-of-weight-loss-look-like-and-why-does-it-matter); [2025 Brazilian evidence-based guideline on obesity management (PMC)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12625227/).

### 3.10 GLP-1 receptor agonists — nutrition counseling guidance

**Question:** Phase 1/2 deferred this as needing current clinical evidence beyond KM16's 2022 chapter
(Ch.30). Does current literature supply actionable, dated guidance?

**Evidence finding:** in May 2025, four major U.S. professional bodies — the American College of
Lifestyle Medicine, the American Society for Nutrition, the Obesity Medicine Association, and The Obesity
Society — jointly published "Nutritional Priorities to Support GLP-1 Therapy for Obesity," a consensus
clinical advisory (published simultaneously across four peer-reviewed journals). Key points: GLP-1-
receptor-agonist-induced weight loss shares physiological risks with bariatric surgery (lean-mass loss,
micronutrient depletion, GI symptoms, gallstone risk); recommended countermeasures include supervised
resistance/aerobic training, protein intake of approximately 1.2–1.6 g/kg/day, food-first (rather than
supplement-first) nutrition plans, and registered-dietitian-led counseling. The advisory itself states
that structured nutritional guidance for GLP-1 therapy remains a research and clinical practice gap
industry-wide, not a settled protocol — i.e. this is current best-available consensus, not a mature,
long-settled standard like §3.9's weight-loss-rate finding.

**Product/decision implication (separate note, not applied here):** this is squarely relevant to
`CLIN-07` (Diabetes, already `FULL`-tiered) and the broader clinical-nutrition-support question generally
tied up in the unresolved `DEC-099`/`DEC-100` scope — **explicitly not acted on**, since GLP-1-specific
clinical guidance is downstream of whether/how the application supports diabetes-adjacent clinical
nutrition at all, a question this document does not reopen (`DEC-099`/`DEC-100` remain unresolved,
per explicit instruction).

**Sources:** [Nutritional Priorities to Support GLP-1 Therapy for Obesity — The Obesity Society](https://www.obesity.org/nutritional-priorities-to-support-glp-1-therapy-for-obesity/); [full advisory, American Journal of Clinical Nutrition](https://ajcn.nutrition.org/article/S0002-9165(25)00240-0/fulltext).

### 3.11 Continuous glucose monitoring (CGM) — use in non-diabetic individuals

**Question:** Phase 1/2 deferred this as needing current clinical evidence beyond KM16's 2022 chapter.
Does current literature supply actionable guidance for a general (non-diabetic) user population?

**Evidence finding:** as of 2025–2026, this remains a genuinely **emerging, not established**, evidence
area. Systematic reviews find CGM use in non-diabetic individuals increasingly studied for lifestyle-
intervention and cardiovascular-risk-stratification purposes, but explicitly report that clinical
interpretation standards are not yet established, that expert clinicians show no clear consensus on
follow-up thresholds (one survey found 56–100% agreement across different expert panels on a single
threshold — i.e. active disagreement, not consensus), and that CGM metrics' relevance to actual health
outcomes in people without diabetes "remains unclear." This is the clearest example in this register of
the `PROJECT_AI_PROTOCOL.md` §5/§25 established-vs-emerging distinction in practice: unlike §3.9's
decade-stable weight-loss-rate figure, this question does not yet have a stable answer to record.

**Product/decision implication (separate note, not applied here):** the evidence finding above is itself
the actionable output — it confirms that any future feature involving CGM data would be building on an
acknowledged-immature evidence base, which is a scope/risk consideration for a future product decision,
not one made here.

**Sources:** [Use of Continuous Glucose Monitoring in Non-diabetic Individuals for Cardiovascular Prevention: A Systematic Review (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC12612783/); [Expert Clinical Interpretation of CGM Reports From Individuals Without Diabetes (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC11822776/).

### 3.12 `DEC-095` — RED-S/overtraining screening, nutrition-recommendation currency

**Question:** SN4's own RED-S/Female Athlete Triad content (`SPORT-10`) is well-established and not in
question (§3.3's female-athlete section context confirms this) — but is the *diagnostic/risk-
management framework itself* current, and is there a more recent authoritative version than what the
7-book corpus (SN4 2024 is the newest touching this) reflects?

**Evidence finding:** the International Olympic Committee's consensus statement is the authoritative,
actively-maintained framework for RED-S, updated on a regular cadence — 2014 (original, "Beyond the
Female Athlete Triad"), 2018, and **2023** (the current governing version, published in the *British
Journal of Sports Medicine*) — with an accompanying practical risk-categorization tool (the REDs CAT2)
whose own companion scoring tool was updated again in **January 2026**. This is an established,
actively-governed, currently-maintained framework, not an emerging or unsettled one — closer to §3.9's
category than §3.11's. The 2023 statement's severity-stratification approach (a "green/yellow/orange/
red" risk-light system based on biomarkers, bone-mineral-density, and injury history) is more granular
than a simple presence/absence screening list.

**Product/decision implication (separate note, not applied here):** if a future phase builds `DEC-095`'s
actual screening logic, the current authoritative reference is the IOC's 2023 consensus statement (and
its CAT2/Scoring Tool 2 companion), not a synthesis from the 7-book corpus alone — a candidate
recommendation, not enacted here.

**Sources:** [IOC 2023 consensus statement on RED-S (PDF)](https://stillmed.olympics.com/media/Documents/Athletes/Medical-Scientific/Consensus-Statements/REDs/BJSM-IOC-consensus-statement-on-Relative-Energy-Deficiency-in-Sport-REDs.pdf); [IOC news: new REDs consensus statement](https://www.olympics.com/ioc/news/ioc-publishes-new-consensus-statement-on-relative-energy-deficiency-in-sport-reds-to-protect-athlete-health).

---

## 4. Worklist Status — Full Accounting

Reusing `APP_DECISION_GAPS.md` §17/§18's own prioritization, not re-derived:

| Item | Priority | Status |
|---|---|---|
| `BODY-01` appetite/satiety (HM4) | P1 | **DONE — §3.1** |
| `SPORT-11` cycle-phase depth (SN4 Ch.17) | P1 | **DONE — §3.3 Finding B** |
| `SPORT-11` genetic/nutrigenomic currency (SN4 Ch.17) | P1 (via §18) | **DONE — §3.3 Finding A** |
| `NUT-03` Exchange List depth (KM16 App.18) | P2 | **DONE — §3.2** |
| `CHO-04` fiber subsection depth (SN4/KM16) | P2 | **DONE — §3.5** |
| AS3/ACSM supplement-chapter redundancy | P2 | **DONE — §3.6** |
| 18 pending-scope CLIN topics — content inspection | P3 | **Correctly not attempted** — `APP_DECISION_GAPS.md` §17 itself says this is lower-priority than the `DEC-099` scope decision, which remains unresolved per Gate 1/2 |
| `RESEARCH-15` framing vs. `DEC-111`'s governance need | P3 | **DONE — §3.7.** Confirmed genuine framing mismatch (substantial content, wrong question) |
| Caffeine/alcohol/doping subsection depth | P3 | **DONE — §3.8.** Caffeine substantive; alcohol absent from this chapter (different-domain question); doping real but scattered — confirms, doesn't overturn, the original low-priority call |
| `GI-03` gut microbiome depth (NRM/SN4/KM16, 3-book) | P1 (its own Phase 1 deferral) | **DONE — §3.4.** Topic-level verdict: adequately covered overall (SN4 + KM16-Ch.1 substantive, NRM + KM16-Ch.16 thin but not dominant). One new sourcing-citation error found and flagged (NRM chapter/section mis-cited in `MASTER_TOPIC_UNIVERSE.md`) |
| `DEC-027` target weight-change rate | Current-evidence PRIMARY | **DONE — §3.9 (external research).** Established, stable consensus figure found (1–2 lb/week) |
| GLP-1 receptor agonists (KM16 Ch.30) | Current-evidence, Phase 1/2 deferred | **DONE — §3.10 (external research).** Current (May 2025) 4-society joint clinical advisory found |
| Continuous glucose monitoring (KM16 Ch.30) | Current-evidence, Phase 1/2 deferred | **DONE — §3.11 (external research).** Confirmed genuinely emerging/unsettled, not yet a stable answer — itself a complete finding |
| COVID-19 material (KM16, 5 chapters) | Current-evidence, Phase 1/2 deferred | **NOT YET INSPECTED** — lowest priority; no current `DEC` record depends on COVID-specific content directly; deferred again |
| `DEC-095` RED-S/overtraining screening currency | IMPORTANT (§18) | **DONE — §3.12 (external research).** IOC's 2023 consensus statement (+ Jan-2026 scoring-tool update) confirmed as the current, actively-governed authoritative framework |

---

## 5. Recommendations to Phase 3/4 (Flagged Only — Not Applied)

Per explicit instruction ("make the smallest necessary correction only if the protocol permits it;
otherwise flag it without blocking unrelated work") and `PROJECT_AI_PROTOCOL.md` §36's change discipline,
**none of the following has been applied to any Phase 3/4 document in this pass.** Each is a candidate
for a future, explicitly-authorized small correction:

1. `DEC-058`'s `MAPPING UNCERTAIN` flag (`APP_DECISION_KNOWLEDGE_MAPPING.md` §6/§16; carried into
   `DECISION_KNOWLEDGE_READINESS.md` as `GATED — GAP`) could be updated to `COVERED`/`HIGH` confidence,
   citing this document's §3.1 finding. **Downstream effect if applied:** `DEC-058` would move from
   `GATED` to `READY` in `DECISION_KNOWLEDGE_READINESS.md` — a `Decision Knowledge Readiness` count
   change (94→95 ready, 18→17 gated) that would itself need re-validating, not silently assumed.
2. `DEC-098`'s `MAPPING UNCERTAIN` flag on its `SPORT-11` relationship could be resolved — not to
   `COVERED` (the underlying personalization science remains thin, per §3.3 Finding A), but to a
   confirmed **negative** finding for the cycle-phase-specific sub-question specifically (§3.3 Finding
   B), while retaining the broader `CONDITIONAL`/current-evidence-primary status for genetic
   personalization generally. This is a more nuanced update than a single confidence-tier bump — a
   future correction pass should treat these as two separate sub-findings, not conflate them.
3. `APP_DECISION_GAPS.md` §9's Portion/Quantity characterization ("a genuine, if thin, portioning-
   methodology precedent") could be strengthened to reflect two independent sources (§3.2, §3.3 Finding
   C) rather than one thin one — without necessarily changing its `GAP-C` classification (recipe/
   preparation and shopping logistics remain genuinely absent), only its *confidence* rating for the
   Portion link specifically.
4. `GI-03`'s overall classification (§3.4) — currently `SPECIALIZED (pending review)`/`MAPPING
   UNCERTAIN` in Phase 3, `CONDITIONAL` in Phase 4's `KNOWLEDGE_DECISION_DEPTH_MAP.md` — could be
   updated to reflect the "adequately covered overall" verdict, which would also bear on `DEC-054`'s
   `UNCERTAIN` status (`APP_DECISION_GAPS.md` §17 itself named this exact dependency in advance).
5. `MASTER_TOPIC_UNIVERSE.md`'s `GI-03` sourcing citation for NRM ("Chapter 9... 'Nutrients: Consumption
   & Metabolism' section") is factually wrong (§3.4) — the correct location is Chapter 1, page 7, no such
   section title exists in the book. This is a Phase 1 citation fix, smaller in scope than any of items
   1–4 (a citation string, not a classification), but flagged the same way.
6. `PHASE_2_HUMAN_REVIEW.md` item 10 (the AS3/ACSM supplement-chapter FLAT-risk question) could be closed
   as "not a FLAT-risk — confirmed complementary" per §3.6's finding, rather than left open.
7. `APP_DECISION_KNOWLEDGE_MAPPING.md` §15's `DEC-027` current-evidence-primary flag could be updated to
   note that an established external figure now exists (§3.9) — this would not remove the current-
   evidence flag (the rate could still be revised by future guidance) but could add a citation, similar
   in spirit to how DRI methodology citations are already handled elsewhere in that document.
8. `DEC-111`'s `MAPPING UNCERTAIN` flag (§3.7) could be sharpened from "framing uncertain" to a more
   precise "the public-communication framing genuinely does not answer the internal-governance question"
   — closer to a `GAP-A`-style finding for `DEC-111` specifically, while `RESEARCH-15` itself remains a
   legitimate, well-developed topic for its own (different) purpose. This is a clarification of an
   existing flag's precision, not a new classification.

**None of these eight recommendations resolves `DEC-099`/`DEC-100`, changes any topic's classification in
`MASTER_TOPIC_UNIVERSE.md` (beyond the citation-string fix in item 5, which changes no classification),
or introduces a formula/threshold — each is a confidence/status/citation update to an existing, already-
open item, traceable to a specific dated source passage or search result.**

---

## 6. Validation

- Every content-inspection finding is traceable to an exact book, chapter/appendix, and (for PDF sources)
  a page-offset calibration method or direct full-text-search location, stated per finding — not
  asserted from memory or general nutrition knowledge (`PROJECT_AI_PROTOCOL.md` §29). Every external-
  evidence finding (§3.9–§3.12) is cited with a live URL, per `WebSearch`'s own sourcing requirement, and
  each source's own publication/citation date is stated rather than assumed.
- No topic ID, decision ID, or dependency was created, renamed, or deleted.
- No Phase 1–4 document was modified — all eight recommendations in §5 are flagged, not applied.
- `DEC-099`/`DEC-100` were not touched, referenced for resolution, or brought into this document's scope
  beyond the explicit notes in §3.4 (Priority-3 CLIN content inspection correctly not attempted) and
  §3.10 (GLP-1's clinical-scope implication explicitly not acted on) — both consistent with
  `APP_DECISION_GAPS.md`'s own stated reasoning or the Gate 1/2 deferral, not a new judgment.
- Established-vs-emerging evidence distinction preserved throughout, including across the two different
  kinds of source now used: book citations (§3.1–§3.8) and live web search results (§3.9–§3.12). §3.9's
  and §3.12's findings are explicitly labeled established/stable (a decade-plus-consistent guideline
  figure; an actively-governed, regularly-updated consensus framework); §3.11's is explicitly labeled
  emerging/unsettled (active expert disagreement, as of 2025–2026) — these are not presented with equal
  confidence, per `PROJECT_AI_PROTOCOL.md` §5/§25 step 6.
- Every finding with an obvious downstream implication (§3.3 Finding B, §3.9–§3.12) states that
  implication in a separately labeled "Product/decision implication" paragraph, per instruction, and none
  of those implications was applied to any Phase 1–4 document.
- No formula, numerical threshold (beyond directly quoting a source's own stated value, whether a gram
  amount from a textbook table or a guideline's own rate figure — reported as the source's content, never
  converted into an application-level rule), or algorithm was introduced.

---

## 7. Self-Audit

- **What could be wrong:** page-offset calibration for PDF sources was based on a single footer check per
  book in the earlier findings (§3.1–§3.2); later findings (§3.4 sources 2 and 4, §3.6) used direct
  full-text search instead, which is more reliable and was adopted specifically because the offset method
  proved fragile (confirmed when a naive offset assumption for `KM16`'s later chapters failed silently at
  first, caught only by checking the extracted text's own chapter-header content before treating it as
  the target). Web search results (§3.9–§3.12) reflect a snapshot as of this session's date and could
  themselves be superseded by newer guidance in the future — each finding states its own currency
  explicitly for exactly this reason, and none is treated as permanent.
- **What was assumed:** that a 2022–2024 textbook's own citations constitute adequate "current evidence"
  for questions they directly address (§1 point 2) — applied consistently, and explicitly not extended to
  GLP-1/CGM/RED-S-framework-currency, which were correctly identified as needing external sources and
  were then researched externally.
- **What was silently resolved:** nothing. All eight recommendations (§5) are flagged, not applied.
  `DEC-099`/`DEC-100` untouched; GLP-1's clinical-scope adjacency to `DEC-099`/`100` explicitly not acted
  on (§3.10). Every finding with a downstream implication states that implication separately, per
  instruction, rather than folding it into the scientific claim.
- **What changed from Phase 1–4:** no document changed. Four discrepancies now stand flagged in total
  across this project's history (the two from Gate 1, the `NUT-04`/`NUT-01` pair from the prior Phase 5
  session, and this session's `GI-03` NRM sourcing-citation error) — all deferred, none resolved, per
  consistent treatment.
- **What remains genuinely open:** the 18 `SCOPE-PENDING` CLIN topics' content inspection (correctly not
  attempted — tied to the still-unresolved `DEC-099`, not a Phase 5 omission) and COVID-19 material
  (lowest priority, no current `DEC` depends on it directly — an explicit, reasoned deferral, not a
  silent drop). Both are stated here as intentionally not addressed, not as loose ends.

---

## 8. Status

**Phase 5's evidence-and-content-inspection worklist is complete.** Across two working sessions, this
register now contains **twelve completed findings** (§3.1–§3.12, with §3.4 itself resolving four
sub-questions) spanning book-content inspection and external current-evidence research, plus **eight
flagged recommendations** to Phase 1–3 documents (none applied — all deferred pending separate
authorization, per `PROJECT_AI_PROTOCOL.md` §36). Of the original worklist (§4), every item is either
`DONE` or explicitly, reasonedly deferred (the 18 `SCOPE-PENDING` CLIN topics, tied to unresolved
`DEC-099`; COVID-19 material, lowest priority with no current `DEC` dependency) — nothing was silently
dropped. `DEC-099`/`DEC-100` remain exactly as unresolved as at Gate 1/2. No Phase 1–4 document was
modified. See `AI_SESSION_STATE.md` for the overall Phase 5 completion determination and next action.
