# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Read the bundled Next.js docs first

`AGENTS.md` warns that this Next.js (16.x) differs from older versions. Before writing Next.js code, read the relevant guide under `node_modules/next/dist/docs/` (`01-app/` for the App Router; start with `index.md`). Do not rely on memorized APIs.

## Commands

```bash
npm run dev     # next dev (http://localhost:3000)
npm run build   # next build
npm run start   # serve the production build
npm run lint    # eslint (flat config, no path args needed)
npx tsc --noEmit  # type check; no script exists for it

docker compose up -d --wait   # MySQL 8.4 on localhost:3307, phpMyAdmin on http://localhost:8080
docker compose down           # stop (data kept in the db_data volume; add -v to wipe it)
```

Credentials and `DATABASE_URL` are in `.env`, which is gitignored. Copy `.env.example` to create it. The host port is 3307 because a native MySQL 8.0 on this machine already uses 3306.

```bash
npx prisma generate          # regenerate the client after schema changes (also runs on npm install)
npx prisma migrate dev       # create and apply a migration from prisma/schema.prisma
npx prisma db seed           # upsert prisma/data/attractions.json via prisma/seed.ts (safe to re-run)
npx prisma studio            # browse data
```

## Database (Prisma 7)

- Prisma 7 uses driver adapters and has no Rust query engine. The CLI reads `prisma7.config.ts`, which this version looks for before `prisma.config.ts`. That file loads `DATABASE_URL` through `dotenv`. `schema.prisma` has no `url`.
- The client is generated into `app/generated/prisma` (gitignored). Import it from `@/app/generated/prisma/client`, not `@prisma/client`.
- In app code, use the shared instance from `lib/prisma.ts`. It wraps `DATABASE_URL` in `@prisma/adapter-mariadb`, reuses one client across dev hot reloads, and imports `server-only` so it can't end up in client bundles.
- `prisma migrate dev` needs a shadow database. The `app` user may only create `prisma_migrate_shadow_db_*` databases. That grant is in `docker/mysql/init/01-prisma-shadow-db.sh`, which runs only when the data volume is first created.
- Attraction CRUD lives in `lib/attractions.ts` (queries plus `parseAttractionInput`, the only validation of request bodies). The route handlers in `app/api/attractions/` are thin wrappers over it. Server components can call the `lib/attractions.ts` functions directly; client components use the REST API. The API has no authentication.
- Prisma packages are pinned to `7.10.1`.

## Front-end

The UI reads and writes only through the REST API, using the browser client in `lib/attractions-api.ts`. Pages under `app/` are thin server shells; the logic is in client components in `app/ui/`.

- Data loading goes through `useLoaded` (`app/ui/use-loaded.ts`). Because `cacheComponents` hides visited pages instead of unmounting them and re-runs effects when they are shown again, `useLoaded` refetches on every return to a page. That is how the list picks up creates, edits and deletes without any cache invalidation.
- For the same reason, component state survives navigation. Clear anything that must not persist: the create form resets itself after a successful submit, pending flags are cleared in `finally`, and the edit form is keyed on the loaded data. Use `useId` for element ids, since a hidden page's DOM is still in the document.
- Components that call `useParams` (through `useRouteAttraction`) must be rendered inside `<Suspense>`, or the build fails.
- Cover images use a plain `<img>` (`app/ui/cover-image.tsx`) because the URLs are user-supplied and `next/image` only serves allow-listed hosts. The npm `latest` tag for `prisma` points to an 8.0 release candidate, so don't run `npm i prisma@latest`. The CLI and client versions must match.

No test runner is configured yet. The project is still the unmodified `create-next-app` starter (`app/page.tsx` is the default landing page).

## Architecture

App Router project (`app/` at the repo root, no `src/`). The `@/*` import alias maps to the repo root. Stack: React 19, TypeScript (strict), Tailwind CSS 4, Geist fonts via `next/font/google`.

Non-default settings in `next.config.ts` that affect how code must be written:

- **`cacheComponents: true`** together with **`partialPrefetching: true`**. Data fetching is dynamic by default and caching is opt-in with the `use cache` directive (`cacheLife`, `cacheTag`). Routes prerender a static shell and stream dynamic content. Consequences:
  - The `runtime` route segment config is not supported. Remove any `export const runtime`.
  - Older route segment configs and `experimental.ppr` / `dynamicIO` / `useCache` flags are replaced. See `01-app/03-api-reference/05-config/01-next-config-js/cacheComponents.md` and `01-app/02-guides/migrating-to-cache-components.md`.
  - Client-side navigation preserves component state through React `<Activity>`. Routes are hidden rather than unmounted, and their effects are cleaned up and recreated.
- **`experimental.agentFeedback: true`**. This is enabled by the starter and relates to `next dev` agent support. See `01-app/02-guides/ai-agents.md`.
- **Tailwind via Turbopack rule**. CSS goes through `@tailwindcss/turbopack` as a loader for `*.css`, not PostCSS. Styles are in `app/globals.css` (`@import "tailwindcss"` plus a `@theme inline` block that maps CSS variables to Tailwind tokens). Dark mode uses `prefers-color-scheme`.

`app/layout.tsx` types its props with the global `LayoutProps<"/">` helper, not a hand-written props type. Next generates these route-typed helpers (via `next dev` / `next build` into `.next/types`), so `tsc` needs those files present.

`AGENTS.md` is regenerated by `next dev` (`node_modules/next/dist/server/lib/generate-agent-files.js`). Commit it rather than deleting it.
