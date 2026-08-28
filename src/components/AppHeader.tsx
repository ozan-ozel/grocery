import { useEffect, useRef, useState } from "react";
import { CloudOff, FilePlus2, LogOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ConfirmModal";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TenantSwitcher } from "@/components/TenantSwitcher";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { cn } from "@/lib/utils";
import { defaultTitle, type List, type Tenant } from "@/lib/store";
import type { SyncStatus } from "@/lib/sync/sync";
import type { Theme } from "@/lib/preferences";
import type { Section } from "@/hooks/useUiPrefs";

type Props = {
  tenants: Tenant[];
  activeTenantId: string;
  hiddenTenantIds: string[];
  currentUserId: string | null;
  onSelectTenant: (id: string) => void;
  onAddTenant: (name: string) => void;
  onRenameTenant: (id: string, name: string) => void;
  onDeleteTenant: (id: string) => void;
  onToggleHiddenTenant: (id: string) => void;
  syncStatus: SyncStatus;
  theme: Theme;
  onSelectTheme: (theme: Theme) => void;
  section: Section;
  onSelectSection: (section: Section) => void;
  active: List;
  onRenameActive: (title: string) => void;
  onStartNewList: () => void;
  onSignOut: () => void;
};

export function AppHeader({
  tenants,
  activeTenantId,
  hiddenTenantIds,
  currentUserId,
  onSelectTenant,
  onAddTenant,
  onRenameTenant,
  onDeleteTenant,
  onToggleHiddenTenant,
  syncStatus,
  theme,
  onSelectTheme,
  section,
  onSelectSection,
  active,
  onRenameActive,
  onStartNewList,
  onSignOut,
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

  // Only fades the edge that actually has more tabs to reveal, so the mask
  // stays a no-op (fully opaque) once there's nothing left to scroll to.
  const tabScrollMask = `linear-gradient(to right, ${
    tabScrollFade.left ? "transparent, black 24px" : "black"
  }, ${tabScrollFade.right ? "black calc(100% - 24px), transparent" : "black"})`;

  return (
    <>
      <header className="sticky top-0 z-10 -mx-5 bg-background/95 px-5 pt-6 backdrop-blur">
        <div className="flex items-center justify-between gap-2 pb-2">
          <TenantSwitcher
            tenants={tenants}
            activeId={activeTenantId}
            hiddenIds={hiddenTenantIds}
            currentUserId={currentUserId}
            onSelect={onSelectTenant}
            onAdd={onAddTenant}
            onRename={onRenameTenant}
            onDelete={onDeleteTenant}
            onToggleHidden={onToggleHiddenTenant}
          />
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
            <ThemeSwitcher theme={theme} onSelect={onSelectTheme} />
            <Button
              type="button"
              variant="quiet"
              size="icon"
              aria-label="Çıkış yap"
              title="Çıkış yap"
              onClick={onSignOut}>
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>

        <div className="inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-lg bg-accent/50 p-1">
          <button
            type="button"
            onClick={() => onSelectSection("alisveris")}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              section === "alisveris"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}>
            Alışveriş
          </button>
          <button
            type="button"
            onClick={() => onSelectSection("besin")}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              section === "besin"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}>
            Besin değerleri
          </button>
          <button
            type="button"
            onClick={() => onSelectSection("yemek")}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              section === "yemek"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}>
            Yemek Planı
          </button>
          <button
            type="button"
            onClick={() => onSelectSection("kisisel")}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              section === "kisisel"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}>
            Kişisel Plan
          </button>
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
              <TabsList className="px-1">
                <TabsTrigger value="list">Liste</TabsTrigger>
                <TabsTrigger value="history">Geçmiş</TabsTrigger>
                <TabsTrigger value="find">Bul</TabsTrigger>
                <TabsTrigger value="cats">Kategoriler</TabsTrigger>
              </TabsList>
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
