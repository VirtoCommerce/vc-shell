# Capability: multilanguage

## Type
PROP

## Description
Shows language indicator for multilanguage fields

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `multilanguage`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcLabel
    :multilanguage="multilanguageValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcLabel } from "@vc-shell/framework";

const multilanguageValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need shows language indicator for multilanguage fields
- Ensure proper error handling
- Follow VC-Shell naming conventions
