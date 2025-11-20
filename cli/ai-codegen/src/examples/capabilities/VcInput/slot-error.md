---
id: vcinput-slot-error
component: VcInput
type: SLOT
complexity: MODERATE
category: component
tags: [slot, error]
title: "VcInput #error slot"
description: "error slot for VcInput"
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
  <VcInput>
    <template #error>
      <!-- Custom slot content -->
    </template>
  </VcInput>
</template>

<script setup lang="ts">
import { VcInput } from "@vc-shell/framework";
</script>
```

## Best Practices
- Use this capability when you need custom error slot
- Ensure proper error handling
- Follow VC-Shell naming conventions
