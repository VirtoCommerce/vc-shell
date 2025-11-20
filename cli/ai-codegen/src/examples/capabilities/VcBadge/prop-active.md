---
id: vcbadge-prop-active
component: VcBadge
type: PROP
complexity: SIMPLE
category: component
tags: [prop, active]
title: "VcBadge :active prop"
description: "active property for VcBadge"
---

# Capability: active

## Type
PROP

## Description
Whether the badge is in an active state

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `active`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcBadge
    :active="activeValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcBadge } from "@vc-shell/framework";

const activeValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need whether the badge is in an active state
- Ensure proper error handling
- Follow VC-Shell naming conventions
