# Capability: emptyIcon

## Type
PROP

## Description
The icon to display when no src is provided

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `emptyIcon`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcImage
    :emptyIcon="emptyIconValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcImage } from "@vc-shell/framework";

const emptyIconValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need the icon to display when no src is provided
- Ensure proper error handling
- Follow VC-Shell naming conventions
