# Capability: multilanguage

## Type
PROP

## Description
Indicates if the field supports multiple languages

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
  <VcInput
    :multilanguage="multilanguageValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcInput } from "@vc-shell/framework";

const multilanguageValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need indicates if the field supports multiple languages
- Ensure proper error handling
- Follow VC-Shell naming conventions
