# Rogue Market Agent

Public **skills / MCP / AI agents** marketplace by [Rogue Development](https://github.com/rogue-dev-studio).

## Repo

- **Name:** `rogue-market-agent`
- **Pages (after deploy):** `https://rogue-dev-studio.github.io/rogue-market-agent/`

## Catalog source

Skill / MCP listings stay **empty until** a public repo under `rogue-dev-studio` uses these topics:

| Topic | Appears in |
|-------|------------|
| `rogue-market-skills` | Skills |
| `rogue-market-mcp` | MCP Servers |

Add the matching topic on a public `rogue-dev-studio` repo; the site picks it up via the GitHub topics API.

## Commerce (Gumroad)

Paid digital downloads use Gumroad; Market stays discovery. See [`commerce/`](commerce/).

Pilot: [Night Drive — Car Near Mountains](https://roguedevstudio.gumroad.com/l/hppwla)

## Structure

```text
site/
  index.html
  assets/
  servers/   ← All / Search / Categories / Tags / Top
  skills/    ← All / Search / Categories / Tags / Top
```

## Local preview

Serve over HTTP (not `file://`) so Share and the GitHub API work:

```bash
npx --yes serve site
```

## Deploy GitHub Pages

1. Create the `rogue-market-agent` repo under `rogue-dev-studio`.
2. Push this project.
3. Settings → Pages → Source: **GitHub Actions** (workflow in `.github/workflows/deploy-pages.yml`).

## Contact

- Email: [aris.hadisopiyan@gmail.com](mailto:aris.hadisopiyan@gmail.com)
- Studio: [https://rogue-dev-studio.github.io/](https://rogue-dev-studio.github.io/)

## Attribution

Author: [Rogue Development](https://github.com/rogue-dev-studio) (`@rogue-dev-studio`).
