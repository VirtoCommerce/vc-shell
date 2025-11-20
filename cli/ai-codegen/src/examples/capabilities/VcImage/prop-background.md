---
id: vcimage-prop-background
component: VcImage
type: PROP
complexity: SIMPLE
category: component
tags: [prop, background]
title: "VcImage :background prop"
description: "background property for VcImage"
---

# Capability: background

## Type
PROP

## Description
Background image sizing method

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `background`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcImage
    :background="backgroundValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcImage } from "@vc-shell/framework";

const backgroundValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need background image sizing method
- Ensure proper error handling
- Follow VC-Shell naming conventions
