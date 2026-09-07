# Practical Translation Analysis — Phase 8

**Phase:** Phase 8 — Practical Translation (`PROJECT_AI_PROTOCOL.md` §16)
**Question:** _How does a scientific decision become something a real person can execute?_
**Authorized by:** Gate 5 approval, 2026-09-07 (`DECISIONS/2026-09-07-gate-5-phase-7-closure.md`)
**Continued under:** Gate 6 approval, 2026-09-07
(`DECISIONS/2026-09-07-gate-6-culinary-corpus-extension.md`) — **GO with a controlled corpus extension.**
**Companion artifact:** `CULINARY_SOURCE_EXTENSION.md` (the eighth-source selection and extension record).
**Execution artifact:** `ON_COOKING_7E_EXECUTION_RECORD.md` (actual source verification, inspection, and
decision mapping).
**Built on (read-only):** Phase 1's `APPARENT_CURRICULUM_GAPS.md`; Phase 3's `APP_DECISION_GAPS.md` /
`APP_DECISION_INVENTORY.md`; Phase 5's `EVIDENCE_AND_CONTENT_INSPECTION_REGISTER.md`; Phase 7's
`DECISION_LOGIC_SPECIFICATION.md`.

**Preserved exactly as documented:** `DEC-099`/`DEC-100` remain scope-pending — Gate 6 §8 explicitly
forbade using the culinary decision to revisit clinical scope. The three flagged bookkeeping/citation
discrepancies remain flagged.

> **⚠ Changed at Gate 6 — this document's original claim that "no Phase 1–7 source-of-truth document is
> modified" no longer holds.** Gate 6 §7 authorized narrow provenance corrections, and three entries in
> Phase 7's `DECISION_LOGIC_SPECIFICATION.md` (`DEC-031`, `DEC-034`, `DEC-048`) were edited after that
> document's gate had closed. The edits are listed in that document's new §0 amendment notice and in §5.3
> below. **No Phase 1–6 document has been modified.** The authorization was explicitly limited to
> clarification/correction of existing specifications and is not a general licence to edit prior phases.

---

## 1. Purpose and Scope

`PROJECT_AI_PROTOCOL.md` §16 defines Phase 8 around a single chain:

```
Target → Meal Structure → Food Selection → Portion → Recipe → Preparation → Shopping → Execution
```

and states plainly: _"The existing seven-book corpus does not automatically provide all of this
knowledge. Practical translation gaps must be explicitly handled."_

**This phase's defining structural fact:** that chain is precisely the territory of the 10 decisions
Phase 7 classified `BLOCKED` under the confirmed Practical Translation Gap, plus `DEC-065`. Phase 8 is
where the gap is confronted rather than deferred again.

**What this document does:** maps the chain against the actual decision inventory; establishes that the
"gap" is three structurally different problems that must not be treated as one; **resolves a validation
condition Phase 3 explicitly deferred** by performing the full-text content inspection Phase 3 was barred
from doing; and discharges the Gate 5 carry-forward evidence tasks.

**What it does not do:** invent culinary content; resolve `DEC-099`/`DEC-100`; close any
Phase-8-deferred numerical parameter by picking a plausible value; or decide the consequential knowledge-
source question in §6, which is escalated to Gate 6 exactly as the Gate 5 decision instructs.

---

## 2. The Translation Chain, Mapped

Each link mapped to the decisions that occupy it and its Phase 7 specification status:

| #   | Chain link         | Decisions                                  | Phase 7 status                                         | Gap class                |
| --- | ------------------ | ------------------------------------------ | ------------------------------------------------------ | ------------------------ |
| 1   | **Target**         | Domains D, E, F, G, H (`017`–`050`)        | **SPECIFIED** — equations, DRI/AMDR values, g/kg bands | none                     |
| 2   | **Meal Structure** | Domain J (`055`–`059`)                     | **SPECIFIED** (§3.10)                                  | none                     |
| 3   | **Food Selection** | Domain K (`060`–`064`)                     | **SPECIFIED** (§3.11)                                  | none                     |
| 4   | **Portion**        | `060`, `062` (+ `NUT-03`/`NUT-04`)         | **SPECIFIED**, thin methodology                        | **`GAP-C`**              |
| 5   | **Recipe**         | `067`                                      | **BLOCKED**                                            | **`GAP-A`**              |
| 6   | **Preparation**    | `068`, `069`                               | **BLOCKED**                                            | **`GAP-A`**              |
| 7   | **Shopping**       | `071`–`075`, `065` (pantry)                | **BLOCKED**                                            | **`GAP-D`**              |
| 8   | **Execution**      | `070` (deviation), `078`/`079` (adherence) | `070` **BLOCKED**; `078`/`079` **SPECIFIED**           | **`GAP-D`** (`070` only) |

Plus `DEC-066` (meal construction — the target→meal boundary), `BLOCKED`, `GAP-D`.

**The chain does not fail uniformly.** Links 1–3 are fully specified and were never the problem. The
break begins at link 4 and worsens through link 6, then changes character entirely at link 7. Reading
"Practical Translation Gap" as a single undifferentiated hole — which the shorthand invites — obscures
that the second half of the chain fails for a _completely different reason_ than the first half.

---

## 3. The Gap Is Three Problems, Not One

Phase 3's gap taxonomy already distinguished these; Phase 8's contribution is showing that the
distinction is **load-bearing**, because each class has a different correct treatment and only one of the
three is genuinely a knowledge problem.

### 3.1 `GAP-C` at **Portion** — thin, but real, and extendable

Phase 3 classified portion/quantity as `GAP-C` (application depth), explicitly _not_ `GAP-A`, because a
genuine precedent exists: `NUT-03`'s provenance includes **KM16 Appendix 18, "Exchange Lists and
Carbohydrate Counting for Meal Planning."** Phase 5's content inspection confirmed this appendix is real
but narrow — _"about portioning within a known meal, not meal construction or preparation."_

**Treatment:** extend existing knowledge. Exchange-list methodology is a legitimate, established
portioning system; it is thin here, not absent. This is the one link of the broken half that a future
phase can deepen from the corpus itself without new source material.

### 3.2 `GAP-A` at **Recipe** and **Preparation** — genuinely absent knowledge

The only true `GAP-A` in the entire 112-decision model: `DEC-067`, `068`, `069`. Phase 3's own analysis
noted that true `GAP-A` "is rare in this model — only 3 decisions qualify," because the 213-topic
universe is broad enough that near-total absence is the exception.

**Treatment:** cannot be extended from the corpus, because the corpus does not contain it — see §4, which
establishes this by direct full-text inspection rather than inference. Culinary/food-preparation science
is a _categorically different discipline_ from nutrition science. This was the subject of §6's escalation.

