# Capability: label

## Type
PROP

## Description
Label text for the editor

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `label`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcEditor
    :label="labelValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcEditor } from "@vc-shell/framework";

const labelValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need label text for the editor
- Ensure proper error handling
- Follow VC-Shell naming conventions
