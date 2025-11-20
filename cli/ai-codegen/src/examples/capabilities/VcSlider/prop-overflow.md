---
id: vcslider-prop-overflow
component: VcSlider
type: PROP
complexity: SIMPLE
category: component
tags: [prop, overflow]
title: "VcSlider :overflow prop"
description: "overflow property for VcSlider"
---

# Capability: overflow

## Type
PROP

## Description
Allows slides to be visible outside the container

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `overflow`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcSlider
    :overflow="overflowValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcSlider } from "@vc-shell/framework";

const overflowValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need allows slides to be visible outside the container
- Ensure proper error handling
- Follow VC-Shell naming conventions
