<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Job Tracker

A Next.js (App Router) job-application tracker backed by MongoDB Atlas. TypeScript throughout; no test framework.

## Commands

- `npm run dev` — dev server
- `npm run build` — production build
- `npm run lint` — ESLint (eslint-config-next)

## Structure

- `app/` — App Router pages and API routes (`app/api/applications/route.ts` for list/create, `app/api/applications/[id]/route.ts` for update/delete)
- `components/Tracker.tsx` — the single client-side UI component
- `lib/db.ts` — MongoDB connection (singleton via `global._mongoClientPromise` in dev for HMR); collection `applications`
- `lib/types.ts` — `App`/`Draft` types and the `STATUSES`/`SOURCES` const arrays; update these when adding fields
- `lib/applications.ts` — document <-> domain mapping (`_id` ↔ `id`)

## Conventions & gotchas

- Config lives in `.env.local`: `MONGODB_URI` (Atlas SRV string, required) and optional `MONGODB_DB` (defaults to `job-tracker`). See `.env.example`.
- `lib/db.ts` pins DNS servers to 8.8.8.8/1.1.1.1 to work around SRV lookup failures on Windows/ISP DNS — don't remove.
- `app/layout.tsx` sets `suppressHydrationWarning` on `<html>` to tolerate browser-extension DOM injection; keep it.
- The `<!-- BEGIN:nextjs-agent-rules -->` block above is auto-managed by `next dev`; leave it in place and commit it with related changes.
