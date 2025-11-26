---
id: vcselect-prop-placeholder
component: VcSelect
type: PROP
complexity: SIMPLE
category: component
tags: [prop, placeholder]
title: "VcSelect :placeholder prop"
description: "placeholder property for VcSelect"
---

# Capability: placeholder

## Type
PROP

## Description
Placeholder text when no value is selected

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `placeholder`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <!-- @vue-generic {string} -->
  <VcSelect
    :placeholder="placeholderValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcSelect } from "@vc-shell/framework";

const placeholderValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need placeholder text when no value is selected
- Ensure proper error handling
- Follow VC-Shell naming conventions
