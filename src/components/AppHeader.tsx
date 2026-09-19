import { useEffect, useRef, useState } from "react";
import { FilePlus2, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ConfirmModal";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SP_CONTAINER_CLASS, SP_TRIGGER_CLASS } from "@/components/ui/smooth-pill";
import { defaultTitle, type List } from "@/lib/store";
import type { Section } from "@/hooks/useUiPrefs";

type Props = {
  section: Section;
  active: List;
  onRenameActive: (title: string) => void;
  onStartNewList: () => void;
};

export function AppHeader({
  section,
  active,
  onRenameActive,
  onStartNewList,
}: Props) {
  const total = active.items.length;
  const done = active.items.filter(i => i.checked).length;
  const progress = total ? (done / total) * 100 : 0;

  const [confirmingNewList, setConfirmingNewList] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);

  // The pen icon is decorative (the input already carries the aria-label), so
  // it isn't a button — a tap just routes to the same focus the input gets,
  // with the caret at the end instead of wherever a fresh focus would put it.
  const focusTitle = () => {
    const el = titleInputRef.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  };

  const tabScrollRef = useRef<HTMLDivElement>(null);
  const [tabScrollFade, setTabScrollFade] = useState({ left: false, right: false });

  const updateTabScrollFade = () => {
    const el = tabScrollRef.current;
    if (!el) return;
    setTabScrollFade({
      left: el.scrollLeft > 1,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 1,
    });
  };

  useEffect(() => {
    updateTabScrollFade();
    window.addEventListener("resize", updateTabScrollFade);
    return () => window.removeEventListener("resize", updateTabScrollFade);
  }, [section]);

  // Alışveriş is the only section with real header content (title, tally,
  // list/history/category tabs) — every other section renders its own
  // content starting directly under the shared sync strip in App.tsx, so
  // all tabs share the same top offset instead of this header reserving
  // empty space for sections that have nothing to put in it.
  if (section !== "alisveris") {
    return null;
  }

  // Only fades the edge that actually has more tabs to reveal, so the mask
  // stays a no-op (fully opaque) once there's nothing left to scroll to.
  const tabScrollMask = `linear-gradient(to right, ${
    tabScrollFade.left ? "transparent, black 24px" : "black"
  }, ${tabScrollFade.right ? "black calc(100% - 24px), transparent" : "black"})`;

  return (
    <>
      {/* Single-line title, no eyebrow+h1 pair like the other sections —
          the list's own editable name right below already serves as this
          page's real "heading", so a second big title would be redundant.
          mt-3 matches the top gap every other section's title gets from
          <main>'s own pt-3 — this renders before <main> (inside AppHeader,
          which the other sections don't use), so without it this title
          would sit 12px higher than theirs. */}
      <p className="mt-3 text-xs uppercase tracking-widest text-muted-foreground">
        Alışveriş
      </p>
      {/* pt-1 (not pt-2) puts the title 4px under the eyebrow, same as the
          Nutrition h1's mt-1 — the two screens' eyebrow→title→tabs rhythm is
          meant to match. No bottom divider: Nutrition's pill row has none, and
          the tally line above the tabs already carries the header's one
          hairline. */}
      <header
        data-sticky-header
        className="sticky top-0 z-10 -mx-5 bg-background/95 px-5 pt-1 backdrop-blur">
        <div className="flex items-baseline gap-3">
          {/* The empty stretch to the right of the title still focuses it —
              before the mirror-sizing below, the input itself filled the
              whole row, so that area was tappable. Clicks that land on the
              input are left alone so a mid-text tap keeps its own caret. */}
          <div
            onClick={(e: Event) => {
              if (e.target === e.currentTarget) focusTitle();
            }}
            className="group flex min-w-0 flex-1 cursor-text items-center gap-1.5">
            {/* Mirror-sizing: the invisible span holds the same text so the
                grid cell (and the input filling it) is exactly as wide as
                the title, which lets the pen icon sit right after the last
                character instead of at the far end of a full-width input.
                minmax(0,1fr) lets a long title shrink to the row and scroll
                inside the input instead of pushing the tally off-screen. The
                input is w-0 min-w-full so its own default width (~20 chars)
                doesn't count toward the cell's size — only the mirror does. */}
            <span className="inline-grid min-w-0 grid-cols-[minmax(0,1fr)] text-2xl font-semibold tracking-tight">
              <span
                aria-hidden="true"
                className="invisible col-start-1 row-start-1 overflow-hidden whitespace-pre pr-0.5">
                {active.title || " "}
              </span>
              <input
                ref={titleInputRef}
                value={active.title}
                aria-label="Liste adı"
                onInput={(e: Event) =>
                  onRenameActive((e.target as HTMLInputElement).value)
                }
                onBlur={() => {
                  if (!active.title.trim())
                    onRenameActive(defaultTitle(active.createdAt));
                }}
                className="col-start-1 row-start-1 w-0 min-w-full border-0 bg-transparent p-0 outline-none"
              />
            </span>
            {/* Pinned to the right end of the title area (ml-auto), away from the
                text, as a small raised chip: the same box-shadow the Smooth
                Pill active tab uses — that shadow is the global
                .sp-trigger[data-active="true"] rule in index.css, not a
                Tailwind class, so it needs both the marker class and the
                data attribute. bg-card (white / dark card), not bg-background:
                the header sits on bg-background, so a same-colored chip would
                show only its shadow. */}
            <span
              aria-hidden="true"
              data-active="true"
              onClick={focusTitle}
              className="sp-trigger ml-auto shrink-0 cursor-text rounded-md bg-card p-1.5 text-muted-foreground transition-opacity duration-150 group-focus-within:opacity-0">
              <PenLine className="size-4" />
            </span>
          </div>
          <span className="ledger shrink-0 text-lg">
            <span
              className={done > 0 ? "text-signal" : "text-muted-foreground"}>
              {String(done).padStart(2, "0")}
            </span>
            <span className="text-muted-foreground">
              /{String(total).padStart(2, "0")}
            </span>
          </span>
        </div>

        {/* The tally line fills as the cart fills — the one moving part.
            mt-1.5 + 1px line + the tab row's pt-[5px] = 12px from the title to
            the pills, the same gap Nutrition has between its h1 and pills. */}
        <div className="mt-1.5 h-px w-full bg-border">
          <div
            className="h-px bg-signal transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* No -mx-1 on the scroller: Nutrition's pill row starts exactly on
            the content edge, and the old -mx-1 pushed this one 4px left of it. */}
        <div className="flex items-center gap-2 pt-[5px]">
          <div
            ref={tabScrollRef}
            onScroll={updateTabScrollFade}
            className="flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ maskImage: tabScrollMask, WebkitMaskImage: tabScrollMask }}>
            <div className={SP_CONTAINER_CLASS}>
              <TabsList className="p-0 gap-1">
                <TabsTrigger value="list" className={SP_TRIGGER_CLASS}>Liste</TabsTrigger>
                <TabsTrigger value="history" className={SP_TRIGGER_CLASS}>Geçmiş</TabsTrigger>
              </TabsList>
            </div>
          </div>
          <Button
            variant="quiet"
            size="sm"
            onClick={() => setConfirmingNewList(true)}
            disabled={active.items.length === 0}
            title="Bu listeyi arşivle ve yenisini başlat"
            className="h-auto shrink-0 items-start border-b-2 border-transparent px-2 pb-2 pt-0 active:text-foreground">
            <FilePlus2 className="size-3.5" />
            Yeni liste
          </Button>
        </div>
      </header>
      {confirmingNewList && (
        <ConfirmModal
          title="Yeni liste başlatılsın mı?"
          description="Mevcut liste Geçmiş sekmesine taşınacak."
          confirmLabel="Yeni liste başlat"
          cancelLabel="Vazgeç"
          onConfirm={() => {
            setConfirmingNewList(false);
            onStartNewList();
          }}
          onCancel={() => setConfirmingNewList(false)}
        />
      )}
    </>
  );
}
