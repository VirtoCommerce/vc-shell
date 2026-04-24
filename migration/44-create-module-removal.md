# 43. createModule() Removal

## What Changed

The lightweight `createModule()` helper — which wrapped a set of Vue components (and optional locales) into an installable plugin — has been removed. Use `defineAppModule()` instead.

In v1.x the framework shipped two distinct factories from `core/plugins/modularity/`:

| Factory            | Purpose                                              | Status in v2 |
| ------------------ | ---------------------------------------------------- | ------------ |
| `createModule`     | Register plain components + locales                  | **Removed**  |
| `createAppModule`  | Register blade pages, routes, locales, notifications | Deprecated adapter — see guide [#09](./09-define-app-module.md) |

Both converge onto the single v2 primitive: `defineAppModule()`.

## Before (v1.x)

```typescript
import { createModule } from "@vc-shell/framework";
import * as components from "./components";
import * as locales from "./locales";

export const MyFeature = createModule(components, locales);

// app bootstrap
app.use(MyFeature);
```

## After (v2.0)

```typescript
import { defineAppModule } from "@vc-shell/framework";
import * as blades from "./pages";
import * as locales from "./locales";

export default defineAppModule({
  blades,
  locales,
});
```

```typescript
// app bootstrap
import MyFeature from "./modules/my-feature";
app.use(MyFeature);
```

## Migration Steps

1. Find every call site: `grep -rn "createModule\b" src/`.
2. Replace the import with `defineAppModule` from `@vc-shell/framework`.
3. Convert positional arguments `(components, locales)` to the named options object `{ blades, locales }`.
4. If the module only registered generic (non-blade) components, register them explicitly in an `install()` function or via `app.component()` in your bootstrap — `defineAppModule` expects blade pages under `blades`.
5. Remove any lingering `createModule` imports from `@vc-shell/framework`; they will fail to resolve.

## How to Find

```bash
grep -rn "createModule\b" src/
grep -rn 'from "@vc-shell/framework"' src/ | grep createModule
```

## Related

- [Guide #09: createAppModule → defineAppModule](./09-define-app-module.md) — primary migration path and full option reference
- [Guide #45: useDynamicModules() Removal](./45-dynamic-module-loader-removal.md) — companion module-system removal (CDN-based runtime loader)
