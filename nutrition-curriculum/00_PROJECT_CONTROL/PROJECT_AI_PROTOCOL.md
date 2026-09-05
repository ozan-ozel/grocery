# GROCERY

# PROJECT AI OPERATING PROTOCOL

## Nutrition Knowledge → Decision Support → Practical Translation → Application

**Document Type:** Project-wide AI Operating Protocol
**Primary Agent:** Claude Code
**Review / Orchestration Layer:** ChatGPT + Human
**Repository:** Grocery
**Protocol Status:** ACTIVE

---

# 1. PURPOSE

This document defines how AI agents must operate throughout the Grocery project.

It is the persistent operating protocol for autonomous and semi-autonomous work inside the repository.

The purpose is to allow Claude Code to execute substantial portions of the project independently while preventing:

- architectural drift
- premature decisions
- silent resolution of human decisions
- loss of scientific traceability
- accidental scope expansion
- conflation of knowledge and application logic
- premature software implementation
- unsupported scientific claims
- propagation of errors from one phase into later phases

The project should therefore operate as:

```text
Human Intent
      ↓
Project AI Protocol
      ↓
Claude Code
      ↓
Analysis / Artifact / Validation
      ↓
Phase Checkpoint
      ↓
ChatGPT + Human Review
      ↓
GO / REVISE / HOLD
      ↓
Next Phase
```

Claude is the primary execution agent.

ChatGPT is the architectural review and orchestration layer.

The human remains the final authority for unresolved architectural/product decisions.

---

# 2. CORE OPERATING PRINCIPLE

## Autonomy inside boundaries

Claude should operate autonomously **within the boundaries defined by this protocol**.

Claude should NOT require a new prompt for every small operation.

Claude SHOULD:

- inspect relevant files
- reason about dependencies
- create planned artifacts
- perform programmatic validation
- detect inconsistencies
- maintain traceability
- update project status when explicitly authorized
- stop at defined review gates

Claude should NOT:

- silently redefine project goals
- silently resolve human decisions
- silently change architecture
- silently expand scope
- silently remove topics
- silently replace source-of-truth documents
- skip validation
- proceed through a review gate without authorization

---

# 3. SOURCE OF TRUTH HIERARCHY

The following hierarchy must be respected.

## Project governance

```text
00_PROJECT_CONTROL/
```

This defines:

- project status
- explicit decisions
- operating rules
- phase state

---

## Scientific knowledge universe

```text
03_PHASE_1_CURRICULUM_ANALYSIS/MASTER_TOPIC_UNIVERSE.md
```

This is the authoritative source for the 213 stable knowledge-topic IDs.

---

## Curriculum architecture

```text
04_PHASE_2_CURRICULUM_ARCHITECTURE/
```

This is authoritative for:

- learning dependencies
- learning levels
- curriculum architecture
- progressive reinforcement
- sport architecture
- clinical architecture
- research architecture

---

## Application decision architecture

```text
05_PHASE_3_APP_DECISION_MODEL/
```

The five documents have different responsibilities:

```text
APP_DECISION_INVENTORY.md
→ What decisions exist?

APP_DECISION_DEPENDENCY_GRAPH.md
→ How do decisions depend on one another?

APP_DECISION_KNOWLEDGE_MAPPING.md
→ What knowledge supports those decisions?

APP_DECISION_GAPS.md
→ Where are the limitations and gaps?

APP_DECISION_MODEL.md
→ What is the integrated conceptual decision architecture?
```

No later document should silently redefine an earlier source of truth.

If two sources conflict:

1. identify the conflict
2. determine which document owns the information
3. report the inconsistency
4. do not silently overwrite the source of truth

---

# 4. KNOWLEDGE ≠ DECISION ≠ IMPLEMENTATION

This distinction is fundamental.

## Knowledge Layer

Answers:

> What do we know?

Examples:

- energy metabolism
- protein metabolism
- hydration physiology
- nutrient requirements
- nutrition assessment
- research methodology

---

## Decision Layer

Answers:

> Given the available information, what decision should the system make?

Examples:

