---
id: vcblade-slot-backButton
component: VcBlade
type: SLOT
complexity: MODERATE
category: component
tags: [slot, backButton]
title: "VcBlade #backButton slot"
description: "backButton slot for VcBlade"
---

# Capability: backButton

## Type
SLOT

## Description
Custom back button for mobile view

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Slots:**
- `backButton`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
MEDIUM

## Complete Working Example
```vue
<template>
  <VcBlade>
    <template #backButton>
      <!-- Custom slot content -->
    </template>
  </VcBlade>
</template>

<script setup lang="ts">
import { VcBlade } from "@vc-shell/framework";
</script>
```

## Best Practices
- Use this capability when you need custom back button for mobile view
- Ensure proper error handling
- Follow VC-Shell naming conventions
