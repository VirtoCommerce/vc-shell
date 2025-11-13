# Capability: placeholder

## Type
PROP

## Description
Placeholder text for the input field

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `placeholder`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcMultivalue
    :placeholder="placeholderValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcMultivalue } from "@vc-shell/framework";

const placeholderValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need placeholder text for the input field
- Ensure proper error handling
- Follow VC-Shell naming conventions
