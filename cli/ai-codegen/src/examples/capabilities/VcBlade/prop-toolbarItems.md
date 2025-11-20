---
id: vcblade-prop-toolbarItems
component: VcBlade
type: PROP
complexity: SIMPLE
category: component
tags: [prop, toolbarItems]
title: "VcBlade :toolbarItems prop"
description: "toolbarItems property for VcBlade"
---

# Capability: toolbarItems

## Type
PROP

## Description
Array of toolbar items to display

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `toolbarItems`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcBlade
    :toolbarItems="toolbarItemsValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcBlade } from "@vc-shell/framework";

const toolbarItemsValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need array of toolbar items to display
- Ensure proper error handling
- Follow VC-Shell naming conventions
