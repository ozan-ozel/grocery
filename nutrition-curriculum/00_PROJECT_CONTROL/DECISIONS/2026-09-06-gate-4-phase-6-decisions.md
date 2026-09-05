# Decision Record — Gate 4 (Phase 6 Architectural Decisions)

**Date:** 2026-09-06
**Gate:** Gate 4 — End of Phase 6, per `PROJECT_AI_PROTOCOL.md` §21
**Review request:** `00_PROJECT_CONTROL/CHATGPT_REVIEW_REQUEST.md` (Gate 4 preparatory version, now
superseded by this record)
**Decided by:** Human (relaying ChatGPT/human review)
**Recorded by:** Claude Code, at the human's explicit instruction

---

## Governing principle for this record

Per explicit instruction: **no Phase 1–5 source-of-truth document is modified to incorporate these
decisions.** Every decision below is recorded here, in this new Phase 6 decision layer, and reflected in
`07_FINAL_CURRICULUM/` artifacts going forward. `CURRICULUM_SPINE_CANDIDATES.md`, `PHASE_2_HUMAN_
REVIEW.md`, `SPORT_NUTRITION_ARCHITECTURE.md`, `RESEARCH_ARCHITECTURE.md`, `CLINICAL_NUTRITION_
ARCHITECTURE.md`, and `CANDIDATE_EXCLUSIONS.md` remain exactly as they were — historical documents whose
open questions are now answered *elsewhere*, not rewritten in place.

---

## 1. Curriculum Spine — **Option D (Hybrid: Nutrition → Metabolism → Application)** — SELECTED

Three-act structure, adopted with the exact content emphasis the human specified:
- **Act 1 (Nutrition Foundations):** basic nutrient classification/chemistry, fundamental nutrition
  concepts, energy/requirement concepts, foundational dietary concepts.
- **Act 2 (Human Metabolism and Systems):** full metabolism spine; CHO/LIP/PRO metabolism at the
  mechanistic level; GI physiology/digestion; regulation and integration; exercise metabolism; relevant
  assessment/body-composition mechanisms.
- **Act 3 (Applied Nutrition):** nutrition assessment/interpretation; energy/body-composition
  application; sport; clinical; life stages; public health/food environment; research/evidence literacy
  plus advanced research topics; practical translation.

