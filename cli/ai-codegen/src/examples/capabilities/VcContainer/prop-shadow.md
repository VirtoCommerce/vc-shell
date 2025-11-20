---
id: vccontainer-prop-shadow
component: VcContainer
type: PROP
complexity: SIMPLE
category: component
tags: [prop, shadow]
title: "VcContainer :shadow prop"
description: "shadow property for VcContainer"
---

# Capability: shadow

## Type
PROP

## Description
Whether to show shadows when content is scrollable

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `shadow`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcContainer
    :shadow="shadowValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcContainer } from "@vc-shell/framework";

const shadowValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need whether to show shadows when content is scrollable
- Ensure proper error handling
- Follow VC-Shell naming conventions
