---
id: vcinput-slot-prepend-inner
component: VcInput
type: SLOT
complexity: MODERATE
category: component
tags: [slot, prepend-inner]
title: "VcInput #prepend-inner slot"
description: "prepend-inner slot for VcInput"
---

# Capability: prepend-inner

## Type
SLOT

## Description
Custom prepend-inner slot

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Slots:**
- `prepend-inner`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcInput>
    <template #prepend-inner>
      <!-- Custom slot content -->
    </template>
  </VcInput>
</template>

<script setup lang="ts">
import { VcInput } from "@vc-shell/framework";
</script>
```

## Best Practices
- Use this capability when you need custom prepend-inner slot
- Ensure proper error handling
- Follow VC-Shell naming conventions
