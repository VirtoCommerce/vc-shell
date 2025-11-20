---
id: vcimage-prop-src
component: VcImage
type: PROP
complexity: SIMPLE
category: component
tags: [prop, src]
title: "VcImage :src prop"
description: "src property for VcImage"
---

# Capability: src

## Type
PROP

## Description
Source URL of the image

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `src`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcImage
    :src="srcValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcImage } from "@vc-shell/framework";

const srcValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need source url of the image
- Ensure proper error handling
- Follow VC-Shell naming conventions
