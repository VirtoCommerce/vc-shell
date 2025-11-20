---
id: vcmultivalue-prop-error
component: VcMultivalue
type: PROP
complexity: SIMPLE
category: component
tags: [prop, error]
title: "VcMultivalue :error prop"
description: "error property for VcMultivalue"
---

# Capability: error

## Type
PROP

## Description
Indicates an error state

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `error`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcMultivalue
    :error="errorValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcMultivalue } from "@vc-shell/framework";

const errorValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need indicates an error state
- Ensure proper error handling
- Follow VC-Shell naming conventions
