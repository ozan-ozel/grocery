import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

// Structural regression guard for the milestone's core safety requirement:
// fuzzy matching (isCloseMatch / findCanonicalName, both edit-distance
// based — see fuzzyMatch.ts) must never be used to establish allergy,
// allergen, intolerance, substitution-safety, or nutrition identity.
// Verified today by inspection (foodExclusions.ts and comboMatch.ts import
// neither); this test makes that fact regression-proof — it fails loudly
// if a future change wires fuzzy matching into the safety path, instead of
// relying on someone noticing in review.
//
// Source-text scan rather than a runtime import check: importing
// fuzzyMatch's exports for an "unused" check would prove nothing (Vitest's
// module graph doesn't distinguish "imported but never called" from "not
// imported"), and a real call-graph analysis is far more machinery than
// this invariant needs. A grep for the forbidden identifiers is the
// correct-weight tool — it directly encodes the rule from the milestone
// brief for the two files responsible for exclusion identity/matching.

const dir = path.dirname(fileURLToPath(import.meta.url));
const FORBIDDEN = ["isCloseMatch", "findCanonicalName"];
const SAFETY_FILES = ["foodExclusions.ts", "comboMatch.ts"];

describe("fuzzy matching must not reach the exclusion-safety path", () => {
  for (const file of SAFETY_FILES) {
    it(`${file} does not reference isCloseMatch or findCanonicalName`, () => {
      const source = readFileSync(path.join(dir, file), "utf-8");
      for (const symbol of FORBIDDEN) {
        expect(source.includes(symbol)).toBe(false);
      }
    });
  }

  it("isCloseMatch/findCanonicalName still exist elsewhere — this guards scope, not existence", () => {
    // If this ever fails, the identifiers were renamed/removed and the
    // test above would be vacuously true (nothing to find, on either
    // side) — this keeps the guard honest.
    const fuzzyMatch = readFileSync(path.join(dir, "fuzzyMatch.ts"), "utf-8");
    const store = readFileSync(path.join(dir, "store.ts"), "utf-8");
    expect(fuzzyMatch.includes("export function isCloseMatch")).toBe(true);
    expect(store.includes("export function findCanonicalName")).toBe(true);
  });
});
