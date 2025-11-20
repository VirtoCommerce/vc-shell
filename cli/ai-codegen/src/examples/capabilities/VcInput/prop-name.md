---
id: vcinput-prop-name
component: VcInput
type: PROP
complexity: SIMPLE
category: component
tags: [prop, name]
title: "VcInput :name prop"
description: "name property for VcInput"
---

# Capability: name

## Type
PROP

## Description
Name attribute for the input element

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `name`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcInput
    :name="nameValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcInput } from "@vc-shell/framework";

const nameValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need name attribute for the input element
- Ensure proper error handling
- Follow VC-Shell naming conventions
