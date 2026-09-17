import { lazy, Suspense, useMemo, useRef } from "react";
import { Tabs } from "@/components/ui/tabs";
import { AppHeader } from "@/components/AppHeader";
import { AppShoppingTabs } from "@/components/AppShoppingTabs";
import { UndoToast } from "@/components/UndoToast";
import { LoginGate } from "@/components/LoginGate";
import { LoadingBlock } from "@/components/LoadingBlock";
import { BottomNavigation, type NavTab } from "@/components/BottomNavigation";
import { buildCatalog, readNutritionScopeFromUrl } from "@/lib/store";
import { createListActions } from "@/lib/listActions";
import { useUiPrefs, initialSection, type Tab, type Section } from "@/hooks/useUiPrefs";
import { useTenants } from "@/hooks/useTenants";
import { useListSync } from "@/hooks/useListSync";
import { useRollover } from "@/hooks/useRollover";
import { useUndo } from "@/hooks/useUndo";
import { useCategoryOverlay } from "@/hooks/useCategoryOverlay";
import { useItemCategories } from "@/hooks/useItemCategories";
import { useSelection } from "@/hooks/useSelection";
import { useAuth } from "@/hooks/useAuth";
import { useMealPersonalization } from "@/hooks/useMealPersonalization";
import { useOnboarding } from "@/hooks/useOnboarding";
import { OnboardingQuickSetup } from "@/components/OnboardingQuickSetup";
import { useFoodCatalog } from "@/hooks/useFoodCatalog";
import { buildFoodIdentityIndex } from "@/lib/foodIdentity";

// Split out of the main bundle — each is a full section, mutually exclusive
// with the others at any given time (see the section-routing branch in
// AppShell), so there's no reason to pay their combined ~500 kB upfront just
// to show the shopping list, which is what most sessions land on.
const NutritionView = lazy(() =>
  import("@/components/NutritionView").then(m => ({ default: m.NutritionView }))
);
const MealPlanView = lazy(() =>
  import("@/components/MealPlanView").then(m => ({ default: m.MealPlanView }))
);
const PersonalPlanView = lazy(() =>
  import("@/components/PersonalPlanView").then(m => ({ default: m.PersonalPlanView }))
);
const SettingsView = lazy(() =>
  import("@/components/SettingsView").then(m => ({ default: m.SettingsView }))
);

export function App() {
  const {
    session,
    cachedSession,
    checked,
    signInWithGoogle,
    signOut,
    deleteAccount,
  } = useAuth();
  // Read once per mount (not via useUiPrefs, which isn't mounted yet at this
  // gate) so the very first paint already mimics whichever section the URL
  // says we're landing on, instead of always guessing Alışveriş.
  const bootSection = useMemo(() => initialSection(), []);

  // Mount the app on a remembered identity instead of blocking the whole tree
  // on /api/auth-session, which used to make every other request wait a full
  // round trip behind it. `checked ? null : cachedSession` is the load-bearing
  // half: the moment the real answer lands, the hint stops counting, so a
  // stale cache can never outlive a confirmed 401. Nothing here grants access —
  // every /api/* handler still authenticates the httpOnly cookie itself, so an
  // expired session gets a brief skeleton and then LoginGate, never data.
  const effective = session ?? (checked ? null : cachedSession);

  if (!effective) {
    return checked ? (
      <LoginGate onSignIn={signInWithGoogle} />
    ) : (
      <AppBootSkeleton section={bootSection} />
    );
  }

  return (
    <AppShell
      onSignOut={signOut}
      onDeleteAccount={deleteAccount}
      currentUserId={effective.userId}
    />
  );
}

// Shared by both AppBootSkeleton (below) and AppShell's real currentNavTab,
// so the two never drift into disagreeing about which nav tab a Section maps
// to.
function sectionToNavTab(section: Section): NavTab {
  switch (section) {
    case "alisveris":
      return "shopping";
    case "besin":
      return "nutrition";
    case "yemek":
      return "meals";
    case "kisisel":
      return "personal";
    case "ayarlar":
      return "settings";
  }
}

