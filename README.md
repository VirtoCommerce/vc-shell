<h1 align="center">vc-shell</h1>

<p align="center">
  Vue 3 frontend framework for building specialized back-office applications on VirtoCommerce Platform.
</p>

<p align="center">
  <a href="https://github.com/VirtoCommerce/vc-shell/actions/workflows/ci.yml"><img src="https://github.com/VirtoCommerce/vc-shell/actions/workflows/ci.yml/badge.svg?branch=main" alt="CI"></a>
  <a href="https://www.npmjs.com/package/@vc-shell/framework"><img src="https://img.shields.io/npm/v/@vc-shell/framework?color=orange&label=%40vc-shell%2Fframework" alt="npm version"></a>
  <a href="https://github.com/VirtoCommerce/vc-shell/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-VC--OSL-green" alt="License"></a>
  <a href="https://vc-shell-storybook.govirto.com/"><img src="https://img.shields.io/badge/storybook-live%20demo-ff4785" alt="Storybook"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/node-%3E%3D22-brightgreen" alt="Node.js"></a>
  <a href="https://yarnpkg.com/"><img src="https://img.shields.io/badge/yarn-4.9.2-blue" alt="Yarn"></a>
</p>

---

## Overview

**vc-shell** is a monorepo containing the core UI framework, CLI tools, shared configs, and reference applications for VirtoCommerce back-office development. It provides a complete Vue 3 design system, a blade-based navigation paradigm, and a dynamic module system for building extensible admin applications.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Monorepo Structure](#monorepo-structure)
- [Getting Started](#getting-started)
- [Development](#development)
- [Testing PR Previews](#testing-pr-previews)
- [Local Development via `portal:` Protocol](#local-development-via-portal-protocol)
- [Architecture](#architecture)
- [Component Library](#component-library)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

### Key Features

- **Blade Navigation** — stacked panel navigation with `useBlade()` composable for opening, closing, and communicating between blades
- **Component Library** — Atomic Design hierarchy (atoms, molecules, organisms) with Tailwind CSS styling
- **Dynamic Module System** — runtime-loaded Vue plugins with semver compatibility and extension points
- **VcDataTable** — compositional table with declarative `<VcColumn>` API, virtual scroll, column switching, global filters, drag-and-drop reorder, and state persistence
- **Rich Text Editor** — Tiptap-based editor with tables, images, links, and markdown support
- **Dashboard & Widgets** — grid-based dashboard with GridStack, customizable widget system
- **Responsive Design** — mobile-first with dedicated mobile component variants
- **i18n** — built-in internationalization via vue-i18n
- **Core Composables** — reusable logic for API clients, assets, notifications, settings, permissions, and more

## Tech Stack

| Layer           | Technology                                           |
| --------------- | ---------------------------------------------------- |
| Framework       | Vue 3 (Composition API, `<script setup>`)            |
| Language        | TypeScript (strict mode)                             |
| Build           | Vite 6                                               |
| Styling         | Tailwind CSS (`tw-` prefix) + SCSS custom properties |
| Package Manager | Yarn 4 Berry (workspaces)                            |
| Testing         | Vitest + Vue Test Utils                              |
| Storybook       | Storybook 10                                         |
| Linting         | ESLint 9 + Prettier                                  |
| Charts          | Unovis                                               |
| Forms           | VeeValidate                                          |

## Monorepo Structure

```
vc-shell/
├── framework/                  # @vc-shell/framework — main UI library
│   ├── core/                   #   API clients, composables, plugins, services
│   │   ├── api/                #     Generated API clients
│   │   ├── composables/        #     Composables (useBlade, useAsync, etc.)
│   │   ├── plugins/            #     Modularity, extensions, AI agent
│   │   └── services/           #     Menu, Dashboard, Toolbar, GlobalSearch
│   ├── ui/                     #   Vue components (Atomic Design)
│   │   └── components/
│   │       ├── atoms/          #     Base components (Button, Badge, Icon...)
│   │       ├── molecules/      #     Form & interactive components (Input, Select, Editor...)
│   │       └── organisms/      #     Complex components (Table, Blade, Gallery...)
│   ├── shell/                  #   App chrome: sidebar, auth, dashboard, settings
│   ├── modules/                #   Built-in modules (assets, assets-manager)
│   └── assets/styles/          #   SCSS theme & CSS custom properties
│
├── cli/                        # CLI tools
│   ├── api-client/             #   @vc-shell/api-client-generator
│   ├── create-vc-app/          #   @vc-shell/create-vc-app — project scaffolder
│   ├── migrate/                #   @vc-shell/migrate — migration tool
│   └── vc-app-skill/           #   @vc-shell/vc-app-skill — AI-assisted app generation
│
├── configs/                    # Shared configurations
│   ├── ts-config/              #   @vc-shell/ts-config
│   └── vite-config/            #   @vc-shell/config-generator
│
├── packages/                   # Module Federation packages
│   ├── mf-config/              #   @vc-shell/mf-config
│   ├── mf-host/                #   @vc-shell/mf-host
│   └── mf-module/              #   @vc-shell/mf-module
│
├── apps/                       # Apps for local framework development & debugging
│   └── ...                     #   Place vc-shell apps here (see "Local Development via portal: Protocol")
│
└── .storybook/                 # Storybook configuration
```

## Getting Started

### Prerequisites

- **Node.js** >= 22
- **Yarn** 4.x (Corepack: `corepack enable`)

### Create a New App

There are two official workflows for creating vc-shell applications:

1. **CLI scaffolder** (`@vc-shell/create-vc-app`) — deterministic project bootstrap from templates
2. **AI skill** (`@vc-shell/vc-app-skill`) — intent-driven app and module generation in AI coding tools

#### Option A: CLI Scaffolder (`@vc-shell/create-vc-app`)

Create a new project interactively:

```bash
npx @vc-shell/create-vc-app my-app
```

Or use non-interactive flags:

```bash
npx @vc-shell/create-vc-app my-app --type standalone --module-name "Products" --dashboard --mocks
```

Add a module to an existing app:

```bash
npx @vc-shell/create-vc-app add-module orders
```

See full options and project types in [`cli/create-vc-app/README.md`](./cli/create-vc-app/README.md).

#### Option B: AI Skill (`@vc-shell/vc-app-skill`) for Claude Code and Codex

Install skill runtime:

```bash
# Claude Code runtime (default)
npx @vc-shell/vc-app-skill@alpha install

# Codex runtime
npx @vc-shell/vc-app-skill@alpha install --runtime codex
```

Restart your AI tool session, then use slash commands in your app workspace:

```text
/vc-app create
/vc-app connect
/vc-app generate
/vc-app add-module orders
```

See full command reference in [`cli/vc-app-skill/README.md`](./cli/vc-app-skill/README.md).

### Contribute to This Monorepo

```bash
# Clone the repository
git clone https://github.com/VirtoCommerce/vc-shell.git
cd vc-shell

# Install dependencies (also sets up Husky git hooks)
yarn install

# Build all packages
yarn build
```

## Development

### Common Commands

#### Build

```bash
yarn build                          # Build all publishable packages
yarn build:framework                # Build only @vc-shell/framework
yarn build:analyze                  # Build with bundle analyzer
yarn build:cli:config               # Build @vc-shell/config-generator
yarn build:cli:api-client           # Build @vc-shell/api-client-generator
yarn build:cli:create-vc-app        # Build @vc-shell/create-vc-app
```

#### Development

```bash
yarn dev:storybook                  # Storybook dev server at :6006
```

#### Test

```bash
yarn test                           # Run tests (single run, CI-friendly)
yarn test:watch                     # Run tests in watch mode (interactive)
yarn test:unit                      # Run unit tests against framework/vitest.config
yarn test:coverage                  # Tests with coverage report
yarn test:storybook                 # Run Storybook interaction tests
yarn test:snapshot:update           # Update Storybook snapshots
```

#### Lint, Format & Type Check

```bash
yarn lint                           # ESLint with --fix (dev)
yarn lint:check                     # ESLint verification (CI)
yarn format                         # Prettier --write (dev)
yarn format:check                   # Prettier verification (CI)
yarn stylelint                      # Stylelint --fix (dev)
yarn stylelint:check                # Stylelint verification (CI)
yarn typecheck                      # Framework type check
yarn check                          # Umbrella: all verifications (lint + format + stylelint + typecheck + locales + circular + layers)
```

#### Code Quality

```bash
yarn check:locales                  # Validate locale files
yarn check:circular                 # Detect circular dependencies (madge)
yarn check:layers                   # Enforce layer dependency direction
```

#### API Client Generation

Generate TypeScript API clients from VirtoCommerce Platform modules:

```bash
yarn generate:api-client
```

#### Release

See [RELEASING.md](./RELEASING.md) for the release process.

```bash
yarn release:dry                    # Dry run (preview changes)
```

#### Utilities

```bash
yarn clean                          # Remove all node_modules + dist directories
yarn changed                        # List commits since last release tag
yarn diff                           # Diff stats since last release tag
```

### Testing PR Previews

Every push to a PR in this repository automatically publishes preview versions of all managed packages to npm with a `pr-<N>` dist-tag. The preview workflow comments on the PR with install instructions.

Install a PR preview in a consuming project:

```bash
npm install @vc-shell/framework@pr-<N>
```

See [CONTRIBUTING.md — Testing PR Previews](./CONTRIBUTING.md#testing-pr-previews) for details, including the fork-PR caveat and exact-commit install pattern.

### Local Development via `portal:` Protocol

This repository supports one local-linking approach: Yarn `portal:`.

If your app lives outside this monorepo and you want to debug against a local build of `@vc-shell/framework` without moving the app.

**Quick setup** — drop your app into `apps/<name>/` (this directory is gitignored and not a Yarn workspace) and run:

```bash
yarn setup:apps
```

The script rewrites every `@vc-shell/*` dependency in the app's `package.json` to a `portal:` path pointing at the matching package in this repository, enables `preserveSymlinks` in app `tsconfig` and Vite config, stores a rollback snapshot at `.vc-shell/setup-apps-backup.json`, and runs `yarn install` inside the app directory. After setup, start the app from its own directory (`cd apps/<name> && yarn dev`).

To rollback app coupling and restore original files:

```bash
yarn unsetup:apps
```

**Manual setup** (same flow in full detail):

1. **Build framework locally** in the vc-shell clone:

   ```bash
   yarn build:framework
   ```

   The `portal:` protocol symlinks to the package directory — it does not build on demand. Re-run `yarn build:framework` after each framework change (no watch mode yet).

2. **Replace the `@vc-shell/*` entries** in your app's `package.json` with absolute `portal:` paths to the corresponding packages in this repository:

   ```json
   {
     "dependencies": {
       "@vc-shell/framework": "portal:/absolute/path/to/vc-shell/framework",
       "@vc-shell/config-generator": "portal:/absolute/path/to/vc-shell/configs/vite-config",
       "@vc-shell/api-client-generator": "portal:/absolute/path/to/vc-shell/cli/api-client"
     }
   }
   ```

   Include every `@vc-shell/*` package the app actually imports — portal entries are not auto-discovered like workspace deps.

3. **Enable preserveSymlinks on the app side** so the app's bundler and TypeScript follow the portal symlink back to the real package on disk. Skipping this creates two copies of Vue (one through the symlink, one through the app's own `node_modules`), breaking reactivity with warnings like "Vue has already been registered".

   If you used `yarn setup:apps`, this step is applied automatically.

   In the app's `tsconfig.json`:

   ```json
   {
     "compilerOptions": {
       "preserveSymlinks": true
     }
   }
   ```

   In the app's Vite config:

   ```ts
   export default defineConfig({
     resolve: {
       preserveSymlinks: true,
     },
   });
   ```

4. **Match peer-dependency versions.** The portal-linked framework brings its own `node_modules/`; if the app has a different `vue` or `vue-router` version, you still end up with dual instances. Verify with:

   ```bash
   # Inside the app
   yarn why vue
   # Inside the vc-shell clone
   yarn why vue
   ```

   Both commands should report the same version. If they diverge, bump the app's `package.json` to match the vc-shell framework peer range.

5. **Install and run the app as usual:**

   ```bash
   yarn install
   yarn dev   # or whatever the app's dev script is called
   ```

#### Troubleshooting

- **"Vue has already been registered" / lost reactivity** — `preserveSymlinks` is not enabled on either Vite or TypeScript. Check both configs.
- **Changes in `framework/` not reflected in the app** — `portal:` doesn't trigger rebuilds. Run `yarn build:framework` in the vc-shell clone after edits, then restart the app's dev server (Vite HMR may not pick up changes to symlinked `dist/`).
- **Type errors after rebuild** — stale `.tsbuildinfo` or `dist/` remnants. Clean vc-shell with `yarn clean` (and rebuild) before retrying.
- **Yarn refuses to install with lockfile conflicts** — the app's `yarn.lock` may reference npm-registry versions of `@vc-shell/*`. Delete the app's `yarn.lock` and re-run `yarn install` so Yarn re-resolves through portal entries.

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for development setup, workflow, and PR requirements.

## Architecture

vc-shell follows a blade-first modular architecture:

- **Blade Navigation** — stacked panel UX with context-aware navigation and blade-to-blade messaging
- **Module Runtime** — modules are Vue plugins that register blades, locales, and notification contracts
- **Extension Points** — cross-module composition via named slots and registration APIs

For implementation details, patterns, and code examples, see:

- [`ARCHITECTURE.md`](./ARCHITECTURE.md)

## Component Library

The framework follows **Atomic Design** methodology:

### Atoms (base building blocks)

`VcBadge` `VcBanner` `VcButton` `VcCard` `VcContainer` `VcHint` `VcIcon` `VcImage` `VcLabel` `VcLink` `VcLoading` `VcProgress` `VcSkeleton` `VcStatus` `VcTooltip` and more

### Molecules (composite form elements)

`VcInput` `VcSelect` `VcDatePicker` `VcEditor` `VcFileUpload` `VcCheckbox` `VcRadioGroup` `VcSwitch` `VcSlider` `VcAccordion` `VcDropdown` `VcPagination` `VcTextarea` `VcMultivalue` `VcColorInput` `VcInputCurrency` and more

### Organisms (complex UI blocks)

`VcBlade` `VcDataTable` `VcGallery` `VcImageUpload` `VcPopup` `VcSidebar` `VcApp` `VcAuthLayout` `VcDynamicProperty`

### Live Demo

Explore all components interactively: **[Storybook](https://vc-shell-storybook.govirto.com/)**

## Documentation

| Resource                                              | Description                                 |
| ----------------------------------------------------- | ------------------------------------------- |
| [Storybook](https://vc-shell-storybook.govirto.com/)  | Interactive component explorer              |
| [ARCHITECTURE.md](./ARCHITECTURE.md)                  | Architecture guide and patterns             |
| [create-vc-app README](./cli/create-vc-app/README.md) | Scaffolder usage and flags                  |
| [vc-app-skill README](./cli/vc-app-skill/README.md)   | AI skill commands for app/module generation |
| [WHATS_NEW.md](./WHATS_NEW.md)                        | v2.0.0 feature highlights                   |
| [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)            | Migration from v1 to v2                     |
| [RELEASING.md](./RELEASING.md)                        | Release process documentation               |
| [CHANGELOG.md](./CHANGELOG.md)                        | Full changelog                              |

## License

Copyright (c) Virto Solutions LTD. Licensed under the [Virto Commerce Open Software License](https://virtocommerce.com/open-source-license).
