---
id: vctable-prop-activeFilterCount
component: VcTable
type: PROP
complexity: SIMPLE
category: component
tags: [prop, activeFilterCount]
title: "VcTable :activeFilterCount prop"
description: "activeFilterCount property for VcTable"
---

# Capability: activeFilterCount

## Type
PROP

## Description
Number of active filters

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `activeFilterCount`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcTable
    :activeFilterCount="activeFilterCountValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcTable } from "@vc-shell/framework";

const activeFilterCountValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need number of active filters
- Ensure proper error handling
- Follow VC-Shell naming conventions