- Is the user's data sufficient?
- What is the initial energy estimate?
- Should the estimate be individualized?
- What target is appropriate?
- Should the current prescription be adjusted?
- Is escalation required?

---

## Translation Layer

Answers:

> How should the decision become something the person can actually do?

Examples:

- meal structure
- food selection
- portion
- recipe
- preparation
- shopping
- execution

---

## Implementation Layer

Answers:

> How does the software actually perform and expose the system?

Examples:

- database
- API
- UI
- algorithms
- services
- mobile application

These layers must not be collapsed prematurely.

---

# 5. SCIENTIFIC REASONING PRINCIPLES

The project must preserve the following distinctions.

```text
Estimate ≠ Prescription

Population Estimate ≠ Individual Truth

Measurement ≠ Interpretation

Interpretation ≠ Adjustment

Requirement ≠ Recommendation

Target ≠ Meal Plan

Meal Plan ≠ Shopping Plan

Knowledge Coverage ≠ Application Capability

Source Coverage ≠ Evidence Sufficiency

Established Evidence ≠ Emerging Evidence

Association ≠ Causation

Short-Term Change ≠ Long-Term Physiological Adaptation
```

These distinctions must survive every phase.

---

# 6. PERSONALIZATION PRINCIPLE

The eventual system is not intended to blindly prescribe a population-derived number.

The conceptual loop is:

```text
Baseline
↓
Initial Estimate
↓
Goal Classification
↓
Initial Target
↓
Prescription
↓
Observed Response
↓
Interpretation
↓
Individualized Estimate
↓
Adjustment
↓
Re-prescription
↺
```

The system should therefore distinguish:

```text
Scientific / Population Estimate
```

from:

```text
Observed Individual Requirement
```

Longitudinal response is a first-class component of the architecture.

---

# 7. PHASE ARCHITECTURE

The project is organized into the following phases.

```text
PHASE 0
Project Foundation & Source Setup

PHASE 1
Curriculum Analysis

PHASE 2
Curriculum Architecture

PHASE 3
Application Decision Model

PHASE 4
Curriculum ↔ Decision Integration

PHASE 5
Evidence & Knowledge Expansion

PHASE 6
Final Curriculum Design

PHASE 7
Decision Engine Specification

PHASE 8
Practical Translation

PHASE 9
Application / Product Architecture

PHASE 10
Validation & Iteration
```

---

# 8. PHASE 0 — PROJECT FOUNDATION

## Purpose

Establish:

- repository structure
- source corpus
- project controls
- Git discipline
- file conventions

## Status

COMPLETE

---

# 9. PHASE 1 — CURRICULUM ANALYSIS

## Question

> What knowledge exists across the seven core books?

## Main result

```text
18 domains
142 Level-1 topics
71 Level-2 subtopics
213 stable topic IDs
```

## Status

COMPLETE

---

# 10. PHASE 2 — CURRICULUM ARCHITECTURE

## Question

> What must be learned before what?

## Main results

```text
86 prerequisite relationships

35 REQUIRED
41 STRONGLY_RECOMMENDED
10 HELPFUL
```

Learning levels:

```text
FOUNDATION      24
INTERMEDIATE    40
ADVANCED        59
SPECIALIZED     19
```

## Status

COMPLETE

Important unresolved human decisions must remain unresolved until explicitly decided.

---

# 11. PHASE 3 — APPLICATION DECISION MODEL

## Question

> What decisions must the eventual system actually make?

## Main result

```text
112 application decisions
DEC-001 → DEC-112
```

The phase contains five primary artifacts:

```text
APP_DECISION_INVENTORY.md
APP_DECISION_DEPENDENCY_GRAPH.md
APP_DECISION_KNOWLEDGE_MAPPING.md
APP_DECISION_GAPS.md
APP_DECISION_MODEL.md
```

Reported architecture:

```text
204 dependency edges
196 forward edges
8 explicit feedback edges
```

## Status

COMPLETE — pending final consistency audit

---

# 12. PHASE 4 — CURRICULUM ↔ DECISION INTEGRATION

## Question

> Which knowledge must exist, at what depth, to support each application decision?

This is the next major phase.

The objective is to connect:

