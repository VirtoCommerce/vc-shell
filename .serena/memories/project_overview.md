# VC-Shell Project Overview

## Purpose
VirtoShell - Vue3 Frontend framework for VirtoCommerce back-office applications. Replacement for AngularJS-based vc-platform manager.

## Tech Stack
- **Package Manager:** Yarn Berry (monorepo)
- **Framework:** Vue 3
- **Build:** Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS + SCSS + CSS Variables
- **Testing:** Vitest
- **Documentation:** Storybook 9.x
- **Linting:** ESLint + Prettier

## Project Structure
```
vc-shell/
├── framework/          # Core framework package (@vc-shell/framework)
│   ├── ui/             # UI components library
│   │   └── components/ # atoms, molecules, organisms
│   ├── core/           # Core types, API, composables
│   └── shared/         # Shared pages (Login, etc.)
├── apps/               # Applications (vendor-portal)
├── cli/                # CLI tools (api-client, create-vc-app, config-generator)
├── configs/            # Shared configs (ts-config, vite-config)
└── scripts/            # Build and release scripts
```

## Key Commands
- `yarn` - Install dependencies
- `yarn build` - Build all packages
- `yarn build-framework` - Build framework only
- `yarn lint` - Run ESLint
- `yarn storybook-serve` - Run Storybook dev server (port 6006)
- `yarn storybook-build` - Build Storybook static

## Code Conventions
- Vue 3 Composition API with `<script setup>`
- TypeScript strict mode
- CSS BEM-like naming with `vc-` prefix
- Tailwind utilities with `tw-` prefix
- CSS variables for theming
- Composables in `/composables/` directories
- Generic components with `generic="T extends ..."`
