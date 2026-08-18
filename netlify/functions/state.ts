// Netlify Function: shared grocery state, no auth.
// Blobs store "state" holds one key per tenant: `state:<tenantId>` ->
// { version, state }. Concurrent PUTs are last-write-wins by design; the
// version check is a best-effort guard, not a transaction. Fine for a
// household of 2-4.
//
// Legacy note: the pre-tenant client wrote to `state:global`. The tenant
// "default" transparently falls back to that key on first GET so migrating
// devices see their old server state, then subsequent PUTs write to
// `state:default`.

import type { Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

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
  const safe = raw.replace(/[^a-zA-Z0-9_-]/g, "");
  return safe || DEFAULT_TENANT;
}

function keyFor(tenantId: string) {
  return `state:${tenantId}`;
}

export default async (request: Request, _context: Context): Promise<Response> => {
  const store = getStore("state");
  const method = request.method.toUpperCase();

  if (method === "GET") return handleGet(request, store);
  if (method === "PUT") return handlePut(request, store);
  return json({ error: "method not allowed" }, 405);
};

async function handleGet(request: Request, store: ReturnType<typeof getStore>): Promise<Response> {
  const tenantId = tenantIdFrom(request);
  const key = keyFor(tenantId);
  let raw = await store.get(key, { type: "text" });
  if (!raw && tenantId === DEFAULT_TENANT) {
    raw = await store.get(LEGACY_KEY, { type: "text" });
  }
  if (!raw) {
    return json({ version: 0, state: null }, 200);
  }
  return new Response(raw, { status: 200, headers: JSON_HEADERS });
}

async function handlePut(request: Request, store: ReturnType<typeof getStore>): Promise<Response> {
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

  let existingRaw = await store.get(key, { type: "text" });
  if (!existingRaw && tenantId === DEFAULT_TENANT) {
    existingRaw = await store.get(LEGACY_KEY, { type: "text" });
  }
  const existing: Envelope | null = existingRaw ? JSON.parse(existingRaw) : null;
  const currentVersion = existing?.version ?? 0;

  if (body.version !== currentVersion) {
    return json({ version: currentVersion, state: existing?.state ?? null }, 409);
  }

  const next: Envelope = { version: currentVersion + 1, state: body.state };
  await store.set(key, JSON.stringify(next));
  return json({ version: next.version }, 200);
}

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}
