---
id: vctextarea-prop-required
component: VcTextarea
type: PROP
complexity: SIMPLE
category: component
tags: [prop, required]
title: "VcTextarea :required prop"
description: "required property for VcTextarea"
---

# Capability: required

## Type
PROP

## Description
Whether the field is required

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
  <VcTextarea
    :required="requiredValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcTextarea } from "@vc-shell/framework";

const requiredValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need whether the field is required
- Ensure proper error handling
- Follow VC-Shell naming conventions
