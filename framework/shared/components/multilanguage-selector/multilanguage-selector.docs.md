# MultilanguageSelector

Compact circular flag button that opens a dropdown for selecting a content language. Designed for use in detail blades where entities have multilingual fields (e.g., product name, offer description).

## When to Use

- Use in detail blade toolbars to switch the editing language for multilingual content
- When you need a compact language picker with flag icons
- Do NOT use for switching the application UI locale (use LanguageSelector instead)

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from "vue";
import { MultilanguageSelector } from "@vc-shell/framework";

const currentLang = ref("en-US");

const languages = [
  { value: "en-US", label: "English", flag: "/flags/us.svg" },
  { value: "de-DE", label: "Deutsch", flag: "/flags/de.svg" },
];
</script>

<template>
  <MultilanguageSelector
    v-model="currentLang"
    :options="languages"
  />
</template>
```

## Key Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string` | `""` | Currently selected language value |
| `options` | `LanguageOption[]` | `[]` | Available language options |
| `disabled` | `boolean` | `false` | Disables interaction |

Each `LanguageOption` has: `{ value: string; label: string; flag?: string }`.

## Common Patterns

### Disabled state

```vue
<MultilanguageSelector
  v-model="currentLang"
  :options="languages"
  :disabled="true"
/>
```

## Related Components

- [LanguageSelector](../language-selector/language-selector.docs.md) -- settings menu entry for UI locale switching
