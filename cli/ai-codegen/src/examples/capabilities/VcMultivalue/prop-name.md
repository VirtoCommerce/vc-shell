# Capability: name

## Type
PROP

## Description
Name attribute for the field

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `name`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcMultivalue
    :name="nameValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcMultivalue } from "@vc-shell/framework";

const nameValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need name attribute for the field
- Ensure proper error handling
- Follow VC-Shell naming conventions
