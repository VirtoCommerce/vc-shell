---
id: vcbanner-slot-title
component: VcBanner
type: SLOT
complexity: MODERATE
category: component
tags: [slot, title]
title: "VcBanner #title slot"
description: "title slot for VcBanner"
---

# Capability: title

## Type
SLOT

## Description
Custom title slot

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Slots:**
- `title`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcBanner>
    <template #title>
      <!-- Custom slot content -->
    </template>
  </VcBanner>
</template>

<script setup lang="ts">
import { VcBanner } from "@vc-shell/framework";
</script>
```

## Best Practices
- Use this capability when you need custom title slot
- Ensure proper error handling
- Follow VC-Shell naming conventions
