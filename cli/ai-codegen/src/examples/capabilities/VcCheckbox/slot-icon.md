---
id: vccheckbox-slot-icon
component: VcCheckbox
type: SLOT
complexity: MODERATE
category: component
tags: [slot, icon]
title: "VcCheckbox #icon slot"
description: "icon slot for VcCheckbox"
---

# Capability: icon

## Type
SLOT

## Description
Custom icon slot

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Slots:**
- `icon`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcCheckbox>
    <template #icon>
      <!-- Custom slot content -->
    </template>
  </VcCheckbox>
</template>

<script setup lang="ts">
import { VcCheckbox } from "@vc-shell/framework";
</script>
```

## Best Practices
- Use this capability when you need custom icon slot
- Ensure proper error handling
- Follow VC-Shell naming conventions
