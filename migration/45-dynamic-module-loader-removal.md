# 44. useDynamicModules() Removal

## What Changed

The runtime CDN-based module loader — `useDynamicModules()` in `framework/core/plugins/modularity/loader.ts` — has been removed entirely. This was a custom micro-frontend runtime that predated mature Vite Module Federation support. In v2.0 it is replaced by the dedicated `@vc-shell/mf-host` + `@vc-shell/mf-module` packages, which provide the same runtime module loading via standard Vite Module Federation.

Important: this has nothing to do with the "dynamic views" JSON-schema UI subsystem covered in [guide #08](./08-dynamic-views-removal.md). The two subsystems coexisted in v1.x but were independent — dynamic views built UI from JSON schemas; `useDynamicModules()` downloaded and installed pre-built Vue plugin bundles from a CDN.

## What useDynamicModules() Did

In v1.x, at application bootstrap:

1. Fetched `apps.json` from the configured `baseUrl` — a top-level manifest listing which modules belong to each deployed app.
2. For the current `appName`, resolved the list of module URLs (typically CDN paths).
3. For each module, fetched its per-module Vite `manifest.json`, located the CSS files and the entry chunk.
4. Loaded all CSS stylesheets and dynamic-imported the JS entry file (`import(moduleUrl + entry.file)`).
5. Each bundle self-registered on the global `window.VcShellDynamicModules`.
6. Checked semver compatibility between the framework version and each module's declared `compatibleWith.framework`, and between modules that depended on each other.
7. Installed each registered module as a Vue plugin: `app.use(mainModule.install, { router })`.
8. Exposed the registry under the `DynamicModulesKey` provide/inject key.

This enabled scenarios like: deploy module bundles to a CDN independently, have the host app pick them up at runtime without a rebuild, and version-gate compatibility dynamically.

## Before (v1.x)

```typescript
// main.ts
import { createApp } from "vue";
import { useDynamicModules } from "@vc-shell/framework";
import App from "./App.vue";
import router from "./router";

const app = createApp(App);

const { load } = useDynamicModules(app, { router, appName: "vendor-portal" }, {
  baseUrl: "https://cdn.example.com/modules/",
  frameworkVersion: "1.2.3",
});

await load();

app.mount("#app");
```

With a remote `apps.json` like:

```json
[
  { "vendor-portal": { "modules": [
    { "id": "orders", "url": "https://cdn.example.com/modules/orders/", "version": "1.0.0" },
    { "id": "catalog", "url": "https://cdn.example.com/modules/catalog/", "version": "1.0.0" }
  ]}}
]
```

## After (v2.0) — Option 1: Module Federation (equivalent runtime loading)

If you need the same runtime-loading behavior (remote bundles, independent deployments), switch to the `@vc-shell/mf-host` + `@vc-shell/mf-module` packages under `packages/`:

- **`@vc-shell/mf-module`** — build-time helper each remote module uses to produce a Module Federation remote.
- **`@vc-shell/mf-host`** — host-side runtime that discovers remotes and wires them into the host app.

```typescript
// Host app bootstrap (simplified — see @vc-shell/mf-host docs for full setup)
import { createApp } from "vue";
import { createMfHost } from "@vc-shell/mf-host";
import App from "./App.vue";

const app = createApp(App);
const host = createMfHost({ /* remotes config */ });
await host.loadRemotes(app);

app.mount("#app");
```

Module Federation handles: CSS loading, dependency deduplication, version negotiation, and typed remote exposure — the responsibilities that `useDynamicModules()` implemented by hand.

## After (v2.0) — Option 2: Static imports

If your app does not need runtime loading of remote deployments (single-deployment app), use static imports with `defineAppModule()`:

```typescript
import { createApp } from "vue";
import App from "./App.vue";
import Orders from "./modules/orders";
import Catalog from "./modules/catalog";

const app = createApp(App);
app.use(Orders);
app.use(Catalog);
app.mount("#app");
```

For environment-gated modules, dynamic `import()` in bootstrap still works — Vite code-splits, but modules are known at build time:

```typescript
if (import.meta.env.VITE_ENABLE_BETA) {
  const { default: BetaModule } = await import("./modules/beta");
  app.use(BetaModule);
}
```

## Why This Was Replaced

- Maintaining a custom micro-frontend runtime (manifest fetching, CSS stitching, window-based registration, semver gating) duplicated effort already solved by Vite Module Federation and the `mf-host` / `mf-module` packages.
- Global registration via `window.VcShellDynamicModules` was fragile — it depended on event ordering, polled with timeouts, and blocked app mount until modules announced themselves.
- The semver compatibility layer was better owned by the build step (where types and deps are visible) than at runtime.

## Migration Steps

1. Remove every import of `useDynamicModules` from `@vc-shell/framework`.
2. Remove the `DynamicModulesKey` provide (if used directly) — module federation exposes remotes through a different contract.
3. Delete the `apps.json` manifest and per-module Vite `manifest.json` artifacts that the old loader consumed, along with any CI steps that published them.
4. **If you need runtime remote loading**: install `@vc-shell/mf-host` in the host and `@vc-shell/mf-module` in each remote module; update each module's `vite.config.ts` to use the federation helper and the host's to register remotes. See the packages' READMEs.
5. **If you don't need runtime remote loading**: add each previously-remote module as a build-time dependency in your app's `package.json` and `app.use(...)` it in bootstrap.
6. Remove any reliance on `window.VcShellDynamicModules` or the `vc-shell-module-registered` event — both are gone.

## How to Find

```bash
grep -rn "useDynamicModules" src/
grep -rn "DynamicModulesKey" src/
grep -rn "VcShellDynamicModules" src/
grep -rn "vc-shell-module-registered" src/
```

Also look for module build scripts that produced a standalone Vite manifest for CDN deployment — those rebuild steps need to switch to the federation build.

## Related

- [Guide #09: createAppModule → defineAppModule](./09-define-app-module.md) — the static module definition API (used in both MF and non-MF cases)
- [Guide #43: getDynamicModuleConfiguration → getModulesLibraryConfiguration](./43-modules-library-config.md) — the related vite-config helper rename (standalone module library build, not federation)
- [Guide #44: createModule() Removal](./44-create-module-removal.md) — companion module-system removal
- `@vc-shell/mf-host` and `@vc-shell/mf-module` packages under `packages/` — the current runtime-loading replacement
