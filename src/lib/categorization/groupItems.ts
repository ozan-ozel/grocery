import { categorize } from "@/lib/categorization/categories";
import type { AnyCategoryId } from "@/lib/categorization/userCategories";
import type { Item } from "@/lib/store";
import type { MergedCategory } from "@/lib/categorization/userCategories";

export function groupItems(
  items: Item[],
  categories: MergedCategory[]
): { id: AnyCategoryId; items: Item[] }[] {
  const known = new Set<AnyCategoryId>(categories.map((c) => c.id));
  const byId = new Map<AnyCategoryId, Item[]>();
  for (const item of items) {
    // Ignore stored "diger" so improvements to the classifier take effect
    // without the user re-running "Otomatik kategorize et". Non-diger stamps
    // (including custom "u:..." ids) are kept because the user set them.
    const stored =
      item.category && item.category !== "diger" ? item.category : undefined;
    let id: AnyCategoryId = stored ?? categorize(item.name);
    // If the stored id points at a category that no longer exists (deleted
    // custom, or came in from an older shape), fall back to a fresh guess so
    // the item never disappears from the grouped view.
    if (!known.has(id)) {
      const guess = categorize(item.name);
      id = known.has(guess) ? guess : "diger";
    }
    if (!byId.has(id)) byId.set(id, []);
    byId.get(id)!.push(item);
  }
  // Follow the user's merged category order. Hidden categories still show up
  // if they hold items so nothing gets orphaned.
  return categories
    .filter((c) => byId.has(c.id))
    .map((c) => ({ id: c.id, items: byId.get(c.id)! }));
}