// One generic frame for every section, not a per-section guess — at this
// point (!checked, App.tsx) we don't yet know if there's even a session, so
// pretending to know the exact target layout is a losing game. Modeled on
// "yemek" (meal plan) since that's the actual default landing section (see
// initialSection() in useUiPrefs) and thus the common case. Once the session
// resolves, AppShell's per-section Suspense fallback (SectionSuspenseFallback
// below) takes over with an exact match for whichever section it actually is.
//
// BottomNavigation is real, not skeletonized — its labels/icons are static,
// never "loading", and it's fixed-positioned (ignores this wrapper's padding
// entirely), so it lands pixel-identical here, in the Suspense phase, and in
// the final page with zero extra work. onTabChange is a no-op: AppShell's
// setSection doesn't exist yet at this point, and this gate is normally a
// sub-second auth check, not worth wiring real pre-login navigation for.
function AppBootSkeleton({ section }: { section: Section }) {
  return (
    <div
      className="mx-auto flex min-h-dvh w-full max-w-[30rem] flex-col px-5 pt-6"
      role="status"
      aria-label="Yükleniyor">
      <div className="space-y-4">
        <LoadingBlock className="h-3 w-24 rounded" />
        <div className="flex items-center justify-between">
          <QuietIconPlaceholder />
          <LoadingBlock className="h-6 w-32 rounded-md" />
          <QuietIconPlaceholder />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <LoadingBlock className="h-16 rounded-lg" />
          <LoadingBlock className="h-16 rounded-lg" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <LoadingBlock className="h-16 rounded-lg" />
          <LoadingBlock className="h-16 rounded-lg" />
          <LoadingBlock className="h-16 rounded-lg" />
        </div>
        <div className="space-y-2">
          <LoadingBlock className="h-24" />
          <LoadingBlock className="h-24" />
          <LoadingBlock className="h-24" />
        </div>
      </div>
      <BottomNavigation activeTab={sectionToNavTab(section)} onTabChange={() => {}} />
    </div>
  );
}

// AppHeader's icon buttons and MealPlanView's day-nav chevrons are all
// variant="quiet" — no visible button surface, just an icon glyph — so a
// filled size-9 square placeholder reads as the wrong shape entirely (a
// button box that doesn't exist). This mimics the actual glyph instead: a
// small round shimmer, centered in a same-footprint size-9 box so row
// spacing still matches the real header/nav once content arrives.
function QuietIconPlaceholder() {
  return (
    <div className="flex size-9 shrink-0 items-center justify-center">
      <LoadingBlock className="size-4 rounded-full" />
    </div>
  );
}

