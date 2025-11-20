---
id: vcselect-slot-selected-item
component: VcSelect
type: SLOT
complexity: MODERATE
category: component
tags: [slot, selected-item]
title: "VcSelect #selected-item slot"
description: "selected-item slot for VcSelect"
---

# Capability: selected-item

## Type
SLOT

## Description
Custom selected-item slot

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Slots:**
- `selected-item`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcSelect>
    <template #selected-item>
      <!-- Custom slot content -->
    </template>
  </VcSelect>
</template>

<script setup lang="ts">
import { VcSelect } from "@vc-shell/framework";
</script>
```

## Best Practices
- Use this capability when you need custom selected-item slot
- Ensure proper error handling
- Follow VC-Shell naming conventions
