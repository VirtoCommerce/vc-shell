# Capability: tooltip

## Type
SLOT

## Description
Custom tooltip slot

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Slots:**
- `tooltip`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcLabel>
    <template #tooltip>
      <!-- Custom slot content -->
    </template>
  </VcLabel>
</template>

<script setup lang="ts">
import { VcLabel } from "@vc-shell/framework";
</script>
```

## Best Practices
- Use this capability when you need custom tooltip slot
- Ensure proper error handling
- Follow VC-Shell naming conventions
