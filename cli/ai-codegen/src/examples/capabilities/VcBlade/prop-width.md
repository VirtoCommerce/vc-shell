---
id: vcblade-prop-width
component: VcBlade
type: PROP
complexity: SIMPLE
category: component
tags: [prop, width]
title: "VcBlade :width prop"
description: "width property for VcBlade"
---

# Capability: width

## Type
PROP

## Description
Width of the blade (can be in pixels or percentage)

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `width`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcBlade
    :width="widthValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcBlade } from "@vc-shell/framework";

const widthValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need width of the blade (can be in pixels or percentage)
- Ensure proper error handling
- Follow VC-Shell naming conventions
