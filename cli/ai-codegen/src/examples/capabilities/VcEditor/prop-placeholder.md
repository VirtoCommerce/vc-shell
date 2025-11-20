---
id: vceditor-prop-placeholder
component: VcEditor
type: PROP
complexity: SIMPLE
category: component
tags: [prop, placeholder]
title: "VcEditor :placeholder prop"
description: "placeholder property for VcEditor"
---

# Capability: placeholder

## Type
PROP

## Description
Placeholder text when editor is empty

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
  <VcEditor
    :placeholder="placeholderValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcEditor } from "@vc-shell/framework";

const placeholderValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need placeholder text when editor is empty
- Ensure proper error handling
- Follow VC-Shell naming conventions
