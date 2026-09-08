# Documentation Architecture Investigation — Phase 9 and Large Canonical Documents

**Status:** Investigation artifact. **No documentation was split, renamed, moved, or rewritten to
produce this report.** Nothing below modifies `APP_DECISION_INVENTORY.md`, `APP_DECISION_MODEL.md`,
`APP_DECISION_KNOWLEDGE_MAPPING.md`, `APP_DECISION_GAPS.md`, `PHASE_9_APPLICATION_CAPABILITY_
ARCHITECTURE.md`, `APP_DECISION_DEPENDENCY_GRAPH.md`, any `DEC` record, any Phase 1–8 artifact, or any
application/database/API/UI file. No Git operation (branch/commit/push/merge) was performed for this
investigation.

---

## 1. Objective

Determine whether Grocery's large Markdown architecture documents — specifically the four Phase 3
decision-architecture documents and the Phase 9 capability-architecture document — should remain
monolithic or be split into a coordinated document family, using semantic-cohesion criteria rather
than line count as the deciding factor. This report distinguishes, per document, between *large but
coherent canonical document* and *multiple semantic artifacts accidentally accumulated in one file*,
and recommends the smallest safe change that would materially improve maintainability and AI/human
retrieval without weakening canonical authority.

---

## 2. Current Documentation Landscape

The five documents under investigation, with verified line counts:

| Document | Lines | Phase | Role stated in its own header |
|---|---|---|---|
| `APP_DECISION_INVENTORY.md` | 2,156 | Phase 3, doc 1/5 | "What must the application decide?" |
| `APP_DECISION_MODEL.md` | 1,202 | Phase 3, doc 5/5 | Synthesizes the other four into one architecture description |
| `APP_DECISION_KNOWLEDGE_MAPPING.md` | 1,599 | Phase 3, doc 3/5 | Bidirectional map: 213 topics ↔ 112 decisions |
| `APP_DECISION_GAPS.md` | 1,025 | Phase 3, doc 4/5 | Ten-category gap taxonomy applied to the above |
| `PHASE_9_APPLICATION_CAPABILITY_ARCHITECTURE.md` | 2,276 | Phase 9 | "How does the scientific decision system become software?" |

Total: 8,258 lines across five files. A sixth sibling in the same Phase 3 family,
`APP_DECISION_DEPENDENCY_GRAPH.md` (1,105 lines, doc 2/5), is cited constantly by all four decision
documents but was not one of the five documents this investigation was asked to analyze in depth; it
is referenced below only for context.

**This is not the corpus's first documentation-architecture review.** `PROJECT_STATUS.md`'s own
"Structural Maintenance Log — 2026-09-08" already audited the entire 54-file, 24,132-line
`nutrition-curriculum/` corpus for exactly this question and recorded a verdict: *"the corpus is not
oversized and was not split... Each large file is one conceptual object."* That pass explicitly
considered and rejected splitting any large document, consolidating Phase 9's four status sections,
and deleting Phase 9's duplicated §19.1–§19.5, citing `PROJECT_AI_PROTOCOL.md` §31 (prefer extending
over duplicating), §39 (targeted navigation over small files), and the corpus's dense self-citation
(that pass counted `MASTER_TOPIC_UNIVERSE` referenced by 25 files, `PROJECT_AI_PROTOCOL` by 20,
`APP_DECISION_GAPS` by 17). Instead it added supersession banners to Phase 9's stale sections and a
precedence banner to its duplicated ratification restatement.

This investigation treats that prior verdict as a **load-bearing precedent to engage with directly,
not to silently re-litigate or silently defer to.** Its reasoning is checked against fresh, direct
inspection of all five documents below (not assumed correct), and its stated criteria (§31/§39,
self-citation density) are re-measured with current numbers. Where this investigation's independent
analysis agrees, that agreement is stated as a confirmed finding, not a restatement of authority. Where
it would disagree, that would be flagged explicitly — no such disagreement was found (§14).

Independently verified inbound-reference counts (this investigation's own measurement, current as of
this pass):

| Document | Files referencing it (corpus-wide grep) |
|---|---|
| `APP_DECISION_GAPS.md` | 18 |
| `APP_DECISION_KNOWLEDGE_MAPPING.md` | 16 |
| `APP_DECISION_INVENTORY.md` | 15 |
| `APP_DECISION_MODEL.md` | 11 |
| `PHASE_9_APPLICATION_CAPABILITY_ARCHITECTURE.md` | 5 |

Phase 9 is the least externally cited of the five, despite being the largest — its cross-reference
burden is almost entirely *internal* (§9 below quantifies this at 333 internal `§`-references in one
file), not external. The four Phase 3 documents are heavily cross-cited by the rest of the corpus,
which is itself a governance-risk signal for splitting them (§11, §14).

---

## 3. Document-by-Document Analysis

Criteria A–J are scored qualitatively as `STRONG_REASON_TO_SPLIT` / `MODERATE_REASON_TO_SPLIT` /
`NEUTRAL` / `MODERATE_REASON_TO_KEEP` / `STRONG_REASON_TO_KEEP`. Every non-obvious score is explained
inline; line-count is never used as a criterion.

### 3.1 `APP_DECISION_INVENTORY.md`

Structure, confirmed by direct read: §1–3 front matter (~130 lines: purpose, eight cross-cutting
decision-model principles, the 20-domain map) → §4 the **complete decision registry** (~1,710 lines,
79% of the file — 112 records across 20 domains, every record using an identical field legend:
Decision/Domain/Type/Inputs/Output/Depends On/Downstream Use/Personalization/Longitudinal/Current
Evidence/Knowledge Domains/Topic IDs/App Priority/Notes) → §5–13 (~275 lines, nine short **derived
summary views** computed from §4: the personalization loop, cross-domain decisions, high-personalization
decisions, longitudinal decisions, evidence-dependent decisions, a knowledge-mapping summary, apparent
gaps, a core/optional summary, open questions) → a 30-item Validation Summary (~60 lines).

