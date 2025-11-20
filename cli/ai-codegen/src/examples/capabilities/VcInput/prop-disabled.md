---
id: vcinput-prop-disabled
component: VcInput
type: PROP
complexity: SIMPLE
category: component
tags: [prop, disabled]
title: "VcInput :disabled prop"
description: "disabled property for VcInput"
---

# Capability: disabled

## Type
PROP

## Description
Disables the input

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
  <VcInput
    :disabled="disabledValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcInput } from "@vc-shell/framework";

const disabledValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need disables the input
- Ensure proper error handling
- Follow VC-Shell naming conventions
