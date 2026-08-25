# Household ownership + email sharing — design

## Status

Approved by user (2026-08-25), pending implementation plan.

## Context

Two auth work streams just shipped (NUT-24/25/26): Google OAuth + JWT httpOnly
cookie login, plus a per-viewer "hide households I don't want to see"
preference (`hidden_households`). That preference is opt-out over a fully
shared pool — every logged-in user can see and use every household.

The user wants real privacy instead: each household has an **owner** (whoever
created it), and only the owner + people the owner has explicitly invited
by email can see or use it. The existing hide-from-my-view feature becomes a
secondary, optional layer that only applies within whatever set a user can
already see.

This replaces "public by default, hide what you don't want" with "private by
default, owner grants access."

## Data model

**`households` gains an owner:**

```sql
alter table public.households
  add column if not exists owner_id text references public.app_users(id) on delete set null;
```

Nullable at the column level (existing rows have none yet), but every
household created going forward always gets one — the creator, set
server-side in `households.ts`'s POST handler. Existing rows are backfilled
in the same migration that adds the column (see Migration below) — the
column and its backfill ship together, never enforcement-before-backfill.

**New table — the invite list:**

```sql
create table if not exists public.household_shares (
  household_id text not null references public.households(id) on delete cascade,
  email        text not null,
  created_at   timestamptz not null default now(),
  primary key (household_id, email)
);
create index if not exists household_shares_email_idx on public.household_shares (email);
```

Keyed by **email**, not user id — an owner can invite someone who has never
logged in yet ("yarın biri girince ona da açayım"). Access is resolved by
matching the requester's verified email (from their session JWT) against
this table; no dependency on the invitee having an `app_users` row yet.

Existing `hidden_households` is untouched — still a per-viewer preference,
now operating over the smaller (owner + invited) set instead of everyone.

## Access model

**Two levels**, not one:

- **Access** ("can you use this household at all — read/write its lists,
  meal entries, etc.") = owner OR invited-by-email. Matches the current
  household's "shared grocery list for 2-4 people" spirit — an invited
  person is a full collaborator, not a read-only viewer.
- **Ownership** ("can you delete this household or change who's invited") =
  owner only. Renaming stays available to anyone with access (matches
  today's UI, no regression) — only delete and invite-management are
  owner-exclusive.

**No public/everyone mode.** Every non-owner viewer must be explicitly
invited. This is simpler than a public/private/hide three-way split and is
exactly what was asked for.

**Unauthorized requests get 404, not 403** — a household you can't access
doesn't reveal that it exists.

## Backend enforcement

New shared helper in `netlify/functions/_auth.ts` (next to `requireUser`,
same `throw AuthError` contract Stream B already established):

```ts
export async function requireHouseholdAccess(
  householdId: string,
  user: AuthUser,
  opts: { ownerOnly?: boolean } = {}
): Promise<void> {
  // Fetch households.owner_id for householdId (service_role key, PostgREST).
  // - Row missing -> 404.
  // - owner_id === user.userId -> pass.
  // - opts.ownerOnly -> 404 (only the owner clears an owner-only check).
  // - else: check household_shares for (householdId, user.email) -> pass or 404.
}
```

One extra Supabase read per gated request (the household's `owner_id`, plus
a `household_shares` lookup when the requester isn't the owner) — acceptable
for a household of 2-4 polling every 15s.

**Where it's called** (household id already available directly, or one
lookup away):

| File | Check | Notes |
|---|---|---|
| `households.ts` GET `?id=` | `requireHouseholdAccess` | |
| `households.ts` GET (list, no id) | *(different — see below)* | filters, doesn't gate |
| `households.ts` PATCH (rename) | `requireHouseholdAccess` | any member, not owner-only |
| `households.ts` DELETE | `requireHouseholdAccess(..., { ownerOnly: true })` | |
| `households.ts` POST (create) | none — creator becomes owner | sets `owner_id = user.userId` |
| `state.ts` GET/PUT `?tenant=` | `requireHouseholdAccess` | tenant param **is** the household id |
| `item-category-memory.ts` GET/PUT | `requireHouseholdAccess` | `household_id` already a param |
| `meal-entries.ts` GET/POST | `requireHouseholdAccess` | `household_id`/`householdId` already a param |
| `meal-entries.ts` PATCH/DELETE | `requireHouseholdAccess` | one extra lookup: fetch the meal entry's `household_id` by its `id` first |
| `hidden-households.ts` | none | already user-scoped; a household you can't see, you never get its id to hide |
| `lists.ts`, `items.ts` | none (for now) | confirmed dead code per `docs/architecture.md` — the running app reads/writes list state entirely through `state.ts`'s bulk get/put, not these per-row endpoints. Not worth hardening unused code; revisit if/when something starts calling them. |

**Household listing** (`households.ts` GET with no `id`) filters instead of
gating — two PostgREST calls: fetch `household_shares` rows for the
requester's email to get invited household ids, then fetch `households`
with `or=(owner_id.eq.<userId>,id.in.(<invited ids>))` (own the `id.in.()`
clause only if the invited list is non-empty).

**New function** `netlify/functions/household-shares.ts` — owner-only
GET/POST/DELETE against `household_shares`, same shape as
`hidden-households.ts`: `GET ?household_id=` (list invited emails, 404 if
not owner), `POST { household_id, email }` (invite), `DELETE
?household_id=&email=` (revoke).

## Frontend

- `auth-session.ts` and `useAuth.ts`'s `Session` type gain `userId` (today
  only `email` is exposed) — the UI needs to compare `household.owner_id`
  against the current user to decide whether to show owner-only controls.
- `Household`/`Tenant` types gain `ownerId: string | null`.
- `TenantSwitcher.tsx`: a new share-management control, shown only when
  `t.ownerId === currentUserId` — an icon (e.g. `UserPlus`) opening an
  inline chip-list of invited emails (same inline-edit visual pattern
  already used for rename: chips with an ✕ to remove, a text input +
  Enter to add). New `src/lib/householdShares.ts` client wrapper
  (list/invite/revoke), mirroring `hiddenHouseholds.ts`.
- Non-owner members see no share controls — they can use and rename the
  household, not manage who else is in it.

## Migration sequencing (important — avoids locking everyone out)

`owner_id IS NULL` means "nobody passes `requireHouseholdAccess`" (NULL
never equals a user id) — so the schema change and the backfill **must ship
in the same script**, and the enforcement code must not go live until that
script has run. Order:

1. Ozan logs in via Google once (so `app_users` has his row and we have his
   real id to backfill with — right now only the user's row exists).
2. One migration file adds the column + table + backfills all three
   existing households (Evim/Ayrancı → Ozan, Akbük → the user) in one
   script.
3. User runs it in the Supabase SQL editor.
4. Only then does the enforcement code (backend checks + frontend share UI)
   ship/deploy.

## Testing

- `npm run build` + `npx tsc --noEmit -p netlify/functions/tsconfig.json`
  after each step, same as the auth work.
- Manual: as the owner, confirm you can rename/delete/invite/revoke; as an
  invited (non-owner) user, confirm you can use the household but see no
  delete/share controls; as a third, uninvited logged-in user, confirm the
  household never appears in your list and `curl`ing its `state`/`households`
  endpoints directly (with a valid session cookie, wrong household) returns
  `404`, not `403` or `200`.
- Confirm the existing `hidden_households` hide/show toggle still works
  within whatever set a user can see.
