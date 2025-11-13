# Capability: default

## Type
SLOT

## Description
Custom default slot

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Slots:**
- `default`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcBanner>
    <template #default>
      <!-- Custom slot content -->
    </template>
  </VcBanner>
</template>

<script setup lang="ts">
import { VcBanner } from "@vc-shell/framework";
</script>
```

## Best Practices
- Use this capability when you need custom default slot
- Ensure proper error handling
- Follow VC-Shell naming conventions
