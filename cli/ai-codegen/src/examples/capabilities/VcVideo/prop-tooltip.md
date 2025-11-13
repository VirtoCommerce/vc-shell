# Capability: tooltip

## Type
PROP

## Description
Additional information shown in a tooltip

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
  <VcVideo
    :tooltip="tooltipValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcVideo } from "@vc-shell/framework";

const tooltipValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need additional information shown in a tooltip
- Ensure proper error handling
- Follow VC-Shell naming conventions
