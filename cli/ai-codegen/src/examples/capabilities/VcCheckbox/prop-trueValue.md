# Capability: trueValue

## Type
PROP

## Description
Value representing the checked state

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `trueValue`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcCheckbox
    :trueValue="trueValueValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcCheckbox } from "@vc-shell/framework";

const trueValueValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need value representing the checked state
- Ensure proper error handling
- Follow VC-Shell naming conventions
