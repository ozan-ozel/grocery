import { useEffect, useRef, useState } from "react";
import { CloudOff, FilePlus2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ConfirmModal";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { defaultTitle, type List } from "@/lib/store";
import type { SyncStatus } from "@/lib/sync/sync";
import type { Section } from "@/hooks/useUiPrefs";

type Props = {
  syncStatus: SyncStatus;
  section: Section;
  active: List;
  onRenameActive: (title: string) => void;
  onStartNewList: () => void;
};

export function AppHeader({
  syncStatus,
  section,
  active,
  onRenameActive,
  onStartNewList,
}: Props) {
  const total = active.items.length;
  const done = active.items.filter(i => i.checked).length;
  const progress = total ? (done / total) * 100 : 0;

  const [confirmingNewList, setConfirmingNewList] = useState(false);

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

  if (section === "yemek") {
    return null;
  }

  // Only fades the edge that actually has more tabs to reveal, so the mask
  // stays a no-op (fully opaque) once there's nothing left to scroll to.
  const tabScrollMask = `linear-gradient(to right, ${
    tabScrollFade.left ? "transparent, black 24px" : "black"
  }, ${tabScrollFade.right ? "black calc(100% - 24px), transparent" : "black"})`;

  return (
    <>
      <header className="sticky top-0 z-10 -mx-5 bg-background/95 px-5 pt-6 backdrop-blur">
        <div className="flex items-center justify-between gap-2 pb-2">
          <div className="flex items-center gap-1">
            {syncStatus !== "synced" && (
              <span
                title={
                  syncStatus === "offline"
                    ? "Çevrimdışı — bağlantı gelince senkronize edilecek"
                    : "Senkronize ediliyor…"
                }
                className="flex items-center px-1.5 text-muted-foreground">
                {syncStatus === "offline" ? (
                  <CloudOff className="size-4 text-signal" />
                ) : (
                  <RefreshCw className="size-4 animate-spin" />
                )}
              </span>
            )}
          </div>
        </div>

        {section === "alisveris" && (
          <>
            <div className="mt-3 flex items-baseline gap-3">
              <input
                value={active.title}
                aria-label="Liste adı"
                onInput={(e: Event) =>
                  onRenameActive((e.target as HTMLInputElement).value)
                }
                onBlur={() => {
                  if (!active.title.trim())
                    onRenameActive(defaultTitle(active.createdAt));
                }}
                className="min-w-0 flex-1 border-0 bg-transparent p-0 text-2xl font-semibold tracking-tight outline-none"
              />
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

            {/* The tally line fills as the cart fills — the one moving part. */}
            <div className="mt-3 h-px w-full bg-border">
              <div
                className="h-px bg-signal transition-[width] duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        )}

        {section === "alisveris" ? (
          <div className="flex items-center gap-2 pt-3">
            <div
              ref={tabScrollRef}
              onScroll={updateTabScrollFade}
              className="-mx-1 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              style={{ maskImage: tabScrollMask, WebkitMaskImage: tabScrollMask }}>
              <div className="inline-flex items-center rounded-lg bg-card border border-border/50 p-1 shadow-[0_4px_12px_rgba(232,86,74,0.15)]">
                <TabsList className="p-0.5">
                  <TabsTrigger value="list" className="px-3 py-1.5 text-sm rounded-md">Liste</TabsTrigger>
                  <TabsTrigger value="history" className="px-3 py-1.5 text-sm rounded-md">Geçmiş</TabsTrigger>
                  <TabsTrigger value="cats" className="px-3 py-1.5 text-sm rounded-md">Kategoriler</TabsTrigger>
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
        ) : (
          <div className="pt-3" />
        )}
        <div className="-mx-5 h-px bg-border" />
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
