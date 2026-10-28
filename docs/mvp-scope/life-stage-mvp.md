# Life Stage — MVP Scope

Domain R is `DEC-103` through `DEC-105`, all `BLOCKED` for the same reason: no life-stage fields
exist.

## Age only is already the scope

`validateProfile()` gates age to 18-100, and the app's stated scope already excludes pregnancy,
breastfeeding, minors, eating-disorder recovery and therapeutic diets.

That is a **boundary**, not a life-stage model, and for MVP a boundary is the right object. Nothing
needs building.

## The one thing to avoid

Do not add pregnancy or lactation fields "just to collect them."

Collecting a field implies the app will act on it, and acting on it is `DEC-104`, which changes
default requirements **and safe-scope boundaries**. That decision is blocked and safety-relevant. A
field the app cannot act on is worse than no field, because it invites the user to expect adaptation
that will not happen.

## MVP scope

In:

- Keep the 18-100 age gate.
- State the excluded populations plainly where the user can see it, rather than only in the docs.

Out:

- Life-stage categories, `DEC-103`.
- Any requirement or boundary that varies by life stage, `DEC-104`.
- Transitions during use, such as pregnancy onset, `DEC-105`.

## Status

Implemented: the 18-100 age gate (`validateProfile()`) plus an explicit excluded-populations note
next to the age field in both onboarding (`OnboardingQuickSetup.tsx` step 0) and the Personal Plan
profile section (`PersonalPlanView.tsx`). `DEC-103`/`DEC-104`/`DEC-105` remain `BLOCKED` and out of
scope, unchanged.

**2026-10-28 (owner decision, DEC-012/013 MVP posture):** the passive note became a checkbox
(`ScopeCheck.tsx`, same two places). Ticking it hides every calorie/macro target, the per-slot protein
target and the target-based suggestions (Kişisel Plan, Yemek Planı, "Sana uygun"); lists, meals and
recipes keep working. This is not a life-stage field: the app acts on it (it withholds targets) rather
than adapting them, so it stays inside the "do not collect what you cannot act on" rule above. Stored
per user in the browser only (`grocery.scopeAttestation.v1:<userId>`), no DB column. A red-flag note
(DEC-013) is shown under the targets. Copy lives in `src/lib/safetyCopy.ts`; MVP-1 PROVISIONAL, worth a
dietitian's read before a public launch.
