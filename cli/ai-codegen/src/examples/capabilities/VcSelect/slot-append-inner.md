# Capability: append-inner

## Type
SLOT

## Description
Custom append-inner slot

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Slots:**
- `append-inner`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcSelect>
    <template #append-inner>
      <!-- Custom slot content -->
    </template>
  </VcSelect>
</template>

<script setup lang="ts">
import { VcSelect } from "@vc-shell/framework";
</script>
```

## Best Practices
- Use this capability when you need custom append-inner slot
- Ensure proper error handling
- Follow VC-Shell naming conventions
