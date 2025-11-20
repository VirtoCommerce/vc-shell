---
id: vccard-slot-header
component: VcCard
type: SLOT
complexity: MODERATE
category: component
tags: [slot, header]
title: "VcCard #header slot"
description: "header slot for VcCard"
---

# Capability: header

## Type
SLOT

## Description
Custom header slot

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Slots:**
- `header`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcCard>
    <template #header>
      <!-- Custom slot content -->
    </template>
  </VcCard>
</template>

<script setup lang="ts">
import { VcCard } from "@vc-shell/framework";
</script>
```

## Best Practices
- Use this capability when you need custom header slot
- Ensure proper error handling
- Follow VC-Shell naming conventions
