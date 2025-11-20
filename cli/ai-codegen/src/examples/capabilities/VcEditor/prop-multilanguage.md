---
id: vceditor-prop-multilanguage
component: VcEditor
type: PROP
complexity: SIMPLE
category: component
tags: [prop, multilanguage]
title: "VcEditor :multilanguage prop"
description: "multilanguage property for VcEditor"
---

# Capability: multilanguage

## Type
PROP

## Description
Whether the editor supports multiple languages

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `multilanguage`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <VcEditor
    :multilanguage="multilanguageValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcEditor } from "@vc-shell/framework";

const multilanguageValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need whether the editor supports multiple languages
- Ensure proper error handling
- Follow VC-Shell naming conventions
