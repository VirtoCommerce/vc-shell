# Capability: tooltip

## Type
PROP

## Description
Tooltip text displayed with the label

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `tooltip`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcCheckbox
    :tooltip="tooltipValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcCheckbox } from "@vc-shell/framework";

const tooltipValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need tooltip text displayed with the label
- Ensure proper error handling
- Follow VC-Shell naming conventions
