# Capability: aspect

## Type
PROP

## Description
The aspect ratio of the image container

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `aspect`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcImage
    :aspect="aspectValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcImage } from "@vc-shell/framework";

const aspectValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need the aspect ratio of the image container
- Ensure proper error handling
- Follow VC-Shell naming conventions
