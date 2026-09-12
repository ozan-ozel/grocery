import { ChevronRight } from "lucide-react";

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
      <span
        aria-hidden="true"
        className="flex size-5 shrink-0 items-center justify-center rounded-full border border-signal/70 bg-signal/10 text-signal shadow-sm">
        <ChevronRight
          className="size-3.5 transition-transform"
          style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}
        />
      </span>
    </button>
  );
}
