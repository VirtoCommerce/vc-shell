---
id: vcfield-prop-modelValue
component: VcField
type: PROP
complexity: SIMPLE
category: component
tags: [prop, modelValue]
title: "VcField :modelValue prop"
description: "modelValue property for VcField"
---

# Capability: modelValue

## Type
PROP

## Description
Content to display in the field

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `modelValue`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcField
    :modelValue="modelValueValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcField } from "@vc-shell/framework";

const modelValueValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need content to display in the field
- Ensure proper error handling
- Follow VC-Shell naming conventions
