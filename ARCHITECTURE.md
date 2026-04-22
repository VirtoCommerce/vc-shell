# vc-shell Architecture

This document describes the architecture that is implemented in source code.

Validation basis: `framework/`, `packages/mf-*`, `configs/vite-config`, and `cli/create-vc-app` templates in this repository.

## System Model

`vc-shell` has three primary runtime roles:

1. Framework runtime: `@vc-shell/framework` plugin + UI/system services.
2. Host runtime for remote modules: `@vc-shell/mf-host` (Module Federation loader).
3. Remote module build/runtime contract: `@vc-shell/mf-module` + `defineAppModule()`.

Typical app modes produced by scaffolder templates:

1. Standalone app: uses framework plugin and local modules.
2. Host app: uses framework plugin and can load remote modules.
3. Dynamic module: ships MF `remoteEntry.js` and exports Vue plugin(s).

## Bootstrap Flow (`@vc-shell/framework`)

Main entry: [`framework/index.ts`](./framework/index.ts).

Framework plugin install sequence:

1. Register base theme (`useTheme().register(...)`).
2. Install fetch interceptors (`window.fetch = registerInterceptors(router)`).
3. Initialize i18n plugin and merge framework locales.
4. Provide breakpoints and legacy globals (`pages`, `bladeRoutes`).
5. Create/provide core services (`widget`, `toolbar`, `menu`, `settings`, notification store).
6. Create/provide `BladeRegistry`.
7. Install core plugins:
   - blade navigation plugin (`VcBladeNavigationComponent`)
   - popup handler
   - built-in modules (`AssetsDetailsModule`, `AssetsManagerModule`)
   - SignalR, permissions, touch events, AI agent plugin
8. Provide App Insights options (sync) for setup-time injections.
9. Install global error handlers.
10. Start connection/slow-network composables (browser only).
11. Register router guards (auth + permissions).
12. Defer non-critical App Insights installation to next macrotask.

`VcApp` shell readiness is managed separately via `isReady` prop and `useShellLifecycle()`:

- [`framework/ui/components/organisms/vc-app/vc-app.vue`](./framework/ui/components/organisms/vc-app/vc-app.vue)
- [`framework/ui/components/organisms/vc-app/composables/useShellLifecycle.ts`](./framework/ui/components/organisms/vc-app/composables/useShellLifecycle.ts)

## Blade Architecture

Blade system consists of compile-time metadata + runtime stack/messaging.

### 1. Compile-time metadata (`defineBlade`)

`defineBlade(...)` is a macro transformed by `viteBladePlugin`:

- plugin: [`configs/vite-config/src/plugins/viteBladePlugin.ts`](./configs/vite-config/src/plugins/viteBladePlugin.ts)
- global type: [`framework/typings/blade-macros.d.ts`](./framework/typings/blade-macros.d.ts)

Transformation behavior:

1. Replaces `defineBlade({ name, ...config })` with `defineOptions({ name })` in `<script setup>`.
2. Injects module-scope script with `__registerBladeConfig(name, config)`.

Result: blade config is available before component mount, during module install.

### 2. Runtime registration (`defineAppModule` -> `BladeRegistry`)

Module plugin API:

- [`framework/core/plugins/modularity/index.ts`](./framework/core/plugins/modularity/index.ts)

Registration path:

1. `defineAppModule({ blades })` calls `bladeRegistry._registerBladeFn(...)`.
2. Registry merges metadata from `defineBlade` config with legacy static fields.
3. If route + menuItem exist, registry registers menu entry automatically.

Registry implementation:

- [`framework/core/composables/useBladeRegistry/index.ts`](./framework/core/composables/useBladeRegistry/index.ts)
- [`framework/core/blade-navigation/bladeConfigRegistry.ts`](./framework/core/blade-navigation/bladeConfigRegistry.ts)

### 3. Stack state machine

Blade stack source of truth:

- [`framework/core/blade-navigation/useBladeStack.ts`](./framework/core/blade-navigation/useBladeStack.ts)

Core operations:

1. `openWorkspace`: clear stack and open workspace blade.
2. `openBlade`: open child blade from active/parent blade.
3. `replaceCurrentBlade`: destroy current and replace in same position.
4. `coverCurrentBlade`: hide current, open covering blade; closing reveals hidden blade.
5. `closeBlade` / `closeChildren`: close with guard checks (deepest-first).

Guard semantics in stack API:

- guard returns `true` to prevent close.

### 4. Messaging

Inter-blade messaging API:

- [`framework/core/blade-navigation/useBladeMessaging.ts`](./framework/core/blade-navigation/useBladeMessaging.ts)

Model:

1. Parent exposes methods by `bladeId`.
2. Child resolves `parentId` from stack and calls exposed method.

### 5. URL synchronization and restoration

Key files:

- [`framework/core/blade-navigation/utils/urlSync.ts`](./framework/core/blade-navigation/utils/urlSync.ts)
- [`framework/core/blade-navigation/utils/bladeRouterGuard.ts`](./framework/core/blade-navigation/utils/bladeRouterGuard.ts)
- [`framework/core/blade-navigation/utils/restoreFromUrl.ts`](./framework/core/blade-navigation/utils/restoreFromUrl.ts)

