# 42. Vite Config: getDynamicModuleConfiguration → getModulesLibraryConfiguration

## Severity: **Breaking** (if your module's `vite.config.ts` imported the old helper)

## What Changed

`@vc-shell/config-generator` no longer exports `getDynamicModuleConfiguration()`. It has been replaced by `getModulesLibraryConfiguration()`, a simpler helper that builds a **statically-bundled ES module library** instead of a UMD Module Federation remote.

This is not a rename — the two helpers produce different artifacts and serve different deployment models:

| Aspect                   | `getDynamicModuleConfiguration` (v1.x)         | `getModulesLibraryConfiguration` (v2.x)     |
| ------------------------ | ---------------------------------------------- | ------------------------------------------- |
| Output format            | UMD + `remoteEntry.js` manifest                | ES module (`.mjs`)                          |
| Default entry            | `./index.ts`                                   | `./index.ts`                                |
| Default `outDir`         | `dist/packages/modules`                        | `dist`                                      |
| `compatibility.framework` | **Required**                                  | Not supported — moved to `defineAppModule()` |
| Module name (UMD)        | `VcShellModule_<sanitized-name>`               | N/A                                         |
| Intended use             | Runtime-loaded remotes                         | Statically-imported module bundles          |

If you need runtime Module Federation in v2.x, that concern has moved out of `@vc-shell/config-generator` entirely — see the [Related](#related) section below.

**Before** (v1.x):

```typescript
// vite.config.ts
import { getDynamicModuleConfiguration } from "@vc-shell/config-generator";

export default getDynamicModuleConfiguration({
  compatibility: {
    framework: "^1.1.0",
    modules: { "@vc-shell/module-catalog": "^1.0.0" },
  },
  entry: "./src/modules/index.ts",
  externals: ["some-peer-dep"],
});
```

**After** (v2.x):

```typescript
import { getModulesLibraryConfiguration } from "@vc-shell/config-generator";

export default getModulesLibraryConfiguration({
  entry: "./index.ts",
  externals: ["some-peer-dep"],
});
```

Framework/module compatibility metadata now lives on the module itself via `defineAppModule()` (see guide [09-define-app-module](./09-define-app-module.md)), not on the Vite build.

## Migration Steps

1. **Rename the import** in each module's `vite.config.ts`:

   ```diff
   -import { getDynamicModuleConfiguration } from "@vc-shell/config-generator";
   +import { getModulesLibraryConfiguration } from "@vc-shell/config-generator";
   ```

2. **Rename the call**:

   ```diff
   -export default getDynamicModuleConfiguration({
   +export default getModulesLibraryConfiguration({
   ```

3. **Remove the `compatibility` field** from the options object. It is no longer accepted by the helper. Move compatibility declarations into the module definition:

   ```typescript
   // src/module.ts
   import { defineAppModule } from "@vc-shell/framework";

   export default defineAppModule({
     id: "my-module",
     compatibility: { framework: "^2.0.0" },
     // ...
   });
   ```

4. **Remove `moduleName`** — UMD builds are gone, so the `moduleName` option has no effect and should be deleted from options.

5. **Update `outDir` if you depended on the old default**. The old default was `dist/packages/modules`; the new default is `dist`. Set it explicitly if publish/consume scripts expect the old path:

   ```typescript
   getModulesLibraryConfiguration({ outDir: "dist/packages/modules" });
   ```

6. **Change `externals` type** — previously `string[]`, now `(string | RegExp)[]`. Existing string arrays still work, but you can now pass regex patterns directly.

7. **Adjust consumers** that imported the module's build output. The new helper produces `<name>.mjs` files (ES format only) in `outDir`, with a single `style.css` for all CSS. There is no `manifest.json` and no `remoteEntry.js`. If a host was loading the module via Module Federation `loadRemote()`, switch to a static `import` or migrate to the new MF loader — see below.

8. **Search your codebase** for any remaining references:

   ```bash
   grep -rn "getDynamicModuleConfiguration" .
   grep -rn "remoteEntry\.js"   .
   grep -rn "VcShellDynamicModules" .
   ```

## Behavioral Notes

- **Default externals changed**. The v2 helper externalises `vue`, `vue-router`, `vee-validate`, `vue-i18n`, `lodash-es`, `@vueuse/core`, and `@vc-shell/framework` (all subpath imports). `moment` is no longer in the default list — see [03-moment-to-datefns](./03-moment-to-datefns.md). `/node_modules/` is always externalised.
- **CSS is emitted as a single `style.css`**. `cssCodeSplit` is forced to `false`. Consumers must import this file alongside the module's JS.
- **No manifest, no UMD, no `moduleName`**. The old helper produced a `manifest.json` keyed by `VcShellModule_<pkg-name>`; the new helper produces only ES modules.
- **`getPackageJson()` call is gone**. The v1 helper read `package.json` to stamp the UMD name and log the module identity; the v2 helper does not depend on `package.json` shape.
- **The `compatibility` option used to throw at build time** if `framework` was missing. The v2 helper accepts no compatibility option — misuse is a TypeScript error instead of a runtime throw.
- **Order of option spreading matters**. The new helper strips `entry`, `outDir`, and `externals` from `options` and spreads the remainder over the base Vite config via `mergeConfig`, so any other `UserConfig` keys (plugins, server, resolve, etc.) still apply as before.

## Related

- [09-define-app-module](./09-define-app-module.md) — where `compatibility` metadata now lives.
- [03-moment-to-datefns](./03-moment-to-datefns.md) — `moment` dropped from default externals.
- `framework/core/plugins/modularity/README.md` — host-side setup for runtime module loading via `@vc-shell/mf-host` (`registerRemoteModules`) and `getHostFederationConfig()` on the host's Vite config. Remote modules that still need MF should consult that guide rather than this helper.
