# Capability: errorMessage

## Type
PROP

## Description
Error message to display below the select

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `errorMessage`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcSelect
    :errorMessage="errorMessageValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcSelect } from "@vc-shell/framework";

const errorMessageValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need error message to display below the select
- Ensure proper error handling
- Follow VC-Shell naming conventions
