// Grabber bar at the top of a bottom sheet — the visual affordance that the
// sheet is draggable. The drag itself is handled for the whole sheet by
// useSwipeToDismiss (touches bubble up from here), so this carries no handlers
// of its own; touch-none just stops the browser from starting a page scroll
// when a gesture begins on the bar.
export function SheetDragHandle() {
  return (
    <div
      className="-mx-4 -mt-1 flex touch-none justify-center py-2"
      aria-hidden="true">
      <span className="h-1.5 w-10 rounded-full bg-border" />
    </div>
  );
}
