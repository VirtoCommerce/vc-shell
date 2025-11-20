---
id: vceditor-prop-modelValue
component: VcEditor
type: PROP
complexity: SIMPLE
category: component
tags: [prop, modelValue]
title: "VcEditor :modelValue prop"
description: "modelValue property for VcEditor"
---

# Capability: modelValue

## Type
PROP

## Description
Content of the editor

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
  <VcEditor
    :modelValue="modelValueValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcEditor } from "@vc-shell/framework";

const modelValueValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need content of the editor
- Ensure proper error handling
- Follow VC-Shell naming conventions
