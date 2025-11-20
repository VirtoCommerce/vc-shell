---
id: vcform-slot-default
component: VcForm
type: SLOT
complexity: MODERATE
category: component
tags: [slot, default]
title: "VcForm #default slot"
description: "default slot for VcForm"
---

# Capability: default

## Type
SLOT

## Description
Content of the form

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
  <VcForm>
    <template #default>
      <!-- Custom slot content -->
    </template>
  </VcForm>
</template>

<script setup lang="ts">
import { VcForm } from "@vc-shell/framework";
</script>
```

## Best Practices
- Use this capability when you need content of the form
- Ensure proper error handling
- Follow VC-Shell naming conventions
