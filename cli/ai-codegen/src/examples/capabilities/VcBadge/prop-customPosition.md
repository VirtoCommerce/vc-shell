---
id: vcbadge-prop-customPosition
component: VcBadge
type: PROP
complexity: SIMPLE
category: component
tags: [prop, customPosition]
title: "VcBadge :customPosition prop"
description: "customPosition property for VcBadge"
---

# Capability: customPosition

## Type
PROP

## Description
Whether to use custom positioning for the badge

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `customPosition`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcBadge
    :customPosition="customPositionValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcBadge } from "@vc-shell/framework";

const customPositionValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need whether to use custom positioning for the badge
- Ensure proper error handling
- Follow VC-Shell naming conventions
