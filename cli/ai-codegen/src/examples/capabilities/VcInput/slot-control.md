---
id: vcinput-slot-control
component: VcInput
type: SLOT
complexity: MODERATE
category: component
tags: [slot, control]
title: "VcInput #control slot"
description: "control slot for VcInput"
---

# Capability: control

## Type
SLOT

## Description
Custom control slot

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Slots:**
- `control`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcInput>
    <template #control>
      <!-- Custom slot content -->
    </template>
  </VcInput>
</template>

<script setup lang="ts">
import { VcInput } from "@vc-shell/framework";
</script>
```

## Best Practices
- Use this capability when you need custom control slot
- Ensure proper error handling
- Follow VC-Shell naming conventions
