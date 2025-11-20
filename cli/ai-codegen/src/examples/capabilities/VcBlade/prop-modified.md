---
id: vcblade-prop-modified
component: VcBlade
type: PROP
complexity: SIMPLE
category: component
tags: [prop, modified]
title: "VcBlade :modified prop"
description: "modified property for VcBlade"
---

# Capability: modified

## Type
PROP

## Description
Indicates whether there are unsaved changes in the blade content. Defaults to `undefined`.

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `modified`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcBlade
    :modified="modifiedValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcBlade } from "@vc-shell/framework";

const modifiedValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need indicates whether there are unsaved changes in the blade content. defaults to `undefined`.
- Ensure proper error handling
- Follow VC-Shell naming conventions
