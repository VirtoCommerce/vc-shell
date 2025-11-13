# Capability: default

## Type
SLOT

## Description
Main content of the label

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
  <VcLabel>
    <template #default>
      <!-- Custom slot content -->
    </template>
  </VcLabel>
</template>

<script setup lang="ts">
import { VcLabel } from "@vc-shell/framework";
</script>
```

## Best Practices
- Use this capability when you need main content of the label
- Ensure proper error handling
- Follow VC-Shell naming conventions
