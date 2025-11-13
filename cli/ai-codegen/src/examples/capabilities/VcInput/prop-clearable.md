# Capability: clearable

## Type
PROP

## Description
Whether to show a clear button when input has a value

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `clearable`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcInput
    :clearable="clearableValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcInput } from "@vc-shell/framework";

const clearableValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need whether to show a clear button when input has a value
- Ensure proper error handling
- Follow VC-Shell naming conventions