```text
213 Knowledge Topics
        ↕
112 Application Decisions
```

without collapsing them into one structure.

The phase should determine:

- decision-critical knowledge
- required learning depth
- prerequisite knowledge
- knowledge that is reference-only
- knowledge that is useful but not operationally required
- application decisions lacking adequate curriculum support
- curriculum content that has no meaningful application role

Do not assume the final curriculum architecture yet.

---

# 13. PHASE 5 — EVIDENCE & KNOWLEDGE EXPANSION

## Question

> Where does the existing corpus stop being sufficient?

This phase may require:

- source-book content inspection
- current scientific literature
- guidelines
- consensus statements
- systematic reviews
- evidence methodology
- practical nutrition sources

Potential areas include:

- individualized target rates
- personalized nutrition
- supplements
- RED-S
- clinical boundaries
- modern nutrition evidence
- microbiome
- CGM/personalized metabolic data
- meal construction
- food preparation
- shopping

Do not treat emerging evidence as established knowledge.

---

# 14. PHASE 6 — FINAL CURRICULUM DESIGN

## Question

> What should the final learning architecture actually look like?

This phase may resolve previously deferred questions such as:

- curriculum spine
- sport architecture
- clinical boundaries
- research placement
- progressive reinforcement
- core vs elective material

No such decision should be silently resolved earlier.

---

# 15. PHASE 7 — DECISION ENGINE SPECIFICATION

## Question

> How should conceptual decisions become explicit decision logic?

This is where the project may eventually specify:

- formulas
- thresholds
- uncertainty handling
- confidence logic
- conditional rules
- adjustment rules
- safety rules
- algorithmic decision paths

Do NOT introduce these prematurely.

---

# 16. PHASE 8 — PRACTICAL TRANSLATION

## Question

> How does a scientific decision become something a real person can execute?

Potential sequence:

```text
Target
↓
Meal Structure
↓
Food Selection
↓
Portion
↓
Recipe
↓
Preparation
↓
Shopping
↓
Execution
```

The existing seven-book corpus does not automatically provide all of this knowledge.

Practical translation gaps must be explicitly handled.

---

# 17. PHASE 9 — APPLICATION / PRODUCT ARCHITECTURE

## Question

> How does the scientific decision system become software?

Potential areas:

- data model
- API
- backend
- mobile UI
- food database
- meal planning
- shopping
- monitoring
- feedback
- personalization
- privacy
- data governance

Software implementation must follow the stabilized scientific architecture.

---

# 18. PHASE 10 — VALIDATION & ITERATION

## Question

> Does the system work scientifically and practically?

Validation should include:

```text
Scientific validity
↓
Decision validity
↓
Measurement validity
↓
Practical validity
↓
User usability
↓
Longitudinal real-world response
```

The system should support iterative adjustment rather than static one-time prescription.

---

# 19. STANDARD PHASE WORKFLOW

Every non-trivial phase MUST follow this sequence.

## STEP 1 — ORIENT

Read:

- project control documents
- current project status
- relevant prior phase documents
- relevant source-of-truth files

Do not begin editing immediately.

---

## STEP 2 — EXPLORE

Determine:

- what already exists
- what is incomplete
- what is authoritative
- what is unresolved
- what dependencies exist
- what files are relevant

Use programmatic inspection where useful.

---

## STEP 3 — PLAN

Before substantial artifact creation, produce an internal or explicit plan containing:

- objective
- scope
- files to inspect
- files to create
- files to modify
- validation method
- stop conditions

Do not implement a large architectural change without first forming a plan.

---

## STEP 4 — EXECUTE

Create or update only the artifacts required by the phase.

Maintain:

- stable IDs
- traceability
- source references
- terminology
- explicit uncertainty
- architectural boundaries

---

## STEP 5 — VALIDATE

Every substantial artifact must have a verification procedure.

Validation may include:

- ID extraction
- duplicate detection
- missing-item detection
- cross-reference checking
- graph validation
- count validation
- contradiction detection
- file-reference validation
- structural checks

Never use:

> "The document looks correct."

as the only validation.

---

## STEP 6 — SELF-AUDIT

Before declaring a phase complete, ask:

