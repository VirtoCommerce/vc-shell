---
id: vcwidget-prop-icon
component: VcWidget
type: PROP
complexity: SIMPLE
category: component
tags: [prop, icon]
title: "VcWidget :icon prop"
description: "icon property for VcWidget"
---

# Capability: icon

## Type
PROP

## Description
Icon to display in the widget

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `icon`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcWidget
    :icon="iconValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcWidget } from "@vc-shell/framework";

const iconValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need icon to display in the widget
- Ensure proper error handling
- Follow VC-Shell naming conventions
