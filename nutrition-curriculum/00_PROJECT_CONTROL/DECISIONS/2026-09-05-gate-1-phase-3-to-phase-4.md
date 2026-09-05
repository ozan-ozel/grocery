# Decision Record — Gate 1 (End of Phase 3 → Phase 4)

**Date:** 2026-09-05
**Gate:** Gate 1 — End of Phase 3, per `PROJECT_AI_PROTOCOL.md` §21
**Review request:** `00_PROJECT_CONTROL/CHATGPT_REVIEW_REQUEST.md` (as corrected by this record — see
§4 below)
**Decided by:** Human (relaying ChatGPT/human review)
**Recorded by:** Claude Code, at the human's explicit instruction

---

## 1. Decision on §7.1 — Gate 1 itself (blocking)

**GO.**

Phase 3 (Application Decision Model) is approved to close as-is. The read-only cross-document
consistency audit and its subsequent corrections (documented in `CHATGPT_REVIEW_REQUEST.md` §5) are
accepted as sufficient. No further Phase 3 conceptual rework is requested.

**Effect:**
- Phase 3 status: `COMPLETE` → `CLOSED`.
- Phase 4 (Curriculum ↔ Decision Integration): authorized to begin. **Not started in this session** —
  see §6 below.
- None of the five Phase 3 artifacts (`APP_DECISION_INVENTORY.md`, `APP_DECISION_DEPENDENCY_GRAPH.md`,
  `APP_DECISION_KNOWLEDGE_MAPPING.md`, `APP_DECISION_GAPS.md`, `APP_DECISION_MODEL.md`) were modified by
  this decision or its recording.

## 2. Decision on §7.2 — Clinical scope (`DEC-099`/`DEC-100`)

**C — Deferred.**

The clinical supported-conditions scope decision (`DEC-099`, and its upstream-modification mechanism
`DEC-100`) is **explicitly not resolved** by this Gate. It carries forward into Phase 4 as an unresolved
human decision, per `PROJECT_AI_PROTOCOL.md` §26.

