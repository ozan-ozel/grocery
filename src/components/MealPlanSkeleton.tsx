import { LoadingBlock } from "@/components/LoadingBlock";

// The one loading skeleton for MealPlanView's body (macro card + the four
// meal-slot cards). Two loading phases render it, back to back:
//   1. the lazy chunk is still downloading — App.tsx's
//      SectionSuspenseFallback, which adds the eyebrow and a placeholder
//      day-nav row above this;
//   2. the chunk has mounted but the day's entries haven't arrived —
//      MealPlanView's own `isLoading` branch, under its real header.
// They used to be two unrelated skeletons (this exact-match one, then a
// generic h-28 stack with no macro card), so the page visibly changed shape
// between phases. Both now render this, so the handoff is invisible.
//
// Returns a fragment on purpose: in MealPlanView both blocks are direct
// children of its space-y-4 root, and the fallback wraps them the same way.
//
// Mirrors MacroSummaryCard.tsx's "GÜNLÜK MAKROLAR" card (rounded-lg border
// p-3, h2, a 2-col then 3-col grid of border-l-4 tiles, each with a 40px ring
// + two-line value) and MealContainer.tsx's 4 fixed meal-slot cards
// (space-y-3 rounded-lg border p-4, h3 + a 2-col grid of dashed-border add
// buttons). Both card shapes and every label (macro names, meal names) are
// static strings from those components, never data — rendered as real text
// here, not shimmer, since matching them exactly costs nothing and reads
// better than a guessed-width bar. Only true per-user numbers (kcal, the
// rings) are shimmered. The optional "Akşam için öneriler" list below the 4th
// card is skipped — it's conditional and its length varies 0-8+, so there's no
// fixed shape to fake here.
function macroTile(label: string, ringW: string, valW: string) {
  return (
    <div key={label} className="rounded-lg border-l-4 border-l-border bg-background p-2.5">
      <p className="text-[0.7rem] font-medium text-muted-foreground">{label}</p>
      <div className="mt-1.5 flex items-center gap-2">
        <LoadingBlock className="size-10 shrink-0 rounded-full" />
        <div>
          <LoadingBlock className={`h-[18px] rounded ${valW}`} />
          <LoadingBlock className={`mt-1 h-4 rounded ${ringW}`} />
        </div>
      </div>
    </div>
  );
}

export function MealPlanSkeleton() {
  return (
    <>
      <div className="rounded-lg border border-border bg-card p-3">
        <h2 className="mb-2 text-xs font-semibold text-muted-foreground">GÜNLÜK MAKROLAR</h2>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {macroTile("Kalori", "w-6", "w-10")}
            {macroTile("Protein", "w-5", "w-6")}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {macroTile("Karbonhidrat", "w-5", "w-8")}
            {macroTile("Yağ", "w-5", "w-6")}
            {macroTile("Lif", "w-5", "w-6")}
          </div>
        </div>
      </div>

      {/* The 4 cards are wrapped in their own space-y-3 (12px) in
          MealPlanView.tsx — nested as a single item inside the outer
          space-y-4, not direct siblings of it. Rendering them as direct
          children here gave them 16px gaps instead of the real 12px. */}
      <div className="space-y-3">
        {(["İlk Öğün", "Ara Öğün", "Son Öğün", "Ara Öğün"] as const).map((label, i) => (
          <div key={i} className="space-y-3 rounded-lg border border-border bg-card p-4">
            <h3 className="font-semibold text-foreground">{label}</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-background py-3 text-sm font-medium text-muted-foreground">
                <span aria-hidden="true">+</span> Ürünler
              </div>
              <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-background py-3 text-sm font-medium text-muted-foreground">
                <span aria-hidden="true">+</span> Yemekler
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