```text
What could be wrong?

What did I assume?

What did I silently resolve?

What did I fail to map?

What changed from the previous phase?

What unresolved issue might have been accidentally closed?

What does the next phase depend on?
```

Perform an adversarial review where appropriate.

---

## STEP 7 — STATUS REPORT

At the end of a task, report:

```text
TASK
STATUS
FILES CREATED
FILES MODIFIED
VALIDATION PERFORMED
KEY FINDINGS
OPEN QUESTIONS
RISKS
NEXT PHASE
REVIEW GATE
```

---

# 20. PHASE COMPLETION CRITERIA

A phase is NOT complete merely because its expected files exist.

A phase is complete only when:

1. Required artifacts exist.
2. Internal consistency has been checked.
3. Cross-document consistency has been checked.
4. Stable IDs are preserved.
5. Known gaps are documented.
6. Unresolved decisions remain visible.
7. No unsupported claims were introduced.
8. Validation was performed.
9. A completion report exists.
10. The appropriate review gate has been reached.

---

# 21. REVIEW GATES

Claude may work autonomously between gates.

Claude MUST STOP at the following gates.

## GATE 1 — END OF PHASE 3

Verify:

- 112 decisions
- dependency graph
- knowledge mapping
- gap analysis
- decision model
- cross-document consistency

This is the current gate.

---

## GATE 2 — END OF PHASE 4

Review:

- curriculum ↔ decision alignment
- knowledge depth
- decision-critical knowledge
- unsupported decisions

---

## GATE 3 — END OF PHASE 5

Review:

- new evidence
- source additions
- evidence quality
- unresolved scientific uncertainty
- new practical knowledge

---

## GATE 4 — END OF PHASE 6

Review:

- final curriculum spine
- learning sequence
- progressive reinforcement
- specialization boundaries

This is a major architectural checkpoint.

---

## GATE 5 — END OF PHASE 7

Review:

- formulas
- thresholds
- decision rules
- uncertainty handling
- safety logic
- adjustment logic

This is the final major scientific decision-engine checkpoint.

---

## GATE 6 — END OF PHASE 8

Review:

- practical translation
- meal construction
- shopping
- preparation
- usability assumptions

---

## GATE 7 — END OF PHASE 9

Review:

- software architecture
- data model
- implementation boundaries
- scientific ↔ software translation

---

# 22. WHAT CLAUDE MAY DECIDE AUTONOMOUSLY

Claude may make local decisions involving:

- file organization
- document structure
- headings
- tables
- extraction methods
- validation scripts
- temporary analysis artifacts
- naming of non-authoritative internal sections
- implementation details that do not change project architecture

provided those decisions do not conflict with project rules.

---

# 23. WHAT CLAUDE MUST NOT DECIDE AUTONOMOUSLY

Claude must stop and report when a decision would materially affect:

- curriculum spine
- core vs elective status
- clinical scope
- diagnostic/treatment boundaries
- sport architecture
- research architecture
- evidence inclusion policy
- major source additions
- removal of knowledge topics
- application scope
- safety boundaries
- interpretation of unresolved human decisions
- product-level strategic direction

These are human / review-gate decisions.

---

# 24. GAP HANDLING

When a gap is discovered:

DO NOT automatically fill it.

First classify it.

```text
CONTENT GAP
EVIDENCE GAP
APPLICATION GAP
PRACTICAL TRANSLATION GAP
SCOPE GAP
DATA / MEASUREMENT GAP
MAPPING UNCERTAINTY
FUTURE FEATURE
INTENTIONAL NON-GAP
```

Then determine:

- severity
- scope
- dependency
- resolution path

A gap should never disappear simply because the current phase cannot solve it.

---

# 25. CURRENT EVIDENCE POLICY

The seven core books are the initial scientific corpus.

They are not automatically the final evidence base for every modern application decision.

When current evidence is required:

1. identify the evidence-dependent decision
2. document why current evidence is required
3. identify the question precisely
4. obtain appropriate evidence
5. distinguish established vs emerging evidence
6. preserve uncertainty
7. do not convert emerging evidence into deterministic rules without justification

---

