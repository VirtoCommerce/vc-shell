# 20. Vue 3.5, Router 5, vue-tsc 3

## Vue 3.5.30

Minor update — no breaking changes. Update version in `package.json`.

## Vue Router 5

Transition release — **no breaking changes** for standard usage. One deprecation:

### Deprecated: `next()` callback in navigation guards

```diff
-router.beforeEach(async (to, from, next) => {
-  if (!isAuthenticated()) {
-    next({ name: "Login" });
-  } else {
-    next();
-  }
+router.beforeEach(async (to) => {
+  if (!isAuthenticated()) {
+    return { name: "Login" };
+  }
+  // returning undefined = allow navigation
 });
```

Find usages: `grep -rn "beforeEach.*next\|beforeResolve.*next" src/`

## vue-tsc 3

- Requires TypeScript >= 5.0
- May surface new type errors in `.vue` files due to stricter inference
- Run `npx vue-tsc --noEmit` and fix any errors
- CLI interface unchanged — existing build scripts work as-is

## Checklist

```
[ ] Update vue, vue-router, vue-tsc versions
[ ] yarn install
[ ] npx vue-tsc --noEmit — fix new errors
[ ] Search for next() callback in guards — rewrite to return-based
[ ] yarn build — verify production build
```
