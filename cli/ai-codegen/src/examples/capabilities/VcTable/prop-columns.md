# Capability: columns

## Type
PROP

## Description
Array of column definitions for the table

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `columns`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcTable
    :columns="columnsValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcTable } from "@vc-shell/framework";

const columnsValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need array of column definitions for the table
- Ensure proper error handling
- Follow VC-Shell naming conventions
