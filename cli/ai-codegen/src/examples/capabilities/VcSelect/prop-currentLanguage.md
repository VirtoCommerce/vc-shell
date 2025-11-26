---
id: vcselect-prop-currentLanguage
component: VcSelect
type: PROP
complexity: SIMPLE
category: component
tags: [prop, currentLanguage]
title: "VcSelect :currentLanguage prop"
description: "currentLanguage property for VcSelect"
---

# Capability: currentLanguage

## Type
PROP

## Description
Current language code for multilanguage support

## When to Use
- General purpose usage
- When building custom UI

## Required Props/Slots/Events
**Props:**
- `currentLanguage`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
SIMPLE

## Complete Working Example
```vue
<template>
  <!-- @vue-generic {string} -->
  <VcSelect
    :currentLanguage="currentLanguageValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcSelect } from "@vc-shell/framework";

const currentLanguageValue = ref(/* initial value */);
</script>
```

## Best Practices
- Use this capability when you need current language code for multilanguage support
- Ensure proper error handling
- Follow VC-Shell naming conventions
