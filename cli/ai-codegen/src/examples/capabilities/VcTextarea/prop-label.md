# Capability: label

## Type
PROP

## Description
Label displayed above the textarea

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `label`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcTextarea
    :label="labelValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcTextarea } from "@vc-shell/framework";

const labelValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need label displayed above the textarea
- Ensure proper error handling
- Follow VC-Shell naming conventions
