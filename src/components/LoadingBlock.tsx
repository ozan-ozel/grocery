// Shared loading placeholder — see the .loading-flow comment in index.css
// for why this is an animated gradient sweep rather than a plain skeleton.
export function LoadingBlock({ className = "h-16" }: { className?: string }) {
  return <div className={`loading-flow rounded-lg ${className}`} />;
}