> **RECLASSIFIED at Gate 6 (2026-09-07): `GAP-A` → controlled corpus-extension work.**
> Gate 6 selected Option A and authorized one bounded eighth source. `DEC-067`–`069` are therefore no
> longer "absent knowledge with no route out" — they have an authorized route, recorded in
> `CULINARY_SOURCE_EXTENSION.md`.
>
> **Two qualifications the gate attached, both binding.** First: _"Do not pretend the knowledge existed
> in the original seven-book corpus."_ The `GAP-A` finding stands as a historical fact about the
> seven-book corpus; the reclassification describes the _route_, not the past. Second, the
> reclassification is **contingent on the extension completing** — the source is selected but not yet
> acquired or inspected (`CULINARY_SOURCE_EXTENSION.md` §7). Until then the honest status is **"blocked,
> with an authorized and identified route out,"** which is materially different from "resolved."

> **SUPERSEDED — the extension has now completed (2026-09-07).** Brown was unavailable; the actual
> bounded eighth source acquired and inspected is Labensky, Martel & Hause, _On Cooking: A Textbook of
> Culinary Fundamentals_, 7th Edition (2023 update) — full record in `ON_COOKING_7E_EXECUTION_RECORD.md`,
> summarized at §11 below. **`GAP-A` is now closed at the knowledge layer for recipe construction,
> preparation, modification, scaling, storage, and food safety** (all rated STRONG or ADEQUATE); **true
> quantity-food batch production remains a bounded, named limitation** (rated PARTIAL — see §11), not a
> new gap discovered by inspection. No further source is recommended. The first qualification above still
> holds without change: the knowledge did not exist in the seven-book corpus, and this reclassification
> describes the route that closed it, not a revision of that historical fact.

### 3.3 `GAP-D` at **Shopping**, **Pantry**, and **Deviation** — not a knowledge gap at all

`DEC-065`, `066`, `070`, `071`–`075`. Phase 3's own definition: _"the underlying nutrient/food science is
fully adequate; only the logistics bridge is missing, and that bridge is inherently a product/application
concern rather than a nutrition-science one."_

**These decisions are mis-served by the `BLOCKED` label.** They are not blocked on missing science — the
science behind them is complete. They are blocked only in the narrow sense that _this project's
nutrition-science corpus_ cannot answer a logistics question, which is unsurprising because it was never
supposed to. Phase 3 already reached this conclusion formally: the Shopping/Grocery Logistics
new-domain candidate **failed the five-condition test** on conditions 4 and 6, because list-consolidation
math is product detail, and _"this application's own existing grocery/pantry product surface is already a
viable translation-layer answer."_

**Treatment:** these belong to Phase 9 (Application/Product Architecture), not to a nutrition-knowledge
phase. **This grocery application already owns a household grocery list and pantry surface** — the exact
translation layer these decisions need. Recording this explicitly matters: carrying seven `GAP-D`
decisions forward as though they were unsolved scientific problems would misrepresent the project's
actual remaining risk.

> **CONFIRMED at Gate 6 (2026-09-07).** The reviewer preserved this finding and made the routing
> explicit: these decisions **"carry forward to the appropriate Phase 9 implementation/translation work
> rather than continuing to label them as unresolved scientific knowledge gaps,"** and _"the existing
> grocery/pantry surface is relevant here."_
>
> **This was the §8 self-audit item most open to objection** — the audit flagged it as "a reframing, and
> reframings can flatter." It survived review as stated. That is worth recording precisely because it
> could have gone the other way: had the reviewer disagreed, these seven revert to ordinary blocked
> status. See §7.3 for the step-11 validation that they are no longer represented as science gaps.

---

## 4. Content Inspection — Resolving Phase 3's Deferred Condition

### 4.1 Why this was worth doing

Phase 3's §19 evaluated "Practical Translation / Culinary-Preparation Knowledge" as a candidate new
knowledge domain against the five-condition test and reached:

> **Verdict: `POTENTIAL DOMAIN — REQUIRES FURTHER VALIDATION`.** Conditions 1–4 are met; conditions 5–6
> are not yet resolvable without the content inspection and scope work this document explicitly defers.

**Condition 5 was: "Gap persists after content inspection?" — answered "Not yet established — no content
inspection has been performed."** Phase 3 was structurally barred from inspecting content. Phase 5 gained
that capability and touched the question incidentally while inspecting KM16's Appendix 18, but never ran
a dedicated search.

Critically, **Phase 1's absence finding was TOC-level only** — its §1 states that no book's _table of
contents_ names food science or culinary technique at any level. A book can carry substantial content
that its TOC never names. Condition 5 therefore remained genuinely open.

### 4.2 Method

