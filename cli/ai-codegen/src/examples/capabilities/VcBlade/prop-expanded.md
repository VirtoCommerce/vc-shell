---
id: vcblade-prop-expanded
component: VcBlade
type: PROP
complexity: SIMPLE
category: component
tags: [prop, expanded]
title: "VcBlade :expanded prop"
description: "expanded property for VcBlade"
---

# Capability: expanded

## Type
PROP

## Description
Whether the blade is expanded to full width. If not provided, defaults to `false`.

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `expanded`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcBlade
    :expanded="expandedValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcBlade } from "@vc-shell/framework";

const expandedValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need whether the blade is expanded to full width. if not provided, defaults to `false`.
- Ensure proper error handling
- Follow VC-Shell naming conventions
