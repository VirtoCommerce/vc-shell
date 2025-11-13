# Capability: step

## Type
PROP

## Description
Step value for number inputs

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `step`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcInput
    :step="stepValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcInput } from "@vc-shell/framework";

const stepValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need step value for number inputs
- Ensure proper error handling
- Follow VC-Shell naming conventions