Behavior:

1. URL is built from workspace + active visible child blade.
2. Router guard distinguishes real route vs blade catch-all route.
3. On catch-all route, URL is parsed and stack is restored idempotently.
4. Non-routable blade segments trigger URL cleanup.

### 6. Unified blade composable

`useBlade()`:

- [`framework/core/composables/useBlade/index.ts`](./framework/core/composables/useBlade/index.ts)

Runtime contract:

1. `openBlade()` works both inside and outside blade context.
2. Context-bound methods (`closeSelf`, `callParent`, lifecycle hooks, etc.) throw explicit runtime error outside blade context.
3. Uses injected stack/messaging with singleton fallback from navigation plugin.

## Module Model

Primary API: `defineAppModule(options)`.

Options currently implemented:

1. `blades`
2. `locales`
3. `notifications`
4. `notificationTemplates` (legacy/deprecated path)

Install steps in source:

1. Register blades.
2. Register notification types (new API).
3. Backward-compatible notification shim for legacy blade `notifyType`.
4. Merge locales into global i18n.

Legacy adapter `createAppModule(...)` delegates to `defineAppModule(...)`.

Built-in modules exported by framework:

- [`framework/modules/assets/index.ts`](./framework/modules/assets/index.ts)
- [`framework/modules/assets-manager/index.ts`](./framework/modules/assets-manager/index.ts)

## Extension Points

Extension point subsystem:

- store: [`framework/core/plugins/extension-points/store.ts`](./framework/core/plugins/extension-points/store.ts)
- host declaration API: [`framework/core/plugins/extension-points/defineExtensionPoint.ts`](./framework/core/plugins/extension-points/defineExtensionPoint.ts)
- module registration API: [`framework/core/plugins/extension-points/useExtensionPoint.ts`](./framework/core/plugins/extension-points/useExtensionPoint.ts)

Properties:

1. Order-independent: modules can register before host declaration.
2. Host gets reactive sorted component list by priority.
3. Module side supports add/replace-by-id and remove.

## Remote Modules (Module Federation)

### Package responsibilities

1. `@vc-shell/mf-config`: canonical shared dependency catalog.
2. `@vc-shell/mf-module`: remote module Vite config generator.
3. `@vc-shell/mf-host`: host runtime loader + readiness state.

Key files:

- [`packages/mf-config/src/shared-deps.ts`](./packages/mf-config/src/shared-deps.ts)
- [`packages/mf-module/src/dynamic-module-config.ts`](./packages/mf-module/src/dynamic-module-config.ts)
- [`packages/mf-host/src/register-remote-modules.ts`](./packages/mf-host/src/register-remote-modules.ts)

### Host loading flow (`registerRemoteModules`)

Current runtime flow:

1. Provide `ModulesReadyKey` and `ModulesLoadErrorKey`.
2. `POST /api/frontend-modules` with `{ appName, provides }`.
3. Validate module entries and filter by framework compatibility range.
4. Create MF runtime instance with singleton shared deps.
5. Load remotes in parallel via `${id}/module`.
6. Resolve exported Vue plugins (`install`) and `app.use(...)` each.
7. Set `modulesReady=true` when done, `modulesLoadError=true` on fatal error.

### Remote module build contract

`@vc-shell/mf-module` default behavior:

1. Exposes `./module` (or custom exposes).
2. Output file `remoteEntry.js`.
3. Uses `REMOTE_SHARED` with `import: false` to rely on host shared deps.

## Layer Boundaries and Enforcement

Current automated layer checks are implemented by:

- [`scripts/check-layer-violations.ts`](./scripts/check-layer-violations.ts)

Enforced rules (current code):

1. `core` must not import from `shell` (tests/stories excluded).
2. `core` must not import from `ui` (except ai-agent component exception path).
3. `ui` must not import from `shell` (except `vc-app` exception path).

This is intentionally pragmatic and not a full strict DAG across all folders.

## Public API Surface and Stability Notes

Published package exports (subpath-level) are defined in:

- [`framework/package.json`](./framework/package.json)

Stable subpaths:

1. `@vc-shell/framework`
2. `@vc-shell/framework/ui`
3. `@vc-shell/framework/ai-agent`
4. `@vc-shell/framework/extensions`
5. locale and tailwind utility subpaths

Important note:

- Root `framework/index.ts` also re-exports some `_internal/*` symbols for compatibility. They are available but should be treated as low-stability integration surface.

## Source of Truth

When documentation conflicts occur, treat these files as authoritative:

1. Runtime bootstrap: [`framework/index.ts`](./framework/index.ts)
2. Blade runtime: `framework/core/blade-navigation/*`, `framework/core/composables/useBlade/*`
3. Module registration: [`framework/core/plugins/modularity/index.ts`](./framework/core/plugins/modularity/index.ts)
4. Extension points: `framework/core/plugins/extension-points/*`
5. MF runtime: `packages/mf-host/src/register-remote-modules.ts`
6. MF shared/build config: `packages/mf-config/src/shared-deps.ts`, `packages/mf-module/src/dynamic-module-config.ts`

## Related Documents

Related technical references are maintained as local-only documents under `docs/` and are intentionally excluded from Git.
