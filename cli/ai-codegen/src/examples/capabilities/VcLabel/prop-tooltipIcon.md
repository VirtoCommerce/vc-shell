# Capability: tooltipIcon

## Type
PROP

## Description
Icon to use for the tooltip

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `tooltipIcon`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcLabel
    :tooltipIcon="tooltipIconValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcLabel } from "@vc-shell/framework";

const tooltipIconValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need icon to use for the tooltip
- Ensure proper error handling
- Follow VC-Shell naming conventions
