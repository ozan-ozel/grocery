# Decision Record — Gate 6: Phase 8 Practical Translation, Culinary Corpus Extension

**Date:** 2026-09-07
**Gate:** Gate 6 — End of Phase 8 (`PROJECT_AI_PROTOCOL.md` §21: practical translation, meal
construction, shopping, preparation, usability assumptions)
**Decision authority:** Human / ChatGPT reviewer
**Requested by:** `CHATGPT_REVIEW_REQUEST.md` (Gate 6 request, 2026-09-07)
**Artifact under review:** `11_PHASE_8_PRACTICAL_TRANSLATION/PRACTICAL_TRANSLATION_ANALYSIS.md`
**Outcome:** **GO — with a controlled corpus extension.**

---

## 1. The Decision

> **Admit one bounded eighth culinary/food-preparation source. Do not permanently exclude recipe
> construction, and do not use modification-only as the primary culinary architecture.**

**Option A selected.** Options B and C were explicitly rejected as primary architecture.

This is the **largest structural change since Phase 1** and the first time the source corpus has been
extended. It is authorized as a *bounded* extension, not as permission to expand the corpus freely.

---

## 2. Rationale Recorded by the Reviewer

The application's intended decision chain is not `target → nutrient → food`. It is:

```
target → meal structure → food selection → portion → recipe → preparation → shopping → execution
```

Recipe construction and preparation are therefore **sufficiently central to the intended application
that permanently excluding them from v1 would remove a meaningful part of the practical execution
layer.**

---

## 3. What the Eighth Source Must Be

Not a generic recipe collection. A substantive culinary / food-preparation / food-science reference
capable of supporting, where applicable, the following **eleven capabilities**:

1. recipe construction/formulation
2. ingredient functionality
3. cooking methods
4. preparation constraints
5. substitutions
6. scaling
7. batch preparation
8. storage
9. food-safety considerations relevant to preparation/storage
10. nutrient retention / nutrient fate during preparation
11. texture/quality consequences of substitutions or preparation choices

**Binding constraint:** the source **must complement the existing nutrition corpus rather than simply
duplicate it.**

---

## 4. Scope Boundary — What the Extension Does NOT Authorize

The reviewer was explicit. The extension does **not** authorize:

- redoing Phases 1–8 globally
- silently regenerating the 213-topic universe
- renumbering any existing stable ID
- reinterpreting the seven-book corpus as having been incomplete *in every domain*

**The historical baseline is preserved as-is:** 7 core nutrition/science books, 213 topics, 112
application decisions. The eighth source is recorded **separately and explicitly** as a controlled
practical-translation corpus extension.

Only decisions that **genuinely require** culinary/food-preparation knowledge receive new mapping.
Initially: `DEC-067`, `DEC-068`, `DEC-069`, plus any directly dependent practical-translation
relationship that becomes necessary **after** source inspection.

> **Do not manufacture new decisions merely to justify the new source.**

### 4.1 Scope creep explicitly forbidden (§10 of the decision)

The eighth source does not automatically admit: a culinary arts curriculum; professional-chef
techniques; restaurant operations; unrestricted recipe generation; unrestricted food-safety claims;
medical dietary treatment recipes; arbitrary food-processing recommendations.

**If source inspection reveals a potentially consequential scope decision, stop and create another
review gate rather than silently deciding it.**

---

## 5. Why Options B and C Were Rejected

**Option B (scope recipe construction out of v1) — REJECTED.** Recipe construction and preparation are
part of the intended practical execution layer. They may carry explicit safety and evidence boundaries,
but they are not permanently excluded merely because the original nutrition corpus lacks them.

**Option C (modification-only) — REJECTED as primary architecture.** Phase 8's §4.4 finding is
"valid and useful," but it does not establish that the seven-book corpus contains a sufficiently
*general* recipe-modification knowledge system. The governing statement:

> **example-level modification knowledge ≠ general recipe-construction knowledge.**

The corpus-supported examples are **preserved as evidence-backed examples** — gluten-free flour
substitution, flaxseed-for-egg substitution, nutrient-preserving substitutions, home ORS formulations —
but must not be generalized into a broad culinary engine without source support. The eighth source
exists precisely to establish that broader layer.

---

## 6. Gap Reclassification Authorized

