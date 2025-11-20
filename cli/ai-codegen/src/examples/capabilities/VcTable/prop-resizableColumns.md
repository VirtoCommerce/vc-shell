---
id: vctable-prop-resizableColumns
component: VcTable
type: PROP
complexity: SIMPLE
category: component
tags: [prop, resizableColumns]
title: "VcTable :resizableColumns prop"
description: "resizableColumns property for VcTable"
---

# Capability: resizableColumns

## Type
PROP

## Description
Enables column resizing

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `resizableColumns`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcTable
    :resizableColumns="resizableColumnsValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcTable } from "@vc-shell/framework";

const resizableColumnsValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need enables column resizing
- Ensure proper error handling
- Follow VC-Shell naming conventions