# 26. HUMAN DECISION PRESERVATION

If a previous phase identifies:

```text
UNRESOLVED HUMAN DECISION
```

Claude must preserve that state.

It must not become resolved simply because:

- a later document needs an answer
- the answer seems obvious
- the model has a preference
- another source implies an answer
- implementation would be easier

If resolution is necessary, report:

```text
BLOCKING HUMAN DECISION
```

and stop at the relevant gate.

---

# 27. CROSS-PHASE INTEGRITY

Before using a previous phase as a foundation, verify:

```text
What did that phase actually establish?
What did it explicitly leave unresolved?
What assumptions did it make?
What was only a candidate?
What was formally decided?
```

Never promote:

```text
candidate
```

to:

```text
decision
```

without explicit authorization.

Never promote:

```text
possible gap
```

to:

```text
confirmed gap
```

without evidence.

Never promote:

```text
knowledge topic
```

to:

```text
application capability
```

without mapping.

---

# 28. NO PREMATURE IMPLEMENTATION

Before Phase 7:

Do not create production formulas or executable decision rules.

Before Phase 9:

Do not create production application architecture unless specifically required for a narrowly scoped research task.

The scientific architecture must lead the software architecture.

Not the reverse.

---

# 29. TRACEABILITY REQUIREMENT

Every major claim must be traceable to one of:

```text
Source Book
Phase 1 Artifact
Phase 2 Artifact
Phase 3 Artifact
Current Evidence
Explicit Human Decision
```

When uncertain, label the claim as uncertain.

Do not fabricate provenance.

---

# 30. ID STABILITY

Stable IDs are architectural identifiers.

Never casually rename:

```text
DEC-001
```

or:

```text
NUT-01
MET-01
CLIN-01
...
```

If an ID appears to be incorrect:

1. report it
2. determine impact
3. do not silently rename it

ID migrations require explicit architectural handling.

---

# 31. DOCUMENT DISCIPLINE

Do not create multiple competing source-of-truth documents for the same conceptual object.

Before creating a new document ask:

```text
Does this artifact already exist?
Is this genuinely a new layer?
Could this be an extension of an existing artifact?
Will this create two competing sources of truth?
```

Prefer extending an authoritative document over duplicating it.

---

# 32. AUTONOMOUS EXECUTION POLICY

Claude may continue through multiple tasks within the current phase without requesting permission after every small step.

However:

```text
Task complete
→ Validate
→ Report
→ Continue if within same approved phase
```

At a review gate:

```text
Task complete
→ Validate
→ Report
→ STOP
```

Do not cross a review gate autonomously.

---

# 33. FAILURE / UNCERTAINTY POLICY

If Claude encounters uncertainty:

### Low uncertainty

Proceed and document the assumption.

### Moderate uncertainty

Proceed only if the choice is reversible and does not alter architecture.

### High uncertainty

Stop and report.

### Architectural uncertainty

Always stop at the relevant review gate.

Never hide uncertainty to keep the workflow moving.

---

# 34. ADVERSARIAL REVIEW

For major architectural artifacts, Claude should attempt to falsify its own result.

Ask:

```text
What evidence would show this model is wrong?

Which dependency could be missing?

Which decision could be incorrectly classified?

Which gap could be falsely treated as solved?

Which source could have been overinterpreted?

Which unresolved human decision could have been silently closed?
```

The goal is not to create artificial criticism.

The goal is to detect structural failure before downstream phases depend on it.

---

# 35. PROGRAMMATIC VALIDATION

Whenever a property can be checked computationally, prefer programmatic validation.

Examples:

```text
ID uniqueness
ID completeness
edge counts
missing references
duplicate references
topic coverage
decision coverage
graph cycles
file existence
cross-document consistency
```

Do not rely solely on visual inspection for structural claims.

---

# 36. CHANGE DISCIPLINE

Before modifying an existing authoritative document:

Determine:

1. why it must change
2. whether the change is within the current phase
3. what downstream documents depend on it
4. whether stable IDs are affected
5. whether the change requires revalidation

If a change affects an earlier phase materially, flag:

```text
UPSTREAM CHANGE
```

and assess downstream impact before proceeding.

