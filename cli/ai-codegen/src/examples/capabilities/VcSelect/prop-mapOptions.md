---
id: vcselect-prop-mapOptions
component: VcSelect
type: PROP
complexity: SIMPLE
category: component
tags: [prop, mapOptions]
title: "VcSelect :mapOptions prop"
description: "mapOptions property for VcSelect"
---

# Capability: mapOptions

## Type
PROP

## Description
Map labels of model from options array

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `mapOptions`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <!-- @vue-generic {string} -->
  <VcSelect
    :mapOptions="mapOptionsValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcSelect } from "@vc-shell/framework";

const mapOptionsValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need map labels of model from options array
- Ensure proper error handling
- Follow VC-Shell naming conventions
