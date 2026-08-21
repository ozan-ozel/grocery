import { CloudOff, FilePlus2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  onSelectTenant: (id: string) => void;
  onAddTenant: (name: string) => void;
  onRenameTenant: (id: string, name: string) => void;
  onDeleteTenant: (id: string) => void;
  syncStatus: SyncStatus;
  theme: Theme;
  onSelectTheme: (theme: Theme) => void;
  section: Section;
  onSelectSection: (section: Section) => void;
  active: List;
  onRenameActive: (title: string) => void;
  onStartNewList: () => void;
};

export function AppHeader({
  tenants,
  activeTenantId,
  onSelectTenant,
  onAddTenant,
  onRenameTenant,
  onDeleteTenant,
  syncStatus,
  theme,
  onSelectTheme,
  section,
  onSelectSection,
  active,
  onRenameActive,
  onStartNewList,
}: Props) {
  const total = active.items.length;
  const done = active.items.filter((i) => i.checked).length;
  const progress = total ? (done / total) * 100 : 0;

  return (
    <header className="sticky top-0 z-10 -mx-5 bg-background/95 px-5 pt-6 backdrop-blur">
      <div className="flex items-center justify-between gap-2 pb-2">
        <TenantSwitcher
          tenants={tenants}
          activeId={activeTenantId}
          onSelect={onSelectTenant}
          onAdd={onAddTenant}
          onRename={onRenameTenant}
          onDelete={onDeleteTenant}
        />
        <div className="flex items-center gap-1">
          {syncStatus !== "synced" && (
            <span
              title={
                syncStatus === "offline"
                  ? "Çevrimdışı — bağlantı gelince senkronize edilecek"
                  : "Senkronize ediliyor…"
              }
              className="flex items-center px-1.5 text-muted-foreground"
            >
              {syncStatus === "offline" ? (
                <CloudOff className="size-4 text-signal" />
              ) : (
                <RefreshCw className="size-4 animate-spin" />
              )}
            </span>
          )}
          <ThemeSwitcher theme={theme} onSelect={onSelectTheme} />
        </div>
      </div>

      <div className="inline-flex items-center gap-1 rounded-lg bg-accent/50 p-1">
        <button
          type="button"
          onClick={() => onSelectSection("alisveris")}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            section === "alisveris"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Alışveriş
        </button>
        <button
          type="button"
          onClick={() => onSelectSection("besin")}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            section === "besin"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Besin değerleri
        </button>
        <button
          type="button"
          onClick={() => onSelectSection("yemek")}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            section === "yemek"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Yemek Planı
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
                if (!active.title.trim()) onRenameActive(defaultTitle(active.createdAt));
              }}
              className="min-w-0 flex-1 border-0 bg-transparent p-0 text-2xl font-semibold tracking-tight outline-none"
            />
            <span className="ledger shrink-0 text-lg">
              <span className={done > 0 ? "text-signal" : "text-muted-foreground"}>
                {String(done).padStart(2, "0")}
              </span>
              <span className="text-muted-foreground">/{String(total).padStart(2, "0")}</span>
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
          <div className="-mx-1 flex-1 overflow-x-auto">
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
            onClick={onStartNewList}
            disabled={active.items.length === 0}
            title="Bu listeyi arşivle ve yenisini başlat"
            className="shrink-0"
          >
            <FilePlus2 className="size-3.5" />
            Yeni liste
          </Button>
        </div>
      ) : (
        <div className="pt-3" />
      )}
      <div className="-mx-5 h-px bg-border" />
    </header>
  );
}