// Per-section fallback for the lazy-view Suspense boundaries in AppShell
// (below) — distinct from AppBootSkeleton above, which only covers the
// pre-login/pre-AppShell paint. By the time these run,
// AppHeader and BottomNavigation are already real (AppHeader itself renders
// nothing for any section but "alisveris" — see the early return in
// AppHeader.tsx), so the title/subtitle these sections show is owned by the
// lazy view component's own JSX, not the shared header. Each fallback below
// reproduces that view's real top-of-page markup (wrapper element, spacing
// classes, and which of eyebrow/h1/description line actually exist for that
// section) so nothing shifts position once the chunk finishes loading and
// swaps in — only the section's data-dependent body content is approximated.
function SectionSuspenseFallback({ section }: { section: Section }) {
  switch (section) {
    case "besin": {
      // Mirrors NutritionView.tsx's scopeToggle block (mb-3 wrapper, nested
      // mb-3 eyebrow+h1, then the Tümü/Kategoriler/Karşılaştır SmoothPillTabs
      // row) — shared by every scope below it.
      const header = (
        <div className="mb-3">
          <div className="mb-3">
            <LoadingBlock className="h-4 w-28 rounded" />
            <LoadingBlock className="mt-1 h-8 w-60 rounded-md" />
          </div>
          <LoadingBlock className="h-10 w-full rounded-lg" />
        </div>
      );
      // NutritionView.tsx picks one of several different bodies depending on
      // scope (readNutritionScopeFromUrl — same URL-before-mount trick as
      // AppBootSkeleton's bootSection above), not just the one this used to
      // assume. "all" (Tümü) is AllFoodsBrowser: a real h-11 search input
      // (Input's own class, see ui/input.tsx) + a "N besin" count label, both
      // measured live. Anything else falls back to the items-in-list shape:
      // the "Değerler 100 g / 100 ml içindir." + "JSON yükle" row (also
      // measured live — missing before, which left every list row 56px too
      // high once the chunk mounted) — the closest single approximation for
      // "cats"/"compare"/empty-list, none of which are knowable pre-mount.
      if (readNutritionScopeFromUrl() === "all") {
        return (
          <div>
            {header}
            <LoadingBlock className="h-11 w-full rounded-md" />
            <div className="px-1 pb-1 pt-4">
              <LoadingBlock className="h-4 w-20 rounded" />
            </div>
            <div className="space-y-2">
              <LoadingBlock className="h-16" />
              <LoadingBlock className="h-16" />
              <LoadingBlock className="h-16" />
            </div>
          </div>
        );
      }
      return (
        <div>
          {header}
          <div className="flex items-center justify-between px-1 pb-3">
            <LoadingBlock className="h-3 w-40 rounded" />
            <div className="flex items-center gap-1.5">
              <LoadingBlock className="size-3.5 rounded-full" />
              <LoadingBlock className="h-3 w-16 rounded" />
            </div>
          </div>
          <div className="space-y-2">
            <LoadingBlock className="h-16" />
            <LoadingBlock className="h-16" />
            <LoadingBlock className="h-16" />
          </div>
        </div>
      );
    }
    case "yemek": {
      // Mirrors MealPlanView.tsx's outer space-y-4 wrapper — no h1 here, its
      // real "title" is the day-nav row — PLUS the two card types that
      // actually fill the page below it, neither of which the old version
      // had: MacroSummaryCard.tsx's "GÜNLÜK MAKROLAR" card (rounded-lg
      // border p-3, h2, then a 2-col then 3-col grid of border-l-4 tiles,
      // each with a 40px ring + two-line value) and MealContainer.tsx's 4
      // fixed meal-slot cards (space-y-3 rounded-lg border p-4, h3 + a 2-col
      // grid of dashed-border add buttons). Both card shapes and all 7
      // labels (macro names, meal names) are static strings from those
      // components, never data — rendered as real text here, not shimmer,
      // since matching them exactly costs nothing and reads better than a
      // guessed-width bar. Only true per-user numbers (kcal, day label,
      // "+0") are shimmered. The optional "Akşam için öneriler" list below
      // the 4th card is skipped — it's conditional and its length varies
      // 0-8+, so there's no fixed shape to fake here.
      const macroTile = (label: string, ringW: string, valW: string) => (
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
      return (
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Yemek Planı</p>
          <div className="flex items-center justify-between">
            <QuietIconPlaceholder />
            <LoadingBlock className="h-7 w-32 rounded-md" />
            <QuietIconPlaceholder />
          </div>

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
              MealPlanView.tsx:350 — nested as a single item inside this
              outer space-y-4, not direct siblings of it. Rendering them
              as direct children here gave them 16px gaps instead of the
              real 12px. */}
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
        </div>
      );
    }
    case "kisisel": {
      // PersonalPlanView.tsx is a long form-heavy page — matched at the
      // card/heading level (every section boundary, every fixed heading
      // text, every card's real padding/gap) rather than replicating each
      // input field's border pixel-for-pixel, which would be a lot of code
      // for a placeholder seen for a fraction of a second. Card-by-card,
      // measured live against the real page:
      //  - header: eyebrow+h1 (as elsewhere) + a 2-line wrapped description
      //    paragraph, unique to this section.
      //  - "Profil" card (rounded-lg border p-3 — NOT p-4, this one's
      //    narrower than the others): collapsed to a single block rather
      //    than mimicking its 2x2 field grid + warning line + default-open
      //    sub-panel individually — see the height comment further down for
      //    why that block's exact px height still keeps the card's own
      //    top/bottom edges pinned to their real, measured position.
      //  - "Önerilmesin" / "Alerjen grubu hariç tut": both
      //    DropdownChevronButton disclosures, both collapsed by default —
      //    each is just its own rounded-lg border p-3 header bar.
      //  - "Günlük hedeflerin": always-visible results, real heading text,
      //    a 2-col grid of 6 metric tiles (label/value/suffix).
      //  - "Nasıl hesaplanıyor?" / "Kaynakları göster": native
      //    <details>/<summary> disclosures, also collapsed by default,
      //    each its own bordered p-3 bar.
      return (
        <div className="space-y-5">
          <div>
            <LoadingBlock className="h-4 w-24 rounded" />
            <LoadingBlock className="mt-1 h-8 w-56 rounded-md" />
            {/* Two wrapped lines of one text-sm paragraph, not two separate
                blocks with a gap between them — real line-height is 20px
                and wrapped lines sit flush against each other, no space-y.
                Each row below is a 20px (h-5) slot so the total still lands
                on the real 40px, but the visible bar inside is only 14px
                (h-3.5), vertically centered — a real text line's ink only
                fills part of its line-height, so a bar that fills the full
                20px edge-to-edge reads as heavier/closer to the h1 above
                than the actual text ever does. */}
            <div className="mt-2">
              <div className="flex h-5 items-center">
                <LoadingBlock className="h-3.5 w-full rounded" />
              </div>
              <div className="flex h-5 items-center">
                <LoadingBlock className="h-3.5 w-2/3 rounded" />
              </div>
            </div>
          </div>

          <section className="rounded-lg border border-border p-3">
            {/* px-1 matches the real h2's own class (PersonalPlanView.tsx) —
                it carries a citation-badge feature there, but even with the
                badge hidden its px-1 still applies, shifting the text 4px
                right of a plain text-sm heading. Without it here, "Profil"
                visibly jumps left when the real component mounts. */}
            <h2 className="px-1 text-sm font-semibold">Profil</h2>
            {/* Simplified to one block instead of mimicking every field/
                sub-panel row individually — but its height (411px) is not a
                guess: card top-to-bottom measured live at 467px, minus p-3
                padding (12 top + 12 bottom) and the "Profil" heading's own
                20px + mt-3 (12px) gap, so the card's total footprint still
                lands exactly where the real one does, only the inside is
                coarser. */}
            <LoadingBlock className="mt-3 h-[411px] w-full rounded-lg" />
          </section>

          <section className="rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Önerilmesin</h2>
              <LoadingBlock className="size-5 shrink-0 rounded-full" />
            </div>
          </section>

          <section className="rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Alerjen grubu hariç tut</h2>
              <LoadingBlock className="size-5 shrink-0 rounded-full" />
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-sm font-semibold">Günlük hedeflerin</h2>
                <LoadingBlock className="mt-1 h-3 w-32 rounded" />
              </div>
              <LoadingBlock className="h-3 w-24 rounded" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(["Günlük enerji", "Protein", "Yağ", "Karbonhidrat", "Lif", "Su"] as const).map(
                label => (
                  <div key={label} className="rounded-lg border border-border p-3">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <LoadingBlock className="mt-1 h-6 w-16 rounded" />
                    <LoadingBlock className="mt-1 h-2.5 w-12 rounded" />
                  </div>
                )
              )}
            </div>
            {/* "Hedefler tahminidir; düzenli ağırlık ve besin kaydıyla
                zaman içinde kişiselleştirilmelidir." wraps to 2 lines here
                (measured 32px, text-xs's 16px line-height twice), not the
                single 12px bar this used to be — same slotted-line pattern
                as the header description above: a 16px (h-4) row per line,
                with a shorter h-2.5 bar centered inside it. */}
            <div>
              <div className="flex h-4 items-center">
                <LoadingBlock className="h-2.5 w-full rounded" />
              </div>
              <div className="flex h-4 items-center">
                <LoadingBlock className="h-2.5 w-3/5 rounded" />
              </div>
            </div>
          </section>

          {/* Real element uses border-signal-solid (a signal-colored border)
              by default — accurate, but a single colored border standing out
              against an otherwise neutral stack of loading blocks draws the
              eye where there's nothing to look at yet. Plain border-border
              here instead, same as every other card (including Kaynakları
              göster right below it). */}
          <div className="rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <LoadingBlock className="size-5 shrink-0 rounded-full" />
                Nasıl hesaplanıyor?
              </div>
              <div className="h-5 w-9 rounded-full bg-signal/10" />
            </div>
          </div>

          <div className="rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <LoadingBlock className="size-5 shrink-0 rounded-full" />
                Kaynakları göster
              </div>
              <div className="h-5 w-9 rounded-full bg-signal/10" />
            </div>
          </div>
        </div>
      );
    }
    case "ayarlar":
    default:
      // Unlike the other three sections, SettingsView.tsx's body isn't
      // data-shaped at all — no list whose length varies, just three fixed
      // cards (Tema, Grup, sign-out/delete) — so this reproduces the real
      // card chrome (border, rounded-lg, bg-card, padding) directly instead
      // of guessing with generic h-16 blocks, and only shimmers the parts
      // that actually come from the lazy chunk: heading text, the
      // ThemeSwitcher pill (h-9 w-16, see ThemeSwitcher.tsx), the
      // TenantSwitcher trigger button (measured ~79px wide, w-20 here — see
      // TenantSwitcher.tsx), and the two account-action rows. All three
      // cards are min-h-[114px] in SettingsView.tsx itself (Tema/Grup
      // content is flex-centered within it) so they're a uniform height —
      // matched here with the same class instead of per-card padding
      // fudge-factors that drifted every time either real card's content
      // changed.
      return (
        <div className="space-y-5">
          <div>
            {/* Both sized to their real line-height, not just glyph height —
                text-xs is a 16px line box (h-4) and text-2xl is 32px (h-8);
                the previous h-3/h-7 pair was 4px short on each, which pushed
                every card below 8px higher than the real page lands. */}
            <LoadingBlock className="h-4 w-20 rounded" />
            {/* "Hesap ve tercihler" renders bold at text-2xl and runs to
                ~60% of the 440px content column (30rem container minus the
                px-5 gutters) — w-44 read as a stub next to the real heading;
                w-64 actually spans close to it. */}
            <LoadingBlock className="mt-1 h-8 w-64 rounded-md" />
          </div>

          <section className="flex min-h-[114px] flex-col justify-center space-y-2 rounded-lg border border-border bg-card p-4">
            <LoadingBlock className="h-5 w-12 rounded" />
            <LoadingBlock className="h-9 w-16 rounded-full" />
          </section>

          <section className="flex min-h-[114px] flex-col justify-center space-y-2 rounded-lg border border-border bg-card p-4">
            <LoadingBlock className="h-5 w-12 rounded" />
            <LoadingBlock className="h-9 w-20 rounded-md" />
          </section>

          {/* text-sm's real line-height is 20px (h-5), not the icon's own
              16px (size-4) — using h-4 for the label undersized both rows
              by 4px each, 8px total short on the card. */}
          <div className="space-y-2 rounded-lg border border-border bg-card p-2">
            <div className="flex items-center gap-3 rounded-lg px-4 py-3">
              <LoadingBlock className="size-4 shrink-0 rounded-full" />
              <LoadingBlock className="h-5 w-24 rounded" />
            </div>
            <div className="flex items-center gap-3 rounded-lg px-4 py-3">
              <LoadingBlock className="size-4 shrink-0 rounded-full" />
              <LoadingBlock className="h-5 w-28 rounded" />
            </div>
          </div>
        </div>
      );
  }
}

