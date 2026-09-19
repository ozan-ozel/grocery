import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ConfirmModal } from "@/components/ConfirmModal";

// Mirrors REASON_CODES in api/auth-delete-account.ts and the CHECK constraint
// in supabase/27-account-deletion-feedback.sql — add a value in all three.
const DELETE_REASONS = [
  { code: "not_using", label: "Uygulamayı artık kullanmıyorum" },
  { code: "missing_features", label: "İhtiyacım olan özellikler yok" },
  { code: "hard_to_use", label: "Kullanması zor ya da karmaşık" },
  { code: "switched_app", label: "Başka bir uygulamaya geçtim" },
  { code: "privacy", label: "Gizlilik ya da veri endişesi" },
  { code: "bugs", label: "Hatalar ya da yavaşlık" },
  { code: "other", label: "Diğer" },
  { code: "prefer_not_to_say", label: "Söylemek istemiyorum" },
] as const;

export type DeleteFeedback = { reason: string; otherText?: string };

type Props = {
  // Resolves once the account is really gone; rejects if it isn't, so the
  // final step can say so instead of pretending.
  onDelete: (feedback: DeleteFeedback) => Promise<void>;
  onClose: () => void;
};

const OTHER_TEXT_MAX = 300;
// How long the final step's delete button stays inert after it appears. Every
// step's primary button sits in the same spot, so without this a double-tap on
// step 2's "Devam et" could land on step 3's destructive button.
const ARM_DELAY_MS = 1200;

// Three deliberate steps, so an account can't be deleted by a stray tap:
//   1. are you sure (says what is lost)
//   2. why — a short, skippable-in-spirit list (there's a "Söylemek istemiyorum"
//      option) with a free-text "Diğer"; nothing on this step deletes anything
//   3. the actual delete — the only place the destructive button exists
// Each step is its own ConfirmModal, the app's one dialog pattern.
export function DeleteAccountFlow({ onDelete, onClose }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [reason, setReason] = useState<string | null>(null);
  const [otherText, setOtherText] = useState("");
  const [armed, setArmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (step !== 3) return;
    setArmed(false);
    const id = window.setTimeout(() => setArmed(true), ARM_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [step]);

  // While the request is in flight the modal can't be dismissed: closing it
  // mid-delete would hide the outcome of a destructive call.
  const cancel = () => {
    if (!busy) onClose();
  };

  if (step === 1) {
    return (
      <ConfirmModal
        eyebrow="Hesabı sil · Adım 1/3"
        title="Hesabını silmek istiyor musun?"
        description="Hesabın, sahibi olduğun gruplar ve bu gruplardaki tüm listeler, öğün planları ve kişisel planın kalıcı olarak silinir. Bu gruplara davet ettiğin kişiler de erişimini kaybeder."
        confirmLabel="Devam et"
        cancelLabel="Vazgeç"
        onConfirm={() => setStep(2)}
        onCancel={cancel}
      />
    );
  }

  if (step === 2) {
    return (
      <ConfirmModal
        eyebrow="Hesabı sil · Adım 2/3"
        title="Neden ayrılıyorsun?"
        description="İstersen kısaca söyle, uygulamayı geliştirmemize yardım eder. Henüz hiçbir şey silinmedi."
        confirmLabel="Devam et"
        cancelLabel="Vazgeç"
        confirmDisabled={reason === null}
        onConfirm={() => setStep(3)}
        onCancel={cancel}>
        <div role="radiogroup" aria-label="Silme nedeni" className="mt-3 space-y-1.5">
          {DELETE_REASONS.map(({ code, label }) => {
            const selected = reason === code;
            return (
              <button
                key={code}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setReason(code)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                  selected
                    ? "border-signal bg-signal/10 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground active:text-foreground",
                )}>
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded-full border",
                    selected ? "border-signal" : "border-input",
                  )}>
                  {selected && <span className="size-2 rounded-full bg-signal" />}
                </span>
                {label}
              </button>
            );
          })}
        </div>
        {reason === "other" && (
          <div className="mt-2">
            <textarea
              value={otherText}
              maxLength={OTHER_TEXT_MAX}
              rows={3}
              aria-label="Diğer neden"
              placeholder="Kısaca yaz (isteğe bağlı)"
              onInput={(e: Event) =>
                setOtherText((e.target as HTMLTextAreaElement).value)
              }
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Kişisel bilgi yazma — yanıt adın ya da e-postanla ilişkilendirilmez.
            </p>
          </div>
        )}
      </ConfirmModal>
    );
  }

  return (
    <ConfirmModal
      eyebrow="Hesabı sil · Adım 3/3"
      title="Hesap kalıcı olarak silinsin mi?"
      description="Bu işlem geri alınamaz. Devam edersen hesabın ve tüm verilerin hemen silinir."
      confirmLabel={busy ? "Siliniyor…" : "Hesabı kalıcı olarak sil"}
      cancelLabel="Vazgeç"
      destructive
      confirmDisabled={!armed || busy}
      onConfirm={async () => {
        setBusy(true);
        setError(null);
        try {
          await onDelete({
            reason: reason ?? "prefer_not_to_say",
            otherText: reason === "other" ? otherText.trim() : undefined,
          });
          // Success signs the user out, which unmounts the whole Settings
          // screen (and this flow) — nothing left to do here.
        } catch {
          setBusy(false);
          setError("Hesap silinemedi. Biraz sonra tekrar dene.");
        }
      }}
      onCancel={cancel}>
      {error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}
    </ConfirmModal>
  );
}
