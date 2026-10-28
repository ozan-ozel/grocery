import { Checkbox } from "@/components/ui/checkbox";
import { SCOPE_QUESTION } from "@/lib/safetyCopy";

// DEC-012 self-attestation (see useScopeAttestation.ts). Replaces the old
// passive "not designed for…" line with a question the user answers.
export function ScopeCheck({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="mt-3 flex cursor-pointer items-start gap-2.5 text-xs text-muted-foreground">
      <Checkbox
        className="mt-0.5"
        checked={checked}
        onCheckedChange={value => onChange(value === true)}
      />
      <span>
        <span className="text-foreground">{SCOPE_QUESTION}</span>{" "}
        Bu durumlar için uygulama otomatik hedef vermez.
      </span>
    </label>
  );
}
