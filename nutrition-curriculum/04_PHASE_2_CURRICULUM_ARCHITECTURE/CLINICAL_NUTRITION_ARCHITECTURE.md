# Clinical Nutrition Architecture

How KM16's 27 CLIN topics (plus its contributions to ASSESS, LIFE, PUBHEALTH, FLU, and SPECIAL) connect to the rest of the curriculum, without letting the clinical branch — by far the largest single domain in the topic universe (27 of 142 Level-1 topics, 19% of the whole set) — dominate the core nutrition sequence the way its sheer chapter count might otherwise suggest.

---

## The Six-Layer Separation

Per Task 6's instruction, clinical content is separated into six layers rather than treated as one monolithic "clinical nutrition" block. Each layer already exists as distinct topics in `MASTER_TOPIC_UNIVERSE.md`; this file just makes the layering explicit and shows how each layer connects outward.

### Layer 1 — Foundational Knowledge (not itself CLIN, but everything CLIN depends on)

Per `LEARNING_DEPENDENCY_GRAPH.md` Chain 6, CLIN-01 (and everything downstream of it) ultimately traces back through the ASSESS cluster to the full MET/CHO/LIP/PRO/VIT/MIN/GI/BODY foundation. This layer is **not part of the clinical branch at all** — it's the shared core every other applied branch (SPORT, LIFE, PUBHEALTH) also draws from. The point of naming it explicitly here is to make clear that clinical nutrition does not need its own separate biochemistry/physiology track — it reuses the one core track everyone else uses.

### Layer 2 — Assessment

`ASSESS-01` through `ASSESS-06` (dietary intake, biochemical/lab, anthropometric, physical exam, screening/NCP, functional/inflammation biomarkers). Per `TOPIC_PREREQUISITES.md`, this is the direct, REQUIRED prerequisite to CLIN-01. Assessment is deliberately **not classified as CLIN** in the taxonomy — it's a separate domain precisely because its methods apply equally to sport nutrition, public health surveillance, and research (see `TOPIC_OVERLAPS.md` #9, ASSESS↔RESEARCH-04 complementarity). Keeping Assessment as its own layer, rather than folding it into CLIN, is what stops the clinical branch from swallowing a genuinely cross-cutting skill set.

### Layer 3 — Nutrition Care Process (the CLIN entry point)

