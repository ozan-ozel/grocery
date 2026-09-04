# Topic Prerequisites

Educationally meaningful prerequisite relationships between topics in `MASTER_TOPIC_UNIVERSE.md`. This is not an exhaustive pairwise graph — links exist only where a genuine conceptual dependency exists, per Task 1's instruction not to manufacture artificial connections. Relationship strength:

- **REQUIRED** — the dependent topic cannot be meaningfully taught without the prerequisite already in place.
- **STRONGLY_RECOMMENDED** — the dependent topic can technically be taught without it, but comprehension will be shallow or fragile without it.
- **HELPFUL** — useful context/reinforcement, not a hard dependency.

Organized by domain of the *dependent* topic. Cross-domain prerequisites are the most informative entries and are called out explicitly.

---

## Into MET (Energy and Metabolism)

| Prerequisite | Dependent | Relationship | Rationale |
|---|---|---|---|
| NUT-02 Nutrients: Classification and Core Functions | MET-01 Basic Biochemistry Underpinning Metabolism | STRONGLY_RECOMMENDED | Knowing what carbohydrate/fat/protein *are* before learning the chemistry that acts on them avoids teaching structure in a vacuum. |
| MET-01 Basic Biochemistry | MET-02 Enzymes and Metabolic Pathways | REQUIRED | Enzyme kinetics and covalent-bond chemistry (MET-01.01) are the direct conceptual basis for how enzymes catalyze reactions. |
| MET-02 Enzymes and Metabolic Pathways | MET-03 ATP and Energy Transduction | REQUIRED | ATP synthesis/hydrolysis is explained as an enzyme-catalyzed process (phosphorylation); the TCA cycle and electron transport chain are pathways in the MET-02 sense. |
| MET-03 ATP and Energy Transduction | MET-04 Cellular and Molecular Regulation of Metabolism | REQUIRED | Regulation of metabolic flux (rapid vs. longer-term changes, substrate cycling) is regulation *of* the ATP-generating pathways just learned. |
| MET-04 Cellular/Molecular Regulation | MET-05 Whole-Body Coordination of Metabolism | STRONGLY_RECOMMENDED | Hormonal/nervous coordination (MET-05) acts through the cellular mechanisms (gene expression, membrane transport) established in MET-04. |
| MET-05 Whole-Body Coordination | MET-06 Organ- and Tissue-Specific Metabolism | STRONGLY_RECOMMENDED | Understanding *how* hormones and circulation connect tissues is assumed before studying what each organ does with that coordination. |
| MET-06 Organ-Specific Metabolism | MET-07 Integration of Metabolism in Daily Life | REQUIRED | The "metabolic diary" (fed/fasting transitions across a day) only makes sense once liver/adipose/muscle-specific roles are known. |
| MET-07 Integration in Daily Life | MET-08 Metabolic Adaptation to Physiological/Pathological Challenges | REQUIRED | Exercise, starvation, and stress responses are described as *departures* from the normal daily fed/fasting pattern just learned. |
| CHO-03 Carbohydrate Metabolism | MET-10 Diabetes as a Disorder of Metabolic Regulation | REQUIRED | Diabetes cannot be understood as a *regulatory failure* without first knowing normal glucose metabolism. |
| MET-05 Whole-Body Coordination (hormonal control) | MET-10 Diabetes as a Disorder of Metabolic Regulation | REQUIRED | Insulin/glucagon signaling (taught in MET-05/MET-06.01) is the direct mechanism that fails in diabetes. |
| LIP-03 Lipid/Fat Metabolism | MET-09 Lipoprotein Metabolism and Atherosclerosis | REQUIRED | Lipoprotein transport is a specialized extension of general lipid metabolism. |

## Into CHO / LIP / PRO (Macronutrients)

