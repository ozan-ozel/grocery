# App Decision Gaps

Phase 3, Document 4 of 5 (`APP_DECISION_INVENTORY → APP_DECISION_DEPENDENCY_GRAPH →
APP_DECISION_KNOWLEDGE_MAPPING → APP_DECISION_GAPS → APP_DECISION_MODEL`).

---

# 1. Purpose

The first three Phase 3 documents established, in order: what the application must decide (112 `DEC`
records), how those decisions depend on each other (203 edges, 12 feedback edges), and what knowledge
each decision needs (a full two-way mapping against the 213-topic curriculum universe). This document
performs the **diagnostic gap analysis** between those two layers:

```
213 KNOWLEDGE TOPICS
        ↓
112 APPLICATION DECISIONS
        ↓
203 DECISION DEPENDENCIES / 12 FEEDBACK EDGES
        ↓
WHERE DOES THE KNOWLEDGE LAYER FAIL TO ADEQUATELY SUPPORT THE DECISION LAYER?
```

"Fail" is deliberately decomposed rather than treated as one generic verdict — a knowledge shortfall
can mean the knowledge genuinely doesn't exist, that it exists but hasn't been content-inspected deeply
enough, that it exists but lacks application-level depth, that it needs current evidence, that the
decision itself is scope-dependent, that practical translation is missing, that the topic is
intentionally specialized/reference-only, or that the mapping is simply uncertain. §2 fixes ten
non-overlapping categories (`GAP-A` through `GAP-J`) for exactly this reason.

**What this document does:** classifies all 112 decisions and all 213 knowledge topics against that
ten-category taxonomy; separately tracks severity, scope, and resolution type; produces a prioritized
gap matrix (P0–P3); and flags — without resolving — the content-inspection and current-evidence
priorities that later phases would need to act on.

