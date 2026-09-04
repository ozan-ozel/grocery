# Curriculum Spine Candidates

Four plausible high-level curriculum architectures built from the topic universe, prerequisite graph, and learning levels established so far. **None is selected here** — this file lays out the tradeoffs for each so a human can choose (or hybridize) in a later phase. All four use the same 213 topic IDs; they differ only in sequencing and grouping logic.

---

## A. Nutrition-First

**Sequencing logic:** NUT → CHO/LIP/PRO/VIT/MIN/FLU (nutrient-by-nutrient, each including basic chemistry through dietary recommendations) → DRV → GI → BODY/ASSESS → then branch into SPORT / CLIN / LIFE / PUBHEALTH as applied tracks, with RESEARCH and SPECIAL as electives.

**Rationale:** Mirrors how most introductory nutrition courses and three of the seven source books (SN4, ACSM, and to a lesser extent AS3) are actually organized — nutrient-first, mechanism-second.

| Dimension | Assessment |
|---|---|
| Prerequisite coherence | **Strong** — matches `TOPIC_PREREQUISITES.md` closely for the macronutrient/micronutrient chains (Chain 2/3), since digestion→absorption→metabolism naturally precedes deep biochemistry. |
| Cognitive load | **Moderate.** Students meet "how carbohydrate is metabolized" before "what a metabolic pathway even is" (MET-02) — this reorders Chain 1's REQUIRED direction (MET-02 → CHO-03), so mechanism has to be taught piecemeal, nutrient by nutrient, rather than once. |
| Redundancy | **Higher.** Enzyme/pathway concepts (MET-02) would need re-teaching (or at least re-referencing) inside CHO-03, LIP-03, and PRO-03 separately rather than once upfront. |
| Integration potential | **Weaker for MET domain**, since MET-04 through MET-10 (regulation, organ-specific, integration) don't have an obvious home until after all three macronutrients are covered — risks becoming a bolted-on "advanced metabolism" unit at the end rather than a true integration layer. |
| Suitability for self-study | **High** — nutrient-by-nutrient chapters are easy to consume independently and match how students already think about food ("what does carbs do"). |
| Suitability for advanced nutrition education | **Lower** — advanced students/practitioners typically need the regulatory/mechanistic depth (HM4-level) integrated throughout, not deferred. |
| Relationship to the 7 books | Closely matches **SN4** and **ACSM**'s own chapter sequences; would use **HM4/Bender3** content as inserted "mechanism" call-outs within each nutrient unit rather than as their own coherent arc — this fragments HM4's carefully-built 12-chapter regulatory narrative (`BOOK_ROLES.md`). |

---

## B. Metabolism-First

**Sequencing logic:** MET (the full 10-topic biochemistry spine, MET-01 through MET-10) → GI → CHO/LIP/PRO (now taught as applications of already-known pathways) → VIT/MIN/FLU → BODY/ASSESS/DRV → SPORT/CLIN/LIFE/PUBHEALTH branches → RESEARCH/SPECIAL as electives.

**Rationale:** Follows `TOPIC_PREREQUISITES.md`'s Chain 1 exactly as written — mechanism before application, matching HM4's own internal structure and Bender3's teach-from-scratch biochemistry arc.

| Dimension | Assessment |
|---|---|
| Prerequisite coherence | **Strongest of the four** — this is literally the order `LEARNING_DEPENDENCY_GRAPH.md`'s Chain 1 → Chain 2 → Chain 4 already implies; every REQUIRED edge points forward, none backward. |
| Cognitive load | **High up front, low later.** Students face MET-01 through MET-03 (chemistry, enzymes, ATP) before ever discussing food — a real risk of losing non-biochemistry-inclined students in the first unit, before any nutrition "payoff." Once past MET-06/07, cognitive load drops sharply since every later domain is now an application of known mechanism. |
| Redundancy | **Lowest of the four** — enzyme/pathway/regulation concepts are taught exactly once (in MET) and referenced, not re-taught, everywhere downstream. |
| Integration potential | **Highest** — MET's own internal integration topics (MET-07 "Integration in Daily Life," MET-08 "Metabolic Adaptation") become the natural bridge into BODY, SPORT, and CLIN rather than an afterthought. |
| Suitability for self-study | **Lower** — a self-directed learner is less likely to persist through 3–4 units of pure biochemistry before reaching anything that feels like "nutrition," especially without an instructor to sustain motivation through the front-loaded difficulty. |
| Suitability for advanced nutrition education | **Highest** — this is essentially how a physiology/biochemistry-heavy program (e.g., pre-clinical or research-track) would sequence itself, and it's the only architecture where HM4's four-level regulatory hierarchy survives intact as a teaching unit. |
| Relationship to the 7 books | Directly mirrors **HM4**'s own chapter order; **Bender3** could serve as either a parallel easier track or a prerequisite bridge (per the still-open Phase 1 human decision on Bender3→HM4 sequencing — not resolved by choosing this architecture, only made more directly relevant to it). |

