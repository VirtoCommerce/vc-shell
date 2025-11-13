# Capability: bordered

## Type
PROP

## Description
Whether to display a border around the image

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `bordered`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcImage
    :bordered="borderedValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcImage } from "@vc-shell/framework";

const borderedValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need whether to display a border around the image
- Ensure proper error handling
- Follow VC-Shell naming conventions
