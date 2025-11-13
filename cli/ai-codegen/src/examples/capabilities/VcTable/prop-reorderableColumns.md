# Capability: reorderableColumns

## Type
PROP

## Description
Enables column reordering

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `reorderableColumns`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcTable
    :reorderableColumns="reorderableColumnsValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcTable } from "@vc-shell/framework";

const reorderableColumnsValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need enables column reordering
- Ensure proper error handling
- Follow VC-Shell naming conventions
