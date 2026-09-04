# Learning Dependency Graph

Major learning pathways constructed from `TOPIC_PREREQUISITES.md`'s 86 relationships. This is a readable map of the *shape* of the dependency structure, not an exhaustive edge list (see that file for every individual relationship) and not a teaching sequence (see `CURRICULUM_SPINE_CANDIDATES.md` for that). Chains use `→` for REQUIRED/STRONGLY_RECOMMENDED links and `┄›` for HELPFUL/soft links. Where a chain forks or merges, that's shown explicitly — the real structure is a directed graph, not a line, and several chains reconverge deliberately (marked "MERGE POINT").

---

## Chain 1 — The Biochemistry Spine (MET core)

```
NUT-02 (Nutrients: classification)
   ↓
MET-01 (Basic biochemistry) → MET-02 (Enzymes/pathways) → MET-03 (ATP/energy transduction)
   ↓
MET-04 (Cellular/molecular regulation) → MET-05 (Whole-body coordination) → MET-06 (Organ-specific metabolism)
   ↓
MET-07 (Integration in daily life) → MET-08 (Metabolic adaptation to challenges)
   ↓                                      ↓
MET-10 (Diabetes as regulatory disorder)  MET-09 (Lipoprotein/atherosclerosis) ←── LIP-03
```

This is the longest unbroken REQUIRED chain in the whole graph (7 links deep, MET-01 through MET-08) and is the backbone every other chain eventually attaches to. HM4 supplies nearly this entire chain in one book; Bender3 supplies a shallower parallel version of MET-01 through MET-03 (see `BOOK_ROLES.md`).

## Chain 2 — Macronutrient Triad (parallel structure, CHO / LIP / PRO)

```
GI-01 (GI anatomy/regulation)
   ↓
   ├── CHO-02 (CHO digestion/absorption) → CHO-03 (CHO metabolism) → CHO-05 (CHO + exercise)
   ├── LIP-02 (Fat digestion/absorption)  → LIP-03 (Lipid metabolism) → LIP-06 (Fat as fuel, exercise)
   │                                                    ↓
   │                                          LIP-04 (Lipoprotein/atherosclerosis) [MERGE POINT with MET-09]
   └── PRO-02 (Protein digestion/absorption) → PRO-03 (Protein metabolism) → PRO-06 (Protein + exercise)
                                                    ↓
                                          PRO-04 (Protein requirements) → PRO-05 (Protein-energy malnutrition)

   [all three feed]  ↓
              MET-02 (Enzymes/pathways) ┄› [required input to CHO-03/LIP-03/PRO-03 — see Chain 1]
              SPORT-03 (Nutrient/fluid timing) [MERGE POINT — see Chain 5]
```

Structurally identical three-lane highway: digest → absorb → metabolize → apply-to-exercise, for each macronutrient independently, all three lanes requiring MET-02 as an on-ramp and all three feeding into SPORT-03 downstream. This parallelism is a direct, faithful reflection of how HM4/Bender3/SN4 each organize their own macronutrient chapters (see provenance in `MASTER_TOPIC_UNIVERSE.md`).

## Chain 3 — Micronutrients and Fluid Balance (shorter, largely independent lanes)

```
NUT-02 → VIT-01/VIT-02 (Vitamins) ──┐
NUT-02 → MIN-01/MIN-02 (Minerals) ──┤
                                     ├→ DRV-01 (DRI methodology) → VIT-03/MIN-03 (Requirements/assessment) → VIT-04/MIN-04 (Athletic performance)
FLU-01 → FLU-02 → FLU-03 (Acid-base) ┘
   ↓
FLU-04 (Hydration + exercise) → FLU-05 (Heat/electrolyte disorders)
```

Micronutrients and fluid balance both terminate in an athletic-performance branch (VIT-04/MIN-04/FLU-04-05) but otherwise don't depend on the macronutrient chains (Chain 2) or the biochemistry spine (Chain 1) — they're taught largely in parallel, joining the rest of the graph only at DRV-01 (which itself has no hard prerequisite from Chain 1/2).

## Chain 4 — Energy Balance and Assessment (MERGE POINT for Chains 1–3)