All seven source books were converted to full text (`pdftotext` for the five PDFs; `unzip` plus tag-
stripping for the two EPUBs — the technique documented in Phase 5's register) and searched
case-insensitively across ~16 MB of text. High-specificity culinary markers were used rather than
ambiguous ones: `recipe`, `culinary`, `cooking method`/`technique`, cooking verbs (`sauté`, `braise`,
`blanch`, `simmer`, `dredge`, `julienne`), recipe units (`tablespoon`, `teaspoon`), and oven language
(`preheat`, `bake at`). Every hit in the two books most likely to carry preparation content was then read
in context rather than counted.

### 4.3 Result

| Book    | recipe | culinary | cooking method | cooking verbs | tbsp/tsp | preheat |
| ------- | ------ | -------- | -------------- | ------------- | -------- | ------- |
| AS3     | 1      | 0        | 2              | 7             | 2        | 0       |
| ACSM    | 2      | 0        | 4              | 11            | 7        | 0       |
| HM4     | 0      | 0        | 0              | 0             | 0        | 0       |
| BENDER3 | 0      | 0        | 0              | 1             | 2        | 1       |
| NRM     | 9      | 0        | 0              | 0             | 2        | 0       |
| SN4     | 0      | 0        | 0              | 0             | 14       | 0       |
| KM16    | 19     | 7        | 9              | 20            | 31       | 5       |

Context inspection of every KM16 and AS3/ACSM hit:

- **All 7 `culinary` hits are non-instructional** — five are "culinary herbs" in a _supplement-safety_
  context (hepatotoxicity case reports, anti-inflammatory herbs); one is "culinary variations" of regional
  Mexican cuisine (cultural food context); none teaches technique.
- **All 3 `cooking method` hits are nutrient-fate observations, not instruction** — cooking method does
  not affect fish methylmercury; cooking method does affect oxalate; and an indigenous cooking _show_ run
  as a community food-sovereignty program.
- **Corpus-wide nutrient-retention content is near-absent** — 3 hits in KM16, 1 in ACSM, 0 in the other
  five books, for the entire family of `nutrient retention`, `cooking loss`, `heat-labile`.

**Condition 5 is now resolved: the gap persists after full-text content inspection.** The corpus does not
teach cooking technique, recipe development, or food-preparation science. Phase 1's TOC-level finding
holds at full-text level, which was not previously established.

### 4.4 A secondary finding Phase 3 and Phase 5 did not surface

The KM16 `recipe` hits are not noise, and they are not recipes. **Every one is recipe _modification_
guidance** — how to alter an existing dish to satisfy a constraint:

- gluten-free flour substitution, including that blending multiple GF flours yields the best outcome, and
  that patients should expect texture and flavour differences
- replacing 1 egg with 1 Tbsp ground flaxseed in 3 Tbsp water
- substituting soybean/canola oil in dressings; non-hydrogenated margarine as a spread
- algae/yeast-based egg-consistency products that mimic function without nutritional equivalence
- commercial reformulation to lower sodium without affecting acceptability
- adapting family-favourite dishes for children's needs
- home ORS preparation formulas (KM16 Table 28.2)

**This is a genuine, if thin, knowledge seam — and it maps onto decisions Phase 7 already specified**,
not onto the blocked ones: `DEC-061` (restriction/allergy filtering) and `DEC-063` (substitution
generation, "preserving the original nutrient contribution"). The corpus can support _substituting within
a dish_ while remaining unable to support _constructing the dish_.

**The distinction is exactly the boundary of the `GAP-A`:** recipe modification is present; recipe
construction is absent. Phase 3 recorded the absence correctly but, lacking inspection, could not see
that the adjacent modification content existed. This narrows the true `GAP-A` more precisely than it has
been described anywhere in the project so far.

---

## 5. Gate 5 Carry-Forward Evidence Tasks

Status of the six required items (`DECISIONS/2026-09-07-gate-5-phase-7-closure.md` §4):

### 5.1 `DEC-048` — heat/altitude fluid adjustment: **RESOLVED, with a change of form**

Gate 5 authorized a targeted evidence search for "a citable quantitative approach," explicitly
conditioning it: _"The final multiplier, **if one is justified**, must be evidence-backed and explicitly
scoped to the conditions for which it applies."_

**Finding: a multiplier is not the justified form, and this is a substantive result rather than a failed
search.**

**Corpus evidence.** All seven books establish the _mechanisms_ robustly — heat and humidity increase
sweat rate; altitude increases respiratory and insensible losses, raises renal sodium/water excretion,
and lowers voluntary intake (KM16), with cold-altitude environments adding the practical problem of
fluids freezing (SN4). **No book states a multiplier.** Instead, SN4 and ACSM repeatedly and
independently direct the reader to _measure individual sweat rate under the specific environmental
conditions_ — pre/post body mass corrected for intake — so that replacement can be individualized per
condition (SN4 at multiple points; ACSM likewise).

**External evidence (authorized web research, September 2026).** The ACSM position stand on Exercise and
Fluid Replacement states that sweat rate is **highly variable between individuals and can exceed 2 L/h**,
with documented endurance-athlete rates of 2.79 and 3.06 L/h, and that **because of this variability
customized fluid-replacement programs are recommended**, with individual sweat rate estimated from
pre/post-exercise body-mass change. For altitude specifically, a 2024 narrative review of high-altitude
mountaineering nutrition reports an ACSM expert daily requirement of **4–5 L/day during altitude training
and competition**, an additive increment of roughly **+1–1.5 L/day** over baseline to offset respiratory
and urinary losses (quantified at ~850–1,900 mL/day), and during-activity intake of **400–800 mL/h with
0.5–1 g Na/L** — while still stating that replenishment at altitude _should be individualized_.

**Two things worth noting.** First, the during-activity figures converge with what Phase 7 already
specified independently — `DEC-047`'s 400–800 mL/h and `DEC-049`'s 500–700 mg Na/L sit inside the
altitude literature's 0.5–1 g Na/L. That convergence is a small validation of §3.5. Second, and more
importantly:

> **Heat and altitude do not take the same specification form.** Altitude admits a citable _additive
> daily increment_ (+1–1.5 L/day; 4–5 L/day total under altitude training) because its dominant losses —
> respiratory, insensible, renal — are relatively consistent across individuals. Heat does **not**, because
> inter-individual sweat-rate variability (roughly 0.5 to >3 L/h) is far larger than any population factor
> could represent. Applying a single multiplier to heat would not be a rough approximation; it would be
> wrong for most individuals in both directions.

**Proposed specification for `DEC-048`** (a form correction within Gate 5's authorization, not a new
architectural decision — the decision explicitly anticipated that a multiplier might not be justified):

```
altitude exposure  → additive daily increment: +1–1.5 L/day over the DEC-046 baseline
                     (ACSM expert guidance: 4–5 L/day total during altitude training/competition),
                     scoped to altitude training/competition conditions
heat exposure      → NO population multiplier. Route to individualized sweat-rate measurement
                     (pre/post body-mass change, corrected for intake), feeding DEC-047's
                     already-specified 400–800 mL/h replacement band
both               → individualization remains the governing principle; the altitude increment is a
                     starting default, not a substitute for measurement
```

This keeps the safety direction Gate 5 approved, adds the citable figure Gate 5 asked for where one
legitimately exists, and declines to manufacture one where the evidence says the concept itself is
inappropriate.

> **RATIFIED at Gate 6 (2026-09-07) and APPLIED.** The reviewer confirmed the correction — _"Phase 8
> evidence demonstrated that a population heat multiplier is not justified. Ratify the correction"_ — and
> characterized it as **a ratification of `DEC-048`, not a reopening of Gate 5**, which resolves the
> non-blocking question §8 raised about whether this exceeded Gate 5's authorization.
>
> The specification is now written into `DECISION_LOGIC_SPECIFICATION.md` §3.5, with §3.18.6 updated and
> the amendment disclosed in that document's new §0. Two constraints the gate attached are carried into
> the specification text: the altitude increment must **not** be generalized beyond the population and
> context its source supports, and **the provenance must be recorded explicitly** — both are.

### 5.2 Items 1, 2, 3 — **correctly still open**

- **`DEC-021`/`DEC-110` deviation cap** — requires the model/observation reconciliation evidence work;
  not attempted in this pass. Gate 5 explicitly conditioned it on _"if retained after evidence review,"_
  so retention is not assumed.
- **`DEC-090` circuit-breaker parameters** — requires product-risk work alongside evidence; not
  attempted.
- **Domain C criteria** — Gate 5 conditioned these on clinical scope being defined first, and clinical
  scope is `DEC-099`/`DEC-100`, which remain deferred. **This item is therefore genuinely blocked, not
  merely unstarted**, and cannot be closed in Phase 8 unless `DEC-099`/`DEC-100` are answered.

These are recorded as open rather than closed with plausible values, per §4.2 of the specification.

### 5.3 Item 5 — provenance re-verification: **DISCHARGED**

Phase 7's self-audit flagged that its protein g/kg tiers, carbohydrate g/kg training bands, and the
500–700 mg/L sodium figure were standard consensus values _not verified page-by-page against this
project's own corpus_ the way `DEC-027`, `DEC-035`, and `DEC-037` were. That verification has now been
performed by direct full-text search of all seven books.

**Result: every range is corroborated by the corpus, with three boundary nuances worth recording.**

**Protein (`DEC-031`).** Directly located in SN4 and ACSM:

| Phase 7 tier                         | Corpus support                                                                                                                                                                                                      |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.2–1.6 g/kg recreationally active   | SN4: _"no evidence to support protein intakes in excess of usual amounts recommended (i.e., 1.2–1.6 g/kg b.w./day)"_; ACSM: athletes _"1.2 to 2.0 g/kg"_; ACSM elsewhere _"moderate in protein (1.2–1.7 g/kg/day)"_ |
| 1.6–2.2 g/kg strength/hypertrophy    | SN4: _"For optimal gains in muscle mass, a combination of a high protein intake (1.4–2.2 g/kg/day)"_                                                                                                                |
| Upper end during caloric restriction | SN4, directly: athletes training hard while losing weight should _"maintain their protein intake at about 1.6 g/kg b.w./day and reduce both their fat and carbohydrate intakes by about 30% to 40%"_                |

> **Nuance worth flagging.** SN4's own evidence review places the hypertrophy plateau at the _bottom_ of
> Phase 7's upper tier: _"no clear benefits of protein intakes in excess of 1.6 to 1.7 g/kg b.w./day with
> regard to muscle hypertrophy,"_ with a regression break point given at **1.62 g/kg**. Phase 7's
> 1.6–2.2 band is therefore not wrong — 2.2 appears in SN4's own "optimal gains" framing — but its upper
> half reflects a permissive ceiling, **not evidence of additional benefit.** A specification that
> presented 2.2 as a target rather than a ceiling would overstate what this corpus supports.

**Carbohydrate (`DEC-034`).** Located in AS3, SN4, and ACSM:

| Phase 7 band                    | Corpus support                                                                                                     | Match                                                              |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| light 3–5 g/kg                  | SN4: _"as low as 5 g/kg on easy training days"_                                                                    | lower bound not located                                            |
| moderate 5–7 g/kg               | AS3: _"5 to 7 g/kg/day for general training"_                                                                      | exact                                                              |
| high-volume endurance 6–10 g/kg | AS3: _"7 to 10 g/kg/day for endurance"_                                                                            | Phase 7's floor is 1 g/kg lower                                    |
| ultra up to 8–12 g/kg           | SN4: _"as high as 10 to 12 g per kilogram"_; ACSM: _"10–12 g/kg body weight, 2–3 days prior to an athletic event"_ | corpus frames 10–12 as **carbohydrate loading**, an event protocol |

> **Two nuances.** Phase 7's endurance floor (6) sits a gram below the corpus's (7), and its "ultra"
> band repurposes what ACSM explicitly describes as a **pre-event loading protocol** (2–3 days before
> competition) as though it were a routine daily intake. Neither is a large error, but the loading
> framing is a category difference, not a boundary difference, and should be corrected when `DEC-034` is
> next revised.

**Incidental confirmation.** AS3 independently confirms `DEC-035`'s pre-exercise figure — _"approximately
1 to 4 g/kg, 1 to 4 hours before exercise"_ — which Phase 5 had sourced from SN4 Chapter 6. Two
independent books in the corpus, agreeing exactly.

**Sodium and fluid (`DEC-047`, `DEC-049`).** Verified externally in §5.1: 400–800 mL/h and 500–700 mg
Na/L both sit inside independently-sourced authoritative ranges.

**Effect:** the caveat Phase 7's self-audit raised is discharged. No range was found to be invented or
unsupported; three presentational nuances are recorded above for whichever phase next revises those
entries. Per protocol, **`DECISION_LOGIC_SPECIFICATION.md` itself was not edited** — these are Phase 8
findings recorded in Phase 8's own layer.

> **SUPERSEDED at Gate 6 (2026-09-07): the corrections are now APPLIED to Phase 7.** The reviewer
> authorized propagation — _"limited to clarification/correction of existing specifications … These are
> evidence/provenance corrections, not new human judgment calls"_ — which answers the second non-blocking
> question §8 raised. What was applied, and how it differs from what was found:
>
> | Nuance                                 | Gate 6 instruction                                                                 | Applied as                                                                                                                |
> | -------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
> | Protein 1.6–2.2 vs SN4 plateau 1.6–1.7 | _"Do not describe the upper half … as evidence of additional hypertrophy benefit"_ | `DEC-031` — band **retained**, claim corrected: upper half is headroom (tolerance/sufficiency), not incremental gain      |
> | Endurance floor 6 vs corpus 7          | _"Do not silently reinterpret the difference. Record the provenance and context"_  | `DEC-034` — floor **retained at 6**, divergence recorded explicitly and _not_ characterized as agreement                  |
> | Ultra 8–12 as a daily band             | _"Do not describe … as a routine universal daily requirement"_                     | `DEC-034` — **recategorized**: moved out of the daily bands into a pre-event loading protocol (~2–3 days pre-competition) |
>
> **Only the third changed how a number is used**; the first two changed only the claim attached to a
> number. All three are disclosed in `DECISION_LOGIC_SPECIFICATION.md` §0, which now carries a
> post-closure amendment notice — the first time a Phase 7 artifact has been edited after its gate.

### 5.4 Item 6 — `DEC-107` alignment principle: **preserved**

Every figure introduced in this document cites a named external source (ACSM position stand; the 2024
high-altitude review) or this project's own corpus, per the approved provenance chain
`authoritative source → project specification → application decision rule`.

---

## 6. The Knowledge-Source Question — Escalated to Gate 6, **RESOLVED** (see §6.1)

Gate 5 instructed: _"If a genuinely new consequential architectural/scientific decision appears during
Phase 8, create a new review gate rather than silently deciding it."_ One has.

**The question:** Phase 8 has now established (§4) that recipe-construction and preparation knowledge is
genuinely absent from all seven books at full-text level, resolving the last open validation condition on
Phase 3's `POTENTIAL DOMAIN` verdict. Conditions 1–5 of the five-condition test are now **all met** for
Culinary/Food-Preparation Knowledge. Only condition 6 remains — _can it be handled as a translation layer
instead of a new domain?_ — and that is not a factual question this phase can settle by inspection. It is
a scope decision.

**The options, stated neutrally:**

- **A — Accept a new knowledge source.** Admit an eighth source book (a culinary-science or
  food-preparation text) into the corpus, creating a genuine new knowledge domain. Unblocks `DEC-067`–
  `069`. Cost: expands a corpus that has been fixed and stable since Phase 1, and every prior phase's
  "213 topics from 7 books" accounting would need an explicit, bounded extension.
- **B — Scope recipe construction out of v1.** Treat recipe/preparation as outside the application's
  claims. `DEC-067`–`069` stay permanently `BLOCKED` by design rather than by deficiency, and the app
  delivers guidance down to the _food and portion_ level (link 4) without instructing on preparation.
  Cost: the chain's links 5–6 are never delivered.
- **C — Translation-layer only.** Deliver recipe _modification_ (which §4.4 establishes the corpus does
  support, thinly) without recipe _construction_ — the app can say "substitute flaxseed for egg" but never
  "here is how to make the dish." Cost: a partial, possibly awkward user experience; benefit: requires no
  new source and uses knowledge already present.

**Claude's assessment, offered as input and not as a decision:** option C is the one newly made available
by this phase's §4.4 finding, and it is worth the reviewer's attention precisely because it did not exist
as an option before this inspection was performed. It is also the only option consistent with both the
fixed corpus and the existing `DEC-063` specification. Whether that partial capability is _worth
shipping_ is a product judgment this document does not make.

### 6.1 RESOLVED — Gate 6 selected Option A (2026-09-07)

**Full record:** `DECISIONS/2026-09-07-gate-6-culinary-corpus-extension.md`. **Execution record:**
`CULINARY_SOURCE_EXTENSION.md`.

> **"Admit one bounded eighth culinary/food-preparation source. Do not permanently exclude recipe
> construction, and do not use modification-only as the primary culinary architecture."**

**Option C — the option this phase created — was rejected as primary architecture**, and the reasoning
identifies a real weakness in how §4.4 was framed. The finding is "valid and useful," but:

> **example-level modification knowledge ≠ general recipe-construction knowledge.**

§4.4 established that the corpus contains _instances_ of recipe modification. It did **not** establish
that those instances constitute a general modification _system_ — a handful of worked examples (GF flour
blending, flaxseed-for-egg, ORS formulas) is not a knowledge layer that generalizes to arbitrary dishes.
The gap between "contains examples of X" and "can do X in general" is one this document's §4.4 did not
draw sharply enough, and the reviewer drew it. **The examples are preserved as evidence-backed examples**
and remain attached to `DEC-061`/`DEC-063`; they are simply not promoted into an architecture.

**The architectural reason Option A won** is that the intended chain runs
`target → meal structure → food selection → portion → recipe → preparation → shopping → execution`.
Recipe and preparation are interior links, not terminal ones. Option B would have truncated the chain at
link 4 permanently; Option C would have delivered links 5–6 only in the narrow case where a dish already
exists and needs altering.

**Status of `DEC-067`–`069`:** no longer `GAP-A`-without-a-route, **not yet specified.** See §3.2's
reclassification and `CULINARY_SOURCE_EXTENSION.md` §6 — the source is selected, and acquisition and
inspection remain.

---

## 7. Usability Assumptions (Gate 6 review area 5)

Gate 6 §9 step 10: _"Continue the Gate 6 usability analysis only after the culinary scope is explicit."_
It now is — §6.1 fixes the architectural scope (recipes are in; construction is in; §10's exclusions
bound it). What remains open is _depth_, pending inspection, and each assumption below is marked for
whether it depends on depth or only on scope.

**Why this section is not a design.** §28 bars production architecture before Phase 9. What follows
identifies **assumptions the knowledge layer is making about users** — assumptions that, if false, would
make correct nutrition advice practically useless. Naming them is a knowledge-boundary activity; solving
them is Phase 9's.

### 7.1 What the Gate 6 decision fixes, and what it therefore commits the application to

The chain now terminates at _execution_, not at _food selection_. That is a materially larger promise
than the seven-book corpus alone could support, and it carries a usability obligation with it:

```
BEFORE Gate 6 (Option B/C world)     AFTER Gate 6 (Option A world)
  "eat ~140 g protein today"           "eat ~140 g protein today"
  "chicken breast is a good source"    "chicken breast is a good source"
  "~200 g raw"                         "~200 g raw"
  [ chain ends — user improvises ]     "here is how to prepare it"
                                       "here is what to buy"
                                       "here is how it survives the week"
```

**The assumption Option A introduces:** that a user who receives preparation guidance will _follow_ it,
and that following it produces the nutrient outcome the target assumed. Every link added after "food
selection" is a link where the delivered nutrition can diverge from the specified nutrition.

### 7.2 The assumptions, stated and tested

| #      | Assumption the model currently makes                                                                                                                                         | Status                                                                                                                                                                                                        | Depends on                              |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| **U1** | The user can **weigh or estimate portions** with enough accuracy for `DEC-060`/`062`'s exchange-list translation to mean anything.                                           | **Untested.** The corpus's exchange-list methodology (KM16 Appendix 18) was built for _clinical dietetics with practitioner support_, not unsupervised consumer use.                                          | Scope only — already live               |
| **U2** | The user will **cook at all.** Every link past food selection assumes a user who prepares food rather than buying it prepared.                                               | **Untested, and newly load-bearing.** Before Gate 6 this assumption was harmless because the chain stopped early. It is now the foundation of links 5–6.                                                      | Scope only                              |
| **U3** | **Preparation preserves the nutrient content the target assumed.** `DEC-069` (nutrient retention) exists precisely because it does not, reliably.                            | **Open — and this is the assumption that actually threatens correctness.** A protein target computed on raw mass and delivered through a preparation that changes yield is not the target that was specified. | **Depth** — needs source inspection     |
| **U4** | The user's **substitutions preserve nutrient contribution**, as `DEC-063` specifies.                                                                                         | **Partially supported.** §4.4's examples are real but example-level; Gate 6 explicitly refused to generalize them.                                                                                            | **Depth**                               |
| **U5** | The user has the **equipment, time, and skill** a preparation assumes. `DEC-068` (preparation constraints) is the decision that should encode this; it is not yet specified. | **Untested.**                                                                                                                                                                                                 | **Depth**                               |
| **U6** | **Batch cooking behaves nutritionally like fresh cooking** across a storage window (`DEC-069`).                                                                              | **Untested**, and `CULINARY_SOURCE_EXTENSION.md` §4.1 flags batch production as the selected source's weakest capability.                                                                                     | **Depth** — and possibly a further gate |
| **U7** | The user will **report what they actually ate**, which the entire Domain O adaptive loop depends on.                                                                         | **Pre-existing, unchanged by Gate 6.** Already mitigated architecturally: Gate 5's `DEC-081`/`082` data-quantity and data-quality bars gate the loop, and the mandatory circuit breaker bounds it.            | Neither — already handled               |

### 7.2.1 The one that matters most

**U3 is the assumption with correctness consequences rather than convenience consequences.** U1, U2, U5
and U6 degrade the _experience_ — advice goes unused. U3 degrades the _advice_: it can make a
correctly-computed target silently wrong at the point of delivery, and the user has no way to detect it.

This is not a new decision — it is exactly what `DEC-069` was always for. What Gate 6 changed is that
`DEC-069` now has a route to being answered. It also explains why §3.4 of the extension record weights
capability 10 (nutrient retention) highest in source selection: **it is the capability that closes the
loop back to the nutrition corpus.** A culinary source that taught preparation without teaching nutrient
fate would deliver links 5–6 while quietly breaking link 1.

### 7.2.2 What this section does not claim

It does not claim these assumptions are _resolved_ — none is. It does not propose mitigations; that is
Phase 9. And it does not treat the Gate 6 decision as having _created_ U1–U7: U1, U2 and U7 predate it.
What Gate 6 changed is that U2–U6 moved from _hypothetical_ (the app might never deliver preparation
guidance) to _load-bearing_ (it will).

### 7.3 Step 11 validation — shopping/pantry are no longer represented as science gaps

Gate 6 §9 step 11 requires verifying that `DEC-065`, `066`, `070`–`075` are no longer carried as
unresolved _scientific_ knowledge gaps. Checked across the project's live artifacts:

| Artifact                                          | How these decisions are now represented                                                                                                                       | Correct?                                               |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| This document §3.3                                | `GAP-D`, explicitly "not a knowledge gap," routed to Phase 9, gate-confirmed                                                                                  | ✅                                                     |
| This document §2 table                            | `GAP-D` with "not a knowledge problem" in the plain-language column                                                                                           | ✅                                                     |
| `DECISION_LOGIC_SPECIFICATION.md` §3.11/§3.17     | `DEC-065` recorded as **`BLOCKED (GAP-D)`** — an _application-integration_ item, with the reason stated as absent-logistics-bridge rather than absent science | ⚠️ **Label is `BLOCKED`; the reason given is correct** |
| `DECISION_LOGIC_SPECIFICATION.md` §7 status table | 15 `BLOCKED` includes `DEC-065` and Domains L/M                                                                                                               | ⚠️ Same                                                |

**The remaining discrepancy, stated rather than smoothed over.** Phase 7's status table still counts
these under a single `BLOCKED` label that does not distinguish _"blocked on absent science"_ (Domains
L/M, pre-extension) from _"blocked on a product decision Phase 9 will make"_ (`GAP-D`). The _reasons_ are
recorded correctly in every entry; only the aggregate label conflates them.

**I have not changed it, and that is deliberate.** Gate 6's authorization to edit Phase 7 was explicitly
_"limited to clarification/correction of existing specifications"_ for the `DEC-048` and provenance items
(§7 of the decision). Re-labelling a status taxonomy is a structural change to how Phase 7 counts, not a
provenance correction — it would alter the 97/15 accounting's meaning. **Flagged for Phase 9 or a future
gate; not taken on this authority.** The step-11 requirement is satisfied in substance: no artifact
represents these as unsolved science, and every entry states the real reason.

---

## 8. Validation

### 8.0 Post-Gate-6 validation

- **Phase 7 edits verified programmatically after application.** All 112 `DEC` IDs still resolve; the
  97/15 accounting is unchanged; the deferred-parameter count moved 9 → 8 and every statement of that
  figure was updated (checked by grep for residual "nine"/"9 carry" claims — none remain); the four
  surviving `SPECIFIABLE (not yet drafted)` strings are category _definitions_ and "this category is
  empty" statements, not stale `DEC-048` claims.
- **Only the three authorized entries were edited.** `DEC-031`, `DEC-034`, `DEC-048` (plus the accounting
  lines that cite `DEC-048`'s status and `DEC-096`'s cross-reference to it, which would otherwise have
  become stale). A fourth candidate change was identified and **declined** as outside the authorization
  (§7.3).
- **The corpus extension changed no stable ID.** 213 topics and 112 decisions intact; the eighth source
  is recorded in a separate artifact and prior phases' "7 books / 213 topics" statements are left true as
  written.
- **Source selection criteria were fixed before candidates were assessed**, and candidate tables of
  contents were verified against publisher/catalogue records rather than recalled.
- **The complementarity baseline was read in context, not counted** — which reversed three markers and,
  in the opposite direction, refuted an over-claim of mine about food-safety absence
  (`CULINARY_SOURCE_EXTENSION.md` §3.2–§3.3). Both directions are recorded.
- **`DEC-099`/`DEC-100` untouched**, and the culinary decision was not used to approach clinical scope —
  Gate 6 §8 explicitly forbade that.
- **No production code, schema, UI, or executable algorithm.** §7's usability section names assumptions
  and explicitly refuses to propose mitigations, which is Phase 9's work.

### 8.1 Original validation (pre-Gate-6, retained as written)

- **The chain mapping (§2) covers all 8 protocol links** and accounts for every decision in Domains J, K,
  L, M plus `DEC-065`, `078`, `079` — cross-checked against `DECISION_LOGIC_SPECIFICATION.md` §2's status
  table; no decision's Phase 7 status was altered by this document.
- **The content inspection (§4) covered all 7 books** — full text, ~16 MB, not TOCs and not samples.
  Every hit in the two highest-yield books was read in context rather than counted, which is what
  surfaced the §4.4 modification/construction distinction that raw counts would have missed.
- **Gap classifications are Phase 3's, not new ones** — `GAP-A`/`GAP-C`/`GAP-D` assignments are quoted
  from `APP_DECISION_GAPS.md`, not re-derived. Phase 8's contribution is showing the distinction is
  load-bearing and resolving condition 5, not reclassifying anything.
- **`DEC-099`/`DEC-100` not resolved** — mentioned only to record that Domain C's criteria (§5.2) are
  genuinely blocked behind them.
- ~~**No Phase 1–7 source document modified** — this document is additive.~~ **Superseded post-Gate-6:**
  true when written; Gate 6 §7 subsequently authorized three edits to Phase 7's
  `DECISION_LOGIC_SPECIFICATION.md`. **No Phase 1–6 document has been modified.** See §8.0.
- **No production code, schema, UI, or executable algorithm** — the §28 Phase-9 boundary holds. §3.3's
  finding that `GAP-D` items belong to Phase 9 is a _routing observation_, not an implementation.
- **No numerical parameter was closed by picking a value.** `DEC-048` was resolved by finding real
  external evidence and reporting that the evidence rejects the multiplier form; the three still-open
  items are reported open.

---

## 9. Self-Audit (per `PROJECT_AI_PROTOCOL.md` §19 Step 6)

### 9.0 Post-Gate-6 additions to this audit

- **The §4.4 framing was too generous, and review caught it.** This document presented "the corpus
  supports modification but not construction" as a clean boundary. Gate 6's rejection of Option C is
  correct that _examples of_ modification are not a modification _system_ — the corpus has perhaps five
  worked instances, and I described them in language ("the corpus can support substituting within a
  dish") that implied more generality than five instances carry. The finding stands; the framing was
  over-confident, and §6.1 now records that.
- **I edited a Phase 7 artifact for the first time.** Three entries changed after that document's gate
  closed. Authorization is explicit (Gate 6 §7) and narrow, the changes are listed in that document's
  new §0, and I declined a fourth change (§7.3's status-label conflation) as falling outside the
  authorization. The risk to watch is precedent: _"Gate 6 let me edit Phase 7"_ must not generalize into
  treating Phase 1–7 documents as editable.
- **The eighth source is selected on its table of contents, not its text.** This is the same TOC-versus-
  content weakness that §4 of this document was written to _resolve_ for the original corpus — and the
  selection is currently on the wrong side of it. `CULINARY_SOURCE_EXTENSION.md` §9 records this as the
  selection's main vulnerability and treats it as provisional until step 4 confirms depth.
- **Usability (§7) is the thinnest section in this document.** It names assumptions rather than testing
  them, because most of them can only be tested against a real user population, which no phase of this
  project has access to. U1 in particular — that consumers can portion accurately enough for exchange-
  list logic to mean anything — is an empirical claim I have marked "untested" rather than researched.
  A reviewer could reasonably ask for evidence there rather than a flag.

### 9.1 Original audit (pre-Gate-6, retained as written)

- **What could be wrong.** The content inspection (§4) is a keyword search plus context reading, not a
  page-by-page reading of 16 MB. A book could in principle carry preparation guidance using vocabulary
  none of the twelve marker terms caught. I judge this unlikely — `recipe`, `culinary`, and cooking verbs
  are hard to avoid when teaching technique, and the result is corroborated by Phase 1's independent
  TOC-level finding and Phase 5's incidental observation — but it is a search, and searches have blind
  spots. A reviewer wanting certainty should ask for a targeted read of KM16's appendices specifically.
- **What was assumed.** That the `DEC-048` form correction (multiplier → additive-plus-individualized)
  falls inside Gate 5's authorization rather than constituting a new decision. The basis is Gate 5's own
  conditional phrasing, _"if one is justified"_ — which presupposes the possibility that none is. If a
  reviewer reads that narrowly, this belongs at Gate 6 alongside §6.
- **What could be over-claimed.** §3.3 argues the seven `GAP-D` decisions are "not really blocked." That
  is a reframing, and reframings can flatter. The concrete, checkable claim is narrower: Phase 3's own
  five-condition test already rejected Shopping/Grocery Logistics as a knowledge domain on conditions 4
  and 6, and this application already owns the pantry/list surface those decisions need. If a reviewer
  disagrees that a product surface answers them, they revert to ordinary blocked status and the §6
  question widens.
- **What was silently resolved:** nothing. §6's question is escalated rather than answered; the three
  open Gate 5 items are reported open; Domain C is reported as blocked behind `DEC-099`/`DEC-100`
  rather than worked around.
- **What changed from Phase 1–7:** no source document changed. One new folder, one new artifact.
- **What Gate 6 depends on:** the §6 knowledge-source decision, which determines whether links 5–6 of the
  translation chain are ever deliverable, and therefore what Phase 9 is building toward.

---

## 10. Status

> **UPDATED 2026-09-07 (post-execution). Gate 6 resolved GO; the bounded extension has been executed;
> Phase 8 is CLOSED.**
>
> **All twelve steps of Gate 6 §9 are complete:**
>
> | Step | What it required                                        | Where it is done                                                                                                                                                                                                                                                                                                                   |
> | ---- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | 1    | Selection criteria                                      | `CULINARY_SOURCE_EXTENSION.md` §2                                                                                                                                                                                                                                                                                                  |
> | 2    | Select the source                                       | `CULINARY_SOURCE_EXTENSION.md` §4 (Brown, initial candidate) → `ON_COOKING_7E_EXECUTION_RECORD.md` §1 (On Cooking 7e, actual — Brown was unavailable, substitution disclosed, not silent)                                                                                                                                          |
> | 3    | Record as controlled extension                          | `CULINARY_SOURCE_EXTENSION.md` §5                                                                                                                                                                                                                                                                                                  |
> | 4    | Inspect the source                                      | `ON_COOKING_7E_EXECUTION_RECORD.md` §2 — full-text extraction with `pypdf` (1,249 pages), targeted chapters read in context, not TOC-only                                                                                                                                                                                          |
> | 5    | Map only what `DEC-067`–`069` require                   | `ON_COOKING_7E_EXECUTION_RECORD.md` §4, §11.1 below                                                                                                                                                                                                                                                                                |
> | 6    | Distinguish the seven culinary categories               | `ON_COOKING_7E_EXECUTION_RECORD.md` §3 (fourteen-category matrix, finer-grained than the seven required)                                                                                                                                                                                                                           |
> | 7    | Update this document                                    | §11 below, plus this status section                                                                                                                                                                                                                                                                                                |
> | 8    | Apply `DEC-048`                                         | Applied to Phase 7 §3.5/§3.18.6 (§5.1 above)                                                                                                                                                                                                                                                                                       |
> | 9    | Apply provenance corrections                            | Applied to Phase 7 `DEC-031`/`DEC-034` (§5.3 above)                                                                                                                                                                                                                                                                                |
> | 10   | Usability analysis                                      | §7 above                                                                                                                                                                                                                                                                                                                           |
> | 11   | Validate shopping/pantry no longer read as science gaps | §7.3 above                                                                                                                                                                                                                                                                                                                         |
> | 12   | Closure audit                                           | Run 2026-09-07 — DEC ID range checked (max `DEC-112`, none created above it); `MASTER_TOPIC_UNIVERSE.md` and `APP_DECISION_INVENTORY.md` diff-checked against commit `85cec9e` (unchanged); `DEC-099`/`DEC-100` mentioned only to confirm deferral; source-book directory diff shows only the addition, nothing removed or altered |
>
> **No new review gate was opened.** Gate 6 itself set the bar: escalate again only if inspection reveals
> "a potentially consequential scope decision." It did not — the one named limitation (true quantity-food
> batch production, `DEC-069`) was already anticipated in `CULINARY_SOURCE_EXTENSION.md` §4.1 before the
> book was even acquired, and the inspection confirmed a bounded scope limitation rather than a surprise
> requiring reconsideration. See §11.2 for that determination made explicit.
>
> **Phase 9 (Application/Product Architecture, §17) is the next authorized phase.** Per §28, no production
> architecture is created here — that boundary is Phase 9's to cross, not this closure's.

### 10.1 The pre-Gate-6 record, retained

**Phase 8's autonomous work was blocked at a genuine decision point. Gate 6 was opened.**

**Delivered:**

- The translation chain mapped to the decision inventory (§2) — the break is at links 4–8, not uniform.
- The three-way gap distinction established as load-bearing (§3), including the finding that seven
  `GAP-D` decisions are routing questions for Phase 9 rather than unsolved science.
- **Phase 3's deferred validation condition 5 resolved** by the full-text inspection Phase 3 was barred
  from performing (§4) — the culinary gap persists, now established at full-text rather than TOC level.
- **A previously-unsurfaced finding** (§4.4): the corpus supports recipe _modification_ while lacking
  recipe _construction_, which narrows the true `GAP-A` and creates a third option at §6 that did not
  previously exist.
- **`DEC-048` discharged** (§5.1) with a citable altitude increment and an evidence-based finding that
  the multiplier form is wrong for heat.
- **Provenance re-verification discharged** (§5.3) — Phase 7's flagged consensus ranges are corroborated
  against the corpus, with three presentational nuances recorded.

**Why Gate 6 opens now rather than after more work.** Gate 6 reviews _practical translation, meal
construction, shopping, preparation, usability assumptions_ (`PROJECT_AI_PROTOCOL.md` §21). Two of those
five — **meal construction (`DEC-066`) and preparation (`DEC-067`–`069`)** — are directly blocked on §6's
knowledge-source question, and **usability assumptions cannot be honestly assessed without knowing
whether the application delivers recipes at all.** Continuing would mean producing usability analysis
that a different §6 answer would invalidate. Gate 5 instructed that a genuinely new consequential
architectural decision should open a review gate rather than be decided silently; §6 is that decision,
and Gate 6 is precisely the gate whose subject matter it falls under.

**Remaining open, carried to Gate 6 and beyond:** the §6 knowledge-source decision (blocking); the
`DEC-021`/`DEC-110` deviation cap and `DEC-090` circuit-breaker parameters (evidence/product-risk work,
not attempted); Domain C criteria (**genuinely blocked** behind `DEC-099`/`DEC-100`, per Gate 5's own
sequencing); usability assumptions (deferred pending §6).

See `CHATGPT_REVIEW_REQUEST.md` for the Gate 6 package and `AI_SESSION_STATE.md` for the execution
checkpoint.

---

## 11. Actual Source Inspection — On Cooking 7e

The actual bounded source used for execution is Labensky, Martel, and Hause, _On Cooking: A Textbook of
Culinary Fundamentals_, 7th Edition (2023 update), Pearson. Brown's earlier Gate 6 candidate record is
preserved; its unavailability is documented, and this execution substitution is explicit in
`ON_COOKING_7E_EXECUTION_RECORD.md`.

The PDF is 1,249 pages, unencrypted, readable at the first and final page, and successfully text-extracted
across the file. Substantive inspection covered Food Safety and Sanitation, Nutrition and Healthy Cooking,
Menus and Recipes, Knife Skills, Mise en Place, Principles of Cooking, Stocks and Sauces, food-class and
plant-based cooking chapters, Charcuterie, and the Bakeshop chapters. The source provides strong coverage
for standardized recipe construction, preparation workflow, cooking-method selection, ingredient functions,
and yield/conversion; adequate coverage for substitution, portioning, storage, nutrient/quality effects,
special-diet adaptation, and recipe nutritional analysis; and partial coverage for true batch preparation.

### 11.1 Mapping and residual gaps

- `DEC-067`: supported by standardized recipes, ingredient roles, methods, yields, portions, and variations.
- `DEC-068`: supported by mise en place, prep lists, food-specific preparation, cooking methods, and
  preparation effects on food quality; no nutrition target rule is inferred from culinary technique.
- `DEC-069`: recipe scaling, yield/portion conversion, storage, and preservation are supported; true
  quantity-food batch production remains partial.
- `DEC-060`–`DEC-063`: culinary support is adequate for serving translation, restrictions, portions, and
  functional substitutions; core nutrition and product safeguards remain authoritative.
- `DEC-065`–`DEC-075`: purchasing, edible yield, storage, safety, waste, and execution evidence is partial
  to adequate; shopping consolidation, pantry state, deviation policy, and UX remain translation/product
  logic.

The original gap is **partially closed at the knowledge layer**: recipe construction, preparation/cooking,
modification/substitution, scaling, storage, and practical food safety now have direct source support.
Batch-production depth remains a bounded scope limitation, and quantitative nutrient accounting requires
authoritative Grocery nutrition data rather than culinary prose. No additional source is recommended now;
no new decision ID was created, no stable ID or seven-book baseline was changed, and no Phase 9 code or
schema work began.

### 11.2 Does the residual batch-production gap require a new gate?

Gate 6 §10's standing instruction: _"If source inspection reveals a potentially consequential scope
decision, stop and create another review gate rather than silently deciding it."_ Applied here rather than
assumed:

- **The limitation was not revealed by inspection — it was anticipated before the book was acquired.**
  `CULINARY_SOURCE_EXTENSION.md` §4.1 named "true batch-production knowledge" as the selected source's
  weakest capability _before inspection began_, and flagged that if `DEC-068`/`069` turned out to need it,
  "that is a new scope decision and a new gate." Inspection **confirmed** the anticipated limitation; it
  did not surface a new one.
- **Whether `DEC-068`/`069` actually _need_ full quantity-food batch production is not established by this
  document, and is not decided here either.** What is established: the corpus supports recipe scaling,
  yield/portion conversion, and storage/preservation — which covers most of what those decisions require.
  A genuine v1 requirement for restaurant-scale batch production would be a Phase 9 product question first
  (does Grocery's v1 need it at all?) before it could be a Phase 8 knowledge question again.
- **Conclusion: no new gate opens on this basis.** The gap is real, named, bounded, and was pre-declared —
  not a surprise consequential decision. It is recorded as a residual limitation for Phase 9 to weigh, not
  escalated as an open architectural question. If Phase 9 determines batch production is load-bearing for
  v1, **that** determination is what would warrant a gate — not this inspection's confirmation of a
  limitation already on record.

**Phase 8 is CLOSED as of 2026-09-07.** Step 12's closure audit is recorded in §10 above. Phase 9
(Application/Product Architecture) is the next authorized phase; no work on it has begun.
