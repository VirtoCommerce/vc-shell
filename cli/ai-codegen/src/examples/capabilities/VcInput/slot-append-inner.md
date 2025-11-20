---
id: vcinput-slot-append-inner
component: VcInput
type: SLOT
complexity: MODERATE
category: component
tags: [slot, append-inner]
title: "VcInput #append-inner slot"
description: "append-inner slot for VcInput"
---

# Capability: append-inner

## Type
SLOT

## Description
Custom append-inner slot

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Slots:**
- `append-inner`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcInput>
    <template #append-inner>
      <!-- Custom slot content -->
    </template>
  </VcInput>
</template>

<script setup lang="ts">
import { VcInput } from "@vc-shell/framework";
</script>
```

## Best Practices
- Use this capability when you need custom append-inner slot
- Ensure proper error handling
- Follow VC-Shell naming conventions
