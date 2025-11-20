---
id: vcmultivalue-prop-loading
component: VcMultivalue
type: PROP
complexity: SIMPLE
category: component
tags: [prop, loading]
title: "VcMultivalue :loading prop"
description: "loading property for VcMultivalue"
---

# Capability: loading

## Type
PROP

## Description
Shows a loading indicator

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `loading`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcMultivalue
    :loading="loadingValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcMultivalue } from "@vc-shell/framework";

const loadingValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need shows a loading indicator
- Ensure proper error handling
- Follow VC-Shell naming conventions
