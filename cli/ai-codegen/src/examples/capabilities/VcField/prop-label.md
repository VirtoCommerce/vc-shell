---
id: vcfield-prop-label
component: VcField
type: PROP
complexity: SIMPLE
category: component
tags: [prop, label]
title: "VcField :label prop"
description: "label property for VcField"
---

# Capability: label

## Type
PROP

## Description
Label text for the field

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
  <VcField
    :label="labelValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcField } from "@vc-shell/framework";

const labelValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need label text for the field
- Ensure proper error handling
- Follow VC-Shell naming conventions
