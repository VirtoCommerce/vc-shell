---
id: vcrating-prop-modelValue
component: VcRating
type: PROP
complexity: SIMPLE
category: component
tags: [prop, modelValue]
title: "VcRating :modelValue prop"
description: "modelValue property for VcRating"
---

# Capability: modelValue

## Type
PROP

## Description
Current rating value (use with v-model)

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
  <VcRating
    :modelValue="modelValueValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcRating } from "@vc-shell/framework";

const modelValueValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need current rating value (use with v-model)
- Ensure proper error handling
- Follow VC-Shell naming conventions
