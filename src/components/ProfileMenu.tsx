import { LogOut, Trash2 } from "lucide-react";

type Props = {
  onClose: () => void;
  onSignOut: () => void;
  onDeleteAccount: () => void;
};

export function ProfileMenu({ onClose, onSignOut, onDeleteAccount }: Props) {
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
    <div className="fixed inset-0 z-40" onClick={onClose}>
      <div
        className="fixed bottom-16 sm:bottom-12 right-2 w-48 rounded-lg border border-border bg-card shadow-lg"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col divide-y divide-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-accent transition-colors">
            <LogOut className="size-4" />
            Çıkış Yap
          </button>
          <button
            onClick={handleDeleteAccount}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
            <Trash2 className="size-4" />
            Hesabı Sil
          </button>
        </div>
      </div>
    </div>
  );
}
