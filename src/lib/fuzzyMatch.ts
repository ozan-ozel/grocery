/**
 * Small edit-distance–based matching used to keep typo'd grocery names from
 * becoming permanent, separate catalog entries. Deliberately conservative:
 * short words only match exactly, longer words tolerate a handful of edits.
 */

const MIN_FUZZY_LENGTH = 4;
const MAX_LENGTH_DELTA = 2;

export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  let curr = new Array<number>(n + 1);

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1, // deletion
        curr[j - 1] + 1, // insertion
        prev[j - 1] + cost // substitution
      );
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

function maxAllowedDistance(len: number): number {
  if (len < MIN_FUZZY_LENGTH) return 0;
  if (len <= 6) return 1;
  return 2;
}

/**
 * True when `a` and `b` are the same word up to a small number of typos
 * (substitution, missing letter, extra letter, or an adjacent swap on
 * longer words). Words under 4 characters, or a pair whose lengths differ
 * by more than 2, only match when identical — short/mismatched-length
 * words are where fuzzy matching produces false positives.
 */
export function isCloseMatch(a: string, b: string): boolean {
  if (a === b) return true;
  const minLen = Math.min(a.length, b.length);
  if (minLen < MIN_FUZZY_LENGTH) return false;
  if (Math.abs(a.length - b.length) > MAX_LENGTH_DELTA) return false;
  return levenshteinDistance(a, b) <= maxAllowedDistance(minLen);
}
