---
id: vcinput-slot-prepend
component: VcInput
type: SLOT
complexity: MODERATE
category: component
tags: [slot, prepend]
title: "VcInput #prepend slot"
description: "prepend slot for VcInput"
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
  <VcInput>
    <template #prepend>
      <!-- Custom slot content -->
    </template>
  </VcInput>
</template>

<script setup lang="ts">
import { VcInput } from "@vc-shell/framework";
</script>
```

## Best Practices
- Use this capability when you need custom prepend slot
- Ensure proper error handling
- Follow VC-Shell naming conventions
