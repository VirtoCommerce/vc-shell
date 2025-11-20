---
id: vcselect-prop-multilanguage
component: VcSelect
type: PROP
complexity: SIMPLE
category: component
tags: [prop, multilanguage]
title: "VcSelect :multilanguage prop"
description: "multilanguage property for VcSelect"
---

# Capability: multilanguage

## Type
PROP

## Description
Whether the label should show multilanguage icon

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
  <VcSelect
    :multilanguage="multilanguageValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcSelect } from "@vc-shell/framework";

const multilanguageValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need whether the label should show multilanguage icon
- Ensure proper error handling
- Follow VC-Shell naming conventions
