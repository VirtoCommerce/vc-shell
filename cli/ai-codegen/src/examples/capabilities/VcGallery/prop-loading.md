# Capability: loading

## Type
PROP

## Description
Shows loading state during operations

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `loading`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcGallery
    :loading="loadingValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcGallery } from "@vc-shell/framework";

const loadingValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need shows loading state during operations
- Ensure proper error handling
- Follow VC-Shell naming conventions
