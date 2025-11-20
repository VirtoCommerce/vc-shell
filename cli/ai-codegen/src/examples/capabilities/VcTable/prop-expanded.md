---
id: vctable-prop-expanded
component: VcTable
type: PROP
complexity: SIMPLE
category: component
tags: [prop, expanded]
title: "VcTable :expanded prop"
description: "expanded property for VcTable"
---

# Capability: expanded

## Type
PROP

## Description
Controls whether the table is in expanded view

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `expanded`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcTable
    :expanded="expandedValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcTable } from "@vc-shell/framework";

const expandedValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need controls whether the table is in expanded view
- Ensure proper error handling
- Follow VC-Shell naming conventions
