import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

// Guards nutrition-curriculum/DEC_REGISTER.md, which is authoritative for each
// application decision's implementation readiness. The register is
// hand-maintained: these assertions are what stop it drifting out of agreement
// with its own legend or with the decision inventory.

const CURRICULUM = path.resolve(__dirname, "../nutrition-curriculum");
const REGISTER = path.join(CURRICULUM, "DEC_REGISTER.md");
const INVENTORY = path.join(
  CURRICULUM,
  "05_PHASE_3_APP_DECISION_MODEL/APP_DECISION_INVENTORY.md",
);

const WORDS = [
  "SHIPPED",
  "READY",
  "PROVISIONAL",
  "DEFERRED",
  "BLOCKED",
  "COVERED",
] as const;
type Word = (typeof WORDS)[number];

/** Category letter -> readiness word. Mirrors the register's own legend. */
const CATEGORY_TO_WORD: Record<string, Word> = {
  A: "SHIPPED",
  B: "READY",
  C: "PROVISIONAL",
  D: "DEFERRED",
  E: "BLOCKED",
  F: "COVERED",
  G: "COVERED",
  H: "COVERED",
};

interface Row {
  id: string;
  num: number;
  domain: string;
  word: Word;
  category: string;
}

const register = fs.readFileSync(REGISTER, "utf8");

const rows: Row[] = register
  .split(/\r?\n/)
  .map((line) =>
    line.match(
      /^\|\s*`(DEC-(\d{3}))`\s*\|\s*([A-T])\s*·[^|]*\|[^|]*\|\s*`([A-Z]+)`\s*\|\s*([A-H])\s*\|/,
    ),
  )
  .filter((m): m is RegExpMatchArray => m !== null)
  .map((m) => ({
    id: m[1],
    num: Number(m[2]),
    domain: m[3],
    word: m[4] as Word,
    category: m[5],
  }));

/** The per-word counts the register declares in its own vocabulary table. */
const declared: Partial<Record<Word, number>> = {};
for (const line of register.split(/\r?\n/)) {
  const m = line.match(/^\|\s*`([A-Z]+)`\s*\|\s*[A-H][A-H, ]*\|.*\|\s*\*\*(\d+)\*\*\s*\|/);
  if (m && (WORDS as readonly string[]).includes(m[1])) {
    declared[m[1] as Word] = Number(m[2]);
  }
}

describe("DEC_REGISTER.md", () => {
  it("covers exactly DEC-001 through DEC-112, with no gaps or duplicates", () => {
    expect(rows).toHaveLength(112);
    const nums = rows.map((r) => r.num);
    expect(new Set(nums).size).toBe(112);
    const expected = Array.from({ length: 112 }, (_, i) => i + 1);
    expect([...nums].sort((a, b) => a - b)).toEqual(expected);
  });

  it("uses only the six readiness words", () => {
    const offenders = rows.filter(
      (r) => !(WORDS as readonly string[]).includes(r.word),
    );
    expect(
      offenders.map((r) => `${r.id}=${r.word}`),
      "rows using a word outside the six-word vocabulary",
    ).toEqual([]);
  });

  it("keeps every readiness word consistent with its A-H category", () => {
    const mismatches = rows
      .filter((r) => CATEGORY_TO_WORD[r.category] !== r.word)
      .map((r) => `${r.id}: category ${r.category} implies ${CATEGORY_TO_WORD[r.category]}, row says ${r.word}`);
    expect(mismatches).toEqual([]);
  });

  it("matches the per-word counts it declares in its own legend", () => {
    const actual: Record<string, number> = {};
    for (const word of WORDS) actual[word] = 0;
    for (const r of rows) actual[r.word] += 1;

    for (const word of WORDS) {
      expect(
        declared[word],
        `the legend table is missing a count for ${word}`,
      ).toBeDefined();
      expect(
        actual[word],
        `legend says ${declared[word]} rows are ${word}, but ${actual[word]} rows are`,
      ).toBe(declared[word]);
    }
  });

  it("references only decisions that exist in APP_DECISION_INVENTORY.md", () => {
    const inventory = fs.readFileSync(INVENTORY, "utf8");
    const known = new Set(
      [...inventory.matchAll(/^### (DEC-\d{3})/gm)].map((m) => m[1]),
    );
    const invented = rows.filter((r) => !known.has(r.id)).map((r) => r.id);
    expect(invented, "DEC IDs in the register with no inventory entry").toEqual(
      [],
    );
  });

  it("agrees with the inventory on each decision's domain", () => {
    const inventory = fs.readFileSync(INVENTORY, "utf8");
    const domains = new Map<string, string>();
    for (const m of inventory.matchAll(
      /^### (DEC-\d{3})([\s\S]*?)(?=^### DEC-|\Z)/gm,
    )) {
      const d = m[2].match(/\*\*Domain:\*\*\s*([A-T])/);
      if (d) domains.set(m[1], d[1]);
    }
    const mismatches = rows
      .filter((r) => domains.has(r.id) && domains.get(r.id) !== r.domain)
      .map((r) => `${r.id}: inventory says ${domains.get(r.id)}, register says ${r.domain}`);
    expect(mismatches).toEqual([]);
  });
});
