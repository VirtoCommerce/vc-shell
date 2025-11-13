# Capability: currentLanguage

## Type
PROP

## Description
Current language code for multilanguage support

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `currentLanguage`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcMultivalue
    :currentLanguage="currentLanguageValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcMultivalue } from "@vc-shell/framework";

const currentLanguageValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need current language code for multilanguage support
- Ensure proper error handling
- Follow VC-Shell naming conventions