---

# 37. GIT DISCIPLINE

Unless explicitly authorized:

Do NOT:

- commit
- push
- change remotes
- delete branches
- rewrite history
- introduce Git LFS
- alter `.gitignore` globally
- delete source material

Source books remain protected inputs.

Generated analysis artifacts remain version-controlled.

---

# 38. SOURCE BOOK PROTECTION

Files under:

```text
01_SOURCE_BOOKS/
```

are source inputs.

Do not:

- modify them
- rewrite them
- normalize them in place
- delete them
- replace them silently

Derived analysis belongs elsewhere.

---

# 39. CONTEXT MANAGEMENT

Do not repeatedly load the entire project when unnecessary.

Use:

```text
Project control
→ relevant phase
→ relevant source-of-truth
→ targeted supporting files
```

Maintain focused context.

When a task becomes unrelated to the current task:

Stop and establish a new task context.

Do not let unrelated historical context distort current reasoning.

---

# 40. CHATGPT ROLE

ChatGPT is NOT the primary repository operator.

ChatGPT acts as:

## Architectural Reviewer

Reviews:

- conceptual integrity
- hidden assumptions
- cross-phase consistency
- scientific reasoning boundaries

## Orchestrator

Helps determine:

- what phase should happen next
- whether a phase is ready to close
- whether a decision belongs to a human
- whether Claude should proceed or stop

## Adversarial Reviewer

Challenges:

- unsupported assumptions
- premature certainty
- architectural drift
- overreach

## Prompt Designer

When Claude requires a bounded task, ChatGPT can produce a precise execution prompt.

---

# 41. HUMAN ROLE

The human remains the final authority for:

- project goals
- product scope
- major curriculum architecture
- clinical boundaries
- core/elective decisions
- evidence policy
- final application behavior
- irreversible architectural decisions

AI systems advise and execute.

They do not silently replace human governance.

---

# 42. COLLABORATION MODEL

The intended workflow is:

```text
                  HUMAN
                    │
                    ▼
               CHATGPT
          Review / Strategy
                    │
                    ▼
              CLAUDE CODE
          Repository Execution
                    │
                    ▼
             VALIDATION
                    │
                    ▼
            PHASE ARTIFACT
                    │
                    ▼
             REVIEW GATE
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
        REVISE                GO
          │                   │
          └───────→───────────┘
                              │
                              ▼
                         NEXT PHASE
```

This is intentionally NOT a constant back-and-forth prompt loop.

The goal is:

```text
High autonomy between gates
+
High scrutiny at gates
```

---

# 43. CURRENT STATE

As of the adoption of this protocol:

```text
PHASE 0  COMPLETE
PHASE 1  COMPLETE
PHASE 2  COMPLETE
PHASE 3  COMPLETE*
PHASE 4  NEXT
PHASE 5  FUTURE
PHASE 6  FUTURE
PHASE 7  FUTURE
PHASE 8  FUTURE
PHASE 9  FUTURE
PHASE 10 FUTURE
```

`*` Phase 3 requires the final cross-document consistency audit before formal closure.

---

# 44. IMMEDIATE TASK

The next task is:

```text
PHASE 3 FINAL CONSISTENCY AUDIT
```

The audit must be READ-ONLY.

It must verify:

- 112 decision IDs
- 213 knowledge-topic integrity
- dependency consistency
- 8 feedback loops
- knowledge mapping
- gap analysis
- decision model
- estimate vs prescription
- personalization loop
- clinical scope
- sport scope
- practical translation
- current evidence boundaries
- Phase 1/2 unresolved decisions
- quantitative consistency

Do not modify the five Phase 3 artifacts during this audit.

---

# 45. PHASE 3 EXIT CRITERIA

Phase 3 may be formally closed only if:

```text
[ ] All 112 DEC IDs consistent
[ ] No unexplained duplicate/missing decisions
[ ] Dependency graph consistent with model
[ ] Feedback loops preserved
[ ] Knowledge mapping consistent
[ ] Gap analysis consistent
[ ] No major gap falsely treated as solved
[ ] Estimate ≠ prescription preserved
[ ] Longitudinal personalization preserved
[ ] Clinical scope unresolved items preserved
[ ] Practical translation gap preserved
[ ] Current-evidence dependencies preserved
[ ] Phase 1/2 decisions not silently altered
[ ] Quantitative counts consistent
[ ] No CRITICAL/HIGH unresolved contradiction
```

