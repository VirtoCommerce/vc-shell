---
id: vcimage-prop-clickable
component: VcImage
type: PROP
complexity: SIMPLE
category: component
tags: [prop, clickable]
title: "VcImage :clickable prop"
description: "clickable property for VcImage"
---

# Capability: clickable

## Type
PROP

## Description
Whether the image can be clicked, emitting a click event

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `clickable`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcImage
    :clickable="clickableValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcImage } from "@vc-shell/framework";

const clickableValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need whether the image can be clicked, emitting a click event
- Ensure proper error handling
- Follow VC-Shell naming conventions
