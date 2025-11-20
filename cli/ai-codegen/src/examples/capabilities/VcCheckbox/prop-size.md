---
id: vccheckbox-prop-size
component: VcCheckbox
type: PROP
complexity: SIMPLE
category: component
tags: [prop, size]
title: "VcCheckbox :size prop"
description: "size property for VcCheckbox"
---

# Capability: size

## Type
PROP

## Description
Size of the checkbox

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
  <VcCheckbox
    :size="sizeValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcCheckbox } from "@vc-shell/framework";

const sizeValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need size of the checkbox
- Ensure proper error handling
- Follow VC-Shell naming conventions
