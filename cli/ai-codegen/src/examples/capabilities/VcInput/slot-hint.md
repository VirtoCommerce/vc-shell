---
id: vcinput-slot-hint
component: VcInput
type: SLOT
complexity: MODERATE
category: component
tags: [slot, hint]
title: "VcInput #hint slot"
description: "hint slot for VcInput"
---

# Capability: hint

## Type
SLOT

## Description
Custom hint slot

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Slots:**
- `hint`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcInput>
    <template #hint>
      <!-- Custom slot content -->
    </template>
  </VcInput>
</template>

<script setup lang="ts">
import { VcInput } from "@vc-shell/framework";
</script>
```

## Best Practices
- Use this capability when you need custom hint slot
- Ensure proper error handling
- Follow VC-Shell naming conventions
