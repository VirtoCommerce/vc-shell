# Capability: hint

## Type
PROP

## Description
Helper text displayed below the field

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `hint`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcMultivalue
    :hint="hintValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcMultivalue } from "@vc-shell/framework";

const hintValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need helper text displayed below the field
- Ensure proper error handling
- Follow VC-Shell naming conventions
