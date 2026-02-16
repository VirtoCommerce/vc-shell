# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Monorepo for VirtoCommerce admin shell framework — Vue 3 + TypeScript component library, CLI tools, and Storybook. Uses Yarn 4 (berry) with node-modules linker. Package manager: `yarn@4.9.2`.

## Commands

```bash
yarn install                    # Install all workspace dependencies
yarn build                      # Build all publishable packages
yarn build-framework            # Build only @vc-shell/framework
yarn storybook-serve            # Storybook dev server on :6006
yarn storybook-build            # Production Storybook build
yarn lint                       # ESLint with --fix across framework/cli/configs
yarn check-locales              # Validate locale files (runs on pre-commit hook)
```

**TypeScript check** (no built-in script — run manually):
```bash
cd framework && npx tsc --noEmit
```

**Tests** (vitest, jsdom environment):
```bash
cd framework && npx vitest run          # Run all tests once
cd framework && npx vitest              # Watch mode
cd framework && npx vitest run --coverage  # With coverage
cd framework && npx vitest run path/to/file.test.ts  # Single test file
```

Test files live alongside source code (e.g. `composables/useBladeStack.test.ts`). Config: `framework/vitest.config.ts`.

**Vendor Portal app** (reference app):
```bash
yarn workspace app-vendor-portal run serve   # Dev server (requires framework build first)
```

## Architecture

```
vc-shell/
  framework/              # @vc-shell/framework — the main UI library
    core/                 #   API clients, composables, plugins, services, types
    ui/                   #   Atomic Design components (atoms → molecules → organisms)
    shared/               #   App-level components (blade nav, notifications, sign-in, settings)
    assets/styles/        #   SCSS: theme/colors.scss defines CSS custom properties
  cli/                    # CLI tools (api-client generator, create-vc-app scaffolder)
  configs/                # Shared configs (ts-config, vite-config, release-config)
  apps/vendor-portal/     # Reference app consuming the framework
  .storybook/             # Storybook configuration (stories in framework/ui/**)
```

### Key Architectural Patterns

**Blade Navigation** — The core UI paradigm. Blades are stacked panels (like Azure Portal). Key files:
- `shared/components/blade-navigation/` — VcBladeNavigation, VcBladeSlot, composables
- `core/composables/useBlade/` — `useBlade()` (legacy) and `useBladeContext()` (new extended API with openBlade, closeSelf, callParent, etc.)
- Blades use provide/inject via injection keys for dependency injection between parent/child blades

**Dynamic Module Loading** — Modules are loaded at runtime via `useDynamicModules()` from `core/plugins/modularity/`. Each module is a Vue plugin with optional extensions and version compatibility metadata. Modules declare framework/app compatibility via semver ranges.

**Extensions System** — Inbound (app customizes module) and outbound (module extends app) extensions, accessed via `extensionsHelper`. See `core/plugins/extension-points/`.

**Services** — Singleton services registered via provide/inject: WidgetService, MenuService, DashboardService, ToolbarService, GlobalSearchService, SettingsMenuService. Each has a corresponding `use*` composable in `core/composables/`.

## Key Area: VcTable / VcDataTable

Active development area. Two table implementations coexist:

| Component | File | Role |
|-----------|------|------|
| `VcDataTable` | `framework/ui/components/organisms/vc-table/VcDataTable.vue` | New compositional table |
| `VcTableAdapter` | `framework/ui/components/organisms/vc-table/VcTableAdapter.vue` | Adapter: wraps VcDataTable with legacy VcTable API |
| `vc-table.vue` | `framework/ui/components/organisms/vc-table/vc-table.vue` | Legacy table (exported as `VcTableLegacy`) |

Sub-components are in `vc-table/components/`, composables in `vc-table/composables/`. Check these directories before building new table features — most functionality already exists (column switching, global filters, cell renderers, search header, row actions, virtual scroll, etc.).

## Code Style & Conventions

- **Vue**: `<script setup lang="ts">` with Composition API. No Options API.
- **CSS**: Tailwind with `tw-` prefix (e.g. `tw-px-1`, `tw-flex`). Component-scoped styles use BEM-like `.vc-component-name__element` class names. Colors via CSS custom properties from `framework/assets/styles/theme/colors.scss` — use like `tw-bg-[var(--primary-500)]`.
- **Types**: TypeScript strict mode. Interfaces prefixed with `I` (e.g. `ITableColumns`).
- **Components**: `Vc` prefix for all framework UI components. Internal sub-components go in `_internal/` directory.
- **Exports**: `index.ts` barrel files at each component directory level.
- **State**: Complex logic goes into composables. Use provide/inject (via `injection-keys.ts`) for cross-component state. Use VueUse composables where applicable.
- **Responsive**: Use `$isMobile.value` / `$isDesktop.value`. Mobile variants go in `mobile/` subdirectory with `--mobile`/`--desktop` class suffixes.
- **Localization**: vue-i18n with `namespace.key` format.
- **Column type mapping**: `ITableColumnsBase` uses `"date-time"` but VcColumn uses `"datetime"` — adapter must map.
- **Git**: Conventional commits enforced by commitlint. lint-staged runs ESLint + Prettier on staged files. Do not make auto commits.
- **Storybook stories**: Co-located with components as `component-name.stories.ts`. Use `satisfies Meta<typeof Component>` pattern with `render: (args) => ({...})` functions.
- **Injection keys**: Centralized in `framework/injection-keys.ts` for provide/inject DI across the component tree.

## Gotchas

- **Storybook HMR loop**: vc-table stories have a known infinite HMR reload (~1s remount). Playwright snapshots may appear empty; use screenshots instead.
- **Vue watcher + immediate**: `watch(computed, ..., { immediate: true })` fires again during post-setup flush if computed returns new array reference (fails `Object.is`). Guard with set-equality checks.
- **Flex column layout**: Columns use `flex: 0 1 auto` with `min-width: 0`. Head/cell padding MUST match (`tw-px-1`) or columns with many columns overflow. The `::after` filler pseudo-element absorbs leftover space.
- **Row drag-and-drop**: `event.preventDefault()` in `dragover` MUST be called on EVERY event or `drop` never fires. No early returns before it.
- **VcTableAdapter sort prop**: Parent passes `:sort-expression` but adapter prop is `sort` — `props.sort` is always undefined. `lastSortField` ref is the essential fallback.
- **No horizontal scrollbar**: `.vc-table-composition` uses `overflow: hidden`, not `auto`.

## Implementation Guidelines

- Prefer simple, minimal fixes. Do not over-engineer. Only modify code related to the task at hand.
- Reuse existing components and composables — check `vc-table/components/` and `vc-table/composables/` before building new table features.
- Map to VcDataTable's built-in features rather than reimplementing from scratch.
- When fixing bugs, check `git log --oneline -15` early — regressions from recent commits are common.
- After editing code, verify with `cd framework && npx tsc --noEmit` to catch TypeScript errors immediately.

## Debugging Tips

- Check git history first for regression bugs: `git log --oneline -15` and `git diff HEAD~3`
- For CSS/layout issues in Storybook, use Playwright screenshots (not snapshots) due to HMR loop
- State persistence storage key: `VC_DATATABLE_${stateKey.toUpperCase()}` in localStorage/sessionStorage
