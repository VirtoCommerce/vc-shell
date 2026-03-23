# @vc-shell/vc-app-skill

An AI coding skill for scaffolding and generating VirtoCommerce Shell applications. Compatible with Claude Code, OpenCode, Gemini CLI, Codex, Cursor, and GitHub Copilot.

## Overview

`vc-app-skill` installs a set of AI-readable skill files (markdown prompts, knowledge base, slash commands) into your AI coding tool's configuration directory. Once installed, your AI assistant gains deep knowledge of the VirtoCommerce Shell framework — enabling it to scaffold apps, generate modules, wire up API clients, and follow framework conventions automatically.

The skill covers:
- Creating host apps and standalone apps from templates
- Scaffolding dynamic modules with proper blade navigation
- Generating typed API clients from OpenAPI specs
- Adding feature modules (list + detail blades, composables, locales)
- Following vc-shell conventions: Vue 3 + TypeScript, Tailwind with `tw-` prefix, `<script setup>`, BEM class names

## Installation

### Claude Code / Cursor / GitHub Copilot

```bash
npx @vc-shell/vc-app-skill install
```

Installs skill files into `~/.claude/skills/vc-app/` (Claude Code) or the equivalent directory for your tool.

### OpenCode

```bash
npx @vc-shell/vc-app-skill install --runtime opencode
```

### Gemini CLI

```bash
npx @vc-shell/vc-app-skill install --runtime gemini
```

### Codex

```bash
npx @vc-shell/vc-app-skill install --runtime codex
```

### Verify installation

After installation, restart your AI tool session. The skill is active when you see `/vc-app` commands available.

## Commands Reference

### `/vc-app create`

Scaffold a new VirtoCommerce Shell application interactively.

```
/vc-app create
```

Prompts for:
- App type: `host-app`, `standalone`, or `dynamic-module`
- App name and npm package name
- Target directory
- Whether to include a sample module

Generates a fully configured project with `package.json`, `tsconfig.json`, Vite config, and entry points.

### `/vc-app connect`

Connect a dynamic module to an existing host application.

```
/vc-app connect --module ./my-module --host ./my-host-app
```

Updates the host app's module registry to include the dynamic module, handling version compatibility metadata.

### `/vc-app add-module`

Add a new feature module to an existing app.

```
/vc-app add-module --name Products
```

Generates:
- `src/modules/products/` directory
- `index.ts` with blade registration
- `pages/list.vue` — list blade with `VcTable`
- `pages/details.vue` — detail blade with form fields
- `composables/useProductDetails.ts` — data composable
- Locale files (`en.json`)

### `/vc-app generate`

Generate individual pieces of an app.

```
/vc-app generate blade --name OrderDetails
/vc-app generate composable --name useOrders
/vc-app generate api-client --spec https://example.com/api/swagger.json
```

Subcommands:
- `blade` — generates a single blade component following vc-shell conventions
- `composable` — generates a typed composable with loading/error state
- `api-client` — generates a typed API client from an OpenAPI specification
- `widget` — generates a dashboard widget component

## Update

Re-run the install command to update to the latest skill version:

```bash
npx @vc-shell/vc-app-skill install
```

The installer checks the installed version against the package version and overwrites files only when the package is newer.

## Uninstall

```bash
npx @vc-shell/vc-app-skill uninstall
```

Removes skill files from the AI tool's configuration directory. Does not affect your application source code.

To uninstall for a specific runtime:

```bash
npx @vc-shell/vc-app-skill uninstall --runtime opencode
```

## Development

This package lives in the `cli/vc-app-skill/` directory of the [vc-shell monorepo](https://github.com/AlenGeoAlex/vc-shell).

### Structure

```
cli/vc-app-skill/
  bin/
    install.cjs         # CLI entry point (install / uninstall)
  commands/
    install.ts          # Install logic per runtime
    uninstall.ts        # Uninstall logic
  hooks/
    post-install.cjs    # npm postinstall hook (auto-runs on npx)
  runtime/
    VERSION             # Current skill version
    skill.md            # Main skill prompt loaded by AI tool
    knowledge/          # Framework knowledge base (components, patterns, examples)
    commands/           # Slash command definitions (/vc-app create, etc.)
  README.md
  package.json
```

### Running locally

```bash
# From repo root
yarn workspace @vc-shell/vc-app-skill run build

# Test install against local Claude config
node cli/vc-app-skill/bin/install.cjs install
```

### Adding knowledge

Edit files under `runtime/knowledge/` to extend or correct the AI's understanding of the framework. Each file is a markdown document that gets concatenated into the skill context.

### Releasing

The package follows the monorepo release workflow. Bump `version` in `package.json` and `runtime/VERSION` together, then publish via the standard release pipeline.
