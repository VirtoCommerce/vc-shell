---
id: vcstatus-prop-outline
component: VcStatus
type: PROP
complexity: SIMPLE
category: component
tags: [prop, outline]
title: "VcStatus :outline prop"
description: "outline property for VcStatus"
---

# Capability: outline

## Type
PROP

## Description
**DEPRECATED**: Whether to show only the outline

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
  <VcStatus
    :outline="outlineValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcStatus } from "@vc-shell/framework";

const outlineValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need **deprecated**: whether to show only the outline
- Ensure proper error handling
- Follow VC-Shell naming conventions
