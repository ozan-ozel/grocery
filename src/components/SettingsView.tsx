import { useState } from "react";
import { LogOut, Trash2 } from "lucide-react";
import { ConfirmModal } from "./ConfirmModal";
import { DeleteAccountFlow, type DeleteFeedback } from "./DeleteAccountFlow";
import { TenantSwitcher } from "./TenantSwitcher";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { NutritionUploadModal } from "./dev/NutritionUploadModal";
import { useTapSequence } from "@/hooks/useTapSequence";
import type { Tenant } from "@/lib/store";
import type { Theme } from "@/lib/preferences";

// Tap counts, pause-separated, on the page heading: opens the maintenance
// upload modal. Concealment only — the endpoint it calls is admin-gated
// server-side (see NutritionUploadModal).
const MAINTENANCE_PASSCODE = [1, 3, 2, 7] as const;

type Props = {
  onSignOut: () => void;
  onDeleteAccount: (feedback: DeleteFeedback) => Promise<void>;
  tenants: Tenant[];
  activeTenantId: string;
  currentUserId: string | null;
  onSelectTenant: (id: string) => void;
  onAddTenant: (name: string) => void;
  onRenameTenant: (id: string, name: string) => void;
  onDeleteTenant: (id: string) => void;
  theme: Theme;
  onSelectTheme: (theme: Theme) => void;
};

export function SettingsView({
  onSignOut,
  onDeleteAccount,
  tenants,
  activeTenantId,
  currentUserId,
  onSelectTenant,
  onAddTenant,
  onRenameTenant,
  onDeleteTenant,
  theme,
  onSelectTheme,
}: Props) {
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const onHeadingTap = useTapSequence(MAINTENANCE_PASSCODE, () => setMaintenanceOpen(true));

  return (
    <div className="space-y-5">
      {/* select-none + touch-manipulation: rapid taps here must not select the
          text or trigger double-tap zoom. Otherwise it looks like any heading. */}
      <div onClick={onHeadingTap} className="select-none touch-manipulation">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Ayarlar
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Hesap ve tercihler
        </h1>
      </div>

      {/* min-h-[114px] matches the Çıkış Yap/Hesabı Sil card below exactly
          (measured live) — the three cards on this page previously landed
          at three different heights (105/98/114px) purely from each one's
          own content, which made the loading skeleton impossible to match
          without hardcoding per-card fudge factors. Uniform height first,
          content centered within it, so the skeleton just needs one number. */}
      <section className="flex min-h-[114px] flex-col justify-center space-y-2 rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">Tema</h2>
        <ThemeSwitcher theme={theme} onSelect={onSelectTheme} />
      </section>

      <section className="flex min-h-[114px] flex-col justify-center space-y-2 rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">Grup</h2>
        <TenantSwitcher
          tenants={tenants}
          activeId={activeTenantId}
          currentUserId={currentUserId}
          onSelect={onSelectTenant}
          onAdd={onAddTenant}
          onRename={onRenameTenant}
          onDelete={onDeleteTenant}
        />
      </section>

      <div className="space-y-2 rounded-lg border border-border bg-card p-2">
        <button
          type="button"
          onClick={() => setConfirmingSignOut(true)}
          className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent active:bg-accent">
          <LogOut className="size-4" />
          Çıkış Yap
        </button>
        <button
          type="button"
          onClick={() => setDeletingAccount(true)}
          className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 active:bg-destructive/10">
          <Trash2 className="size-4" />
          Hesabı Sil
        </button>
      </div>

      {deletingAccount && (
        <DeleteAccountFlow
          onDelete={onDeleteAccount}
          onClose={() => setDeletingAccount(false)}
        />
      )}

      {maintenanceOpen && (
        <NutritionUploadModal onClose={() => setMaintenanceOpen(false)} />
      )}

      {confirmingSignOut && (
        <ConfirmModal
          title="Emin misin?"
          description="Hesabından çıkış yapacaksın."
          confirmLabel="Çıkış Yap"
          cancelLabel="Vazgeç"
          onConfirm={() => {
            setConfirmingSignOut(false);
            onSignOut();
          }}
          onCancel={() => setConfirmingSignOut(false)}
        />
      )}
    </div>
  );
}
