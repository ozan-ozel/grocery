import { LogOut, Trash2 } from "lucide-react";
import { TenantSwitcher } from "./TenantSwitcher";
import { ThemeSwitcher } from "./ThemeSwitcher";
import type { Tenant } from "@/lib/store";
import type { Theme } from "@/lib/preferences";

type Props = {
  onSignOut: () => void;
  onDeleteAccount: () => void;
  tenants: Tenant[];
  activeTenantId: string;
  hiddenTenantIds: string[];
  currentUserId: string | null;
  onSelectTenant: (id: string) => void;
  onAddTenant: (name: string) => void;
  onRenameTenant: (id: string, name: string) => void;
  onDeleteTenant: (id: string) => void;
  onToggleHiddenTenant: (id: string) => void;
  theme: Theme;
  onSelectTheme: (theme: Theme) => void;
};

export function SettingsView({
  onSignOut,
  onDeleteAccount,
  tenants,
  activeTenantId,
  hiddenTenantIds,
  currentUserId,
  onSelectTenant,
  onAddTenant,
  onRenameTenant,
  onDeleteTenant,
  onToggleHiddenTenant,
  theme,
  onSelectTheme,
}: Props) {
  function handleDeleteAccount() {
    if (confirm("Hesabı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.")) {
      onDeleteAccount();
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Ayarlar
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Hesap ve tercihler
        </h1>
      </div>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Tema</h2>
        <ThemeSwitcher theme={theme} onSelect={onSelectTheme} />
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Grup</h2>
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
      </section>

      <div className="border-t border-border pt-4 space-y-2">
        <button
          type="button"
          onClick={onSignOut}
          className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent">
          <LogOut className="size-4" />
          Çıkış Yap
        </button>
        <button
          type="button"
          onClick={handleDeleteAccount}
          className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10">
          <Trash2 className="size-4" />
          Hesabı Sil
        </button>
      </div>
    </div>
  );
}
