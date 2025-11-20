---
id: vcmultivalue-prop-errorMessage
component: VcMultivalue
type: PROP
complexity: SIMPLE
category: component
tags: [prop, errorMessage]
title: "VcMultivalue :errorMessage prop"
description: "errorMessage property for VcMultivalue"
---

# Capability: errorMessage

## Type
PROP

## Description
Error message to display

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `errorMessage`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcMultivalue
    :errorMessage="errorMessageValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcMultivalue } from "@vc-shell/framework";

const errorMessageValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need error message to display
- Ensure proper error handling
- Follow VC-Shell naming conventions
