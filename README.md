# ActionDev Master Learning Guide

This repository publishes the standalone ActionDev learning guide. The previous React/Supabase course application remains in the repository as legacy source, but it is no longer built or deployed.

Read the guide at [nckzvth.github.io/ActionDev](https://nckzvth.github.io/ActionDev/).

## Source and generated pages

- `docs/ActionDev-Master-Learning-Guide.md` is the editable source.
- `docs/ActionDev-Master-Learning-Guide.html` is the named standalone copy.
- `docs/index.html` is the copy served at the GitHub Pages root.

Regenerate both HTML files after editing the Markdown:

```bash
pnpm install
pnpm guide:build
```

Preview the site locally:

```bash
pnpm dev
```

GitHub Pages deploys the committed `docs/` directory whenever `main` changes. The guide does not require Supabase, authentication, or environment variables.
