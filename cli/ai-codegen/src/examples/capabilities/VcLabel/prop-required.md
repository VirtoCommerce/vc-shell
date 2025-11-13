# Capability: required

## Type
PROP

## Description
Shows required field indicator (asterisk)

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
  <VcLabel
    :required="requiredValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcLabel } from "@vc-shell/framework";

const requiredValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need shows required field indicator (asterisk)
- Ensure proper error handling
- Follow VC-Shell naming conventions
