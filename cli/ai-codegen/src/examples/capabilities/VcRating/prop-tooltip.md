---
id: vcrating-prop-tooltip
component: VcRating
type: PROP
complexity: SIMPLE
category: component
tags: [prop, tooltip]
title: "VcRating :tooltip prop"
description: "tooltip property for VcRating"
---

# Capability: tooltip

## Type
PROP

## Description
Additional tooltip information

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
  <VcRating
    :tooltip="tooltipValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcRating } from "@vc-shell/framework";

const tooltipValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need additional tooltip information
- Ensure proper error handling
- Follow VC-Shell naming conventions
