# Capability: text

## Type
PROP

## Description
Whether the button should be rendered as text without borders

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `text`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcButton
    :text="textValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcButton } from "@vc-shell/framework";

const textValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need whether the button should be rendered as text without borders
- Ensure proper error handling
- Follow VC-Shell naming conventions