| Chain link | Decisions | From | To |
|---|---|---|---|
| Portion | `DEC-060`, `DEC-062` | `GAP-C` | **`GAP-C` — unchanged.** KM16 exchange-list methodology remains valid evidence. |
| Recipe / Preparation | `DEC-067`–`069` | `GAP-A` | **Controlled corpus-extension work** — *once the eighth source is selected and inspected.* |
| Shopping / Pantry / Deviation | `DEC-065`, `066`, `070`–`075` | `GAP-D` | **Phase 9 implementation/translation carry-forward** — no longer labelled unresolved *scientific* knowledge gaps. |

**Explicit caution attached to the recipe/preparation row:** *"Do not pretend the knowledge existed in
the original seven-book corpus."* The reclassification is contingent on the extension actually
happening, not on the decision to permit it.

---

## 7. `DEC-048` — Ratified

Gate 5 authorized the search *"if one is justified."* Phase 8 demonstrated a population heat multiplier
is **not** justified. The correction is **ratified** (a ratification of `DEC-048`, **not** a reopening
of Gate 5):

- **Heat:** no population multiplier. Use individualized/measured sweat-rate information where the
  application has sufficient data. The specification must reflect the large inter-individual sweat-rate
  variability and the resulting inadequacy of a single population multiplier.
- **Altitude:** retain the evidence-backed additive approach — **approximately +1–1.5 L/day** where the
  cited high-altitude conditions and source guidance apply. **Do not generalize beyond the
  population/context supported by its source. Record the provenance explicitly.**

---

## 8. Provenance Corrections — Authorized to Propagate into Phase 7

Authorization is **limited to clarification/correction of existing specifications**. These are
evidence/provenance corrections, **not new human judgment calls.**

- **Protein.** The corpus supports the 1.6–2.2 g/kg band as a *permissive specification range*, but SN4
  places the hypertrophy plateau around 1.6–1.7 g/kg. **Do not describe the upper half of 1.6–2.2 g/kg
  as evidence of additional hypertrophy benefit.** Correct the wording if it currently implies that.
- **Endurance carbohydrate.** Distinguish the corpus's endurance guidance from the existing 6 g/kg
  floor. **Do not silently reinterpret the difference.** Record provenance and context.
- **Ultra carbohydrate.** **Do not describe 8–12 g/kg as a routine universal daily requirement.** The
  relevant corpus context is a **pre-event carbohydrate-loading protocol over ~2–3 days before
  competition.** Correct wording/category if the specification conflates routine daily fueling with
  pre-event loading.

---

## 9. Preserved Deferrals — Unchanged

**`DEC-099` and `DEC-100` are NOT reopened.** Domain C remains constrained by the unresolved
clinical-scope decision.

> *"Do not use the culinary-source decision as an opportunity to revisit clinical scope."*

---

## 10. Required Phase 8 Work Before Closure (the reviewer's twelve-step sequence)

1. Define selection criteria for the eighth culinary source.
2. Select the source using those criteria.
3. Record the addition explicitly as a controlled corpus extension.
4. Inspect the source sufficiently to establish its actual supported culinary knowledge.
5. Map only the necessary culinary knowledge to `DEC-067`–`069` and directly dependent decisions.
6. Distinguish: recipe construction · recipe modification · preparation · batch cooking · storage ·
   food safety · nutrient retention.
7. Update the practical-translation analysis.
8. Apply the authorized `DEC-048` correction.
9. Apply the authorized provenance corrections to Phase 7 where required.
10. Continue the Gate 6 usability analysis **only after the culinary scope is explicit**.
11. Validate that shopping/pantry decisions are no longer incorrectly represented as scientific
    knowledge gaps.
12. Run the full Phase 8 closure audit.

---

## 11. Phase 9 Boundary — Unchanged

Phase 9 may later translate the established knowledge into recipe structures, preparation workflows,
shopping lists, pantry interactions, substitutions, and execution-oriented UX. **Phase 8 must first
establish the scientific/knowledge boundary supporting those functions. No production code during
Phase 8.**

---

## 12. Gate Status

**Gate 6 = GO.** Phase 8 continues under this controlled extension. Do not alter stable IDs or silently
rewrite prior phase decisions. Prepare a further review request at Phase 8's closure point **only if a
genuinely consequential unresolved decision remains.**

*Recorded from the supplied human decision. No part of it was interpreted, narrowed, or extended by the
recording agent.*
