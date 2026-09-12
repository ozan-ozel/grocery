import { LogOut, Trash2, X } from "lucide-react";
import { TenantSwitcher } from "./TenantSwitcher";
import { ThemeSwitcher } from "./ThemeSwitcher";
import type { Tenant } from "@/lib/store";
import type { Theme } from "@/lib/preferences";

type Props = {
  isOpen: boolean;
  onClose: () => void;
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

export function ProfileMenu({
  isOpen,
  onClose,
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
  if (!isOpen) return null;

  function handleLogout() {
    onSignOut();
    onClose();
  }

  function handleDeleteAccount() {
    if (confirm("Hesabı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.")) {
      onDeleteAccount();
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose}>
      <div
        className="fixed inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-2xl border-t border-border bg-card p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Ayarlar</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors">
            <X className="size-5" />
          </button>
        </div>

        {/* Theme Switcher */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Tema</h3>
          <ThemeSwitcher theme={theme} onSelect={onSelectTheme} />
        </div>

        {/* Tenant Switcher */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Grup</h3>
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
        </div>

        {/* Divider */}
        <div className="border-t border-border pt-4" />

        {/* Account Actions */}
        <div className="space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors">
            <LogOut className="size-4" />
            Çıkış Yap
          </button>
          <button
            onClick={handleDeleteAccount}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
            <Trash2 className="size-4" />
            Hesabı Sil
          </button>
        </div>
      </div>
    </div>
  );
}
