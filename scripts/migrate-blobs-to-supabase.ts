// One-off: copy every `state:*` key from the Netlify Blobs store "state" into
// the new `sync_state` Supabase table (see supabase/06-sync-state.sql).
//
// Run this BEFORE deploying the state.ts change that reads from Supabase
// instead of Blobs — otherwise every household's active list resets to
// whatever hydrateFromSupabase() can reconstruct from lists/items, which the
// app doesn't keep in sync today (see docs/roadmap.md #1).
//
// Run with:
//   node --env-file=.env.local --experimental-strip-types scripts/migrate-blobs-to-supabase.ts
//
// Requires in .env.local: NETLIFY_SITE_ID, NETLIFY_AUTH_TOKEN, SUPABASE_URL,
// SUPABASE_SERVICE_ROLE_KEY. Idempotent: rerunning overwrites sync_state rows.
// Delete this file (and 06-sync-state.sql's migration note) after the cutover.

import { getStore } from "@netlify/blobs";

const STORE_NAME = "state";
const KEY_PREFIX = "state:";

async function main() {
  const siteId = process.env.NETLIFY_SITE_ID;
  const token = process.env.NETLIFY_AUTH_TOKEN;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!siteId || !token || !supabaseUrl || !serviceKey) {
    throw new Error(
      "set NETLIFY_SITE_ID, NETLIFY_AUTH_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY before running"
    );
  }

  const store = getStore({ name: STORE_NAME, siteID: siteId, token });

  const keys: string[] = [];
  let cursor: string | undefined;
  do {
    const page = await store.list({ prefix: KEY_PREFIX, cursor });
    keys.push(...page.blobs.map((b) => b.key));
    cursor = page.cursor;
  } while (cursor);

  if (keys.length === 0) {
    console.log("no state:* keys found in Blobs, nothing to migrate");
    return;
  }
  console.log(`found ${keys.length} keys: ${keys.join(", ")}`);

  const hasDefault = keys.includes("state:default");
  const base = `${supabaseUrl.replace(/\/$/, "")}/rest/v1`;
  const headers = {
    apikey: serviceKey,
    authorization: `Bearer ${serviceKey}`,
    "content-type": "application/json",
    prefer: "return=representation,resolution=merge-duplicates",
  };

  for (const key of keys) {
    if (key === "state:global" && hasDefault) {
      console.warn("skipping state:global: state:default already exists, keeping the newer one");
      continue;
    }

    const raw = await store.get(key, { type: "text" });
    if (!raw) {
      console.warn(`skipping ${key}: empty value`);
      continue;
    }
    const envelope = JSON.parse(raw) as { version: number; state: unknown };
    const householdId = key === "state:global" ? "default" : key.slice(KEY_PREFIX.length);

    const response = await fetch(`${base}/sync_state?on_conflict=household_id`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        household_id: householdId,
        version: envelope.version ?? 0,
        state: envelope.state,
      }),
    });
    if (!response.ok) {
      console.error(
        `failed to migrate ${key} -> ${householdId}: ${response.status} ${await response.text()}`
      );
      continue;
    }
    console.log(`migrated ${key} -> sync_state.household_id=${householdId} (version ${envelope.version ?? 0})`);
  }

  console.log("done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
