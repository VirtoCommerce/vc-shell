---
id: vcfield-prop-copyable
component: VcField
type: PROP
complexity: SIMPLE
category: component
tags: [prop, copyable]
title: "VcField :copyable prop"
description: "copyable property for VcField"
---

# Capability: copyable

## Type
PROP

## Description
Whether to show a copy button

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `copyable`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcField
    :copyable="copyableValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcField } from "@vc-shell/framework";

const copyableValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need whether to show a copy button
- Ensure proper error handling
- Follow VC-Shell naming conventions
