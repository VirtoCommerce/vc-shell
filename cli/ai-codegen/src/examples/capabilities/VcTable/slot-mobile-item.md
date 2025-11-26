---
id: vctable-slot-mobile-item
component: VcTable
type: SLOT
complexity: MODERATE
category: component
tags: [slot, mobile-item]
title: "VcTable #mobile-item slot"
description: "mobile-item slot for VcTable"
---

# Capability: mobile-item

## Type
SLOT

## Description
`{ item: T }`

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Slots:**
- `mobile-item`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
MEDIUM

## Complete Working Example
```vue
<template>
  <!-- @vue-generic {IItem} -->
  <VcTable>
    <template #mobile-item>
      <!-- Custom slot content -->
    </template>
  </VcTable>
</template>

<script setup lang="ts">
import { VcTable } from "@vc-shell/framework";
</script>
```

## Best Practices
- Use this capability when you need `{ item: t }`
- Ensure proper error handling
- Follow VC-Shell naming conventions
