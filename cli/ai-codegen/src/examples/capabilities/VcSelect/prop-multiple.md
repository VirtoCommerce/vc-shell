---
id: vcselect-prop-multiple
component: VcSelect
type: PROP
complexity: SIMPLE
category: component
tags: [prop, multiple]
title: "VcSelect :multiple prop"
description: "multiple property for VcSelect"
---

# Capability: multiple

## Type
PROP

## Description
Allow selecting multiple values

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `multiple`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcSelect
    :multiple="multipleValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcSelect } from "@vc-shell/framework";

const multipleValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need allow selecting multiple values
- Ensure proper error handling
- Follow VC-Shell naming conventions
