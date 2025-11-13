# Capability: isExpanded

## Type
PROP

## Description
Whether the widget is expanded

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `isExpanded`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcWidget
    :isExpanded="isExpandedValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcWidget } from "@vc-shell/framework";

const isExpandedValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need whether the widget is expanded
- Ensure proper error handling
- Follow VC-Shell naming conventions
