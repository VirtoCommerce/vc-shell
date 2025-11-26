---
id: vcselect-prop-label
component: VcSelect
type: PROP
complexity: SIMPLE
category: component
tags: [prop, label]
title: "VcSelect :label prop"
description: "label property for VcSelect"
---

# Capability: label

## Type
PROP

## Description
Label displayed above the select

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `label`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <!-- @vue-generic {string} -->
  <VcSelect
    :label="labelValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcSelect } from "@vc-shell/framework";

const labelValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need label displayed above the select
- Ensure proper error handling
- Follow VC-Shell naming conventions
