# Capability: default

## Type
SLOT

## Description
Content displayed next to the checkbox

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
  <VcCheckbox>
    <template #default>
      <!-- Custom slot content -->
    </template>
  </VcCheckbox>
</template>

<script setup lang="ts">
import { VcCheckbox } from "@vc-shell/framework";
</script>
```

## Best Practices
- Use this capability when you need content displayed next to the checkbox
- Ensure proper error handling
- Follow VC-Shell naming conventions
