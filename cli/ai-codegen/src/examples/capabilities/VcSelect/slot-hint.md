---
id: vcselect-slot-hint
component: VcSelect
type: SLOT
complexity: MODERATE
category: component
tags: [slot, hint]
title: "VcSelect #hint slot"
description: "hint slot for VcSelect"
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
  <VcSelect>
    <template #hint>
      <!-- Custom slot content -->
    </template>
  </VcSelect>
</template>

<script setup lang="ts">
import { VcSelect } from "@vc-shell/framework";
</script>
```

## Best Practices
- Use this capability when you need custom hint slot
- Ensure proper error handling
- Follow VC-Shell naming conventions
