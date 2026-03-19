# 04. Window Globals Removed

## What Changed

In v1.x, the framework set several globals on `window` during import:

```typescript
// These assignments have been REMOVED in v2.0.0
window.VcShellFramework = { ...components, ...composables, ... };
window.Vue = Vue;
window.VueRouter = VueRouter;
window.moment = moment;
window.VueI18n = VueI18n;
window._ = lodash;
window.VueUse = VueUse;
window.VeeValidate = VeeValidate;
```

**All of these are gone in v2.0.0.**

## Who Is Affected

This change primarily affects **dynamically loaded modules** (loaded at runtime via the platform's module system). These modules relied on `window.Vue`, `window._`, etc. being available as implicit globals instead of bundling their own dependencies.

**Static modules** (imported directly in your app's source code) are **not affected** — they use standard ES imports.

## Migration

### For dynamically loaded modules

Dynamic modules must now bundle their own dependencies or use import maps:

**Option A: Bundle dependencies** (recommended for new modules)

Configure your module's Vite build to include Vue and other dependencies:

```typescript
// vite.config.ts for a dynamic module
export default {
  build: {
    rollupOptions: {
      external: ["vue", "vue-router", "@vc-shell/framework"],
      // ↑ Still externalize these — the host app provides them
    },
  },
};
```

**Option B: Import maps** (for compatibility with existing module infrastructure)

In your host app's `index.html`, declare import maps so dynamic imports resolve to the host's bundled versions:

```html
<script type="importmap">
{
  "imports": {
    "vue": "/assets/vue.js",
    "vue-router": "/assets/vue-router.js"
  }
}
</script>
```

### For app code using `window._` or `window.moment`

Replace with direct imports:

```typescript
// Before
const result = window._.uniq(items);

// After
import { uniq } from "lodash-es";
const result = uniq(items);
```

```typescript
// Before
const date = window.moment(value).format("LLL");

// After — see 03-moment-to-datefns.md
import { formatDateWithPattern } from "@vc-shell/framework";
const date = formatDateWithPattern(value, "LLL");
```

## How to Find

```bash
grep -rn "window\.Vue\b\|window\.VueRouter\|window\.moment\|window\.VcShellFramework\|window\._\b\|window\.VeeValidate\|window\.VueUse\|window\.VueI18n" src/
```
