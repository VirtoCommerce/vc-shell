# Module Registration Guide

After generating a VC-Shell module, **AI automatically registers it** in your application's `main.ts` file.

## Automatic Registration

When you generate a module with AI (via MCP), it automatically:

1. **Creates module structure** - All files including `index.ts`
2. **Registers in main.ts** - Adds import and `.use()` call
3. **No manual steps required** - Everything is done for you!

## What Gets Generated

The CLI/AI automatically creates:

1. **Module index.ts** - `src/modules/{module}/index.ts`:
```typescript
import * as pages from "./pages";
import * as locales from "./locales";
import { createAppModule } from "@vc-shell/framework";

export default createAppModule(pages, locales);

export * from "./pages";
export * from "./composables";
```

2. **Automatic main.ts update** - AI edits `src/main.ts` to register the module

## How AI Registers Modules

When you use Cursor with MCP and ask AI to generate a module, it:

1. **Reads** your current `src/main.ts`
2. **Adds** import statement at the top:
   ```typescript
   import VendorManagementModule from "./modules/vendor-management";
   ```
3. **Inserts** `.use()` call before `.use(router)`:
   ```typescript
   .use(VendorManagementModule, { router })
   ```
4. **Saves** the updated file

**You don't need to do anything manually!**

## Manual Registration Steps (If Needed)

### Step 1: Import the Module

Add the import at the top of `src/main.ts`:

```typescript
import {ModuleName}Module from "./modules/{module-name}";
```

**Example:**
```typescript
import VendorManagementModule from "./modules/vendor-management";
import ProductsModule from "./modules/products";
import OrdersModule from "./modules/orders";
```

### Step 2: Register with Router

Add `.use()` call **before** `.use(router)`:

```typescript
const app = createApp(RouterView)
  .use(VirtoShellFramework, { /* ... */ })
  .use(VendorManagementModule, { router })  // ← Add this
  .use(router);
```

## Complete main.ts Example

```typescript
import VirtoShellFramework, { notification, useUser, useLanguages } from "@vc-shell/framework";
import { createApp } from "vue";
import { router } from "./router";
import * as locales from "./locales";
import { RouterView } from "vue-router";
import { bootstrap } from "./bootstrap";

// Import your generated modules
import VendorManagementModule from "./modules/vendor-management";
import ProductsModule from "./modules/products";

// Load required CSS
import "@vc-shell/framework/dist/index.css";

async function startApp() {
  const { loadUser } = useUser();

  try {
    await loadUser();
  } catch (e) {
    console.log(e);
  }

  const { currentLocale, setLocale } = useLanguages();

  const app = createApp(RouterView)
    .use(VirtoShellFramework, {
      router,
      i18n: {
        locale: import.meta.env.APP_I18N_LOCALE,
        fallbackLocale: import.meta.env.APP_I18N_FALLBACK_LOCALE,
      },
    })
    // Register modules here (before .use(router))
    .use(VendorManagementModule, { router })
    .use(ProductsModule, { router })
    .use(router);

  bootstrap(app);

  Object.entries(locales).forEach(([key, message]) => {
    app.config.globalProperties.$mergeLocaleMessage(key, message);
  });

  setLocale(currentLocale.value);

  app.config.errorHandler = (err) => {
    notification.error((err as Error).toString(), {
      timeout: 5000,
    });
  };

  await router.isReady();

  app.mount("#app");
}

startApp();
```

## Common Mistakes

### ❌ Wrong: Registering after router

```typescript
const app = createApp(RouterView)
  .use(VirtoShellFramework, { /* ... */ })
  .use(router)
  .use(VendorManagementModule, { router });  // ← Too late!
```

**Problem**: Router is already initialized, module routes won't be added.

### ✅ Correct: Register before router

```typescript
const app = createApp(RouterView)
  .use(VirtoShellFramework, { /* ... */ })
  .use(VendorManagementModule, { router })  // ← Register first
  .use(router);
```

### ❌ Wrong: Missing router parameter

```typescript
.use(VendorManagementModule)  // ← Missing { router }
```

**Problem**: Module won't register its routes.

### ✅ Correct: Pass router object

```typescript
.use(VendorManagementModule, { router })
```

## Module Export Pattern

Your module's `index.ts` must follow this pattern:

```typescript
import * as pages from "./pages";
import * as locales from "./locales";
import { createAppModule } from "@vc-shell/framework";

// Default export is the module itself
export default createAppModule(pages, locales);

// Named exports for direct access
export * from "./pages";
export * from "./composables";
```

This allows:
- **Default import**: `import VendorModule from "./modules/vendor"`
- **Named imports**: `import { VendorList, useVendorList } from "./modules/vendor"`

## Verification

After registration, verify the module is loaded:

1. **Check console**: Look for module initialization logs
2. **Check routes**: Navigate to module's route (e.g., `/vendors`)
3. **Check menu**: Module's menu item should appear (if `menuItem` defined in blade)

## Troubleshooting

### Module routes not working

**Symptoms**:
- 404 when navigating to module routes
- Module blades don't open

**Solution**:
1. Check module is registered **before** `.use(router)`
2. Verify `{ router }` is passed to `.use()`
3. Check blade `defineOptions` has correct `url`

### Module not in menu

**Symptoms**:
- Routes work, but no menu item

**Solution**:
1. Check blade has `isWorkspace: true` in `defineOptions`
2. Verify blade has `menuItem` configuration
3. Check user permissions match blade's `permissions` array

### TypeScript errors

**Symptoms**:
- Import errors for module
- "Cannot find module" error

**Solution**:
1. Verify `index.ts` exists in module directory
2. Check module has proper exports
3. Restart TypeScript server in your IDE

## AI-Powered Registration

When using Cursor with MCP, you can ask:

```
Register vendor-management module in main.ts
```

The AI will:
1. Add the import
2. Add the `.use()` call in correct position
3. Verify the registration is correct

## See Also

- [Generated Structure](../README.md#generated-structure)
- [Quick Start](./QUICKSTART.md)
- [Troubleshooting](./TROUBLESHOOTING.md)

