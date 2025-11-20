---
id: vcselect-prop-prefix
component: VcSelect
type: PROP
complexity: SIMPLE
category: component
tags: [prop, prefix]
title: "VcSelect :prefix prop"
description: "prefix property for VcSelect"
---

# Capability: prefix

## Type
PROP

## Description
Prefix text inside the select field

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `prefix`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcSelect
    :prefix="prefixValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcSelect } from "@vc-shell/framework";

const prefixValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need prefix text inside the select field
- Ensure proper error handling
- Follow VC-Shell naming conventions
