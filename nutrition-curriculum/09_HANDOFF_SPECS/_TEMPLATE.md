# DEC-### — <short title>

**Decision:** <one line, copied from `05_PHASE_3_APP_DECISION_MODEL/APP_DECISION_INVENTORY.md`>
**Ratification:** <link into `00_PROJECT_CONTROL/DECISIONS/...`, or "none — MVP-provisional (tag code
`MVP-N PROVISIONAL / REVISIT AFTER QA-N` per the ledger convention)">

## Build this

<Concrete and unambiguous: exact formula/threshold/copy/UI surface. If a number or rule isn't nailed
down here, the implementer will stop and mark the row BLOCKED rather than guess — write it down.>

## Do not build

<Explicit scope fence — the adjacent decisions, edge cases, or "obvious next steps" this spec
deliberately excludes. This is usually the most important section: it's what keeps the implementer
from quietly expanding scope.>

## Files likely touched

<Best guess at the surface area — not a contract. The implementer may find a better path; that's fine
as long as it still only builds what "Build this" says.>

## Self-close checklist

- [ ] `npm run build` (`tsc -b`) passes
- [ ] Exercised in `npm run vercel:dev` (or `npm run dev` if no `/api/*` route is involved)
- [ ] Own branch, named for the change, merged to `master`, pushed
- [ ] Row in `../IMPLEMENTATION_HANDOFF.md` moved to Closed with status `DONE`
