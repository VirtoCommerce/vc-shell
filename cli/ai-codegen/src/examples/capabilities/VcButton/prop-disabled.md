---
id: vcbutton-prop-disabled
component: VcButton
type: PROP
complexity: SIMPLE
category: component
tags: [prop, disabled]
title: "VcButton :disabled prop"
description: "disabled property for VcButton"
---

# Capability: disabled

## Type
PROP

## Description
Whether the button is disabled

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `disabled`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcButton
    :disabled="disabledValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcButton } from "@vc-shell/framework";

const disabledValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need whether the button is disabled
- Ensure proper error handling
- Follow VC-Shell naming conventions
