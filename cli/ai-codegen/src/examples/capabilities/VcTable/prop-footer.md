# Capability: footer

## Type
PROP

## Description
Controls visibility of the table footer

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `footer`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcTable
    :footer="footerValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcTable } from "@vc-shell/framework";

const footerValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need controls visibility of the table footer
- Ensure proper error handling
- Follow VC-Shell naming conventions
