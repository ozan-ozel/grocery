export type Combo = {
  id: string;
  nameTr: string;
  items: { foodId: string; grams: number }[];
  prepMinutes: number;
  tags: string[];
  // Optional concise textual preparation note (DEC-067 Level 1). Informational
  // only — never parsed, never consulted by matching/nutrition/shopping logic.
  prepNote?: string;
};
