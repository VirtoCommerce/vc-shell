---
id: vcslider-prop-slides
component: VcSlider
type: PROP
complexity: SIMPLE
category: component
tags: [prop, slides]
title: "VcSlider :slides prop"
description: "slides property for VcSlider"
---

# Capability: slides

## Type
PROP

## Description
Array of objects representing slides to display

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `slides`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcSlider
    :slides="slidesValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcSlider } from "@vc-shell/framework";

const slidesValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need array of objects representing slides to display
- Ensure proper error handling
- Follow VC-Shell naming conventions
