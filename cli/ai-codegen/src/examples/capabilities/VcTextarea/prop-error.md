---
id: vctextarea-prop-error
component: VcTextarea
type: PROP
complexity: SIMPLE
category: component
tags: [prop, error]
title: "VcTextarea :error prop"
description: "error property for VcTextarea"
---

# Capability: error

## Type
PROP

## Description
Whether to show the textarea in error state

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `error`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcTextarea
    :error="errorValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcTextarea } from "@vc-shell/framework";

const errorValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need whether to show the textarea in error state
- Ensure proper error handling
- Follow VC-Shell naming conventions
