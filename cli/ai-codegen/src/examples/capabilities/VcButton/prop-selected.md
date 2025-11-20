---
id: vcbutton-prop-selected
component: VcButton
type: PROP
complexity: SIMPLE
category: component
tags: [prop, selected]
title: "VcButton :selected prop"
description: "selected property for VcButton"
---

# Capability: selected

## Type
PROP

## Description
Whether the button is in a selected state

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `selected`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcButton
    :selected="selectedValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcButton } from "@vc-shell/framework";

const selectedValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need whether the button is in a selected state
- Ensure proper error handling
- Follow VC-Shell naming conventions
