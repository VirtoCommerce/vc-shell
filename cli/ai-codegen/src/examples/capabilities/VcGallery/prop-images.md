# Capability: images

## Type
PROP

## Description
Array of images to display in the gallery

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `images`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcGallery
    :images="imagesValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcGallery } from "@vc-shell/framework";

const imagesValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need array of images to display in the gallery
- Ensure proper error handling
- Follow VC-Shell naming conventions
