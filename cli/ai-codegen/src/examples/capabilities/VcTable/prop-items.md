---
id: vctable-prop-items
component: VcTable
type: PROP
complexity: SIMPLE
category: component
tags: [prop, items]
title: "VcTable :items prop"
description: "items property for VcTable"
---

# Capability: items

## Type
PROP

## Description
Array of data items to display in the table

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `items`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcTable
    :items="itemsValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcTable } from "@vc-shell/framework";

const itemsValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need array of data items to display in the table
- Ensure proper error handling
- Follow VC-Shell naming conventions
