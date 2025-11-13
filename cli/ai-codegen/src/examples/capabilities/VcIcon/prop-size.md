# Capability: size

## Type
PROP

## Description
Predefined size: "xs", "s", "m", "l", "xl", "xxl", "xxxl"

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `size`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcIcon
    :size="sizeValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcIcon } from "@vc-shell/framework";

const sizeValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need predefined size: "xs", "s", "m", "l", "xl", "xxl", "xxxl"
- Ensure proper error handling
- Follow VC-Shell naming conventions
