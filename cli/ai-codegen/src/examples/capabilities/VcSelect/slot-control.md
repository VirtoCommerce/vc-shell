---
id: vcselect-slot-control
component: VcSelect
type: SLOT
complexity: MODERATE
category: component
tags: [slot, control]
title: "VcSelect #control slot"
description: "control slot for VcSelect"
---

# Capability: control

## Type
SLOT

## Description
Custom control slot

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Slots:**
- `control`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <!-- @vue-generic {string} -->
  <VcSelect>
    <template #control>
      <!-- Custom slot content -->
    </template>
  </VcSelect>
</template>

<script setup lang="ts">
import { VcSelect } from "@vc-shell/framework";
</script>
```

## Best Practices
- Use this capability when you need custom control slot
- Ensure proper error handling
- Follow VC-Shell naming conventions
