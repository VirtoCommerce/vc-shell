# Capability: itemActions

## Type
PROP

## Description
Controls which actions are available for each image

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `itemActions`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcGallery
    :itemActions="itemActionsValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcGallery } from "@vc-shell/framework";

const itemActionsValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need controls which actions are available for each image
- Ensure proper error handling
- Follow VC-Shell naming conventions
