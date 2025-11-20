---
id: vcbadge-prop-isDot
component: VcBadge
type: PROP
complexity: SIMPLE
category: component
tags: [prop, isDot]
title: "VcBadge :isDot prop"
description: "isDot property for VcBadge"
---

# Capability: isDot

## Type
PROP

## Description
Whether to display the badge as a dot without text

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `isDot`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcBadge
    :isDot="isDotValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcBadge } from "@vc-shell/framework";

const isDotValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need whether to display the badge as a dot without text
- Ensure proper error handling
- Follow VC-Shell naming conventions
