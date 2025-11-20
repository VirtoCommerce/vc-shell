---
id: vcslider-prop-slidesPerView
component: VcSlider
type: PROP
complexity: SIMPLE
category: component
tags: [prop, slidesPerView]
title: "VcSlider :slidesPerView prop"
description: "slidesPerView property for VcSlider"
---

# Capability: slidesPerView

## Type
PROP

## Description
Number of slides visible simultaneously

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `slidesPerView`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcSlider
    :slidesPerView="slidesPerViewValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcSlider } from "@vc-shell/framework";

const slidesPerViewValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need number of slides visible simultaneously
- Ensure proper error handling
- Follow VC-Shell naming conventions
