---
id: vcbreadcrumbs-prop-items
component: VcBreadcrumbs
type: PROP
complexity: SIMPLE
category: component
tags: [prop, items]
title: "VcBreadcrumbs :items prop"
description: "items property for VcBreadcrumbs"
---

# Capability: items

## Type
PROP

## Description
Array of breadcrumb items to display

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `items`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcBreadcrumbs
    :items="itemsValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcBreadcrumbs } from "@vc-shell/framework";

const itemsValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need array of breadcrumb items to display
- Ensure proper error handling
- Follow VC-Shell naming conventions
