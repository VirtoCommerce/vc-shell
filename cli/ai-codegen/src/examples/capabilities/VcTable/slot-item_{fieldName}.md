---
id: vctable-slot-item_{fieldName}
component: VcTable
type: SLOT
complexity: MODERATE
category: component
tags: [slot, item_{fieldName}]
title: "VcTable #item_{fieldName} slot"
description: "item_{fieldName} slot for VcTable"
---

# Capability: item_{fieldName}

## Type
SLOT

## Description
`{ item: T; cell: ITableColumns \

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Slots:**
- `item_{fieldName}`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
MEDIUM

## Complete Working Example
```vue
<template>
  <!-- @vue-generic {IItem} -->
  <VcTable>
    <template #item_{fieldName}>
      <!-- Custom slot content -->
    </template>
  </VcTable>
</template>

<script setup lang="ts">
import { VcTable } from "@vc-shell/framework";
</script>
```

## Best Practices
- Use this capability when you need `{ item: t; cell: itablecolumns \
- Ensure proper error handling
- Follow VC-Shell naming conventions