| Prerequisite | Dependent | Relationship | Rationale |
|---|---|---|---|
| NUT-02 Nutrients: Classification and Core Functions | CHO-01 / LIP-01 / PRO-01 (Chemistry and Classification) | STRONGLY_RECOMMENDED | Each macronutrient's chemistry is easier to place in context once its general nutritional role is established. |
| GI-01 Anatomy/Regulation of the GI Tract | CHO-02 / LIP-02 / PRO-02 (Digestion and Absorption) | REQUIRED | Digestion of any nutrient class is a specific application of general GI physiology (enzymes, stages of digestion, absorptive surfaces). |
| MET-02 Enzymes and Metabolic Pathways | CHO-03 / LIP-03 / PRO-03 (Metabolism) | REQUIRED | Each nutrient's metabolic pathway (glycolysis, beta-oxidation, transamination) is a concrete instance of the general enzyme/pathway concept. |
| CHO-02 Digestion and Absorption | CHO-03 Carbohydrate Metabolism | REQUIRED | Metabolism operates on absorbed monosaccharides — the absorption step must precede it conceptually. |
| LIP-02 Digestion and Absorption | LIP-03 Lipid/Fat Metabolism | REQUIRED | Same logic as CHO-02 → CHO-03. |
| PRO-02 Digestion and Absorption | PRO-03 Protein and Amino Acid Metabolism | REQUIRED | Same logic as CHO-02 → CHO-03. |
| PRO-03 Protein/Amino Acid Metabolism | PRO-04 Protein Requirements | STRONGLY_RECOMMENDED | Nitrogen-balance-based requirement calculations assume the metabolic fate of amino acids is already understood. |
| PRO-04 Protein Requirements | PRO-05 Protein–Energy Malnutrition | STRONGLY_RECOMMENDED | Marasmus/kwashiorkor/cachexia are best understood as *failures* to meet the requirements just taught. |
| CHO-03 Carbohydrate Metabolism | CHO-05 Carbohydrate and Exercise Performance | STRONGLY_RECOMMENDED | Glycogen loading/depletion strategies rely on already knowing glycogen synthesis/breakdown pathways. |
| LIP-03 Lipid/Fat Metabolism | LIP-06 Fat as a Fuel During Exercise | STRONGLY_RECOMMENDED | Fat oxidation during exercise is a specific case of the general lipid-oxidation pathway. |
| PRO-03 Protein/Amino Acid Metabolism | PRO-06 Protein and Exercise | STRONGLY_RECOMMENDED | Muscle protein synthesis/breakdown during training is a specific case of the general protein turnover concept. |
| SPORT-01 Bioenergetics of Exercise | CHO-05 / LIP-06 / PRO-06 (nutrient-and-exercise topics) | HELPFUL | Knowing the energy-system context (anaerobic/aerobic) enriches understanding of why each macronutrient is emphasized at different exercise intensities/durations, though not strictly required in either direction. |

## Into VIT / MIN (Micronutrients)

| Prerequisite | Dependent | Relationship | Rationale |
|---|---|---|---|
| NUT-02 Nutrients: Classification and Core Functions | VIT-01 / VIT-02 (Fat- and Water-Soluble Vitamins) | STRONGLY_RECOMMENDED | Vitamins were already introduced as a nutrient class in NUT-02; VIT-01/02 is the detailed follow-through. |
| NUT-02 Nutrients: Classification and Core Functions | MIN-01 / MIN-02 (Macrominerals, Trace Elements) | STRONGLY_RECOMMENDED | Same logic as vitamins. |
| DRV-01 Development/Methodology of DRIs | VIT-03 / MIN-03 (Requirements, Reference Intakes, Assessment) | REQUIRED | Requirement values cannot be interpreted without first understanding what an RDA/AI/UL actually means. |
| VIT-01 / VIT-02 | VIT-04 Vitamins in Athletic Performance | REQUIRED | Athlete-specific vitamin needs are a modification of baseline vitamin physiology, not a separate subject. |
| MIN-01 / MIN-02 | MIN-04 Minerals in Athletic Performance | REQUIRED | Same logic as VIT-04. |
| VIT-01 / VIT-02 (individually, per nutrient) | MIN-02 (Iron specifically) → CLIN-09 Anemia | STRONGLY_RECOMMENDED | Iron-deficiency and B12/folate-deficiency anemias (CLIN-09) require the underlying micronutrient physiology already taught in VIT-02/MIN-02. |

## Into FLU (Fluid/Electrolyte/Acid-Base)

