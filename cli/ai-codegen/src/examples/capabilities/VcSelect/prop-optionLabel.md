---
id: vcselect-prop-optionLabel
component: VcSelect
type: PROP
complexity: SIMPLE
category: component
tags: [prop, optionLabel]
title: "VcSelect :optionLabel prop"
description: "optionLabel property for VcSelect"
---

# Capability: optionLabel

## Type
PROP

## Description
Property name or function to get option label

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `optionLabel`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcSelect
    :optionLabel="optionLabelValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcSelect } from "@vc-shell/framework";

const optionLabelValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need property name or function to get option label
- Ensure proper error handling
- Follow VC-Shell naming conventions
