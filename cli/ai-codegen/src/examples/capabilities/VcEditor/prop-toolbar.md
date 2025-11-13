# Capability: toolbar

## Type
PROP

## Description
Custom toolbar configuration

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `toolbar`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcEditor
    :toolbar="toolbarValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcEditor } from "@vc-shell/framework";

const toolbarValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need custom toolbar configuration
- Ensure proper error handling
- Follow VC-Shell naming conventions
