# FOODRESCUE

An interactive food-rescue website built with React, TypeScript, Vinext and Cloudflare D1.

## Features

- Scroll-driven six-stage food journey and animated food/character artwork
- Swipeable food and source carousels, dietary filters and interactive route map
- Donation, volunteer, organization and recipient forms
- Account-scoped saved demo activity and pickup-to-delivery tracking
- Personal impact dashboard, community stories and urgent-request examples
- Responsive layouts, keyboard-accessible dialogs and reduced-motion support

All listings, pickups and impact figures are demonstrations. No real deliveries, partner messages or emergency notifications are dispatched. Account data is stored in Cloudflare D1; the deployed version uses platform-managed ChatGPT authentication.

## Requirements

- Node.js 22.13 or newer
- pnpm (this repository includes a pnpm lockfile)

## Install and run

```sh
pnpm install --frozen-lockfile
pnpm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_parched_white_queen.sql
pnpm run dev
```

Open the local URL printed by the development server (normally http://localhost:5173). Apply the initial migration once for a fresh local database. Portable local development includes a loopback-only mock sign-in through `/signin-with-chatgpt?return_to=/`; it is not included in production builds.

## Commands

```sh
pnpm exec tsc --noEmit
pnpm run build
pnpm run db:generate
```

## Structure

- `app/page.tsx` — website sections, interactions and forms
- `app/globals.css` — responsive styling and animation
- `app/api/rescue/route.ts` — validated, account-scoped demo API
- `lib/food.ts` — sample listings and shared types
- `db/` and `drizzle/` — schema and database migration
- `public/` — optimized artwork and favicon

## Hosting

The application requires a Cloudflare-compatible Worker, a D1 binding named `DB`, and a trusted authentication layer. GitHub Pages cannot run its backend. The logical binding is declared in `.openai/hosting.json`; deployment-specific project identity and credentials are intentionally omitted. To host outside Sites, configure your own Cloudflare resources and replace the platform authentication integration before exposing write endpoints publicly. Never trust identity headers directly from untrusted clients.

## Validation

TypeScript and production build checks passed for this version. Browser interaction testing was not available during initial authoring.
