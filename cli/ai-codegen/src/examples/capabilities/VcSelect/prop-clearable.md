---
id: vcselect-prop-clearable
component: VcSelect
type: PROP
complexity: SIMPLE
category: component
tags: [prop, clearable]
title: "VcSelect :clearable prop"
description: "clearable property for VcSelect"
---

# Capability: clearable

## Type
PROP

## Description
Whether the value can be cleared

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `clearable`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <!-- @vue-generic {IOffer} -->
  <VcSelect
    :clearable="clearableValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcSelect } from "@vc-shell/framework";

const clearableValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need whether the value can be cleared
- Ensure proper error handling
- Follow VC-Shell naming conventions