```
[Chain 2: CHO-03 + LIP-03 + PRO-03, all three]
                    ↓
            BODY-01 (Energy balance concept)
                    ↓
      ┌─────────────┼──────────────┐
BODY-02 (Expenditure   BODY-04 (Overweight/   BODY-03 (Body composition
 measurement)           obesity)                models)
                              ↓                       ↓
                       BODY-05 (Weight mgmt)   ASSESS-03 (Anthropometric assessment)
                              ↓                       ↓
                       BODY-06 (Underweight/          ASSESS-01 + ASSESS-02 + ASSESS-03
                        cachexia)                              ↓
                                                       ASSESS-05 (Screening/NCP)
                                                              ↓
                                                    [MERGE POINT → Chain 6, CLIN-01]
```

BODY-01 is the single busiest merge point outside of MET — it's the first topic in the graph that genuinely requires all three macronutrient-metabolism chains to have already converged, and everything downstream in BODY/ASSESS depends on it.

## Chain 5 — Sport Nutrition (draws from Chains 1, 2, 3, 4)

```
MET-03 (ATP/energy transduction)
   ↓
SPORT-01 (Bioenergetics of exercise) → SPORT-02 (Fuel sources/fiber types)
   ↓                                          ↓
[Chain 2 outputs: CHO-05, LIP-06, PRO-06] → SPORT-03 (Nutrient/fluid timing)
   ↓
SPORT-04 (Sport-specific strategies) ──┬→ SPORT-05 (Supplements/ergogenic aids) → SPORT-06 (Training adaptation)
                                        ├→ SPORT-07 (Travel/altitude/heat) ←── FLU-04
                                        ├→ SPORT-08 (Exercise immunology)
                                        └→ SPORT-09 (Athlete populations)
                                                  ↓
BODY-07 (Body comp in athletes) [from Chain 4] → SPORT-10 (Female Athlete Triad/RED-S)
                                                  ↓
                        SPORT-04 + SPORT-05 ┄› SPORT-11 (Personalized sport nutrition)
                                                  ↓
              [SPORT-01 through SPORT-10, breadth] → SPORT-13 (Diet planning for athletes)
```

