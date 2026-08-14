// Cloudflare Pages Function: shared grocery state, no auth.
// KV holds one key per tenant: `state:<tenantId>` -> { version, state }.
// Concurrent PUTs on KV are last-write-wins by design; the version check is a
// best-effort guard, not a transaction. Fine for a household of 2-4.
//
// Legacy note: the pre-tenant client wrote to `state:global`. The new client
// migrates its local state into a tenant with id "default"; on that tenant's
// first GET we transparently fall back to `state:global` so migrating devices
// see their old server state, then subsequent PUTs write to `state:default`.

interface Env {
  STATE: KVNamespace;
}

type Envelope = { version: number; state: unknown };

const LEGACY_KEY = "state:global";
const DEFAULT_TENANT = "default";

const JSON_HEADERS = {
  "content-type": "application/json",
  "cache-control": "no-store",
};

function tenantIdFrom(request: Request): string {
  const url = new URL(request.url);
  const raw = url.searchParams.get("tenant")?.trim();
  if (!raw) return DEFAULT_TENANT;
  // KV keys tolerate arbitrary strings, but keep them tidy: strip anything
  // that isn't safe for logging/URLs. Random ids from uid() are [a-z0-9].
  const safe = raw.replace(/[^a-zA-Z0-9_-]/g, "");
  return safe || DEFAULT_TENANT;
}

function keyFor(tenantId: string) {
  return `state:${tenantId}`;
}

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const tenantId = tenantIdFrom(request);
  const key = keyFor(tenantId);
  let raw = await env.STATE.get(key);
  // Legacy fallback: only the default tenant inherits the pre-tenant blob.
  if (!raw && tenantId === DEFAULT_TENANT) {
    raw = await env.STATE.get(LEGACY_KEY);
  }
  if (!raw) {
    return json({ version: 0, state: null }, 200);
  }
  return new Response(raw, { status: 200, headers: JSON_HEADERS });
};

export const onRequestPut: PagesFunction<Env> = async ({ env, request }) => {
  const tenantId = tenantIdFrom(request);
  const key = keyFor(tenantId);

  let body: Envelope;
  try {
    body = (await request.json()) as Envelope;
  } catch {
    return json({ error: "invalid json" }, 400);
  }
  if (typeof body?.version !== "number" || body.state == null) {
    return json({ error: "expected { version, state }" }, 400);
  }

  let existingRaw = await env.STATE.get(key);
  // On the very first PUT for the default tenant, fold in the legacy blob's
  // version so a client that has been syncing pre-tenant doesn't hit 409.
  if (!existingRaw && tenantId === DEFAULT_TENANT) {
    existingRaw = await env.STATE.get(LEGACY_KEY);
  }
  const existing: Envelope | null = existingRaw ? JSON.parse(existingRaw) : null;
  const currentVersion = existing?.version ?? 0;

  if (body.version !== currentVersion) {
    return json({ version: currentVersion, state: existing?.state ?? null }, 409);
  }

  const next: Envelope = { version: currentVersion + 1, state: body.state };
  await env.STATE.put(key, JSON.stringify(next));
  return json({ version: next.version }, 200);
};

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}
