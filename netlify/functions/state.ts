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

// Shape mirrors src/lib/store.ts State/List/Item. Kept as a local type so this
// function doesn't need to import client code.
type HydratedItem = {
  id: string;
  name: string;
  qty: string;
  checked: boolean;
  addedAt: number;
  category?: string;
};
type HydratedList = {
  id: string;
  title: string;
  createdAt: number;
  closedAt?: number;
  items: HydratedItem[];
};
type HydratedState = {
  lists: HydratedList[];
  activeId: string | null;
  version?: number;
  groupByCategory?: boolean;
};

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
  const store = getStore({ name: "state", consistency: "strong" });
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
  if (raw) {
    return new Response(raw, { status: 200, headers: JSON_HEADERS });
  }

  // Blobs empty for this tenant: try hydrating from Supabase (households/lists/items).
  // This is a one-time bridge — the first client PUT will populate Blobs and this
  // path won't run again for that tenant.
  const hydrated = await hydrateFromSupabase(tenantId);
  if (hydrated) {
    return json({ version: 0, state: hydrated }, 200);
  }

  return json({ version: 0, state: null }, 200);
}

async function hydrateFromSupabase(householdId: string): Promise<HydratedState | null> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return null;

  const base = `${supabaseUrl.replace(/\/$/, "")}/rest/v1`;
  const headers = {
    apikey: anonKey,
    authorization: `Bearer ${anonKey}`,
    accept: "application/json",
  };

  try {
    const listsRes = await fetch(
      `${base}/lists?select=id,title,created_at,closed_at&household_id=eq.${encodeURIComponent(
        householdId
      )}&order=created_at.desc`,
      { headers }
    );
    if (!listsRes.ok) return null;
    const listRows = (await listsRes.json()) as Array<{
      id: string;
      title: string;
      created_at: string;
      closed_at: string | null;
    }>;
    if (listRows.length === 0) return null;

    const listIds = listRows.map((l) => l.id);
    const inClause = `(${listIds.map((id) => `"${id}"`).join(",")})`;
    const itemsRes = await fetch(
      `${base}/items?select=id,list_id,name,qty,checked,category,added_at&list_id=in.${encodeURIComponent(
        inClause
      )}&order=added_at.asc`,
      { headers }
    );
    if (!itemsRes.ok) return null;
    const itemRows = (await itemsRes.json()) as Array<{
      id: string;
      list_id: string;
      name: string;
      qty: string;
      checked: boolean;
      category: string | null;
      added_at: string;
    }>;

    const itemsByList = new Map<string, HydratedItem[]>();
    for (const row of itemRows) {
      const arr = itemsByList.get(row.list_id) ?? [];
      arr.push({
        id: row.id,
        name: row.name,
        qty: row.qty,
        checked: row.checked,
        addedAt: Date.parse(row.added_at),
        ...(row.category ? { category: row.category } : {}),
      });
      itemsByList.set(row.list_id, arr);
    }

    const lists: HydratedList[] = listRows.map((l) => ({
      id: l.id,
      title: l.title,
      createdAt: Date.parse(l.created_at),
      ...(l.closed_at ? { closedAt: Date.parse(l.closed_at) } : {}),
      items: itemsByList.get(l.id) ?? [],
    }));

    const active = lists.find((l) => l.closedAt === undefined);
    return {
      lists,
      activeId: active?.id ?? lists[0]?.id ?? null,
    };
  } catch {
    return null;
  }
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
