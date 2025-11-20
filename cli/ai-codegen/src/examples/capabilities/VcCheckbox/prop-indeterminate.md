---
id: vccheckbox-prop-indeterminate
component: VcCheckbox
type: PROP
complexity: SIMPLE
category: component
tags: [prop, indeterminate]
title: "VcCheckbox :indeterminate prop"
description: "indeterminate property for VcCheckbox"
---

# Capability: indeterminate

## Type
PROP

## Description
Whether to show the checkbox in indeterminate state

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `indeterminate`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcCheckbox
    :indeterminate="indeterminateValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcCheckbox } from "@vc-shell/framework";

const indeterminateValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need whether to show the checkbox in indeterminate state
- Ensure proper error handling
- Follow VC-Shell naming conventions
