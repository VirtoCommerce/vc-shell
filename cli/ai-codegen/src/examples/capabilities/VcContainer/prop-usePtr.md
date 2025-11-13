# Capability: usePtr

## Type
PROP

## Description
Enables pull-to-refresh functionality for mobile

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `usePtr`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcContainer
    :usePtr="usePtrValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcContainer } from "@vc-shell/framework";

const usePtrValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need enables pull-to-refresh functionality for mobile
- Ensure proper error handling
- Follow VC-Shell naming conventions
