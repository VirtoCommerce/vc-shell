---
id: vcvideo-prop-source
component: VcVideo
type: PROP
complexity: SIMPLE
category: component
tags: [prop, source]
title: "VcVideo :source prop"
description: "source property for VcVideo"
---

# Capability: source

## Type
PROP

## Description
URL of the video to be embedded

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `source`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcVideo
    :source="sourceValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcVideo } from "@vc-shell/framework";

const sourceValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need url of the video to be embedded
- Ensure proper error handling
- Follow VC-Shell naming conventions