SPORT is the domain with the most *incoming* cross-domain dependencies in the whole graph (MET-03, all of Chain 2's exercise sub-branches, FLU-04, and BODY-07 all feed into it) — consistent with `BOOK_ROLES.md`'s observation that AS3/ACSM/SN4 are applied books sitting on top of everyone else's foundational content.

## Chain 6 — Clinical Nutrition (MERGE POINT for nearly everything)

```
[Chain 4 output: ASSESS-01, ASSESS-02, ASSESS-03, ASSESS-05]
                    ↓
            CLIN-01 (Principles of MNT / Nutrition Care Process)
                    ↓
    ┌───────────────┼────────────────────────────────────────────┐
[GI-01/GI-02] →  CLIN-03/04/05/06         [MET-10] → CLIN-07 (Diabetes)
(Allergies, Upper/Lower GI,                [MET-05] → CLIN-08 (Endocrine)
 Hepatobiliary)                            [MIN-02/VIT-02] → CLIN-09 (Anemia)
                                            [LIP-04/MET-09] → CLIN-10 (Cardiovascular)
                                            [MET-08.04] → CLIN-16 (Critical care)
                    ↓
        CLIN-02, CLIN-11 through CLIN-27 (remaining disease/support topics —
        each REQUIRED on CLIN-01, most with no further specific upstream
        dependency beyond general MET/NUT/ASSESS grounding)
```

CLIN-01 is the single most heavily depended-upon node in the entire graph after the MET spine itself — 26 other CLIN topics all point back to it, and it in turn depends on the full output of Chain 4's assessment cluster. This is not an artifact of this taxonomy; it reflects KM16's own internal book structure (Ch.9's Nutrition Care Process genuinely precedes and organizes all subsequent disease chapters in the source book).

## Chain 7 — Research Methods (mostly self-contained, one bridge out)

```
RESEARCH-01 (Nature/purpose of research)
   ↓
   ├→ RESEARCH-02 (Population study designs) ──┐
   └→ RESEARCH-03 (Intervention study designs) ─┤
                                                 ↓
                                    RESEARCH-07 (Statistics/data analysis)
                                                 ↓
                                    RESEARCH-15 (Translation to practice/policy)

RESEARCH-04 (Dietary assessment methodology) ┄› [MERGE POINT — soft link to ASSESS-01, Chain 4]
   ↓
RESEARCH-06 (Biomarkers of intake)

[MET-01/MET-04] → RESEARCH-11 (Omics/systems biology) → RESEARCH-12 (Epigenetics/nutrient-gene)
                                                              ↓
                                                    SPECIAL-01 (Nutritional genomics, clinical)
                                                    [BRIDGE — see Phase 1 human decision 9c]
```

Matches `BOOK_ROLES.md`'s observation exactly: RESEARCH is almost entirely self-contained (its own internal chain from RESEARCH-01 through RESEARCH-15), with exactly two points of contact with the rest of the graph — a soft link to ASSESS-01 (dietary-assessment methodology overlap) and a REQUIRED-strength dependency *from* MET into RESEARCH-11 (omics needs molecular biology). The RESEARCH-12 → SPECIAL-01 link is the one place RESEARCH touches CLIN at all, and per `PHASE_1_AMBIGUITY_AUDIT.md` item 9c, whether to formally build that bridge is an unresolved human decision — shown here only as the conceptual link that already exists, not a recommendation to build a bridging unit.

## Chain 8 — Life Course (loosely sequenced, low internal dependency)

```
[MET + NUT foundations] ┄› LIFE-01 (Pregnancy/lactation) ┄› LIFE-02 (Infancy) ┄› LIFE-03 (Childhood)
                                                                                       ┄›
                                                              LIFE-06 (Aging) ┄› LIFE-05 (Adulthood) ┄› LIFE-04 (Adolescence)
```

*(Chain shown in natural life-course order, not strict prerequisite order — per `TOPIC_PREREQUISITES.md`, every LIFE-to-LIFE link is HELPFUL, not REQUIRED; each life stage is largely self-contained and could be taught in any order without breaking comprehension.)*

## Chain 9 — Public Health (shallow, mostly independent)

```
NUT-03 (Healthy eating guidelines) → PUBHEALTH-03 (National guidelines/food guides)
ASSESS-01 (Dietary assessment methods) → PUBHEALTH-02 (National surveys/monitoring)
PUBHEALTH-01 (Community practice) → PUBHEALTH-04 (Food assistance programs)
```

Three short, independent two-node chains rather than one long one — PUBHEALTH has the shallowest dependency structure of any domain in the graph.

---

## Cross-Domain Merge Points (the busiest nodes in the graph)

These are the topics where multiple independent chains converge — the load-bearing joints of the whole structure:

| Merge Point | Incoming Chains | Why It's a Joint |
|---|---|---|
| **MET-02** (Enzymes/pathways) | Chain 1 (biochemistry spine) feeds Chain 2 (all three macronutrients) | Every macronutrient's metabolism topic requires this one enzyme/pathway concept. |
| **BODY-01** (Energy balance) | Chain 2 (CHO-03 + LIP-03 + PRO-03, all three required) | Cannot be reached until all three macronutrient-metabolism lanes have already converged. |
| **CLIN-01** (MNT/Nutrition Care Process) | Chain 4 (ASSESS cluster) feeds Chain 6 (all 26 other CLIN topics) | The single busiest downstream fan-out in the graph — everything in clinical nutrition passes through this one node first. |
| **SPORT-01/SPORT-04** | Chain 1 (MET-03) + Chain 2 (macronutrient/exercise outputs) + Chain 3 (FLU-04) | SPORT draws from three independent upstream chains before its own internal structure begins. |
| **RESEARCH-12 → SPECIAL-01** | Chain 7 (RESEARCH) touches Chain 6 (CLIN) at exactly this one point | The only research-to-clinical bridge in the entire graph, and it's a soft/unresolved one (see Phase 1 item 9c). |

## Structural Observations

- **No cycles.** The graph is a genuine DAG (directed acyclic graph) — no topic ultimately depends on itself through any chain, checked by tracing all 86 edges.
- **RESEARCH and LIFE are near-islands.** Both domains have almost no incoming or outgoing edges to the rest of the graph beyond a couple of bridge points (RESEARCH-11's MET dependency and the RESEARCH-12→SPECIAL-01 bridge; LIFE's soft MET/NUT dependency). This matches `BOOK_ROLES.md` and `PHASE_1_AMBIGUITY_AUDIT.md`'s single-source-dependency findings exactly — these domains aren't just single-book-sourced, they're also structurally isolated in the dependency graph, which is a separate (though related) observation worth carrying into Phase 2/3 design.
- **CLIN is the deepest fan-out, not the deepest chain.** MET has the longest linear chain (7 hops); CLIN has the widest fan-out (26 topics depending on one node, CLIN-01) but each individual CLIN topic is only 1–2 hops from its prerequisites. Different kind of complexity — worth distinguishing when Phase 3 estimates teaching time.
