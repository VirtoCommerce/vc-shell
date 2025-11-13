# Capability: maxlength

## Type
PROP

## Description
Maximum number of characters allowed

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `maxlength`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcEditor
    :maxlength="maxlengthValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcEditor } from "@vc-shell/framework";

const maxlengthValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need maximum number of characters allowed
- Ensure proper error handling
- Follow VC-Shell naming conventions
