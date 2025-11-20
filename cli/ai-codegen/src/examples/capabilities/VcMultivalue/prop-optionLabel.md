---
id: vcmultivalue-prop-optionLabel
component: VcMultivalue
type: PROP
complexity: SIMPLE
category: component
tags: [prop, optionLabel]
title: "VcMultivalue :optionLabel prop"
description: "optionLabel property for VcMultivalue"
---

# Capability: optionLabel

## Type
PROP

## Description
Property name to use as the option label

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
  <VcMultivalue
    :optionLabel="optionLabelValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcMultivalue } from "@vc-shell/framework";

const optionLabelValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need property name to use as the option label
- Ensure proper error handling
- Follow VC-Shell naming conventions
