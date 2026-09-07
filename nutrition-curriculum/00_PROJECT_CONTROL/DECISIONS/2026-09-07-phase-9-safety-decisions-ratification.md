# Decision Record — Phase 9 Safety Decisions A/B/C (Ratification)

**Date:** 2026-09-07
**Type:** Phase 9 human safety-decision ratification — **not a Review Gate.** Gate 7 is defined as the
end of Phase 9 (`PROJECT_AI_PROTOCOL.md` §21) and remains unopened.
**Decision authority:** Human / ChatGPT reviewer
**Artifact under review:** `08_APP_TRANSLATION/PHASE_9_APPLICATION_CAPABILITY_ARCHITECTURE.md` §18
(HUMAN SAFETY DECISION REVIEW PACKAGE), building on §16 and §17
**Outcome:** **A1 · B3 · C2 — all three ratified.**

**This record creates no `DEC` ID and amends no decision definition.** It ratifies, at the Phase 9
architecture/governance level, three questions that Phase 9 identified as unresolved.

---

## 1. Decision A — Intolerance Semantics: **A1, keep intolerance a soft constraint**

The existing `DEC-053` semantics are ratified as they stand:

```text
Allergy      → hard exclusion
Unclear      → safer hard-exclusion treatment / clinical confirmation
Intolerance  → soft constraint
Preference   → weaker preference filtering (DEC-061)
```

**Explicitly not authorized by this decision:** amending `DEC-053`; creating a new `DEC`; introducing
severity tiers; introducing longitudinal reaction-based hardening; changing any existing decision-model
semantics.

**Recorded consequence:** the shipped implementation has **no soft channel** — its only behavior is a
binary drop at the combo-suggestion layer (§17.3). Ratifying A1 therefore **creates a future
implementation requirement (build the soft channel), and is explicitly not a reason to change the
decision model to match the current code.**

## 2. Decision B — Exclusion Unit: **B3, hybrid**

The exclusion model must conceptually support **both** individual Food-level exclusion **and**
allergen-class-level exclusion.

**Rationale (safety):** food-level exclusion alone is structurally insufficient for composite foods and
ingredient-level allergens. Allergen-class exclusion must be capable of covering foods whose displayed
name does not reveal the allergen — verified against real project data in §18.2 (`makarna`, `bulgur`,
`beyaz ekmek`, `tam buğday ekmeği` all carry wheat under names that disclose nothing).

**Binding semantic rule, recorded verbatim:**

> **A safety-level allergen-class exclusion must not be defeated by a food-level "allow" or omission.**

**Explicitly not decided here:** table structure; field names; allergen vocabulary; canonical Food
representation; precedence implementation; UI architecture. All downstream.

## 3. Decision C — Temporary Exclusion: **C2, validity window**

Exclusions may carry a validity period — conceptually an active-from, an active-until/review date, and a
reason/category. **Semantic decision only; not a schema decision.**

**Binding safety invariant, recorded verbatim:**

> **Expiry MUST NOT silently remove a safety-relevant exclusion.** An allergy exclusion must not fail
> open merely because a time window has elapsed.

**Required behavior at expiry/review:**

```text
active exclusion → review / reconfirmation trigger → user confirmation → retain / modify / remove
```

**Explicitly not authorized by this decision:** creating a new `DEC` ID; amending `DEC-011` or `DEC-054`;
defining numeric validity periods; deciding how the trigger is implemented.

---

## 4. Rationale

Recorded as supplied by the reviewer, plus the evidence in §18 that supports it:

- **A1** preserves a model that §18.1 verified is *internally consistent* — `DEC-053`'s three-way output
  maps cleanly onto `DEC-061`'s "hard-excludes or soft-constrains," with the dependency graph reserving
  hard treatment for allergy and unclear. The mismatch Phase 9 found was between the model and the
  product's UI wording, not inside the model, so the model is kept and the product is what must change.
- **B3** answers a question the decision model does not address at all (§5 below), and answers it on the
  safety-dominant side: item-level exclusion cannot see an allergen carried inside a composite food, and
  hardness cannot compensate for a unit that never detects the allergen.
- **C2** adds temporal semantics without adding a decision, because what changes is an exclusion entry's
  lifetime rather than any decision's logic. The no-silent-expiry invariant follows the model's own
  existing precedent: both `DEC-011` and `DEC-054` produce a *trigger/prompt*, never a silent deletion.