| Prerequisite | Dependent | Relationship | Rationale |
|---|---|---|---|
| NUT-02.03 Water as a Nutrient | FLU-01 Body Water: Distribution and Balance | HELPFUL | Establishes water's status as a nutrient before its physiology is developed in depth. |
| FLU-01 Body Water | FLU-02 Electrolyte Physiology | STRONGLY_RECOMMENDED | Electrolyte distribution is described relative to body-water compartments established in FLU-01. |
| FLU-01 / FLU-02 | FLU-03 Acid-Base Balance and Disorders | STRONGLY_RECOMMENDED | Acid-base regulation is mechanistically tied to fluid/electrolyte physiology (bicarbonate, renal handling). |
| FLU-01 / FLU-02 | FLU-04 Hydration and Fluid Balance in Exercise | REQUIRED | Exercise hydration strategy is an applied extension of baseline fluid/electrolyte physiology, not a standalone topic. |
| FLU-04 Hydration in Exercise | FLU-05 Fluid/Electrolyte and Heat-Related Disorders | STRONGLY_RECOMMENDED | Heat illness and exercise-associated hyponatremia are failure modes of the hydration strategies just taught. |

## Into GI (Digestion/Absorption/GI Physiology)

| Prerequisite | Dependent | Relationship | Rationale |
|---|---|---|---|
| GI-01 Anatomy/Regulation of the GI Tract | GI-02 Digestion/Absorption by Nutrient Class | REQUIRED | GI-02 applies GI-01's anatomy/regulation to specific nutrient classes. |
| GI-01 / GI-02 | GI-03 Gut Microbiome and GI Health | STRONGLY_RECOMMENDED | The microbiome's role (fermentation of unabsorbed substrate, immune interaction) presumes basic GI anatomy/absorption is understood. |
| GI-01 | GI-04 GI Function/Symptoms During Exercise | STRONGLY_RECOMMENDED | Exercise-induced GI distress is explained relative to normal GI regulation and blood-flow redistribution. |
| GI-01 / GI-02 | GI-05 Gastrointestinal Disorders (Clinical) — i.e., CLIN-04/CLIN-05 | REQUIRED | Clinical GI disease chapters assume normal digestive physiology as the baseline against which pathology is defined. |

## Into BODY (Energy Balance/Body Composition)

| Prerequisite | Dependent | Relationship | Rationale |
|---|---|---|---|
| CHO-03 / LIP-03 / PRO-03 (macronutrient metabolism, collectively) | BODY-01 Energy Balance: Concept and Regulation | STRONGLY_RECOMMENDED | Energy balance is defined in terms of substrate oxidation/storage across all three macronutrients. |
| BODY-01 Energy Balance | BODY-02 Measurement of Energy Expenditure | STRONGLY_RECOMMENDED | Measurement methods (calorimetry, DLW) are tools for quantifying the energy-balance concept just introduced. |
| BODY-01 Energy Balance | BODY-04 Overweight and Obesity | REQUIRED | Obesity is defined and explained as sustained positive energy balance; the concept must precede the pathology. |
| BODY-04 Overweight and Obesity | BODY-05 Weight Management and Treatment Approaches | REQUIRED | Treatment approaches directly target the etiology/mechanisms established in BODY-04. |
| BODY-01 Energy Balance | BODY-06 Underweight, Unintentional Weight Loss, Cachexia | REQUIRED | Underweight states are the mirror image of BODY-04's obesity — both require the energy-balance concept first. |
| BODY-01 / BODY-03 (Body Composition Models) | BODY-07 Body Composition and Weight Management in Athletes | STRONGLY_RECOMMENDED | Athlete-specific weight/composition management is a modification of the general principles, not a separate foundation. |

## Into ASSESS (Nutrition Assessment)

