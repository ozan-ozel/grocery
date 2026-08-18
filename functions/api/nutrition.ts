// POST /api/nutrition  { names: string[] }         -> Nutrition[]     (read)
// PUT  /api/nutrition  { row: NutritionRow }       -> Nutrition       (upsert)
//
// The read proxies to PostgREST so the anon key stays server-side. The write
// uses the service_role key (also server-side) so RLS on public.nutrition can
// stay locked to reads only.
//
// Anyone with the app URL can hit PUT. That is a deliberate trade-off for a
// small household PWA; if this stops being personal, put the app behind
// Cloudflare Access.

interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

type Nutrition = {
  name_tr: string;
  aliases: string[];
  kcal_per_100: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  fiber_g: number;
};

const JSON_HEADERS = {
  "content-type": "application/json",
  "cache-control": "no-store",
};

const MAX_NAMES = 200;
const BROWSE_LIMIT_DEFAULT = 60;
const BROWSE_LIMIT_MAX = 150;
const SELECT_COLS =
  "name_tr,aliases,kcal_per_100,protein_g,fat_g,carbs_g,fiber_g";

function normalize(name: string): string {
  return name.trim().toLocaleLowerCase("tr-TR");
}

function restBase(env: Env): string {
  return `${env.SUPABASE_URL.replace(/\/$/, "")}/rest/v1`;
}

// -------- READ ---------------------------------------------------------------

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return json({ error: "supabase not configured" }, 500);
  }

  let body: { names?: unknown };
  try {
    body = (await request.json()) as { names?: unknown };
  } catch {
    return json({ error: "invalid json" }, 400);
  }
  if (!Array.isArray(body.names)) {
    return json({ error: "expected { names: string[] }" }, 400);
  }

  const normalized = Array.from(
    new Set(
      body.names
        .filter((n): n is string => typeof n === "string")
        .map(normalize)
        .filter((n) => n.length > 0)
    )
  ).slice(0, MAX_NAMES);

  if (normalized.length === 0) return json([], 200);

  // PostgREST's or=() with mixed in.() + ov.{} inside a single query is fragile
  // (the inner commas conflict with the outer or() separator). Two clean
  // queries, one for name matches and one for alias matches, then merge.
  const headers = {
    apikey: env.SUPABASE_ANON_KEY,
    authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
    accept: "application/json",
  };

  // Build query strings by hand: PostgREST wants ( ) { } " and , as literal
  // syntax chars, not percent-encoded. URLSearchParams would escape them all.
  // We only encode inside each name literal, using encodeURIComponent to cover
  // spaces and any other reserved chars that appear in Turkish grocery names.
  const inList = `(${normalized.map(encodePgrstLiteral).join(",")})`;
  const ovList = `{${normalized.map(encodePgrstLiteral).join(",")}}`;

  const byNameUrl = `${restBase(env)}/nutrition?select=${SELECT_COLS}&name_tr=in.${inList}`;
  const byAliasUrl = `${restBase(env)}/nutrition?select=${SELECT_COLS}&aliases=ov.${ovList}`;

  try {
    const [byName, byAlias] = await Promise.all([
      fetch(byNameUrl, { headers }),
      fetch(byAliasUrl, { headers }),
    ]);
    if (!byName.ok) return json({ error: `supabase ${byName.status}` }, 502);
    if (!byAlias.ok) return json({ error: `supabase ${byAlias.status}` }, 502);

    const merged = new Map<string, Nutrition>();
    for (const raw of ((await byName.json()) as unknown[]) ?? []) {
      const n = coerce(raw);
      if (n) merged.set(n.name_tr, n);
    }
    for (const raw of ((await byAlias.json()) as unknown[]) ?? []) {
      const n = coerce(raw);
      if (n && !merged.has(n.name_tr)) merged.set(n.name_tr, n);
    }
    return json([...merged.values()], 200);
  } catch (err) {
    return json({ error: String(err) }, 502);
  }
};

// -------- BROWSE / SEARCH ------------------------------------------------------
// GET /api/nutrition?q=<text>&limit=<n> -> Nutrition[]
// Powers the "Tümü" (all foods) panel: a name search over the whole table,
// not just the caller-supplied names POST handles. Empty q still returns a
// page (alphabetical) so the panel isn't blank before the user types.

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return json({ error: "supabase not configured" }, 500);
  }

  const url = new URL(request.url);
  const q = normalize(url.searchParams.get("q") ?? "");
  const rawLimit = Number(url.searchParams.get("limit"));
  const limit = Number.isFinite(rawLimit) && rawLimit > 0
    ? Math.min(Math.floor(rawLimit), BROWSE_LIMIT_MAX)
    : BROWSE_LIMIT_DEFAULT;

  const headers = {
    apikey: env.SUPABASE_ANON_KEY,
    authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
    accept: "application/json",
  };

  let queryUrl = `${restBase(env)}/nutrition?select=${SELECT_COLS}&order=name_tr.asc&limit=${limit}`;
  if (q) {
    queryUrl += `&name_tr=ilike.*${encodeURIComponent(q)}*`;
  }

  try {
    const res = await fetch(queryUrl, { headers });
    if (!res.ok) return json({ error: `supabase ${res.status}` }, 502);
    const rows = ((await res.json()) as unknown[]) ?? [];
    const coerced = rows.map(coerce).filter((n): n is Nutrition => n !== null);
    return json(coerced, 200);
  } catch (err) {
    return json({ error: String(err) }, 502);
  }
};

