// Boot-path localStorage caches. All three were introduced together by the
// boot-performance work (docs/superpowers/plans/2026-09-17-boot-performance-waterfall.md)
// for one reason: let the first paint happen without waiting on the
// /api/auth-session -> /api/households -> /api/state chain, which used to run
// as three strictly serial tiers.
//
// The plan called for hand-rolling try/catch at each call site, matching
// useMealPersonalization / useOnboarding / src/lib/nutrition.ts. They live in
// one module instead because *clearing* them is a security operation: sign-out,
// account deletion, a confirmed 401, and a detected user change must all wipe
// the whole set together, and that only stays true if the key names exist in
// exactly one place. Nothing else about the convention changes —
// `grocery.<thing>.v1` with a `:<scopeId>` suffix, silent best-effort
// fallbacks, and every read returning null rather than throwing (Safari
// private mode and blocked site data both make localStorage throw, and every
// caller must render correctly when these return nothing).
//
// What is NOT stored here: anything resembling a credential. The session hint
// is an identity hint — the same { email, userId } pair /api/auth-session
// already returns — never an access token. It authorizes nothing; every
// /api/* handler still validates the real httpOnly cookie through
// requireUser().

import type { State } from "./store";

const SESSION_KEY = "grocery.session.v1";
const ACTIVE_TENANT_KEY = "grocery.activeTenant.v1";
const STATE_KEY_PREFIX = "grocery.state.v1:";

export type SessionHint = { email: string | null; userId: string };

function readJson(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota, private mode, blocked site data — the cache is an optimization,
    // never a correctness requirement.
  }
}

// -------- session hint -------------------------------------------------------

// Only a hint with a real userId is useful: it exists so App() can render
// AppShell (which needs currentUserId) before the session check returns.
export function loadSessionHint(): SessionHint | null {
  const parsed = readJson(SESSION_KEY);
  if (!parsed || typeof parsed !== "object") return null;
  const hint = parsed as Record<string, unknown>;
  if (typeof hint.userId !== "string" || !hint.userId) return null;
  const email = typeof hint.email === "string" ? hint.email : null;
  return { email, userId: hint.userId };
}

export function saveSessionHint(hint: SessionHint) {
  writeJson(SESSION_KEY, hint);
}

// -------- active tenant ------------------------------------------------------

export function loadLastTenant(): string | null {
  try {
    const raw = localStorage.getItem(ACTIVE_TENANT_KEY);
    return raw && raw.trim() ? raw : null;
  } catch {
    return null;
  }
}

export function saveLastTenant(id: string) {
  try {
    localStorage.setItem(ACTIVE_TENANT_KEY, id);
  } catch {
    // Best-effort.
  }
}

// -------- synced state, per tenant -------------------------------------------

function stateKey(tenantId: string): string {
  return `${STATE_KEY_PREFIX}${tenantId}`;
}

// Enforces the same invariant normalizeHydratedState (src/lib/sync/sync.ts)
// keeps at the network boundary: every state handed to the app has at least
// one list. Everything past App.tsx's render guard assumes `state.lists[0]`
// exists, so a truncated or hand-edited cache entry must be rejected outright
// rather than crashing the render.
function isCachedState(value: unknown): value is State {
  if (!value || typeof value !== "object") return false;
  const s = value as Record<string, unknown>;
  if (!Array.isArray(s.lists) || s.lists.length === 0) return false;
  if (s.activeId !== null && typeof s.activeId !== "string") return false;
  return s.lists.every(list => {
    if (!list || typeof list !== "object") return false;
    const l = list as Record<string, unknown>;
    return typeof l.id === "string" && Array.isArray(l.items);
  });
}

export function loadCachedState(tenantId: string | null): State | null {
  if (!tenantId) return null;
  const parsed = readJson(stateKey(tenantId));
  return isCachedState(parsed) ? parsed : null;
}

export function saveCachedState(tenantId: string, state: State) {
  writeJson(stateKey(tenantId), state);
}

// -------- clearing -----------------------------------------------------------

// Wipes every boot cache: the identity hint, the remembered tenant, and the
// cached state of *all* tenants, not just the active one. Called on sign-out,
// on account deletion, whenever /api/auth-session confirms there is no session,
// and whenever it returns a different user than the hint claimed — so a shared
// browser can't paint the previous account's lists on the next visit.
export function clearBootCaches() {
  try {
    const stale: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STATE_KEY_PREFIX)) stale.push(key);
    }
    for (const key of stale) localStorage.removeItem(key);
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(ACTIVE_TENANT_KEY);
  } catch {
    // Best-effort.
  }
}
