---
id: vcselect-prop-required
component: VcSelect
type: PROP
complexity: SIMPLE
category: component
tags: [prop, required]
title: "VcSelect :required prop"
description: "required property for VcSelect"
---

# Capability: required

## Type
PROP

## Description
Mark the select as required (shows asterisk)

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
  <VcSelect
    :required="requiredValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcSelect } from "@vc-shell/framework";

const requiredValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need mark the select as required (shows asterisk)
- Ensure proper error handling
- Follow VC-Shell naming conventions
