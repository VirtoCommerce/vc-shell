# @vc-shell/ai-codegen (`vcgen`)

CLI + MCP server for VC Shell code generation with a full workflow (analyze → plan → validate → generate). Available as a standalone MCP via `vcgen mcp` and as an auto-configurator via `vcgen init-mcp`.

## Requirements

- Node.js 18+ (ESM, stdio MCP).
- Access to your VC Shell project if you want the tool to write directly into it.

## Install

- Quick run without install: `npx @vc-shell/ai-codegen@alpha mcp` (current published tag: `alpha`)
- Local (dev): `yarn add -D @vc-shell/ai-codegen@alpha`
- Global:
  - Yarn 1: `yarn global add @vc-shell/ai-codegen@alpha` (installs the `vcgen` command)
  - Yarn 4: `yarn dlx @vc-shell/ai-codegen@alpha` (installs the `vcgen` command)

## Quick start: MCP server

Run the MCP server over stdio:

```bash
vcgen mcp
# or
npx @vc-shell/ai-codegen@latest mcp
```

Helpful scripts (when working inside the repo):

- `yarn mcp:inspect` — open the server in MCP Inspector.
- `yarn mcp:watch` — tail MCP logs.
- `yarn mcp:clean` — kill stale MCP processes.

## Auto-setup for MCP clients

Generate configs for Cursor / VS Code / Claude Code / Codex:

```bash
vcgen init-mcp --client cursor --cwd /path/to/project
```

Options: `--client cursor|vscode|claude|codex` (default cursor), `--cwd` — where to create the config and optionally install the package.

What gets created:

- Cursor: `.cursor/mcp.json`
- VS Code: `.vscode/mcp.json`
- Claude Code: `.mcp.json`
- Codex: snippet for `~/.codex/config.toml` (edit manually)

Config examples:

```json
// .cursor/mcp.json or .mcp.json
{
  "mcpServers": {
    "vcshell": {
      "command": "npx",
      "args": ["@vc-shell/ai-codegen@latest", "mcp"]
    }
  }
}
```

```toml
# ~/.codex/config.toml
[mcp_servers.vcshell]
command = "npx"
args = ["@vc-shell/ai-codegen@latest", "mcp"]
```

After generation restart your IDE/client and enable the `vcshell` server.

## What the MCP server does

- 5-layer architecture: Knowledge → Intelligence → Generators → Workflows → MCP tools.
- Full pipeline: prompt analysis → components/features discovery → UI plan → validation → Vue/TS generation → code checks → submit.
- 26 MCP tools: Workflow, Components, Framework, Knowledge, Utilities (see `src/mcp/handlers`).

## Sample prompts

- “Create a vendor management module: list and details”
- “Show available table UI components”
- “Generate a workspace blade with filters and multiselect”

## Developing in the repo

- `yarn build` — build (`tsup` + asset copy).
- `yarn dev` — watch build.
- `yarn typecheck` — `tsc --noEmit`.
- `yarn test` / `yarn test:watch` — `vitest`.

## Updating

- `yarn up @vc-shell/ai-codegen@alpha` or run `npx @vc-shell/ai-codegen@alpha ...` to stay on the current alpha line. Remove `@alpha` when the package ships a stable tag.

## Useful paths

- CLI entry: `src/index.ts` (`vcgen`).
- MCP server: `src/mcp/server.ts`.
- Client auto-setup: `src/commands/mcp-init.ts`.