| Prerequisite | Dependent | Relationship | Rationale |
|---|---|---|---|
| NUT-02 / DRV-01 | ASSESS-01 Dietary Intake Assessment Methods | HELPFUL | Knowing what's being measured (nutrients, against what reference) enriches assessment-method instruction, though the methods themselves can be taught generically. |
| BODY-03 Body Composition Models | ASSESS-03 Anthropometric and Physical Assessment | STRONGLY_RECOMMENDED | Anthropometric methods are the practical measurement tools for the body-composition models already introduced. |
| ASSESS-01 / ASSESS-02 / ASSESS-03 | ASSESS-05 Nutrition Screening, Diagnosis and the Nutrition Care Process | REQUIRED | The Nutrition Care Process explicitly begins with assessment (dietary, biochemical, anthropometric) — the process cannot be taught before its inputs are understood. |
| ASSESS-02 Biochemical/Laboratory Assessment | ASSESS-06 Functional/Inflammation-Related Biomarkers | STRONGLY_RECOMMENDED | Inflammation markers (CRP, albumin, etc.) are a specific category of the biochemical assessment already introduced. |

## Into SPORT (Exercise and Sport Nutrition)

| Prerequisite | Dependent | Relationship | Rationale |
|---|---|---|---|
| MET-03 ATP and Energy Transduction | SPORT-01 Bioenergetics of Exercise | REQUIRED | ATP-PCr, anaerobic, and aerobic pathways are the same energy-transduction chemistry taught in MET-03, applied to exercise intensity/duration. |
| SPORT-01 Bioenergetics | SPORT-02 Fuel Sources and Muscle Fiber Types | STRONGLY_RECOMMENDED | Fiber-type-specific fuel preference is explained through the energy-system framework just established. |
| CHO-05 / LIP-06 / PRO-06 (nutrient-specific exercise topics) | SPORT-03 Nutrient and Fluid Timing Around Exercise | STRONGLY_RECOMMENDED | Timing strategy integrates the individual macronutrient-and-exercise content already covered, rather than introducing new substrate physiology. |
| SPORT-01 / SPORT-02 | SPORT-04 Sport-Specific Nutrition Strategies | REQUIRED | Power/endurance/combined-sport strategies are direct applications of the bioenergetics and fuel-selection principles just taught. |
| FLU-04 Hydration in Exercise | SPORT-07 Travel, Altitude, Heat and Environmental Nutrition | STRONGLY_RECOMMENDED | Environmental nutrition strategy (heat, altitude) builds directly on baseline exercise-hydration physiology. |
| BODY-07 Body Composition/Weight in Athletes | SPORT-10 Female Athlete Triad, RED-S and Low Energy Availability | REQUIRED | RED-S is specifically defined as a consequence of energy availability relative to the body-composition/weight concepts in BODY-07. |
| SPORT-04 / SPORT-05 (strategies, supplements) | SPORT-11 Personalized/Precision Sport Nutrition | HELPFUL | Personalization is framed as a refinement layered on top of general strategy, not a prerequisite-free starting point. |
| SPORT-01 through SPORT-10 (breadth of the domain) | SPORT-13 Diet Planning for Athletes | STRONGLY_RECOMMENDED | Diet planning is a synthesis/capstone activity that draws on essentially the whole SPORT domain. |

## Into RESEARCH (Nutrition Research Methods)

