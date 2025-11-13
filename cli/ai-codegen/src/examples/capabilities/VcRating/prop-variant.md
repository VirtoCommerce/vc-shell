# Capability: variant

## Type
PROP

## Description
Rating display variant

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
  <VcRating
    :variant="variantValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcRating } from "@vc-shell/framework";

const variantValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need rating display variant
- Ensure proper error handling
- Follow VC-Shell naming conventions
