---
id: vctable-slot-notfound
component: VcTable
type: SLOT
complexity: MODERATE
category: component
tags: [slot, notfound]
title: "VcTable #notfound slot"
description: "notfound slot for VcTable"
---

# Capability: notfound

## Type
SLOT

## Description
-

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Slots:**
- `notfound`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
MEDIUM

## Complete Working Example
```vue
<template>
  <!-- @vue-generic {IItem} -->
  <VcTable>
    <template #notfound>
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
