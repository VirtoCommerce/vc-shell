---
id: vcmultivalue-slot-hint
component: VcMultivalue
type: SLOT
complexity: MODERATE
category: component
tags: [slot, hint]
title: "VcMultivalue #hint slot"
description: "hint slot for VcMultivalue"
---

# Capability: hint

## Type
SLOT

## Description
Custom hint slot

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Slots:**
- `hint`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcMultivalue>
    <template #hint>
      <!-- Custom slot content -->
    </template>
  </VcMultivalue>
</template>

<script setup lang="ts">
import { VcMultivalue } from "@vc-shell/framework";
</script>
```

## Best Practices
- Use this capability when you need custom hint slot
- Ensure proper error handling
- Follow VC-Shell naming conventions
