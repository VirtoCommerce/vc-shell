---
id: vccheckbox-prop-label
component: VcCheckbox
type: PROP
complexity: SIMPLE
category: component
tags: [prop, label]
title: "VcCheckbox :label prop"
description: "label property for VcCheckbox"
---

# Capability: label

## Type
PROP

## Description
Label displayed above the checkbox

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `label`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcCheckbox
    :label="labelValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcCheckbox } from "@vc-shell/framework";

const labelValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need label displayed above the checkbox
- Ensure proper error handling
- Follow VC-Shell naming conventions
