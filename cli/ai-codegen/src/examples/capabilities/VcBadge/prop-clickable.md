---
id: vcbadge-prop-clickable
component: VcBadge
type: PROP
complexity: SIMPLE
category: component
tags: [prop, clickable]
title: "VcBadge :clickable prop"
description: "clickable property for VcBadge"
---

# Capability: clickable

## Type
PROP

## Description
Whether the badge is clickable

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `clickable`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcBadge
    :clickable="clickableValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcBadge } from "@vc-shell/framework";

const clickableValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need whether the badge is clickable
- Ensure proper error handling
- Follow VC-Shell naming conventions
