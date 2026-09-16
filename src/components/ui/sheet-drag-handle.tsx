type Props = {
  dragHandlers: {
    onTouchStart: (e: TouchEvent) => void;
    onTouchMove: (e: TouchEvent) => void;
    onTouchEnd: () => void;
  };
};

// Grabber bar at the top of a bottom sheet: the swipe-to-dismiss touch
// target, plus the visual affordance that the sheet is draggable at all.
// Scoped to just this strip (not the whole sheet) so scrolling the sheet's
// own content underneath isn't hijacked by the drag handlers.
export function SheetDragHandle({ dragHandlers }: Props) {
  return (
    <div
      onTouchStart={dragHandlers.onTouchStart as never}
      onTouchMove={dragHandlers.onTouchMove as never}
      onTouchEnd={dragHandlers.onTouchEnd}
      className="-mx-4 -mt-1 flex touch-none justify-center py-2"
      aria-hidden="true">
      <span className="h-1.5 w-10 rounded-full bg-border" />
    </div>
  );
}
