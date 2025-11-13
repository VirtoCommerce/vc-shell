# Capability: loading

## Type
PROP

## Description
Shows a loading spinner inside the input

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
  <VcInput
    :loading="loadingValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcInput } from "@vc-shell/framework";

const loadingValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need shows a loading spinner inside the input
- Ensure proper error handling
- Follow VC-Shell naming conventions
