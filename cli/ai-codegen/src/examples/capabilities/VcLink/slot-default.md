# Capability: default

## Type
SLOT

## Description
Content of the link

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
  <VcLink>
    <template #default>
      <!-- Custom slot content -->
    </template>
  </VcLink>
</template>

<script setup lang="ts">
import { VcLink } from "@vc-shell/framework";
</script>
```

## Best Practices
- Use this capability when you need content of the link
- Ensure proper error handling
- Follow VC-Shell naming conventions
