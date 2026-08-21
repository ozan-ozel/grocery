export function Cell({ value }: { value: number | undefined }) {
  return (
    <td className="ledger px-1 py-2 text-right tabular-nums">
      {typeof value === "number" ? format(value) : "-"}
    </td>
  );
}

export function format(n: number) {
  return n >= 100 ? Math.round(n).toString() : n.toFixed(1);
}
