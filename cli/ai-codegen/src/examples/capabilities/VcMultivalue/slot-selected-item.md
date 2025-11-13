# Capability: selected-item

## Type
SLOT

## Description
Custom selected-item slot

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Slots:**
- `selected-item`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcMultivalue>
    <template #selected-item>
      <!-- Custom slot content -->
    </template>
  </VcMultivalue>
</template>

<script setup lang="ts">
import { VcMultivalue } from "@vc-shell/framework";
</script>
```

## Best Practices
- Use this capability when you need custom selected-item slot
- Ensure proper error handling
- Follow VC-Shell naming conventions
