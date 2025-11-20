---
id: vctable-prop-totalCount
component: VcTable
type: PROP
complexity: SIMPLE
category: component
tags: [prop, totalCount]
title: "VcTable :totalCount prop"
description: "totalCount property for VcTable"
---

# Capability: totalCount

## Type
PROP

## Description
Total count of items (used for pagination)

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `totalCount`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcTable
    :totalCount="totalCountValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcTable } from "@vc-shell/framework";

const totalCountValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need total count of items (used for pagination)
- Ensure proper error handling
- Follow VC-Shell naming conventions
