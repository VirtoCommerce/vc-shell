---
id: vcrating-prop-max
component: VcRating
type: PROP
complexity: SIMPLE
category: component
tags: [prop, max]
title: "VcRating :max prop"
description: "max property for VcRating"
---

# Capability: max

## Type
PROP

## Description
Maximum rating value

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `max`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcRating
    :max="maxValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcRating } from "@vc-shell/framework";

const maxValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need maximum rating value
- Ensure proper error handling
- Follow VC-Shell naming conventions
