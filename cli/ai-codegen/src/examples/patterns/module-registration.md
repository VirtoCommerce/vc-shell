---
id: module-registration
type: PATTERN
complexity: MODERATE
pattern_category: general
category: state
critical: true
related_rules: ["09"]
title: "Module Registration Pattern"
description: "Automatic module registration in main.ts (AI_FULL strategy)"
---

# Module Registration Pattern (AI_FULL Strategy)

## Overview

For AI_FULL strategy, module registration is **AUTOMATED** by the system.
DO NOT create bootstrap.ts or use registerModule() manually.

## How It Works

When you submit code via `submit_generated_code`, the system automatically:

1. Parses `main.ts`
2. Adds import statement for your module
3. Inserts `.use(ModuleName, { router })` call
4. Saves the updated file

## What You Should Create

```
src/modules/offers/
├── index.ts              ← Module index with createAppModule()
├── pages/
│   ├── offers-list.vue   ← List blade (with isWorkspace: true)
│   └── offer-details.vue ← Details blade
├── composables/
│   ├── useOffersList.ts
│   └── useOfferDetails.ts
└── locales/
    └── en.json
```

## Module Index (index.ts)

```typescript
// ✅ CORRECT: src/modules/offers/index.ts
import { createAppModule } from "@vc-shell/framework";
import * as pages from "./pages";
import * as locales from "./locales";

export default createAppModule(pages, locales);
```

## System Updates main.ts Automatically

```typescript
// ✅ AUTOMATIC: System updates main.ts
// File: src/main.ts (updated by ModuleRegistrar)
import { createApp } from "vue";
import { RouterView } from "vue-router";
import { VirtoShellFramework } from "@vc-shell/framework";
import OffersModule from "./modules/offers";  // ← Added automatically

const app = createApp(RouterView)
  .use(VirtoShellFramework, { router, i18n })
  .use(OffersModule, { router })  // ← Added automatically
  .use(router);

await router.isReady();
app.mount("#app");
```

## ❌ What NOT to Do

### Don't Create bootstrap.ts

```typescript
// ❌ WRONG: DO NOT create this file!
// File: src/modules/offers/bootstrap.ts
import { registerModule } from "@vc-shell/framework";
import OffersModule from "./index";

export function bootstrap(app: App) {
  registerModule(OffersModule);  // System handles this!
}
```

### Don't Modify main.ts Manually

```typescript
// ❌ WRONG: DO NOT edit main.ts yourself
// System does this automatically after submit_generated_code
```

## Correct Workflow

1. ✅ Create blade components (*.vue)
2. ✅ Create composables (*.ts)
3. ✅ Create module index (index.ts with createAppModule)
4. ✅ Create locales (*.json)
5. ✅ Submit via `submit_generated_code`
6. ✅ **System automatically registers module** - do nothing!

## When is bootstrap.ts Used?

`bootstrap.ts` is ONLY for:
- ✅ Dashboard widgets (`registerDashboardWidget`)
- ✅ Custom application initialization

NOT for module registration!

## See Also

- [Workspace Blade Pattern](workspace-blade.md) - Menu items go in defineOptions
- [Dashboard Widget Registration](widget-registration.md) - Correct use of bootstrap.ts
