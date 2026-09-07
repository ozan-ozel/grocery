# Decision Record — Gate 5 (End of Phase 7, Decision Engine Specification)

**Date:** 2026-09-07
**Gate:** Gate 5 — End of Phase 7, per `PROJECT_AI_PROTOCOL.md` §21 (the final major scientific
decision-engine checkpoint)
**Review request:** `00_PROJECT_CONTROL/CHATGPT_REVIEW_REQUEST.md` (Gate 5 version, now superseded by
this record)
**Decided by:** Human (relaying ChatGPT/human review)
**Recorded by:** Claude Code, at the human's explicit instruction

---

## 1. Decision — Gate 5 itself

**GO.**

Phase 7 is approved for closure. Phase 8 (Practical Translation) is authorized to begin.

All six compiled judgment calls were answered. **`DEC-107`'s autonomous ratification was explicitly
accepted** (see §8 below) — the one item Phase 7's self-audit flagged as most open to objection.

---

## 2. The Six Decisions

### 2.1 `DEC-021` / `DEC-110` — Model vs. Observation Weighting

**Option C + D.**

Once longitudinal data satisfies the existing quantity (`DEC-081`) and quality (`DEC-082`) requirements,
**the observed individual response becomes the dominant evidence** for individualized estimation. The
population/model estimate remains the **initial prior/reference**, not a permanent co-equal input.

A sufficiently large deviation between the individualized and population estimates **must not
automatically be treated as a genuine metabolic outlier.** It triggers an uncertainty/data-quality
safeguard, which may require checking: intake-logging quality, measurement quality,
adherence/completeness, unusual short-term physiological effects, and other confounders.

Approved conceptual hierarchy:

```
population model            → initial estimate
adequate longitudinal data  → dominant individual evidence
large model/obs divergence  → uncertainty/data-quality safeguard
```

**The existence of a cap/safety rail is approved; its numerical value is deferred to Phase 8.** No
arbitrary blending formula is to be invented, and no numerical deviation cap is to be set at Gate 5.

### 2.2 `DEC-039` / `DEC-085` — Macro Adjustment

**Option A.**

Macro targets **do not form an independent feedback-control loop in v1.** Macro allocation changes
primarily as a downstream consequence of an energy-prescription change.

Explicitly barred: independent automatic macro adjustment based solely on satiety, adherence, training
load, subjective preference, or other observed signals — **unless those signals first cause an authorized
energy-prescription reassessment.**

Existing protein-floor and dietary-pattern constraints (`DEC-031`, `DEC-040`) are preserved.

Approved architecture: `observation → energy adjustment → macro recalculation` — one controller, not two
competing ones.

### 2.3 `DEC-044` — Micronutrient Supplementation Dosing

**Option A.**

**The application does not provide autonomous micronutrient supplementation dosing in v1.**

```
identified gap, dietary correction plausible      → food/dietary correction
identified gap, dietary correction insufficient,
  deficiency suspected/confirmed, or otherwise
  clinically consequential                        → professional evaluation
```

Explicitly barred: automatic RDA-level repletion, UL-level dosing, ingredient-specific therapeutic
dosing, and supplement dosing derived from internal defaults.

The application **may explain that supplementation can be relevant**; dose-level recommendations are
outside the autonomous v1 decision engine. Any future supplement-dosing capability requires a separate
evidence/safety review.

### 2.4 Domain C (`DEC-012`–`016`) — Safety / Scope / Escalation

**Conservative scope posture: broad exclusion + frequent escalation.**

The application prefers escalation over autonomous nutritional prescription whenever available
information indicates a potentially clinically significant condition, symptom pattern, medication
interaction, physiological state, or other circumstance for which safe automated guidance cannot be
established confidently.

**The detailed numerical/clinical exclusion criteria are NOT set at Gate 5.** They are deferred to
Phase 8 and must be derived from: (1) the application's explicitly defined clinical scope,
(2) authoritative clinical guidance, (3) the existing decision model, (4) the project's safety/escalation
requirements.

**`DEC-099`/`DEC-100` remain unresolved and untouched.** This decision approves a posture and explicitly
does not resolve, narrow, or imply resolution of the clinical-scope decision — notwithstanding the
`DEC-012` ⇄ `DEC-099` bidirectional coupling surfaced in the review request.

