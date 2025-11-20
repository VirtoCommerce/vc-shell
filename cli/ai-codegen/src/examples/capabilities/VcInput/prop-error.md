---
id: vcinput-prop-error
component: VcInput
type: PROP
complexity: SIMPLE
category: component
tags: [prop, error]
title: "VcInput :error prop"
description: "error property for VcInput"
---

# Capability: error

## Type
PROP

## Description
Indicates an error state for the input

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
  <VcInput
    :error="errorValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcInput } from "@vc-shell/framework";

const errorValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need indicates an error state for the input
- Ensure proper error handling
- Follow VC-Shell naming conventions
