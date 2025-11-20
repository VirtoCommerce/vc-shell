---
id: vcmultivalue-prop-disabled
component: VcMultivalue
type: PROP
complexity: SIMPLE
category: component
tags: [prop, disabled]
title: "VcMultivalue :disabled prop"
description: "disabled property for VcMultivalue"
---

# Capability: disabled

## Type
PROP

## Description
Disables the field

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `disabled`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcMultivalue
    :disabled="disabledValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcMultivalue } from "@vc-shell/framework";

const disabledValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need disables the field
- Ensure proper error handling
- Follow VC-Shell naming conventions
