---
id: vcselect-prop-tooltip
component: VcSelect
type: PROP
complexity: SIMPLE
category: component
tags: [prop, tooltip]
title: "VcSelect :tooltip prop"
description: "tooltip property for VcSelect"
---

# Capability: tooltip

## Type
PROP

## Description
Tooltip text to display next to the label

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `tooltip`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcSelect
    :tooltip="tooltipValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcSelect } from "@vc-shell/framework";

const tooltipValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need tooltip text to display next to the label
- Ensure proper error handling
- Follow VC-Shell naming conventions
