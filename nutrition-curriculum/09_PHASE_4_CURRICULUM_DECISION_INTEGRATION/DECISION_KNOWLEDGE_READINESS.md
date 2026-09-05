# Decision Knowledge Readiness — Phase 4

**Phase:** Phase 4 — Curriculum ↔ Decision Integration (`PROJECT_AI_PROTOCOL.md` §12)
**Companion to:** `KNOWLEDGE_DECISION_DEPTH_MAP.md` (topic-first: for each of 213 topics, how deeply must
the application represent it). This document is the reverse direction: **for each of the 112 decisions,
is the knowledge it needs actually available at build time, and if not, why not** — completing §12's
explicit bidirectional framing ("connect 213 Knowledge Topics ↕ 112 Application Decisions").
**Built on (read-only, not modified):** `APP_DECISION_KNOWLEDGE_MAPPING.md` §6 (Complete Decision
Coverage Table) and §5; `KNOWLEDGE_DECISION_DEPTH_MAP.md` §5 (this project's own Phase 4 depth tiers);
`APP_DECISION_GAPS.md` §5/§9/§21 (gap taxonomy, reused not re-derived).
**Gate 1 effects applied here:** `DEC-099`/`DEC-100` are not resolved; their own gating reason (an
unresolved decision, not a missing topic) is stated as such, not invented here.

---

## 1. Method

**Decision Knowledge Readiness** — one of four states per decision, derived mechanically from data
already established in Phase 3 and in this project's own prior Phase 4 artifact. No new judgment is
introduced; every classification below traces to an explicit source.

| State | Trigger |
|---|---|
| **READY** | Every topic `APP_DECISION_KNOWLEDGE_MAPPING.md` §6 cites for this decision (`Core`, `Supporting`, `Contextual`, or `Reference` column) is a resolved topic — not `SCOPE-PENDING`, not `CONDITIONAL` — **and** Phase 3's own §6 "Mapping Confidence" / "Potential Missing Knowledge" columns carry no bolded categorical flag (`**NEEDS CONTENT REVIEW**`, `**MAPPING UNCERTAIN**`, `**APPLICATION TRANSLATION GAP**`). |
| **GATED — GAP** | Phase 3's own §6 table already carries one of those three bolded categorical flags for this decision. Reused verbatim from Phase 3 — not reclassified, not newly discovered. |
| **GATED — CONDITIONAL** | At least one cited topic is tiered `CONDITIONAL` in `KNOWLEDGE_DECISION_DEPTH_MAP.md` §5 (an elective/future-feature/evidence-frontier topic) and the decision is not already `GATED — GAP`. |
| **GATED — UNRESOLVED DECISION** | The decision's own content — not a missing or gated topic — depends on a still-open human/architectural decision (today, only `DEC-099`/`DEC-100`, per the Gate 1 deferral). Distinct from the other two `GATED` reasons: the *topics* it cites (`CLIN-01/07/10/12`, `CLIN-24`, `MET-10`) are all resolved and `FULL`/`WORKING`-tiered; it is the decision's *own scope* that is unresolved. |

**Deliberately not folded into readiness:** Phase 3's own `Current Evidence Dependency` column
(`current-evidence-primary` / `existing-corpus + current evidence`) is a different axis — whether
*contemporary* evidence matters, not whether the *topic* exists and is resolved. Reused as-is (§4) rather
than merged into a readiness verdict, per `PROJECT_AI_PROTOCOL.md` §5's Established/Emerging-Evidence
distinction. A decision can be `READY` and still carry a current-evidence caveat (e.g. `DEC-027`).

**Deliberately not gated on:** a topic's own aggregate depth tier being `OVERVIEW`/`REFERENCE-ONLY` rather
than `FULL`/`WORKING`. A topic's Phase 4 tier (in `KNOWLEDGE_DECISION_DEPTH_MAP.md`) reflects its
*aggregate* role across all decisions that use it; a specific decision can still cite that same topic at
`CORE` strength for its own purposes (see §5's `NUT-01`/`DEC-002` note) without the decision being
"blocked" — the topic exists and is documented either way. Readiness is about *availability*, not about
which depth tier a topic was assigned.

---

## 2. Readiness Summary

**94 of 112 decisions: READY.** **18 of 112: GATED**, for one of three distinct reasons:

| Reason | Count | Decisions |
|---|---|---|
| GATED — GAP (Phase 3's own bolded flag, reused verbatim) | 15 | `DEC-039, 058, 065, 066, 067, 068, 069, 070, 071, 072, 073, 074, 075, 085, 111` |
| GATED — GAP *and* CONDITIONAL (both reasons apply) | 1 | `DEC-098` (Phase 3 flags `MAPPING UNCERTAIN`; also cites `SPORT-11`, `CONDITIONAL`-tiered) |
| GATED — UNRESOLVED DECISION (Gate 1 clinical-scope deferral) | 2 | `DEC-099, DEC-100` |
| **Total gated** | **18** | 15 + 1 + 2 = 18 |

15 + 1 + 2 = 18; 112 − 18 = **94 READY**. No decision is gated for more than the reasons listed (checked
against every one of the three trigger conditions in §1, not assumed).

**Cross-check against `APP_DECISION_GAPS.md`'s own confirmed-`GAP-A` finding:** of the 15 "GATED — GAP"
decisions, only `DEC-067, 068, 069` are a true `GAP-A` (no knowledge representation at all — recipe/
preparation science, confirmed absent from all 7 books). The other 12 are different, already-classified
gap types (`GAP-C`/`GAP-D`/mapping-uncertain) reused from `APP_DECISION_GAPS.md` — not restated as
`GAP-A`, per `PROJECT_AI_PROTOCOL.md` §24's gap-taxonomy discipline (a gap category must never be
silently promoted to a more severe one, or the reverse).

---

## 3. The 18 Gated Decisions, in Full

### 3.1 GATED — GAP (15 decisions, Phase 3's own flag reused verbatim)

| DEC | Domain | Cited Topics | Phase 3 Flag | What's Actually Missing |
|---|---|---|---|---|
| DEC-039 | F (Macronutrients) | PRO-04, CHO-04, LIP-05 (Supporting) | `NEEDS CONTENT REVIEW` | The macro-*adjustment-trigger logic itself* — the underlying requirement science (all `FULL`-tiered) is fine; no topic covers dynamic re-adjustment reasoning |
| DEC-058 | J (Meal Structure/Timing) | BODY-01 (appetite subsection) | `MAPPING UNCERTAIN` | Dedicated appetite/satiety-regulation content is a thin subsection of `BODY-01`, not its own topic |
| DEC-065 | L (Meal Planning/Prep) | — (no topic) | `APPLICATION TRANSLATION GAP` | Pantry/grocery-app product-integration logic — no curriculum counterpart is possible |
| DEC-066 | L | NUT-03 | `MAPPING UNCERTAIN` | `NUT-03` stops at general eating-pattern guidance, well short of actual meal construction |
| DEC-067 | L | — (no topic) | `APPLICATION TRANSLATION GAP` | **Confirmed `GAP-A`** — recipe/preparation science, absent from all 7 books |
| DEC-068 | L | — (no topic) | `APPLICATION TRANSLATION GAP` | **Confirmed `GAP-A`** — same |
| DEC-069 | L | — (no topic) | `APPLICATION TRANSLATION GAP` | **Confirmed `GAP-A`** — same |
| DEC-070 | L | NUT-03 (Contextual) | `APPLICATION TRANSLATION GAP` (partial) | Deviation-handling logic is mostly application-level, not curriculum content |
| DEC-071 | M (Shopping) | — (no topic) | `APPLICATION TRANSLATION GAP` | Shopping-list consolidation logistics — no topic anywhere |
| DEC-072 | M | — (no topic) | `APPLICATION TRANSLATION GAP` | Pantry reconciliation — same gap |
| DEC-073 | M | PUBHEALTH-04 (Contextual) | `APPLICATION TRANSLATION GAP` (partial) | Budget-constrained shopping beyond `PUBHEALTH-04`'s general cost/access framing |
| DEC-074 | M | PUBHEALTH-05 (Contextual) | `APPLICATION TRANSLATION GAP` (partial) | Availability-constrained substitution logistics |
| DEC-075 | M | — (no topic) | `APPLICATION TRANSLATION GAP` | Pure logistics optimization, no topic |
| DEC-085 | O (Feedback/Adaptation) | PRO-04, CHO-04, LIP-05 (Supporting) | `NEEDS CONTENT REVIEW` | Same adjustment-trigger-logic gap as `DEC-039`, longitudinal-reapplication case |
| DEC-111 | T (Evidence/Uncertainty) | RESEARCH-15 / RESEARCH-03 (Contextual) | `MAPPING UNCERTAIN` | `RESEARCH-15` is framed around public-health/policy translation, not internal app governance |

### 3.2 GATED — GAP and CONDITIONAL (1 decision)

| DEC | Domain | Cited Topics | Phase 3 Flag | Phase 4 Gating Topic | Note |
|---|---|---|---|---|---|
| DEC-098 | P (Sport) | SPORT-09, SPORT-10 (Core); SPORT-11 (Contextual) | `MAPPING UNCERTAIN` (cycle-phase-specific depth unconfirmed) | `SPORT-11` — `CONDITIONAL` (current-evidence-primary, gated on a currency check per Phase 1 item 8) | Doubly gated: the core safety knowledge (`SPORT-10`) is `FULL` and available; only the `SPORT-11` refinement is both uncertain in depth and evidence-frontier-gated |

### 3.3 GATED — UNRESOLVED DECISION (2 decisions — Gate 1 deferral, not newly gated here)

| DEC | Domain | Cited Topics (all resolved, `FULL`/`WORKING`) | Why Gated |
|---|---|---|---|
| DEC-099 | Q (Clinical) | CLIN-01 (Core, `FULL`); CLIN-07/10/12 (Supporting, `FULL`) | Not a missing- or pending-topic problem — every cited topic is resolved. The decision's **own content** (the supported-conditions boundary) is explicitly deferred per Gate 1 §7.2 (Option C). Not re-resolved here. |
| DEC-100 | Q | CLIN-07/10/12 (Core, `FULL`); CLIN-24, MET-10 (Supporting, `WORKING`/`OVERVIEW`) | Same — depends on `DEC-099`'s boundary, not on any topic's availability. Not re-resolved here. |

**Note on the 18 `SCOPE-PENDING` CLIN topics:** none of them is cited by *any* of the 112 decisions today
(confirmed by scanning every §6 row — the pending topics simply don't appear in any Core/Supporting/
Contextual/Reference cell). They would only become relevant to a *future*, not-yet-invented decision
extending `DEC-099`'s supported-conditions list — they do not gate any of today's 112 decisions. This is
worth stating explicitly because it clarifies that `SCOPE-PENDING` (a topic-level status) and `GATED —
UNRESOLVED DECISION` (`DEC-099`/`100`'s own status) are related but not the same finding.

---

## 4. Current-Evidence Caveats on Otherwise-`READY` Decisions (reused, not re-derived)

Reusing `APP_DECISION_KNOWLEDGE_MAPPING.md` §15 verbatim — these decisions are `READY` (their topics
exist and are resolved) but carry a currency caveat orthogonal to readiness:

**Current-evidence-primary:** `DEC-027` (target rate/direction — conceptual grounding exists, a
defensible current *rate* does not).

**Existing-corpus + current evidence:** `DEC-003, 004, 012, 013, 016, 022, 030, 044, 095, 097, 107`
(clinical-scope-adjacent items among these are `DEC-012`, itself `READY` per §3 above — its own gating
reason, if any, is the scope-boundary question already carried in §3.3's `DEC-099` entry, not a separate
readiness failure for `DEC-012` itself).

---

## 5. Incidental Finding (flagged, not fixed, does not affect §2's counts)

While cross-referencing `APP_DECISION_KNOWLEDGE_MAPPING.md`'s §5 (per-decision detail) against its own
§8a (per-topic rollup) to build this document, one additional minor internal inconsistency was noticed —
independently verified, same low-stakes bookkeeping category as the `NUT-04` subtopic omission found in
the prior Phase 4 task:

- §5's `DEC-002` row states `NUT-01`'s **Strength = CORE** (`"NUT-01 | CORE | CONTEXTUAL | Framing of
  nutritional science as a discipline..."`).
- §8a's `NUT-01` row states **"Strength Seen" = CONTEXTUAL** for the same relationship (`"NUT-01 | NUT |
  DEC-002 | CONTEXTUAL | CONTEXTUAL | SUPPORTING/CROSS-CUTTING | Thin single-decision use"`) — since §8a
  is stated to be "derived directly from §5" (§6's own framing), these two cells should agree and do not.

**Verified, not acted on:** this affects only one topic's single-decision citation. It does **not**
change `DEC-002`'s readiness (§1's rule is topic-existence-based, not strength-based — `NUT-01` exists
and is resolved either way) and does not change `NUT-01`'s Phase 4 depth tier in `KNOWLEDGE_DECISION_
DEPTH_MAP.md` (that tier was derived from §8a's Application Centrality band, which already accounts for
`NUT-01`'s thin, single-decision utilization regardless of which strength value is the typo). **Not
investigated further as a systematic audit** — per the standing instruction not to reopen Phase 1–3
unnecessarily, this one incidentally-noticed instance is reported, not chased into a full re-audit of all
112 §5/§8a cross-references. Recorded in `AI_SESSION_STATE.md` alongside the `NUT-04` finding for a
future, separately-authorized bookkeeping pass.

---

## 6. Validation

- **112/112 decisions classified** — every `DEC-001`–`DEC-112` row in `APP_DECISION_KNOWLEDGE_MAPPING.
  md` §6 was checked against both trigger sets (§1); counts in §2 sum correctly (15 + 1 + 2 = 18 gated;
  112 − 18 = 94 ready).
- **Every `GATED — GAP` classification traces to an exact bolded flag already present in Phase 3's own
  §6 table** — none was newly assigned; grepped directly (`**NEEDS CONTENT REVIEW**`, `**MAPPING
  UNCERTAIN**`, `**APPLICATION TRANSLATION GAP**`) rather than judged qualitatively, so no borderline
  case (e.g. `DEC-037`'s `LOW`-confidence-but-not-bold-flagged fiber caveat, or `DEC-003`'s "recomposition
  physiology thin" note) was pulled in as a gate.
- **Every `GATED — CONDITIONAL` and `SCOPE-PENDING` check was a full scan of all 112 §6 rows** for the
  seven `CONDITIONAL`-tiered topics and the 18 `SCOPE-PENDING`-tiered topics — confirmed only `SPORT-11`
  (`DEC-098`) appears among the `CONDITIONAL` set, and none of the 18 `SCOPE-PENDING` CLIN topics appears
  in any of the 112 rows at all.
- **`DEC-099`/`DEC-100` were not resolved** — §3.3 states the mechanical fact that their own content
  (not a missing topic) is what's gated, which is the same finding already recorded in the Gate 1
  decision record, not a new resolution.
- **No Phase 1/2/3 document was modified.** The one incidental finding (§5) was verified and reported,
  not corrected — consistent with how the `NUT-04` finding was handled in the prior task.
- **No formula, threshold, or algorithm was introduced** — "readiness" is a four-way qualitative
  classification, not a scoring function.

---

## 7. Status

Both of this session's Phase 4 artifacts (`KNOWLEDGE_DECISION_DEPTH_MAP.md` and this document) together
answer `PROJECT_AI_PROTOCOL.md` §12's seven deliverables from both directions — topic→depth and
decision→readiness. Phase 4's self-audit and completion determination are the remaining step; see
`AI_SESSION_STATE.md` for the exact next action.
