# Capability: error

## Type
PROP

## Description
Shows the label in error state

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `error`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcLabel
    :error="errorValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcLabel } from "@vc-shell/framework";

const errorValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need shows the label in error state
- Ensure proper error handling
- Follow VC-Shell naming conventions
