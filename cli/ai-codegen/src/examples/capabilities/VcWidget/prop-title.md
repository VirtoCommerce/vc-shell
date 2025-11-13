# Capability: title

## Type
PROP

## Description
Title text displayed below the icon

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `title`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcWidget
    :title="titleValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcWidget } from "@vc-shell/framework";

const titleValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need title text displayed below the icon
- Ensure proper error handling
- Follow VC-Shell naming conventions