Explicitly not a "teach once" mandate — progressive reinforcement is retained where pedagogically
justified (item 1 of the human's message).

## 2. Sport Architecture — **Topic-by-topic role assignment (`SPORT_NUTRITION_ARCHITECTURE.md` Option C)** — SELECTED

PRIMARY/REINFORCEMENT/REFERENCE roles per topic, per that document's own working table, retained as-is
(not uniformly forced to one book). Phase 5's supplement-chapter finding (complementary, not FLAT-risk)
is treated as supporting evidence for this choice. The unresolved hydration-chapter comparison is
recorded as a remaining validation item, not a blocker to adopting this architecture.

## 3. Energy Balance / Body Composition Unit Structure — **Two-unit minimum** — SELECTED

One foundational/mechanistic unit (`BODY-01` through `BODY-04`, `BODY-06`, largely Act 2/early Act 3);
one applied/decision-making unit (`BODY-05`, `BODY-07`, Act 3 sport/clinical branches). Within the
applied/sport branch, sub-units are used rather than three fully independent top-level sport units. Each
recurrence must add a new cognitive/application layer, not repeat prior content verbatim.

## 4. Bender3 → Human Metabolism 4E Sequencing — **Bender3 first, then HM4** — SELECTED

Under the Option D spine: Bender3 establishes Act 1/early-Act-2 nutrition/metabolism foundations; HM4
carries the deeper regulatory/integrated-metabolism content in Act 2 proper. Not to be reversed.

## 5. Nutrigenomics Research ↔ Clinical Bridge (`RESEARCH-12` ↔ `SPECIAL-01`) — **Build it, as advanced/elective** — SELECTED

The conceptual relationship is retained; positioned as advanced/elective content (consistent with both
topics' existing `CONDITIONAL` Phase 4 tier and `CANDIDATE_EXCLUSIONS.md`'s elective-track framing), not
distorting the main spine.

## 6. Single-Source Dependencies (RESEARCH / LIFE / most of CLIN) — **Accepted where genuinely supported** — SELECTED

No artificial duplication or topic-inflation to avoid single-sourcing. Explicit three-way provenance
distinction required and maintained throughout the architecture: **single-source-but-adequately-
supported** vs. **single-source-and-thin** vs. **genuinely missing from the corpus**.

## 7. Clinical Layer 5 — **General-practice tier = CORE; Layer 6 = ELECTIVE/ADVANCED** — SELECTED (curriculum only)

For the **human curriculum** only: the 14-topic general-practice tier (Layer 5 minus the 10-topic Layer
6 subset — see the Gate 1 decision record §4 for the corrected 24/14 figures) is CORE, teaching general
clinical nutrition reasoning, assessment, intervention concepts, and major disease-nutrition
relationships. Layer 6's 10 SPECIALIZED topics remain ELECTIVE/ADVANCED.

**Explicitly, per direct instruction: this does NOT resolve `DEC-099`/`DEC-100`.** The application's
supported-conditions boundary remains exactly as scope-pending as at Gate 1/2/3. Curriculum core status
and application product scope are two different questions, deliberately kept separate — a curriculum
teaching a topic does not mean the application supports guidance on it.

## 8. Clinical Cross-Cutting Skills (Layer 4) — **Centralized teaching + contextual reinforcement** — SELECTED

Teach once, centrally; reinforce briefly and contextually within disease-specific units where warranted.
Not a full per-chapter repeat of the same framework.

## 9. Research Architecture — **Option D (Hybrid)** — SELECTED

`RESEARCH-01` pulled early as an orienting frame; `RESEARCH-02`–`10` plus `RESEARCH-15` form a
post-foundation block (positioned once MET/ASSESS content exists to connect to, satisfying `RESEARCH-
11`'s dependency structure — though `RESEARCH-11` itself sits in the advanced module below, this
block's positioning is what the "post-foundation" logic actually governs for the general-literacy
topics); `RESEARCH-11/12/13/14` (the SPECIALIZED-tier omics/epigenetics/biobanks/isotopes/animal-model
topics) form an optional advanced/elective module, unless a later explicit decision changes this.

## 10. AS3/ACSM Supplement Redundancy — **Closed as resolved** — SELECTED

Phase 2's "FLAT-risk" concern (item 10, `PHASE_2_HUMAN_REVIEW.md`) is closed: Phase 5 directly inspected
the relevant chapters and found complementary pedagogical roles, not realized redundancy. Recorded here
and in Phase 6's own documentation. `PHASE_2_HUMAN_REVIEW.md` itself is **not** edited — its own text
still shows the concern as originally raised; this record is the authoritative closure, cross-referenced
from Phase 6's architecture document.

## 11. `CANDIDATE_EXCLUSIONS.md` — **Ratified as the curriculum's working core/elective boundary** — SELECTED

Ratified as a working architecture, not irreversible deletion — no topic is removed from the corpus or
topic universe. A Phase 6 topic-level override is permitted only when pedagogically justified, explicitly
documented, traceable to the affected topic, and not silently erasing the Phase 2 classification. The
existing `SPECIAL-04` Phase 4 override (OPTIONAL → `FULL` application-tier, per `KNOWLEDGE_DECISION_
DEPTH_MAP.md` §6) is preserved as an explicit documented exception, not reverted — noting explicitly that
it was justified on *application*-decision grounds (Gate 1 §7.3's allowance), a different justification
type than a *curriculum*-pedagogical override would need, and is carried forward as-is per direct
instruction rather than re-justified on curriculum grounds.

## 12. `LIFE-05` (Adulthood) — **No standalone major unit** — SELECTED

Integrated into the broader LIFE life-stage arc and relevant cross-cutting nutrition topics rather than
given dedicated unit status. Stable topic ID and provenance retained — a sequencing/scoping decision, not
a deletion.

## 13. Remaining Deferred Content — **Preserved as explicitly unresolved**

KM16's dedicated "Doping In Sport" subsection (Ch.23) and COVID-19 material (KM16, 5 chapters) remain
exactly as Phase 5 left them — not manufactured a resolution for either.

## 14. Clinical Application Scope — **`DEC-099`/`DEC-100` NOT reopened**

Explicitly reaffirmed: the curriculum decision that general clinical nutrition literacy is CORE (item 7
above) is separate from, and does not resolve, the application's supported-conditions boundary. `DEC-099`
and `DEC-100` remain exactly as scope-pending as at Gates 1, 2, and 3.

## 15. Governance

This record is the formal Gate 4 decision set. `PROJECT_STATUS.md` and `AI_SESSION_STATE.md` are updated
accordingly (see those files). No Phase 1–5 source-of-truth document is modified to incorporate these
decisions — each remains historical, with its own open items now answered in this Phase 6 decision layer
and in `07_FINAL_CURRICULUM/`'s own artifacts, cross-referenced rather than overwritten.

---

## What Happens Next

Per explicit instruction, Claude proceeds autonomously to build the actual final curriculum architecture
from these 15 decisions — sequencing, unit structure, topic placement, core/elective handling,
reinforcement strategy, sport/research/clinical branches, and dependency coherence — then validates it
against all 213 topic IDs, the Phase 2 prerequisite graph, Phase 2 learning levels, `CANDIDATE_
EXCLUSIONS.md`, the Phase 3 decision model, Phase 4 depth findings, and Phase 5 content/evidence
findings. No stable topic ID is changed. See `AI_SESSION_STATE.md` for the resulting checkpoint.
