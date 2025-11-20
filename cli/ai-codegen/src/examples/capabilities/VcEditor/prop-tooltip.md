---
id: vceditor-prop-tooltip
component: VcEditor
type: PROP
complexity: SIMPLE
category: component
tags: [prop, tooltip]
title: "VcEditor :tooltip prop"
description: "tooltip property for VcEditor"
---

# Capability: tooltip

## Type
PROP

## Description
Tooltip text for the editor label

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
  <VcEditor
    :tooltip="tooltipValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcEditor } from "@vc-shell/framework";

const tooltipValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need tooltip text for the editor label
- Ensure proper error handling
- Follow VC-Shell naming conventions
