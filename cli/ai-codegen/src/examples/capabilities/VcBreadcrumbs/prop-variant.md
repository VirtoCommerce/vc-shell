# Capability: variant

## Type
PROP

## Description
Visual style variant ('default' or 'light')

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `variant`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcBreadcrumbs
    :variant="variantValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcBreadcrumbs } from "@vc-shell/framework";

const variantValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need visual style variant ('default' or 'light')
- Ensure proper error handling
- Follow VC-Shell naming conventions
