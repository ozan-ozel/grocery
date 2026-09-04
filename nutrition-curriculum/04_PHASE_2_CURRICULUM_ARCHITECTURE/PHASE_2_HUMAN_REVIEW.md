# Phase 2 Human Review

Every decision in this file is explicitly **not resolved** by Phase 2 — each is restated with whatever new context Phase 2's architecture work adds, but the actual choice remains a human curriculum-design decision. Nothing here should be read as a recommendation to adopt one option over another; where Phase 2 files lean toward naming a "best-supported" option (e.g., Sport Nutrition Architecture's Option C), that lean is repeated here for visibility, not converted into a decision.

---

## Carried Forward from Phase 1 (5 Required Items)

### 1. AS3 / ACSM / SN4 Architecture

**Phase 1 status:** Open (`PHASE_1_AMBIGUITY_AUDIT.md`, paired items 2b + 9f) — whether to consolidate into one spine or keep three reinforcing passes.

**What Phase 2 added:** `SPORT_NUTRITION_ARCHITECTURE.md` built a topic-by-topic role table across all 13 SPORT topics and found the honest answer is neither pure option — 5 of 13 topics are effectively SN4-only (no real reinforcement candidate exists), 1 topic (SPORT-04, sport-specific strategies) is uniquely AS3-primary, and only 2 of 13 (Travel/Altitude/Heat, and Supplements as a foundation-to-depth progression) show a genuinely strong case for the three-book reinforcement model. This refines, rather than resolves, the question: **the decision may not need to be made uniformly across the whole SPORT domain** — a topic-by-topic posture (Sport Architecture's "Option C") is the best-supported reading of the evidence, but adopting it, versus simplifying to one uniform posture for ease of implementation, is still a human call.

**Still open:** Which posture (uniform spine, uniform three-pass, or topic-by-topic) to adopt.

### 2. Number and Structure of Energy-Balance/Body-Composition Units

**Phase 1 status:** Open (`PHASE_1_AMBIGUITY_AUDIT.md` item 3b).

**What Phase 2 added:** `PROGRESSIVE_REINFORCEMENT.md` examined this topic specifically and found it MIXED — the methods-vs-mechanism-vs-clinical-vs-applied split (NRM/HM4/KM16/Bender3 vs. sport books) is genuinely progressive, but the three-way sport-book overlap (SN4/ACSM/AS3, all combining body composition with weight management) is unresolved from TOC evidence alone, mirroring the same uncertainty found in the hydration and carbohydrate topics.

**Still open:** How many independent teaching units to build (a minimum of 2 — one mechanistic/clinical, one sport-applied — is well-supported; whether the sport-applied unit itself needs to be 1 or 3 sub-units is not).

### 3. Bender3 → Human Metabolism 4E Sequencing

**Phase 1 status:** Open (`PHASE_1_AMBIGUITY_AUDIT.md` item 9e).

**What Phase 2 added:** `CURRICULUM_SPINE_CANDIDATES.md` found this decision's stakes vary sharply by which overall spine architecture is chosen — it's "low relevance" under Nutrition-First (Option A) and Integrated Systems (Option C), because both fragment or interleave MET content anyway, but "high relevance" under Metabolism-First (Option B) and the Hybrid (Option D), where MET forms one clean, bounded block and Bender3's role (prerequisite bridge vs. parallel alternative track vs. not used at all) directly shapes that block's internal structure.

**Still open:** The original question, now explicitly coupled to the separate (also-open) spine-architecture decision — resolving #3 may need to wait until a spine candidate is chosen, or the two could be decided together.

### 4. Nutrigenomics: Research ↔ Clinical Bridge

**Phase 1 status:** Open (`PHASE_1_AMBIGUITY_AUDIT.md` item 9c) — whether to build a module connecting NRM's research-methods framing (RESEARCH-12) to KM16's clinical framing (SPECIAL-01).

**What Phase 2 added:** `LEARNING_DEPENDENCY_GRAPH.md` confirmed this is the *only* point of contact between the entire RESEARCH domain and the entire CLIN domain in the whole 86-edge graph — making it a structurally small but conceptually significant decision. `CANDIDATE_EXCLUSIONS.md` separately proposed both RESEARCH-12 and SPECIAL-01 as ELECTIVE-track content (paired with SPORT-11 and the other omics-adjacent topics), which would make the bridge-building question relevant only to students opting into that elective track rather than to the general curriculum.

**Still open:** Whether to build the bridge at all, and if the elective-track framing from `CANDIDATE_EXCLUSIONS.md` is adopted, whether that changes the bridge's priority (lower-stakes if only elective-track students ever reach it).

### 5. Single-Source Dependency of RESEARCH / LIFE / Most of CLIN

**Phase 1 status:** Open (`PHASE_1_AMBIGUITY_AUDIT.md` item 9g) — is 100%-single-book dependency in these domains acceptable as a curriculum foundation?

**What Phase 2 added:** `LEARNING_DEPENDENCY_GRAPH.md` found RESEARCH and LIFE are not merely single-source but also *structurally isolated* in the dependency graph (near-islands with minimal cross-domain edges) — a related but distinct finding from single-sourcing itself, worth weighing separately. `RESEARCH_ARCHITECTURE.md` explicitly restated this decision as unresolved by any of its four placement options — "a curriculum could adopt [any option's] careful internal tiering and still be entirely dependent on one 2015 textbook for all of it." `CLINICAL_NUTRITION_ARCHITECTURE.md` showed that CLIN's single-sourcing is more containable than RESEARCH's/LIFE's, because CLIN's Layer 1–2 foundation is shared with every other domain — the single-source risk in CLIN is really concentrated in Layer 5's 23 disease-specific topics, not the domain's entry points.

**Still open:** The original acceptability question, now informed by the finding that RESEARCH/LIFE's isolation is structural as well as bibliographic, while CLIN's risk is more narrowly scoped to its disease-specific layer.

---

## New Human Decisions Discovered During Phase 2

### 6. Curriculum Spine Architecture Selection (A/B/C/D)

`CURRICULUM_SPINE_CANDIDATES.md` developed four full architectures (Nutrition-First, Metabolism-First, Integrated Systems, Hybrid) and explicitly selected none. This is the single largest new open decision Phase 2 surfaced — every other file in this phase (Sport, Clinical, Research architectures) is written to be compatible with any of the four, but the actual curriculum cannot be built until one is chosen (or a deliberate hybrid of the four is designed).

### 7. Depth of Required vs. Elective Clinical Content (Layer 5)

`CLINICAL_NUTRITION_ARCHITECTURE.md` separated KM16's 23 non-specialized disease-specific topics (Layer 5) from its 10 SPECIALIZED topics (Layer 6, already proposed as elective in `CANDIDATE_EXCLUSIONS.md`) — but did not decide how much of Layer 5 itself should be required for a general nutrition curriculum versus reserved for a clinical-dietetics track. This is a scope/audience decision: a general-education nutrition curriculum and a pre-professional dietetics curriculum would reasonably draw the Layer-5 line in very different places.

### 8. Teach-Once vs. Repeat-Per-Chapter for Clinical Cross-Cutting Skills (Layer 4)

`CLINICAL_NUTRITION_ARCHITECTURE.md` noted KM16 itself repeats "Complementary and Integrative Approaches" as a subsection within many individual disease chapters, rather than teaching it once centrally — raising a real design choice between efficiency (teach Layer 4 skills once, reference throughout Layer 5) and fidelity to how the source material naturally reinforces those skills chapter by chapter.

### 9. Research Domain Placement (Options A/B/C/D)

`RESEARCH_ARCHITECTURE.md` developed four placement options for the RESEARCH domain (parallel track, early+reinforcement, post-foundation block, hybrid) and explicitly selected none — a decision separate from, but related to, carried-forward item #5 above (the acceptability question) and item #4 (the nutrigenomics bridge, which most naturally attaches wherever RESEARCH-11/12 end up sitting).

### 10. AS3-vs-ACSM Potential Redundancy for Supplements (New Finding, Not Previously Flagged)

`PROGRESSIVE_REINFORCEMENT.md` surfaced a comparison not previously identified in either Phase 1 or the rest of Phase 2: AS3's single "Ergogenic Aids" chapter and ACSM's single "Dietary Supplements...Myths and Realities" chapter may restate rather than complement each other (both undifferentiated, similar apparent scope), independent of their shared FOUNDATION role relative to SN4's much deeper treatment. This is new information for decision #1 above, not a separate issue, but is called out on its own because it wasn't visible in `SPORT_NUTRITION_ARCHITECTURE.md`'s own role table (which grouped AS3 and ACSM together as co-equal FOUNDATION sources for SPORT-05 without checking whether they duplicate each other).

### 11. Formal Adoption of the CANDIDATE_EXCLUSIONS Designations

`CANDIDATE_EXCLUSIONS.md` proposed REFERENCE-ONLY/OPTIONAL/ELECTIVE/OUTSIDE-CORE-PATHWAY roles for roughly 30 topics but explicitly stated these are "proposed roles, not decisions." Whether Phase 3 treats these proposals as a starting default (adjust only where disagreed) or as one input among several (re-derive independently) is itself a decision affecting how much Phase 3 work is required.

### 12. Whether LIFE-05 (Adulthood) Warrants a Dedicated Unit

Newly surfaced in `CANDIDATE_EXCLUSIONS.md`'s OPTIONAL list — flagged as the weakest of the six LIFE life-stage topics for dedicated teaching time, since its content likely substantially overlaps general NUT/BODY content already taught elsewhere in the curriculum. Not previously identified as a question in Phase 1.

---

## Structural Contradictions Discovered

One genuine internal tension was found between two Phase 2 files, surfaced here rather than silently smoothed over:

**`SPORT_NUTRITION_ARCHITECTURE.md` treats AS3 and ACSM as co-equal, complementary FOUNDATION-tier sources for SPORT-05 (Supplements)** — implying their content, while each shallower than SN4's, is not assumed to duplicate *each other*. **`PROGRESSIVE_REINFORCEMENT.md`, examining the same two books' supplement chapters independently, flags them as the topic's "strongest FLAT-risk pair"** — i.e., plausibly the two books saying much the same undifferentiated thing rather than two independently valuable foundation passes. These two Phase 2 files were built from the same underlying TOC evidence but reached subtly different framings of that one relationship, because `SPORT_NUTRITION_ARCHITECTURE.md`'s role table was built around SN4 as the depth benchmark (making AS3/ACSM look similarly "shallow, therefore complementary FOUNDATION"), while `PROGRESSIVE_REINFORCEMENT.md`'s pairwise-comparison method treated AS3-vs-ACSM directly rather than each-vs-SN4. **Neither framing is wrong; they answer different questions** (their-role-relative-to-SN4 vs. their-content-relative-to-each-other), but a reader consulting only one of the two files could reach a different conclusion about whether AS3 and ACSM's supplement chapters are redundant with each other. Flagged as decision item #10 above; not resolved.

No other direct contradiction (as opposed to open/unresolved question) was found across the ten Phase 2 files or against the seven Phase 1 files — checked specifically for: conflicting topic-level classifications (none — `TOPIC_LEARNING_LEVELS.md`'s levels are used consistently everywhere they're referenced), conflicting dependency claims (none — `TOPIC_PREREQUISITES.md`'s 86 edges are used consistently in `LEARNING_DEPENDENCY_GRAPH.md`, `CURRICULUM_SPINE_CANDIDATES.md`, and `CLINICAL_NUTRITION_ARCHITECTURE.md` without alteration), and conflicting coverage claims (none — all P/S/M/— ratings trace back to the single `BOOK_TOPIC_COVERAGE.md` matrix without being re-derived differently elsewhere).

---

## Deferred Items Restated (Not Resolved, Not Newly Closed)

Per the task's explicit instruction, these remain exactly as classified in `PHASE_1_AMBIGUITY_AUDIT.md` — Phase 2's architecture work did not touch, re-open, or attempt to resolve any of them from memory or general knowledge:

**Requires book-content inspection (deferred):**
- Gut microbiome actual depth (13 flagged subsections across NRM/SN4/KM16)
- Caffeine actual depth (SN4 Ch.11 subsection, KM16 App.25)
- Alcohol actual depth (SN4 Ch.1 subsection, ~7 scattered KM16 mentions)
- KM16's "Doping In Sport" subsection (Ch.23)

**Requires current scientific/clinical evidence (deferred):**
- COVID-19 material across KM16's 5 chapters (7 TOC headings)
- GLP-1 receptor agonists (KM16 Ch.30)
- Continuous glucose monitoring (KM16 Ch.30)
- SN4's personalized/genomic-nutrition chapter (Ch.17)

None of these eight items were treated as confirmed curriculum gaps anywhere in Phase 2's ten files, and none was resolved using general/background knowledge.
