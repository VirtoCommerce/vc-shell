---
id: vctable-slot-empty
component: VcTable
type: SLOT
complexity: MODERATE
category: component
tags: [slot, empty]
title: "VcTable #empty slot"
description: "empty slot for VcTable"
---

# Capability: empty

## Type
SLOT

## Description
-

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Slots:**
- `empty`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
MEDIUM

## Complete Working Example
```vue
<template>
  <!-- @vue-generic {IItem} -->
  <VcTable>
    <template #empty>
      <!-- Custom slot content -->
    </template>
  </VcTable>
</template>

<script setup lang="ts">
import { VcTable } from "@vc-shell/framework";
</script>
```

## Best Practices
- Use this capability when you need -
- Ensure proper error handling
- Follow VC-Shell naming conventions
