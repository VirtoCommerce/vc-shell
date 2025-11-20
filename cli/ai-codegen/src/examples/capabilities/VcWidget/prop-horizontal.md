---
id: vcwidget-prop-horizontal
component: VcWidget
type: PROP
complexity: SIMPLE
category: component
tags: [prop, horizontal]
title: "VcWidget :horizontal prop"
description: "horizontal property for VcWidget"
---

# Capability: horizontal

## Type
PROP

## Description
Whether to arrange the widget horizontally

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `horizontal`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcWidget
    :horizontal="horizontalValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcWidget } from "@vc-shell/framework";

const horizontalValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need whether to arrange the widget horizontally
- Ensure proper error handling
- Follow VC-Shell naming conventions
