---
id: vcselect-prop-loading
component: VcSelect
type: PROP
complexity: SIMPLE
category: component
tags: [prop, loading]
title: "VcSelect :loading prop"
description: "loading property for VcSelect"
---

# Capability: loading

## Type
PROP

## Description
Show loading state

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
  <VcSelect
    :loading="loadingValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcSelect } from "@vc-shell/framework";

const loadingValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need show loading state
- Ensure proper error handling
- Follow VC-Shell naming conventions
