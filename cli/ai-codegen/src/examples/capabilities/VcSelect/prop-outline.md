---
id: vcselect-prop-outline
component: VcSelect
type: PROP
complexity: SIMPLE
category: component
tags: [prop, outline]
title: "VcSelect :outline prop"
description: "outline property for VcSelect"
---

# Capability: outline

## Type
PROP

## Description
Whether to show an outline around the select

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `outline`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcSelect
    :outline="outlineValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcSelect } from "@vc-shell/framework";

const outlineValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need whether to show an outline around the select
- Ensure proper error handling
- Follow VC-Shell naming conventions
