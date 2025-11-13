# Capability: name

## Type
PROP

## Description
Name of the gallery (used for identification)

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `name`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcGallery
    :name="nameValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcGallery } from "@vc-shell/framework";

const nameValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need name of the gallery (used for identification)
- Ensure proper error handling
- Follow VC-Shell naming conventions
