# 2026-09-17-01 — Kişisel Plan: sources/nav polish, hydration range, citation accuracy

Branch: `feature/personal-plan-nav-polish` (this session's additional commits build on it)

## What changed

**Cross-navigation between "Nasıl hesaplanıyor?" and "Kaynakları göster"**, refined over
several rounds to a one-directional model:
- Top-level badges (Profil's NIDDK, Günlük hedeflerin's WHO/Endotext/DRI/Koruma's Endotext)
  jump down into "Kaynakları göster" and highlight the matching citation group.
- "Kaynakları göster"'s citation rows are split into two segments per source: a left
  page-nav button (jumps back up to wherever that badge is genuinely shown elsewhere on the
  page) and a right segment that opens the actual external link. Colors are deliberately
  distinct (left: `bg-signal/10` tint; right: `bg-background`, near-white) and the two
  segments share a border so they read as one joined control, not two unrelated buttons.
- The left button is **exact-badge-aware**: a `REFERRER_EXACT_BADGES` allow-list disables
  (renders inert/gray) any citation whose badge has no genuine anchor elsewhere on the page,
  rather than adding decorative badges just to manufacture a match everywhere (eliminative,
  not inclusive — explicit user steer).
- "Nasıl hesaplanıyor?"'s own inline citation badges (Endotext/WHO/DRI/Hector 2018/ACSM 2016)
  jump straight down to their citation in "Kaynakları göster" (the original, pre-session
  behavior) rather than pointing back up — up-navigation belongs to the top-level badges only.
- "Bazal metabolizma, koruma ve hedef kalorisi"'s referrer anchor moved from the whole
  "Nasıl hesaplanıyor" box (imprecise, needed force-opening the collapsible) to the precise
  "Koruma X kcal" line in "Günlük hedeflerin", which now also shows its own Endotext badge.
  This let the force-open special case in `jumpToSourceReferrer` be deleted entirely — every
  feature now has a real anchor outside any collapsible.

**Citation accuracy fixes**:
- `SOURCE_GROUPS` used to define the same NCBI Endotext citation (NBK278991) four times with
  four different, independently-typed labels. Replaced with canonical `Source` constants
  (`ENDOTEXT_SOURCE`, `NIDDK_SOURCE`, `WHO_SOURCE`, `DRI_SOURCE`, `HECTOR_2018_SOURCE`,
  `ACSM_2016_SOURCE`) referenced by every group that cites them — one object, no drift risk.
- "Su" (hydration) card's citation badge was wired to the "Protein, yağ, karbonhidrat ve lif
  aralıkları" (macro AMDR) group — wrong topic, even though both trace to DRI (different DRI
  categories: Adequate Intake for water vs. macro ranges). Given its own group, "Su ihtiyacı
  (temel sıvı)", still citing `DRI_SOURCE` (verified against
  `nutrition-curriculum/10_PHASE_7_DECISION_ENGINE_SPECIFICATION/DECISION_LOGIC_SPECIFICATION.md`
  §3.5, DEC-046: the 30-35 mL/kg figure is explicitly the DRI Adequate Intake for total water).
- "Günlük enerji" card had the same bug (showed DRI, unrelated to its actual formula).
  Corrected to Endotext, matching "Bazal metabolizma, koruma ve hedef kalorisi" (the feature
  that explains the BMR+activity+goal-adjustment formula it displays) — reuses the "Koruma"
  card's existing referrer anchor rather than needing a new one, since both live in the same
  citation context right next to each other.

**Hydration range display** (`docs/mvp-scope/hydration-mvp.md`'s own flagged "cheap fix"):
- `mealPersonalization.ts`'s `waterMl` changed from a collapsed midpoint
  (`weightKg * 33`) to the actual `{ min, max }` band (`weightKg * 30` to `weightKg * 35`),
  matching how Protein/Yağ/Karbonhidrat/Lif already show ranges instead of single numbers.
- "Su" card caption changed from the confusing "temel sıvı, taslak" to "aralık, taslak",
  matching the other range cards' "aralık" wording while still flagging DEC-046's provisional
  status.
- The doc's second flagged item ("settle and state whether the figure means total water or
  beverages") is explicitly **not resolved** — doing so would require sourced guidance the
  corpus doesn't supply per the doc's own note, so the wording stays neutral/non-directive
  rather than guessing.

**UI fixes**:
- "Nasıl hesaplanıyor?" gets the same open/close switch indicator as "Kaynakları göster";
  both keep their border (a plain-border removal was tried and reverted per explicit
  correction — only the unrelated app-boot skeleton's animated gradient border was removed).
- Profil field heights (Input/NumberInput) normalized to match the Select controls'
  `h-9`/`text-sm` sizing; selects get a small custom chevron adornment instead of the native
  browser arrow.
- "Varsayılan olarak dolduruldu" converted from a bare `<details>` summary to a real bordered
  toggle (matching "Önerilmesin"/"Alerjen grubu hariç tut"), and its explanatory disclaimer
  moved inside the collapsible so it doesn't dangle below a closed box.
- "Denklem seçimi" field label and the disclaimer's matching opening phrase both styled
  `italic font-semibold` to visually tie the label to its explanation.
- Activity/BMI header line: grouped "activity + WHO badge" and "BMI text + Endotext badge"
  into their own inline-flex units (flex-wrap was splitting a badge away from its label onto
  its own line); the "·" separator moved inside the BMI group so it travels with it instead of
  dangling at the end of the first line, and is dropped entirely once sources are shown (the
  badges already force a wrap, so it has nothing left to separate).

## Verification

- `tsc -b` and `npm run build` clean throughout; no bundle-size regression.
- Every navigation/attribution fix verified live via Playwright against `vercel:dev`
  (scroll position / DOM state checks, not just visual screenshots) — confirmed exact-badge
  gating renders gray/inert correctly, round-trips land precisely on their real anchors, and
  the "Su"/"Günlük enerji" badges now point at their correct citation groups.

## Out of scope / not done

- The "total water vs. beverages" hydration labeling question remains genuinely unresolved
  (per `hydration-mvp.md`) — not fixed, deliberately.
- Body-composition history/chart (weight/waist log) — explicitly deferred by the user to a
  later V3 pass, per `docs/mvp-scope/body-composition-mvp.md`.
