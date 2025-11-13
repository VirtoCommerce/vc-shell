# Capability: autofocus

## Type
PROP

## Description
Automatically focuses the input on render

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `autofocus`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcInput
    :autofocus="autofocusValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcInput } from "@vc-shell/framework";

const autofocusValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need automatically focuses the input on render
- Ensure proper error handling
- Follow VC-Shell naming conventions
