# Capability: default

## Type
SLOT

## Description
The main content of the blade

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Slots:**
- `default`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
MEDIUM

## Complete Working Example
```vue
<template>
  <VcBlade>
    <template #default>
      <!-- Custom slot content -->
    </template>
  </VcBlade>
</template>

<script setup lang="ts">
import { VcBlade } from "@vc-shell/framework";
</script>
```

## Best Practices
- Use this capability when you need the main content of the blade
- Ensure proper error handling
- Follow VC-Shell naming conventions
