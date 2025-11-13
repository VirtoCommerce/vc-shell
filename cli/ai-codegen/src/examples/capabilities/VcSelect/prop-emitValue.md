# Capability: emitValue

## Type
PROP

## Description
Emit only the value instead of the entire option

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `emitValue`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcSelect
    :emitValue="emitValueValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcSelect } from "@vc-shell/framework";

const emitValueValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need emit only the value instead of the entire option
- Ensure proper error handling
- Follow VC-Shell naming conventions
