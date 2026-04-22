# @vc-shell/vc-app-skill

An AI coding skill for scaffolding and generating VirtoCommerce Shell applications. Compatible with Claude Code, OpenCode, Gemini CLI, Codex, Cursor, and GitHub Copilot.

## Overview

`vc-app-skill` installs a set of AI-readable skill files (markdown prompts, knowledge base, slash commands) into your AI coding tool's configuration directory. Once installed, your AI assistant gains deep knowledge of the VirtoCommerce Shell framework — enabling it to scaffold apps, connect to platform APIs, generate full UI modules, and follow framework conventions automatically.

The skill covers:

- Creating standalone apps from templates
- Connecting to VirtoCommerce platform and generating typed API clients
- Intent-driven module generation (list + details blades, composables, locales) with mock or API data
- Enhancing existing modules with surgical modifications (add columns, fields, toolbar actions, logic, blade links)
- Generating full multi-module applications from a free-text prompt (design command)
- Promoting prototype modules from mock data to real API clients
- Migrating existing apps to the latest `@vc-shell/framework` version (runs the CLI migrator, regenerates API clients, completes AI-assisted manual refactors)
- Following vc-shell conventions: Vue 3 + TypeScript, Tailwind with `tw-` prefix, `<script setup>`, BEM class names

## Installation

### Claude Code / Cursor / GitHub Copilot

```bash
npx @vc-shell/vc-app-skill@alpha install
```

Installs skill files into `~/.claude/vc-app-skill/` and registers the `/vc-app` slash command.

### OpenCode

```bash
npx @vc-shell/vc-app-skill@alpha install --runtime opencode
```

### Gemini CLI

```bash
npx @vc-shell/vc-app-skill@alpha install --runtime gemini
```

### Codex

```bash
npx @vc-shell/vc-app-skill@alpha install --runtime codex
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

### `/vc-app design`

Generate a full multi-module application from a free-text prompt. Parses a description into a structured plan, shows it for confirmation, then orchestrates existing generators to build everything.

```
/vc-app design "Build a tenant management system with subscriptions and agent catalog"
/vc-app design --from requirements.md
/vc-app design
```

- **Phase 1: Prompt Acquisition** — inline text, `--from <file>`, or interactive input
- **Phase 2: Prompt Analysis** — extracts entities, fields, actions, connections, and abstract TODOs from natural language
- **Phase 3: Plan Presentation** — shows structured plan for confirmation with iterative corrections
- **Phase 4: API Detection** — checks for existing API clients, attempts entity matching
- **Phase 5: Execution** — scaffolds project if needed, then loops over modules dispatching generators, wires connections between blades, injects TODO comments for abstract requirements
- **Phase 6: Summary** — shows created modules, wired connections, TODOs, data source status, TypeScript check result

Supports prompts in any language; module/field names are always generated in English.

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

### `/vc-app migrate`

Fully automatic migration of an existing app to the latest `@vc-shell/framework` version. Runs the CLI migrator for mechanical transforms, regenerates API clients with the new Interface-style output, installs updated dependencies, and dispatches AI agents to complete manual refactors flagged in `MIGRATION_REPORT.md`.

```
/vc-app migrate
```

Flow:

- **Step 1: Pre-flight** — verifies the project uses `@vc-shell/framework`; warns on uncommitted changes
- **Step 2: CLI migrator** — runs `@vc-shell/migrate --update-deps` to apply mechanical transforms and align peer-dependency versions (including `@vc-shell/*`, ESLint, Vite, TypeScript, VueUse, `vue-router` and other curated peer deps)
- **Step 2.5: API client regeneration** — adds `APP_TYPE_STYLE=Interface`, runs `generate-api-client`, verifies types compile
- **Step 3: Install** — `yarn install` to refresh the lockfile
- **Step 4: Parse report** — reads `MIGRATION_REPORT.md`, maps "Manual Migration Required" topics to migration prompts and patterns
- **Step 5: AI migration** — dispatches `migration-agent` on affected files per topic (supports partial resume via `.vc-app-migrate-state.json`)
- **Step 6: Verify** — runs `vue-tsc --noEmit` and `yarn build`, iteratively fixes type errors
- **Step 6.5: Format** — runs Prettier across the project
- **Step 7: Summary** — updates the report and prints a completion summary with remaining issues

Handles topics: widgets, form management (`useBladeForm`), injection-key renames, NSwag class-to-interface, blade props simplification, notifications, VcTable → VcDataTable, icon replacements, assets API, pagination, and a manual-audit catch-all.

## Update

```bash
npx @vc-shell/vc-app-skill@alpha install
```

Or from within your AI tool:

```
/vc-app:update
```

The installer checks the installed version against the package version and overwrites files only when the package is newer.

## Uninstall

```bash
npx @vc-shell/vc-app-skill@alpha uninstall
```

Removes skill files from the AI tool's configuration directory. Does not affect your application source code.

To uninstall for a specific runtime:

```bash
npx @vc-shell/vc-app-skill@alpha uninstall --runtime opencode
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

| Agent                     | Purpose                                                                    |
| ------------------------- | -------------------------------------------------------------------------- |
| `api-analyzer`            | Discovers entities and CRUD methods in API client files                    |
| `list-blade-generator`    | Generates list blade + plural composable                                   |
| `details-blade-generator` | Generates details blade + singular composable                              |
| `locales-generator`       | Scans generated files for i18n keys, writes locale JSON                    |
| `module-assembler`        | Creates barrel files and registers module (create + append modes)          |
| `type-checker`            | Runs vue-tsc, iteratively fixes type errors                                |
| `promote-agent`           | Transforms mock composables/blades/locales to use real API                 |
| `migration-agent`         | Applies AI-assisted manual migrations on files flagged by the migrate flow |
| `module-analyzer`         | Analyzes existing module structure (read-only)                             |
| `blade-enhancer`          | Surgical edits to existing blades/composables/locales                      |

### Running locally

```bash
# Install skill from local source
node cli/vc-app-skill/bin/install.cjs

# Verify deployment
ls ~/.claude/vc-app-skill/agents/
```
