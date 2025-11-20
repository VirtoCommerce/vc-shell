---
id: vccard-slot-actions
component: VcCard
type: SLOT
complexity: MODERATE
category: component
tags: [slot, actions]
title: "VcCard #actions slot"
description: "actions slot for VcCard"
---

# Capability: actions

## Type
SLOT

## Description
Custom actions slot

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Slots:**
- `actions`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcCard>
    <template #actions>
      <!-- Custom slot content -->
    </template>
  </VcCard>
</template>

<script setup lang="ts">
import { VcCard } from "@vc-shell/framework";
</script>
```

## Best Practices
- Use this capability when you need custom actions slot
- Ensure proper error handling
- Follow VC-Shell naming conventions
