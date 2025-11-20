---
id: vccheckbox-prop-required
component: VcCheckbox
type: PROP
complexity: SIMPLE
category: component
tags: [prop, required]
title: "VcCheckbox :required prop"
description: "required property for VcCheckbox"
---

# Capability: required

## Type
PROP

## Description
Whether the checkbox is required

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `required`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcCheckbox
    :required="requiredValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcCheckbox } from "@vc-shell/framework";

const requiredValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need whether the checkbox is required
- Ensure proper error handling
- Follow VC-Shell naming conventions
