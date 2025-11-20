---
id: vctextarea-prop-errorMessage
component: VcTextarea
type: PROP
complexity: SIMPLE
category: component
tags: [prop, errorMessage]
title: "VcTextarea :errorMessage prop"
description: "errorMessage property for VcTextarea"
---

# Capability: errorMessage

## Type
PROP

## Description
Error message to display below the textarea

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
  <VcTextarea
    :errorMessage="errorMessageValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcTextarea } from "@vc-shell/framework";

const errorMessageValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need error message to display below the textarea
- Ensure proper error handling
- Follow VC-Shell naming conventions
