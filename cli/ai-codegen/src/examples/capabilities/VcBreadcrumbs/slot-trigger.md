---
id: vcbreadcrumbs-slot-trigger
component: VcBreadcrumbs
type: SLOT
complexity: MODERATE
category: component
tags: [slot, trigger]
title: "VcBreadcrumbs #trigger slot"
description: "trigger slot for VcBreadcrumbs"
---

# Capability: trigger

## Type
SLOT

## Description
Custom trigger slot

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Slots:**
- `trigger`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcBreadcrumbs>
    <template #trigger>
      <!-- Custom slot content -->
    </template>
  </VcBreadcrumbs>
</template>

<script setup lang="ts">
import { VcBreadcrumbs } from "@vc-shell/framework";
</script>
```

## Best Practices
- Use this capability when you need custom trigger slot
- Ensure proper error handling
- Follow VC-Shell naming conventions
