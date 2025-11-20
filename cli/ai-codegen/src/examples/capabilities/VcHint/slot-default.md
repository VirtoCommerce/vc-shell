---
id: vchint-slot-default
component: VcHint
type: SLOT
complexity: MODERATE
category: component
tags: [slot, default]
title: "VcHint #default slot"
description: "default slot for VcHint"
---

# Capability: default

## Type
SLOT

## Description
Content to display inside the hint

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Slots:**
- `default`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
MEDIUM

## Complete Working Example
```vue
<template>
  <VcHint>
    <template #default>
      <!-- Custom slot content -->
    </template>
  </VcHint>
</template>

<script setup lang="ts">
import { VcHint } from "@vc-shell/framework";
</script>
```

## Best Practices
- Use this capability when you need content to display inside the hint
- Ensure proper error handling
- Follow VC-Shell naming conventions
