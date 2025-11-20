---
id: vcmultivalue-prop-optionValue
component: VcMultivalue
type: PROP
complexity: SIMPLE
category: component
tags: [prop, optionValue]
title: "VcMultivalue :optionValue prop"
description: "optionValue property for VcMultivalue"
---

# Capability: optionValue

## Type
PROP

## Description
Property name to use as the option value

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `optionValue`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcMultivalue
    :optionValue="optionValueValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcMultivalue } from "@vc-shell/framework";

const optionValueValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need property name to use as the option value
- Ensure proper error handling
- Follow VC-Shell naming conventions
