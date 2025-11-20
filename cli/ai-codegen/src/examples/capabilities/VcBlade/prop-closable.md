---
id: vcblade-prop-closable
component: VcBlade
type: PROP
complexity: SIMPLE
category: component
tags: [prop, closable]
title: "VcBlade :closable prop"
description: "closable property for VcBlade"
---

# Capability: closable

## Type
PROP

## Description
Whether the blade can be closed by the user

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `closable`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcBlade
    :closable="closableValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcBlade } from "@vc-shell/framework";

const closableValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need whether the blade can be closed by the user
- Ensure proper error handling
- Follow VC-Shell naming conventions
