# Capability: size

## Type
PROP

## Description
Size of the select field

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
  <VcSelect
    :size="sizeValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcSelect } from "@vc-shell/framework";

const sizeValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need size of the select field
- Ensure proper error handling
- Follow VC-Shell naming conventions