// -------- WRITE --------------------------------------------------------------

export const onRequestPut: PagesFunction<Env> = async ({ request, env }) => {
  if (
    !env.SUPABASE_URL ||
    !env.SUPABASE_ANON_KEY ||
    !env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return json({ error: "supabase not configured" }, 500);
  }

  let body: { row?: unknown; rows?: unknown };
  try {
    body = (await request.json()) as { row?: unknown; rows?: unknown };
  } catch {
    return json({ error: "invalid json" }, 400);
  }

  const bulkMode = Array.isArray(body.rows);
  const inputs: unknown[] = bulkMode
    ? (body.rows as unknown[])
    : [body.row];

  if (inputs.length === 0) {
    return json({ error: "no rows" }, 400);
  }
  if (inputs.length > MAX_NAMES) {
    return json({ error: `too many rows (max ${MAX_NAMES})` }, 400);
  }

  const validated: WriteRow[] = [];
  const errors: { index: number; error: string }[] = [];
  for (let i = 0; i < inputs.length; i++) {
    const r = validateWrite(inputs[i]);
    if ("error" in r) errors.push({ index: i, error: r.error });
    else validated.push(r);
  }
  if (errors.length > 0) {
    return json({ error: "validation failed", details: errors }, 400);
  }

  const res = await fetch(`${restBase(env)}/nutrition?select=${SELECT_COLS}`, {
    method: "POST",
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      "content-type": "application/json",
      prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify(validated),
  });

  if (!res.ok) {
    const text = await res.text();
    return json({ error: `supabase ${res.status}: ${text}` }, 502);
  }

  const returned = (await res.json()) as unknown;
  const saved: Nutrition[] = Array.isArray(returned)
    ? returned.map(coerce).filter((n): n is Nutrition => n !== null)
    : [];

  if (bulkMode) return json({ saved }, 200);
  if (saved.length === 0) return json({ error: "supabase returned no row" }, 502);
  return json(saved[0], 200);
};

// -------- helpers ------------------------------------------------------------

type WriteRow = {
  name_tr: string;
  aliases: string[];
  kcal_per_100: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  fiber_g: number;
};

function validateWrite(input: unknown): WriteRow | { error: string } {
  if (!input || typeof input !== "object") return { error: "row required" };
  const r = input as Record<string, unknown>;

  const name_tr = typeof r.name_tr === "string" ? normalize(r.name_tr) : "";
  if (!name_tr) return { error: "name_tr required" };

  const num = (key: string) => {
    const v = r[key];
    if (typeof v !== "number" || !Number.isFinite(v) || v < 0) {
      return null;
    }
    return v;
  };
  const kcal = num("kcal_per_100");
  const protein = num("protein_g");
  const fat = num("fat_g");
  const carbs = num("carbs_g");
  const fiber = num("fiber_g");
  if (kcal === null || protein === null || fat === null || carbs === null || fiber === null) {
    return { error: "kcal_per_100, protein_g, fat_g, carbs_g, fiber_g must be non-negative numbers" };
  }

  const aliases: string[] = Array.isArray(r.aliases)
    ? r.aliases
        .filter((a): a is string => typeof a === "string")
        .map(normalize)
        .filter((a) => a.length > 0 && a !== name_tr)
    : [];

  return {
    name_tr,
    aliases,
    kcal_per_100: kcal,
    protein_g: protein,
    fat_g: fat,
    carbs_g: carbs,
    fiber_g: fiber,
  };
}

function coerce(row: unknown): Nutrition | null {
  if (!row || typeof row !== "object") return null;
  const r = row as Record<string, unknown>;
  if (
    typeof r.name_tr !== "string" ||
    typeof r.kcal_per_100 !== "number" ||
    typeof r.protein_g !== "number" ||
    typeof r.fat_g !== "number" ||
    typeof r.carbs_g !== "number" ||
    typeof r.fiber_g !== "number"
  ) {
    return null;
  }
  const aliases: string[] = Array.isArray(r.aliases)
    ? r.aliases.filter((a): a is string => typeof a === "string")
    : [];
  return {
    name_tr: r.name_tr,
    aliases,
    kcal_per_100: r.kcal_per_100,
    protein_g: r.protein_g,
    fat_g: r.fat_g,
    carbs_g: r.carbs_g,
    fiber_g: r.fiber_g,
  };
}

// Wrap a value for use inside a PostgREST in.() list or ov.{} array literal:
// escape backslash and double-quote, wrap in double quotes, then URL-encode the
// contents so spaces and other reserved chars don't break the query string.
// The surrounding quotes stay literal so PostgREST still sees a quoted literal.
function encodePgrstLiteral(v: string): string {
  const escaped = v.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `"${encodeURIComponent(escaped)}"`;
}

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}
