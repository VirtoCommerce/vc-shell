---
id: vctextarea-prop-tooltip
component: VcTextarea
type: PROP
complexity: SIMPLE
category: component
tags: [prop, tooltip]
title: "VcTextarea :tooltip prop"
description: "tooltip property for VcTextarea"
---

# Capability: tooltip

## Type
PROP

## Description
Tooltip text for additional information

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
  <VcTextarea
    :tooltip="tooltipValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcTextarea } from "@vc-shell/framework";

const tooltipValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need tooltip text for additional information
- Ensure proper error handling
- Follow VC-Shell naming conventions
