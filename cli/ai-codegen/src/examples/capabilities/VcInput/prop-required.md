# Capability: required

## Type
PROP

## Description
Adds a required indicator to the label

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `required`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcInput
    :required="requiredValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcInput } from "@vc-shell/framework";

const requiredValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need adds a required indicator to the label
- Ensure proper error handling
- Follow VC-Shell naming conventions
