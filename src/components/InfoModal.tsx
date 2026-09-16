import { useEffect } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  description: string;
  onClose: () => void;
};

// A long explanatory blurb (e.g. activity-level guidance) shown as its own
// modal instead of expanding inline next to a form field — inline expansion
// only grows the one grid cell it's in, leaving a sibling field's cell short
// and the row lopsided for anything longer than a line or two.
export function InfoModal({ title, description, onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center px-5">
      <button
        type="button"
        aria-label="Kapat"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/20"
      />
      <div className="relative z-10 max-h-[80vh] w-full max-w-[26rem] overflow-y-auto rounded-xl border border-border bg-card p-5 shadow-lg">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
        <div className="mt-5 flex justify-end">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Kapat
          </Button>
        </div>
      </div>
    </div>
  );
}
