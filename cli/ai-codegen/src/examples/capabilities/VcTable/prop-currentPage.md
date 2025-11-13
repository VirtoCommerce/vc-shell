# Capability: currentPage

## Type
PROP

## Description
Current active page

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `currentPage`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcTable
    :currentPage="currentPageValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcTable } from "@vc-shell/framework";

const currentPageValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need current active page
- Ensure proper error handling
- Follow VC-Shell naming conventions
