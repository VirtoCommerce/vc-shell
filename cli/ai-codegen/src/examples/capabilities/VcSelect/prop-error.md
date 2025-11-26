---
id: vcselect-prop-error
component: VcSelect
type: PROP
complexity: SIMPLE
category: component
tags: [prop, error]
title: "VcSelect :error prop"
description: "error property for VcSelect"
---

# Capability: error

## Type
PROP

## Description
Show the select in error state

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
  <!-- @vue-generic {string} -->
  <VcSelect
    :error="errorValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcSelect } from "@vc-shell/framework";

const errorValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need show the select in error state
- Ensure proper error handling
- Follow VC-Shell naming conventions
