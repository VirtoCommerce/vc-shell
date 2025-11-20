---
id: vcslider-prop-spaceBetweenSlides
component: VcSlider
type: PROP
complexity: SIMPLE
category: component
tags: [prop, spaceBetweenSlides]
title: "VcSlider :spaceBetweenSlides prop"
description: "spaceBetweenSlides property for VcSlider"
---

# Capability: spaceBetweenSlides

## Type
PROP

## Description
Space between slides in pixels

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `spaceBetweenSlides`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcSlider
    :spaceBetweenSlides="spaceBetweenSlidesValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcSlider } from "@vc-shell/framework";

const spaceBetweenSlidesValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need space between slides in pixels
- Ensure proper error handling
- Follow VC-Shell naming conventions
