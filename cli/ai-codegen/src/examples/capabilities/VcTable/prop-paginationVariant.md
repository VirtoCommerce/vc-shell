---
id: vctable-prop-paginationVariant
component: VcTable
type: PROP
complexity: SIMPLE
category: component
tags: [prop, paginationVariant]
title: "VcTable :paginationVariant prop"
description: "paginationVariant property for VcTable"
---

# Capability: paginationVariant

## Type
PROP

## Description
Variant of pagination to use

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `paginationVariant`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcTable
    :paginationVariant="paginationVariantValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcTable } from "@vc-shell/framework";

const paginationVariantValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need variant of pagination to use
- Ensure proper error handling
- Follow VC-Shell naming conventions