// Liste → Geçmiş, matching AppHeader's TabsTrigger order, so a left/right
// swipe moves the same direction the tab bar reads.
const SHOPPING_TAB_ORDER: Tab[] = ["list", "history"];
const SWIPE_MIN_DISTANCE_PX = 60;
// Anything that owns its own horizontal touch gesture (a list row's
// swipe-to-check/delete when swipeMode is on, the horizontally-scrolling tab
// strip itself) or is just a normal tap target opts out, so a page-level
// swipe never fights a more specific one.
const SWIPE_IGNORE_SELECTOR =
  'button, input, a, textarea, select, [role="switch"], [data-swipe-row], .overflow-x-auto, details, summary';

// Swipe left/right anywhere in the Alışveriş section's content to move
// between its sub-tabs — only wired up there (not Besin/Yemek/Kişisel),
// since those don't have a matching row of sibling tabs to move between.
function useSwipeTabs(section: string, tab: Tab, setTab: (t: Tab) => void) {
  const start = useRef<{ x: number; y: number } | null>(null);

  function onTouchStart(e: TouchEvent) {
    start.current = null;
    if (section !== "alisveris") return;
    if ((e.target as HTMLElement).closest(SWIPE_IGNORE_SELECTOR)) return;
    const t = e.touches[0];
    start.current = { x: t.clientX, y: t.clientY };
  }

  function onTouchEnd(e: TouchEvent) {
    const from = start.current;
    start.current = null;
    if (!from || section !== "alisveris") return;
    const t = e.changedTouches[0];
    const dx = t.clientX - from.x;
    const dy = t.clientY - from.y;
    // Horizontal-dominant and past a real swipe distance, so an ordinary
    // vertical scroll (even a slightly diagonal one) never triggers this.
    if (
      Math.abs(dx) < SWIPE_MIN_DISTANCE_PX ||
      Math.abs(dx) < Math.abs(dy) * 1.5
    )
      return;
    const idx = SHOPPING_TAB_ORDER.indexOf(tab);
    if (idx === -1) return;
    if (dx < 0 && idx < SHOPPING_TAB_ORDER.length - 1) {
      setTab(SHOPPING_TAB_ORDER[idx + 1]);
    } else if (dx > 0 && idx > 0) {
      setTab(SHOPPING_TAB_ORDER[idx - 1]);
    }
  }

  return { onTouchStart, onTouchEnd };
}

