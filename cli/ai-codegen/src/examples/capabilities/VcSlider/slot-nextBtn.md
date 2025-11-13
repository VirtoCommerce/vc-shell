# Capability: nextBtn

## Type
SLOT

## Description
Custom nextBtn slot

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Slots:**
- `nextBtn`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcSlider>
    <template #nextBtn>
      <!-- Custom slot content -->
    </template>
  </VcSlider>
</template>

<script setup lang="ts">
import { VcSlider } from "@vc-shell/framework";
</script>
```

## Best Practices
- Use this capability when you need custom nextbtn slot
- Ensure proper error handling
- Follow VC-Shell naming conventions