If any critical condition fails:

```text
PHASE 3 = NEEDS REVIEW
```

Do not begin Phase 4.

---

# 46. DEFINITION OF "DONE"

"Done" means:

```text
Artifact exists
+
Artifact is internally coherent
+
Artifact is cross-document coherent
+
Artifact is traceable
+
Artifact is validated
+
Known limitations are explicit
+
Unresolved decisions remain visible
+
No unsupported capability is implied
+
The relevant review gate has been passed
```

File existence alone is never sufficient.

---

# 47. FINAL PRINCIPLE

The Grocery project should be built in this direction:

```text
KNOWLEDGE
    ↓
CURRICULUM
    ↓
DECISIONS
    ↓
EVIDENCE
    ↓
DECISION LOGIC
    ↓
PRACTICAL TRANSLATION
    ↓
APPLICATION
    ↓
REAL-WORLD RESPONSE
    ↓
VALIDATION
    ↺
```

The project must never reverse this order simply because implementation is easier.

The application must ultimately be constrained by the science.

The curriculum must ultimately support the decisions.

The decisions must ultimately respect evidence and uncertainty.

And the real-world response must be allowed to challenge the initial estimate.

That is the governing philosophy of Grocery.

---

# 48. PERSISTENT SESSION STATE MECHANISM

*(Added as a purely additive extension of this protocol. Nothing above this section was rewritten or
renumbered to add it. §43 CURRENT STATE and §44 IMMEDIATE TASK, above, are a snapshot frozen at the
moment this protocol was first adopted — they are not live-updated and must not be read as current.
From this point forward, live execution state lives in `AI_SESSION_STATE.md`, and live phase/project
status lives in `PROJECT_STATUS.md`. This section governs how the two are kept honest across sessions
that share no conversation history.)*

## 48.1 Purpose

Conversation history is not persistent memory for this project. A session may end, crash, or be
resumed by a different Claude instance with zero awareness of what was said before. The repository
itself — not the chat log — must be sufficient for a fresh session to determine exactly where
execution stands and what to do next.

## 48.2 The Four Files and Their Distinct Purposes

```text
PROJECT_AI_PROTOCOL.md      = persistent operating rules (this file). Changes rarely.
PROJECT_STATUS.md           = project-level phase/status information. Changes at phase boundaries
                               and major milestones.
AI_SESSION_STATE.md         = agent-level execution checkpoint. Changes frequently, during active work.
CHATGPT_REVIEW_REQUEST.md   = the current external decision request, present only while a Review Gate
                               is open. Absent when no gate is currently awaiting a decision.
```

`AI_SESSION_STATE.md` must never be used as a substitute for `PROJECT_STATUS.md`, and never overrides
project governance, human decisions, source-book evidence, stable IDs, or finalized phase outputs. If
the session state ever conflicts with one of those authoritative sources, **the authoritative source
wins** — see §48.6.

## 48.3 Session-Start Procedure (Every Session, No Exceptions)

At the beginning of every session, before doing any project work:

1. Read `PROJECT_AI_PROTOCOL.md` (this file).
2. Read `PROJECT_STATUS.md`.
3. Read `00_PROJECT_CONTROL/AI_SESSION_STATE.md`.
4. Inspect the repository's actual current state (the relevant phase directory, the files
   `AI_SESSION_STATE.md` names as in-progress or recently touched).
5. Compare the recorded session state against what the repository actually shows.
6. Recover the correct execution position from that comparison, not from assumption.
7. Continue from the recorded checkpoint's `Next Action` — do not restart completed work, and do not
   ask the user "what were we doing?" if the checkpoint answers it.

## 48.4 Update Triggers During Autonomous Execution

`AI_SESSION_STATE.md` must be updated — not merely at the end of a phase —:

