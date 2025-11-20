---
id: vccontainer-prop-noPadding
component: VcContainer
type: PROP
complexity: SIMPLE
category: component
tags: [prop, noPadding]
title: "VcContainer :noPadding prop"
description: "noPadding property for VcContainer"
---

# Capability: noPadding

## Type
PROP

## Description
Removes default padding from the container

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `noPadding`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcContainer
    :noPadding="noPaddingValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcContainer } from "@vc-shell/framework";

const noPaddingValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need removes default padding from the container
- Ensure proper error handling
- Follow VC-Shell naming conventions
