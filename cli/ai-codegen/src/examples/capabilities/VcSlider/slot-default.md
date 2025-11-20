---
id: vcslider-slot-default
component: VcSlider
type: SLOT
complexity: MODERATE
category: component
tags: [slot, default]
title: "VcSlider #default slot"
description: "default slot for VcSlider"
---

# Capability: default

## Type
SLOT

## Description
`{ slide: Object }`

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Slots:**
- `default`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
MEDIUM

## Complete Working Example
```vue
<template>
  <VcSlider>
    <template #default>
      <!-- Custom slot content -->
    </template>
  </VcSlider>
</template>

<script setup lang="ts">
import { VcSlider } from "@vc-shell/framework";
</script>
```

## Best Practices
- Use this capability when you need `{ slide: object }`
- Ensure proper error handling
- Follow VC-Shell naming conventions
