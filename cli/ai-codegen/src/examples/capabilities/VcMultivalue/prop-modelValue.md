---
id: vcmultivalue-prop-modelValue
component: VcMultivalue
type: PROP
complexity: SIMPLE
category: component
tags: [prop, modelValue]
title: "VcMultivalue :modelValue prop"
description: "modelValue property for VcMultivalue"
---

# Capability: modelValue

## Type
PROP

## Description
Array of selected values

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `modelValue`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcMultivalue
    :modelValue="modelValueValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcMultivalue } from "@vc-shell/framework";

const modelValueValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need array of selected values
- Ensure proper error handling
- Follow VC-Shell naming conventions
