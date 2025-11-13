# Capability: separated

## Type
PROP

## Description
Whether to show separators between items

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `separated`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcBreadcrumbs
    :separated="separatedValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcBreadcrumbs } from "@vc-shell/framework";

const separatedValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need whether to show separators between items
- Ensure proper error handling
- Follow VC-Shell naming conventions
