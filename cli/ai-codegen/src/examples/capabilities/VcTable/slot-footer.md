---
id: vctable-slot-footer
component: VcTable
type: SLOT
complexity: MODERATE
category: component
tags: [slot, footer]
title: "VcTable #footer slot"
description: "footer slot for VcTable"
---

# Capability: footer

## Type
SLOT

## Description
-

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Slots:**
- `footer`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
MEDIUM

## Complete Working Example
```vue
<template>
  <!-- @vue-generic {IItem} -->
  <VcTable>
    <template #footer>
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
