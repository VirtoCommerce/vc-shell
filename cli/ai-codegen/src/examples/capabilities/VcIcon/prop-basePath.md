---
id: vcicon-prop-basePath
component: VcIcon
type: PROP
complexity: SIMPLE
category: component
tags: [prop, basePath]
title: "VcIcon :basePath prop"
description: "basePath property for VcIcon"
---

# Capability: basePath

## Type
PROP

## Description
Base path for SVG icons (only for SVG icons)

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `basePath`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcIcon
    :basePath="basePathValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcIcon } from "@vc-shell/framework";

const basePathValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need base path for svg icons (only for svg icons)
- Ensure proper error handling
- Follow VC-Shell naming conventions
