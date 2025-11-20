---
id: vclink-prop-active
component: VcLink
type: PROP
complexity: SIMPLE
category: component
tags: [prop, active]
title: "VcLink :active prop"
description: "active property for VcLink"
---

# Capability: active

## Type
PROP

## Description
Sets the link to active state

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `active`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcLink
    :active="activeValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcLink } from "@vc-shell/framework";

const activeValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need sets the link to active state
- Ensure proper error handling
- Follow VC-Shell naming conventions
