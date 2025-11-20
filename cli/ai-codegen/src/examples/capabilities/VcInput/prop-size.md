---
id: vcinput-prop-size
component: VcInput
type: PROP
complexity: SIMPLE
category: component
tags: [prop, size]
title: "VcInput :size prop"
description: "size property for VcInput"
---

# Capability: size

## Type
PROP

## Description
Size of the input

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `size`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcInput
    :size="sizeValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcInput } from "@vc-shell/framework";

const sizeValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need size of the input
- Ensure proper error handling
- Follow VC-Shell naming conventions
