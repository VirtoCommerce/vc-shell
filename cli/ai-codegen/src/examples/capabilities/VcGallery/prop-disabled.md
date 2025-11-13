# Capability: disabled

## Type
PROP

## Description
Disables all interactions with the gallery

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `disabled`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcGallery
    :disabled="disabledValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcGallery } from "@vc-shell/framework";

const disabledValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need disables all interactions with the gallery
- Ensure proper error handling
- Follow VC-Shell naming conventions
