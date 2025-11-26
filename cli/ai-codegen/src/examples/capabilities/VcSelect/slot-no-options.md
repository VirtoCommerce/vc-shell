---
id: vcselect-slot-no-options
component: VcSelect
type: SLOT
complexity: MODERATE
category: component
tags: [slot, no-options]
title: "VcSelect #no-options slot"
description: "no-options slot for VcSelect"
---

# Capability: no-options

## Type
SLOT

## Description
Custom no-options slot

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Slots:**
- `no-options`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <!-- @vue-generic {string} -->
  <VcSelect>
    <template #no-options>
      <!-- Custom slot content -->
    </template>
  </VcSelect>
</template>

<script setup lang="ts">
import { VcSelect } from "@vc-shell/framework";
</script>
```

## Best Practices
- Use this capability when you need custom no-options slot
- Ensure proper error handling
- Follow VC-Shell naming conventions
