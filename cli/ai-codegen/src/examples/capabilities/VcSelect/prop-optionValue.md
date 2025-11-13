# Capability: optionValue

## Type
PROP

## Description
Property name or function to get option value

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `optionValue`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcSelect
    :optionValue="optionValueValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcSelect } from "@vc-shell/framework";

const optionValueValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need property name or function to get option value
- Ensure proper error handling
- Follow VC-Shell naming conventions
