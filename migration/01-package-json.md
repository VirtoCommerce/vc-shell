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
  "vue": "^3.5.13",       // Required — was implicit before
  "vue-router": "^5.0.3", // Required — was implicit before
}
```

If you already had `vue` and `vue-router` in your dependencies (most apps do), just update the version.

## Remove Obsolete Packages

```bash
yarn remove @fortawesome/fontawesome-free roboto-fontface
```

These are no longer needed — the framework loads fonts and icons internally. See [05-icons.md](./05-icons.md) for icon migration.

## Remove Obsolete Package

`moment` is no longer a dependency. If your app imported it transitively through the framework, you'll need to either:
- Remove moment usage entirely (recommended) — see [03-moment-to-datefns.md](./03-moment-to-datefns.md)
- Or add `moment` as your own direct dependency if you still need it

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

Then proceed to [02-css-import.md](./02-css-import.md).
