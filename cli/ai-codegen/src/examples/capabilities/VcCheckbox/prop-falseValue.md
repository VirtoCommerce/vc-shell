---
id: vccheckbox-prop-falseValue
component: VcCheckbox
type: PROP
complexity: SIMPLE
category: component
tags: [prop, falseValue]
title: "VcCheckbox :falseValue prop"
description: "falseValue property for VcCheckbox"
---

# Capability: falseValue

## Type
PROP

## Description
Value representing the unchecked state

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `falseValue`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcCheckbox
    :falseValue="falseValueValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcCheckbox } from "@vc-shell/framework";

const falseValueValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need value representing the unchecked state
- Ensure proper error handling
- Follow VC-Shell naming conventions
