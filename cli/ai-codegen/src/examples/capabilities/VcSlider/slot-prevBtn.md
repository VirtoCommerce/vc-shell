---
id: vcslider-slot-prevBtn
component: VcSlider
type: SLOT
complexity: MODERATE
category: component
tags: [slot, prevBtn]
title: "VcSlider #prevBtn slot"
description: "prevBtn slot for VcSlider"
---

# Capability: prevBtn

## Type
SLOT

## Description
Custom prevBtn slot

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Slots:**
- `prevBtn`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcSlider>
    <template #prevBtn>
      <!-- Custom slot content -->
    </template>
  </VcSlider>
</template>

<script setup lang="ts">
import { VcSlider } from "@vc-shell/framework";
</script>
```

## Best Practices
- Use this capability when you need custom prevbtn slot
- Ensure proper error handling
- Follow VC-Shell naming conventions
