# Food recommendation and recipe layer research

Date: 2026-09-12. Research task completed; proposal awaits human review, with no formal phase gate
opened or closed. No implementation or commit/push was authorized or performed.

## Artifact and scope

[Research package](../../nutrition-curriculum/08_APP_TRANSLATION/food-layer-research/README.md):
live 89-food audit/snapshot, coverage matrix, conditional additions, macro/micronutrient architecture,
raw/cooked and seasonal models, 10 meal components, 24 recipe proposals, DEC/source mapping, open
decisions, and future requirements. The upstream energy research's proposed target/uncertainty
interface is linked, without treating that draft as implemented or ratified.

## Findings and verification

Existing foods broadly cover the requested roles. Provenance, explicit food state, identity collisions,
and missing micronutrient data are the principal limitations. Live catalog has 89 rows; seed has 64;
24 live sources are null and only 19 rows have any allergen mapping. All 89 audit rows, 24 recipes,
141 ingredient references, local links, and explicit DEC IDs were checked. `npm run build` passed
with a Vite bundle-size warning. The original source books are absent from this checkout; prior
TOC/substantive-analysis references are distinguished from newly inspected external sources.

## Git and concurrent work

This task created `docs/food-recommendation-recipe-research` before artifact edits. During research,
another session changed the shared checkout to `docs/energy-individualization-research-spec` and
reorganized the checkpoint. Those changes were preserved; no branch was switched back and no unrelated
work was committed or overwritten. Research files remain uncommitted in the shared working tree.

## Exact next action

Human reviews the package's README Section M, particularly source qualification, Food/state ownership,
micronutrient reference/panel, portion policy, and recipe scope. Revise the selected research sections
from that feedback. Only after explicit direction should a bounded DEC handoff spec be drafted under
`09_HANDOFF_SPECS/_TEMPLATE.md`. No DEC readiness or ratification was changed, no handoff row was
PUSHED, and application implementation must not begin from this research draft alone.
