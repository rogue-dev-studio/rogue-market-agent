# Commerce

Digital products on the Market are **multi-storefront**. Checkout can live on Gumroad, Sketchfab, Shutterstock, Adobe Stock, Unity Asset Store, Fab, and other markets where Rogue assets are listed. This repo stays discovery; each `stores[].url` opens the external listing.

## Docs

- [marketplaces.md](marketplaces.md) — store ids + catalog shape
- [gumroad.md](gumroad.md) — Gumroad-specific rollout (still supported)
- [templates/COMMERCE.json](templates/COMMERCE.json) — package metadata template

## Pilot

[Night Drive](https://roguedevstudio.gumroad.com/l/hppwla) — currently Gumroad; add Sketchfab / Shutterstock / TurboSquid / … URLs to `stores[]` in `site/assets/catalog-products.js` when those listings go live.

Per-store feeds (when you have asset URLs): populate `rogue-dev-studio.github.io/{stock|turbosquid|cgtrader|itch}/catalog.json` — Market merges them via `catalog-products-stores.js`.

Market UI: `site/products/` — same catalog patterns as skills/MCP, with price labels and per-store Get buttons on the detail page.
