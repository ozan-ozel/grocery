# Project Status

Phase 1: COMPLETE
Phase 2: COMPLETE
Phase 3: CLOSED (Gate 1 approved 2026-09-05 — see `DECISIONS/2026-09-05-gate-1-phase-3-to-phase-4.md`)
Phase 4: CLOSED (Gate 2 approved 2026-09-06 — see `DECISIONS/2026-09-06-gate-2-phase-4-to-phase-5.md`).
Artifacts: `09_PHASE_4_CURRICULUM_DECISION_INTEGRATION/KNOWLEDGE_DECISION_DEPTH_MAP.md` (per-topic
required-application-depth tiers for all 213 topics) and `DECISION_KNOWLEDGE_READINESS.md` (per-decision
knowledge-readiness verdict for all 112 decisions).
Phase 5: CLOSED (Gate 3 approved 2026-09-06 — see `DECISIONS/2026-09-06-gate-3-phase-5-to-phase-6.md`).
Artifact: `06_EVIDENCE_AND_GAPS/EVIDENCE_AND_CONTENT_INSPECTION_REGISTER.md` (12 findings: 8 source-book
content-inspection, 4 external current-evidence via web research). Eight recommendations to Phase 1–3
documents carried forward as recommendations only, not applied.
Phase 6: CLOSED (Gate 4 approved 2026-09-06 — see `DECISIONS/2026-09-06-gate-4-approval-phase-6-
closure.md`). Artifacts: `07_FINAL_CURRICULUM/PHASE_6_CURRICULUM_DESIGN_DECISION_PACKAGE.md` (the
preparatory cross-reference) and `FINAL_CURRICULUM_ARCHITECTURE.md` (the final architecture — all 213
topics sequenced per the 15 Gate 4 decisions in `DECISIONS/2026-09-06-gate-4-phase-6-decisions.md`: spine
= Option D Hybrid three-act structure; sport = topic-by-topic; research = Option D Hybrid; clinical
Layer 5 = CORE/Layer 6 = ELECTIVE with `DEC-099`/`DEC-100` explicitly NOT reopened; `CANDIDATE_
EXCLUSIONS.md` ratified with `SPECIAL-04` override preserved; `LIFE-05` non-standalone; AS3/ACSM
redundancy closed; etc.). Validated against topic count, prerequisite graph, learning levels, candidate
exclusions, Phase 3 decision model, and Phase 4/5 findings — all pass, including a post-approval closure
self-audit that caught and fixed three branch-header miscounts (no topic reclassified — see the
architecture's own §6.1/§7). No Phase 1–5 source document modified; no stable ID changed; no topic
deleted.
Phase 7: CLOSED (Gate 5 approved 2026-09-07 — see `DECISIONS/2026-09-07-gate-5-phase-7-closure.md`).
All six compiled judgment calls were answered and `DEC-107`'s autonomous ratification explicitly
accepted; specifications applied in the artifact's §3.18. Post-Gate-5 accounting: **97 of 112 decisions
carry a drafted specification** (up from 88 — the 9 judgment items moved into the drafted column), **15
remain `BLOCKED`** (Domains L/M/Q and `DEC-065`), and **zero remain in `NEEDS JUDGMENT` or `SPECIFIABLE
(not yet drafted)`**. ~~Nine~~ **Eight** of the 97 carry a numerical parameter still deferred
(`DEC-021`/`110` deviation cap; `DEC-090` circuit-breaker values; `DEC-012`–`016` Domain C criteria) —
architecturally settled, numerically open. **`DEC-048` left this set at Gate 6** (2026-09-07) by
_declining_ its deferred parameter rather than supplying one: the evidence established that a population
heat multiplier is the wrong form, not merely an unavailable number. **Phase 7's artifact was
subsequently amended under Gate 6 §7 authorization** — three entries (`DEC-031`, `DEC-034`, `DEC-048`),
disclosed in that document's new §0 amendment notice. The 97/15 accounting is unchanged. Two decisions that were
partial before Gate 5 are now complete outright: `DEC-039`/`085` (no independent macro-control loop) and
`DEC-044` (no autonomous supplementation dosing in v1). Eleven-point closure validation run and passed.
`DEC-099`/`DEC-100` preserved unresolved — the approved conservative Domain C posture explicitly does not
narrow them. No Phase 1–6 source document modified (timestamps re-verified); no stable ID changed.

Phase 7 detail (pre-Gate-5 state, retained for provenance): specification complete 2026-09-07. Artifact:
`10_PHASE_7_DECISION_ENGINE_SPECIFICATION/DECISION_LOGIC_SPECIFICATION.md` — all 112 application
decisions resolved into three end-states: 88 with a drafted specification (formulas, thresholds, and
decision rules, each citing an established source or a Phase 5 verified finding), 15 `BLOCKED` (Domains
L/M/Q and `DEC-065` — the confirmed Practical Translation Gap plus the still-deferred clinical-scope
decision), and 9 `NEEDS HUMAN/SCIENTIFIC JUDGMENT`, compiled into the 6 grouped questions now before
Gate 5 (`CHATGPT_REVIEW_REQUEST.md` §5). Nothing remains in a "specifiable but not reached" category —
that was Phase 7's own completion bar. Validated programmatically: domain membership re-derived from
`APP_DECISION_INVENTORY.md`'s own per-decision `Domain:` fields (which caught and corrected two
domain-boundary errors in Phase 7's own first draft — disclosed in the artifact's §2/§5, no substantive
classification changed), full drafted-entry coverage confirmed, status accounting cross-checked
independently (88+15+9=112). `DEC-099`/`DEC-100` not resolved or narrowed. No Phase 1–6 source document
modified; no stable ID changed. Note for Gate 5: Domain C's safety thresholds are structurally coupled to
`DEC-099` via the model's only bidirectional `REQUIRED` pair (`DEC-012` ⇄ `DEC-099`) — surfaced as
information, not as a request to reopen the deferred decision.

