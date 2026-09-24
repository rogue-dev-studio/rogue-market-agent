# Rogue Asset Store

Public **skills / MCP / assets** store by [Rogue Development](https://github.com/rogue-dev-studio).

Skills, MCP servers, and assets all show a **price pill** (`$0+` when free / unset, otherwise the listed amount) and support **min/max price** filters on All & Search.

Optional GitHub topic for paid skills/MCP: `price-12` (sets price to 12). Omit or use `price-0` for `$0+`.

## Repo

- **Name:** `rogue-asset-store`
- **Pages (after deploy):** `https://rogue-dev-studio.github.io/rogue-asset-store/`

## Catalog source

Skill / MCP listings stay **empty until** a public repo under `rogue-dev-studio` uses these topics:

| Topic | Appears in |
|-------|------------|
| `rogue-asset-skills` | Skills |
| `rogue-asset-mcp` | MCP Servers |

Legacy topics `rogue-assets-skills` / `rogue-assets-mcp` and `rogue-market-skills` / `rogue-market-mcp` are still accepted during transition.

Add the matching topic on a public `rogue-dev-studio` repo; the site picks it up via the GitHub topics API.

**Assets** (digital downloads) are static entries in `site/asset-store/catalog-assets.js` (same browse UX as skills/MCP, plus price pills and min/max price filters). Checkout can be on **Gumroad, Sketchfab, Shutterstock**, and other listed storefronts — see [`commerce/marketplaces.md`](commerce/marketplaces.md).

**Asset Store** catalogs three kinds: MCP servers, agent skills, and assets.

## Commerce (multi-store)

Paid / listed digital downloads use external storefronts; Rogue Asset Store stays discovery. See [`commerce/`](commerce/).

Pilot: [Night Drive — Car Near Mountains](https://roguedevstudio.gumroad.com/l/hppwla) (`$0+` PWYW on the store; add more `stores[]` URLs when live)

## Structure

```text
site/
  index.html
  assets/
  servers/   ← All / Search / Categories / Tags / Top
  skills/    ← All / Search / Categories / Tags / Top
  assets/  ← All / Search / Categories / Tags / Top / Detail
```

## Local preview

Serve over HTTP (not `file://`) so Share and the GitHub API work:

```bash
npx --yes serve site
```

## Deploy GitHub Pages

1. Create the `rogue-asset-store` repo under `rogue-dev-studio`.
2. Push this project.
3. Settings → Pages → Source: **GitHub Actions** (workflow in `.github/workflows/deploy-pages.yml`).

## Contact

- Studio: [https://rogue-dev-studio.github.io/#contact](https://rogue-dev-studio.github.io/#contact)
- GitHub: [https://github.com/rogue-dev-studio](https://github.com/rogue-dev-studio)

## Attribution

Author: [Rogue Development](https://github.com/rogue-dev-studio) (`@rogue-dev-studio`).
