# Capability: falseValue

## Type
PROP

## Description
Value when switch is in the off state

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `falseValue`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcSwitch
    :falseValue="falseValueValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcSwitch } from "@vc-shell/framework";

const falseValueValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need value when switch is in the off state
- Ensure proper error handling
- Follow VC-Shell naming conventions
