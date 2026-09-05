# Knowledge ↔ Decision Depth Map — Phase 4

**Phase:** Phase 4 — Curriculum ↔ Decision Integration (`PROJECT_AI_PROTOCOL.md` §12)
**Status:** IN PROGRESS (first Phase 4 artifact; see `00_PROJECT_CONTROL/AI_SESSION_STATE.md` for what
remains)
**Built on (read-only, not modified):** `03_PHASE_1_CURRICULUM_ANALYSIS/MASTER_TOPIC_UNIVERSE.md`,
`TOPIC_LEARNING_LEVELS.md`, `TOPIC_PREREQUISITES.md`; `04_PHASE_2_CURRICULUM_ARCHITECTURE/
CANDIDATE_EXCLUSIONS.md`; `05_PHASE_3_APP_DECISION_MODEL/APP_DECISION_KNOWLEDGE_MAPPING.md` (§8, §9,
§10, §16, §17) and `APP_DECISION_GAPS.md` (§5, §9, §21).
**Gate 1 effects applied here:** `00_PROJECT_CONTROL/DECISIONS/2026-09-05-gate-1-phase-3-to-phase-4.md`
— `DEC-099`/`DEC-100` clinical scope stays unresolved (18 CLIN topics carried as `SCOPE-PENDING`, not
resolved); `CANDIDATE_EXCLUSIONS.md` used as the working default with documented overrides (§6).

---

## 1. What this document is (and is not)

`PROJECT_AI_PROTOCOL.md` §12 asks Phase 4 to determine, for the 112 decisions and 213 knowledge topics:
decision-critical knowledge, required learning depth, prerequisite knowledge, reference-only knowledge,
useful-but-not-operationally-required knowledge, decisions lacking adequate curriculum support, and
curriculum content with no application role — **without assuming the final curriculum architecture**.

This document answers all seven, but it is a **synthesis layer on top of** Phase 2 and Phase 3, not a
re-derivation of either:

- Phase 2 (`TOPIC_LEARNING_LEVELS.md`) already classified each topic's **pedagogical complexity**
  (FOUNDATION/INTERMEDIATE/ADVANCED/SPECIALIZED) — how hard a topic is to *teach a human*. That
  classification is reused here unchanged.
- Phase 3 (`APP_DECISION_KNOWLEDGE_MAPPING.md` §8/§17) already classified each topic's **decision-
  centrality** (CORE APPLICATION / IMPORTANT / SPECIALIZED / SUPPORTING-CROSS-CUTTING / REFERENCE-
  EDUCATIONAL / NO DIRECT APPLICATION DEPENDENCY) — which decisions actually use a topic, and how. That
  classification is also reused here unchanged, not re-counted or re-litigated.
- **What Phase 4 adds:** a translation of Phase 3's decision-centrality bands into a concrete verdict —
  *how deeply must this application's own knowledge base/reasoning represent this topic* — which is a
  different question from either Phase 2's teaching-complexity question or Phase 3's which-decisions-
  use-it question. A topic can be pedagogically FOUNDATION-level (easy to teach) and still need FULL
  representation in the application (e.g. `BODY-01`); a topic can be pedagogically ADVANCED and need
  zero application representation (e.g. `MET-06`, organ-specific biochemistry) — the two axes are
  independent, per `PROJECT_AI_PROTOCOL.md` §5's "Knowledge Coverage ≠ Application Capability."

No topic is added, removed, renamed, or reclassified in Phase 1/2/3's own documents. No `DEC` record is
modified. No formula, threshold, or algorithm is introduced (per §12's own instruction and §28's
premature-implementation rule). `DEC-099`/`DEC-100` are not resolved.

---

## 2. Required Application Depth — Tier Definitions

Six tiers, applied to all 213 topic IDs. These are **new to Phase 4** — they do not replace Phase 2's
learning levels or Phase 3's centrality bands, they sit alongside them (see the per-domain tables in §5).

| Tier | Meaning | Roughly derived from (Phase 3 band) |
|---|---|---|
| **FULL** | The application's reasoning must represent this topic in full — the decisions that depend on it cannot be made responsibly with a shallow representation. | CORE APPLICATION KNOWLEDGE |
| **WORKING** | The application must represent this topic at a working/applied level sufficient to support its decisions, but not to the depth a specialist curriculum would teach it. | IMPORTANT APPLICATION KNOWLEDGE |
| **CONDITIONAL** | Representation is contingent on a feature, scope decision, or evidence-currency question that is not yet resolved — build only if/when that gate opens. | SPECIALIZED APPLICATION KNOWLEDGE (elective/future/mapping-uncertain) |
| **OVERVIEW** | Needed only as interpretive/contextual background that sharpens a FULL-tier decision's reasoning — never a primary reasoning target itself. | SUPPORTING / CROSS-CUTTING KNOWLEDGE |
| **REFERENCE-ONLY** | Actively consulted for a value by a decision, but never reasoned about — a lookup table, not a lesson. | REFERENCE / EDUCATIONAL KNOWLEDGE, *where an active decision use exists* |
| **NOT-REQUIRED-FOR-APPLICATION** | No decision uses this topic, directly or as a live reference, today. May still be legitimate content for a future *human-facing* curriculum (Phase 6+) — this tier says nothing about that, only that this application's own knowledge base does not need to represent it. | NO DIRECT APPLICATION DEPENDENCY IDENTIFIED, plus the subset of REFERENCE/EDUCATIONAL topics Phase 3 itself recorded with zero active decision use (see §3's refinement note) |

Plus one cross-cutting status, orthogonal to the six tiers above:

| Status | Meaning |
|---|---|
| **SCOPE-PENDING** | A CLIN topic whose eventual tier depends on `DEC-099`'s still-undecided supported-conditions boundary (Gate 1 §7.2, deferred). Not resolved here — see §7. |

---

## 3. One refinement over Phase 3's own bands (stated explicitly, not a correction)

Phase 3's §17 "REFERENCE/EDUCATIONAL KNOWLEDGE" band bundled two different things under one label:
topics genuinely **consulted** by a decision for a value (`DRV-02/03/04/05`, `RESEARCH-05`) and topics
with **zero active decision use** that simply felt reference-like in character (`NUT-05`, `RESEARCH-09/
10/13/14`, `PUBHEALTH-01/02/06`, `ASSESS-04/06`, `CLIN-02`, `GI-02`, `FLU-03`). Phase 3's own §8a table
already recorded this distinction faithfully (a "Used By Decisions" column showing either a real `DEC-###`
citation or "—"); this document just promotes that existing distinction into two separate depth tiers
(`REFERENCE-ONLY` vs. `NOT-REQUIRED-FOR-APPLICATION`) because Phase 4's question — how deeply must the
application represent this — needs the finer split. **No topic's Phase 3 classification, decision usage,
or strength was changed to produce this split** — every assignment below is read directly off Phase 3's
own §8a "Used By Decisions" column.

