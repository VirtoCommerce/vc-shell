---
id: vcmultivalue-prop-multilanguage
component: VcMultivalue
type: PROP
complexity: SIMPLE
category: component
tags: [prop, multilanguage]
title: "VcMultivalue :multilanguage prop"
description: "multilanguage property for VcMultivalue"
---

# Capability: multilanguage

## Type
PROP

## Description
Enable multilanguage support for the label

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
  <VcMultivalue
    :multilanguage="multilanguageValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcMultivalue } from "@vc-shell/framework";

const multilanguageValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need enable multilanguage support for the label
- Ensure proper error handling
- Follow VC-Shell naming conventions
