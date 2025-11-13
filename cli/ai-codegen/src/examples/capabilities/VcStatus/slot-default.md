# Capability: default

## Type
SLOT

## Description
Content of the status indicator (text or complex content)

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
  <VcStatus>
    <template #default>
      <!-- Custom slot content -->
    </template>
  </VcStatus>
</template>

<script setup lang="ts">
import { VcStatus } from "@vc-shell/framework";
</script>
```

## Best Practices
- Use this capability when you need content of the status indicator (text or complex content)
- Ensure proper error handling
- Follow VC-Shell naming conventions