---

## C. Integrated Systems Approach

**Sequencing logic:** Organize not by nutrient-vs-mechanism but by **physiological system**: (1) Ingestion & Digestion [NUT+GI], (2) Fuel Metabolism [MET+CHO+LIP+PRO taught together, substrate by substrate but with mechanism woven in at each step rather than front- or back-loaded], (3) Micronutrients & Fluid Homeostasis [VIT+MIN+FLU], (4) Energy Regulation & Body Composition [BODY+ASSESS], then the same four applied branches (SPORT/CLIN/LIFE/PUBHEALTH) plus RESEARCH/SPECIAL as electives.

**Rationale:** Avoids both A's fragmentation of mechanism and B's front-loaded biochemistry wall, by interleaving "what it is" and "what it does" within each fuel-substrate unit rather than sequencing them as two separate eras of the course.

| Dimension | Assessment |
|---|---|
| Prerequisite coherence | **Good, with caveats.** Interleaving CHO-02→CHO-03 with MET-02 concepts *as needed* respects the REQUIRED edges locally, but MET-04 through MET-10 (cellular regulation, whole-body coordination, organ-specific metabolism) don't map cleanly onto any single "fuel substrate" unit — they're inherently cross-substrate topics, so this architecture has to either split them across three units (redundant) or still carve out a dedicated "integration" unit anyway (partially reproducing B). |
| Cognitive load | **Most balanced of the four** — no single unit is a pure-mechanism wall or a pure-application wall; each unit pairs a manageable amount of new mechanism with an immediate, motivating nutritional payoff. |
| Redundancy | **Moderate** — better than A (mechanism isn't re-taught three separate times from scratch) but worse than B (some repetition is inherent to interleaving, e.g. reintroducing "substrate cycling" concepts each time a new fuel is discussed). |
| Integration potential | **Strong**, by design — this architecture's entire premise is integration; the risk is that it under-serves depth in either direction (neither as deep in mechanism as B nor as directly nutrient-practical as A). |
| Suitability for self-study | **Moderate** — better narrative flow than B, but the interleaving requires more careful instructional design (or a strong textbook doing the interleaving *for* the student) than either A or B, which are each closer to how an existing single book is already organized. |
| Suitability for advanced nutrition education | **Good** — this is close to how an integrative physiology course (rather than a straight biochemistry or straight applied-nutrition course) would be built, and would probably serve a mixed-background cohort better than A or B alone. |
| Relationship to the 7 books | **No single source book matches this shape** — it would require actively synthesizing HM4/Bender3 (mechanism) with SN4/ACSM/AS3 (application) unit by unit rather than following any one book's table of contents. This is the architecture most likely to require original synthesis work beyond what any one book provides, though still built entirely from the existing topic universe (no new topics, per Task instructions). |

---

## D. Hybrid: Nutrition → Metabolism → Application

**Sequencing logic:** (1) NUT + basic macronutrient/micronutrient *classification and chemistry only* (CHO-01, LIP-01, PRO-01, VIT-01/02, MIN-01/02 — the FOUNDATION-level topics only) → (2) the full MET spine (MET-01 through MET-10) plus the metabolism-level topics for each nutrient (CHO-02/03, LIP-02/03, PRO-02/03) taught together as "how the body handles what you just classified" → (3) GI, BODY, ASSESS, DRV as the "measurement and regulation" layer → (4) the four applied branches (SPORT/CLIN/LIFE/PUBHEALTH) → (5) RESEARCH/SPECIAL as a parallel or elective track throughout.

**Rationale:** A three-act structure — *what nutrients are* → *what the body does with them* → *how that knowledge is applied* — that gives students an early, low-cognitive-load orientation pass (unlike B) before committing to the deep mechanism unit (unlike A, which never really commits to one), then reserves application entirely for act three.

| Dimension | Assessment |
|---|---|
| Prerequisite coherence | **Very strong** — this is the only architecture that fully respects both Chain 1 (MET's internal REQUIRED sequence, taught intact as one block) *and* avoids A's problem of needing MET-02 before every single nutrient unit, by doing the FOUNDATION-level nutrient content first and deferring all metabolism (INTERMEDIATE/ADVANCED-level CHO/LIP/PRO topics) to act two. |
| Cognitive load | **Well-managed** — act one is low-difficulty orientation (classification, no mechanism yet); act two concentrates difficulty into one clearly-bounded "metabolism" era; act three returns to lower-difficulty applied content. This is a more gradual ramp than B (which front-loads all difficulty) and more contained than A (which spreads mechanism-difficulty across the whole course unpredictably). |
| Redundancy | **Low** — similar to B, mechanism is taught once, in act two, and referenced afterward. |
| Integration potential | **Strong** — act two's structure (MET spine + all three nutrient-metabolism topics together) is essentially Chain 1 + Chain 2 exactly as `LEARNING_DEPENDENCY_GRAPH.md` shows them, preserving the natural merge point at BODY-01 going into act three. |
| Suitability for self-study | **Good** — the three-act framing gives self-directed learners clear "where am I in the course" orientation, and act one's gentler on-ramp addresses B's biggest weakness for this audience. |
| Suitability for advanced nutrition education | **Good** — act two still delivers HM4-level depth intact (unlike A), just with a gentler runway into it (unlike B). |
| Relationship to the 7 books | The closest of the four to a genuine **synthesis** of the set: act one draws lightly from all of SN4/ACSM/AS3/Bender3's opening nutrient-overview material, act two is essentially HM4 (with Bender3 as a possible parallel/prerequisite track — again, that Phase 1 decision resurfaces here, made *more* natural to resolve by this architecture's clean act-two boundary), and act three distributes SPORT/CLIN/LIFE/PUBHEALTH exactly as their own book structures already do. |

---

## Comparison at a Glance

| Dimension | A. Nutrition-First | B. Metabolism-First | C. Integrated Systems | D. Hybrid |
|---|---|---|---|---|
| Prerequisite coherence | Moderate | Strongest | Good, with caveats | Very strong |
| Cognitive load shape | Spread, unpredictable | Front-loaded, heavy | Balanced throughout | Ramped (low→high→low) |
| Redundancy | Higher | Lowest | Moderate | Low |
| Integration potential | Weaker | Highest | Strong (by design) | Strong |
| Self-study suitability | High | Lower | Moderate | Good |
| Advanced-education suitability | Lower | Highest | Good | Good |
| Closest single-book match | SN4 / ACSM | HM4 | None (requires synthesis) | None (requires synthesis, but modest) |
| Bender3→HM4 decision relevance | Low (both fragmented either way) | High (directly determines act-two structure) | Low | High (act-two boundary makes this decision cleaner) |

## What Is *Not* Decided Here

Per Task 4's explicit instruction, no architecture is selected. Also not decided by this file:
- Where RESEARCH and SPECIAL sit relative to the four applied branches in any architecture (shown above only as "parallel/elective," which is itself a placeholder pending the Phase 1 human decision on RESEARCH's single-source dependency, item 5 in `PHASE_2_HUMAN_REVIEW.md`).
- Whether SPORT should be one unified applied branch or three separate book-based passes (AS3/ACSM/SN4) — see `SPORT_NUTRITION_ARCHITECTURE.md`.
- How deeply CLIN should be integrated versus kept as a late, optional capstone — see `CLINICAL_NUTRITION_ARCHITECTURE.md`.
