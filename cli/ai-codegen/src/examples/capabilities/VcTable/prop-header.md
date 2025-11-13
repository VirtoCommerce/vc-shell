# Capability: header

## Type
PROP

## Description
Controls visibility of the table header

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `header`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcTable
    :header="headerValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcTable } from "@vc-shell/framework";

const headerValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need controls visibility of the table header
- Ensure proper error handling
- Follow VC-Shell naming conventions
