# Capability: hint

## Type
PROP

## Description
Hint text to display below the select

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
  <VcSelect
    :hint="hintValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcSelect } from "@vc-shell/framework";

const hintValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need hint text to display below the select
- Ensure proper error handling
- Follow VC-Shell naming conventions