`CLIN-01` alone: Principles of Medical Nutrition Therapy and the Nutrition Care Process. This is the single node every other CLIN topic depends on (`LEARNING_DEPENDENCY_GRAPH.md`'s busiest merge point). Architecturally, this is the layer that actually marks "you are now in the clinical branch" — everything before it (Layers 1–2) is shared core content.

### Layer 4 — Clinical Application (cross-cutting clinical skills, not disease-specific)

`CLIN-02` (Nutrition Support: Enteral/Parenteral), `CLIN-26` (Inflammation/Chronic Disease Pathophysiology — general framework), `SPECIAL-02` (Complementary/Integrative Medicine, general), `SPECIAL-03` (Counseling/Behavioral Change), `SPECIAL-04` (Cultural Competency). These are skills/frameworks a clinical practitioner needs *before* specializing into any single disease area — none of them is disease-specific, all of them recur across many of the Layer 5 disease chapters (per `TOPIC_PREREQUISITES.md`'s CLIN-26 entry, which notes it recurs conceptually across CLIN-07/10/17).

### Layer 5 — Disease-Specific Material (the bulk of KM16's actual chapter count)

`CLIN-03` through `CLIN-25` and `CLIN-27` (23 topics) — the organ-system-organized disease chapters (GI, endocrine, cardiovascular, renal, oncologic, infectious, neurologic, psychiatric, developmental, etc.), grouped exactly as shown in `CURRICULUM_ARCHITECTURE.md`'s 8-cluster diagram. This is where the "27 topics" count mostly lives, but it's also the layer most naturally suited to **elective/selective depth** rather than universal required teaching — see the role assignment below.

### Layer 6 — Specialized Clinical Topics (narrowest audience)

The subset of Layer 5 already classified SPECIALIZED in `TOPIC_LEARNING_LEVELS.md`: `CLIN-15` (HIV/AIDS), `CLIN-16` (Critical Care), `CLIN-17` (Rheumatic/Musculoskeletal), `CLIN-18` (Neurologic), `CLIN-19` (Psychiatric/Cognitive), `CLIN-21` (LBW/Neonatal), `CLIN-22` (Genetic Metabolic Disorders), `CLIN-23` (Intellectual/Developmental Disabilities), `CLIN-25` (Oral/Dental), `CLIN-27` (Transgender Care) — 10 of the 27 CLIN topics. These address specific practice sub-specialties rather than general clinical competency, and are the strongest candidates for elective/reference-only status (see `CANDIDATE_EXCLUSIONS.md`).

---

## How This Prevents Clinical Dominance of the Core Sequence

The six-layer separation directly addresses Task 6's warning by construction, not by arbitrary trimming:

1. **Layers 1–2 are shared, not clinical-specific.** A curriculum built on any of the four `CURRICULUM_SPINE_CANDIDATES.md` architectures already teaches MET/CHO/LIP/PRO/VIT/MIN/GI/BODY and ASSESS as core content regardless of whether a student ever proceeds into CLIN — these layers do double duty for SPORT, LIFE, PUBHEALTH, and RESEARCH-adjacent tracks too. Clinical nutrition doesn't get its own separate 80-topic foundation; it reuses the ~50-topic foundation everyone shares.
2. **Layer 3 is a single node**, not a sprawling unit — "the Nutrition Care Process" is one topic, easy to teach once, not diluted across 27 chapters.
3. **Layer 5's 23 disease-specific topics are structurally separable** from the required core — nothing else in the topic universe has a REQUIRED dependency running *from* another domain *into* a Layer 5 disease topic (checked against all 86 edges in `TOPIC_PREREQUISITES.md`: every edge into Layer 5 originates either from Layer 1–4 or from another Layer 5 topic, never the reverse). This means Layer 5 can be taught as a bounded "clinical specialization" block appended after the core, without the core curriculum needing to reference deep into it.
4. **Layer 6's 10 SPECIALIZED topics are explicit elective candidates** — see `CANDIDATE_EXCLUSIONS.md` for the formal reference-only/optional designation.

## Connection Diagram

```
[Layer 1: Shared Foundation — MET/CHO/LIP/PRO/VIT/MIN/GI/BODY]
                    │
                    ▼
[Layer 2: ASSESS-01 through ASSESS-06]  ◄── also feeds SPORT, RESEARCH-04, PUBHEALTH-02
                    │
                    ▼
[Layer 3: CLIN-01 — Nutrition Care Process]   ◄── the sole clinical-branch entry point
                    │
                    ▼
[Layer 4: CLIN-02, CLIN-26, SPECIAL-02/03/04]  ── cross-cutting clinical skills
                    │
                    ▼
[Layer 5: CLIN-03 through CLIN-25, CLIN-27 (23 topics)]  ── disease-specific, organ-system grouped
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
[13 "general practice"    [10 SPECIALIZED topics
 topics — broadly           = Layer 6, elective/
 relevant disease areas]    reference candidates]
```

## Relationship to LIFE, FLU, PUBHEALTH (KM16's Other Contributions)

KM16 doesn't only supply CLIN — it's also the sole source for all of LIFE (8 topics), a full FLU chapter (Ch.3, feeding FLU-01/02/03), and all of PUBHEALTH (6 topics, Ch.8). These are **not folded into the clinical branch** in this architecture — LIFE sits alongside CLIN as its own applied domain (a person's life stage is not a disease), FLU sits inside the shared Layer-1 foundation (fluid/electrolyte physiology is general, not clinical-specific), and PUBHEALTH sits alongside SPORT/CLIN/LIFE as its own applied branch. This is consistent with `CURRICULUM_ARCHITECTURE.md`'s domain structure and avoids inflating the "clinical" branch with content that happens to come from the same book but isn't actually disease-focused.

## What Remains a Human Decision

- How much of Layer 5's 23 topics should be **required** vs. **elective** for a general nutrition curriculum (as opposed to a clinical-dietetics-track curriculum) — this is fundamentally a question about the curriculum's target audience and credential, not resolvable from the topic universe alone. Carried to `PHASE_2_HUMAN_REVIEW.md`.
- Whether Layer 4's cross-cutting skills (counseling, cultural competency, complementary medicine) should be taught once, early, and referenced throughout Layer 5 (efficient, but requires strong forward-referencing design) or repeated/reinforced within each Layer 5 disease chapter (matches KM16's own repeated "Complementary and Integrative Approaches" subsections per chapter, per `MASTER_TOPIC_UNIVERSE.md`'s SPECIAL-02 provenance, but is more repetitive). Not resolved here.
