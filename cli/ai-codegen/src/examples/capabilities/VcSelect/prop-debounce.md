# Capability: debounce

## Type
PROP

## Description
Debounce time for search input (in milliseconds)

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `debounce`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcSelect
    :debounce="debounceValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcSelect } from "@vc-shell/framework";

const debounceValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need debounce time for search input (in milliseconds)
- Ensure proper error handling
- Follow VC-Shell naming conventions
