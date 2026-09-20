# Illustrator MCP Server

Drive Adobe Illustrator from AI assistants via the Model Context Protocol (MCP).

## What it does

- Read artboard and object data from open Illustrator documents
- Edit text, paths, and structure through stable object tracking
- Export SVG, PNG, JPG, and PDF with consistent settings
- Run pre-press checks (fonts, resolution, overprint)

## Requirements

- Adobe Illustrator desktop (macOS or Windows), ideally running
- Node.js 18+ for `npx`
- An MCP-capable host (Cursor, Claude Code, or similar)

## Quick start

Add this to your Cursor MCP config:

```json
{
  "mcpServers": {
    "illustrator": {
      "command": "npx",
      "args": ["-y", "illustrator-mcp-server"]
    }
  }
}
```

Restart the host, open Illustrator, then ask the agent to inspect or export the active document.

## License

Published by [Rogue Development](https://github.com/rogue-dev-studio).