---

## 5. Reconciliation Against the Existing Decision Model

Re-read for this ratification: `APP_DECISION_INVENTORY.md`, `DECISION_LOGIC_SPECIFICATION.md`,
`APP_DECISION_DEPENDENCY_GRAPH.md`, `APP_DECISION_KNOWLEDGE_MAPPING.md`, `APP_DECISION_MODEL.md`, and
Phase 9 §16–§18. **No contradiction was found.** Stated precisely, so nothing is over-claimed:

- **A — consistent, and this is an affirmation.** Six independent statements across four artifacts agree
  on the soft/hard/unclear split (`APP_DECISION_INVENTORY.md` line 922; `DECISION_LOGIC_SPECIFICATION.md`
  §3.9 and §3.11; `APP_DECISION_DEPENDENCY_GRAPH.md` lines 423 and 726;
  `APP_DECISION_KNOWLEDGE_MAPPING.md` line 466). A1 changes nothing and contradicts nothing.
- **B — fills a genuine silence; does not contradict.** **`DEC-053` and `DEC-061` do not specify exclusion
  granularity at all.** A targeted search found no allergen-class, food-group, or precedence language
  anywhere in the Phase 3 or Phase 7 artifacts; `APP_DECISION_MODEL.md` §31's granularity discussion
  concerns unrelated items (the Estimate/Individualize/Prescribe split and the Domain L/M cluster) and
  never reaches exclusion units. **It is therefore false to say the model already specifies hybrid
  granularity — it is silent, and B3 supplies a semantic decision the translation layer needs.**
- **C — adds a conceptual edge the model does not currently carry.** `DEC-061` has exactly two inbound
  dependency-graph edges: `DEC-060` and `DEC-053`. **Neither `DEC-011` nor `DEC-054` has any edge to
  `DEC-061`** (`DEC-011` → `DEC-006`/`023`/`105`; `DEC-054` → `DEC-057`/`063`), and `DEC-054` is scoped to
  GI tolerance for the structured-training subset. **It is therefore false to say `DEC-011`/`DEC-054`
  already provide this for `DEC-061`.** `DEC-053` sits in timing class 1 — "fixed until an explicit
  trigger" — so C2's review trigger is the kind of explicit trigger that class already anticipates,
  which is why C2 needs no new decision. Whether the dependency graph should eventually record a new
  edge is **downstream and not authorized here.**

---

## 6. Safety Invariants Established

1. A safety-level allergen-class exclusion must not be defeated by a food-level "allow" or omission.
2. Expiry must not silently remove a safety-relevant exclusion; an allergy exclusion must never fail open
   on elapsed time alone.
3. Unchanged and reaffirmed from the existing model: allergy hard-excludes; unclear biases toward the
   safer hard-exclusion treatment; intolerance is a soft constraint; preference filters more weakly still.

---

## 7. Downstream Dependencies — Not Decided by This Record

- **Canonical Food identity** (§16.1) — an upstream prerequisite for B3 being enforceable at all.
- Allergen vocabulary and the unmapped-food default.
- Precedence implementation for the hybrid model.
- Database schema, API design, UI design, implementation architecture.
- `DEC-067` (recipe depth) and `DEC-069` (batch scope).
- `DEC-099`/`DEC-100` — remain BLOCKED and untouched.

---

## 8. Explicitly Unresolved

- **User-vs-household exclusion scope** — exclusions are stored per user, while the shopping list they can
  populate is per household, and `household_shares` permits multiple members with nothing reconciling
  them (§18.4). **Preserved as its own separate product/semantic question; deliberately not folded into
  Decision B.**
- Everything listed in §7 above.

---

## 9. Implementation Authorization

**This record does not authorize implementation.** No application code, schema, migration, API, or UI
change is permitted on the basis of these ratifications. Phase 9 remains architecture-only per
`PROJECT_AI_PROTOCOL.md` §28. The next step is post-ratification *architectural reconciliation* —
determining what these three semantics require of the architecture — not building them.

**No decision definition was modified by this record.** `DEC-053`, `DEC-061`, `DEC-011`, `DEC-054` and
every other `DEC` remain exactly as written; any future amendment to a decision definition requires its
own explicit authorization.