### 2.5 `DEC-084` / `DEC-090` — Adjustment and Circuit Breaker

**Option C.**

The adaptive loop **must** have a circuit breaker. Escalation is triggered by **either**: (1) a repeated
sequence of unsuccessful adjustment cycles, **or** (2) excessive cumulative deviation from the relevant
starting estimate/prescription — **whichever authorized safety condition is reached first.**

`DEC-084` **reuses `DEC-028`'s already-established reassessment trigger** rather than introducing a
second competing threshold.

```
observe → interpret → adjust → observe → interpret → adjust
repeated unsuccessful adjustment OR excessive cumulative deviation → escalation
```

**The loop must never be allowed to adjust indefinitely.** The numerical cycle count and
cumulative-deviation threshold are **deferred to Phase 8.**

### 2.6 `DEC-048` — Heat / Altitude Fluid Adjustment

**Option B.**

No heat/altitude multiplier is invented or adopted at Gate 5. Current specification:
`heat/altitude exposure → increased fluid requirement flag`, with **no automatic quantitative
multiplier authorized yet.**

Phase 8 conducts a targeted evidence search for a citable quantitative approach using authoritative
exercise/sports-medicine sources. Any final multiplier must be evidence-backed and **explicitly scoped to
the conditions for which it applies.**

---

## 3. `DEC-107` — External Standards (Ratification Accepted)

Phase 7's autonomous ratification of `DEC-107` is **explicitly accepted.** The project aligns numeric
scientific defaults with named authoritative external standards rather than inventing independent
internal scientific defaults.

Provenance chain: `authoritative source → project specification → application decision rule`

**This is a governance decision, not permission to blindly copy values.** Phase 8 includes
source-provenance standardization/re-verification where needed, particularly for the numeric consensus
ranges Phase 7's own self-audit identified as not yet uniformly page-verified against the project corpus.
This does not block Phase 7 closure.

---

## 4. Phase 8 Work Created by This Gate

Carried forward explicitly as **required Phase 8 evidence/safety work**:

1. The numerical model/observation deviation cap for `DEC-021`/`DEC-110`, **if retained** after evidence
   review.
2. The numerical circuit-breaker parameters for `DEC-090`.
3. The detailed Domain C escalation/exclusion criteria, **after clinical scope is defined.**
4. A researched and validated quantitative heat/altitude fluid approach for `DEC-048`.
5. Standardized and verified provenance for the numeric consensus ranges not uniformly page-verified
   during Phase 7.
6. Preservation of `DEC-107`'s external-standard alignment principle.

**Explicitly NOT authorized in Phase 8** — do not introduce: unsupported medical thresholds; arbitrary
supplement doses; arbitrary clinical exclusion criteria; arbitrary circuit-breaker values; unsupported
heat multipliers; independent macro-control logic; hidden formulas; undocumented safety assumptions.

---

## 5. Standing Constraints Reaffirmed

- `DEC-099`/`DEC-100` remain unresolved and untouched.
- No Phase 1–6 artifact is modified unless a later phase explicitly identifies a factual defect requiring
  correction under the existing protocol.
- All 213 stable topic IDs and all 112 `DEC` IDs preserved.
- If a genuinely new consequential architectural/scientific decision appears during Phase 8, **create a
  new review gate rather than silently deciding it.**
- Do not stop for routine execution questions.

---

## 6. Effect

Phase 7: **COMPLETE.** Phase 8 (Practical Translation, `PROJECT_AI_PROTOCOL.md` §16): **authorized to
begin**, after Phase 7 closure validation completes.

A notable structural consequence: Phase 8's own subject matter (Target → Meal Structure → Food Selection
→ Portion → Recipe → Preparation → Shopping → Execution) is **precisely the territory of the 10 decisions
Phase 7 classified `BLOCKED` under the Practical Translation Gap** (Domains L and M, `GAP-A`/`GAP-D`).
Phase 8 is where that gap is confronted directly rather than deferred again — while `DEC-065`'s
pantry-integration question and Domain Q's four clinical-scope-dependent decisions remain blocked for
their own, different reasons.
