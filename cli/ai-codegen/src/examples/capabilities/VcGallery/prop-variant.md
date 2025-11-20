---
id: vcgallery-prop-variant
component: VcGallery
type: PROP
complexity: SIMPLE
category: component
tags: [prop, variant]
title: "VcGallery :variant prop"
description: "variant property for VcGallery"
---

# Capability: variant

## Type
PROP

## Description
Visual variant of the component

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `variant`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcGallery
    :variant="variantValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcGallery } from "@vc-shell/framework";

const variantValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need visual variant of the component
- Ensure proper error handling
- Follow VC-Shell naming conventions
