# Capability: rounded

## Type
PROP

## Description
Whether to display the image with rounded corners

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `rounded`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcImage
    :rounded="roundedValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcImage } from "@vc-shell/framework";

const roundedValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need whether to display the image with rounded corners
- Ensure proper error handling
- Follow VC-Shell naming conventions
