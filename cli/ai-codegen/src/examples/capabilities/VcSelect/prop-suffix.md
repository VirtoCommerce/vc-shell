---
id: vcselect-prop-suffix
component: VcSelect
type: PROP
complexity: SIMPLE
category: component
tags: [prop, suffix]
title: "VcSelect :suffix prop"
description: "suffix property for VcSelect"
---

# Capability: suffix

## Type
PROP

## Description
Suffix text inside the select field

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `suffix`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcSelect
    :suffix="suffixValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcSelect } from "@vc-shell/framework";

const suffixValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need suffix text inside the select field
- Ensure proper error handling
- Follow VC-Shell naming conventions
