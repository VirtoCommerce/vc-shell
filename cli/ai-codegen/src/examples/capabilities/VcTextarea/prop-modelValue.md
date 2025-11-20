---
id: vctextarea-prop-modelValue
component: VcTextarea
type: PROP
complexity: SIMPLE
category: component
tags: [prop, modelValue]
title: "VcTextarea :modelValue prop"
description: "modelValue property for VcTextarea"
---

# Capability: modelValue

## Type
PROP

## Description
Value of the textarea (v-model)

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
  <VcTextarea
    :modelValue="modelValueValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcTextarea } from "@vc-shell/framework";

const modelValueValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need value of the textarea (v-model)
- Ensure proper error handling
- Follow VC-Shell naming conventions