| Prerequisite | Dependent | Relationship | Rationale |
|---|---|---|---|
| RESEARCH-01 Nature and Purpose of Nutrition Research | RESEARCH-02 Population-Based Observational Designs | STRONGLY_RECOMMENDED | Understanding *why* nutrition research is conducted contextualizes the specific designs that follow. |
| RESEARCH-01 | RESEARCH-03 Intervention Study Designs | STRONGLY_RECOMMENDED | Same logic as RESEARCH-02. |
| RESEARCH-02 / RESEARCH-03 | RESEARCH-07 Statistical and Data Analysis Methods | REQUIRED | Statistical methods are taught in the context of analyzing the specific study designs just introduced (cohort data, RCT data, etc., per NRM's own TOC wording — "Analysis of cohort data," "Statistical analysis" appear as subsections of the study-design chapters themselves). |
| ASSESS-01 Dietary Intake Assessment Methods | RESEARCH-04 Dietary Assessment Methodology (Research Context) | HELPFUL | The clinical assessment methods and the research-validity treatment of the same methods are complementary, not strictly sequential — either could be taught first (see `TOPIC_OVERLAPS.md` #9). |
| RESEARCH-04 Dietary Assessment Methodology | RESEARCH-06 Biomarkers of Dietary Intake | STRONGLY_RECOMMENDED | Biomarkers are introduced (in NRM's own chapter sequence) specifically as a way to validate/supplement self-reported dietary assessment. |
| MET-01 / MET-04 (basic biochemistry, gene expression) | RESEARCH-11 Omics Technologies and Systems Biology | REQUIRED | Omics methods (genomics, metabolomics, etc.) presume the underlying molecular biology already taught in MET. |
| RESEARCH-11 Omics Technologies | RESEARCH-12 Epigenetics and Nutrient–Gene Interactions | STRONGLY_RECOMMENDED | Epigenetic mechanisms are typically taught as a category of omics-adjacent molecular methods. |
| RESEARCH-02 / RESEARCH-03 / RESEARCH-07 | RESEARCH-15 Translation of Research into Practice/Policy | STRONGLY_RECOMMENDED | Translating evidence into policy assumes the reader can already evaluate study design and statistical results. |

## Into CLIN (Clinical Nutrition/Medical Nutrition Therapy)

| Prerequisite | Dependent | Relationship | Rationale |
|---|---|---|---|
| ASSESS-01 / ASSESS-02 / ASSESS-03 / ASSESS-05 | CLIN-01 Principles of MNT and the Nutrition Care Process | REQUIRED | CLIN-01 is explicitly the clinical application of the assessment/NCP methodology taught in ASSESS; KM16 itself sequences its own Ch.4/5/9 (assessment) before disease-specific chapters begin at Ch.14 onward. |
| CLIN-01 | CLIN-02 through CLIN-27 (all disease-specific and support topics) | REQUIRED | Every KM16 disease chapter follows the Nutrition Care Process framework established in Ch.9 — this is a genuine, book-confirmed structural dependency, not an invented one. |
| GI-01 / GI-02 / CHO-02 / LIP-02 / PRO-02 | CLIN-03 Food Allergies and Intolerances | STRONGLY_RECOMMENDED | Allergy/intolerance pathophysiology (IgE reactions, lactose/FODMAP intolerance) presumes normal digestion/absorption as the baseline. |
| GI-01 / GI-02 | CLIN-04 Upper GI Disorders | REQUIRED | Same logic — pathology is defined relative to normal GI physiology. |
| GI-01 / GI-02 | CLIN-05 Lower GI Disorders | REQUIRED | Same logic. |
| LIP-02 / LIP-03 | CLIN-06 Hepatobiliary and Pancreatic Disorders | STRONGLY_RECOMMENDED | The liver's central role in lipid metabolism (MET-06.01) and fat digestion (needs bile/pancreatic enzymes) underlies hepatobiliary/pancreatic pathology. |
| MET-10 Diabetes as a Regulatory Disorder | CLIN-07 Diabetes Mellitus and Hypoglycemia | REQUIRED | The clinical chapter builds directly on the regulatory/biochemical foundation; KM16's own diabetes chapter assumes glucose-regulation physiology as background. |
| MET-05 (hormonal coordination) | CLIN-08 Thyroid, Adrenal and Endocrine Disorders | STRONGLY_RECOMMENDED | Endocrine pathology is defined relative to the normal hormonal signaling taught in MET-05/MET-06. |
| MIN-02 (Iron, trace elements) / VIT-02 (B12, folate) | CLIN-09 Anemia and Iron-Related Blood Disorders | REQUIRED | Nutritional anemias are directly defined by deficiency of the micronutrients taught in MIN-02/VIT-02. |
| LIP-04 / MET-09 Lipoprotein Metabolism/Atherosclerosis | CLIN-10 Cardiovascular Disease | REQUIRED | KM16's own CVD chapter opens with atherosclerosis/lipoprotein physiology before moving to clinical management — the mechanistic content is a stated prerequisite within the book itself. |
| MET-08.04 (pathological stress metabolism) | CLIN-16 Critical Care and Metabolic Stress | STRONGLY_RECOMMENDED | The metabolic stress response (HM4 Ch.9) is the mechanistic basis for critical-care nutrition management. |
| CLIN-26 Inflammation and Chronic Disease Pathophysiology | CLIN-07 / CLIN-10 / CLIN-17 (Diabetes, CVD, Rheumatic disease) | HELPFUL | KM16's own Chapter 7 (inflammation) is positioned early in the book, before most disease chapters, and its "nutrient modulators of inflammation" content recurs conceptually in several later disease chapters — a soft, reinforcing link rather than a hard requirement. |
| RESEARCH-12 Epigenetics/Nutrient-Gene Interactions | SPECIAL-01 Nutritional Genomics (Clinical/Applied) | STRONGLY_RECOMMENDED | KM16's clinical-genomics chapter presumes the underlying molecular mechanisms taught in NRM's epigenetics/nutrigenomics research chapters — this is the RESEARCH↔SPECIAL bridge flagged as an open human decision in `PHASE_1_AMBIGUITY_AUDIT.md` (item 9c); the *conceptual* prerequisite relationship is real either way that decision goes. |

## Into LIFE (Nutrition Across the Life Course)

| Prerequisite | Dependent | Relationship | Rationale |
|---|---|---|---|
| NUT-02 / MET (macronutrient and metabolism foundations) | LIFE-01 through LIFE-06 (all life-stage topics) | STRONGLY_RECOMMENDED | Life-stage-specific nutrient requirements are modifications of baseline nutritional physiology, not a separate foundation. |
| MET-08.02 (growth/development metabolism) | LIFE-01 Pregnancy and Lactation | STRONGLY_RECOMMENDED | HM4's own §8.3.2/8.3.3 (pregnancy/lactation) sits inside the "metabolic adaptation to challenges" chapter — the mechanistic content directly informs the applied life-stage chapter. |
| LIFE-01 Pregnancy and Lactation | LIFE-02 Infancy | HELPFUL | Natural life-course sequencing (maternal nutrition precedes infant nutrition) rather than a strict content dependency. |
| LIFE-02 Infancy | LIFE-03 Childhood → LIFE-04 Adolescence → LIFE-05 Adulthood → LIFE-06 Aging | HELPFUL | The life-course sequence is pedagogically natural but each stage's content is largely self-contained; none strictly requires the prior stage's content to be comprehensible. |

## Into PUBHEALTH (Public Health/Population Nutrition)

| Prerequisite | Dependent | Relationship | Rationale |
|---|---|---|---|
| NUT-03 Healthy Eating Guidelines | PUBHEALTH-03 National Nutrition Guidelines and Food Guides | STRONGLY_RECOMMENDED | Population-level guidelines are the aggregate/policy expression of the individual-level guidance already taught. |
| ASSESS-01 Dietary Intake Assessment Methods | PUBHEALTH-02 National Nutrition Surveys and Monitoring | STRONGLY_RECOMMENDED | Surveys like NHANES are large-scale applications of the same dietary-assessment methodology. |
| PUBHEALTH-01 Community Nutrition Practice | PUBHEALTH-04 Food Assistance and Nutrition Programs | HELPFUL | Programs are typically introduced as part of community-practice context, though each can stand alone. |

## Into SPECIAL (Cross-Cutting Topics)

| Prerequisite | Dependent | Relationship | Rationale |
|---|---|---|---|
| ASSESS-05 Nutrition Screening/NCP | SPECIAL-03 Nutrition Counseling and Behavioral Change | STRONGLY_RECOMMENDED | KM16 sequences counseling (Ch.13) after its assessment/NCP chapters (Ch.4/5/9) — counseling is framed as what happens *after* assessment/diagnosis. |
| SPORT-05 / CLIN (general pharmacology-adjacent context) | SPECIAL-02 Complementary/Integrative Medicine and Supplements | HELPFUL | Some grounding in how supplements are evaluated for legitimate performance/health claims aids critical evaluation of complementary medicine, though not a hard prerequisite. |

---

## Summary

**Total prerequisite relationships documented: 86** (counted programmatically, not by manual tally)

By strength:
- REQUIRED: 35
- STRONGLY_RECOMMENDED: 41
- HELPFUL: 10

The heaviest concentration of REQUIRED links sits inside MET (the biochemistry spine) and CLIN (where KM16's own chapter sequencing enforces assessment → diagnosis → disease-specific application as a real, book-confirmed dependency, not an invented one). LIFE and PUBHEALTH have the lightest prerequisite structure — their internal sequencing is more editorial convenience (life stages in order) than hard conceptual dependency.
