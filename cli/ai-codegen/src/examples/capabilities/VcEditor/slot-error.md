---
id: vceditor-slot-error
component: VcEditor
type: SLOT
complexity: MODERATE
category: component
tags: [slot, error]
title: "VcEditor #error slot"
description: "error slot for VcEditor"
---

# Capability: error

## Type
SLOT

## Description
Custom content for error message display

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Slots:**
- `error`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
MEDIUM

## Complete Working Example
```vue
<template>
  <VcEditor>
    <template #error>
      <!-- Custom slot content -->
    </template>
  </VcEditor>
</template>

<script setup lang="ts">
import { VcEditor } from "@vc-shell/framework";
</script>
```

## Best Practices
- Use this capability when you need custom content for error message display
- Ensure proper error handling
- Follow VC-Shell naming conventions
