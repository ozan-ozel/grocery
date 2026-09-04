import { useEffect, useRef, useState } from "react";
import { LogOut, Menu, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ConfirmModal";
import { cn } from "@/lib/utils";

type Props = {
  onSignOut: () => void;
  onDeleteAccount: () => void;
};

export function AccountMenu({ onSignOut, onDeleteAccount }: Props) {
  const [open, setOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <Button
        type="button"
        variant="quiet"
        size="icon"
        aria-label="Menü"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}>
        <Menu className="size-4" />
      </Button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 w-48 origin-top-left overflow-hidden rounded-md border border-border bg-card py-1 shadow-lg transition-[opacity,transform] duration-150 starting:scale-95 starting:opacity-0">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onSignOut();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
            <LogOut className="size-3.5" />
            Çıkış yap
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setConfirmingDelete(true);
            }}
            className={cn(
              "flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-signal hover:bg-accent",
            )}>
            <Trash2 className="size-3.5" />
            Hesabı sil
          </button>
        </div>
      )}

      {confirmingDelete && (
        <ConfirmModal
          title="Hesabın silinsin mi?"
          description="Hesabın ve sahip olduğun tüm evler, listeler ve ürünler kalıcı olarak silinecek. Bu işlem geri alınamaz."
          confirmLabel="Hesabı sil"
          cancelLabel="Vazgeç"
          destructive
          onConfirm={() => {
            setConfirmingDelete(false);
            onDeleteAccount();
          }}
          onCancel={() => setConfirmingDelete(false)}
        />
      )}
    </div>
  );
}
