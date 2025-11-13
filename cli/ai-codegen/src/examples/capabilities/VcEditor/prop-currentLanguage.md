# Capability: currentLanguage

## Type
PROP

## Description
Current selected language code

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
  <VcEditor
    :currentLanguage="currentLanguageValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcEditor } from "@vc-shell/framework";

const currentLanguageValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need current selected language code
- Ensure proper error handling
- Follow VC-Shell naming conventions
