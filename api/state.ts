// Netlify Function: shared grocery state.
// Backed by the `sync_state` Supabase table (one row per tenant):
// household_id -> { version, state }. Concurrent PUTs are last-write-wins by
// design; the version check is an optimistic-concurrency guard, not a
// transaction. Fine for a household of 2-4.
//
// Previously backed by Netlify Blobs — see scripts/migrate-blobs-to-supabase.ts
// for the one-off data migration and supabase/06-sync-state.sql for the schema.

import { requireUser, requireHouseholdAccess, authErrorResponse } from "./_auth";

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

function restBase(url: string): string {
  return `${url.replace(/\/$/, "")}/rest/v1`;
}

export default {
  async fetch(request: Request): Promise<Response> {
  let user;
  try {
    user = await requireUser(request);
  } catch (err) {
    return authErrorResponse(err);
  }
  const tenantId = tenantIdFrom(request);
  try {
    await requireHouseholdAccess(tenantId, user);
  } catch (err) {
    return authErrorResponse(err);
  }
  const method = request.method.toUpperCase();

  if (method === "GET") return handleGet(tenantId);
  if (method === "PUT") return handlePut(request, tenantId);
  return json({ error: "method not allowed" }, 405);
  },
};

async function fetchRow(
  supabaseUrl: string,
  serviceKey: string,
  tenantId: string
): Promise<{ version: number; state: unknown } | null> {
  const headers = {
    apikey: serviceKey,
    authorization: `Bearer ${serviceKey}`,
    accept: "application/json",
  };
  const response = await fetch(
    `${restBase(supabaseUrl)}/sync_state?household_id=eq.${encodeURIComponent(tenantId)}&select=version,state`,
    { headers }
  );
  if (!response.ok) throw new Error(`supabase ${response.status}`);
  const rows = (await response.json()) as Array<{ version: number; state: unknown }>;
  return rows[0] ?? null;
}

async function handleGet(tenantId: string): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return json({ error: "supabase not configured" }, 500);
  }

  let row: { version: number; state: unknown } | null;
  try {
    row = await fetchRow(supabaseUrl, serviceKey, tenantId);
  } catch (err) {
    console.error(`[state] Supabase read failed tenant=${tenantId}:`, err);
    return json({ error: "storage read failed" }, 500);
  }
  if (row) {
    return json({ version: row.version, state: row.state }, 200);
  }

  // No row for this tenant yet: try hydrating from Supabase (households/lists/items).
  // One-time bridge — the first client PUT will populate sync_state and this
  // path won't run again for that tenant.
  const hydrated = await hydrateFromSupabase(tenantId);
  if (hydrated) {
    console.info(`[state] hydrated tenant=${tenantId} from Supabase (${hydrated.lists.length} lists)`);
    return json({ version: 0, state: hydrated }, 200);
  }

  return json({ version: 0, state: null }, 200);
}

async function hydrateFromSupabase(householdId: string): Promise<HydratedState | null> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return null;

  const base = restBase(supabaseUrl);
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
    if (!listsRes.ok) {
      console.error(`[state] hydrateFromSupabase: lists fetch failed tenant=${householdId} status=${listsRes.status}`);
      return null;
    }
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
    if (!itemsRes.ok) {
      console.error(`[state] hydrateFromSupabase: items fetch failed tenant=${householdId} status=${itemsRes.status}`);
      return null;
    }
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
  } catch (err) {
    console.error(`[state] hydrateFromSupabase threw tenant=${householdId}:`, err);
    return null;
  }
}

async function handlePut(request: Request, tenantId: string): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return json({ error: "supabase not configured" }, 500);
  }

  let body: Envelope;
  try {
    body = (await request.json()) as Envelope;
  } catch {
    return json({ error: "invalid json" }, 400);
  }
  if (typeof body?.version !== "number" || body.state == null) {
    return json({ error: "expected { version, state }" }, 400);
  }

  const base = restBase(supabaseUrl);
  const headers = {
    apikey: serviceKey,
    authorization: `Bearer ${serviceKey}`,
    accept: "application/json",
    "content-type": "application/json",
    prefer: "return=representation",
  };

  try {
    // Attempt the optimistic-concurrency update first — succeeds whether or
    // not the row previously existed, as long as its version matches.
    const patchRes = await fetch(
      `${base}/sync_state?household_id=eq.${encodeURIComponent(tenantId)}&version=eq.${body.version}`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          version: body.version + 1,
          state: body.state,
          updated_at: new Date().toISOString(),
        }),
      }
    );
    if (!patchRes.ok) {
      console.error(`[state] update failed tenant=${tenantId}:`, patchRes.status, await patchRes.text());
      return json({ error: "storage write failed" }, 500);
    }
    const updated = (await patchRes.json()) as Array<{ version: number }>;
    if (updated.length > 0) {
      return json({ version: updated[0].version }, 200);
    }

    // No row matched — either it doesn't exist yet, or the version is stale.
    const current = await fetchRow(supabaseUrl, serviceKey, tenantId);
    if (current) {
      console.warn(
        `[state] 409 conflict tenant=${tenantId} clientVersion=${body.version} serverVersion=${current.version}`
      );
      return json({ version: current.version, state: current.state }, 409);
    }

    // Genuinely new tenant: insert. ignore-duplicates guards a concurrent
    // first-write race between two clients.
    const insertRes = await fetch(`${base}/sync_state?on_conflict=household_id`, {
      method: "POST",
      headers: { ...headers, prefer: "return=representation,resolution=ignore-duplicates" },
      body: JSON.stringify({ household_id: tenantId, version: body.version + 1, state: body.state }),
    });
    if (!insertRes.ok) {
      console.error(`[state] insert failed tenant=${tenantId}:`, insertRes.status, await insertRes.text());
      return json({ error: "storage write failed" }, 500);
    }
    const inserted = (await insertRes.json()) as Array<{ version: number }>;
    if (inserted.length === 0) {
      const race = await fetchRow(supabaseUrl, serviceKey, tenantId);
      return json({ version: race?.version ?? 0, state: race?.state ?? null }, 409);
    }
    return json({ version: inserted[0].version }, 200);
  } catch (err) {
    console.error(`[state] Supabase write failed tenant=${tenantId}:`, err);
    return json({ error: "storage write failed" }, 500);
  }
}

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}
