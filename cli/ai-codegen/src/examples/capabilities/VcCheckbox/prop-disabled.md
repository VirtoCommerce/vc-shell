# Capability: disabled

## Type
PROP

## Description
Whether the checkbox is disabled

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `disabled`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcCheckbox
    :disabled="disabledValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcCheckbox } from "@vc-shell/framework";

const disabledValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need whether the checkbox is disabled
- Ensure proper error handling
- Follow VC-Shell naming conventions
