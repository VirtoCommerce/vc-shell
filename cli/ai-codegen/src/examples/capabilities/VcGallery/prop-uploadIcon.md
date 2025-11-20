---
id: vcgallery-prop-uploadIcon
component: VcGallery
type: PROP
complexity: SIMPLE
category: component
tags: [prop, uploadIcon]
title: "VcGallery :uploadIcon prop"
description: "uploadIcon property for VcGallery"
---

# Capability: uploadIcon

## Type
PROP

## Description
Icon for the upload button

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `uploadIcon`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcGallery
    :uploadIcon="uploadIconValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcGallery } from "@vc-shell/framework";

const uploadIconValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need icon for the upload button
- Ensure proper error handling
- Follow VC-Shell naming conventions