Phase 3 Final Consistency Audit: PASS

Phase 3 artifacts (all in `05_PHASE_3_APP_DECISION_MODEL/`):

- `APP_DECISION_INVENTORY.md` — 112 decisions (DEC-001–DEC-112)
- `APP_DECISION_DEPENDENCY_GRAPH.md` — 203 dependency edges (191 forward, 12 `FEEDBACK`), one
  bidirectional `REQUIRED` pair (`DEC-012 ⇄ DEC-099`)
- `APP_DECISION_KNOWLEDGE_MAPPING.md` — full two-way mapping against the 213-topic universe
- `APP_DECISION_GAPS.md` — ten-category gap taxonomy applied to all 112 decisions and 213 topics
- `APP_DECISION_MODEL.md` — the integrated conceptual decision architecture

Audit history: an initial read-only cross-document consistency audit found one HIGH bookkeeping
inconsistency (the Dependency Graph's feedback-edge consolidation table) and two LOW wording issues
(a DEC-027 "only PRIMARY-tier decision" overstatement in three locations of the Decision Model, and
NUT-03's functional role being under-traced in the same document). During correction, an additional,
related discrepancy was found and resolved: the Dependency Graph's own claimed total edge count (204)
did not match its register (independently verified by three counting methods at 203 edges: 191 forward

- 12 `FEEDBACK`, not 196 + 8). All three original findings plus this additional discrepancy have been
  corrected across all affected documents (Dependency Graph, Knowledge Mapping, Gaps, Model) and
  re-validated — no decision, topic, dependency, or gap classification was altered; only summary
  arithmetic and two wording issues were fixed. No unresolved human decision (clinical scope `DEC-099`,
  SPORT-08/SPORT-11, Practical Translation domain status, curriculum spine, etc.) was touched.

Phase 8: **CLOSED** — **GATE 6 RESOLVED GO (2026-09-07); On Cooking 7e inspection and the full closure
audit complete (2026-09-07).** See
`DECISIONS/2026-09-07-gate-6-culinary-corpus-extension.md` and
`11_PHASE_8_PRACTICAL_TRANSLATION/CULINARY_SOURCE_EXTENSION.md`.

**The Gate 6 decision:** _"Admit one bounded eighth culinary/food-preparation source. Do not permanently
exclude recipe construction, and do not use modification-only as the primary culinary architecture."_
**Option A** selected; **B and C rejected** — the reviewer's governing point being that _example-level
modification knowledge ≠ general recipe-construction knowledge_, so Phase 8's own §4.4 finding, while
valid, could not carry an architecture. This is the **first extension of a corpus fixed since Phase 1**,
and it is bounded: the 7-book / 213-topic / 112-decision baseline is preserved unedited, and the eighth
source is recorded separately as a controlled practical-translation extension.

**Applied since:** selection criteria defined; Brown was the initial candidate, and the actual execution
source is **On Cooking: A Textbook of Culinary Fundamentals, 7th Edition (2023 update)** by Labensky,
Martel, and Hause (Pearson). Brown was chosen over Vaclavik (duplicates HM4/BENDER3's
macronutrient-chemistry axis), McGee (no scaling/batch/safety layer), and the CIA text (disqualified by
Gate 6 §10's professional-chef/restaurant-operations exclusion). The source substitution is documented
explicitly in `ON_COOKING_7E_EXECUTION_RECORD.md`; the Gate 6 decision record remains unchanged.
The actual source inspection and residual-gap determination are recorded in
`ON_COOKING_7E_EXECUTION_RECORD.md`; Phase 8 is closed without opening a new gate. Phase 9 is the next
authorized phase, but no Phase 9 work has begun.
A programmatic complementarity baseline found **six of eleven required capabilities absent from the
seven-book corpus, two example-level, two thin-but-present, one very thin** — and reading markers in
context reversed three of them (`emulsif` is bile-salt physiology, `yield` is metabolic ATP yield,
`blanch` is pressure-injury staging), while refuting one of my own over-claims (preparation-level food
safety is thin but genuinely present, which _bounds_ the extension). `DEC-048` and the three provenance
corrections were applied to Phase 7. Usability assumptions U1–U7 analysed, with **U3 (preparation
preserves the nutrient content the target assumed) identified as the only one with correctness rather
than convenience consequences.**

**Phase 8 closure:** the actual On Cooking 7e source was acquired and inspected; all twelve Gate 6 closure
steps are complete. No gate is open, no human judgment is outstanding, and Phase 9 is the next authorized
phase. The batch-production limitation remains explicitly bounded in the Phase 8 execution record.

Phase 9: **STARTED — first milestone complete (2026-09-07).** Artifact:
`08_APP_TRANSLATION/PHASE_9_APPLICATION_CAPABILITY_ARCHITECTURE.md`. No gate was required to begin —
Gate 6 is defined as the end-of-Phase-8 gate and already covers this transition (`PROJECT_AI_PROTOCOL.md`
§21: Gate 7 is end-of-Phase-9, with no intermediate gate).

Before writing anything, Phase 8's closure was **independently re-verified**, not taken on trust: DEC ID
range confirmed (max `DEC-112`, none fabricated), `MASTER_TOPIC_UNIVERSE.md`/`APP_DECISION_INVENTORY.md`
diffed against `85cec9e` (unchanged), source-book directory diff shows only the On Cooking 7e addition,
and the PDF's identity/several content claims were independently re-checked (1,249 pages via `pypdf`;
`pdftotext` spot-checks of HACCP, cross-contamination, mise en place, and a "quantity food" = 0-hits check
corroborating the execution record's `PARTIAL` batch-production rating rather than an over-claim). Two
Phase 8 documents still carried pre-execution language ("pending inspection") from before a concurrent
process completed the On Cooking inspection; both were reconciled with disclosed superseding notes.

**Phase 9 delivered:** a five-layer boundary model (scientific knowledge / decision logic / translation
logic / product behavior / UI-UX) applied throughout; a full capability map for `DEC-060`–`075` (Domains
K/L/M — food selection, meal planning/preparation, shopping) citing required knowledge, inputs, outputs,
constraints, safety boundary, personalization, and future implementation layer per decision, plus a
summary of the upstream nutrition-decision layer (Domains D–H, C, N, O) each depends on; every non-trivial
decision classified into `SPECIFICATION GAP` / `KNOWLEDGE GAP` / `PRODUCT DECISION GAP` / `DATA GAP` /
`SAFETY/SCOPE GAP`, none closed by picking a value; implementation dependencies sorted into
already-supported / requires-external-data / requires-product-design / requires-future-evidence /
requires-human-decision; **reusable knowledge primitives extracted from On Cooking 7e** (recipe structure,
ingredient function, substitution rules, cooking-method taxonomy, scaling/yield conversion, storage
transformation, nutrient-fate patterns) with an explicit governing principle that Grocery needs the
*primitives*, not the book's actual recipe content; the scientific-authority boundary checked for actual
conflicts (none found) rather than merely asserted; and Phase 8's six original practical-translation
findings re-verified as still holding, unchanged by the extension. All 30 `DEC-###` IDs cited were
programmatically checked against `APP_DECISION_INVENTORY.md` — zero fabricated.

**Two human decisions surfaced, both non-blocking for continued architecture work:** `DEC-067`'s
preparation-detail level (recipe-level / ingredient-list-level / general guidance — a product/UX call the
knowledge layer cannot make); and whether `DEC-069` genuinely needs restaurant-scale batch production for
v1 (the corpus's one confirmed, pre-anticipated limitation — answering "yes" would reopen a knowledge
question and likely warrant a future gate; "no" simply confirms the existing bounded limitation as
permanent for v1). Neither is answered by this milestone.

**Explicitly not started:** any production code, schema, API, UI, ingredient database, or algorithm — §28
holds; Phase 9's first milestone is architecture only.

Current next task: **extend the Phase 9 capability-architecture artifact** (resolve `§4.3` product-design
items, work toward `§4.2` data-requirement items, or obtain answers to the two human-decision candidates)
rather than create a new document, per the explicit "avoid document proliferation" instruction this phase
was given.

---

_Pre-Gate-6 record, retained for provenance:_

Phase 8: IN PROGRESS — AWAITING GATE 6 REVIEW (opened 2026-09-07). Artifact:
`11_PHASE_8_PRACTICAL_TRANSLATION/PRACTICAL_TRANSLATION_ANALYSIS.md`. Delivered: the translation chain
(Target → Meal Structure → Food Selection → Portion → Recipe → Preparation → Shopping → Execution) mapped
to the decision inventory — the break is at links 4–8, not uniform; the Practical Translation Gap
established as **three structurally different problems** (`GAP-C` portion = thin but extendable;
`GAP-A` recipe/preparation = genuinely absent, the only true `GAP-A` in all 112 decisions; `GAP-D`
shopping/pantry/deviation = not a knowledge gap at all, but Phase 9 routing questions this app's existing
grocery/pantry surface already answers). **Phase 3's deferred new-domain validation condition 5 is now
RESOLVED** — Phase 8 performed the full-text inspection (all 7 books, ~16 MB) that Phase 3 was barred
from and Phase 1 had only done at TOC level: the culinary gap persists. A previously-unsurfaced finding
narrows it — the corpus supports recipe _modification_ (KM16: GF flour blending, flaxseed-for-egg,
oil/spread substitution, home ORS formulas) while lacking recipe _construction_, which maps onto
already-specified `DEC-061`/`DEC-063` and creates a third option at Gate 6. Two Gate 5 evidence tasks
discharged: **`DEC-048`** — a multiplier is NOT the justified form (heat: inter-individual sweat-rate
variability ~0.5–>3 L/h exceeds any population factor, so route to measured sweat rate; altitude: citable
additive +1–1.5 L/day, ACSM 4–5 L/day during altitude training), and **provenance re-verification** —
Phase 7's protein and carbohydrate ranges are corroborated against the corpus, with three recorded
nuances (SN4's hypertrophy plateau at 1.6–1.7 g/kg sits at the _bottom_ of Phase 7's 1.6–2.2 band;
Phase 7's endurance carb floor is 1 g/kg low; its "ultra 8–12" repurposes a pre-event _loading_ protocol
as a daily band). No Phase 1–7 artifact modified; `DEC-099`/`DEC-100` untouched.

Gate 6 opened because a genuinely new consequential architectural decision appeared, exactly as Gate 5
instructed should trigger a gate: **does the project admit culinary/food-preparation knowledge, and in
what form?** Conditions 1–5 of the five-condition new-domain test are now all met; only condition 6 (scope
judgment) remains. Options: A = admit an eighth source book; B = scope recipe construction out of v1;
C = translation-layer only (deliver modification, not construction). This blocks two of Gate 6's own five
review areas (meal construction, preparation) and makes usability assumptions unassessable.

Next Phase: Phase 9 (Application/Product Architecture) — ~~gated behind Gate 6~~ **Gate 6 passed; Phase 9
opens once Phase 8 closes.**

Current next task:
~~**Await the Gate 6 decision.**~~ **Place the eighth source book at
`01_SOURCE_BOOKS/08_Understanding_Food_Principles_and_Preparation/`** (PDF or EPUB). Phase 8 then
completes steps 4–7 and 12 of the Gate 6 closure sequence and proceeds to Phase 9. See
`docs/SESSION_CHECKPOINT.md` → "Next Steps" for the current execution position. **No review gate is
open.**

Gate 4 approval (Phase 6 closure) recorded 2026-09-06 — see
`DECISIONS/2026-09-06-gate-4-approval-phase-6-closure.md`: **GO** — all 15 Gate 4 decisions confirmed as
final; Phase 6 closed; Phase 7 authorized. Governance constraints reaffirmed verbatim: `DEC-099`/
`DEC-100` remain unresolved for application scope; no Phase 1–5 source document silently rewritten; all
213 topic IDs preserved; no topic deleted for core/elective reasons; all deferred items and flagged
discrepancies preserved; the five-way distinction (curriculum architecture / application decision
architecture / application scope / evidence status / source provenance) preserved.

Gate 4 (Phase 6 architectural decisions) recorded 2026-09-06 — see
`DECISIONS/2026-09-06-gate-4-phase-6-decisions.md`: 15 decisions supplied covering spine selection,
sport/research/clinical architecture, `CANDIDATE_EXCLUSIONS.md` ratification, and provenance handling.
`DEC-099`/`DEC-100` explicitly not reopened. The final architecture built from these decisions is now
awaiting Gate 4's own review (see above) before Phase 7 may begin.

Gate 3 (end of Phase 5) decision, recorded 2026-09-06 — see
`DECISIONS/2026-09-06-gate-3-phase-5-to-phase-6.md`: **GO** — Phase 5 closed, Phase 6 authorized to begin
in the same session. All explicitly deferred/unresolved/flagged items (three bookkeeping/citation
discrepancies; `DEC-099`/`DEC-100`; the eight Phase 5 recommendations) are preserved exactly as
documented — none silently fixed or reinterpreted. Phase 6 must not reopen `DEC-099`/`DEC-100` or any
other previously-deferred architectural/product-scope decision unless a genuine dependency makes Phase 6's
own continuation impossible.

Gate 2 (end of Phase 4) decision, recorded 2026-09-06 — see
`DECISIONS/2026-09-06-gate-2-phase-4-to-phase-5.md`: **GO** — Phase 4 closed, Phase 5 authorized to begin
in the same session. The three bookkeeping discrepancies flagged during Phase 4 (Layer-5 count;
`APP_DECISION_KNOWLEDGE_MAPPING.md` §8b NUT-04 omission; §5-vs-§8a NUT-01 strength mismatch) are
explicitly deferred, not resolved — Phase 5 does not block on them and will only touch any of the three
records if a Phase 5 task naturally requires it for downstream consistency, per `PROJECT_AI_PROTOCOL.md`
§36. `DEC-099`/`DEC-100` remain unresolved.

Gate 1 (end of Phase 3) decision, recorded 2026-09-05 — see
`DECISIONS/2026-09-05-gate-1-phase-3-to-phase-4.md`:

- §7.1 Gate itself: **GO** — Phase 3 closed, Phase 4 authorized.
- §7.2 Clinical scope (`DEC-099`/`DEC-100`): **deferred** (Option C) — carried into Phase 4 as an
  unresolved human decision; the 18 not-yet-individually-mapped CLIN topics stay scope-pending in Phase
  4's own output.
- §7.3 `CANDIDATE_EXCLUSIONS.md` adoption: **adopted as Phase 4's working default** (Option A, with an
  explicit per-topic override allowance when Phase 4's own analysis gives a documented reason) — not
  ratified as a final decision.
- A pre-existing arithmetic-labeling bug was found in `04_PHASE_2_CURRICULUM_ARCHITECTURE/
CLINICAL_NUTRITION_ARCHITECTURE.md` while validating this Gate: it states Layer 5 = "23 topics" /
  "13 general practice," but its own topic enumeration (`CLIN-03`–`CLIN-25` plus `CLIN-27`) totals 24,
  making general-practice-only 14. Flagged, not corrected in that document — see the decision record §4
  for the full derivation and cross-check against the confirmed 27-topic CLIN total. Does not block
  Phase 4 (which maps depth per individual `CLIN-##` ID, not by the Layer 5/6 summary count), but should
  be fixed in a small, separately-authorized future pass.

Core source books:
7 core (+ 1 bounded culinary extension admitted at Gate 6 — On Cooking 7e; the 7-book baseline is preserved unedited)

Current curriculum topic universe:
213 stable IDs

Phase 1 human decisions:
Preserved for later review — see `03_PHASE_1_CURRICULUM_ANALYSIS/PHASE_1_AMBIGUITY_AUDIT.md` ("Human Decisions" list)

Phase 2 human decisions:
Preserved for later review — see `04_PHASE_2_CURRICULUM_ARCHITECTURE/PHASE_2_HUMAN_REVIEW.md`

Git:
Existing repository preserved (the repository root is `D:\CodeSpace\grocery`; this project lives at `nutrition-curriculum/` inside it)

Source books:
Git-ignored (`nutrition-curriculum/01_SOURCE_BOOKS/`)

Project analysis:
Version-controlled

---

## Reorganization Log (this session)

This project was reorganized from a flat working folder (`C:\Users\4D\Desktop\CLAUDE-PROJECT-DOCK\grocery\books\`) into the structure above and merged into the existing `grocery` app's Git repository at `D:\CodeSpace\grocery`, under a new top-level `nutrition-curriculum/` folder, per explicit instruction. No file was deleted, duplicated, or content-modified during this move — see the session's final report for the full file-by-file account.

### Known Broken Relative Reference (not auto-fixed, per instruction)

`02_TOC_AND_SOURCE_ANALYSIS/README.md` contains 7 Markdown links of the form `[01_advanced_sports_nutrition_3e.md](01_advanced_sports_nutrition_3e.md)`, written when that file and the 7 TOC files were siblings in one flat folder. After this reorganization, the 7 TOC files each live in their own per-book subfolder (`02_TOC_AND_SOURCE_ANALYSIS/01_Advanced_Sports_Nutrition_3e/01_advanced_sports_nutrition_3e.md`, etc.), so **all 7 relative links in that README are now broken** (they'd need to be `01_Advanced_Sports_Nutrition_3e/01_advanced_sports_nutrition_3e.md` instead). Per the reorganization instructions, this was recorded rather than silently fixed. The file's content is otherwise unchanged and still accurate; only the 7 hyperlink targets need correcting whenever this is next touched.

### Files Left Outside the Project Structure (Unclassified, Flagged for Review)

- `C:\Users\4D\Desktop\CLAUDE-PROJECT-DOCK\grocery\books\Onaylanmayan 34138.crdownload` (1.9 MB) — an incomplete/partial browser download (the Turkish filename prefix means "unconfirmed/unapproved"). Not one of the 7 source books (all 7 are accounted for and moved), not analysis, not project control. Left in its original location on the C: drive rather than guessed into the new structure or deleted. Needs a human decision: resume the download, identify what it was, or delete it as leftover cruft.

### File Archived (Judgment Call, Reported)

- `desktop_books_inventory.md` → moved to `99_ARCHIVE/`. This was the very first deliverable of the whole project (a raw listing of book files found on the Desktop, before the 7-book corpus was finalized and before TOC extraction began). Its content — filename/format/size/path for candidate books — is now fully superseded by the more authoritative and complete `02_TOC_AND_SOURCE_ANALYSIS/README.md` inventory. Archived as "clearly superseded" per the reorganization instructions' archive criteria, not simply because it's old.

---

## Structural Maintenance Log — 2026-09-08

A documentation-structure audit of `nutrition-curriculum/` (54 files, 24,132 lines). **Verdict: the
corpus is not oversized and was not split.** Only two structural defects were corrected; no document
was split, renamed, merged, or renumbered, and no content was removed.

### 1. `APP_DECISION_GAPS.md` — section order corrected

`# 5. Complete Decision Gap Matrix` was physically located at the end of the file, after `# 24.
Validation`, so the document read 1, 2, 3, 4, 6, 7 … 24, 5. §5 was moved back to its correct position
between §4 and §6. **Pure block move:** word count identical before and after (11,957), all 112 `DEC`
rows intact, section numbers now strictly sequential 1→24.

### 2. `PHASE_9_APPLICATION_CAPABILITY_ARCHITECTURE.md` — supersession banners added

The document carries four status sections from successive passes (§11, §13, §15, §20.13), the first
three of which are superseded but were reachable without any indication of that. A reader landing on
§11 or §13 could act on overtaken guidance — §20.4 in particular reverses §13's implementation
ordering.

A one-line **SUPERSEDED** banner pointing to the current status (§20.13) and current ordering (§20.4)
was added at the head of §11, §13 and §15. **Their content was not rewritten**, per this document's own
stated convention (§20.4 item 1: *"This supersedes §14.10's ordering for anyone reading forward; §14.10
is not rewritten"*).

A **precedence banner** was added to §19 naming
`DECISIONS/2026-09-07-phase-9-safety-decisions-ratification.md` as the authoritative source for the
ratified A1/B3/C2 semantics, resolving the `PROJECT_AI_PROTOCOL.md` §31 competing-source-of-truth
condition without deleting the restatement.

### 3. Considered and deliberately NOT done

- **Splitting any large document.** Rejected: §31 prefers extending an authoritative document over
  duplicating it, §39 already prescribes targeted navigation over small files, and the corpus is
  densely self-citing (`MASTER_TOPIC_UNIVERSE` is referenced by 25 files, `PROJECT_AI_PROTOCOL` by 20,
  `APP_DECISION_GAPS` by 17). Each large file is one conceptual object.
- **Deleting the duplicated PHASE_9 §19.1–§19.5.** Rejected after field-by-field comparison against the
  decision record: six internal references depend on those anchors (§20.0's label-collision table,
  §20.2, §20.6), and §19.4's downstream-consequence analysis is **not** carried by the record. Marking
  precedence achieves the §31 goal at no structural risk.
- **Consolidating the four status sections into one.** Rejected: §11/§13/§15 are cited seven times
  internally and form an append-only audit trail that later passes correct *by reference*.
- **`DECISION_LOGIC_SPECIFICATION.md` §3** (651 of 945 lines). Left as-is — Gate-5-closed and
  structurally consistent with the other domain registers. Recorded so a future audit need not
  re-derive it.
- **The 2,813-line Krause TOC file.** Left untouched; it is a mechanical table-of-contents extraction,
  i.e. data rather than prose.

**Invariants verified after the changes:** 112 unique `DEC` IDs unchanged (`PROJECT_AI_PROTOCOL.md`
§30); both inbound references to the Phase 9 document still resolve; all five `§19.x` anchors intact;
CRLF line endings preserved throughout.

---

## Phase 9 — Implementation Milestone 1 — 2026-09-08

**"Food Identity + Exclusion Foundation" (bounded by `PHASE_9_APPLICATION_CAPABILITY_ARCHITECTURE.md`
§20.12/§20.5) is complete, foundation-scoped.** This is the first production code written in Phase 9 —
it supersedes this file's earlier "Explicitly not started: any production code, schema, API, UI..."
line above, which correctly described the architecture-only state as of 2026-09-07 and is left
unedited as a historical record.

**What shipped:** `DEC-053`'s A1 split (allergy/unclear → hard exclusion, intolerance → soft
constraint) is now enforced in `src/lib/foodExclusions.ts`, `comboMatch.ts`, and `MealFoodPicker`.
`DEC-061`'s B3 hybrid exclusion unit is implemented on its food-level half (a reason-tagged
`food_exclusions` JSONB column, `supabase/13-personal-plan-food-exclusions.sql`, replacing the old
undifferentiated `excluded_food_ids`). A deterministic canonical-Food-identity mechanism
(`nutrition.name_tr` + exact-match `aliases[]`) was verified safe to reuse rather than replaced, and a
regression test now guards that fuzzy matching (`isCloseMatch`/`findCanonicalName`) can never reach
the exclusion-safety path.

**What deliberately did not ship:** B3's allergen-class half is a type-level foundation only
(`Nutrition.allergenClasses?`, `AllergenClassExclusion`, `hasAllergenClassExclusion()`) — not wired
into any enforcement path, because no allergen vocabulary, no per-food allergen mapping, and no
unmapped-food default policy exist anywhere in this project. C2 (temporary/validity-window
exclusions) was not implemented — the ratification record proposes no schema for it, and none was
invented here. Both stops match `PROJECT_AI_PROTOCOL.md` §28 (no premature implementation) and were
reported rather than resolved silently.

No `DEC` was amended and no `DEC` ID was created. `DEC-053`, `DEC-061`, `DEC-011`, `DEC-054` are
unmodified. Recipe/shopping-architecture, `DEC-067`, `DEC-069`, `DEC-099`/`DEC-100`, and clinical
functionality remain untouched.

**Verification:** 35/35 tests passing (`vitest run`), `tsc -b` clean, `npm run build` clean. Full
detail: `docs/SESSION_CHECKPOINT.md`, "Implementation Milestone 1" section.

---

## Phase 9 — PSM Iteration 1 + Browser QA #1 — 2026-09-10

**Supersedes the "Current next task" line in the Phase 9 section above** (extend the capability-architecture
artifact). Phase 9 implementation now proceeds under the **Progressive Sanding Model (PSM)**: build a broad,
coherent, working MVP surface, then sand it down through cumulative real-system browser QA, rather than
finalizing every decision before writing code. PSM is an execution method inside Phase 9 — it opens no gate,
amends no `DEC`, and closes nothing. Gate 7 (end of Phase 9) remains unreached.

**PSM Iteration 1 shipped** (`b09d90b`, merged to `master`). Artifact:
`08_APP_TRANSLATION/PSM_ITERATION_1_IMPLEMENTATION_LEDGER.md` — an implementation-triage view of all 112
decisions plus the provisional choices actually shipped. Four **MVP-1 PROVISIONAL** decisions were
implemented: `DEC-046` (baseline fluid needs), `DEC-009` (profile-data plausibility check), `DEC-033`
(protein distribution across occasions), `DEC-071` (meal plan → shopping list consolidation). Each is tagged
inline in the codebase as `MVP-1 PROVISIONAL / REVISIT AFTER QA-1`. **A provisional choice is not a
ratification** — no canonical `DEC` record changes status except through its own ratification process. The
ledger does not replace `APP_DECISION_INVENTORY.md` or any ratification record.

**Browser QA #1 run 2026-09-10 — status PARTIAL.** Artifact:
`08_APP_TRANSLATION/PSM_ITERATION_1_BROWSER_QA.md`. First real authenticated pass of this PSM cycle
(onboarding, Personal Plan, Meal Plan, Shopping, Consumption) against `npm run vercel:dev` on the real
Supabase instance. All four PSM-1 provisional decisions click-tested successfully — no changes needed.

**Two migration regressions found, both open, neither caused by PSM-1:**

- **`§6.1` — CRITICAL / SAFETY / P0.** `api/personal-plan.ts` (the Vercel port of the retired Netlify
  function) dropped `food_exclusions`, `excluded_food_ids`, and `allergen_class_exclusions` from its read
  `SELECT_COLS` and from its write body type, validation, and payload. Food-level and allergen-class
  exclusions entered in Personal Plan are **silently never persisted** — reproduced live, with the excluded
  food reappearing unfiltered in the meal-plan picker after a full reload. This regresses `DEC-061`'s B3
  closed-decision safety guarantee and contradicts the app's own "Önerilmesin" copy. Fix is mechanical:
  restore the three fields, matching the retired Netlify implementation (`git show
  99f4f44^:netlify/functions/personal-plan.ts`).
- **`§6.2` — DATA/ARCHITECTURE / P1.** `api/meal-entries.ts` dropped `combo_id`/`batch_id` the same way,
  breaking combo attribution and `DEC-069` batch-cooking linkage for entries created since the migration.

No fix was made during QA, per that task's own rules. No `DEC` was amended and no `DEC` ID was created.

**Current next task:** fix the `§6.1` P0 exclusion-persistence regression, then `§6.2` — both ahead of any
further PSM iteration. Resume PSM sanding (and the deferred `§4.3` product-design / `§4.2` data-requirement
items of `PHASE_9_APPLICATION_CAPABILITY_ARCHITECTURE.md`) after that.

---

## DEC Register & Readiness Vocabulary — 2026-09-10

**`nutrition-curriculum/DEC_REGISTER.md` is now authoritative for each decision's implementation
readiness.** All 112 decisions appear as individual rows (ranges expanded) with a plain-word readiness
value alongside the original `A`–`H` category, so the register and the ledger can always be reconciled.

**Vocabulary**, mapped one-to-one from `PSM_ITERATION_1_IMPLEMENTATION_LEDGER.md` §3: `SHIPPED` (A, 13),
`READY` (B, 0), `PROVISIONAL` (C, 5), `DEFERRED` (D, 7), `BLOCKED` (E, 72), `COVERED` (F/G/H, 15).
`READY` and `PROVISIONAL` are deliberately distinct — a provisional MVP choice must never be hardened
into a permanent one by an implementer. `COVERED` is deliberately distinct from `SHIPPED` — it means
the app has something adequate in that space, a candidate for later sanding, not a closed item.

**No decision was re-triaged, amended, or reclassified.** The register transcribes the existing triage;
the per-word totals were verified against the ledger's own declared counts at bootstrap and matched on
all six buckets. `DEC-061` is the one row a single word cannot carry (`A (food-level) / E
(allergen-class)`); it reads `SHIPPED` with the split stated in its Note.

**Also:** a readiness-precedence banner added at the head of the ledger's §3 (content not rewritten, per
`PROJECT_AI_PROTOCOL.md` §31); a new top-level `nutrition-curriculum/README.md` as the corpus entry
point; the 7 broken relative links in `02_TOC_AND_SOURCE_ANALYSIS/README.md` repaired — the defect
recorded in this file's reorganization log is now closed.

**Maintenance rule:** any change to a decision's readiness updates `DEC_REGISTER.md` in the same commit.
**There is no automated guard** — this project carries no test suite, and none is to be added (see
`CLAUDE.md`). When editing the register, run a throwaway check by hand and delete it afterwards: exactly
112 rows `DEC-001`–`DEC-112`, only the six words, each word consistent with its own `A`–`H` category,
and the per-word row totals equal to the counts the register declares in its own legend table. The
design spec's §5 lists these. Accepted risk: a hand-edit that changes a row without its legend count
goes unnoticed until someone runs that check.

**Verification at the time of writing:** the checks above were run and passed (112 rows;
13/0/5/7/72/15), and the per-word totals were confirmed once against the ledger's own declared counts,
which is what establishes the transcription as faithful. `tsc -b` and `npm run build` clean.

**Unchanged:** the two open migration regressions from Browser QA #1 (§6.1 P0 exclusion persistence,
§6.2 P1 `combo_id`/`batch_id`) remain the current next task. Nothing in this pass touched `api/`.

---

## §6.1/§6.2 Fixed, Corpus Navigation, DEC Register Correction, Handoff Tracker — 2026-09-11

**Supersedes the "current next task" line above.** Both open migration regressions from Browser QA #1
were fixed: `api/personal-plan.ts` (`food_exclusions`/`allergen_class_exclusions`/`excluded_food_ids`)
and `api/meal-entries.ts` (`combo_id`/`batch_id`), commit `53d10eb`. This landed before the present
session and was never recorded here — noted now for the record; the fix itself is not part of this
pass.

**`nutrition-curriculum/README.md`:** added a long-document navigation rule (headings/anchors/targeted
search over reading 1,000–24,000-line documents in full; split only on a genuine semantic boundary,
never to shorten) and a **Curriculum → Product Translation Mindset** section (scientific validity →
decision usefulness → user usability → product/market value; simplify the translation layer under
conflict, never weaken safety/science; tied to the Progressive Sanding Model). Both sit near the
existing "If you are an agent working in this corpus" guidance. No project facts, DEC counts, phase
status, or links were altered.

**`DEC_REGISTER.md` — post-PSM-1 semantic consistency audit.** Two rows corrected against authoritative
sources (Gate 6 ratification record, `APP_DECISION_INVENTORY.md`'s dependency chain, and the ledger's
own §6 carry-forward note):

- `DEC-011` `PROVISIONAL` → `BLOCKED` — its MVP choice needs a human-applied `updated_at` schema
  migration on `personal_plan` that was deliberately withheld; not pickup-able despite the ledger's `C`
  origin.
- `DEC-048` `SHIPPED` → `BLOCKED` — Gate 6 ratified real, unimplemented content (a +1–1.5 L/day altitude
  additive), but the decision transitively depends on `DEC-047` and `DEC-096`, both already `BLOCKED`;
  `DEC-046`'s own note independently confirms `DEC-048` is "not incorporated."

A new **`PARTIAL`** readiness word (7th, alongside the original six) was added for `DEC-061`, which
splits cleanly into an implemented/verified half (food-level filtering) and a data-coverage-blocked half
(only 19/89 foods carry allergen-class mappings) — no existing word could carry that without either
overstating or understating one half. Vocabulary counts now: `SHIPPED` 11, `READY` 0, `PROVISIONAL` 4,
`DEFERRED` 7, `BLOCKED` 74, `COVERED` 15, `PARTIAL` 1 (sums to 112). `README.md`'s summary line synced
to match. No other DEC, decision content, or PSM category was touched.

**New: `IMPLEMENTATION_HANDOFF.md` + `09_HANDOFF_SPECS/`.** A plan/spec ↔ implementation tracker for
work split between two collaborators (one plans/specs DECs, one implements). Status vocabulary
(`SPEC_DRAFTING`/`PUSHED`/`IN_PROGRESS`/`BLOCKED`/`DONE`), a hard one-active-item rule, self-certified
close-out (no review gate), and a `COL` resume keyword (documented in `CLAUDE.md`'s Git shorthand
section) that checks the Active table for a blocker first, otherwise resumes spec-drafting from the
last DEC in the Closed table. Per-DEC specs live in `09_HANDOFF_SPECS/`, one file per `_TEMPLATE.md`.
Cross-linked from this corpus's `README.md` and from `DEC_REGISTER.md`. **Both tables are currently
empty — no DEC has been pushed through this system yet.**

**Maintenance rule for this new tracker, recorded to prevent duplicate sources of truth:**
`IMPLEMENTATION_HANDOFF.md` does not feed this file on every `DONE` — only at a batch checkpoint (see
that file's own note). This entry is itself the first such checkpoint (a bootstrap one, at zero items).

**Current next task:** none blocking — PSM sanding (and the deferred `§4.3`/`§4.2` items of
`PHASE_9_APPLICATION_CAPABILITY_ARCHITECTURE.md`) may resume. First real use of the handoff tracker is
unstarted.

---

## Energy Individualization Research Spec — 2026-09-12

**New: `12_ENERGY_INDIVIDUALIZATION/`**, holding one cross-cutting research document,
`ENERGY_INDIVIDUALIZATION_RESEARCH_SPEC.md`, plus a folder `README.md`. Not a new phase — the folder
number continues the existing "folder numbers do not track phase numbers" discontinuity, and its
Directory Structure row reads Phase `9 (cross-cutting)`.

**Subject:** how the application would move its energy figure from a population formula to the user's
own observed response. The concrete trigger is `src/lib/mealPersonalization.ts`'s `calculateTargets()`
— Mifflin-St Jeor REE × a single-point PAL constant → maintenance → a fixed goal offset → macros, with
no observed-response input anywhere and `personal_plan` holding one `weight_kg` and no history.

**Deliberately not implementation-ready.** The document selects no formula, coefficient, threshold,
window, cadence, interval width or macro percentage; creates, renames, retires or amends no `DEC`; adds
no schema, migration, UI or API; and opens no `IMPLEMENTATION_HANDOFF.md` row (both its tables remain
empty). Every number in it is a cited external finding attributed to its source, never a project value.
`DEC_REGISTER.md` was read, not edited — still 112 rows, no readiness word changed.

**What it contains:** 18 sections — problem definition; the relevant `DEC` IDs with the §2 Principle
each stage boundary protects; 10 research questions tagged to decisions; 14 rated evidence domains;
five candidate architectures (A static / B weighted / C intake-balance back-calculation / D recursive
state estimator / E formula-prior-plus-observation-likelihood) compared but **not chosen**; required
inputs split into already-present / capturable-today / needs-a-new-subsystem; a `{value, interval,
source, evidence_basis, as_of}` output shape stated conceptually; longitudinal and data-quality
requirements; uncertainty representation extending `DEC-024`/`112`; the personalization loop with each
arrow labelled by its owning `DEC` and the Principle that forbids merging it; the one-directional
energy→macro and macro→meal boundaries mapped onto Phase 9 §1's five-layer model; open questions; the
human-approval list; implementation prerequisites in dependency order; and a hard not-yet fence.

**Two contradiction findings recorded, neither applied.** Both are written up in the new document's
§15 and listed in its §16; **no `DECISION_LOGIC_SPECIFICATION.md`, `DEC_REGISTER.md` or `DECISIONS/`
file was touched.**

1. `DEC-022`'s ±500 kcal is derived in `DECISION_LOGIC_SPECIFICATION.md` §3.1 from the ~3,500 kcal/lb
   approximation, which the 2013 IJO Thomas/Hall exchange finds systematically over-predicts loss
   because it ignores expenditure adaptation. Challenges the kcal↔rate **conversion** only —
   `DEC-027`'s 1–2 lb/week rate is externally sourced (`EVIDENCE_AND_CONTENT_INSPECTION_REGISTER.md`
   §3.9) and unaffected.
2. `DEC-018`/`DEC-019` cite 2005-era DRI/IOM PAL bands; NASEM 2023 supersedes that framework, changes
   the PAL category scheme, and publishes a SEPV — the uncertainty quantity `DEC-024` currently has no
   source for.

**One correction made in passing, to this document's own transcription only:** the commissioning
brief's readiness summary differed from `DEC_REGISTER.md` on three lines (baseline sufficiency is
`COVERED` ×3 not ×4; macro allocation `SHIPPED` ×4 not ×5, since `DEC-032` is `COVERED`;
uncertainty/governance `COVERED` ×2 not ×3). The register was treated as authoritative and left
unedited; the discrepancy is recorded in the new document's §2.

**Eight decisions now standing as requiring human approval** (new document §16): NASEM 2023 vs the 2005
PAL bands; re-deriving `DEC-022`'s kcal↔rate conversion; which architecture A–E; the `DEC-021`/`DEC-110`
deviation-cap value (Gate 5 §4.1 item 1, still open, retention not assumed); the `DEC-090`
circuit-breaker parameters (Gate 5 §4.1 item 2, still open); the minimum observation window and
weigh-in cadence; whether device/step data is admitted at all; and whether an energy-availability floor
gates deficit prescriptions for disclosed trainees.

**Current next task: unchanged** — none blocking; the entry above still stands. This pass added a
research layer and closed nothing.
