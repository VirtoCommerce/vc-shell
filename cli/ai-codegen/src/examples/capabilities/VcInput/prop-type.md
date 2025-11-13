# Capability: type

## Type
PROP

## Description
Type of input (`'text'`, `'password'`, `'email'`, `'tel'`, `'number'`, `'integer'`, `'url'`, `'time'`, `'date'`, `'datetime-local'`)

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `type`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcInput
    :type="typeValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcInput } from "@vc-shell/framework";

const typeValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need type of input (`'text'`, `'password'`, `'email'`, `'tel'`, `'number'`, `'integer'`, `'url'`, `'time'`, `'date'`, `'datetime-local'`)
- Ensure proper error handling
- Follow VC-Shell naming conventions