**Effect on Phase 4:** Phase 4 will map knowledge depth for the 8 non-CLIN-scope-dependent domains fully.
The 18 CLIN topics not yet individually mapped to a named decision (9 of the 27 CLIN topics already are —
see `CHATGPT_REVIEW_REQUEST.md` §7.2's corrected note) remain scope-pending in Phase 4's own output, to
be revisited once `DEC-099` is eventually decided. No CLIN topic's mapping status, decision dependency,
or knowledge-mapping strength is to be altered by Phase 4 as a workaround for this deferral.

**Must not be silently resolved:** `DEC-099`, `DEC-100`, or any of the 18 scope-pending CLIN topics'
eventual disposition, by Phase 4 or any later phase, without a future explicit human/review-gate decision.

## 3. Decision on §7.3 — `CANDIDATE_EXCLUSIONS.md` adoption posture

**A, with an explicit override allowance** — a variant of the review request's own Option A, as
specified by the human:

`CANDIDATE_EXCLUSIONS.md`'s (Phase 2) proposed REFERENCE-ONLY / OPTIONAL / ELECTIVE /
OUTSIDE-CORE-PATHWAY designations are adopted as **Phase 4's working default** — not re-derived from
scratch per topic — **while Phase 4 remains free to override any individual topic's classification when
its own knowledge-depth analysis provides a justified, documented reason to do so.**

**Effect on Phase 4:** `CANDIDATE_EXCLUSIONS.md` is a **starting default, not an immutable decision**.
Phase 4 must:
- treat its ~30 proposed designations as the baseline unless a specific, stated reason (arising from
  Phase 4's own decision-knowledge-depth analysis) justifies deviating for a given topic;
- record any such override explicitly (which topic, which designation changed, and why) rather than
  silently drifting from the default;
- not treat this adoption as promoting `CANDIDATE_EXCLUSIONS.md`'s proposals from "proposed roles" (Phase
  2 Human Review item 11's own framing) to a formally closed human decision — the underlying Phase 1/2
  question of core-vs-elective status for these topics remains open in the sense that a future phase or
  human review could still revisit it; Phase 4 is only authorized to *use* the file as a working default,
  not to formally ratify it as final.

## 4. Validation correction performed before recording this decision

Per explicit instruction, before recording Gate 1 as approved, the numerical claims in
`CHATGPT_REVIEW_REQUEST.md` §7.2 were verified directly against `04_PHASE_2_CURRICULUM_ARCHITECTURE/
CLINICAL_NUTRITION_ARCHITECTURE.md` (the authoritative Phase 2 source for the Layer 5/Layer 6 clinical
split) and against `03_PHASE_1_CURRICULUM_ANALYSIS/MASTER_TOPIC_UNIVERSE.md` (the authoritative topic
universe).

**Finding:** the review request's Option A stated "23 Layer-5 topics" for the general-practice-only
tier. This was wrong on inspection, and traced to a **pre-existing arithmetic-labeling bug already
present in `CLINICAL_NUTRITION_ARCHITECTURE.md` itself**, not introduced by the review request:

- `CLINICAL_NUTRITION_ARCHITECTURE.md` states Layer 5 = "(23 topics)" and its connection diagram splits
  this as "13 general practice" + "10 SPECIALIZED" = 23.
- Directly enumerating that same document's own stated topic list — "`CLIN-03` through `CLIN-25` and
  `CLIN-27`" — gives `CLIN-03`...`CLIN-25` (23 IDs) **plus** `CLIN-27` (1 more ID, since `CLIN-26` is
  explicitly Layer 4, not Layer 5) = **24** topics, not 23.
- Cross-checked against the confirmed total: Layer 3 (1: `CLIN-01`) + Layer 4 (2: `CLIN-02`, `CLIN-26`) +
  Layer 5 (24) = **27**, which matches `CLIN-01`–`CLIN-27` verified directly in `MASTER_TOPIC_UNIVERSE.md`
  (27 sequential CLIN IDs, no gaps, confirmed by direct grep). With Layer 5 stated as 23 instead, the
  three-layer sum would total only 26 — one short of the confirmed 27.
- Therefore the correct figures are: **Layer 5 = 24 topics** (not 23), **general-practice-only tier
  (Layer 5 minus the Layer-6 subset) = 14 topics** (not 13). The Layer-6 SPECIALIZED subset itself (10
  topics: `CLIN-15, 16, 17, 18, 19, 21, 22, 23, 25, 27`) was independently confirmed correct — no error
  there.

**Corrective action taken:**
- `CHATGPT_REVIEW_REQUEST.md` §7.2 was corrected in place: Option A now reads "14 Layer-5 topics" (with
  the derivation spelled out), and a numeric-consistency note was added documenting this finding,
  including that a separate figure in the same section — "18 CLIN topics scope-pending" — is an
  independent Phase 3 decision-mapping classification (9 of 27 CLIN topics concretely mapped to a named
  decision, 18 not, because `DEC-099` leaves the boundary open) and was **never meant to arithmetically
  reconcile against the 23/10 (or 24/10) Layer 5/6 split** — the two are different questions that happen
  to share overlapping topics. That figure required no numeric correction, only the clarifying note. Of
  the 18, `CLIN-02` is confirmed outside any plausible application scope (not "pending"), leaving 17
  genuinely scope-pending.
- **`CLINICAL_NUTRITION_ARCHITECTURE.md` (the Phase 2 source document) was NOT edited in this pass**, per
  explicit instruction not to alter Phase 2 or Phase 3 architecture merely to make numbers fit. No topic
  was moved between Layer 5 and Layer 6, no scope was changed, and no classification in
  `CANDIDATE_EXCLUSIONS.md` was touched (it already independently states the correct 10-topic Layer-6
  list). Only a review-request-level presentation was corrected to reflect the true count.
- **Flagged, not resolved:** `CLINICAL_NUTRITION_ARCHITECTURE.md`'s own prose ("23 topics" / "13 general
  practice") still contains this labeling bug as of this decision record. Fixing it is a small,
  self-contained bookkeeping correction (same category as the Phase 3 dependency-edge-count fix in
  `CHATGPT_REVIEW_REQUEST.md` §5.2) that was **not authorized as part of this task** and has not been
  performed. It does not block Phase 4 — Phase 4's own knowledge-depth mapping work operates at the
  individual-topic level (per-`CLIN-##` ID), not by citing the Layer 5/6 summary counts — but it should be
  corrected in a small, explicitly-authorized future pass so the source document doesn't keep
  propagating a stale count into anything that cites it later.

## 5. Explicitly not decided by this record

Per instruction, no additional architectural decision was made beyond §7.1–§7.3 above. In particular,
this record does **not**:
- resolve `DEC-099` or `DEC-100`;
- resolve `SPORT-08`, `SPORT-11`, the curriculum spine (Phase 2 Options A–D), the Practical Translation
  domain's final status, `DEC-039`/`DEC-085` granularity, `DEC-092`/`DEC-100` bridge-decomposition,
  `LIFE-05`, `LIP-04`/`MET-07`/`RESEARCH-10` mapping promotions, `ASSESS-02`/`ASSESS-06` future-feature
  framing, or `ASSESS-01.03` de-facto-topic status — all remain exactly as unresolved as before this Gate;
- correct `CLINICAL_NUTRITION_ARCHITECTURE.md`'s own Layer 5/general-practice count labels (flagged in §4
  above, left for a future explicitly-authorized pass);
- formally ratify `CANDIDATE_EXCLUSIONS.md` as a closed decision — it remains a working default per §3.

## 6. What happens next

Per explicit instruction, **substantive Phase 4 work is not started in this session.** This record,
together with the updates to `AI_SESSION_STATE.md` and `PROJECT_STATUS.md` made alongside it, only
formally closes Phase 3 and authorizes Phase 4 to begin in a future session/task. See
`AI_SESSION_STATE.md`'s "Exact Next Action" for the concrete Phase 4 starting point.
