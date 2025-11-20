---
id: vctable-slot-filters
component: VcTable
type: SLOT
complexity: MODERATE
category: component
tags: [slot, filters]
title: "VcTable #filters slot"
description: "filters slot for VcTable"
---

# Capability: filters

## Type
SLOT

## Description
Custom filters slot

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Slots:**
- `filters`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcTable>
    <template #filters>
      <!-- Custom slot content -->
    </template>
  </VcTable>
</template>

<script setup lang="ts">
import { VcTable } from "@vc-shell/framework";
</script>
```

## Best Practices
- Use this capability when you need custom filters slot
- Ensure proper error handling
- Follow VC-Shell naming conventions
