# Paid assets on Rogue Asset Store (Gumroad)

> Gumroad is one storefront among several. See [marketplaces.md](marketplaces.md) for Sketchfab, Shutterstock, and others.

Status: **foundation live in repo**  
Checkout: **Gumroad** ([roguedevstudio.gumroad.com](https://roguedevstudio.gumroad.com)) (and/or other stores via `stores[]`)  
Storefront discovery: [Rogue Asset Store](https://rogue-dev-studio.github.io/rogue-asset-store/)

## Goal

Sell selected digital packages (skills / MCP / media kits) as **paid** while keeping free/open listings. Gumroad handles payment + delivery; Rogue Asset Store stays the catalog/discovery layer.

## Architecture (MVP — no API gateway)

```text
Buyer → Store detail page → "Buy on Gumroad" → Gumroad checkout
                              → Gumroad delivers file / license mail
Optional later:
Gumroad webhook → tiny Vercel/GitHub Action → mark license / email receipt
```

- **No API Gateway** for v1.
- Free packages: GitHub clone / topic install (current flow).
- Paid packages: public README + teaser; full payload behind Gumroad product.

## Package convention

Add `COMMERCE.json` at package root (committed, no secrets). Template: [`templates/COMMERCE.json`](templates/COMMERCE.json).

| Field | Meaning |
|-------|---------|
| `status` | `free` \| `paid` \| `coming_soon` |
| `gumroad.productUrl` | Public buy link (safe to commit) |
| `price` | Display only; Gumroad is source of truth |

Do **not** commit Gumroad access token / webhook secret.

## First SKU (pilot)

| SKU | Title | Gumroad | Notes |
|-----|-------|---------|-------|
| `night-drive-car-mountains` | Night Drive — Car Near Mountains | https://roguedevstudio.gumroad.com/l/hppwla | Motion pack MP4 + Remotion; launch PWYW $0+ |

## Store UI (next)

1. Read `COMMERCE.json` from GitHub raw on detail pages.
2. `paid` / priced → CTA **Buy on Gumroad**.
3. `free` → current Install / GitHub CTAs.
4. Optional catalog badge: Paid / Free.

## Security / legal

- Gumroad ToS + license text on the product.
- No secrets in store packages or GH Pages.
- Keep Rogue Development attribution on open teasers.

## Rollout checklist

- [x] Choose Gumroad (no API gateway)
- [x] Pilot product Night Drive (`hppwla`)
- [x] Commerce convention + template in this repo
- [ ] Store detail CTA for Gumroad links
- [ ] Catalog Paid/Free badge
- [ ] (Optional) webhook automation

## Decision log

- **2026-09-21** — Use existing Gumroad; Store = discovery; no API gateway for paid MVP.
- **2026-09-22** — Pilot SKU Night Drive live on Gumroad; commerce docs committed under `commerce/`.
