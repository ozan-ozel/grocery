// One-off: copy every `state:*` key from the Cloudflare KV namespace bound as
// STATE (id in wrangler.toml) into the Netlify Blobs store named "state".
//
// Run with:
//   $env:NETLIFY_AUTH_TOKEN = "<personal access token>"
//   $env:NETLIFY_SITE_ID    = "<site id>"
//   npx tsx scripts/migrate-kv-to-blobs.ts
//
// Requires wrangler to be logged in (`wrangler login`) so the KV list/get
// subprocess calls work. Idempotent: rerunning overwrites Blobs entries.
// Delete this file after the cutover.

import { spawnSync } from "node:child_process";
import { getStore } from "@netlify/blobs";

const KV_NAMESPACE_ID = "17515c0e0aba4083b17da459f40c8fd8";
const STORE_NAME = "state";
const KEY_PREFIX = "state:";

function wrangler(args: string[]): string {
  const res = spawnSync("npx", ["wrangler", ...args], {
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  if (res.status !== 0) {
    throw new Error(
      `wrangler ${args.join(" ")} failed (${res.status}):\n${res.stderr}`
    );
  }
  return res.stdout;
}

function listKeys(): string[] {
  const out = wrangler([
    "kv",
    "key",
    "list",
    `--namespace-id=${KV_NAMESPACE_ID}`,
  ]);
  const parsed = JSON.parse(out) as { name: string }[];
  return parsed
    .map((k) => k.name)
    .filter((name) => name.startsWith(KEY_PREFIX));
}

function getValue(key: string): string {
  return wrangler([
    "kv",
    "key",
    "get",
    key,
    `--namespace-id=${KV_NAMESPACE_ID}`,
  ]).replace(/\r?\n$/, "");
}

async function main() {
  const siteId = process.env.NETLIFY_SITE_ID;
  const token = process.env.NETLIFY_AUTH_TOKEN;
  if (!siteId || !token) {
    throw new Error("set NETLIFY_SITE_ID and NETLIFY_AUTH_TOKEN before running");
  }

  const keys = listKeys();
  if (keys.length === 0) {
    console.log("no state:* keys found in KV, nothing to migrate");
    return;
  }
  console.log(`found ${keys.length} keys: ${keys.join(", ")}`);

  const store = getStore({ name: STORE_NAME, siteID: siteId, token });

  for (const key of keys) {
    const value = getValue(key);
    if (!value) {
      console.warn(`skipping ${key}: empty value`);
      continue;
    }
    await store.set(key, value);
    console.log(`copied ${key} (${value.length} bytes)`);
  }

  console.log("done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
