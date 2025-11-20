---
id: vcwidget-prop-value
component: VcWidget
type: PROP
complexity: SIMPLE
category: component
tags: [prop, value]
title: "VcWidget :value prop"
description: "value property for VcWidget"
---

# Capability: value

## Type
PROP

## Description
Value to display as a badge count (truncated at 99+)

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `value`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcWidget
    :value="valueValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcWidget } from "@vc-shell/framework";

const valueValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need value to display as a badge count (truncated at 99+)
- Ensure proper error handling
- Follow VC-Shell naming conventions
