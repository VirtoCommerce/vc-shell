---
id: useBlade-blade-context-access
type: FRAMEWORK_API
category: composable
tags: [composable, blade, context, metadata]
complexity: SIMPLE
title: "useBlade - Access Blade Context"
description: "Access current blade instance properties and metadata"
---

# useBlade - Access Blade Context

Access current blade's instance data including id, navigation, state, and metadata.

## Basic Usage

```vue
<script setup lang="ts">
import { useBlade } from "@vc-shell/framework";

const { blade } = useBlade();

// Access blade properties
console.log(blade.value?.id); // Unique blade instance ID
console.log(blade.value?.navigation); // Navigation context and index
console.log(blade.value?.param); // Route param passed to blade
</script>
```

## IBladeInstance Interface

```typescript
interface IBladeInstance {
  id: string;
  expandable: boolean;
  maximized: boolean;
  error: DisplayableError | Error | string | null | undefined;
  navigation: BladeVNode["props"]["navigation"] | undefined;
  breadcrumbs: Breadcrumbs[] | undefined;
  title?: string;
  param?: string;
  options?: Record<string, any>;
}
```

## Common Use Cases

### Access Route Parameter

```typescript
const offerId = computed(() => blade.value?.param as string);
```

### Check Navigation Index

```typescript
const isRootBlade = computed(() => blade.value?.navigation?.idx === 0);
```

## Requirements

- Must be called within blade component context
- Returns reactive `Ref<IBladeInstance>` that updates with blade state
- Blade instance is `undefined` outside blade context
