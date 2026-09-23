# Marketplaces (digital products)

Rogue Assets Store lists your assets; buyers complete purchase on the external store.

## Supported store ids

| id | Label |
|----|--------|
| `gumroad` | Gumroad |
| `sketchfab` | Sketchfab |
| `shutterstock` | Shutterstock |
| `adobe-stock` | Adobe Stock |
| `turbosquid` | TurboSquid |
| `cgtrader` | CGTrader |
| `itch` | itch.io |
| `unity` | Unity Asset Store |
| `fab` | Fab |
| `other` | Store (generic) |

Unknown hosts still work as `other` when you pass a URL.

## Studio profiles (source of truth)

From [rogue-dev-studio.github.io](https://rogue-dev-studio.github.io/) → **Toko Aset**:

| Store | Profile URL |
|-------|-------------|
| Galeri 3D | https://rogue-dev-studio.github.io/3d/ |
| itch.io | https://rogue-dev-studio.itch.io |
| Sketchfab | https://sketchfab.com/rogue-dev-studio |
| Shutterstock | https://www.shutterstock.com/g/ArisHadisopiyan |
| TurboSquid | https://www.turbosquid.com/Search/Artists/ArisHadisopiyan |
| CGTrader | https://www.cgtrader.com/aris-hadisopiyan |
| Gumroad | https://roguedevstudio.gumroad.com |

## Catalog contents (real listings only)

| Source | What appears in Market |
|--------|-------------------------|
| Gumroad | Individual SKUs in `catalog-products.js` (e.g. Night Drive) |
| Sketchfab | Public models for `@rogue-dev-studio` (snapshot + live `catalog-products-sketchfab.js`) |
| Shutterstock | `stock/catalog.json` items + optional local snapshot (`source: shutterstock`) |
| TurboSquid | `turbosquid/catalog.json` items + optional local snapshot |
| CGTrader | `cgtrader/catalog.json` items + optional local snapshot |
| itch.io | `itch/catalog.json` items + optional local snapshot |

Live feeds are loaded by `site/assets/catalog-products-stores.js` from `https://rogue-dev-studio.github.io/{path}/catalog.json`.

Do **not** add profile pages as product cards. Each `items[]` row needs a **per-asset** `url` and `title` (thumb recommended).

### Feed item shape

```json
{
  "id": "oak-chair-ts",
  "title": "Oak Chair",
  "kind": "3D Model",
  "url": "https://www.turbosquid.com/3d-models/…",
  "thumb": "https://…",
  "description": "Optional",
  "category": "3D",
  "tags": ["Furniture"],
  "price": 0,
  "addedAt": "2026-09-22"
}
```

## Catalog entry (`site/assets/catalog-products.js`)

Prefer `stores[]`. Mark one `primary: true` for Save / default Get.

```js
stores: [
  { id: "gumroad", url: "https://….gumroad.com/l/…", primary: true },
  { id: "sketchfab", url: "https://sketchfab.com/3d-models/…" },
  { id: "shutterstock", url: "https://www.shutterstock.com/…" },
  { id: "turbosquid", url: "https://www.turbosquid.com/3d-models/…" }
]
```

Legacy single fields still map in: `gumroadUrl`, `sketchfabUrl`, `shutterstockUrl`, `adobeStockUrl`, `turbosquidUrl`, `buyUrl`, `url`, etc.

## UI

- Detail hero: one Get icon button per store (`product-stores.js`)
- About: **Available on** with store name links
- Never commit API tokens — public product URLs only
