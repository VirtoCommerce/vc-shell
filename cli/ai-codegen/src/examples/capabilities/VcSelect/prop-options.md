---
id: vcselect-prop-options
component: VcSelect
type: PROP
complexity: SIMPLE
category: component
tags: [prop, options]
title: "VcSelect :options prop"
description: "options property for VcSelect"
---

# Capability: options

## Type
PROP

## Description
Options array or async function returning options

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `options`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <!-- @vue-generic {string} -->
  <VcSelect
    :options="optionsValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcSelect } from "@vc-shell/framework";

const optionsValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need options array or async function returning options
- Ensure proper error handling
- Follow VC-Shell naming conventions
