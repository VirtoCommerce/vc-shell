# Capability: option

## Type
SLOT

## Description
Custom option slot

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Slots:**
- `option`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcSelect>
    <template #option>
      <!-- Custom slot content -->
    </template>
  </VcSelect>
</template>

<script setup lang="ts">
import { VcSelect } from "@vc-shell/framework";
</script>
```

## Best Practices
- Use this capability when you need custom option slot
- Ensure proper error handling
- Follow VC-Shell naming conventions
