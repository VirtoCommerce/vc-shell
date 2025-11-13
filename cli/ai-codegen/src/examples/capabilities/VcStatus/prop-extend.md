# Capability: extend

## Type
PROP

## Description
Whether to use an extended layout with more padding & square corners

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `extend`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcStatus
    :extend="extendValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcStatus } from "@vc-shell/framework";

const extendValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need whether to use an extended layout with more padding & square corners
- Ensure proper error handling
- Follow VC-Shell naming conventions
