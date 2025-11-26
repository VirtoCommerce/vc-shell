---
id: vctable-prop-columnSelector
component: VcTable
type: PROP
complexity: SIMPLE
category: component
tags: [prop, columnSelector]
title: "VcTable :columnSelector prop"
description: "columnSelector property for VcTable"
---

# Capability: columnSelector

## Type
PROP

## Description
Controls column selection behavior

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `columnSelector`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <!-- @vue-generic {IItem} -->
  <VcTable
    :columnSelector="columnSelectorValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcTable } from "@vc-shell/framework";

const columnSelectorValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need controls column selection behavior
- Ensure proper error handling
- Follow VC-Shell naming conventions
