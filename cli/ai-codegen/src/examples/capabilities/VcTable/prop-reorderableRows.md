# Capability: reorderableRows

## Type
PROP

## Description
Enables row reordering

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `reorderableRows`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcTable
    :reorderableRows="reorderableRowsValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcTable } from "@vc-shell/framework";

const reorderableRowsValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need enables row reordering
- Ensure proper error handling
- Follow VC-Shell naming conventions
