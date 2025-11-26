---
id: vctable-slot-header
component: VcTable
type: SLOT
complexity: MODERATE
category: component
tags: [slot, header]
title: "VcTable #header slot"
description: "header slot for VcTable"
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
  <!-- @vue-generic {IItem} -->
  <VcTable>
    <template #header>
      <!-- Custom slot content -->
    </template>
  </VcTable>
</template>

<script setup lang="ts">
import { VcTable } from "@vc-shell/framework";
</script>
```

## Best Practices
- Use this capability when you need custom header slot
- Ensure proper error handling
- Follow VC-Shell naming conventions
