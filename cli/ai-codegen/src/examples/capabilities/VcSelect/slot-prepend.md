---
id: vcselect-slot-prepend
component: VcSelect
type: SLOT
complexity: MODERATE
category: component
tags: [slot, prepend]
title: "VcSelect #prepend slot"
description: "prepend slot for VcSelect"
---

# Capability: prepend

## Type
SLOT

## Description
Custom prepend slot

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Slots:**
- `prepend`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <!-- @vue-generic {string} -->
  <VcSelect>
    <template #prepend>
      <!-- Custom slot content -->
    </template>
  </VcSelect>
</template>

<script setup lang="ts">
import { VcSelect } from "@vc-shell/framework";
</script>
```

## Best Practices
- Use this capability when you need custom prepend slot
- Ensure proper error handling
- Follow VC-Shell naming conventions
