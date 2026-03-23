# @vc-shell/vc-app-skill

An AI coding skill for scaffolding and generating VirtoCommerce Shell applications. Compatible with Claude Code, OpenCode, Gemini CLI, Codex, Cursor, and GitHub Copilot.

## Overview

`vc-app-skill` installs a set of AI-readable skill files (markdown prompts, knowledge base, slash commands) into your AI coding tool's configuration directory. Once installed, your AI assistant gains deep knowledge of the VirtoCommerce Shell framework — enabling it to scaffold apps, connect to platform APIs, generate full UI modules, and follow framework conventions automatically.

The skill covers:
- Creating standalone apps from templates
- Connecting to VirtoCommerce platform and generating typed API clients
- Intent-driven module generation (list + details blades, composables, locales) with mock or API data
- Enhancing existing modules with surgical modifications (add columns, fields, toolbar actions, logic, blade links)
- Promoting prototype modules from mock data to real API clients
- Following vc-shell conventions: Vue 3 + TypeScript, Tailwind with `tw-` prefix, `<script setup>`, BEM class names

## Installation

### Claude Code / Cursor / GitHub Copilot

```bash
npx @vc-shell/vc-app-skill install
```

Installs skill files into `~/.claude/vc-app-skill/` and registers the `/vc-app` slash command.

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
- App name and npm package name
- Target directory

Generates a fully configured standalone project with `package.json`, `tsconfig.json`, Vite config, and entry points.

### `/vc-app connect`

Connect to a VirtoCommerce platform instance and generate typed API clients.

```
/vc-app connect
```

Walks through:
1. Writing `.env` with platform URL
2. Writing `.env.local` with auth credentials
3. Generating NSwag API clients from the platform's Swagger endpoints
4. Verifying TypeScript compilation

### `/vc-app add-module <name>`

Add an empty module skeleton to the current project.

```
/vc-app add-module orders
```

Generates:
- `src/modules/<name>/` directory with `index.ts`, `pages/`, `composables/`, `locales/`
- Registers the module in the app's module list

### `/vc-app generate`

Full intent-driven module generation. This is the main power feature — it walks through an interactive dialog to generate a complete module.

```
/vc-app generate
```

**Create flow** (new module):
- **Phase 1: Intent** — describe what the module does, pick blade types (list+details, list-only, details-only), configure menu entry
- **Phase 2: Data Source** — select API entity, choose columns/fields, pick CRUD methods. If no API client exists, generates with mock data automatically
- **Phase 3: Generation** — dispatches specialized agents to generate blades, composables, locales, and barrel files
- **Phase 4: Verification** — runs TypeScript type-checker

**Enhance flow** (existing module):
When the module already exists, generate detects it and switches to enhance mode:
- **Phase E1: Module Analysis** — analyzes existing blades, composables, locales, API status
- **Phase E2: Intent Parsing** — describe changes in free text, parsed into action plan
- **Phase E3: Data Source** — only if new entity is involved
- **Phase E4: Execution** — dispatches blade-enhancer for surgical edits or generators for new blades
- **Phase E5: Verification** — type-checks the result

Supported enhance actions: add columns, add form fields, add logic/computed/watchers, add toolbar actions, link blades, add new blades to existing module.

### `/vc-app promote <name>`

Transition a prototype module from mock data to a real API client.

```
/vc-app promote team
```

When you generate a module without an API client, it uses mock data with `// vc-app:mock-start/end` markers. After running `/vc-app connect` to generate API clients, promote performs surgical replacement:

- **Phase 1: Validation** — reads `.vc-app-prototype.json`, locates API client
- **Phase 2: Data Source Discovery** — select API entity and fields (reuses generate Phase 2)
- **Phase 3: Field Mapping** — auto-matches mock fields to API fields (exact + semantic), user confirms
- **Phase 4: Code Transformation** — replaces mock code with real API calls, renames fields, updates locales
- **Phase 5: Cleanup** — type-checks, removes prototype marker on success

## Update

```bash
npx @vc-shell/vc-app-skill install
```

Or from within your AI tool:

```
/vc-app:update
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

## Architecture

### Skill structure

```
cli/vc-app-skill/
  bin/
    install.cjs              # CLI entry point (install / uninstall)
    uninstall.cjs            # Uninstall entry point
  commands/
    vc-app.md                # Slash command entry point (loads runtime skill)
    vc-app/
      update.md              # /vc-app:update command
  hooks/
    vc-app-check-update.js   # SessionStart hook for update checks
  runtime/
    VERSION                  # Current skill version
    vc-app.md                # Main orchestrator — command routing, all flows
    agents/                  # Specialized subagent prompts
    knowledge/               # Framework knowledge base
      index.md               # Knowledge index
      docs/                  # Component .docs.md files
      patterns/              # Blade/composable skeleton patterns
      examples/              # Reference examples
    scripts/                 # Helper scripts
  README.md
  package.json
```

### Agents

The skill dispatches specialized agents for different tasks:

| Agent | Purpose |
|---|---|
| `api-analyzer` | Discovers entities and CRUD methods in API client files |
| `list-blade-generator` | Generates list blade + plural composable |
| `details-blade-generator` | Generates details blade + singular composable |
| `locales-generator` | Scans generated files for i18n keys, writes locale JSON |
| `module-assembler` | Creates barrel files and registers module (create + append modes) |
| `type-checker` | Runs vue-tsc, iteratively fixes type errors |
| `promote-agent` | Transforms mock composables/blades/locales to use real API |
| `module-analyzer` | Analyzes existing module structure (read-only) |
| `blade-enhancer` | Surgical edits to existing blades/composables/locales |

### Running locally

```bash
# Install skill from local source
node cli/vc-app-skill/bin/install.cjs

# Verify deployment
ls ~/.claude/vc-app-skill/agents/
```

### Releasing

The package follows the monorepo release workflow. Bump `version` in `package.json` and `runtime/VERSION` together, then publish via the standard release pipeline.
