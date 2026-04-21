<h1 align="center">vc-shell</h1>

<p align="center">
  Vue 3 frontend framework for building specialized back-office applications on VirtoCommerce Platform.
</p>

<p align="center">
  <a href="https://github.com/VirtoCommerce/vc-shell/actions/workflows/ci.yml"><img src="https://github.com/VirtoCommerce/vc-shell/actions/workflows/ci.yml/badge.svg?branch=main" alt="CI"></a>
  <a href="https://www.npmjs.com/package/@vc-shell/framework"><img src="https://img.shields.io/npm/v/@vc-shell/framework/alpha?color=orange&label=%40vc-shell%2Fframework" alt="alpha version"></a>
  <a href="https://github.com/VirtoCommerce/vc-shell/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-VC--OSL-green" alt="License"></a>
  <a href="https://vc-shell-storybook.govirto.com/"><img src="https://img.shields.io/badge/storybook-live%20demo-ff4785" alt="Storybook"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/node-%3E%3D22-brightgreen" alt="Node.js"></a>
  <a href="https://yarnpkg.com/"><img src="https://img.shields.io/badge/yarn-4.9.2-blue" alt="Yarn"></a>
</p>

---

## Overview

**vc-shell** is a monorepo containing the core UI framework, CLI tools, shared configs, and reference applications for VirtoCommerce back-office development. It provides a complete design system of 60+ reusable Vue 3 components, a blade-based navigation paradigm, and a dynamic module system for building extensible admin applications.

### Key Features

- **Blade Navigation** — stacked panel navigation with `useBlade()` composable for opening, closing, and communicating between blades
- **60+ UI Components** — Atomic Design hierarchy (atoms, molecules, organisms) with Tailwind CSS styling
- **Dynamic Module System** — runtime-loaded Vue plugins with semver compatibility and extension points
- **VcDataTable** — compositional table with declarative `<VcColumn>` API, virtual scroll, column switching, global filters, drag-and-drop reorder, and state persistence
- **Rich Text Editor** — Tiptap-based editor with tables, images, links, and markdown support
- **Dashboard & Widgets** — grid-based dashboard with GridStack, customizable widget system
- **Responsive Design** — mobile-first with dedicated mobile component variants
- **i18n** — built-in internationalization via vue-i18n
- **44+ Composables** — reusable logic for API clients, assets, notifications, settings, permissions, and more

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
│   │   ├── composables/        #     44+ composables (useBlade, useAsync, etc.)
│   │   ├── plugins/            #     Modularity, extensions, AI agent
│   │   └── services/           #     Menu, Dashboard, Toolbar, GlobalSearch
│   ├── ui/                     #   Vue components (Atomic Design)
│   │   └── components/
│   │       ├── atoms/          #     20+ base components (Button, Badge, Icon...)
│   │       ├── molecules/      #     28+ form & interactive (Input, Select, Editor...)
│   │       └── organisms/      #     9 complex components (Table, Blade, Gallery...)
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
│   └── ...                     #   Place vc-shell apps here (see "Local Development with an App")
│
└── .storybook/                 # Storybook configuration
```

## Getting Started

### Prerequisites

- **Node.js** >= 22
- **Yarn** 4.x (Corepack: `corepack enable`)

### Installation

```bash
# Clone the repository
git clone https://github.com/VirtoCommerce/vc-shell.git
cd vc-shell

# Install dependencies (also sets up Husky git hooks)
yarn install

# Build all packages
yarn build
```

### Quick Start with Scaffolder

Create a new vc-shell application from a template:

```bash
# Interactive project scaffolder
npx @vc-shell/create-vc-app my-app
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

### Local Development via portal: Protocol

If your app lives outside this monorepo and you want to debug against a local build of `@vc-shell/framework` without moving the app.

**Quick setup** — drop your app into `apps/<name>/` (this directory is gitignored and not a Yarn workspace) and run:

```bash
yarn setup:apps
```

The script rewrites every `@vc-shell/*` dependency in the app's `package.json` to a `portal:` path pointing at the matching package in this repository, then runs `yarn install` inside the app directory. You still need to set `preserveSymlinks: true` on both the app's `tsconfig.json` and Vite config (see step 3 below). After setup, start the app from its own directory (`cd apps/<name> && yarn dev`).

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

#### When to use which approach

| Situation                                                                                                                      | Recommended                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| You want the app built into this monorepo (running its dev server via `yarn workspace`, checking CI here, cross-package edits) | [Local Development with an App](#local-development-with-an-app) (`apps/` + `yarn setup:apps`) |
| Your app is in a separate repo and should stay there; you just need a short debug loop against a local framework build         | `portal:` protocol (this section)                                                             |

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for development setup, workflow, and PR requirements.

## Architecture

### Blade Navigation

Blades are the core navigation paradigm — stacked panels that open from left to right. The `useBlade()` composable provides a unified API for navigation, communication, lifecycle, and error management:

```vue
<script setup lang="ts">
import { useBlade } from "@vc-shell/framework";

const { param, openBlade, closeSelf, callParent, onActivated } = useBlade();

openBlade({ name: "OrderDetails", param: "order-123" });
openBlade({ name: "OrdersList", isWorkspace: true });
closeSelf();
const result = await callParent("reload");
onActivated(() => {
  /* refresh data */
});
</script>
```

### Modules

Modules are defined with `defineAppModule()` and registered as Vue plugins. Each module declares its blades, locales, and notification types:

```typescript
import { defineAppModule } from "@vc-shell/framework";
import { OrdersList, OrderDetails } from "./components";
import en from "./locales/en.json";
import de from "./locales/de.json";

export default defineAppModule({
  blades: { OrdersList, OrderDetails },
  locales: { en, de },
  notifications: {
    OrderChanged: { toast: { mode: "auto" } },
  },
});
```

Blade components are auto-registered in BladeRegistry by their `name` property, enabling navigation via `openBlade({ name: "OrdersList" })`.

### Extension Points

The framework supports declarative extension points for cross-module customization:

```typescript
import { defineExtensionPoint } from "@vc-shell/framework/extensions";

const { ExtensionPoint, extensions } = defineExtensionPoint("order-details-toolbar");
```

Consumer modules contribute to extension points by registering components at those named slots.

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

| Resource                                             | Description                    |
| ---------------------------------------------------- | ------------------------------ |
| [Storybook](https://vc-shell-storybook.govirto.com/) | Interactive component explorer |
| [WHATS_NEW.md](./WHATS_NEW.md)                       | v2.0.0 feature highlights      |
| [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)           | Migration from v1 to v2        |
| [RELEASING.md](./RELEASING.md)                       | Release process documentation  |
| [CHANGELOG.md](./CHANGELOG.md)                       | Full changelog                 |

## License

Copyright (c) Virto Solutions LTD. Licensed under the [Virto Commerce Open Software License](https://virtocommerce.com/open-source-license).