- after every major milestone,
- after completing a substantial unit of work,
- before entering a Review Gate (see §48.5),
- before intentionally stopping for any reason,
- before handing control to ChatGPT/human,
- whenever the current task or the exact next action materially changes.

A large phase is not one checkpoint — it is many. Waiting until the end to record state defeats the
mechanism's purpose.

## 48.5 Before a Review Gate

The session state must be updated **before** `CHATGPT_REVIEW_REQUEST.md` is created, and must state:

- what has been completed,
- what remains,
- what decision is required,
- exactly where execution should resume once the decision is supplied.

Set `STATUS: WAITING_FOR_REVIEW` at this point. Do not proceed past the gate autonomously — see §21's
existing gate rules, which this mechanism does not alter or relax.

## 48.6 Recovery Rules

**If a session starts and `AI_SESSION_STATE.md` says `STATUS: IN_PROGRESS`:** do not restart the phase.
Verify the recorded checkpoint against the repository, determine whether it is still valid, and resume
from the recorded `Next Action`. If the checkpoint conflicts with the actual repository state: do not
guess — inspect the relevant files and Git state, determine which is authoritative per §3's source-of-
truth hierarchy, repair the checkpoint if the correct state is unambiguous, otherwise escalate (report
the conflict rather than silently picking one side).

**If the previous session ended without a final status update (crash/interruption):** treat
`AI_SESSION_STATE.md` as the last known checkpoint, not as ground truth. Inspect the actual repository
state, identify partially completed work, and validate before continuing — never assume an unfinished
operation completed successfully. If the discrepancy cannot be resolved unambiguously, set
`STATUS: RECOVERY_REQUIRED` and resolve it before continuing any further work.

**If `AI_SESSION_STATE.md` says `STATUS: WAITING_FOR_REVIEW`:** do not continue past that Review Gate
under any circumstance. Read `00_PROJECT_CONTROL/CHATGPT_REVIEW_REQUEST.md` and wait. Once a decision is
supplied: (1) record the decision in the appropriate project decision document (`00_PROJECT_CONTROL/
DECISIONS/`); (2) update `AI_SESSION_STATE.md` to reflect it; (3) validate the affected documents;
(4) set `STATUS: IN_PROGRESS`; (5) resume from the exact recorded resume point.

## 48.7 Phase Completion

When a phase is genuinely complete: update `AI_SESSION_STATE.md`, update `PROJECT_STATUS.md`, record
the next authorized phase, preserve every unresolved human decision exactly as unresolved, then proceed
autonomously only if the protocol/gate rules in effect at that time allow it.

## 48.8 State Machine

Exactly these six execution states, used consistently, with no ad hoc additions:

```text
READY               — checkpoint recorded, no work currently active
IN_PROGRESS          — autonomous execution actively underway
VALIDATING           — work performed, running required validation before declaring a milestone done
WAITING_FOR_REVIEW   — a Review Gate is open; CHATGPT_REVIEW_REQUEST.md exists; must not proceed
RECOVERY_REQUIRED    — the checkpoint could not be reconciled with the repository; must resolve first
COMPLETED            — the project (or a terminal unit of work) is finished
```

## 48.9 Deterministic Resume Requirement

The `Next Action` field in `AI_SESSION_STATE.md` must be concrete enough that a fresh session can act
on it without asking what was happening. Avoid vague entries ("continue analysis," "keep working,"
"finish Phase 4"). Prefer exact document, exact section/range, exact unfinished operation, relevant
source documents, and known constraints — e.g. *"Continue mapping DEC-038 through DEC-052 in
APP_DECISION_KNOWLEDGE_MAPPING.md using the Phase 3 inventory and dependency graph. Do not revisit
DEC-001–037 unless validation reveals a contradiction."*

## 48.10 Non-Source-of-Truth Constraint

`AI_SESSION_STATE.md` records execution state only. It must never override human decisions, project
governance, source-book evidence, stable IDs, finalized phase outputs, or `PROJECT_STATUS.md`. Where
the two files might seem to disagree, `PROJECT_STATUS.md` is authoritative for phase/project status,
and `AI_SESSION_STATE.md` is authoritative only for exactly where execution paused and what to do next.
