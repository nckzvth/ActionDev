# ActionDev

ActionDev is a self-guided learning application for building a focused custom C++ eight-player online co-op ARPG runtime. Required instruction stays inside the application; learners implement the real game in their own repositories.

## Local development

Prerequisites: Node.js 24+, pnpm 10, and Docker only when running Supabase locally.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

The configured application opens at `http://localhost:5173/ActionDev/`. Hash routing keeps all routes compatible with GitHub Pages.

## Verification

```bash
pnpm check
```

This regenerates the 89-lesson manifest and Supabase seed, type-checks, lints, tests, and produces the GitHub Pages build.

## Content source

`ActionDev-Implementation-Plan.md` is the approved curriculum contract. `scripts/build-course.mjs` validates that all 89 lesson IDs remain present and generates `src/generated/course-data.ts`. `scripts/build-supabase-seed.mjs` creates stable public course rows and private assessment keys.

## Supabase

The frontend needs only browser-safe values:

```env
VITE_SUPABASE_URL=https://PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
VITE_APP_BASE_URL=/ActionDev/
```

Never put a secret/service-role key, database password, JWT secret, or management access token in a `VITE_*` value.

To apply the schema after authenticating the CLI locally:

```bash
pnpm supabase login
pnpm supabase link --project-ref oypsgknulyezteyzedrg
pnpm supabase db push
pnpm supabase functions deploy delete-account
```

Supabase Auth URL configuration:

- Site URL: `https://nckzvth.github.io/ActionDev/`
- Redirect URLs: `https://nckzvth.github.io/ActionDev/`, `http://localhost:5173/ActionDev/`

## GitHub Pages

Set repository variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. The deployment workflow validates the application, uploads `dist`, and deploys from `main` to `https://nckzvth.github.io/ActionDev/`.

The source PDFs are intentionally ignored and are not part of the web repository.

