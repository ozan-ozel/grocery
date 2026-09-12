import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  isOpen: boolean;
  onClick: () => void;
};

export function DropdownChevronButton({ label, isOpen, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-between w-full">
      <h2 className="text-sm font-semibold">{label}</h2>
      <ChevronDown
        className={cn(
          "size-5 text-muted-foreground transition-transform",
          isOpen && "rotate-180"
        )}
      />
    </button>
  );
}