---

## 4. Prerequisite knowledge — a second refinement (also stated explicitly)

`TOPIC_PREREQUISITES.md` (Phase 2) recorded 86 prerequisite edges built for **teaching a human learner**
— e.g. `MET-01 → MET-02 → MET-03 → MET-04 → ... → MET-08` is a REQUIRED chain because a student cannot
understand metabolic adaptation without the biochemistry underneath it. Phase 3's Knowledge Mapping
(§10) already found that this chain does **not** climb into the application's own reasoning — the
decisions that use `BODY-02`/`SPORT-01` operate at the level those topics *produce* (a resting-EE method-
class exists, ATP-PCr/aerobic pathways exist), not at the level of `MET-03`'s ATP-transduction chemistry
underneath them. Phase 4 confirms this explicitly, topic by topic, rather than assuming it: **no topic
below is upgraded out of a low depth tier merely because it sits upstream, in Phase 2's teaching graph,
of a FULL-tier topic.** The one exception the data itself produces is `CLIN-01`, where Phase 2's
prerequisite chain (`ASSESS-01/02/03/05 → CLIN-01 → CLIN-02–27`, all REQUIRED, per `TOPIC_PREREQUISITES.
md`'s CLIN section) matches, rather than conflicts with, Phase 3's own finding that `CLIN-01` is the
domain's sole entry-point hub — there, the pedagogical prerequisite and the application's actual
reasoning dependency are the same relationship, not two different ones. This is noted per-topic in §5
where it applies (`ASSESS-01`, `ASSESS-03` before `CLIN-01`).

---

## 5. Per-Domain Depth Tables

All 142 Level-1 topics, organized by the same 18 domains as `MASTER_TOPIC_UNIVERSE.md`. Level-2
subtopics are handled compactly in §5.19 (mirroring Phase 3's own §8b method: inherit the parent's tier
unless independently differentiated).

Columns: **Topic** · **Phase 2 Level** (pedagogical complexity, unchanged from `TOPIC_LEARNING_LEVELS.
md`) · **Phase 3 Centrality** (unchanged from `APP_DECISION_KNOWLEDGE_MAPPING.md` §8a/§17) · **Phase 4
Depth** (this document's new verdict) · **Notes**.

### 5.1 NUT — Foundations of Nutrition

| Topic | Phase 2 Level | Phase 3 Centrality | Phase 4 Depth | Notes |
|---|---|---|---|---|
| NUT-01 | FOUNDATION | SUPPORTING/CROSS-CUTTING | OVERVIEW | Thin single-decision use (DEC-002) |
| NUT-02 | FOUNDATION | IMPORTANT | WORKING | Feeds the food-translation boundary |
| NUT-03 | FOUNDATION | CORE APPLICATION | **FULL** | Highest cross-domain reuse of any NUT topic (8 decisions) |
| NUT-04 | FOUNDATION | CORE APPLICATION | **FULL** | Food-composition hub for the Translation layer |
| NUT-05 | FOUNDATION | REFERENCE/EDUCATIONAL (band), zero active use | NOT-REQUIRED-FOR-APPLICATION | See §3 refinement — no `DEC` cites it |

### 5.2 DRV — Nutritional Requirements and Dietary Reference Values

| Topic | Phase 2 Level | Phase 3 Centrality | Phase 4 Depth | Notes |
|---|---|---|---|---|
| DRV-01 | INTERMEDIATE | IMPORTANT | WORKING | DRI methodology, needed to interpret external guides (DEC-107) |
| DRV-02 | INTERMEDIATE | REFERENCE/EDUCATIONAL, active use | **REFERENCE-ONLY** | Numeric lookup for DEC-031/034/036 |
| DRV-03 | INTERMEDIATE | REFERENCE/EDUCATIONAL, active use | **REFERENCE-ONLY** | Numeric lookup for DEC-041/042 |
| DRV-04 | INTERMEDIATE | REFERENCE/EDUCATIONAL, active use | **REFERENCE-ONLY** | Numeric lookup for DEC-041/042 |
| DRV-05 | ADVANCED | REFERENCE/EDUCATIONAL, active use | **REFERENCE-ONLY** | Individual nutrient fact sheets, DEC-043 |

### 5.3 MET — Energy and Metabolism

| Topic | Phase 2 Level | Phase 3 Centrality | Phase 4 Depth | Notes |
|---|---|---|---|---|
| MET-01 | FOUNDATION | NO DIRECT APPLICATION DEPENDENCY | NOT-REQUIRED-FOR-APPLICATION | Below the application's decision altitude (§4) |
| MET-02 | FOUNDATION | NO DIRECT APPLICATION DEPENDENCY | NOT-REQUIRED-FOR-APPLICATION | Same |
| MET-03 | INTERMEDIATE | NO DIRECT APPLICATION DEPENDENCY | NOT-REQUIRED-FOR-APPLICATION | Same — feeds SPORT-01 pedagogically, not at application depth |
| MET-04 | INTERMEDIATE | NO DIRECT APPLICATION DEPENDENCY | NOT-REQUIRED-FOR-APPLICATION | Same |
| MET-05 | INTERMEDIATE | NO DIRECT APPLICATION DEPENDENCY | NOT-REQUIRED-FOR-APPLICATION | Same |
| MET-06 | ADVANCED | NO DIRECT APPLICATION DEPENDENCY | NOT-REQUIRED-FOR-APPLICATION | Same |
| MET-07 | ADVANCED | NO DIRECT APPLICATION DEPENDENCY | NOT-REQUIRED-FOR-APPLICATION | Candidate link to DEC-058/083 considered, not adopted (Phase 3 §19 open Q2) |
| MET-08 | ADVANCED | SUPPORTING/CROSS-CUTTING | OVERVIEW | Adaptive-response-to-restriction background for DEC-084 |
| MET-09 | ADVANCED | NO DIRECT APPLICATION DEPENDENCY | NOT-REQUIRED-FOR-APPLICATION | Reached only indirectly via CLIN-10 |
| MET-10 | ADVANCED | SUPPORTING/CROSS-CUTTING | OVERVIEW | Diabetes regulatory background for DEC-100 — **not** scope-pending: CLIN-07 is already concretely mapped (§7) |

### 5.4 CHO — Carbohydrates

| Topic | Phase 2 Level | Phase 3 Centrality | Phase 4 Depth | Notes |
|---|---|---|---|---|
| CHO-01 | FOUNDATION | NO DIRECT APPLICATION DEPENDENCY | NOT-REQUIRED-FOR-APPLICATION | — |
| CHO-02 | FOUNDATION | NO DIRECT APPLICATION DEPENDENCY | NOT-REQUIRED-FOR-APPLICATION | — |
| CHO-03 | INTERMEDIATE | NO DIRECT APPLICATION DEPENDENCY | NOT-REQUIRED-FOR-APPLICATION | — |
| CHO-04 | INTERMEDIATE | CORE APPLICATION | **FULL** | Requirement/pattern hub |
| CHO-05 | ADVANCED | CORE APPLICATION | **FULL** | Timing/performance hub |

### 5.5 LIP — Lipids

| Topic | Phase 2 Level | Phase 3 Centrality | Phase 4 Depth | Notes |
|---|---|---|---|---|
| LIP-01 | FOUNDATION | NO DIRECT APPLICATION DEPENDENCY | NOT-REQUIRED-FOR-APPLICATION | — |
| LIP-02 | FOUNDATION | NO DIRECT APPLICATION DEPENDENCY | NOT-REQUIRED-FOR-APPLICATION | — |
| LIP-03 | INTERMEDIATE | SUPPORTING/CROSS-CUTTING | OVERVIEW | Background for DEC-036 |
| LIP-04 | ADVANCED | SPECIALIZED (indirect via CLIN-10), candidate not adopted | NOT-REQUIRED-FOR-APPLICATION | Direct link considered (Phase 3 §19 open Q1), not adopted; reachable only through CLIN-10's own depth |
| LIP-05 | INTERMEDIATE | CORE APPLICATION | **FULL** | Fat-requirement hub |
| LIP-06 | ADVANCED | SUPPORTING/CROSS-CUTTING | OVERVIEW | Background for DEC-019 |

### 5.6 PRO — Protein and Amino Acids

| Topic | Phase 2 Level | Phase 3 Centrality | Phase 4 Depth | Notes |
|---|---|---|---|---|
| PRO-01 | FOUNDATION | NO DIRECT APPLICATION DEPENDENCY | NOT-REQUIRED-FOR-APPLICATION | — |
| PRO-02 | FOUNDATION | NO DIRECT APPLICATION DEPENDENCY | NOT-REQUIRED-FOR-APPLICATION | — |
| PRO-03 | INTERMEDIATE | SUPPORTING/CROSS-CUTTING | OVERVIEW | Background for DEC-031 |
| PRO-04 | INTERMEDIATE | CORE APPLICATION | **FULL** | Requirement hub (esp. PRO-04.02) |
| PRO-05 | ADVANCED | SUPPORTING/CROSS-CUTTING | OVERVIEW | Boundary-case safety framing for DEC-031 |
| PRO-06 | ADVANCED | CORE APPLICATION | **FULL** | Training/timing-application hub |

### 5.7 VIT — Vitamins

| Topic | Phase 2 Level | Phase 3 Centrality | Phase 4 Depth | Notes |
|---|---|---|---|---|
| VIT-01 | FOUNDATION | CORE APPLICATION | **FULL** | DEC-042/043 |
| VIT-02 | FOUNDATION | CORE APPLICATION | **FULL** | DEC-042/043 |
| VIT-03 | INTERMEDIATE | CORE APPLICATION | **FULL** | Adequacy-judgment hub, DEC-041 |
| VIT-04 | ADVANCED | IMPORTANT | WORKING | Athlete-specific, DEC-045 |

### 5.8 MIN — Minerals and Trace Elements

| Topic | Phase 2 Level | Phase 3 Centrality | Phase 4 Depth | Notes |
|---|---|---|---|---|
| MIN-01 | FOUNDATION | CORE APPLICATION | **FULL** | DEC-042 |
| MIN-02 | FOUNDATION | CORE APPLICATION | **FULL** | DEC-042 |
| MIN-03 | INTERMEDIATE | CORE APPLICATION | **FULL** | Adequacy-judgment hub, DEC-041 |
| MIN-04 | ADVANCED | IMPORTANT | WORKING | Athlete-specific, DEC-045 |

### 5.9 FLU — Water, Fluid, Electrolyte and Acid-Base Balance

| Topic | Phase 2 Level | Phase 3 Centrality | Phase 4 Depth | Notes |
|---|---|---|---|---|
| FLU-01 | FOUNDATION | CORE APPLICATION | **FULL** | DEC-046 |
| FLU-02 | FOUNDATION | CORE APPLICATION | **FULL** | DEC-049 |
| FLU-03 | INTERMEDIATE | NO DIRECT APPLICATION DEPENDENCY | NOT-REQUIRED-FOR-APPLICATION | Clinical acid-base content, no `DEC` use |
| FLU-04 | INTERMEDIATE | CORE APPLICATION | **FULL** | Domain hub — DEC-047/048/049 |
| FLU-05 | ADVANCED | CORE APPLICATION | **FULL** | DEC-050 |

### 5.10 GI — Digestion, Absorption and Gastrointestinal Physiology

| Topic | Phase 2 Level | Phase 3 Centrality | Phase 4 Depth | Notes |
|---|---|---|---|---|
| GI-01 | FOUNDATION | SUPPORTING/CROSS-CUTTING | OVERVIEW | Background for DEC-051 |
| GI-02 | FOUNDATION | NO DIRECT APPLICATION DEPENDENCY | NOT-REQUIRED-FOR-APPLICATION | — |
| GI-03 | INTERMEDIATE (depth uncertain, Phase 1 deferral open) | SPECIALIZED, mapping uncertain | **CONDITIONAL** | Gated on the still-open Phase 1 content-inspection deferral, not on Phase 4 |
| GI-04 | ADVANCED | CORE APPLICATION | **FULL** | Domain hub — DEC-051/054 |
| GI-05 | ADVANCED (cross-ref to CLIN-04/05) | IMPORTANT | WORKING | DEC-052; cross-refs CLIN-04/05 |

### 5.11 BODY — Energy Balance, Body Composition and Weight Management

| Topic | Phase 2 Level | Phase 3 Centrality | Phase 4 Depth | Notes |
|---|---|---|---|---|
| BODY-01 | FOUNDATION | CORE APPLICATION | **FULL** | Single highest-reuse topic outside ASSESS-01 (10 decisions) |
| BODY-02 | INTERMEDIATE | CORE APPLICATION | **FULL** | Energy-estimation hub (esp. BODY-02.01–.03) |
| BODY-03 | INTERMEDIATE | CORE APPLICATION | **FULL** | DEC-025/026/030 |
| BODY-04 | INTERMEDIATE | CORE APPLICATION | **FULL** | DEC-001/004/022/027 |
| BODY-05 | ADVANCED | CORE APPLICATION | **FULL** | DEC-001/022/027/084 |
| BODY-06 | ADVANCED | IMPORTANT | WORKING | DEC-004 |
| BODY-07 | ADVANCED | IMPORTANT | WORKING | DEC-001/003/030 |

### 5.12 ASSESS — Nutrition Assessment

| Topic | Phase 2 Level | Phase 3 Centrality | Phase 4 Depth | Notes |
|---|---|---|---|---|
| ASSESS-01 | INTERMEDIATE | CORE APPLICATION | **FULL** | Single highest-utilization topic in the universe (20+ decisions, esp. ASSESS-01.03); also the REQUIRED Phase 2 prerequisite feeding CLIN-01 (§4) |
| ASSESS-02 | INTERMEDIATE | SUPPORTING/CROSS-CUTTING (future-feature caveat) | OVERVIEW *(conditional upgrade if lab-data ingestion is ever built — §19 open Q5)* | DEC-041 only, CONTEXTUAL |
| ASSESS-03 | INTERMEDIATE | IMPORTANT | WORKING | DEC-005/009/026; also feeds CLIN-01 via the Phase 2 REQUIRED prerequisite chain (§4) |
| ASSESS-04 | ADVANCED | SPECIALIZED/REFERENCE, zero active use | **CONDITIONAL** | Not a permanent island per Phase 3 §10 — gated on a future nutrition-focused-physical-exam feature |
| ASSESS-05 | ADVANCED | IMPORTANT | WORKING | NCP screening/monitoring hub — DEC-006/076/080/088 |
| ASSESS-06 | ADVANCED | SPECIALIZED/REFERENCE, zero active use | **CONDITIONAL** | Not a permanent island per Phase 3 §10 — gated on a future lab-biomarker-ingestion feature |

### 5.13 SPORT — Exercise and Sport Nutrition

| Topic | Phase 2 Level | Phase 3 Centrality | Phase 4 Depth | Notes |
|---|---|---|---|---|
| SPORT-01 | INTERMEDIATE | CORE APPLICATION | **FULL** | Bridge topic — DEC-019/092 |
| SPORT-02 | INTERMEDIATE | CORE APPLICATION | **FULL** | DEC-019/092 |
| SPORT-03 | ADVANCED | CORE APPLICATION | **FULL** | Timing-translation hub — DEC-055/056/057 |
| SPORT-04 | ADVANCED | IMPORTANT | WORKING | DEC-093/094 |
| SPORT-05 | ADVANCED | CORE APPLICATION | **FULL** | DEC-097 |
| SPORT-06 | ADVANCED | SUPPORTING/CROSS-CUTTING | OVERVIEW | DEC-095 |
| SPORT-07 | ADVANCED | CORE APPLICATION | **FULL** | DEC-048/096 |
| SPORT-08 | ADVANCED | SPECIALIZED, zero use | NOT-REQUIRED-FOR-APPLICATION | Flagged as a real decision-inventory gap (§8), not an intentional non-gap |
| SPORT-09 | ADVANCED | IMPORTANT | WORKING | DEC-098; also = LIFE-08 by cross-reference |
| SPORT-10 | ADVANCED | CORE APPLICATION | **FULL** | Domain safety hub — DEC-013/016/095/098 |
| SPORT-11 | SPECIALIZED | SPECIALIZED, mapping uncertain, current-evidence-primary | **CONDITIONAL** | Gated on a currency check (Phase 1 item 8) before any curriculum/application use |
| SPORT-12 | ADVANCED | SUPPORTING/CROSS-CUTTING | OVERVIEW | DEC-054 |
| SPORT-13 | ADVANCED | IMPORTANT | WORKING | DEC-055/093 |

### 5.14 CLIN — Clinical Nutrition / Medical Nutrition Therapy

Governed by the Gate 1 clinical-scope deferral (§7.2) — see §7 below for the full treatment. Summary
only here; do not read this table as resolving `DEC-099`.

| Topic | Phase 2 Level | Phase 3 Centrality | Phase 4 Depth | Notes |
|---|---|---|---|---|
| CLIN-01 | INTERMEDIATE | CORE APPLICATION | **FULL** | Clinical-domain entry-point hub — DEC-012/014/015/090/099/101/102; also the REQUIRED endpoint of the ASSESS-01/02/03/05 Phase 2 prerequisite chain (§4) |
| CLIN-02 | ADVANCED | REFERENCE/EDUCATIONAL, zero use, confirmed outside scope | NOT-REQUIRED-FOR-APPLICATION *(permanent, not scope-pending)* | Inpatient enteral/parenteral nutrition — outside any plausible consumer-app scope regardless of DEC-099 |
| CLIN-03 | ADVANCED | CORE APPLICATION | **FULL** | DEC-053/061 |
| CLIN-04 | ADVANCED | IMPORTANT | WORKING | DEC-052 via GI-05 |
| CLIN-05 | ADVANCED | IMPORTANT | WORKING | DEC-052 via GI-05 |
| CLIN-06 | ADVANCED | candidate, pending DEC-099 | **SCOPE-PENDING** | Layer 5 general-practice-tier candidate |
| CLIN-07 | ADVANCED | CORE APPLICATION | **FULL** | Already concretely mapped (DEC-099/100) — not pending |
| CLIN-08 | ADVANCED | candidate, pending DEC-099 | **SCOPE-PENDING** | Layer 5 general-practice-tier candidate |
| CLIN-09 | ADVANCED | candidate, pending DEC-099 | **SCOPE-PENDING** | Layer 5 general-practice-tier candidate |
| CLIN-10 | ADVANCED | CORE APPLICATION | **FULL** | Already concretely mapped (DEC-099/100) — not pending |
| CLIN-11 | ADVANCED | candidate, pending DEC-099 | **SCOPE-PENDING** | Layer 5 general-practice-tier candidate |
| CLIN-12 | ADVANCED | CORE APPLICATION | **FULL** | Already concretely mapped (DEC-099/100) — not pending |
| CLIN-13 | ADVANCED | candidate, pending DEC-099 | **SCOPE-PENDING** | Layer 5 general-practice-tier candidate |
| CLIN-14 | ADVANCED | candidate, pending DEC-099 | **SCOPE-PENDING** | Layer 5 general-practice-tier candidate |
| CLIN-15 | SPECIALIZED | candidate, pending DEC-099, Layer 6 | **SCOPE-PENDING** *(destined CONDITIONAL even if resolved — CANDIDATE_EXCLUSIONS ELECTIVE)* | HIV/AIDS |
| CLIN-16 | SPECIALIZED | candidate, pending DEC-099, Layer 6 | **SCOPE-PENDING** *(destined CONDITIONAL)* | Critical Care |
| CLIN-17 | SPECIALIZED | candidate, pending DEC-099, Layer 6 | **SCOPE-PENDING** *(destined CONDITIONAL)* | Rheumatic/Musculoskeletal |
| CLIN-18 | SPECIALIZED | candidate, pending DEC-099, Layer 6 | **SCOPE-PENDING** *(destined CONDITIONAL)* | Neurologic |
| CLIN-19 | SPECIALIZED | candidate, pending DEC-099, Layer 6 | **SCOPE-PENDING** *(destined CONDITIONAL)* | Psychiatric/Cognitive |
| CLIN-20 | ADVANCED | CORE APPLICATION | **FULL** | DEC-004/013/016 — explicitly kept out of the elective list (`CANDIDATE_EXCLUSIONS.md`'s own guardrail note) |
| CLIN-21 | SPECIALIZED | candidate, pending DEC-099, Layer 6 | **SCOPE-PENDING** *(destined CONDITIONAL)* | LBW/Neonatal |
| CLIN-22 | SPECIALIZED | candidate, pending DEC-099, Layer 6 | **SCOPE-PENDING** *(destined CONDITIONAL)* | Genetic Metabolic Disorders |
| CLIN-23 | SPECIALIZED | candidate, pending DEC-099, Layer 6 | **SCOPE-PENDING** *(destined CONDITIONAL)* | Intellectual/Developmental Disabilities |
| CLIN-24 | ADVANCED | IMPORTANT | WORKING | DEC-100 — already concretely mapped, not pending |
| CLIN-25 | SPECIALIZED | candidate, pending DEC-099, Layer 6 | **SCOPE-PENDING** *(destined CONDITIONAL)* | Oral/Dental |
| CLIN-26 | INTERMEDIATE | candidate, pending DEC-099 | **SCOPE-PENDING** | Layer 4 cross-cutting framework, not Layer 5/6 — see §7 |
| CLIN-27 | SPECIALIZED | candidate, pending DEC-099, Layer 6 | **SCOPE-PENDING** *(destined CONDITIONAL)* | Transgender Care; = LIFE-07 by cross-reference |

### 5.15 LIFE — Nutrition Across the Life Course

| Topic | Phase 2 Level | Phase 3 Centrality | Phase 4 Depth | Notes |
|---|---|---|---|---|
| LIFE-01 | ADVANCED | CORE APPLICATION | **FULL** | Domain hub — DEC-012/045/103/104/105 |
| LIFE-02 | ADVANCED | IMPORTANT | WORKING | DEC-012/103/104 |
| LIFE-03 | ADVANCED | IMPORTANT | WORKING | DEC-103/104 |
| LIFE-04 | ADVANCED | IMPORTANT | WORKING | DEC-103/104 |
| LIFE-05 | INTERMEDIATE | SUPPORTING/CROSS-CUTTING | OVERVIEW | DEC-104 only, matches its own thin classification |
| LIFE-06 | ADVANCED | IMPORTANT | WORKING | DEC-103/104 |
| LIFE-07 | SPECIALIZED (= CLIN-27) | cross-ref to CLIN-27 | **SCOPE-PENDING** *(destined CONDITIONAL)* | Inherits CLIN-27's status in full |
| LIFE-08 | ADVANCED (= SPORT-09) | cross-ref to SPORT-09 | WORKING | Inherits SPORT-09's status in full |

### 5.16 RESEARCH — Nutrition Research Methods and Evidence

| Topic | Phase 2 Level | Phase 3 Centrality | Phase 4 Depth | Notes |
|---|---|---|---|---|
| RESEARCH-01 | FOUNDATION | IMPORTANT | WORKING | DEC-108 |
| RESEARCH-02 | INTERMEDIATE | CORE APPLICATION | **FULL** | Confounding/observational-design hub — DEC-021/081/087/110 |
| RESEARCH-03 | INTERMEDIATE | SUPPORTING/CROSS-CUTTING | OVERVIEW | DEC-111 |
| RESEARCH-04 | INTERMEDIATE | CORE APPLICATION | **FULL** | Dietary-assessment-methodology hub — DEC-024/077/082/112 |
| RESEARCH-05 | INTERMEDIATE | REFERENCE/EDUCATIONAL, zero use | NOT-REQUIRED-FOR-APPLICATION | Matches own CANDIDATE_EXCLUSIONS REFERENCE-ONLY framing; app's actual composition-data need is served by NUT-04 |
| RESEARCH-06 | ADVANCED | SUPPORTING/CROSS-CUTTING | OVERVIEW | DEC-077 |
| RESEARCH-07 | ADVANCED | SUPPORTING/CROSS-CUTTING | OVERVIEW | DEC-079/109 |
| RESEARCH-08 | ADVANCED | SUPPORTING/CROSS-CUTTING | OVERVIEW | DEC-112 |
| RESEARCH-09 | SPECIALIZED | NO DIRECT APPLICATION DEPENDENCY | NOT-REQUIRED-FOR-APPLICATION | Zero-edge island (also in `LEARNING_DEPENDENCY_GRAPH.md`) |
| RESEARCH-10 | ADVANCED | NO DIRECT APPLICATION DEPENDENCY | NOT-REQUIRED-FOR-APPLICATION | Candidate link to DEC-058/091 considered, not adopted (Phase 3 §19 open Q2) |
| RESEARCH-11 | SPECIALIZED | SPECIALIZED, current-evidence-primary | **CONDITIONAL** | SPECIAL-05 convergence point |
| RESEARCH-12 | SPECIALIZED | SPECIALIZED, current-evidence-primary | **CONDITIONAL** | SPECIAL-05 convergence point |
| RESEARCH-13 | SPECIALIZED | NO DIRECT APPLICATION DEPENDENCY | NOT-REQUIRED-FOR-APPLICATION | Zero-edge island |
| RESEARCH-14 | SPECIALIZED | NO DIRECT APPLICATION DEPENDENCY | NOT-REQUIRED-FOR-APPLICATION | Zero-edge island |
| RESEARCH-15 | ADVANCED | IMPORTANT | WORKING | DEC-111, mapping noted as approximate |

### 5.17 PUBHEALTH — Public Health and Population Nutrition

| Topic | Phase 2 Level | Phase 3 Centrality | Phase 4 Depth | Notes |
|---|---|---|---|---|
| PUBHEALTH-01 | INTERMEDIATE | NO DIRECT APPLICATION DEPENDENCY | NOT-REQUIRED-FOR-APPLICATION | Population-level, not individual-decision |
| PUBHEALTH-02 | INTERMEDIATE | NO DIRECT APPLICATION DEPENDENCY | NOT-REQUIRED-FOR-APPLICATION | Surveillance methodology |
| PUBHEALTH-03 | FOUNDATION | IMPORTANT | WORKING | DEC-107 |
| PUBHEALTH-04 | INTERMEDIATE | IMPORTANT | WORKING | Cost/access hub — DEC-064/073/106 |
| PUBHEALTH-05 | INTERMEDIATE | SUPPORTING/CROSS-CUTTING | OVERVIEW | DEC-074 |
| PUBHEALTH-06 | INTERMEDIATE | NO DIRECT APPLICATION DEPENDENCY | NOT-REQUIRED-FOR-APPLICATION | Matches own thinnest-topic classification |

### 5.18 SPECIAL — Special and Cross-Cutting Topics

| Topic | Phase 2 Level | Phase 3 Centrality | Phase 4 Depth | Notes |
|---|---|---|---|---|
| SPECIAL-01 | SPECIALIZED | SPECIALIZED, current-evidence-primary | **CONDITIONAL** | SPECIAL-05 convergence point |
| SPECIAL-02 | ADVANCED | CORE APPLICATION | **FULL** | DEC-044/097 |
| SPECIAL-03 | INTERMEDIATE | CORE APPLICATION | **FULL** | Counseling/adherence hub — DEC-089/091 |
| SPECIAL-04 | INTERMEDIATE | CORE APPLICATION | **FULL** | **Override of `CANDIDATE_EXCLUSIONS.md`'s OPTIONAL default — see §6** |
| SPECIAL-05 | SPECIALIZED | n/a (convergence marker, not an independent topic) | *(inherits — see constituents)* | Depth is whatever SPECIAL-01/RESEARCH-12/SPORT-11 resolve to (all CONDITIONAL today) |

### 5.19 Level-2 Subtopics (71) — Compact Table

Mirrors Phase 3's own §8b method exactly: a subtopic inherits its parent Level-1 topic's Phase 4 depth
unless Phase 3 already differentiated it independently in its own §5/§8b (in which case that subtopic's
Phase 3 strength, not its parent's centrality band, drives the Phase 4 depth below).

| Subtopic Range | Parent | Independently differentiated? | Phase 4 Depth |
|---|---|---|---|
| NUT-02.01–.05 | NUT-02 | No | WORKING (inherits NUT-02) |
| NUT-03.01–.02 | NUT-03 | No | **FULL** (inherits NUT-03) |
| NUT-03.03 | NUT-03 | Yes — independently CORE at DEC-038 | **FULL** |
| NUT-04.01–.03 | NUT-04 | No | **FULL** (inherits NUT-04) |
| MET-01.01–.02 | MET-01 | No | NOT-REQUIRED-FOR-APPLICATION |
| MET-02.01–.03 | MET-02 | No | NOT-REQUIRED-FOR-APPLICATION |
| MET-03.01–.03 | MET-03 | No | NOT-REQUIRED-FOR-APPLICATION |
| MET-04.01–.03 | MET-04 | No | NOT-REQUIRED-FOR-APPLICATION |
| MET-05.01–.03 | MET-05 | No | NOT-REQUIRED-FOR-APPLICATION |
| MET-06.01–.04 | MET-06 | No | NOT-REQUIRED-FOR-APPLICATION |
| MET-08.01–.04 | MET-08 | No (parent-level use only) | OVERVIEW (inherits MET-08) |
| CHO-05.01–.04 | CHO-05 | Yes — independently CORE at DEC-035/094 | **FULL** |
| BODY-02.01–.03 | BODY-02 | Yes — independently CORE at DEC-018 | **FULL** |
| BODY-04.01–.02 | BODY-04 | No | **FULL** (inherits BODY-04) |
| BODY-05.01–.04 | BODY-05 | No | **FULL** (inherits BODY-05) |
| ASSESS-01.01–.02 | ASSESS-01 | No | **FULL** (inherits ASSESS-01) |
| ASSESS-01.03 | ASSESS-01 | Yes — independently CORE at 10 decisions, the single most-cited subtopic in the universe | **FULL** |
| PRO-03.01–.03 | PRO-03 | No | OVERVIEW (inherits PRO-03) |
| PRO-04.01 | PRO-04 | No | **FULL** (inherits PRO-04) |
| PRO-04.02 | PRO-04 | Yes — independently CORE at DEC-031/032 | **FULL** |
| PRO-05.01–.03 | PRO-05 | No | OVERVIEW (inherits PRO-05) |
| SPORT-01.01–.02 | SPORT-01 | No | **FULL** (inherits SPORT-01) |
| SPORT-04.01–.03 | SPORT-04 | No | WORKING (inherits SPORT-04) |
| SPORT-09.01–.02 | SPORT-09 | No | WORKING (inherits SPORT-09) |
| RESEARCH-02.01–.05 | RESEARCH-02 | No (parent-level use only) | **FULL** (inherits RESEARCH-02) |
| RESEARCH-11.01–.02 | RESEARCH-11 | No | **CONDITIONAL** (inherits RESEARCH-11) |

**71 of 71 Level-2 subtopics accounted for** (verified programmatically by summing each row's subtopic
range against `MASTER_TOPIC_UNIVERSE.md`'s own per-domain Level-2 counts — NUT 11, MET 22, CHO 4, PRO 8,
BODY 9, ASSESS 3, SPORT 7, RESEARCH 7 = 71; all other domains have 0 Level-2 subtopics). **142 of 142
Level-1 topics accounted for in §5.1–§5.18. 213 of 213 total topic IDs accounted for.**

*Discrepancy found and corrected in this document only, flagged rather than silently carried forward:*
`APP_DECISION_KNOWLEDGE_MAPPING.md`'s own §8b table (and its §20 Validation Summary, which claims "71 of
71 Level-2 subtopics accounted for") **omits `NUT-04.01–.03`** (3 subtopics), meaning that document's own
§8b table sums to 68, not 71, despite its stated claim. This document's own subtopic table above includes
`NUT-04.01–.03` (added, tiered `FULL` per §5.1's `NUT-04` row) so that **this** document's 71-count is
correct. `APP_DECISION_KNOWLEDGE_MAPPING.md` itself was **not edited** to fix this — per the standing
instruction not to reopen closed Phase 3 work without a demonstrated inconsistency, this is reported as
exactly that (a demonstrated, narrow bookkeeping omission — no topic, decision, or mapping strength is
affected, only one summary table's completeness), flagged in `AI_SESSION_STATE.md` as a small,
separately-authorizable correction for a future pass, in the same category as the two Phase 3 bookkeeping
bugs already found and corrected at Gate 1.

---

## 6. `CANDIDATE_EXCLUSIONS.md` — working default, applied with one documented override

Per Gate 1 §7.3, `CANDIDATE_EXCLUSIONS.md`'s ~30 proposed designations are Phase 4's starting default.
Cross-checked against every Phase 4 depth tier above:

**Consistent with the default (no override needed) — 27 of ~30 topics:**
`DRV-02/03/04/05` (its REFERENCE-ONLY proposal matches Phase 4's REFERENCE-ONLY tier exactly);
`RESEARCH-05` (REFERENCE-ONLY → NOT-REQUIRED-FOR-APPLICATION, a finer split, not a contradiction — §3);
`NUT-05`, `PUBHEALTH-06`, `GI-03`, `LIFE-05` (OPTIONAL → OVERVIEW/CONDITIONAL/NOT-REQUIRED, all
consistent with "not core, lighter treatment" even though the two documents' axes differ — a curriculum's
OPTIONAL is about whether a human *lesson* is skippable, Phase 4's tier is about whether the
*application* must represent it; the two happen to agree here); the 10 Layer-6 CLIN topics
(`CLIN-15/16/17/18/19/21/22/23/25/27`, ELECTIVE → SCOPE-PENDING now, destined CONDITIONAL even after
`DEC-099` resolves — Phase 4 does not treat "elective" as "delete," consistent with `CANDIDATE_
EXCLUSIONS.md`'s own no-deletion guardrail); `RESEARCH-09/13/14` (ELECTIVE/OUTSIDE-CORE-PATHWAY →
NOT-REQUIRED-FOR-APPLICATION, consistent); `RESEARCH-11/12`, `SPORT-11`, `SPECIAL-01` (ELECTIVE →
CONDITIONAL, consistent with "advanced-track, not core"); `PUBHEALTH-06` (also listed OUTSIDE-CORE-
PATHWAY → NOT-REQUIRED-FOR-APPLICATION, consistent).

**Override, documented per Gate 1 §7.3's explicit allowance:**

| Topic | `CANDIDATE_EXCLUSIONS.md` default | Phase 4 depth | Reason for override |
|---|---|---|---|
| `SPECIAL-04` (Cultural Competency in Nutrition Care) | OPTIONAL — "valuable, structurally peripheral," no REQUIRED dependency edges in either direction (Phase 2's own basis, written before Phase 3's decision-level analysis existed) | **FULL** | Phase 3's Knowledge Mapping (§8a) found `SPECIAL-04` is `CORE APPLICATION`, used at CORE strength by two decisions (`DEC-059` food-selection cultural filter, `DEC-064` practical-translation cultural framing) — a decision-level dependency Phase 2's own prerequisite-graph analysis could not have seen, because it predates the 112-decision inventory. The topic is not "structurally peripheral" to the *application*, whatever its position in the *pedagogical* dependency graph. This is exactly the documented, application-analysis-driven override Gate 1 §7.3 anticipated. |

No other `CANDIDATE_EXCLUSIONS.md` designation is overridden. `CLIN-16`'s OUTSIDE-CORE-PATHWAY
designation (in addition to its ELECTIVE one) is left as-is — both point to the same SCOPE-PENDING/
CONDITIONAL outcome here, so there is nothing to reconcile.

**`CANDIDATE_EXCLUSIONS.md` itself was not edited.** It remains Phase 4's working default going forward,
not a ratified final decision, per Gate 1 §7.3.

---

## 7. Clinical scope — carried forward as explicitly unresolved

Per Gate 1 §7.2 (Option C), `DEC-099`/`DEC-100` are **not resolved here**. This section only makes the
consequence concrete for Phase 4's own output, it does not narrow the eventual decision:

- **9 of CLIN's 27 topics are already concretely mapped** to a named decision regardless of `DEC-099`'s
  broader boundary (`CLIN-01, 03, 04, 05, 07, 10, 12, 20, 24`) — these have real Phase 4 depth tiers
  above (`FULL` or `WORKING`) and are **not** affected by the deferral.
- **1 topic (`CLIN-02`) is confirmed permanently out of scope** regardless of `DEC-099` (inpatient
  nutrition support) — `NOT-REQUIRED-FOR-APPLICATION`, not `SCOPE-PENDING`.
- **17 topics remain genuinely `SCOPE-PENDING`**: `CLIN-06, 08, 09, 11, 13, 14, 26` (Layer 4/5
  general-practice-tier candidates) and `CLIN-15, 16, 17, 18, 19, 21, 22, 23, 25, 27` (Layer 6
  SPECIALIZED candidates, destined `CONDITIONAL` even once resolved, per `CANDIDATE_EXCLUSIONS.md`'s own
  ELECTIVE framing for exactly this set). `LIFE-07` inherits `CLIN-27`'s status. That totals 18 —
  matching the figure already validated in the Gate 1 decision record (9 mapped + 18 not = 27).
- **No depth tier is assigned to any of these 18 topics in this document.** When `DEC-099` is eventually
  resolved (Gate 1 §7.2's Option A/B, or a future decision), the 7 Layer-4/5 candidates would receive a
  `FULL` or `WORKING` tier by the same rule applied to `CLIN-07/10/12/24` above; the 10 Layer-6
  candidates would most plausibly land `CONDITIONAL` even then, matching their already-adopted ELECTIVE
  default (§6). This is stated as the *mechanical consequence* of the tiering rule already in place, not
  as a pre-decision of `DEC-099` itself.

---

## 8. The Seven Deliverables, Answered

Per `PROJECT_AI_PROTOCOL.md` §12, cross-referencing the tables above rather than repeating them.

**1. Decision-critical knowledge** — every topic tiered `FULL` in §5 (**42 Level-1 topics**, counted
directly from §5's tables, plus their differentiated subtopics per §5.19): `NUT-03/04`; `CHO-04/05`;
`LIP-05`; `PRO-04/06`; `VIT-01/02/03`; `MIN-01/02/03`; `FLU-01/02/04/05`; `GI-04`; `BODY-01–05`;
`ASSESS-01`; `SPORT-01/02/03/05/07/10`; `CLIN-01/03/07/10/12/20`; `LIFE-01`; `RESEARCH-02/04`;
`SPECIAL-02/03/04`.

**2. Required learning depth** — the full per-topic verdict is §5's tables; the six-tier scale is §2.

**3. Prerequisite knowledge** — traced explicitly in §4: the application's own reasoning does **not**
require the Phase 2 pedagogical-prerequisite chains beneath its `FULL`-tier topics (the ~14-topic MET/
CHO/LIP/PRO biochemistry-and-digestion island stays `NOT-REQUIRED-FOR-APPLICATION` despite sitting
upstream, in the human-teaching graph, of `BODY-02`/`SPORT-01`/`CHO-04`/etc.). The one place a Phase 2
REQUIRED prerequisite chain **does** climb into application depth is `ASSESS-01/02/03/05 → CLIN-01`,
where Phase 2's teaching dependency and Phase 3's decision dependency are the same relationship (§4,
§5.14).

**4. Reference-only knowledge** — `DRV-02/03/04/05`, `RESEARCH-05` (§5.2, §5.16) — the topics actually
consulted for a value by a decision, never reasoned about.

**5. Useful-but-not-operationally-required knowledge** — every topic tiered `OVERVIEW` in §5 (**17
Level-1 topics**, counted directly from §5's tables): `NUT-01`; `LIP-03/06`; `PRO-03/05`; `MET-08/10`;
`GI-01`; `LIFE-05`; `SPORT-06/12`; `RESEARCH-03/06/07/08`; `PUBHEALTH-05`; `ASSESS-02` (conditionally
upgradable) — interpretive/contextual background for a `FULL`-tier decision, never itself the primary
reasoning target.

**6. Application decisions lacking adequate curriculum support** — reusing, not re-deriving,
`APP_DECISION_GAPS.md`'s own finding (§5/§9/§21): only **`DEC-067, 068, 069`** are a confirmed `GAP-A`
(no knowledge representation at all — recipe/preparation/culinary science, confirmed absent from all 7
source books by `APPARENT_CURRICULUM_GAPS.md` §1). The much larger Meal-Planning/Shopping cluster
(`DEC-065, 070–075, 086`) is a different, already-classified gap type (`GAP-D`, practical-translation —
the science exists, the action-bridge doesn't) — not re-litigated here, per `PROJECT_AI_PROTOCOL.md`
§24's gap-taxonomy discipline (a `GAP-D` must never be restated as a `GAP-A`).

**7. Curriculum content with no application role** — every topic tiered `NOT-REQUIRED-FOR-APPLICATION`
in §5 (**29 Level-1 topics**, counted directly from §5's tables): the foundational-biochemistry/
digestion island — `MET-01–07/09` (8 topics — includes `MET-07`, whose candidate decision link was
considered and not adopted per Phase 3 §19), `CHO-01–03` (3), `LIP-01/02/04` (3 — `LIP-04` reached only
indirectly via `CLIN-10`, its own direct link also considered and not adopted), `PRO-01/02` (2); plus
`FLU-03`; `GI-02`; `NUT-05`; `CLIN-02` (confirmed permanent, not scope-pending); `SPORT-08` (flagged
separately as a likely decision-inventory gap, not an intentional non-gap — §5.13); `RESEARCH-05/09/10/
13/14` (5); `PUBHEALTH-01/02/06` (3). **This is not a claim that these topics are unimportant or should
be removed from any future human-facing curriculum** (Phase 6+) — only that this specific decision-
support application's own knowledge base does not need to represent them, per §1's stated distinction
between knowledge coverage and application capability.

---

## 9. Validation

- **213/213 topic IDs accounted for** across §5.1–§5.19 (142 Level-1 + 71 Level-2), cross-checked against
  `MASTER_TOPIC_UNIVERSE.md`'s own per-domain counts (§909–932 of that file) — every domain's topic count
  matches (NUT 5/11, DRV 5/0, MET 10/22, CHO 5/4, LIP 6/0, PRO 6/8, VIT 4/0, MIN 4/0, FLU 5/0, GI 5/0,
  BODY 7/9, ASSESS 6/3, SPORT 13/7, CLIN 27/0, LIFE 8/0, RESEARCH 15/7, PUBHEALTH 6/0, SPECIAL 5/0).
- **Level-1 tier tally (142 total), extracted programmatically from §5's own "Phase 4 Depth" column, not
  hand-counted:** `FULL` 42 · `WORKING` 24 · `OVERVIEW` 17 (16 plain + 1 conditionally-upgradable) ·
  `NOT-REQUIRED-FOR-APPLICATION` 29 (28 plain + 1 explicitly-permanent) · `REFERENCE-ONLY` 4 ·
  `SCOPE-PENDING` 7 (Layer 4/5 candidates, no destined tier yet) · `SCOPE-PENDING` (destined
  `CONDITIONAL`) 11 (10 Layer-6 CLIN topics + `LIFE-07`) · `CONDITIONAL` (non-CLIN) 7 · `SPECIAL-05`
  (inherits, not independently tiered) 1. Sum: 42+24+17+29+4+7+11+7+1 = **142** ✓. The two §8 deliverable
  counts (42 `FULL`, 17 `OVERVIEW`, 29 `NOT-REQUIRED-FOR-APPLICATION`) match this tally exactly — both
  were derived from the same extraction, not two independent estimates.
- **Every Phase 4 depth tier traces directly to a Phase 3 §8a row or §17 band** — no tier was assigned by
  independent judgment where Phase 3 data existed; deviations are limited to the two explicitly-stated
  refinements (§3's REFERENCE-ONLY/NOT-REQUIRED split, §4's prerequisite-chain non-inheritance) and the
  one documented `CANDIDATE_EXCLUSIONS.md` override (§6, `SPECIAL-04`).
- **CLIN scope-pending count re-confirmed at 18** (§7), matching the figure already validated in
  `00_PROJECT_CONTROL/DECISIONS/2026-09-05-gate-1-phase-3-to-phase-4.md` §2 (9 concretely mapped + 18
  not = 27) — no new count was derived independently; this document reuses that validated figure.
  9 + 18 = 27 re-checked directly against §5.14's table.
  9 already-mapped: `CLIN-01, 03, 04, 05, 07, 10, 12, 20, 24` — counted directly from §5.14 (9 rows
  tiered `FULL`/`WORKING`, not `SCOPE-PENDING`, excluding `CLIN-02`).
  18 scope-pending: `CLIN-06, 08, 09, 11, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 25, 26, 27` plus
  `LIFE-07` (cross-reference, not a distinct CLIN ID) — 17 CLIN IDs, matching "17 genuinely scope-pending"
  once `CLIN-02` (confirmed out, not pending) is excluded from the raw 18-topic figure, consistent with
  the Gate 1 decision record's own §2 clarification.
- **No Phase 1/2/3 document was modified** while producing this artifact (read-only access throughout).
- **No `DEC` record, topic ID, or dependency edge was created, renamed, or deleted.**
- **No formula, numerical threshold, or algorithm was introduced** — every "depth" verdict is a
  qualitative tier (§2), consistent with `PROJECT_AI_PROTOCOL.md` §15/§28's premature-implementation
  rule (formulas remain out of scope until Phase 7).
- **`DEC-099`/`DEC-100` were not resolved** — §7 explicitly states the mechanical consequence of the
  existing tiering rule without pre-deciding the scope question itself.

---

## 10. Open Questions Carried Forward (not resolved here)

Same list as `00_PROJECT_CONTROL/AI_SESSION_STATE.md`'s "Human / ChatGPT Decisions Required" — this
document does not add to or narrow that list. Specifically **not resolved** by this artifact: `DEC-099`/
`DEC-100` clinical scope (§7); `SPORT-08`'s status as a possible decision-inventory gap (noted, not
closed — a new `DEC` record would be a Phase 3/inventory-level change, out of scope for Phase 4);
`SPORT-11`'s evidence-currency question; the curriculum spine (Phase 2 Options A–D); the Practical
Translation domain's final disposition; `ASSESS-02/04/06`'s future-lab-data-feature framing (§5.12);
`GI-03`'s content-inspection depth (§5.10).

One new, Phase-4-specific open question: **should `SPECIAL-04`'s override (§6) also prompt revisiting
`CANDIDATE_EXCLUSIONS.md`'s own OPTIONAL designation for it in a future Phase 2 touch-up**, given the
override's reasoning (a decision-level dependency Phase 2 could not have seen) is unlikely to be unique
to this one topic? Not acted on here — `CANDIDATE_EXCLUSIONS.md` was not edited, per Gate 1 §7.3 treating
it as a working default, not a target for revision during Phase 4.

---

## 11. Status

**This document is Phase 4's first artifact, not the whole of Phase 4.** It answers §12's seven
deliverables at the topic-depth level for all 213 topics. Not yet produced in Phase 4: a decision-level
companion view (per-`DEC` required-depth roll-up, if a future session judges one adds value beyond §5's
topic-level tables), and any resolution of the carried-forward open questions in §10 (none of which
Phase 4 is authorized to close). See `00_PROJECT_CONTROL/AI_SESSION_STATE.md` for the exact next action.
