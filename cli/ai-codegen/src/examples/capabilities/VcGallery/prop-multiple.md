---
id: vcgallery-prop-multiple
component: VcGallery
type: PROP
complexity: SIMPLE
category: component
tags: [prop, multiple]
title: "VcGallery :multiple prop"
description: "multiple property for VcGallery"
---

# Capability: multiple

## Type
PROP

## Description
Allows multiple file selection during upload

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `multiple`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcGallery
    :multiple="multipleValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcGallery } from "@vc-shell/framework";

const multipleValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need allows multiple file selection during upload
- Ensure proper error handling
- Follow VC-Shell naming conventions