| Criterion | Score | Why |
|---|---|---|
| A. Semantic cohesion | STRONG_REASON_TO_KEEP | Every one of the 1,710 §4 lines answers exactly one question ("what must the app decide, per ID") in one uniform schema. |
| B. Source-of-truth cohesion | STRONG_REASON_TO_KEEP | All 112 records share identical canonical authority — this file alone is *the* `DEC` registry; nothing elsewhere is allowed to originate a `DEC` definition. |
| C. Update lifecycle | MODERATE_REASON_TO_KEEP | Individual records rarely change once specified (Phase 7 onward mostly reads them, doesn't rewrite them); the §5–13 derived views recompute from the same §4 data on the same occasions, not on independent schedules. |
| D. Dependency cohesion | MODERATE_REASON_TO_KEEP | Domain blocks are largely independent of each other in isolation, but §6's Cross-Domain table and the dependency graph's 203 edges mean a meaningful fraction of records reference records in *other* domains — a domain-based split would frequently cross file boundaries. |
| E. Retrieval efficiency | STRONG_REASON_TO_SPLIT | The single strongest pro-split argument in this document: answering "what does `DEC-067` say" needs ~15 lines, not 2,156. |
| F. Human usability | NEUTRAL | One file is `Ctrl+F`-searchable by ID today; N domain files would require an extra indirection (which file is `DEC-067` in?) that §3's domain-map table already answers in-place. |
| G. Stable-ID navigation | STRONG_REASON_TO_KEEP | One file honors "grep `DEC-067`, get the answer" with zero indirection. Splitting by contiguous domain ranges (Option I-B, §5 below) would preserve this reasonably well; any other split would not. |
| H. Cross-reference complexity | STRONG_REASON_TO_KEEP | 15 external files cite this document by name; internally, 203 dependency edges and the §6 cross-domain table connect records across domain boundaries constantly. |
| I. Context-window efficiency | MODERATE_REASON_TO_SPLIT, but already achieved without splitting | An agent implementing one `DEC` genuinely needs ~15–30 lines — but this is already achieved today via targeted `Grep`/offset-`Read` (demonstrated repeatedly in this project's own recent sessions, e.g. locating `DEC-067`'s exact record by grep rather than reading the file). Splitting the file would not reduce what a *disciplined* agent reads; it only helps an agent that reads top-to-bottom instead of searching, which is a retrieval-*behavior* problem (`PROJECT_AI_PROTOCOL.md` §39 already prescribes targeted navigation), not a file-*structure* problem. |
| J. Governance risk | STRONG_REASON_TO_KEEP | Splitting by domain creates 20 files that can each independently drift; several decisions are inherently cross-domain (`DEC-100` alone touches CLIN/BODY/PRO/CHO/LIP/VIT/MIN, §6) and would need to "live" in one domain file while being referenced from several others — reproducing, at a smaller scale, exactly the multi-source-of-truth risk `PROJECT_AI_PROTOCOL.md` §31 exists to prevent. |

**Verdict: KEEP.** The only genuine pro-split argument (E) is already neutralized by existing
grep-based retrieval practice; every other criterion favors the single registry.

### 3.2 `APP_DECISION_MODEL.md`

Structure: 41 numbered sections forming one continuous architectural argument — purpose/scope/
traceability (§1–3) → ten core principles (§4) → high-level flow, layers, states, gates, branches,
upstream/downstream roles, bottlenecks (§5–11) → a deep-dive per functional layer: estimation,
individualization, target-setting, prescription, allocation, translation, monitoring, feedback,
re-baselining (§12–20) → cross-cutting concerns: uncertainty, data sufficiency, safety, clinical/sport/
life-stage pathways, evidence/governance (§21–27) → traceability back to knowledge and gaps (§28–29) →
progressive personalization, granularity questions, invariants, failure modes, system representations
(§30–34) → six summary tables (§35–39) → structural conclusions (§40) → a 33-item validation (§41). The
document's own §1 states it plainly: *"This document is a synthesis, not a new analysis... This
document does not reproduce the full 112-decision inventory, the full 203-edge register, the full
~300-relationship knowledge mapping, or the full 213-topic gap matrix — those remain authoritative in
their own documents."*

| Criterion | Score | Why |
|---|---|---|
| A. Semantic cohesion | STRONG_REASON_TO_KEEP | One question throughout: "what is the architecture of the decision layer itself." |
| B. Source-of-truth cohesion | STRONG_REASON_TO_KEEP | Explicitly non-duplicative by design (quoted above); it is the sole authority for *architectural* claims (layers, gates, states) while deferring content authority to the other four documents. |
| C. Update lifecycle | STRONG_REASON_TO_KEEP | A structural change (e.g. a new feedback edge) cascades through flow (§5), layers (§6), states (§7), bottlenecks (§11), and the summary tables (§35–39) simultaneously — these sections are never updated independently of each other. |
| D. Dependency cohesion | STRONG_REASON_TO_KEEP | The highest of any document reviewed: §6 explicitly refines §5's flow; §9's branch model explicitly depends on §6's Layer-9 refinement; §39 explicitly consolidates open questions surfaced throughout §24–§31. Reading any one section in isolation risks misunderstanding a refinement made two sections earlier. |
| E. Retrieval efficiency | MODERATE_REASON_TO_KEEP | Unlike the Inventory, a question like "is `DEC-027` a gate?" is not answered by one isolated paragraph — §8's gate classification cites the flow (§5), the layer model (§6), and is cross-checked against the open-questions table (§39). The document is designed to be read as connected prose, not as independent records. |
| F. Human usability | STRONG_REASON_TO_KEEP | Human review of an architectural synthesis benefits from linear narrative continuity; a reviewer checking "does the model hold together" needs to follow the argument, not reassemble it from files. |
| G. Stable-ID navigation | NEUTRAL | Not a per-`DEC` lookup document; navigated by topic/section, not by ID. |
| H. Cross-reference complexity | STRONG_REASON_TO_KEEP | Internally self-referential throughout (`§6's refinement`, `§39's table`, etc.) in a document meant to be read once, start to finish; splitting would convert a continuous argument into a maze of cross-file pointers for no compensating benefit. |
| I. Context-window efficiency | MODERATE_REASON_TO_KEEP | At 1,202 lines this is the smallest of the five and not a genuine context problem; an agent needing only "the gates" can already `Grep` for `# 8\.` without loading the rest. |
| J. Governance risk | STRONG_REASON_TO_KEEP | A synthesis document split into pieces risks each piece silently drifting into its own partial, potentially contradictory synthesis — precisely the failure mode a *synthesis* document exists to prevent. |

**Verdict: STRONGLY KEEP.** This is the clearest "coherent narrative that must not be split" case among
the five — every criterion but one is a KEEP, and the one exception (G) is simply not applicable to this
document's retrieval pattern.

### 3.3 `APP_DECISION_KNOWLEDGE_MAPPING.md`

Structure: §1–4 front matter (purpose, mapping principles, knowledge/decision universe summaries,
~140 lines) → §5 **Decision → Knowledge Mapping** (~585 lines, the forward direction, domain-grouped
per-decision tables) → §6 Complete Decision Coverage Table (~122 lines, a derived roll-up of §5) → §7
**Knowledge → Decision Mapping** (~115 lines, the *reverse* direction of the *same* relationship,
explicitly not a formality per the document's own §1: *"it is what surfaces knowledge hubs, knowledge
islands, and topics that... currently have no consumer-facing decision role"*) → §8 Complete Knowledge
Utilization Table (~192 lines, derived) → §9–19 (~340 lines: knowledge hubs, knowledge islands,
bottlenecks, personalization/longitudinal/translation knowledge structures, evidence-dependent
knowledge, potential gaps, centrality summary, structural observations, open questions) → §20
validation.

| Criterion | Score | Why |
|---|---|---|
| A. Semantic cohesion | STRONG_REASON_TO_KEEP | One relationship (213 topics ↔ 112 decisions), examined bidirectionally by explicit design — not two topics accidentally sharing a file. |
| B. Source-of-truth cohesion | STRONG_REASON_TO_KEEP | Single authority for the topic↔decision relationship in both directions. |
| C. Update lifecycle | MODERATE_REASON_TO_KEEP | §5/§7 (raw mapping) update whenever a decision or topic mapping changes; §9–19 (derived structural analyses) only need recomputation if the *pattern* materially shifts — a real but small lifecycle difference, and the derived section is short (~340 of 1,599 lines) relative to the raw mapping it derives from. |
| D. Dependency cohesion | STRONG_REASON_TO_KEEP | §7 is definitionally the transpose of §5's own data. Splitting them into separate files creates exactly the risk the investigation brief itself named for this document (§7 of the task): the two directions silently diverging. |
| E. Retrieval efficiency | MODERATE_REASON_TO_SPLIT, mitigated | "What does `DEC-060` need" only needs its own ~10-line §5 entry — but as with the Inventory, this is already solved by targeted search without splitting the file. |
| F. Human usability | NEUTRAL | No strong signal either way. |
| G. Stable-ID navigation | MODERATE_REASON_TO_KEEP | Reverse-direction lookups (by topic ID, e.g. "what uses `ASSESS-01`") benefit from being adjacent to the forward mapping for manual cross-checking. |
| H. Cross-reference complexity | STRONG_REASON_TO_KEEP | §20's own validation explicitly cross-checks §5 against §7/§8's counts in one pass (verified: the document performs an internal completeness audit that requires both directions present together). Splitting would force that audit to open two files and diff them instead of reading one. |
| I. Context-window efficiency | MODERATE_REASON_TO_SPLIT, mitigated | Same grep-based mitigation as Inventory. |
| J. Governance risk | STRONG_REASON_TO_KEEP | This is precisely the risk this investigation's own brief (§7) hypothesized for this document — **confirmed true on direct inspection, not merely assumed**: splitting by domain would produce duplicate mappings, missing mappings, and would break the completeness audit §20 currently performs in one place. |

**Verdict: KEEP.** The brief's own hypothesis about this document (bidirectional-registry risk if split)
is independently confirmed by reading it, not merely accepted on the brief's authority.

### 3.4 `APP_DECISION_GAPS.md`

Structure: §1–4 front matter (purpose, ten-category `GAP-A`–`GAP-J` taxonomy, baseline, coverage
overview, ~130 lines) → §5 **Complete Decision Gap Matrix** (~141 lines, the canonical per-decision
classification against the taxonomy) → §6–13 (~330 lines, eight **domain/severity-specific deep-dive
sections**: Critical Decision Gaps, Personalization Gaps, Longitudinal/Feedback Gaps, Practical
Translation Gaps, Food Substitution Gaps, Clinical Gaps, Sport Gaps, Research/Evidence Gaps) → §14
Complete Knowledge Utilization Gap Matrix (~189 lines, derived) → §15–24 (~340 lines: knowledge hubs and
cascade risks, decision bottlenecks, content-inspection priorities, current-evidence priorities,
potential new knowledge domains, intentional non-gaps, a prioritized P0–P3 matrix, structural findings,
open questions, validation).

Direct inspection of §6–13 confirms each deep-dive explicitly derives from, and opens by citing, §5's
single canonical matrix — e.g. §6 Critical Decision Gaps opens *"The five decisions carrying `CRITICAL`
or bottleneck-`HIGH` severity in §5, examined individually."* These eight sections are **analytical
filters of one underlying classification**, not eight independently-sourced artifacts with their own
update lifecycles, despite superficially reading like eight separate topics (clinical, sport, research,
etc.) that different reviewers might each specifically care about.

| Criterion | Score | Why |
|---|---|---|
| A. Semantic cohesion | STRONG_REASON_TO_KEEP | One taxonomy, one canonical matrix, applied consistently. |
| B. Source-of-truth cohesion | STRONG_REASON_TO_KEEP | §5 is the sole per-decision classification authority; §6–14 never introduce a new classification, only filter/aggregate the existing one. |
| C. Update lifecycle | STRONG_REASON_TO_KEEP | §6–13 update exactly when §5 changes for a decision in their scope — confirmed by their own citation pattern, not an independent cadence. |
| D. Dependency cohesion | STRONG_REASON_TO_KEEP | Every §6–13 section's factual content traces to §5; none stands alone. |
| E. Retrieval efficiency | MODERATE_REASON_TO_SPLIT | A clinical reviewer plausibly wants only §11 (Clinical Gaps, ~30 lines); a sport reviewer only §12. This is the strongest pro-split signal in this document — different domain owners genuinely have different primary sections of interest. |
| F. Human usability | NEUTRAL to MODERATE_REASON_TO_KEEP | Each domain section is short (20–50 lines) and constantly cites back to §5 — a domain reviewer would still need §5 open alongside a hypothetical standalone clinical-gaps file, so splitting doesn't remove a dependency, it just relocates it across a file boundary. |
| G. Stable-ID navigation | STRONG_REASON_TO_KEEP | §5's matrix is the exact-`DEC`-ID lookup surface; fragmenting it by domain would mean a `DEC` spanning domains (rare but present) has no single home. |
| H. Cross-reference complexity | STRONG_REASON_TO_KEEP | §14–24's structural findings, priority matrix, and validation all read across §5 and §6–13 together; splitting multiplies the citations needed to reconstruct any one finding. |
| I. Context-window efficiency | MODERATE_REASON_TO_SPLIT, mitigated | Same grep-based mitigation as the other decision-family documents — a task like "review clinical gaps" can target `## 11\.` directly today. |
| J. Governance risk | STRONG_REASON_TO_KEEP | Splitting §6–13 out as independent "gap-class" files while §5 remains canonical elsewhere would create eight satellite files that must never contradict a ninth (§5) — a fragile arrangement for content that is, by the document's own construction, 100% derivable from §5 already. |

**Verdict: KEEP.** The one real pro-split signal (E — different domain owners want different sections)
is outweighed by the fact that every domain section is *already* a self-labeled excerpt of §5, reachable
by heading-level grep, and physically separating them would not remove any reviewer's dependency on §5
— only add a file boundary in the middle of it.

---

## 4. APP_DECISION_INVENTORY Analysis (Options I-A / I-B / I-C)

Specific comparison requested for the 112-decision registry (`DEC-001`–`DEC-112`).

**Option I-A — Single canonical inventory (current state).**
- Stable-ID retrieval: exact, one grep, zero indirection.
- Ordering: sequential within domain, domains in the task-brief's fixed A–T order — a single, stable
  read order.
- Domain grouping: already present as `##` headings within the one file (§4.1).
- Cross-dependencies: the 203-edge dependency graph and the §6 cross-domain table both assume the whole
  registry is one addressable space; several `DEC`s (`DEC-100` most notably) are cited from multiple
  domains simultaneously.
- Human review: one document to read for a full audit (as performed during Gate 5/Gate 6 closures,
  confirmed against `PROJECT_STATUS.md`'s own audit-history entries).
- Machine retrieval: proven in this project's own practice — `DEC-067`'s exact text was retrieved by
  grep-with-line-range earlier in this project's history without reading the surrounding 2,000+ lines.
- Duplication risk if split: **real** — a cross-domain decision like `DEC-100` would need a canonical
  home in one domain file while at least six other domains cite it; any edit to its text would have to
  be checked against every citing file, not just re-read from one place.
- Maintenance: lowest of the three options — one file, one field legend, one place a new `DEC` is added.

**Option I-B — One inventory index + domain-specific `DEC` files (20 files, A–T).**
- Preserves stable IDs (ranges are already contiguous, so a domain-based split would not require
  renumbering) but adds one lookup step (which domain file is `DEC-067` in?) that the index would need
  to answer — functionally re-implementing §3's domain-map table as a second artifact.
- Breaks single-source-of-truth for the ~9 decisions this investigation confirmed are explicitly
  cross-domain in a load-bearing way (§6 of the Inventory: `DEC-019`, `DEC-021`, `DEC-031/032`,
  `DEC-045`, `DEC-047/048`, `DEC-060`, `DEC-083/110`, `DEC-095`, `DEC-100`) — each would need to pick one
  "home" domain file while being materially about others.
- Raises maintenance cost: 20 files' field-legend consistency to keep aligned, 20 files' worth of
  "did I add this decision to the index too" discipline, versus one file today.
- No evidence any current or historical task in this project has needed "all of Domain F [Macronutrients]
  and nothing else" as an actual retrieval unit — Phase 7/8/9 work has consistently needed specific
  `DEC` IDs across domains together (e.g. Phase 9's capability map spans Domains K/L/M as one table),
  not whole domains in isolation.

**Option I-C — One canonical registry + separate derived domain views.**
- This is, in effect, **what already exists**: §5–13 of the Inventory are exactly "derived views" (the
  personalization loop, cross-domain decisions, high-personalization decisions, etc.), just co-located
  in the same file as the registry they derive from rather than externalized into separate files.
- Externalizing them would not change their authority (still 100% derived from §4) but would add
  file-boundary overhead for content that is currently ~275 lines total (13% of the file) and already
  clearly demarcated by its own `#` headings.
- The stronger version of I-C — separate files *by consumer* (e.g. a "Domain L implementation view" a
  future Phase 9-style document could own) — is exactly the role `PHASE_9_APPLICATION_CAPABILITY_
  ARCHITECTURE.md` §2 already plays for Domains K/L/M: a derived, consumer-specific view that cites
  `DEC` IDs by number rather than reproducing their inventory text. This pattern is already correctly in
  use; it does not require touching the Inventory itself.

**Conclusion: Option I-A (current state) best preserves stable IDs, single source of truth, easy agent
retrieval, human review, and low maintenance.** Option I-B's only advantage (smaller individual files)
is not a real retrieval win given proven grep-based access, and its cost (fragmenting genuinely
cross-domain decisions) is concrete and already evidenced in the registry's own §6. Option I-C already
exists in the form that matters (Phase 9's own derived capability view); a further, purely-Inventory-
internal I-C split would just relocate content that is already well-organized in place.

---

## 5. APP_DECISION_MODEL Analysis

Determined by direct read (§3.2 above): the ~1,200-line model is **one coherent conceptual artifact**,
not several independently evolving models and not a core model with extractable appendices.

Specifically checked, per the task's list:

- **Core principles (§4), decision lifecycle (§7–8, states/gates), personalization model (§30),
  safety model (§23), feedback model (§18–20), uncertainty model (§21), implementation translation
  (§17)** — all cross-reference each other explicitly and are consolidated together in the §35–39
  summary tables and the §40 structural conclusions. They are not eight separate models sharing a file;
  they are eight facets of one architecture, each one a named lens on the same 112-decision/203-edge
  structure, explicitly validated against each other (e.g. §40 conclusion 2 identifies `DEC-001`,
  `DEC-021`, `DEC-084` as the model's "center of gravity" using *three different analytical lenses
  simultaneously* — dependency-graph fan-out, knowledge-mapping citation counts, gap-analysis severity —
  which is only possible because those lenses live in one place able to be cross-checked against each
  other).
- No appendix-shaped section was found. Every section either builds the argument forward or closes it
  (validation, structural conclusions). There is no "reference material bolted onto the end" pattern
  here, unlike the more registry-like documents.

**Not recommended for splitting**, and no split is proposed. This is the one document among the five
where the "coherent narrative" reading is essentially unambiguous.

---

## 6. KNOWLEDGE_MAPPING Analysis

The `213 topics ↔ 112 decisions` mapping is, by direct inspection and by the document's own explicit
self-description (§1: *"deliberately bidirectional... the second direction is not a formality"*), a
**canonical many-to-many registry**, not a collection of independent domain mappings and not merely a
registry-plus-views arrangement in the loose sense (it is that too, but the registry itself is
irreducibly two-directional).

Splitting by domain was evaluated against the three risks the task named:

- **Duplicate mappings:** confirmed real. A cross-domain-cited topic (e.g. `ASSESS-01`, cited by 20+
  decisions per §19's own open-questions table) would need to appear, consistently, in however many
  domain files its citing decisions were split across — the single most obvious duplication vector.
- **Missing mappings:** confirmed real. §7's reverse-direction mapping exists specifically to catch
  topics with *no* decision consumer (knowledge islands, §10) — a per-domain split would make it
  structurally harder to notice a topic with zero citations anywhere, since no single file would be
  responsible for the *complete* topic universe the way §7/§8 are today.
- **Reconciliation problems / broken completeness audits:** confirmed real and already load-bearing —
  §20's validation summary explicitly reconciles §5's decision-side counts against §7/§8's topic-side
  counts as one check. This audit is only cheap because both directions are in one file; splitting would
  turn it into a cross-file diff.

**Not recommended for splitting.**

---

## 7. GAPS Analysis

The ten-category (`GAP-A`–`GAP-J`) taxonomy is applied once, canonically, in §5's Complete Decision Gap
Matrix. §6–13's eight "gap classes" (Critical, Personalization, Longitudinal/Feedback, Practical
Translation, Food Substitution, Clinical, Sport, Research/Evidence) read, at first glance, like
plausibly-independent domain files a domain-specific reviewer might want — but direct inspection (§3.4
above) confirms each one explicitly derives from and cites §5 as its source, not an independent
classification with its own ownership or lifecycle.

**Ownership/lifecycle finding:** all eight classes share the same lifecycle (they change only when §5's
classification for a decision in their scope changes) and, per this investigation's reading, do not have
genuinely different *update triggers* — a Gate closure or a knowledge-corpus extension (like Phase 8's
On Cooking 7e addition) updates §5 first, and §6–13 are then re-derived, never edited independently of
it. This is confirmed by the document's own internal citation pattern, not assumed from the section
titles.

**Not recommended for splitting**, notwithstanding that §6–13's domain framing is the closest any of the
four decision documents comes to "looks like it should be several files" — on inspection, it is one
matrix with eight labeled excerpts, not eight artifacts.

---

## 8. Phase 9 Semantic Map

`PHASE_9_APPLICATION_CAPABILITY_ARCHITECTURE.md` (2,276 lines) is structurally different from the four
Phase 3 documents: it is not one homogeneous registry. Direct inspection of its full section map
confirms it is an **append-only accretion of (at least) six successive passes**, each dated and scoped
differently, several already marked superseded by the prior maintenance pass:

| Section range | Pass | Purpose | Canonical/derived | Current or historical |
|---|---|---|---|---|
| §0–§2 | First milestone | Baseline recovery, five-layer boundary model, `DEC-060`–`075` capability map | Canonical (the capability map is this document's own foundational artifact) | Current — §2's map is still the referenced capability table throughout the rest of the document |
| §3–§9 | First milestone (cont.) | Gap classification, implementation dependencies, reusable knowledge primitives, scientific-authority boundary, practical-translation reconciliation, human decisions required, what's not implemented | Canonical for the first-milestone scope | Mostly current; §8's two human decisions were later resolved elsewhere (DEC-067 ratified outside this document; DEC-069 still open) |
| §10–§11 | First-milestone close | Self-audit, status | Derived (audit) | **Superseded** — carries an explicit banner: *"Current Phase 9 status is §20.13; the current implementation ordering is §20.4."* |
| §12–§13 | Second pass | Dependency analysis / minimum information architecture (13-area inventory) | Canonical for that pass's scope | **Superseded** (banner present) |
| §14–§15 | Third pass | Domain-boundary + implementation-readiness analysis (concept classification, Food-Identity conceptual answers, `combos.json`/nutrition/safety/shopping boundaries, readiness matrix, recommended order) | Canonical for that pass's scope | **Superseded** (banner present) |
| §16 | Human decision packages | Package A (Food Identity), Package B (Safety/Exclusion), Package C (DEC-067/069 options), cross-dependency analysis | Human decision record (at the time) | **Historical** — Package A resolved by the separate Canonical Food Identity investigation/implementation; Package B resolved by the 2026-09-07 safety ratification; Package C's DEC-067 half resolved by the separate 2026-09-08 ratification, DEC-069 half still open |
| §17 | Reconciliation audit | `DEC-038`/`DEC-053`/`DEC-061` collection-surface audit, four semantic pipelines, UI audit, minimum-correction classification | Investigation record | Current as an audit trail; its findings feed §18–20 |
| §18 | Human safety decision review package | Decision A (intolerance semantics), B (exclusion unit), C (temporary exclusion), cross-decision interaction, impact matrix | Human decision record (pre-ratification) | Historical once §19 ratified it, kept for provenance |
| §19 | Human safety decision ratification | A1/B3/C2 recorded, downstream consequences, explicitly-unresolved list | **Restatement of an external canonical record** | Carries an explicit **precedence banner**: *"Authoritative source... That decision record owns A1/B3/C2... If the two ever diverge, the decision record governs."* — a deliberately-marked, not accidental, duplication |
| §20 (14 subsections) | Post-ratification implementation readiness | Layer assignment, 26-capability readiness map, implementation dependency order, minimum first milestone, reconciliation of the existing implementation, user/household scope, `DEC-067`/`069` boundary, `DEC-099`/`100` boundary, data gaps, safety invariants, first implementation boundary, current status, self-audit | Canonical — **the current state of the whole document** | **Current** — §20.13 is the document's own stated "status after this pass" |

**Semantic ownership grouping (not the current heading hierarchy):**

1. **Foundational architecture** (§1–9): the five-layer model and the `DEC-060`–`075` capability map —
   still current, still the thing §20 builds on.
2. **Historical passes kept for provenance** (§10–15): three superseded status checkpoints, each
   correctly bannered, none deleted.
3. **Resolved human-decision packages** (§16, §18): now-historical decision inputs, two of three fully
   resolved outside this document (Food Identity, Safety), one partially resolved outside this document
   (DEC-067 half of Package C).
4. **A duplicated-but-precedence-marked ratification restatement** (§19): correctly marked, not a silent
   risk, but still literally the same content living in two files by design.
5. **The current, authoritative architecture-and-readiness state** (§17, §20): the reconciliation audit
   and the post-ratification readiness map — this is what a new reader actually needs to know "what is
   Phase 9's status right now."

This five-way grouping is the real shape of the document — not a single accreted mess, but also not a
single homogeneous artifact. It is closer to **an append-only engineering log with one current summary
at the end**, a legitimate and intentional pattern (confirmed by the document's own repeated
self-description as "first/second/third/.../sixth milestone" and its explicit "not rewritten, per this
document's own convention" language at §10–15's banners) — not an accident.

---

## 9. Candidate Bounded Documents

Internal self-citation density measured directly: **333 occurrences of `§<number>`** inside
`PHASE_9_APPLICATION_CAPABILITY_ARCHITECTURE.md` alone — extremely high for a 2,276-line document,
confirming very high internal dependency cohesion regardless of the document's accretive history.

Three candidate boundaries were evaluated against the seven stated questions (distinct question /
distinct source-of-truth role / distinct update lifecycle / agent-needs-it-alone / reduces context load
/ cross-reference burden / competing-sources-of-truth risk):

**Candidate 1 — Extract §2 (the `DEC-060`–`075` Capability Architecture Map) as its own document.**
Has a somewhat distinct question ("what capability maps to which decision" vs. "how does this become
software"), but no distinct source-of-truth role (it is Phase 9's own foundational artifact, not a
derived summary of something else) and no distinct update lifecycle (§3's gap classification and §4's
implementation dependencies are direct, row-by-row consumers of §2 and are edited together with it in
practice). Only ~55 lines; extracting it would not meaningfully reduce context load, and §16/§17/§20
all cite specific §2 rows by `DEC` ID, so extraction would multiply cross-file pointers for a table
smaller than this analysis paragraph. **Not justified.**

**Candidate 2 — Extract the human decision packages (§16, §18) as standalone documents, separate from
the architecture reconciliation that follows.**
This has a genuinely distinct question ("what must a human decide" vs. "how is the architecture
reconciled once decided") and, in principle, a distinct lifecycle and audience. But the project **already
has a working, validated pattern for exactly this role**, applied prospectively rather than
retroactively: the separate `00_PROJECT_CONTROL/DECISIONS/` ratification records (the 2026-09-07 safety
ratification, the 2026-09-08 DEC-067 ratification) and the separate satellite investigation documents in
this same `08_APP_TRANSLATION/` folder (`CANONICAL_FOOD_IDENTITY_INVESTIGATION.md`,
`DEC-067_PREPARATION_DETAIL_INVESTIGATION.md`, `DEC-067_LEVEL_1_IMPLEMENTATION_INVESTIGATION.md`) already
do this job cleanly for every package that has actually been resolved, without touching Phase 9's file
at all. Retroactively extracting the now-historical §16/§18 content would rearrange settled record with
no live benefit, while breaking the dense internal anchors §19 and §20 hold directly on §16.1's and
§18's exact subsection numbers. **Not justified as a retroactive extraction — the correct pattern
already exists and should simply continue to be used prospectively** (e.g., whenever `DEC-068` or
`DEC-069` reaches its own human-decision point).

**Candidate 3 — Split "historical/superseded passes" (§0–15) into a HISTORY file, keep "current state"
(§16–20) as Phase 9 proper.**
The most plausible candidate on its face: distinct question (what happened vs. what's true now),
plausible distinct lifecycle (history is frozen, current keeps growing), and real potential context-load
reduction (§0–15 is ~1,550 of 2,276 lines). It fails on cross-reference burden: §20 alone (confirmed by
direct inspection of §20.14's self-audit) explicitly cites facts established in §0.1, §12.1, §14.10,
§16.1, §17, and §18 as load-bearing premises, not passing mentions. A clean split would force either (a)
duplicating those cited facts into the "current" file — directly violating `PROJECT_AI_PROTOCOL.md` §31,
which this very corpus has repeatedly avoided doing elsewhere — or (b) leaving "current" full of
cross-file pointers into "history" for facts it still structurally depends on, which does not reduce
what an agent must ultimately read, it only relocates the pagination and adds a file-open. **Net
benefit is weak-to-negative once the cross-reference cost is accounted for, and this candidate directly
reproduces the exact split the prior 2026-09-08 maintenance pass already considered and rejected in
favor of banners** (§2 above) — this investigation's independent analysis reaches the same conclusion
via the seven-question test, not by deferring to that pass's authority.

**No candidate boundary inside Phase 9 clears the bar.**

---

## 10. Canonical vs Derived Classification

| Artifact (existing or hypothetical) | Classification | Basis |
|---|---|---|
| `APP_DECISION_INVENTORY.md` (whole file) | CANONICAL | Sole origin of every `DEC-###` definition |
| Inventory §5–13 (derived views) | DERIVED | Computed from §4; explicitly non-authoritative on their own |
| `APP_DECISION_MODEL.md` (whole file) | DERIVED (synthesis) | Explicitly non-duplicative by its own §1; authoritative only for *architectural* claims, not for any `DEC`/topic/gap content it cites |
| `APP_DECISION_KNOWLEDGE_MAPPING.md` §5/§7 | CANONICAL | Sole origin of the topic↔decision relationship, in both directions |
| Knowledge Mapping §6/§8/§9–19 | DERIVED | Roll-ups and structural analyses of §5/§7 |
| `APP_DECISION_GAPS.md` §5 | CANONICAL | Sole origin of each decision's gap classification |
| Gaps §6–14/§15–24 | DERIVED | Filters, aggregates, and priority views of §5/§14 |
| Phase 9 §1–9 (foundational architecture) | CANONICAL | Sole origin of the five-layer model and the `DEC-060`–`075` capability map |
| Phase 9 §10–15 (superseded passes) | HISTORICAL / IMPLEMENTATION RECORD | Explicitly bannered as superseded; retained for provenance, not for current guidance |
| Phase 9 §16, §18 | HUMAN DECISION RECORD (historical) | Two of three packages resolved elsewhere; kept as the original review material those resolutions responded to |
| Phase 9 §19 | HUMAN DECISION RECORD (derived restatement) | Explicitly subordinate to `DECISIONS/2026-09-07-phase-9-safety-decisions-ratification.md`, which is the true CANONICAL record |
| Phase 9 §17, §20 | CANONICAL (current state) | The architecture's authoritative current status and reconciliation |
| `00_PROJECT_CONTROL/DECISIONS/*.md` (ratification records) | HUMAN DECISION RECORD | Canonical for the specific ratified answer; do not redefine any `DEC` |
| `CANONICAL_FOOD_IDENTITY_INVESTIGATION.md`, `DEC-067_*_INVESTIGATION.md` | TEMPORARY INVESTIGATION (now closed) | Bounded, dated, scoped to one human-decision package; cited by Phase 9 rather than replacing any of it |
| `docs/SESSION_CHECKPOINT.md` | SESSION/STATUS ARTIFACT | Active continuation state; explicitly distinct from `PROJECT_STATUS.md` (durable phase status) and the Vault logs (historical record) |

**Governing rule applied throughout:** a separate file is justified only when its authority, lifecycle,
or retrieval role differs from its neighbor — not merely because a section reads like a distinct topic.
By this rule, the corpus's existing satellite-document pattern (ratification records + investigation
artifacts, both already in active, working use for DEC-067 and Canonical Food Identity) is the *correct*
mechanism for genuinely new canonical/derived splits going forward — not a physical restructuring of the
five documents this investigation was asked to evaluate.

---

## 11. Duplication / Source-of-Truth Analysis

Checked across Phase 9, the four Phase 3 documents, the Dependency Graph, the DEC-067 artifacts, the
Food Identity investigation, the B3/allergen documentation, and the project status/checkpoint files.

| Instance | Classification | Note |
|---|---|---|
| `APP_DECISION_MODEL.md` citing the other four documents' facts by section number rather than reproducing tables | Intentional cross-reference | Explicitly stated policy (§1: "does not reproduce... remains authoritative in their own documents") |
| Phase 9 §19 restating the 2026-09-07 safety ratification's A1/B3/C2 content | Duplicated canonical information, **but explicitly marked with a precedence banner** | Resolved risk — the banner names the true authority and the resolution rule ("if the two ever diverge, the decision record governs") |
| Phase 9 §11/§13/§15 (superseded status sections) | Necessary summary / intentional historical record | Explicitly bannered as superseded, pointing to §20.13/§20.4; not misleading in current form |
| Phase 9 §20.13 listing "canonical Food identity's anchor" among items **"still open, unchanged"** | **Stale duplication — unclear/incorrect authority, confirmed still present** | This was already flagged once, in `DEC-067_LEVEL_1_IMPLEMENTATION_INVESTIGATION.md` §2, as stale (Food Identity's anchor question was resolved and *implemented* by the later Canonical Food Identity milestone). It remains uncorrected as of this pass. Per this investigation's own hard constraints, this is reported again, not fixed. |
| DEC-067 satellite documents (investigation, implementation-investigation, ratification) citing Phase 9 §8/§16.3/§20.7/§20.8 rather than restating them | Intentional cross-reference | Confirmed by direct grep — these documents anchor to specific Phase 9 sections without reproducing their content |
| `CANONICAL_FOOD_IDENTITY_INVESTIGATION.md` not citing Phase 9 by filename at all | Not a defect | This document predates/stands independently of Phase 9's own citation of it (Phase 9 §16.1 cites *it*, not the reverse) — a legitimate one-directional citation pattern for a satellite investigation Phase 9 later incorporated as a Decision Package |
| `docs/SESSION_CHECKPOINT.md` vs. `PROJECT_STATUS.md` vs. Vault logs | Necessary summary, non-duplicative by design | Explicitly different scopes stated in `CLAUDE.md`/each file's own header (active state / durable phase status / historical record) — a working three-tier pattern, cited here only as a positive precedent, not re-examined for defects (out of this investigation's scope) |
| The four Phase 3 documents' shared baseline facts (112 decisions, 203 edges, 213 topics) restated in each document's own §1–4 | Necessary summary | Each restatement is a short, explicitly-labeled "carried forward, unmodified" recap (confirmed in Gaps §3's own wording), not an independent re-derivation — low risk |

**No new source-of-truth conflict was found beyond the one already flagged (Phase 9 §20.13's stale Food
Identity line).** That single instance remains the only unresolved duplication/authority risk identified
across this entire investigation. It is not fixed here, per this task's explicit constraints.

---

## 12. AI Context and Retrieval Analysis

Qualitative reasoning only, grounded in what each named task actually requires — no token counts
invented.

**Task A — "Implement `DEC-068`."** Needs: the Inventory's `DEC-068` record (~15 lines, one grep);
`DECISION_LOGIC_SPECIFICATION.md`'s Phase 7 entry if drafted; Phase 9 §2.2's capability-map row for
`DEC-068`; Phase 9 §20.12's implementation-boundary list (to check whether `DEC-068`-adjacent work is
inside or outside the current authorized milestone). Does **not** need: the Model's narrative, the full
Knowledge Mapping or Gaps matrices, or any of Phase 9's superseded §11/13/15. A disciplined agent reads
under 100 lines total across two files; nothing about the current file sizes forces more than that.

**Task B — "Change shopping Food-ID behavior."** Needs: the actual source (`foodIdentity.ts`,
`listActions.ts`), `CANONICAL_FOOD_IDENTITY_INVESTIGATION.md` §17's six approved decisions, and Phase 9
§16.1/§20.6/§20.7. Needs **none** of the four Phase 3 decision documents — Food Identity is a
product/implementation-architecture concern the knowledge-mapping/gap-taxonomy layer never addresses.
This confirms the Phase 3 family and Phase 9 already serve cleanly separable task types; there is no
retrieval pressure to merge them or to mirror Phase 9's sections onto the Phase 3 documents' structure.

**Task C — "Review safety/exclusion behavior."** Needs: Phase 9 §16.2, §18, §19 (with its precedence
banner honored — the actual 2026-09-07 ratification record is authoritative), §20.0–20.2, §20.9, §20.11;
plus `src/lib/foodExclusions.ts`/`allergenClasses.ts`. Does **not** need §0–15's earlier passes or any
Phase 3 document (DEC-053/061's own specification lives in Phase 7's `DECISION_LOGIC_SPECIFICATION.md`,
cited not reproduced). Confirms that, within Phase 9 itself, a real task needs a specific, contiguous
band of sections (§16–20), reachable by heading-level grep — not the whole 2,276-line file.

**Task D — "Understand the overall application architecture."** This is the one task type that
genuinely benefits from reading Phase 9 in full (plus `PROJECT_STATUS.md` for phase context) — it is
exactly the task the document was written for. Splitting Phase 9 would directly work against this task
by forcing an onboarding agent to reassemble the architecture from several files instead of reading one.

**Task E — "Update one `DEC` record."** Needs only that record's ~15 lines, already retrievable by grep
without reading the surrounding registry — the Inventory's current size imposes no real cost here.

**Finding:** across all five representative tasks, the monolithic structure does **not** cause
unnecessary context loading in practice, because (a) every targeted task resolves to a specific, small,
well-anchored subsection reachable by ID or heading grep, consistent with `PROJECT_AI_PROTOCOL.md` §39's
existing "targeted navigation" prescription, and (b) the one task type that needs a whole document
(Task D, and the Phase-3 equivalent "review the whole decision architecture") is precisely the type
where a single coherent file outperforms a fragmented one. The one real inefficiency risk identified is
**behavioral, not structural**: an agent that reads a large file top-to-bottom instead of searching it
wastes context regardless of whether the file is 500 or 2,500 lines — splitting does not fix this, and
disciplined retrieval already does.

---

## 13. Architecture Options

**Architecture A — Keep current structure.**
Correctness: unaffected (nothing changes). Discoverability: already adequate given grep/heading-based
navigation and the existing domain-map/section-map tables each document provides. AI retrieval: adequate
per §12's task analysis. Human review: strong (proven across Gate 1–6 closures using exactly this
structure). Stable-ID preservation: perfect (no ID touches anything). Maintenance: lowest of any option.
Cross-reference burden: unchanged (already the corpus's current, working baseline). Source-of-truth
risk: lowest (no new files, no new authority boundaries to keep straight). Migration complexity: none.
Rollback difficulty: not applicable. Long-term scalability: adequate as long as new content continues to
use the corpus's existing satellite-document pattern (ratification records, investigation artifacts)
for genuinely new canonical/derived material, rather than growing any of the five documents' *registry*
sections indefinitely — a discipline already being followed (see DEC-067's own closeout, entirely
external to Phase 9's file).

**Architecture B — Split Phase 9 only.**
Correctness: at risk during migration (content-loss/contradiction risk during a 2,276-line reorganization
is nontrivial). Discoverability: potentially improved for onboarding *if* done well, but §9's candidate-
boundary analysis found no boundary that survives its own cross-reference-burden test without either
duplicating cited facts (violating §31) or merely relocating pagination. AI retrieval: per §12's Task
D finding, actively worse for the "understand the architecture" task, neutral-to-marginally-better for
narrow tasks that are already well-served by heading-level grep today. Human review: mixed — a reader
who wants "just current state" would benefit, but the append-only audit trail these documents are used
for (see PROJECT_STATUS.md's own Gate-closure audit history) depends on being able to trace how the
current state was reached, which a hard history/current split would fragment. Stable-ID preservation:
not directly at risk (Phase 9 has no ID registry of its own), but the extremely dense internal
`§`-cross-reference network (333 instances) would need systematic rewriting to new file-qualified
references — a large, error-prone mechanical task. Cross-reference burden: increases materially (§9's
Candidate 3 analysis). Source-of-truth risk: increases — a "current" file that must restate enough
superseded reasoning to be self-contained starts becoming its own competing description of decisions
already recorded in "history." Migration complexity: high. Rollback difficulty: moderate (Git history
would preserve the pre-split state, but reconstructing the exact cross-reference web would not be
mechanical). Long-term scalability: no better than Architecture A, since Phase 9 will keep growing new
"passes" regardless of how the existing ones are filed.

**Architecture C — Full documentation-family restructuring (Phase 9 + decision architecture).**
All of Architecture B's costs, applied to five documents instead of one, plus the Phase 3 family's own
confirmed risks (§3.1–3.4): duplicate/missing mappings, broken completeness audits, fragmented
cross-domain decisions. No criterion in this investigation's analysis favors this option over A for any
of the five documents. Not recommended.

**No fourth architecture was found more appropriate than A.** The one genuine improvement opportunity
identified — better surfacing of Phase 9's current-vs-superseded status — is not a restructuring at all;
see §14.

---

## 14. Recommended Architecture

**Smallest safe change, explicitly not optimized for file count: keep all five documents exactly as
they are. No document should be split.**

Explicit per-document answers:

- **Should Phase 9 be split? No.** §8–9's semantic map and candidate-boundary analysis found a real
  (and already-diagnosed, already-partially-mitigated) accretion pattern, but no boundary that survives
  its own cross-reference-burden test. This investigation's independent seven-question analysis reaches
  the same conclusion the prior 2026-09-08 maintenance pass reached, via direct re-examination rather
  than deference to that pass's authority.
- **Should `APP_DECISION_INVENTORY.md` be split? No.** The registry's uniform per-record structure makes
  it the closest thing to "looks splittable" among the five, but genuinely cross-domain decisions
  (`DEC-100` etc.) and proven grep-based retrieval both argue against it (§4).
- **Should `APP_DECISION_MODEL.md` be split? No, and not close.** The strongest KEEP case of the five —
  a single synthesis document whose entire value is that it cross-validates the other four documents in
  one place (§5).
- **Should `APP_DECISION_KNOWLEDGE_MAPPING.md` be split? No.** Its bidirectional design and the §20
  completeness audit that depends on both directions being co-located are concrete, confirmed reasons,
  not merely the brief's hypothesis (§6).
- **Should `APP_DECISION_GAPS.md` be split? No.** Its eight domain-flavored sections read as the most
  plausible split candidate of the four decision documents, but are confirmed, on inspection, to be
  excerpts of one canonical matrix (§5 of that document) rather than independent artifacts (§7).
- **Does the answer differ by document? Only in degree of temptation, not in conclusion.** The Gaps
  document (its eight domain sections) and the Inventory (its uniform per-record shape) are the two
  documents where a naive line-count-driven read would most plausibly recommend splitting; both turn out,
  on the cohesion-criteria analysis, to have real internal reasons not to. The Model document is the
  clearest KEEP case; Phase 9 is the most *structurally* accreted of the five but still fails every
  concrete split-boundary test once cross-reference cost is counted.

**The one concrete, low-risk improvement this investigation surfaces — offered as an observation, not
a recommendation to act on now, and explicitly not performed as part of this investigation:** Phase 9's
existing supersession-banner pattern (added in the 2026-09-08 maintenance pass) is a proven, low-risk
mitigation for exactly the "reader lands on stale guidance" problem its own accretion creates. A single
additional, consolidated status index at the top of the document (one small table: section range →
CURRENT/SUPERSEDED/HISTORICAL → pointer) would let a reader see the whole document's currency map
without discovering each banner by scrolling — a natural next increment along the *same already-
validated path* (extend, banner, don't split or delete), not a new direction. This is smaller in scope
than the banners already added, and is named here only as a possible future documentation-hygiene task,
not as part of this investigation's own recommendation to keep the current architecture.

---

## 15. Proposed Target File Structure

**None proposed.** Per §14, no split is recommended for any of the five documents, so there is no target
file structure to define. Per the task's own instruction ("if splitting is justified, propose a concrete
future structure"), this section is intentionally empty of a file list because splitting was found not
to be justified for any of the five documents under investigation.

If a future session's own evidence differs from this investigation's (e.g., a genuinely new consumer
emerges that needs, say, only the Gaps document's Clinical section, repeatedly, at a volume where
heading-level grep is demonstrated to be inadequate), the correct next step would be to re-run this
investigation's criteria against that new evidence — not to retroactively apply this report's "no split"
conclusion to a materially different situation.

---

## 16. Migration Strategy

**Not applicable.** No split is recommended, so no migration sequence is proposed. Should a future,
separately-authorized investigation reach a different conclusion for a specific document, the general
sequence named in this task's own §17 (freeze baseline → define target boundaries → establish
source-of-truth rules → copy/move content → add cross-references → validate stable IDs → validate no
content loss → validate no contradictory duplication → update dependent documents → human review → only
then remove obsolete sections/files) remains the right shape for that future work — it is not
customized here because there is nothing to migrate.

---

## 17. Risks

Risks in the current (unchanged) state, surfaced by this investigation and worth carrying forward even
though no action is recommended now:

1. **Phase 9 §20.13's stale "canonical Food identity's anchor... still open" line** (§11 above) is a
   live, confirmed documentation defect — not fixed here, per this task's constraints, but re-flagged
   because it has now been independently identified twice (once in `DEC-067_LEVEL_1_IMPLEMENTATION_
   INVESTIGATION.md`, once here) without correction.
2. **Phase 9's append-only accretion pattern will continue** — a seventh, eighth, ninth "pass" is likely
   as DEC-068/DEC-069/Gate 7 work proceeds. Each new pass should continue the existing convention
   (append, banner supersession, self-audit) rather than silently growing without banners, or this
   investigation's "no split needed" conclusion could eventually stop holding as the file's internal
   cross-reference count (currently 333) grows further.
3. **The Phase 3 decision-family documents' heavy external citation (11–18 files each)** means any future
   *content* change to them (not structure — content) has a wide blast radius that should be checked
   explicitly, per `PROJECT_AI_PROTOCOL.md` §36's change-discipline rule, before editing.
4. **This investigation's own conclusions are a snapshot.** If the corpus's size roughly doubles again
   (as it has done at least once, per the 24,132-line/54-file total the 2026-09-08 maintenance pass
   recorded), the criteria in §3 should be re-applied fresh rather than this report's conclusions being
   assumed to still hold by default.

---

## 18. Explicit Non-Decisions

This investigation did not decide, and explicitly leaves untouched:

- Any new `DEC` ID.
- Any application, UI, API, or database-schema behavior.
- Any Food Identity or allergen semantics.
- `DEC-068` or `DEC-069`.
- Any curriculum content or Phase 1–8 architecture.
- Any implementation detail unrelated to documentation architecture.
- Whether Phase 9 §20.13's stale line should be corrected (flagged only, per §11/§17).
- Whether a future consolidated status index for Phase 9 should be built (offered only as an
  observation, per §14).

---

## 19. Final Recommendation

**Keep all five documents exactly as they are (Architecture A).** No split, rename, merge, or physical
reorganization is justified for `APP_DECISION_INVENTORY.md`, `APP_DECISION_MODEL.md`,
`APP_DECISION_KNOWLEDGE_MAPPING.md`, `APP_DECISION_GAPS.md`, or `PHASE_9_APPLICATION_CAPABILITY_
ARCHITECTURE.md`. This conclusion was reached by direct, criteria-based inspection of each document's
actual internal structure — not by line count, and not by deference to the prior 2026-09-08 maintenance
pass's own similar conclusion, though this investigation's independent analysis arrives at the same
place for reasons it can now show concretely (dense internal/external cross-referencing, confirmed
bidirectional-registry and cross-domain-decision risks, proven grep-based retrieval already solving the
one real pro-split argument that recurs across every document). The corpus's existing satellite-document
pattern — dated ratification records in `00_PROJECT_CONTROL/DECISIONS/` and bounded investigation
artifacts in `08_APP_TRANSLATION/` — is the correct, already-validated mechanism for any genuinely new
canonical or derived material going forward, and should continue to be used prospectively rather than
motivating a retroactive restructuring of the five documents this investigation examined.
