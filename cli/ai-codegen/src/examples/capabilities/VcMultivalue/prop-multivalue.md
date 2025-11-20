---
id: vcmultivalue-prop-multivalue
component: VcMultivalue
type: PROP
complexity: SIMPLE
category: component
tags: [prop, multivalue]
title: "VcMultivalue :multivalue prop"
description: "multivalue property for VcMultivalue"
---

# Capability: multivalue

## Type
PROP

## Description
Enables multiple value selection mode

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `multivalue`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcMultivalue
    :multivalue="multivalueValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcMultivalue } from "@vc-shell/framework";

const multivalueValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need enables multiple value selection mode
- Ensure proper error handling
- Follow VC-Shell naming conventions