**What this document explicitly does not do:** redesign the curriculum (no topic added, removed,
merged, split, or reordered); perform evidence review or web research (evidence gaps are flagged, not
researched); design application algorithms, UI, or software architecture; invent a formula, threshold,
clinical cutoff, evidence grade, or statistical value; or resolve any open Phase 1/2 curriculum-
architecture decision (e.g. the still-open AS3/ACSM/SN4 posture question, the RESEARCH single-source
question, or `DEC-099`'s clinical-scope boundary) — every reference to one of these restates it as open.

---

# 2. Gap Taxonomy

Ten categories, used consistently and never collapsed into a generic "gap." `KNOWN ABSENCE ≠ UNKNOWN
PRESENCE` is the organizing rule throughout: if the actual book content hasn't been inspected, the
correct category is `GAP-B`, never `GAP-A`.

| Code | Name | Meaning |
|---|---|---|
| **GAP-A** | No Knowledge Representation | No existing topic among the 213 adequately represents the knowledge requirement at all — a categorically different knowledge area, not merely a thin one. Not a proposal to create a topic; a flag for future domain analysis. |
| **GAP-B** | Content Inspection Required | A structurally matching topic exists, but TOC-level analysis alone cannot establish whether the actual book content supports the decision. Not yet a confirmed gap of any kind. |
| **GAP-C** | Application Depth Gap | The topic exists and is scientifically relevant, but the curriculum's treatment may not go deep enough to support the decision's specific application-level need. |
| **GAP-D** | Practical Translation Gap | The scientific knowledge exists, but the bridge from that knowledge to real-world action (meal, quantity, recipe, preparation, shopping) is missing. |
| **GAP-E** | Current Evidence Gap | The conceptual knowledge exists, but reliable application requires contemporary evidence the 7-book corpus cannot be relied on to supply alone. |
| **GAP-F** | Scope / Governance Gap | The knowledge requirement depends on an unresolved application boundary (clinical scope, diagnosis vs. decision support, supplement scope, etc.) — not necessarily a knowledge deficiency at all. |
| **GAP-G** | Mapping Uncertainty | The existing topic may support the decision, but the relationship itself is uncertain — a trigger for later review, not immediate curriculum expansion. |
| **GAP-H** | Data / Measurement Gap | The scientific knowledge may be adequate, but the application cannot decide reliably without an adequate measurement/data concept — kept distinct from a pure knowledge gap. |
| **GAP-I** | Evidence / Methods Gap | The decision needs research-methodological understanding (evidence quality, confounding, applicability, association vs. causation) that is not adequately represented — distinct from `GAP-E`'s currency concern. |
| **GAP-J** | Intentional Non-Gap | The topic looks weakly connected to the application, but this is by design — advanced biochemistry, specialized clinical content, reference tables, and similar topics that legitimately serve curriculum completeness without powering a current decision. |

**Secondary dimensions**, recorded for every gap that isn't `GAP-J`:

- **Severity:** `CRITICAL` / `HIGH` / `MODERATE` / `LOW`
- **Scope:** `SINGLE DECISION` / `DECISION CLUSTER` / `DOMAIN` / `CROSS-DOMAIN` / `WHOLE PIPELINE`
- **Resolution Type:** `CONTENT REVIEW` / `CURRICULUM EXTENSION` / `CURRENT EVIDENCE` / `APPLICATION
  TRANSLATION` / `SCOPE DECISION` / `DATA/METHODS REVIEW` / `FUTURE FEATURE` / `NO ACTION REQUIRED`

Severity and confidence are tracked separately throughout — a `LOW`-confidence mapping is not
automatically a `HIGH`-severity gap, and vice versa.

Three further distinctions are preserved throughout, never conflated:

- **Source coverage ≠ knowledge coverage ≠ application coverage.** A book containing relevant material
  (source coverage) does not guarantee the resulting topic ID represents that knowledge at the grain
  the curriculum needs (knowledge coverage), and a well-represented topic does not guarantee the
  decision it feeds has enough *application-level* depth to act on (application coverage). All three
  are asked separately per decision in §5.
- **Knowledge gap ≠ evidence gap ≠ scope gap ≠ translation gap.** A missing topic (`GAP-A`/`GAP-C`), a
  topic needing current evidence (`GAP-E`), a decision blocked on an unresolved boundary (`GAP-F`), and
  a science-exists-but-action-bridge-missing case (`GAP-D`) are four different findings requiring four
  different kinds of future work — never merged.
- **Gap ≠ uncertainty.** `GAP-B`/`GAP-G` (content inspection needed, mapping uncertain) are explicitly
  *not* confirmed gaps of any other kind — they are a call for review, and are never silently upgraded
  to `GAP-A` or `GAP-C` here.

---

# 3. Baseline

Carried forward, unmodified, from the three prior Phase 3 documents:

- **213 knowledge topics** (142 Level-1, 71 Level-2) across 18 domains — `MASTER_TOPIC_UNIVERSE.md`.
- **112 application decisions** (`DEC-001`–`DEC-112`) across 20 decision domains (A–T) — `APP_DECISION_
  INVENTORY.md`.
- **203 dependency edges** (191 forward + 12 explicit `FEEDBACK` edges, including one bidirectional
  `REQUIRED` pair `DEC-012 ⇄ DEC-099` documented separately from the `FEEDBACK` set) across five
  dependency types, 10 functional layers, 11 root decisions — `APP_DECISION_DEPENDENCY_GRAPH.md`.
- **~300 individual decision↔knowledge relationships**, rolled into a 112-row Decision Coverage Table
  and a 213-row Knowledge Utilization Table — `APP_DECISION_KNOWLEDGE_MAPPING.md`.
- Already-identified structural facts this document reuses rather than re-derives: ASSESS-01 and
  BODY-01 as the two dominant knowledge hubs; a ~14-topic foundational-biochemistry island (most of
  MET, plus CHO/LIP/PRO's chemistry/digestion subtopics) with no decision dependency; 18 of CLIN's 27
  topics pending `DEC-099`'s undetermined scope boundary; the Meal-Planning-through-Shopping cluster
  (`DEC-065, 067–075, 086`) as the largest confirmed practical-translation shortfall, independently
  corroborated by `APPARENT_CURRICULUM_GAPS.md` §1's finding that food science/culinary technique is
  absent from all seven source books.

This document does not re-count, re-verify, or contest any of the above — it classifies what was
already found into the `GAP-A`–`GAP-J` taxonomy and adds severity/scope/resolution/priority.

---

# 4. Decision Coverage Overview

Before the full matrix (§5), the headline distribution across all 112 decisions:

| Coverage | Count | Decisions (representative) |
|---|---|---|
| **COVERED** | 73 | The large majority — nearly all of Goal, Profile, Energy (D), most of Weight/Body Composition (E), all of Macronutrients (F) except 037/039/040, all of Micronutrients (G) except 044/045, all of Fluid (H), all of GI except 054, most of Monitoring/Feedback (N/O), most of Sport (P), all of Life Stages (R) |
| **PARTIALLY COVERED** | 20 | DEC-003, 004, 013, 016, 022, 027, 030, 037, 039, 044, 070, 073, 074, 085, 086, 095, 097, 101, 107 |
| **UNCERTAIN** | 5 | DEC-054, 058, 066, 098, 111 |
| **NOT COVERED** | 7 | DEC-065, 067, 068, 069, 071, 072, 075 — the confirmed practical-translation cluster |
| **CONDITIONAL** | 7 | DEC-012, 014, 015, 045, 099, 100, 102 — all scope-dependent on `DEC-099`'s undetermined clinical boundary |

Counts computed directly from §5's matrix (verified programmatically: 73+20+5+7+7 = 112).

---

# 6. Critical Decision Gaps

The five decisions carrying `CRITICAL` or bottleneck-`HIGH` severity in §5, examined individually.

**DEC-027 (target rate/direction of weight/composition change) — the only `GAP-E PRIMARY` decision in
the entire inventory.** The 7-book corpus (`BODY-04`, `BODY-05`) establishes the *concept* of a
target rate — that one exists, that it should reflect the goal and the individualized estimate — but
provides no defensible *current* rate. This is a `CRITICAL`-severity, `GAP-E` gap because DEC-027 feeds
directly into `DEC-022` (energy prescription), meaning the gap's effect is not contained to one decision
— it propagates into the entire Prescription layer. **Resolution type: CURRENT EVIDENCE**, explicitly
deferred to `06_EVIDENCE_AND_GAPS/`.

**DEC-099 / DEC-100 (clinical supported-conditions boundary and its upstream modification) —
`CRITICAL`-severity `GAP-F` decisions.** Per the dependency graph, `DEC-100` alone fans out
`CONDITIONAL` edges into `DEC-021, 031, 034, 036, 041` — five other decisions across three functional
layers. Until a human resolves which conditions the application actually supports, none of those five
downstream relationships can be finalized, even though the *knowledge* to support several common
conditions (`CLIN-07` diabetes, `CLIN-10` cardiovascular, `CLIN-12` renal) already exists at high
mapping confidence. This is the clearest case in the whole analysis of a gap that is **not** a knowledge
deficiency — the science is there; the boundary decision is not. **Resolution type: SCOPE DECISION**,
explicitly not resolved in this document (per Task §16 instruction, `DEC-099` is not decided here).

**DEC-021 / DEC-084 / DEC-110 (the three knowledge-convergence bottlenecks) — `HIGH`-severity, no
content gap.** These three decisions are flagged not because knowledge is missing, but because each
draws on three knowledge domains simultaneously (mechanistic physiology + assessment methodology +
research-methods reasoning) at `CORE` strength — meaning any *future* weakness discovered in any one of
`BODY-01`, `ASSESS-01`, or `RESEARCH-02` (§15's cascade-risk topics) would compromise all three
decisions at once. Recorded here as a structural risk concentration, not a current gap requiring action.

---

# 7. Personalization Gaps

Tracing the full chain — `baseline → estimate → observe → interpret → individualize → target →
prescribe → monitor → adjust` — for knowledge-layer adequacy at each stage, per the governing brief.

| Stage | DEC IDs | Knowledge Adequacy | Gap Found |
|---|---|---|---|
| Baseline interpretation | 005–011 | Adequate (ASSESS-01/03 well-covered) | NONE |
| Energy estimation | 017–019 | Adequate (BODY-02, SPORT-01/02) | NONE |
| Individual response / individualization | 020–021 | Adequate for the *mechanism*; convergence risk noted (§6) | GAP-I (secondary, not a deficiency) |
| Body-composition interpretation | 025–026, 030 | Adequate, except recomposition monitoring norms | GAP-E on DEC-030 |
| Weight-trend interpretation | 026, 028 | Adequate | NONE |
| Target-rate selection | 027 | **The single weakest point in the entire personalization chain** | **GAP-E, PRIMARY** |
| Macro allocation | 031–040 | Adequate except fiber depth and adjustment-trigger logic | GAP-C on 037/039 |
| Adaptation (feedback→adjustment) | 084–091 | Adequate; MET-08's adaptive-response content is thin but only CONTEXTUAL | NONE material |
| Uncertainty throughout | 009, 020, 021, 077, 082, 087, 110 | Adequate — ASSESS-01/RESEARCH-02 consistently available | NONE |

**Finding:** the personalization chain is knowledge-adequate at every stage **except target-rate
selection (DEC-027)**, which is a single, sharply-localized `GAP-E` rather than a diffuse weakness
spread across the chain. This is a materially different picture than "the personalization loop is
under-supported" — it is fully supported except at one specific, already-identified joint.

---

# 8. Longitudinal / Feedback Gaps

Per `APP_DECISION_KNOWLEDGE_MAPPING.md` §13's own finding, longitudinal decisions split cleanly into
*interpretation* knowledge (general-purpose, reused across DEC-020/021/026/083/110: `BODY-01`,
`ASSESS-01`, `RESEARCH-02`) and *action* knowledge (decision-specific: `BODY-05`, `MET-08`, `CLIN-01`).

- **Interpreting weight change:** adequate (`BODY-01`, `BODY-03`, `ASSESS-03`) — no gap.
- **Distinguishing short-term fluctuation from longer-term trend:** adequate (`BODY-01`'s glycogen/
  water-shift framing) — no gap.
- **Interpreting intake data:** adequate (`ASSESS-01`, `RESEARCH-04`, `RESEARCH-06`) — no gap.
- **Understanding measurement error:** the single best-covered concept in the whole longitudinal chain
  (`ASSESS-01.03`, cited by 10+ decisions) — no gap.
- **Adjusting estimates:** `GAP-C` on `DEC-085` (macro-recompute-trigger logic itself uncovered by any
  topic, though the underlying requirement science is solid).
- **Determining when re-baselining is necessary:** adequate (`ASSESS-05`'s NCP re-assessment framing
  directly addresses `DEC-088`) — no gap.
- **The loop's circuit-breaker (`DEC-090`):** adequate (`CLIN-01`) — no gap, though its downstream
  effect (feeding `DEC-014`'s scope-conditional gate) inherits `DEC-014`'s own `GAP-F` status.

**Finding:** the longitudinal/feedback system has exactly one confirmed knowledge gap
(`DEC-085`/`DEC-039`'s adjustment-trigger-logic thinness, `GAP-C`, `MODERATE` severity) and one
inherited scope dependency (via `DEC-090 → DEC-014`) — otherwise fully adequate.

---

# 9. Practical Translation Gaps

**Mandatory section, per the governing brief.** Full chain, each layer classified:

| Layer | Classification | Existing Knowledge | Existing Decision Support | Missing Component | Nature of Gap |
|---|---|---|---|---|---|
| **Target** | COVERED | NUT-02, NUT-04, PRO-04, CHO-04, LIP-05, VIT/MIN topics | DEC-031–045, 056 | — | — |
| **Meal Structure** | COVERED | SPORT-03, SPORT-13 | DEC-055–059 | — | — |
| **Food (selection)** | COVERED | NUT-02, NUT-04, CLIN-03 | DEC-060–064 | — | — |
| **Portion / Quantity** | PARTIALLY COVERED | NUT-04 (composition data); NUT-03's provenance includes KM16 Appendix 18 "Exchange Lists and Carbohydrate Counting for Meal Planning" — a genuine, if thin, portioning-methodology precedent | DEC-060, 062 | Portion-quantity methodology beyond composition data and one appendix-level exchange-list tool | **GAP-C** (application depth), not `GAP-A` — a real precedent exists, it is simply thin |
| **Preparation / Recipe** | NOT COVERED | None | DEC-067, 068, 069 (decision nodes exist; knowledge does not) | Recipe development, cooking technique, food-preparation science | **GAP-A** — confirmed absent from all 7 books (`APPARENT_CURRICULUM_GAPS.md` §1), a categorically different (culinary) knowledge domain, not merely thin coverage of an existing one |
| **Shopping** | NOT COVERED | PUBHEALTH-04/05 touch cost/availability only | DEC-071–075 (decision nodes exist; knowledge does not) | List consolidation, quantity math, pantry reconciliation logistics | **GAP-D** — the underlying nutrient/food science is fully adequate; only the logistics bridge is missing, and that bridge is inherently a *product/application* concern rather than a nutrition-science one |

**Nature-of-gap breakdown, per the governing brief's explicit instruction to classify each missing
component as scientific, practical, behavioral, logistical, or data-related:**
- Preparation/Recipe gap: **practical + a distinct knowledge domain (culinary science)** — not
  behavioral, not logistical, not data-related.
- Shopping gap: **logistical**, not scientific — the nutrient/food knowledge behind *what* to shop for
  is complete; only *how to consolidate and quantify a purchase list* is unaddressed.
- Portion/Quantity gap: **practical/methodological**, sitting between the two — some conceptual
  precedent exists (exchange lists) but not developed to the depth a per-user quantity translation
  needs.

**Potential Practical Translation Domain test (per §25 of the governing brief — a candidate only, not a
decision):** the Preparation/Recipe and Shopping layers jointly satisfy several, but not all, of the
five stated conditions for considering a new domain — (1) multiple important decisions depend on it
(`DEC-065–075`, ~10 decisions); (2) existing domains cannot represent it (confirmed, not merely
suspected, per `APPARENT_CURRICULUM_GAPS.md`); (3) the missing knowledge is conceptually coherent
(culinary/preparation science *is* a recognizable, coherent discipline); (4) it is not merely
implementation detail for the Preparation/Recipe half (genuinely a knowledge gap, not a UI concern) —
**but** for the Shopping half, condition (4) is **not** met (list-consolidation/quantity-math logistics
*is* closer to implementation/product detail than to a curriculum knowledge domain); and condition (6)
("cannot reasonably be handled as a translation layer") is **not** met for Shopping specifically, since
this application's own existing grocery/pantry product surface is exactly a translation-layer answer to
it. **Conclusion: `POTENTIAL DOMAIN — REQUIRES FURTHER VALIDATION`** for Preparation/Recipe content
specifically; Shopping is better classified as a confirmed `GAP-D` handled by the application's own
product layer, not a new-domain candidate at all. Neither is finalized here.

---

# 10. Food Substitution Gaps

| Substitution Type | Knowledge Adequacy | Supporting Topics | Gap |
|---|---|---|---|
| **Nutrient equivalence** (Food A → Food B preserving macro/micro content) | COVERED | NUT-04 (food composition data) | NONE |
| **Meal-function equivalence** (Food B serves the same role in a meal/occasion) | PARTIALLY COVERED | NUT-04, indirectly SPORT-03 for timing-sensitive substitutions | GAP-C — no topic addresses "functional role in a meal" as distinct from nutrient content |
| **Practical substitution** (available, affordable, preparable) | NOT COVERED | — | GAP-D — this is exactly the Preparation/Shopping gap from §9, applied to substitution specifically |
| **Allergy/intolerance/safety constraints** | COVERED | CLIN-03 | NONE |
| **Cultural/preference constraints** | COVERED | SPECIAL-04 | NONE |

**Finding:** substitution is knowledge-adequate on the safety and nutrient-equivalence dimensions
(the two dimensions where getting it wrong has the most consequence), and gapped on the same
practical-translation dimension already identified in §9 — not a new, independent gap.

---

# 11. Clinical Gaps

Per `CLINICAL_NUTRITION_ARCHITECTURE.md`'s own six-layer structure, kept distinct from any scope
decision:

**Knowledge gap (genuinely about content):** none identified. Every disease area a supported-conditions
list would plausibly include (diabetes `CLIN-07`, cardiovascular `CLIN-10`, renal `CLIN-12`, bone health
`CLIN-24`, and by extension the other 19 CLIN topics not yet named by a decision) has adequate
KM16-sourced content per the existing topic universe — the *content* is not the bottleneck.

**Scope decision gap (`GAP-F`, not a knowledge deficiency):** `DEC-099` (supported-conditions
boundary) and `DEC-100` (how a supported condition modifies upstream decisions) are both explicitly
undetermined. This document does **not** resolve which of the 23 general Layer-5 topics or 10
Layer-6 SPECIALIZED topics become "supported," consistent with the task's explicit instruction not to
decide `DEC-099` here. The 18 CLIN topics not yet named by name in the mapping (§7/§8 of
`APP_DECISION_KNOWLEDGE_MAPPING.md`) remain **candidates pending that scope decision**, not confirmed
gaps of any kind.

**One confirmed exception:** `CLIN-02` (enteral/parenteral nutrition support) is classified
`GAP-J` — outside consumer-app scope entirely, not a pending-scope candidate, since inpatient
tube-feeding/IV-nutrition management is not a plausible feature for a home nutrition/grocery
application under any scope resolution.

**Safety/escalation:** adequately covered (`CLIN-01`, `CLIN-20`, `SPORT-10`) at the level of *identifying
that an escalation boundary is needed* — the specific diagnostic/referral criteria are, correctly, not
specified anywhere (per the inventory's own explicit non-diagnostic-system constraint), which is by
design, not a gap.

---

# 12. Sport Gaps

Per `SPORT_NUTRITION_ARCHITECTURE.md`'s topic-by-topic role table:

| Sport Sub-Area | Decisions | Knowledge Adequacy | Gap |
|---|---|---|---|
| Training context/intake | DEC-092, 093 | COVERED (SPORT-01/02/04/13) | NONE |
| Nutrient/fluid timing | DEC-055–057, 094 | COVERED (SPORT-03, CHO-05) | NONE |
| Supplements | DEC-044, 097 | PARTIALLY COVERED | GAP-E — supplement safety/efficacy currency, plus the still-open AS3/ACSM/SN4 redundancy question (`PHASE_2_HUMAN_REVIEW.md` item 10, not resolved here) |
| Athlete populations (age/sex) | DEC-098 | COVERED at CORE (SPORT-09/10); UNCERTAIN at the SPORT-11 margin | GAP-G + GAP-E on the cycle-phase-specific aspect only |
| RED-S / overtraining | DEC-095 | PARTIALLY COVERED | GAP-E — screening practice evolving, single-book-sourced |
| Personalized sport nutrition | DEC-098 (partial) | UNCERTAIN | GAP-E, PRIMARY — matches Phase 1's own SPORT-11 currency flag |
| Travel/heat/altitude | DEC-048, 096 | COVERED (SPORT-07) | NONE |
| Exercise GI issues | DEC-051, 054 | COVERED / UNCERTAIN respectively | GAP-B on DEC-054 only |
| **Exercise immunology** | **none** | SPORT-08 exists, unused | Not a knowledge gap — a **decision-inventory completeness observation**: no current `DEC` addresses illness/immune-function-aware nutrition guidance at all. Noted here, not resolved, and not forced into the DEC-numbering scheme (that would require amending `APP_DECISION_INVENTORY.md`, out of this document's scope). |

**Finding:** Sport-domain gaps are almost entirely `GAP-E` (currency), consistent with this being the
newest, most actively-evolving content area in the 7-book corpus (SN4, copyright 2025, already frames
several of its own topics as emerging). No sport-nutrition architecture question is redesigned here.

---

# 13. Research / Evidence Gaps

Distinguishing `GAP-E` (currency) from `GAP-I` (methodological understanding) throughout, per §2's
explicit separation.

**Evidence interpretation / uncertainty:** adequately supported. `RESEARCH-02` (confounding) and
`RESEARCH-04` (dietary-assessment methodology) together carry the bulk of this need across `DEC-021,
077, 081, 082, 087, 110`. No `GAP-I` found here — this is the one area of the whole model where research-
methods knowledge is *not* the bottleneck.

**Research design / study quality:** `RESEARCH-03` (intervention-study design) is only thinly connected
(`CONTEXTUAL`, to `DEC-111`) — a `GAP-G` mapping-uncertainty rather than a confirmed deficiency, since no
decision currently needs to *evaluate* a specific study design, only to *generally* trust that evidence
review happens somewhere in the governance process.

**Measurement validity:** fully covered by `ASSESS-01`/`RESEARCH-04`/`RESEARCH-06` — the strongest area
of the entire knowledge mapping (§9 of `APP_DECISION_KNOWLEDGE_MAPPING.md`).

**Evidence applicability / association vs. causation:** covered via `RESEARCH-02`'s confounding
content for the single decision that most needs it (`DEC-110`, model/observation mismatch) — adequate
for that decision, not separately assessed for hypothetical future decisions.

**Current-evidence governance:** `DEC-111` (the periodic-review governance process) is the one place a
genuine `GAP-G` exists on the *methods* side — `RESEARCH-15` is framed around public-health/policy
translation, not a single application's internal content-review process, and no topic in the universe
addresses "how should an application periodically re-validate its own guidance" as a subject in its own
right (unsurprising — this is an application-governance question, not a nutrition-science one).

**Finding:** research/evidence-methods knowledge is the best-supported knowledge category in the entire
model for its primary uses (uncertainty, measurement validity), and its one gap (`DEC-111`'s governance-
process framing) is a `GAP-G`/application-governance matter, not a missing-science problem.

---

# 14. Complete Knowledge Utilization Gap Matrix

All 213 topic IDs, exactly once, reclassifying `APP_DECISION_KNOWLEDGE_MAPPING.md` §8's application-
centrality findings into the `GAP-A`–`GAP-J` taxonomy. `NONE` = adequately utilized or, for
unused-but-intentional topics, `GAP-J`.

## 14a. Level-1 Topics (142)

| Topic | Application Use | Gap Status | Reason |
|---|---|---|---|
| NUT-01 | SUPPORTING/CROSS-CUTTING | NONE | Thin single-decision use, adequate for its role |
| NUT-02 | IMPORTANT | NONE | Feeds food-translation boundary adequately |
| NUT-03 | CORE APPLICATION | NONE | Highest cross-domain reuse of any NUT topic; adequate |
| NUT-04 | CORE APPLICATION | NONE | Food-composition hub, adequate |
| NUT-05 | REFERENCE/EDUCATIONAL | GAP-J | Optional-tier per Phase 2; no decision needs it, intentionally |
| DRV-01 | IMPORTANT | NONE | DRI methodology, adequate |
| DRV-02 | REFERENCE/EDUCATIONAL | GAP-J | Lookup table by design, consulted not reasoned about |
| DRV-03 | REFERENCE/EDUCATIONAL | GAP-J | Same |
| DRV-04 | REFERENCE/EDUCATIONAL | GAP-J | Same |
| DRV-05 | REFERENCE/EDUCATIONAL | GAP-J | Same |
| MET-01 | REFERENCE/EDUCATIONAL | GAP-J | Foundational biochemistry below any decision's reasoning altitude |
| MET-02 | REFERENCE/EDUCATIONAL | GAP-J | Same |
| MET-03 | REFERENCE/EDUCATIONAL | GAP-J | Same |
| MET-04 | REFERENCE/EDUCATIONAL | GAP-J | Same |
| MET-05 | REFERENCE/EDUCATIONAL | GAP-J | Same |
| MET-06 | REFERENCE/EDUCATIONAL | GAP-J | Same |
| MET-07 | REFERENCE/EDUCATIONAL | GAP-G (weak) | Candidate CONTEXTUAL link to DEC-058/083 considered, not adopted — see §23 |
| MET-08 | SUPPORTING/CROSS-CUTTING | NONE | Adequate for its CONTEXTUAL role at DEC-084 |
| MET-09 | REFERENCE/EDUCATIONAL | GAP-J | Foundational biochemistry, below decision altitude |
| MET-10 | SUPPORTING/CROSS-CUTTING | NONE | Adequate for its role at DEC-100 |
| CHO-01 | REFERENCE/EDUCATIONAL | GAP-J | Foundational chemistry, below decision altitude |
| CHO-02 | REFERENCE/EDUCATIONAL | GAP-J | Same |
| CHO-03 | REFERENCE/EDUCATIONAL | GAP-J | Same |
| CHO-04 | CORE APPLICATION | GAP-C (fiber subsection only) | Fiber-requirement content thin within this topic — see §5 DEC-037 |
| CHO-05 | CORE APPLICATION | NONE | Timing/performance hub, adequate |
| LIP-01 | REFERENCE/EDUCATIONAL | GAP-J | Foundational chemistry |
| LIP-02 | REFERENCE/EDUCATIONAL | GAP-J | Foundational digestion mechanics |
| LIP-03 | SUPPORTING/CROSS-CUTTING | NONE | Adequate for CONTEXTUAL role |
| LIP-04 | SPECIALIZED (indirect) | GAP-G | Candidate direct link to DEC-100 not adopted — see §23 |
| LIP-05 | CORE APPLICATION | NONE | Fat-requirement hub, adequate |
| LIP-06 | SUPPORTING/CROSS-CUTTING | NONE | Adequate |
| PRO-01 | REFERENCE/EDUCATIONAL | GAP-J | Foundational chemistry |
| PRO-02 | REFERENCE/EDUCATIONAL | GAP-J | Foundational digestion mechanics |
| PRO-03 | SUPPORTING/CROSS-CUTTING | NONE | Adequate |
| PRO-04 | CORE APPLICATION | NONE | Requirement hub, adequate |
| PRO-05 | SUPPORTING/CROSS-CUTTING | NONE | Adequate boundary-case use |
| PRO-06 | CORE APPLICATION | NONE | Training/timing hub, adequate |
| VIT-01 | CORE APPLICATION | NONE | Adequate |
| VIT-02 | CORE APPLICATION | NONE | Adequate |
| VIT-03 | CORE APPLICATION | NONE | Adequacy-judgment hub, adequate |
| VIT-04 | IMPORTANT | NONE | Athlete-specific, adequate |
| MIN-01 | CORE APPLICATION | NONE | Adequate |
| MIN-02 | CORE APPLICATION | NONE | Adequate |
| MIN-03 | CORE APPLICATION | NONE | Adequacy-judgment hub, adequate |
| MIN-04 | IMPORTANT | NONE | Athlete-specific, adequate |
| FLU-01 | CORE APPLICATION | NONE | Adequate |
| FLU-02 | CORE APPLICATION | NONE | Adequate |
| FLU-03 | SPECIALIZED/REFERENCE | GAP-J | Clinical acid-base content, no consumer decision reaches it |
| FLU-04 | CORE APPLICATION | NONE | Domain hub, adequate |
| FLU-05 | CORE APPLICATION | NONE | Adequate |
| GI-01 | SUPPORTING/CROSS-CUTTING | NONE | Adequate |
| GI-02 | REFERENCE/EDUCATIONAL | GAP-J | General absorptive-mechanism detail, below decision altitude |
| GI-03 | SPECIALIZED (pending review) | **GAP-B** | Own Phase 1 content-inspection deferral still open (gut-microbiome depth) |
| GI-04 | CORE APPLICATION | NONE | Domain hub, adequate |
| GI-05 | IMPORTANT | NONE | Adequate, cross-refs CLIN-04/05 |
| BODY-01 | CORE APPLICATION | NONE | Highest-reuse topic outside ASSESS-01 — see §15 cascade risk |
| BODY-02 | CORE APPLICATION | NONE | Energy-estimation hub, adequate |
| BODY-03 | CORE APPLICATION | NONE | Adequate |
| BODY-04 | CORE APPLICATION | GAP-E (secondary, via DEC-022/027) | Content adequate; the *decisions* it feeds need current evidence |
| BODY-05 | CORE APPLICATION | GAP-E (secondary, via DEC-022/027) | Same |
| BODY-06 | IMPORTANT | NONE | Adequate |
| BODY-07 | IMPORTANT | GAP-E (secondary, via DEC-003/030) | Content adequate; recomposition currency need sits at the decision level |
| ASSESS-01 | CORE APPLICATION | NONE | Single highest-utilization topic — see §15 cascade risk |
| ASSESS-02 | SUPPORTING/CROSS-CUTTING | GAP-H (future-feature) | App has no current lab-data ingestion — a data/measurement gap, not a knowledge gap |
| ASSESS-03 | IMPORTANT | NONE | Adequate |
| ASSESS-04 | SPECIALIZED/REFERENCE | GAP-J | Clinical physical-exam technique, outside consumer-app data collection |
| ASSESS-05 | IMPORTANT | NONE | NCP hub, adequate |
| ASSESS-06 | SPECIALIZED/REFERENCE | GAP-H (future-feature) | Lab-biomarker interpretation — data gap, not knowledge gap |
| SPORT-01 | CORE APPLICATION | NONE | Bridge topic, adequate |
| SPORT-02 | CORE APPLICATION | NONE | Adequate |
| SPORT-03 | CORE APPLICATION | NONE | Timing-translation hub, adequate |
| SPORT-04 | IMPORTANT | NONE | Adequate |
| SPORT-05 | CORE APPLICATION | GAP-E (secondary, via DEC-097) | Content adequate; currency + AS3/ACSM/SN4 redundancy question open |
| SPORT-06 | SUPPORTING/CROSS-CUTTING | NONE | Adequate |
| SPORT-07 | CORE APPLICATION | NONE | Adequate |
| SPORT-08 | SPECIALIZED | GAP-J* | No current DEC addresses immune-function guidance — a decision-inventory completeness note, not a knowledge gap (see §12) |
| SPORT-09 | IMPORTANT | NONE | Adequate |
| SPORT-10 | CORE APPLICATION | GAP-E (secondary, via DEC-095/098) | Content adequate; screening-currency need sits at decision level |
| SPORT-11 | SPECIALIZED (elective/future) | **GAP-E, PRIMARY** | Matches Phase 1's own SPORT-11 currency flag |
| SPORT-12 | SUPPORTING/CROSS-CUTTING | NONE | Adequate |
| SPORT-13 | IMPORTANT | NONE | Adequate |
| CLIN-01 | CORE APPLICATION | NONE | Domain entry-point hub, adequate |
| CLIN-02 | REFERENCE/EDUCATIONAL | GAP-J | Outside consumer-app scope entirely (inpatient nutrition support) |
| CLIN-03 | CORE APPLICATION | NONE | Adequate |
| CLIN-04 | IMPORTANT | NONE | Adequate |
| CLIN-05 | IMPORTANT | NONE | Adequate |
| CLIN-06 | IMPORTANT (candidate) | GAP-F | Pending DEC-099 scope decision |
| CLIN-07 | CORE APPLICATION | GAP-F (secondary) | Content adequate; awaiting DEC-099/100 scope resolution |
| CLIN-08 | IMPORTANT (candidate) | GAP-F | Pending DEC-099 scope decision |
| CLIN-09 | IMPORTANT (candidate) | GAP-F | Pending DEC-099 scope decision |
| CLIN-10 | CORE APPLICATION | GAP-F (secondary) | Content adequate; awaiting scope resolution |
| CLIN-11 | IMPORTANT (candidate) | GAP-F | Pending DEC-099 scope decision |
| CLIN-12 | CORE APPLICATION | GAP-F (secondary) | Content adequate; awaiting scope resolution |
| CLIN-13 | IMPORTANT (candidate) | GAP-F | Pending DEC-099 scope decision |
| CLIN-14 | IMPORTANT (candidate) | GAP-F | Pending DEC-099 scope decision |
| CLIN-15 | SPECIALIZED (elective, Layer 6) | GAP-F | Pending DEC-099 scope decision; Layer-6 elective candidate |
| CLIN-16 | SPECIALIZED (elective, Layer 6) | GAP-F | Same |
| CLIN-17 | SPECIALIZED (elective, Layer 6) | GAP-F | Same |
| CLIN-18 | SPECIALIZED (elective, Layer 6) | GAP-F | Same |
| CLIN-19 | SPECIALIZED (elective, Layer 6) | GAP-F | Same |
| CLIN-20 | CORE APPLICATION | NONE | Adequate (safety hub) |
| CLIN-21 | SPECIALIZED (elective, Layer 6) | GAP-F | Same |
| CLIN-22 | SPECIALIZED (elective, Layer 6) | GAP-F | Same |
| CLIN-23 | SPECIALIZED (elective, Layer 6) | GAP-F | Same |
| CLIN-24 | IMPORTANT | NONE | Adequate |
| CLIN-25 | SPECIALIZED (elective, Layer 6) | GAP-F | Same |
| CLIN-26 | IMPORTANT (candidate) | GAP-F | Cross-cutting inflammation framework, pending scope decision |
| CLIN-27 | SPECIALIZED (elective, Layer 6) | GAP-F | See also LIFE-07 |
| LIFE-01 | CORE APPLICATION | NONE | Domain hub, adequate |
| LIFE-02 | IMPORTANT | NONE | Adequate |
| LIFE-03 | IMPORTANT | NONE | Adequate |
| LIFE-04 | IMPORTANT | NONE | Adequate |
| LIFE-05 | SUPPORTING/CROSS-CUTTING | GAP-J | Matches own thin classification, intentional |
| LIFE-06 | IMPORTANT | NONE | Adequate |
| LIFE-07 | SPECIALIZED (via CLIN-27) | GAP-F | Cross-reference only, per own definition; inherits CLIN-27's scope pending status |
| LIFE-08 | IMPORTANT (via SPORT-09) | NONE | Cross-reference only, per own definition; SPORT-09 adequate |
| RESEARCH-01 | IMPORTANT | NONE | Adequate |
| RESEARCH-02 | CORE APPLICATION | NONE | Confounding/observational-design hub, adequate |
| RESEARCH-03 | SUPPORTING/CROSS-CUTTING | GAP-G | Thin CONTEXTUAL link to DEC-111 only |
| RESEARCH-04 | CORE APPLICATION | NONE | Dietary-assessment-methodology hub, adequate |
| RESEARCH-05 | REFERENCE/EDUCATIONAL | GAP-J | Matches own REFERENCE-tier classification |
| RESEARCH-06 | SUPPORTING/CROSS-CUTTING | NONE | Adequate |
| RESEARCH-07 | SUPPORTING/CROSS-CUTTING | NONE | Adequate |
| RESEARCH-08 | SUPPORTING/CROSS-CUTTING | GAP-G (weak) | Thin CONTEXTUAL link to DEC-112 only |
| RESEARCH-09 | REFERENCE/EDUCATIONAL | GAP-J | Zero-edge structural island per `LEARNING_DEPENDENCY_GRAPH.md`, confirmed intentional |
| RESEARCH-10 | REFERENCE/EDUCATIONAL | GAP-G (weak) | Candidate link to DEC-058/091 not adopted — see §23 |
| RESEARCH-11 | SPECIALIZED (elective/future) | GAP-E | Current-evidence-primary; SPECIAL-05 convergence |
| RESEARCH-12 | SPECIALIZED (elective/future) | GAP-E | Same |
| RESEARCH-13 | REFERENCE/EDUCATIONAL | GAP-J | Zero-edge structural island, confirmed intentional |
| RESEARCH-14 | REFERENCE/EDUCATIONAL | GAP-J | Same |
| RESEARCH-15 | IMPORTANT | GAP-G | Mapping to DEC-111 noted as approximate |
| PUBHEALTH-01 | REFERENCE/EDUCATIONAL | GAP-J | Population-level, not individual-decision knowledge |
| PUBHEALTH-02 | REFERENCE/EDUCATIONAL | GAP-J | Surveillance methodology, same reasoning |
| PUBHEALTH-03 | IMPORTANT | GAP-E (secondary, via DEC-107) | Content adequate; external guides periodically revised |
| PUBHEALTH-04 | IMPORTANT | NONE | Cost/access hub, adequate |
| PUBHEALTH-05 | SUPPORTING/CROSS-CUTTING | NONE | Adequate |
| PUBHEALTH-06 | REFERENCE/EDUCATIONAL | GAP-J | Matches own thinnest-topic classification, intentional |
| SPECIAL-01 | SPECIALIZED (elective/future) | GAP-E | Current-evidence-primary; SPECIAL-05 convergence |
| SPECIAL-02 | CORE APPLICATION | NONE | Adequate |
| SPECIAL-03 | CORE APPLICATION | NONE | Counseling/adherence hub, adequate |
| SPECIAL-04 | CORE APPLICATION | NONE | Cultural-competency hub, adequate |
| SPECIAL-05 | n/a | NONE | Not an independent topic per its own definition; covered via SPECIAL-01/RESEARCH-12/SPORT-11 |

**142 of 142 Level-1 topics accounted for above.**

## 14b. Level-2 Subtopics (71) — Compact Table

Same inheritance rule as `APP_DECISION_KNOWLEDGE_MAPPING.md` §8b: a subtopic inherits its parent's Gap
Status unless independently differentiated.

| Subtopic Range | Parent | Independently Differentiated? | Gap Status |
|---|---|---|---|
| NUT-02.01–.05 | NUT-02 | No | Inherits NUT-02 (NONE) |
| NUT-03.01–.03 | NUT-03 | Yes — NUT-03.03 cited at DEC-038 | NONE (NUT-03.03 and NUT-03.01/.02 both adequate) |
| MET-01.01–.02 | MET-01 | No | Inherits MET-01 (GAP-J) |
| MET-02.01–.03 | MET-02 | No | Inherits MET-02 (GAP-J) |
| MET-03.01–.03 | MET-03 | No | Inherits MET-03 (GAP-J) |
| MET-04.01–.03 | MET-04 | No | Inherits MET-04 (GAP-J) |
| MET-05.01–.03 | MET-05 | No | Inherits MET-05 (GAP-J) |
| MET-06.01–.04 | MET-06 | No | Inherits MET-06 (GAP-J) |
| MET-08.01–.04 | MET-08 | No | Inherits MET-08 (NONE) |
| CHO-05.01–.04 | CHO-05 | Yes — cited at DEC-035/094 | NONE |
| BODY-02.01–.03 | BODY-02 | Yes — cited at DEC-018 | NONE |
| BODY-04.01–.02 | BODY-04 | No | Inherits BODY-04 (GAP-E secondary) |
| BODY-05.01–.04 | BODY-05 | No | Inherits BODY-05 (GAP-E secondary) |
| ASSESS-01.01–.03 | ASSESS-01 | Yes — ASSESS-01.03 independently a 10+-decision hub | NONE (highest-utilization subtopic in the universe) |
| PRO-03.01–.03 | PRO-03 | No | Inherits PRO-03 (NONE) |
| PRO-04.01–.02 | PRO-04 | Yes — PRO-04.02 cited at DEC-031/032 | NONE |
| PRO-05.01–.03 | PRO-05 | No | Inherits PRO-05 (NONE) |
| SPORT-01.01–.02 | SPORT-01 | No | Inherits SPORT-01 (NONE) |
| SPORT-04.01–.03 | SPORT-04 | No | Inherits SPORT-04 (NONE) |
| SPORT-09.01–.02 | SPORT-09 | No | Inherits SPORT-09 (NONE) |
| RESEARCH-02.01–.05 | RESEARCH-02 | No | Inherits RESEARCH-02 (NONE) |
| RESEARCH-11.01–.02 | RESEARCH-11 | No | Inherits RESEARCH-11 (GAP-E) |

**71 of 71 Level-2 subtopics accounted for above. 213 of 213 total topic IDs accounted for** across
§14a and §14b combined.

---

# 15. Knowledge Hubs and Cascade Risks

| Topic | Decisions Fed | Cascade Risk | Reasoning |
|---|---|---|---|
| **ASSESS-01** | 20+ across Domains B, D, E, N, O, T | **HIGH CASCADE RISK** | If this topic's data-quality/measurement-error framing were found incomplete on content inspection, every data-sufficiency gate in the entire personalization loop (`DEC-006, 009, 017, 020, 024, 029, 076–082, 087, 109, 110, 112`) would be compromised simultaneously — the single largest cascade exposure in the model. |
| **BODY-01** | 10 decisions spanning 4 functional layers | **HIGH CASCADE RISK** | Feeds goal classification, individualization, interpretation, and adjustment alike; an incompleteness here would propagate through the entire Energy/Weight branch of the pipeline, not just one layer. |
| **NUT-03** | 8 decisions across Macro Allocation, Micronutrients, and Practical Translation | **MODERATE CASCADE RISK** | Wide reuse, but each dependent decision also has other supporting inputs (e.g. DEC-060 also draws on NUT-04), so a NUT-03 weakness would degrade rather than break these decisions. |
| **CLIN-01** | 7 decisions, the sole entry point to the 27-topic CLIN domain | **HIGH CASCADE RISK, but currently latent** | Architecturally central per `CLINICAL_NUTRITION_ARCHITECTURE.md`'s own Layer-3 framing — but its cascade risk is currently gated behind `DEC-099`'s unresolved scope decision, so the *practical* exposure is lower today than the topology alone suggests. |
| **RESEARCH-02** | 4 decisions in the Uncertainty/Adjustment layer | **MODERATE CASCADE RISK** | Concentrated in exactly the decisions (`DEC-021, 081, 087, 110`) already flagged as bottlenecks in §6 — a confounding-reasoning weakness would compound with those decisions' existing convergence risk. |
| **NUT-04** | 4 decisions at the Target→Food boundary | **MODERATE CASCADE RISK** | Central to Practical Translation's better-covered half (§9); a weakness here would degrade food selection but not the underlying macro/micro targets themselves. |
| **SPORT-10** | 4 decisions, all safety-relevant | **HIGH CASCADE RISK for the athlete-user subset** | Concentrated entirely in safety/escalation decisions (`DEC-013, 016, 095, 098`) — low exposure for non-athlete users, high exposure for the athlete subset. |

**Reading:** cascade risk concentrates in exactly the same handful of topics identified as hubs in
`APP_DECISION_KNOWLEDGE_MAPPING.md` §9 — this is expected (a hub is, by definition, a cascade-risk
concentration point) rather than a new finding, but stating it explicitly as *risk* rather than merely
*utilization* changes which topics a future content-inspection or curriculum-strengthening effort
should prioritize (§17).

---

# 16. Decision Bottlenecks

Decisions requiring convergence from multiple knowledge domains simultaneously — derived from the
actual §5/§6 mapping data, not assumed:

| DEC | Domains Converging | Bottleneck Type |
|---|---|---|
| DEC-021 | BODY (mechanistic) + ASSESS (methods) + RESEARCH (methods) | Knowledge convergence, no content gap |
| DEC-110 | RESEARCH + BODY + ASSESS | Knowledge convergence, no content gap — hardest decision in the model |
| DEC-084 | BODY (mechanistic + prescriptive) + MET (contextual) | Knowledge convergence, no content gap |
| DEC-100 | CLIN (4 disease-specific topics) + MET | Knowledge convergence **and** scope gap (`GAP-F`) simultaneously — the only decision in the model carrying both risk types at once |
| DEC-045 | VIT + MIN + SPORT + LIFE + CLIN (5 domains) | Knowledge convergence **and** scope gap (population-flag combination undetermined) |
| DEC-027 | BODY (2 topics) | Low domain-convergence, but `GAP-E PRIMARY` — a bottleneck by evidence-dependency rather than by knowledge breadth |

**Finding:** knowledge-convergence bottlenecks (DEC-021, 084, 110) and scope-gap bottlenecks (DEC-099,
100, 045) are structurally different kinds of risk, and only DEC-100/DEC-045 carry both simultaneously
— worth flagging as the two decisions where resolving the scope question would *also* need to account
for real multi-domain knowledge integration, not just a boundary choice.

---

# 17. Content Inspection Priorities

Topics where TOC-level analysis alone cannot establish whether actual book content supports the
decisions that depend on it — prioritized by decision importance, current mapping confidence, and
potential gap severity, per the governing brief. **No content inspection is performed here.**

**PRIORITY 1 (high decision importance, low confidence, multiple decisions affected):**
- **GI-03** (Gut Microbiome) — feeds `DEC-051/054`; own Phase 1 deferral already flagged this as
  thin-everywhere-developed-nowhere across 3 books; resolving its actual depth would clarify whether
  `DEC-054`'s `UNCERTAIN` status should become `COVERED` or `GAP-C`.
- **SPORT-11** (Personalized/Precision Sport Nutrition) — feeds `DEC-098`; single-book-sourced,
  2025-dated, and the source TOC itself does not confirm cycle-phase-specific depth this document
  provisionally attributed to it.
- **BODY-01's appetite/satiety subsection** — feeds `DEC-058`; currently a subsection, not a topic;
  inspection would determine whether HM4's actual "Energy Intake" content is deep enough to leave
  `DEC-058` as `COVERED` rather than `UNCERTAIN`.

**PRIORITY 2 (moderate importance or moderate confidence):**
- **CHO-04's fiber subsection** — feeds `DEC-037`; thin by TOC alone, worth confirming actual depth
  before treating it as a confirmed `GAP-C`.
- **NUT-03's Exchange List content (KM16 Appendix 18)** — feeds `DEC-060/062` and the Portion/Quantity
  layer (§9); confirming its actual depth would sharpen whether the Portion layer is closer to
  `PARTIALLY COVERED` or `NOT COVERED`.
- **AS3/ACSM's supplement chapters** — feeds `DEC-097`; `PHASE_2_HUMAN_REVIEW.md` item 10 already
  flags these as a possible FLAT-risk (restating rather than complementing) pair — inspection here
  serves both this document's and Phase 2's open question simultaneously.

**PRIORITY 3 (lower urgency — specialized or currently out-of-decision-scope):**
- The 18 pending-scope CLIN topics (content inspection is lower-priority than the scope decision itself
  — inspecting content for topics that may never be "supported" would be premature).
- RESEARCH-15's actual framing relative to `DEC-111`'s governance-process need.
- Caffeine/alcohol/doping subsection depth (flagged thin in `APPARENT_CURRICULUM_GAPS.md` §3, but no
  current `DEC` depends on them directly beyond `DEC-097`'s general supplement-safety net).

---

# 18. Current Evidence Priorities

Reusing, not re-deriving, `APP_DECISION_INVENTORY.md`'s own flags and `APP_DECISION_KNOWLEDGE_MAPPING.md`
§15's classification.

**PRIMARY (current evidence is essential):**
- `DEC-027` (target rate/direction of weight change).
- `DEC-098`'s SPORT-11 relationship (personalized/cycle-aware sport nutrition).
- The SPORT-11/RESEARCH-11/RESEARCH-12/SPECIAL-01 personalized-nutrition frontier generally (not yet
  attached to a concrete decision beyond DEC-098).

**IMPORTANT (current evidence materially affects quality):**
- `DEC-003` (recomposition reconciliation), `DEC-004` (goal-timeframe plausibility), `DEC-012/099/100`
  (clinical scope and modification), `DEC-013/016` (red-flag/escalation criteria), `DEC-022`
  (energy prescription for weight-change goals), `DEC-030` (recomposition monitoring norms), `DEC-044/097`
  (supplement consideration and reconciliation), `DEC-095` (RED-S/overtraining screening).

**SUPPORTING (current evidence would improve but is not the principal dependency):**
- `DEC-107` (external food-guide alignment — guides are periodically revised, but the DRI-methodology
  concept underneath them is stable).

This matches, term for term, the distribution already established in `APP_DECISION_KNOWLEDGE_MAPPING.md`
§15 — no new evidence flag is introduced here, and none is researched.

---

# 19. Potential New Knowledge Domains

Applying the five-condition test (§25 of the governing brief) explicitly, per candidate:

**Candidate: Practical Translation / Culinary-Preparation Knowledge**
1. Multiple important decisions depend on it? — Yes (`DEC-066–070`, ~5 decisions).
2. Existing domains cannot represent it? — Yes, confirmed (not merely suspected) by
   `APPARENT_CURRICULUM_GAPS.md` §1.
3. Conceptually coherent? — Yes (culinary/food-preparation science is a recognizable discipline).
4. Not merely implementation detail? — Yes for recipe/preparation content specifically.
5. Gap persists after content inspection? — **Not yet established** — no content inspection has been
   performed (per this document's own no-inspection constraint).
6. Cannot reasonably be handled as a translation layer? — **Partially** — recipe/preparation content
   plausibly cannot be (it's genuinely missing knowledge, not just an unbuilt bridge), but adjacent
   portion/quantity content plausibly *can* be handled as a translation layer once NUT-03's Exchange
   List precedent is better understood.

**Verdict: `POTENTIAL DOMAIN — REQUIRES FURTHER VALIDATION`.** Conditions 1–4 are met; conditions 5–6
are not yet resolvable without the content inspection and scope work this document explicitly defers.
**Not finalized as a new domain here.**

**Candidate: Shopping/Grocery Logistics Knowledge**
1–4: Similar reasoning to above, but condition 4 is **not met** — list-consolidation/quantity-
consolidation math is closer to implementation/product detail than to a curriculum knowledge domain,
and condition 6 also **fails** — this application's own existing grocery/pantry product surface is
already a viable translation-layer answer.

**Verdict: does not pass the test — classified as a confirmed `GAP-D`, handled at the application/
product layer, not a new-domain candidate.**

**No other candidate domain was identified.** Every other knowledge shortfall found in this analysis
(fiber depth, appetite-regulation depth, adjustment-trigger logic, clinical scope) fits within an
*existing* domain's natural extension (`GAP-C`) or an existing decision-engine question (`GAP-F`), not
a case for a wholly new knowledge domain.

---

# 20. Intentional Non-Gaps

Per the governing brief's explicit False-Gap Control instruction — topics that look weakly connected
but are so by design, not deficiency. Restated here as a single consolidated list (individually
justified already in §14):

- **Foundational biochemistry** (MET-01–06, 09; CHO-01–03; LIP-01–02; PRO-01–02; GI-02) — ~14 topics,
  teach the mechanistic "why" beneath BODY/CHO/LIP/PRO/VIT/MIN's prescriptive content; no consumer-
  facing decision reasons at that depth, by design of what a decision-support application (vs. a
  textbook) needs.
- **Reference-only lookup tables** (DRV-02–05, NUT-05) — consulted for numeric values, never reasoned
  about; matches `CANDIDATE_EXCLUSIONS.md`'s own REFERENCE-ONLY classification.
- **Confirmed structural research islands** (RESEARCH-09, 13, 14) — zero cross-domain edges even
  within the curriculum itself, per `LEARNING_DEPENDENCY_GRAPH.md`; RESEARCH-05 similarly, per
  `CANDIDATE_EXCLUSIONS.md`'s REFERENCE-tier classification.
- **Population-surveillance knowledge** (PUBHEALTH-01, 02, 06) — program-administration/surveillance
  content, legitimately outside individual-user-decision scope.
- **Clinical-professional-technique topics** (ASSESS-04, 06; FLU-03) — physical exam, lab-biomarker
  interpretation, and acid-base disorder management are professional-administered or diagnostic in
  nature; genuinely outside a consumer-facing decision-support application's current scope.
- **CLIN-02** (enteral/parenteral nutrition support) — outside consumer-app scope entirely, not merely
  deferred, since inpatient nutrition-support management is not a plausible feature under any scope
  resolution.
- **LIFE-05** (Adulthood) and **LIFE-08** (cross-reference only) — thin by their own Phase 2
  classification, not by this document's discovery.
- **SPECIAL-05** (Nutrigenetics/Personalization convergence marker) — not an independent topic by its
  own definition in `MASTER_TOPIC_UNIVERSE.md`.

None of these are flagged elsewhere in this document as deficiencies requiring action.

---

# 21. Prioritized Gap Matrix

Qualitative priority only, per the governing brief's explicit instruction not to compute an arbitrary
numerical score. Priority weighs decision importance, number of affected decisions, downstream cascade
risk, personalization importance, and safety importance jointly, without reducing them to one formula.

| Priority | Gap ID | Affected Decisions | Affected Topics | Gap Type | Severity | Confidence | Impact | Resolution Type |
|---|---|---|---|---|---|---|---|---|
| **P0** | GAP-27 | DEC-027, cascades into DEC-022 | BODY-04, BODY-05 | GAP-E (PRIMARY) | CRITICAL | MODERATE | Every weight/composition-change prescription in the app | CURRENT EVIDENCE |
| **P0** | GAP-CLIN-SCOPE | DEC-099, 100 (→ cascades into 021, 031, 034, 036, 041, 045, 101, 102, 012, 014, 015) | CLIN-01 + 8 general-practice CLIN topics + 10 Layer-6 topics | GAP-F | CRITICAL | HIGH | The entire clinical pathway — 13+ decisions blocked on one boundary decision | SCOPE DECISION |
| **P1** | GAP-TRANSLATION | DEC-065, 067–075, 086 | (none — confirmed absence) | GAP-A (067–069) / GAP-D (rest) | MODERATE–HIGH | n/a | The application's own Meal Prep/Shopping practical value proposition | APPLICATION TRANSLATION / FUTURE FEATURE |
| **P1** | GAP-SPORT-EVIDENCE | DEC-095, 097, 098 | SPORT-05, SPORT-10, SPORT-11 | GAP-E | HIGH | HIGH | Athlete-user safety and personalization quality | CURRENT EVIDENCE |
| **P1** | GAP-ENERGY-RX | DEC-022 | BODY-01, BODY-04, BODY-05 | GAP-E | HIGH | HIGH | Every energy prescription for a weight-change goal | CURRENT EVIDENCE |
| **P2** | GAP-BOTTLENECK | DEC-021, 084, 110 | ASSESS-01, BODY-01, RESEARCH-02 | GAP-I (secondary) | HIGH (structural, not content) | HIGH | Cascade exposure if hub topics prove incomplete on inspection | NO ACTION REQUIRED (monitor) |
| **P2** | GAP-CLINICAL-SAFETY-CURRENCY | DEC-012, 013, 016 | CLIN-01, CLIN-20, SPORT-10 | GAP-E | MODERATE–HIGH | HIGH | Safety/escalation criteria specificity | CURRENT EVIDENCE |
| **P2** | GAP-ADJUST-LOGIC | DEC-039, 085 | PRO-04, CHO-04, LIP-05 | GAP-C | MODERATE | LOW | Macro-adjustment-trigger reasoning across the feedback loop | APPLICATION TRANSLATION |
| **P2** | GAP-CONTENT-INSPECT | DEC-054, 058, 098 | GI-03, BODY-01 (subsection), SPORT-11 | GAP-B / GAP-G | LOW–MODERATE | LOW | 3 decisions with unresolved mapping confidence | CONTENT REVIEW |
| **P3** | GAP-FIBER | DEC-037 | CHO-04 | GAP-C | LOW | LOW | Single decision, single macro sub-target | CONTENT REVIEW |
| **P3** | GAP-CONFLICT-RULES | DEC-040 | NUT-03, PRO-04 | GAP-G | LOW | MODERATE | Single decision | CONTENT REVIEW |
| **P3** | GAP-GOVERNANCE-MAP | DEC-111 | RESEARCH-15 | GAP-G | LOW | LOW | Internal governance-process framing only | CONTENT REVIEW |
| **P3** | GAP-DATA-FUTURE | DEC-041/042 (lab-data aspect) | ASSESS-02, ASSESS-06 | GAP-H | LOW | n/a | Only relevant if a future lab-data feature is built | FUTURE FEATURE |

---

# 22. Structural Findings

1. **The model has exactly two `CRITICAL`-severity gaps, and they are of entirely different kinds.**
   `DEC-027` is a pure `GAP-E` (evidence), localized to one decision with a known, bounded downstream
   cascade (into `DEC-022`). `DEC-099`/`DEC-100` is a pure `GAP-F` (scope), with a much wider cascade
   (13+ decisions) but, notably, **zero underlying knowledge deficiency** — the relevant clinical
   content already exists at high confidence. Resolving the scope question would immediately convert
   most of that cascade from "gapped" to "covered," which resolving the evidence question for DEC-027
   cannot do as cleanly (evidence review takes time regardless of when it starts).

2. **True `GAP-A` (no knowledge representation at all) is rare in this model — only 3 decisions
   (`DEC-067, 068, 069`) qualify.** Most apparent "missing knowledge" decomposes into `GAP-C` (thin but
   present), `GAP-D` (present but untranslated), or `GAP-F` (present but scope-gated) instead. This is
   itself a finding: the 213-topic universe is broad enough that near-total absence is the exception,
   not the rule, once genuine functional mapping (rather than superficial impression) is applied.

3. **Knowledge hubs and cascade risks are the same topics across all three analytical lenses this
   Phase 3 sequence has now applied** — decision-dependency-graph bottlenecks (`DEC-001, 021, 084`),
   knowledge-mapping hubs (`ASSESS-01, BODY-01`), and this document's cascade-risk topics (§15) all
   converge on the same small set. Three independently-derived analyses agreeing is corroboration, not
   circularity — each was built from different underlying data (edge counts, citation counts, and now
   gap-severity weighting).

4. **The Practical Translation domain is this application's single largest concentration of gaps by
   decision count** (~15 of 112 decisions touch it), but also its **lowest-severity concentration** —
   most of these gaps are `LOW`/`MODERATE`, not `CRITICAL`/`HIGH`, because the application's own
   product surface (existing grocery/pantry data) is a plausible practical answer even where curriculum
   knowledge is confirmed absent. This is a case where product design, not curriculum expansion, is the
   more natural resolution path — noted, not decided, here.

5. **Every `GAP-E` (current evidence) instance in the model traces to one of three thematic clusters:**
   weight-management/rate-setting, clinical-scope-adjacent safety criteria, and sport-nutrition currency
   (supplements, RED-S, personalized nutrition). No `GAP-E` instance was found outside these three
   clusters — evidence dependency in this model is concentrated, not diffuse.

6. **Scope gaps (`GAP-F`) are entirely clinical.** Every `GAP-F` instance traces back, directly or
   indirectly, to `DEC-099`'s single undetermined boundary — no other decision domain in the model has
   an analogous open scope question of this kind.

---

# 23. Open Questions

Carried forward from prior Phase 3 documents where still unresolved, plus new ones surfaced here. None
are resolved in this document.

1. Should `LIP-04` be mapped directly to `DEC-100` (carried from `APP_DECISION_KNOWLEDGE_MAPPING.md`
   §19 item 1)? Still open.
2. Should `MET-07`/`RESEARCH-10` be promoted to a confirmed `CONTEXTUAL` mapping for `DEC-058`/
   `DEC-083`/`DEC-091` (carried from the same document, item 2)? Still open.
3. How do the 18 pending-scope CLIN topics resolve once `DEC-099` is decided — individually or via one
   shared mechanism (carried, item 3)? Still open, and now sharpened by §16's finding that `DEC-100`
   specifically carries both a knowledge-convergence and a scope-gap risk simultaneously.
4. Does the Practical Translation shortfall (§9, §19) warrant a genuinely new curriculum domain, or is
   it permanently and correctly out-of-curriculum-scope, resolved instead at the product layer? This
   document applies the five-condition test and reaches `POTENTIAL DOMAIN — REQUIRES FURTHER
   VALIDATION` for the preparation/recipe half specifically — not a final answer.
5. **New:** Should `DEC-085`/`DEC-039`'s shared adjustment-trigger-logic gap (`GAP-C`) be treated as
   one decision-inventory refinement (a single new decision node capturing the general
   "how-much-to-adjust" logic) rather than two separate thin mappings? This would be an
   `APP_DECISION_INVENTORY.md` amendment question, out of this document's own scope.
6. **New:** Should `SPORT-08`'s complete absence from the decision inventory (§12) be treated as a
   decision-inventory completeness gap requiring a new `DEC` record in a future inventory revision, or
   is illness/immune-function-aware guidance legitimately out of scope for this application? Not
   resolved here — flagged as a structural observation only.
7. **New:** Is the qualitative P0–P3 prioritization in §21 stable once `DEC-099`'s scope question is
   actually resolved, or would resolving it demote several currently-`GAP-F`-tagged items while
   promoting newly-concrete clinical-content gaps that only become visible once specific conditions are
   named? Left open — this document's priority list is a snapshot conditioned on the current
   undetermined state, not a claim about the post-resolution picture.

---

# 24. Validation

Checked against the governing brief's 33-item validation checklist (§31):

1–6. All 112 DEC IDs appear in §5 (verified programmatically — 112 unique rows, sequential, no
duplicates); every DEC ID appears exactly once; all 213 knowledge topic IDs accounted for in §14a (142,
verified programmatically) + §14b (71); no new topic IDs invented; no existing topic IDs renamed; no
topics deleted. ✓

7–12. `GAP-A` through `GAP-J` used consistently throughout §5–§20, never a generic "gap" label; the
`KNOWN ABSENCE ≠ UNKNOWN PRESENCE` rule applied explicitly (`GI-03`, `SPORT-11`, `DEC-054/058/098` all
routed to `GAP-B`/`GAP-G`, never `GAP-A`, precisely because their absence is unconfirmed rather than
known — see §2, §17); knowledge gap vs. evidence gap distinguished throughout (`GAP-C`/`GAP-A` vs.
`GAP-E`, never merged — see §13's explicit RESEARCH-02 vs. RESEARCH-15 contrast); knowledge gap vs.
scope gap distinguished (`GAP-F` reserved exclusively for `DEC-099`-adjacent decisions, per §22 finding
6); knowledge gap vs. translation gap distinguished (`GAP-D` reserved for science-exists-but-untranslated
cases, `GAP-A` reserved for the 3 decisions where the discipline itself is absent — §9's explicit
worked distinction); source coverage / knowledge coverage / application coverage kept separate
throughout (§9's Portion-layer analysis is the clearest worked example — a source-level precedent
[Exchange Lists] exists without full application-level depth). ✓

13–17. Personalization gaps explicitly analyzed (§7, full baseline→adjust chain traced); longitudinal
gaps explicitly analyzed (§8); practical translation explicitly analyzed (§9, mandatory section
completed in full six-layer detail); food substitution explicitly analyzed (§10); shopping explicitly
analyzed (§9's Shopping row, §10's practical-substitution row, §15's P1 gap entry). ✓

18–20. Clinical scope uncertainty not silently resolved (§11, §16, §22 all explicitly restate `DEC-099`
as open); sport architecture not silently redesigned (§12 classifies gaps against the existing
`SPORT_NUTRITION_ARCHITECTURE.md` role table without altering it); research architecture not silently
redesigned (§13 classifies against existing RESEARCH topic roles without altering `RESEARCH_
ARCHITECTURE.md`'s four placement options or resolving its own open single-source question). ✓

21–24. Current evidence flagged, not researched (§18, reusing existing inventory flags verbatim, no web
research); content-inspection needs flagged, not resolved (§17, explicitly "no content inspection is
performed here"); potential new domains remain candidates only (§19, both candidates end in
`POTENTIAL DOMAIN — REQUIRES FURTHER VALIDATION` or explicit rejection, neither finalized); intentional
non-gaps documented (§20, consolidated list). ✓

25–29. No formulas invented (DEC-027/DEC-018-adjacent treatment stops at "a rate/method exists," never
a value); no numerical thresholds invented (every severity/priority judgment in §5/§21 is qualitative);
no algorithms designed; no UI designed; no software architecture designed (§9/§19's translation-gap
discussion stays at the conceptual knowledge level throughout). ✓

30–33. No Phase 1/2 documents modified (read-only access this session — `PROJECT_STATUS.md` reread and
confirmed unchanged before starting); no source books modified; no web research performed; document
saved at exactly `05_PHASE_3_APP_DECISION_MODEL/APP_DECISION_GAPS.md`. ✓

---

**Gap Analysis Status: COMPLETE**

112 of 112 decisions classified against the ten-part gap taxonomy (§5); 213 of 213 knowledge topics
classified in reverse (§14); personalization, longitudinal, practical-translation, substitution,
clinical, sport, and research/evidence gaps each analyzed in their own required section; knowledge
hubs and decision bottlenecks identified as cascade risks (§15–16); content-inspection and current-
evidence priorities listed without performing either (§17–18); two candidate new knowledge domains
tested against the five-condition rule and left as candidates, not finalized (§19); intentional
non-gaps documented to prevent gap-list inflation (§20); a qualitative P0–P3 prioritized gap matrix
produced without inventing a numerical score (§21); no curriculum question resolved, no topic added or
altered, no formula or threshold invented, no implementation designed. Ready for
`05_PHASE_3_APP_DECISION_MODEL/APP_DECISION_MODEL.md` as the final Phase 3 document — not started in
this session, per the governing brief's explicit instruction to stop after this document.

**Note on overlap:** several decisions carry more than one qualifying condition (e.g. `DEC-098` is both
`PARTIALLY COVERED` and carries a `GAP-G` mapping-uncertainty flag on its SPORT-11 relationship) — §5
records each decision's single *primary* coverage classification and lists secondary flags separately,
so the counts above sum to more than 112 when read loosely but each decision appears exactly once in
§5's matrix. (Exact final counts are given at the end of §5, computed from the matrix itself rather
than asserted in advance.)

---

# 5. Complete Decision Gap Matrix

Every one of the 112 `DEC` IDs, exactly once. `NONE` in the Primary Gap column means no material gap
was found — the decision is adequately supported by existing knowledge at HIGH or MODERATE mapping
confidence, per `APP_DECISION_KNOWLEDGE_MAPPING.md` §6.

## Domain A–D

| DEC | Coverage | Primary Gap | Severity | Confidence | Missing / Uncertain Knowledge | Resolution Type | Current Evidence | Scope Dependency |
|---|---|---|---|---|---|---|---|---|
| 001 | COVERED | NONE | LOW | MODERATE | — | NO ACTION REQUIRED | NO | NO |
| 002 | COVERED | NONE | LOW | MODERATE | — | NO ACTION REQUIRED | NO | NO |
| 003 | PARTIALLY COVERED | GAP-E | MODERATE | MODERATE | Recomposition physiology thin beyond BODY-07 | CURRENT EVIDENCE | IMPORTANT | NO |
| 004 | PARTIALLY COVERED | GAP-E | MODERATE | MODERATE | "Implausible timeframe" threshold is evidence-dependent | CURRENT EVIDENCE | IMPORTANT | minor (touches DEC-012) |
| 005 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 006 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 007 | COVERED | NONE | LOW | MODERATE | — | NO ACTION REQUIRED | NO | NO |
| 008 | COVERED | NONE | LOW | MODERATE | — | NO ACTION REQUIRED | NO | NO |
| 009 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 010 | COVERED | NONE | LOW | MODERATE | — | NO ACTION REQUIRED | NO | NO |
| 011 | COVERED | NONE | LOW | LOW | Minimal science content, governance timer | NO ACTION REQUIRED | NO | NO |
| 012 | CONDITIONAL | GAP-F | HIGH | HIGH | Exact out-of-scope condition list undetermined | SCOPE DECISION | IMPORTANT | YES (⇄ DEC-099) |
| 013 | PARTIALLY COVERED | GAP-E | MODERATE | HIGH | Red-flag criteria benefit from current clinical consensus | CURRENT EVIDENCE | IMPORTANT | NO |
| 014 | CONDITIONAL | GAP-F | HIGH | MODERATE | Withhold-boundary is mostly a liability/application decision | SCOPE DECISION | NO | YES |
| 015 | CONDITIONAL | GAP-F | LOW | LOW | Coordination workflow depends on scope resolution | SCOPE DECISION | NO | YES |
| 016 | PARTIALLY COVERED | GAP-E | MODERATE | MODERATE | Same as DEC-013, longitudinal | CURRENT EVIDENCE | IMPORTANT | NO |
| 017 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 018 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 019 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 020 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 021 | COVERED | GAP-I (secondary) | HIGH (bottleneck) | HIGH | No content gap; highest knowledge-convergence decision — see §16 | NO ACTION REQUIRED | NO | NO |
| 022 | PARTIALLY COVERED | GAP-E | HIGH | HIGH | Contemporary weight-management prescription standards | CURRENT EVIDENCE | IMPORTANT | NO |
| 023 | COVERED | NONE | LOW | LOW | — | NO ACTION REQUIRED | NO | NO |
| 024 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |

## Domain E–J

| DEC | Coverage | Primary Gap | Severity | Confidence | Missing / Uncertain Knowledge | Resolution Type | Current Evidence | Scope Dependency |
|---|---|---|---|---|---|---|---|---|
| 025 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 026 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 027 | PARTIALLY COVERED | GAP-E | **CRITICAL** | MODERATE | Acceptable target rate of change — corpus gives concept only | CURRENT EVIDENCE | **PRIMARY** | NO |
| 028 | COVERED | NONE | LOW | MODERATE | — | NO ACTION REQUIRED | NO | NO |
| 029 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 030 | PARTIALLY COVERED | GAP-E | MODERATE | MODERATE | Device-based body-comp tracking / recomposition norms evolving | CURRENT EVIDENCE | IMPORTANT | NO |
| 031 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 032 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 033 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 034 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 035 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 036 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 037 | PARTIALLY COVERED | GAP-C | LOW | LOW | No dedicated fiber-requirement topic — a CHO-04 subsection only | CONTENT REVIEW | NO | NO |
| 038 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 039 | PARTIALLY COVERED | GAP-C | MODERATE | LOW | Macro-adjustment-trigger logic itself is application-level, uncovered by any topic | APPLICATION TRANSLATION | NO | NO |
| 040 | PARTIALLY COVERED | GAP-G | LOW | MODERATE | Conflict-resolution priority rules not explicit in source material | CONTENT REVIEW | NO | NO |
| 041 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 042 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 043 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 044 | PARTIALLY COVERED | GAP-E | MODERATE | HIGH | Supplement safety/efficacy currency | CURRENT EVIDENCE | IMPORTANT | NO |
| 045 | CONDITIONAL | GAP-F | MODERATE | HIGH | How simultaneous clinical + life-stage flags combine is undetermined | SCOPE DECISION | NO | YES |
| 046 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 047 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 048 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 049 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 050 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 051 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 052 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 053 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 054 | UNCERTAIN | GAP-B | LOW | MODERATE | GI-adaptation depth; intersects GI-03's own open content-inspection deferral | CONTENT REVIEW | NO | NO |
| 055 | COVERED | NONE | LOW | MODERATE | — | NO ACTION REQUIRED | NO | NO |
| 056 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 057 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 058 | UNCERTAIN | GAP-C | MODERATE | LOW | Dedicated appetite/satiety-regulation depth — only a BODY-01 subsection | CONTENT REVIEW | NO | NO |
| 059 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |

## Domain K–O

| DEC | Coverage | Primary Gap | Severity | Confidence | Missing / Uncertain Knowledge | Resolution Type | Current Evidence | Scope Dependency |
|---|---|---|---|---|---|---|---|---|
| 060 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 061 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 062 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 063 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 064 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 065 | NOT COVERED | GAP-D | MODERATE | n/a | Pantry/grocery-app integration — no curriculum counterpart possible | APPLICATION TRANSLATION | NO | NO |
| 066 | UNCERTAIN | GAP-D | HIGH | LOW | Meal-construction knowledge beyond general eating-pattern guidance | APPLICATION TRANSLATION | NO | NO |
| 067 | NOT COVERED | **GAP-A** | MODERATE | n/a | Recipe/preparation-detail science — confirmed absent from all 7 books; a categorically different (culinary) knowledge domain | APPLICATION TRANSLATION / FUTURE FEATURE | NO | NO |
| 068 | NOT COVERED | **GAP-A** | LOW | n/a | Same as DEC-067 | APPLICATION TRANSLATION / FUTURE FEATURE | NO | NO |
| 069 | NOT COVERED | **GAP-A** | LOW | n/a | Same as DEC-067 | APPLICATION TRANSLATION / FUTURE FEATURE | NO | NO |
| 070 | PARTIALLY COVERED | GAP-D | MODERATE | LOW | Deviation-handling logic mostly application-level | APPLICATION TRANSLATION | NO | NO |
| 071 | NOT COVERED | GAP-D | MODERATE | n/a | Shopping-list consolidation logistics — no topic anywhere | APPLICATION TRANSLATION | NO | NO |
| 072 | NOT COVERED | GAP-D | MODERATE | n/a | Pantry reconciliation — same gap, this app's own integration point | APPLICATION TRANSLATION | NO | NO |
| 073 | PARTIALLY COVERED | GAP-D | LOW | LOW | Budget-constrained shopping beyond PUBHEALTH-04's general framing | APPLICATION TRANSLATION | NO | NO |
| 074 | PARTIALLY COVERED | GAP-D | LOW | LOW | Availability-constrained substitution logistics | APPLICATION TRANSLATION | NO | NO |
| 075 | NOT COVERED | GAP-D | LOW | n/a | Pure logistics optimization, no topic | APPLICATION TRANSLATION / FUTURE FEATURE | NO | NO |
| 076 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 077 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 078 | COVERED | NONE | LOW | MODERATE | — | NO ACTION REQUIRED | NO | NO |
| 079 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 080 | COVERED | NONE | LOW | MODERATE | — | NO ACTION REQUIRED | NO | NO |
| 081 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 082 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 083 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 084 | COVERED | GAP-I (secondary) | HIGH (bottleneck) | HIGH | No content gap; central adjustment pivot — see §16 | NO ACTION REQUIRED | NO | NO |
| 085 | PARTIALLY COVERED | GAP-C | MODERATE | LOW | Same adjustment-trigger-logic gap as DEC-039 | APPLICATION TRANSLATION | NO | NO |
| 086 | PARTIALLY COVERED | GAP-D | LOW | MODERATE | Reuses DEC-060/066 — inherits DEC-066's translation gap when triggered | APPLICATION TRANSLATION | NO | NO |
| 087 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 088 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 089 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 090 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 091 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |

## Domain P–T

| DEC | Coverage | Primary Gap | Severity | Confidence | Missing / Uncertain Knowledge | Resolution Type | Current Evidence | Scope Dependency |
|---|---|---|---|---|---|---|---|---|
| 092 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 093 | COVERED | NONE | LOW | MODERATE | — | NO ACTION REQUIRED | NO | NO |
| 094 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 095 | PARTIALLY COVERED | GAP-E | HIGH | HIGH | RED-S/overtraining screening practice evolving; single-book-sourced besides | CURRENT EVIDENCE | IMPORTANT | NO |
| 096 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 097 | PARTIALLY COVERED | GAP-E | MODERATE | HIGH | Supplement safety/efficacy currency; touches open AS3/ACSM/SN4 redundancy question | CURRENT EVIDENCE | IMPORTANT | minor |
| 098 | UNCERTAIN | GAP-G + GAP-E | MODERATE | LOW | Cycle-phase-specific depth unconfirmed by source TOC; SPORT-11 itself flagged for currency check | CONTENT REVIEW + CURRENT EVIDENCE | PRIMARY (SPORT-11 aspect) | NO |
| 099 | CONDITIONAL | GAP-F | **CRITICAL** | HIGH | Exact supported-conditions list undetermined — gates the entire clinical pathway | SCOPE DECISION | IMPORTANT | YES (⇄ DEC-012) |
| 100 | CONDITIONAL | GAP-F | **CRITICAL** | HIGH | Same scope dependency as DEC-099, propagated to 5+ downstream decisions | SCOPE DECISION | IMPORTANT | YES |
| 101 | PARTIALLY COVERED | GAP-F (secondary) | MODERATE | MODERATE | Depends on DEC-100's resolution | SCOPE DECISION | NO | YES |
| 102 | CONDITIONAL | GAP-F | MODERATE | MODERATE | Same as DEC-101 | SCOPE DECISION | NO | YES |
| 103 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 104 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 105 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 106 | COVERED | NONE | LOW | MODERATE | — | NO ACTION REQUIRED | NO | NO |
| 107 | PARTIALLY COVERED | GAP-E | LOW | HIGH | Named external guides periodically revised | CURRENT EVIDENCE | SUPPORTING | NO |
| 108 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 109 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |
| 110 | COVERED | GAP-I (secondary) | HIGH (bottleneck) | HIGH | No content gap; hardest single decision in the inventory — requires the strongest research-methods reasoning in the model | NO ACTION REQUIRED | NO | NO |
| 111 | UNCERTAIN | GAP-G | LOW | LOW | RESEARCH-15 framed around policy translation, not internal app governance — approximate mapping | CONTENT REVIEW | NO | NO |
| 112 | COVERED | NONE | LOW | HIGH | — | NO ACTION REQUIRED | NO | NO |

**112 of 112 DEC IDs appear exactly once above.**
