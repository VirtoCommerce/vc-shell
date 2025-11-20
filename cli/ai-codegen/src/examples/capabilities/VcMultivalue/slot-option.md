---
id: vcmultivalue-slot-option
component: VcMultivalue
type: SLOT
complexity: MODERATE
category: component
tags: [slot, option]
title: "VcMultivalue #option slot"
description: "option slot for VcMultivalue"
---

# Capability: option

## Type
SLOT

## Description
Custom option slot

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Slots:**
- `option`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcMultivalue>
    <template #option>
      <!-- Custom slot content -->
    </template>
  </VcMultivalue>
</template>

<script setup lang="ts">
import { VcMultivalue } from "@vc-shell/framework";
</script>
```

## Best Practices
- Use this capability when you need custom option slot
- Ensure proper error handling
- Follow VC-Shell naming conventions
