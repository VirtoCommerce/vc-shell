---
id: vcbutton-slot-default
component: VcButton
type: SLOT
complexity: MODERATE
category: component
tags: [slot, default]
title: "VcButton #default slot"
description: "default slot for VcButton"
---

# Capability: default

## Type
SLOT

## Description
Content to display inside the button

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
  <VcButton>
    <template #default>
      <!-- Custom slot content -->
    </template>
  </VcButton>
</template>

<script setup lang="ts">
import { VcButton } from "@vc-shell/framework";
</script>
```

## Best Practices
- Use this capability when you need content to display inside the button
- Ensure proper error handling
- Follow VC-Shell naming conventions
