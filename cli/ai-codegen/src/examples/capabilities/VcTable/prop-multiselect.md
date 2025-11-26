---
id: vctable-prop-multiselect
component: VcTable
type: PROP
complexity: SIMPLE
category: component
tags: [prop, multiselect]
title: "VcTable :multiselect prop"
description: "multiselect property for VcTable"
---

# Capability: multiselect

## Type
PROP

## Description
Enables row selection with checkboxes

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `multiselect`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <!-- @vue-generic {IItem} -->
  <VcTable
    :multiselect="multiselectValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcTable } from "@vc-shell/framework";

const multiselectValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need enables row selection with checkboxes
- Ensure proper error handling
- Follow VC-Shell naming conventions
