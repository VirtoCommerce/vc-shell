---
id: vcmultivalue-slot-error
component: VcMultivalue
type: SLOT
complexity: MODERATE
category: component
tags: [slot, error]
title: "VcMultivalue #error slot"
description: "error slot for VcMultivalue"
---

# Capability: error

## Type
SLOT

## Description
Custom error slot

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Slots:**
- `error`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcMultivalue>
    <template #error>
      <!-- Custom slot content -->
    </template>
  </VcMultivalue>
</template>

<script setup lang="ts">
import { VcMultivalue } from "@vc-shell/framework";
</script>
```

## Best Practices
- Use this capability when you need custom error slot
- Ensure proper error handling
- Follow VC-Shell naming conventions
