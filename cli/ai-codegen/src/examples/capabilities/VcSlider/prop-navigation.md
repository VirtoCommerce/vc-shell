# Capability: navigation

## Type
PROP

## Description
Enables/disables navigation buttons for the slider

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `navigation`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcSlider
    :navigation="navigationValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcSlider } from "@vc-shell/framework";

const navigationValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need enables/disables navigation buttons for the slider
- Ensure proper error handling
- Follow VC-Shell naming conventions
