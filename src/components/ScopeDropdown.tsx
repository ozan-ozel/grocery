import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export type ScopeOption = "list" | "all" | "compare" | "cats";

type Props = {
  activeScope: ScopeOption;
  onSelectScope: (scope: ScopeOption) => void;
  options: Array<{ id: ScopeOption; label: string }>;
  label?: string;
};

export function ScopeDropdown({
  activeScope,
  onSelectScope,
  options,
  label,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium transition-all",
          "bg-accent text-foreground hover:opacity-90"
        )}>
        {label}
        <ChevronDown
          className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-10 rounded-lg bg-card border border-border shadow-md overflow-hidden min-w-48">
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                onSelectScope(opt.id);
                setOpen(false);
              }}
              className={cn(
                "w-full text-left px-3 py-2 text-sm font-medium transition-colors",
                activeScope === opt.id
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
