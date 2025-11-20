---
id: vcblade-slot-actions
component: VcBlade
type: SLOT
complexity: MODERATE
category: component
tags: [slot, actions]
title: "VcBlade #actions slot"
description: "actions slot for VcBlade"
---

# Capability: actions

## Type
SLOT

## Description
Custom actions slot

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Slots:**
- `actions`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcBlade>
    <template #actions>
      <!-- Custom slot content -->
    </template>
  </VcBlade>
</template>

<script setup lang="ts">
import { VcBlade } from "@vc-shell/framework";
</script>
```

## Best Practices
- Use this capability when you need custom actions slot
- Ensure proper error handling
- Follow VC-Shell naming conventions
