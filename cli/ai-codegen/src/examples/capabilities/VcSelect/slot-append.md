---
id: vcselect-slot-append
component: VcSelect
type: SLOT
complexity: MODERATE
category: component
tags: [slot, append]
title: "VcSelect #append slot"
description: "append slot for VcSelect"
---

# Capability: append

## Type
SLOT

## Description
Custom append slot

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Slots:**
- `append`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcSelect>
    <template #append>
      <!-- Custom slot content -->
    </template>
  </VcSelect>
</template>

<script setup lang="ts">
import { VcSelect } from "@vc-shell/framework";
</script>
```

## Best Practices
- Use this capability when you need custom append slot
- Ensure proper error handling
- Follow VC-Shell naming conventions
