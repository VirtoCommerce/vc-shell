---
id: vcgallery-prop-hideAfterUpload
component: VcGallery
type: PROP
complexity: SIMPLE
category: component
tags: [prop, hideAfterUpload]
title: "VcGallery :hideAfterUpload prop"
description: "hideAfterUpload property for VcGallery"
---

# Capability: hideAfterUpload

## Type
PROP

## Description
Hides the upload button after files are uploaded

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `hideAfterUpload`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcGallery
    :hideAfterUpload="hideAfterUploadValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcGallery } from "@vc-shell/framework";

const hideAfterUploadValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need hides the upload button after files are uploaded
- Ensure proper error handling
- Follow VC-Shell naming conventions
