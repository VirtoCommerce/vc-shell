# Capability: icon

## Type
PROP

## Description
The icon to display (string identifier or component)

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `icon`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcIcon
    :icon="iconValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcIcon } from "@vc-shell/framework";

const iconValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need the icon to display (string identifier or component)
- Ensure proper error handling
- Follow VC-Shell naming conventions
