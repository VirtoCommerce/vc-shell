---
id: vctooltip-slot-tooltip
component: VcTooltip
type: SLOT
complexity: MODERATE
category: component
tags: [slot, tooltip]
title: "VcTooltip #tooltip slot"
description: "tooltip slot for VcTooltip"
---

# Capability: tooltip

## Type
SLOT

## Description
Custom tooltip slot

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Slots:**
- `tooltip`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcTooltip>
    <template #tooltip>
      <!-- Custom slot content -->
    </template>
  </VcTooltip>
</template>

<script setup lang="ts">
import { VcTooltip } from "@vc-shell/framework";
</script>
```

## Best Practices
- Use this capability when you need custom tooltip slot
- Ensure proper error handling
- Follow VC-Shell naming conventions