function AppShell({
  onSignOut,
  onDeleteAccount,
  currentUserId,
}: {
  onSignOut: () => void;
  onDeleteAccount: () => void;
  currentUserId: string | null;
}) {
  const {
    theme,
    setTheme,
    swipeMode,
    toggleSwipeMode,
    showNutritionValues,
    toggleShowNutritionValues,
    section,
    setSection,
    tab,
    setTab,
  } = useUiPrefs();

  const swipeTabs = useSwipeTabs(section, tab, setTab);

  const {
    tenants,
    activeTenantId,
    selectTenant,
    addTenant,
    renameTenant,
    deleteTenant,
    consumeFreshTenantId,
  } = useTenants();

  const { state, setState, updateState, stateRef, hydrated } = useListSync(
    activeTenantId,
    consumeFreshTenantId,
  );

  const { undo, showUndo, restore, dismiss } = useUndo(updateState, setState);
  useRollover(activeTenantId, stateRef, setState, showUndo, hydrated);

  const {
    overlay,
    mergedCategories,
    renameCat,
    toggleHidden,
    moveCat,
    reorderCats,
    addCategory,
    removeCategory,
  } = useCategoryOverlay();

  const { itemCategories, rememberCategory } =
    useItemCategories(activeTenantId);

  const personalization = useMealPersonalization(currentUserId);
  const onboarding = useOnboarding(
    currentUserId,
    personalization.hasSavedProfile,
  );

  const catalog = useMemo(
    () => buildCatalog(state?.lists ?? []),
    [state?.lists],
  );

  // Canonical Food Identity implementation: one useFoodCatalog() instance
  // here so createListActions' addItem can resolve a shopping add against
  // the nutrition catalog. Safe to add at this top level (unlike
  // useMealPersonalization, which caused a real staleness bug when tried
  // here previously) — useFoodCatalog is a TanStack Query hook already
  // called from several other components against the same shared cache
  // key, so this instance and theirs stay coherent automatically.
  // Skipped only for "ayarlar" (Settings) — the one section with no add-item
  // flow and no food data of its own, so there's nothing here to resolve
  // against; every other section already needs the catalog for its own
  // rendering, so gating them too wouldn't save a real fetch.
  const { foods: nutritionFoods } = useFoodCatalog(section !== "ayarlar");
  const foodIdentityIndex = useMemo(
    () => buildFoodIdentityIndex(nutritionFoods),
    [nutritionFoods],
  );

  const selection = useSelection(state?.activeId ?? undefined);

  // While onboarding is showing, any section pill tap is treated as if the
  // user had tapped "Atla" — it's a clearer read of intent than leaving the
  // pill silently inert, and the wizard would otherwise sit above app chrome
  // that looks interactive but does nothing (see Finding 3 of the
  // 2026-09-03 final review).
  function selectSection(next: Section) {
    if (onboarding.status === "unseen") onboarding.skip();
    setSection(next);
  }

  // `tenants` is deliberately absent from this guard. activeTenantId resolves
  // synchronously from the URL / last-used cache (see useTenants), so the app
  // can render a whole session without /api/households ever having answered —
  // the full list is only needed by SettingsView, which falls back to its own
  // suspense skeleton below while it's still null.
  if (!activeTenantId || !state) {
    return <AppBootSkeleton section={section} />;
  }

  // Everything past the guard runs only with a hydrated state, so
  // createListActions below can assume State (never null).
  const active =
    state.lists.find(l => l.id === state.activeId) ?? state.lists[0];
  const past = state.lists.filter(l => l.id !== active.id);
  const groupByCategory = state.groupByCategory ?? false;

  const {
    addItem,
    toggleItem,
    editItem,
    removeItem,
    removeItemByName,
    bulkRemove,
    startNewList,
    reuseList,
    deleteList,
    renameActive,
    toggleGrouping,
    categorizeActive,
    isOnList,
  } = createListActions({
    state,
    active,
    catalog,
    updateState,
    itemCategories,
    rememberCategory,
    showUndo,
    selectedIds: selection.selectedIds,
    exitSelectMode: selection.exitSelectMode,
    foodIdentityIndex,
  });

  const currentNavTab: NavTab = sectionToNavTab(section);

  function handleNavTabChange(navTab: NavTab) {
    const sectionMap: Record<NavTab, Section> = {
      shopping: "alisveris",
      nutrition: "besin",
      meals: "yemek",
      personal: "kisisel",
      settings: "ayarlar",
    };
    selectSection(sectionMap[navTab]);
  }

  return (
    <Tabs
      value={tab}
      onValueChange={v => setTab(v as Tab)}
      className="mx-auto min-h-dvh w-full max-w-[30rem] px-5 pt-3">
      <AppHeader
        section={section}
        active={active}
        onRenameActive={renameActive}
        onStartNewList={startNewList}
      />

      <main
        className="pt-3"
        onTouchStart={swipeTabs.onTouchStart as never}
        onTouchEnd={swipeTabs.onTouchEnd as never}>
        {onboarding.status === "unseen" && personalization.remoteChecked ? (
          <OnboardingQuickSetup
            initialProfile={personalization.profile}
            onFinish={answers => {
              personalization.update("ageYears", answers.ageYears);
              personalization.update("heightCm", answers.heightCm);
              personalization.update("weightKg", answers.weightKg);
              personalization.setEquationSex(answers.equationSex);
              personalization.setActivity(answers.activity);
              personalization.setGoal(answers.goal);
            }}
            onSkip={onboarding.skip}
          />
        ) : section === "besin" ? (
          <Suspense fallback={<SectionSuspenseFallback section={section} />}>
            <NutritionView
              items={active.items}
              showNutritionValues={showNutritionValues}
              mergedCategories={mergedCategories}
              overlay={overlay}
              onRenameCategory={renameCat}
              onToggleHiddenCategory={toggleHidden}
              onMoveCategory={moveCat}
              onReorderCategories={reorderCats}
              onAddCategory={addCategory}
              onRemoveCategory={removeCategory}
            />
          </Suspense>
        ) : section === "yemek" ? (
          <Suspense fallback={<SectionSuspenseFallback section={section} />}>
            <MealPlanView
              userId={currentUserId}
              householdId={activeTenantId}
              onAddShoppingItem={addItem}
              isOnShoppingList={isOnList}
              onRemoveShoppingItem={removeItemByName}
            />
          </Suspense>
        ) : section === "kisisel" ? (
          <Suspense fallback={<SectionSuspenseFallback section={section} />}>
            <PersonalPlanView userId={currentUserId} />
          </Suspense>
        ) : section === "ayarlar" ? (
          <Suspense fallback={<SectionSuspenseFallback section={section} />}>
            {tenants ? (
              <SettingsView
                onSignOut={onSignOut}
                onDeleteAccount={onDeleteAccount}
                tenants={tenants}
                activeTenantId={activeTenantId}
                currentUserId={currentUserId}
                onSelectTenant={selectTenant}
                onAddTenant={addTenant}
                onRenameTenant={renameTenant}
                onDeleteTenant={deleteTenant}
                theme={theme}
                onSelectTheme={setTheme}
              />
            ) : (
              // The one consumer of the full household list. Keeps showing the
              // section's own skeleton until /api/households lands, rather than
              // holding the entire app back for it.
              <SectionSuspenseFallback section={section} />
            )}
          </Suspense>
        ) : (
          <AppShoppingTabs
            catalog={catalog}
            onAddItem={addItem}
            active={active}
            past={past}
            groupByCategory={groupByCategory}
            mergedCategories={mergedCategories}
            overlay={overlay}
            selectMode={selection.selectMode}
            selectedIds={selection.selectedIds}
            onToggleSelect={selection.toggleSelectItem}
            onToggleSelectMode={selection.toggleSelectMode}
            onSelectAll={() => selection.selectAll(active.items.map(i => i.id))}
            onSelectCategory={selection.selectCategory}
            onBulkRemove={bulkRemove}
            swipeMode={swipeMode}
            onToggleSwipeMode={toggleSwipeMode}
            onToggleItem={toggleItem}
            onRemoveItem={removeItem}
            onEditItem={editItem}
            onCategorize={categorizeActive}
            onToggleGrouping={toggleGrouping}
            onReuseList={reuseList}
            onDeleteList={deleteList}
            isOnList={isOnList}
            showNutritionValues={showNutritionValues}
            onToggleShowNutritionValues={toggleShowNutritionValues}
          />
        )}
      </main>

      {undo && (
        <UndoToast undo={undo} onRestore={restore} onDismiss={dismiss} />
      )}

      <BottomNavigation
        activeTab={currentNavTab}
        onTabChange={handleNavTabChange}
      />
    </Tabs>
  );
}
