---
id: vccheckbox-prop-modelValue
component: VcCheckbox
type: PROP
complexity: SIMPLE
category: component
tags: [prop, modelValue]
title: "VcCheckbox :modelValue prop"
description: "modelValue property for VcCheckbox"
---

# Capability: modelValue

## Type
PROP

## Description
Current value of the checkbox (v-model)

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
  <VcCheckbox
    :modelValue="modelValueValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcCheckbox } from "@vc-shell/framework";

const modelValueValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need current value of the checkbox (v-model)
- Ensure proper error handling
- Follow VC-Shell naming conventions
