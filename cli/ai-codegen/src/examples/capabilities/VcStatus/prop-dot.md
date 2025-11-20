---
id: vcstatus-prop-dot
component: VcStatus
type: PROP
complexity: SIMPLE
category: component
tags: [prop, dot]
title: "VcStatus :dot prop"
description: "dot property for VcStatus"
---

# Capability: dot

## Type
PROP

## Description
Whether to display only a colored dot without text

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `dot`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcStatus
    :dot="dotValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcStatus } from "@vc-shell/framework";

const dotValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need whether to display only a colored dot without text
- Ensure proper error handling
- Follow VC-Shell naming conventions
