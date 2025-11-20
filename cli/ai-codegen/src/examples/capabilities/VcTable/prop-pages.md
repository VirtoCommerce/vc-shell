---
id: vctable-prop-pages
component: VcTable
type: PROP
complexity: SIMPLE
category: component
tags: [prop, pages]
title: "VcTable :pages prop"
description: "pages property for VcTable"
---

# Capability: pages

## Type
PROP

## Description
Total number of pages

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `pages`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcTable
    :pages="pagesValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcTable } from "@vc-shell/framework";

const pagesValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need total number of pages
- Ensure proper error handling
- Follow VC-Shell naming conventions
