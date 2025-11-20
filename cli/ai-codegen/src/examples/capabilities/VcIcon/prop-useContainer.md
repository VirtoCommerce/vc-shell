---
id: vcicon-prop-useContainer
component: VcIcon
type: PROP
complexity: SIMPLE
category: component
tags: [prop, useContainer]
title: "VcIcon :useContainer prop"
description: "useContainer property for VcIcon"
---

# Capability: useContainer

## Type
PROP

## Description
Whether to wrap the icon in a container for consistent spacing

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `useContainer`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcIcon
    :useContainer="useContainerValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcIcon } from "@vc-shell/framework";

const useContainerValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need whether to wrap the icon in a container for consistent spacing
- Ensure proper error handling
- Follow VC-Shell naming conventions
