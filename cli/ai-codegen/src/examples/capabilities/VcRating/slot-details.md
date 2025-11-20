---
id: vcrating-slot-details
component: VcRating
type: SLOT
complexity: MODERATE
category: component
tags: [slot, details]
title: "VcRating #details slot"
description: "details slot for VcRating"
---

# Capability: details

## Type
SLOT

## Description
Custom details slot

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Slots:**
- `details`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcRating>
    <template #details>
      <!-- Custom slot content -->
    </template>
  </VcRating>
</template>

<script setup lang="ts">
import { VcRating } from "@vc-shell/framework";
</script>
```

## Best Practices
- Use this capability when you need custom details slot
- Ensure proper error handling
- Follow VC-Shell naming conventions
