# FOODRESCUE

An interactive food-rescue demonstration built with Next.js, React, TypeScript and Tailwind CSS. Includes scroll-driven storytelling, food filters, swipeable carousels, donation and participation forms, pickup tracking and a personal impact dashboard.

## Deploy on Vercel

1. Open https://vercel.com/new and import `nandumak/tantraa`.
2. Use branch `main`, Framework Preset **Next.js**, and Root Directory **./**.
3. Leave Output Directory at its default. The included `vercel.json` sets the install and build commands.
4. Click **Deploy**. No environment variables, database credentials or authentication setup are required for this demo.

For an existing Vercel project, remove any old Vite/Cloudflare settings or output-directory override, select Next.js and redeploy the latest commit.

| Setting | Value |
| --- | --- |
| Framework | Next.js |
| Node.js | 22.x |
| Install command | `npx --yes pnpm@11.25.0 install --frozen-lockfile` |
| Build command | `npm run build` |
| Output directory | Default (`.next`) |
| Environment variables | None |

## Run locally

Install Node.js 22.18 or newer within the 22.x release line and pnpm 11.25.0, then run:

```sh
pnpm install --frozen-lockfile
pnpm run dev
```

Open http://localhost:3000. To test a production build:

```sh
pnpm run build
pnpm start
```

## How demo activity is saved

Donations, participation forms and pickup progress are saved in `localStorage` on the visitor's browser. Reloading the page retains them. Each browser has its own demo records; records are not public listings and are not synchronized across devices. Clearing this site's browser data removes the records. Storage failures are shown to the visitor rather than reporting an unsuccessful write as saved.

This Vercel version has no login requirement and does not use Cloudflare D1 or platform-managed ChatGPT sign-in. Existing account records on the original hosted site are not migrated. The original hosted site remains separate.

All food listings, deliveries, community profiles and impact estimates are demonstrations. No real pickup, message or emergency notification is dispatched. A real multi-user service would require a shared database and authentication.

## Project files

- `app/page.tsx`: website sections, forms and interactions
- `app/globals.css`: styles, animations and responsive layouts
- `lib/food.ts`: example food listings and types
- `lib/demo-store.ts`: validated browser persistence and pickup transitions
- `public/`: original food and character artwork
- `tests/demo-store.test.mjs`: workflow, validation and storage tests
- `vercel.json`: Vercel build configuration

## Checks

```sh
pnpm test
pnpm run typecheck
pnpm run build
```

Vercel documentation: https://vercel.com/docs/frameworks/full-stack/nextjs

The install command pins pnpm explicitly so an existing Vercel project cannot select an older package manager.
