# 01. Updating package.json

## Dependency Version Updates

Update the following in your application's `package.json`:

```diff
 "dependencies": {
-  "@vc-shell/framework": "^1.2.3",
+  "@vc-shell/framework": "^2.0.0",
+  "vue": "^3.5.13",
+  "vue-router": "^5.0.3",
 },
 "devDependencies": {
-  "vite": "5.3.6",
+  "vite": "^6.3.3",
-  "@vitejs/plugin-vue": "5.0.3",
+  "@vitejs/plugin-vue": "^5.2.3",
-  "vue-tsc": "^1.8.27",
+  "vue-tsc": "^3.2.5",
-  "sass": "^1.69.6",
+  "sass": "^1.87.0",
-  "typescript": "~5.3.3",
+  "typescript": "^5.8.3",
 }
```

### vue and vue-router are now peer dependencies

In v1.x, `vue` and `vue-router` were bundled as direct dependencies of the framework. In v2.0.0 they are **peer dependencies** — your app must declare them explicitly:

```jsonc
// package.json
"dependencies": {
  "vue": "^3.5.13",       // Required — peer range: >=3.4.0
  "vue-router": "^5.0.3", // Required — peer range: >=4.2.0 (current major is 5)
}
```

The framework declares these as:

```jsonc
// @vc-shell/framework peerDependencies
"vue": ">=3.4.0",
"vue-router": ">=4.2.0"
```

The peer range for `vue-router` is intentionally wide and accepts both 4.x and 5.x, but v2.0 of the framework is developed and tested against **vue-router 5** — use `^5.0.3` in your app. If you already had `vue` and `vue-router` in your dependencies (most apps do), bump to these versions.

## Remove Obsolete Packages

```bash
yarn remove @fortawesome/fontawesome-free roboto-fontface
```

These are no longer needed — the framework loads fonts and icons internally. See [05-icons.md](./05-icons.md) for icon migration.

## Remove Obsolete Package

`moment` is no longer a dependency. If your app imported it transitively through the framework, you'll need to either:
- Remove moment usage entirely (recommended) — see [03-moment-to-datefns.md](./03-moment-to-datefns.md)
- Or add `moment` as your own direct dependency if you still need it

## G13: Wildcard `"./*"` export removed — deep imports no longer work

In v1.2.3, `@vc-shell/framework`'s `package.json` included a catch-all export:

```jsonc
// v1.2.3 framework/package.json (removed in v2)
"exports": {
  ".": { "import": "./dist/framework.js", "types": "./dist/index.d.ts" },
  "./tailwind.config": "./tailwind.config.ts",
  "./*": "./*"   // <-- removed in v2
}
```

This allowed consumers to reach into the package with deep imports like:

```ts
// No longer works in v2
import { useBlade } from "@vc-shell/framework/core/composables/useBlade";
import SomeComponent from "@vc-shell/framework/ui/components/organisms/vc-blade/vc-blade.vue";
```

In v2 the `"./*"` wildcard is gone. Only these subpath entries are exported:

- `@vc-shell/framework` — main entry
- `@vc-shell/framework/ui`
- `@vc-shell/framework/ai-agent`
- `@vc-shell/framework/extensions`
- `@vc-shell/framework/globals`
- `@vc-shell/framework/locales/en`
- `@vc-shell/framework/locales/de`
- `@vc-shell/framework/locales/types`
- `@vc-shell/framework/tailwind.config`
- `@vc-shell/framework/dist/index.css`

Any deep import outside this list will fail with `ERR_PACKAGE_PATH_NOT_EXPORTED` under Node's ESM resolver (and bundlers that respect `exports`). Migrate to the named entry points above — most symbols (`useBlade`, injection keys, services, UI components, composables) are re-exported from `@vc-shell/framework` or `@vc-shell/framework/ui`.

```diff
-import { useBlade } from "@vc-shell/framework/core/composables/useBlade";
+import { useBlade } from "@vc-shell/framework";
```

## Update All @vc-shell Packages

All packages from the `@vc-shell` scope should be updated to match the v2 release:

```bash
yarn up "@vc-shell/*"
```

## After Updating

Run:

```bash
yarn install
```

Then proceed to [03-moment-to-datefns.md](./03-moment-to-datefns.md) or the [migration index](./README.md).
