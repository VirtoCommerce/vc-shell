---
id: vcselect-prop-searchable
component: VcSelect
type: PROP
complexity: SIMPLE
category: component
tags: [prop, searchable]
title: "VcSelect :searchable prop"
description: "searchable property for VcSelect"
---

# Capability: searchable

## Type
PROP

## Description
Enable searching/filtering options

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `searchable`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcSelect
    :searchable="searchableValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcSelect } from "@vc-shell/framework";

const searchableValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need enable searching/filtering options
- Ensure proper error handling
- Follow VC-Shell naming conventions
