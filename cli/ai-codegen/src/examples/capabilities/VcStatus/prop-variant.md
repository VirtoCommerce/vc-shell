---
id: vcstatus-prop-variant
component: VcStatus
type: PROP
complexity: SIMPLE
category: component
tags: [prop, variant]
title: "VcStatus :variant prop"
description: "variant property for VcStatus"
---

# Capability: variant

## Type
PROP

## Description
Visual style of the status indicator

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `variant`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcStatus
    :variant="variantValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcStatus } from "@vc-shell/framework";

const variantValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need visual style of the status indicator
- Ensure proper error handling
- Follow VC-Shell naming conventions
