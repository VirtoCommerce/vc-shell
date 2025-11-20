---
id: vcblade-slot-widgets
component: VcBlade
type: SLOT
complexity: MODERATE
category: component
tags: [slot, widgets]
title: "VcBlade #widgets slot"
description: "widgets slot for VcBlade"
---

# Capability: widgets

## Type
SLOT

## Description
**Deprecated**. Use `useWidgets()` composable instead. Slot for blade widgets.

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Slots:**
- `widgets`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
MEDIUM

## Complete Working Example
```vue
<template>
  <VcBlade>
    <template #widgets>
      <!-- Custom slot content -->
    </template>
  </VcBlade>
</template>

<script setup lang="ts">
import { VcBlade } from "@vc-shell/framework";
</script>
```

## Best Practices
- Use this capability when you need **deprecated**. use `usewidgets()` composable instead. slot for blade widgets.
- Ensure proper error handling
- Follow VC-Shell naming conventions
