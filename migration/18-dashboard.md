# 18. Dashboard

## What Changed

Static grid dashboard replaced by `DraggableDashboard` with programmatic widget registration.

## Migration

### Step 1: Replace Dashboard.vue

```vue
<!-- src/pages/Dashboard.vue -->
<template>
  <DraggableDashboard />
</template>

<script lang="ts" setup>
import { DraggableDashboard } from "@vc-shell/framework";
</script>
```

### Step 2: Register Widgets in Modules

```typescript
// module/index.ts
import { defineAppModule, registerDashboardWidget } from "@vc-shell/framework";
import { markRaw } from "vue";
import * as components from "./components";

registerDashboardWidget({
  id: "my-module-widget",
  name: "My Module",
  component: markRaw(components.MyDashboardCard),
  size: { width: 6, height: 6 },
});

export default defineAppModule({ blades: pages, locales });
```

## How to Find
```bash
grep -rn "VcRow\|VcCol.*size\|modules\..*components\." src/pages/Dashboard.vue
```
