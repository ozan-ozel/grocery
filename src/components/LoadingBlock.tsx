import { cn } from "@/lib/utils";

// Shared loading placeholder — see the .loading-flow comment in index.css
// for why this is an animated gradient sweep rather than a plain skeleton.
// Defaults to rounded-lg; pass a different rounded-* in className (e.g.
// rounded-full for a pill) to match the shape it's standing in for — cn()
// makes that override cleanly instead of both classes fighting.
export function LoadingBlock({ className = "h-16" }: { className?: string }) {
  return <div className={cn("loading-flow rounded-lg", className)} />;
}
