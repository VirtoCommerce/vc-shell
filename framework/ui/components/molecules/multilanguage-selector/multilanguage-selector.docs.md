# MultilanguageSelector

Compact circular flag button that opens a dropdown for selecting a content language. Designed for use in detail blades where entities have multilingual fields (e.g., product name, offer description, category title). This is distinct from the `LanguageSelector` settings entry, which changes the application UI locale -- `MultilanguageSelector` controls which language version of the content the user is editing.

## When to Use

- Use in detail blade toolbars to switch the editing language for multilingual content
- When you need a compact language picker with flag icons that fits in a blade header
- Do NOT use for switching the application UI locale (use `LanguageSelector` instead)

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

| Prop         | Type               | Default | Description                       |
| ------------ | ------------------ | ------- | --------------------------------- |
| `modelValue` | `string`           | `""`    | Currently selected language value |
| `options`    | `LanguageOption[]` | `[]`    | Available language options        |
| `disabled`   | `boolean`          | `false` | Disables interaction              |

Each `LanguageOption` has: `{ value: string; label: string; flag?: string }`.

## Recipe: Multilingual Product Editing Blade

A typical use case is a product detail blade where the user can edit the name and description in multiple languages:

```vue
<script setup lang="ts">
import { ref, computed } from "vue";
import { MultilanguageSelector } from "@vc-shell/framework";

const product = ref({
  names: { "en-US": "Widget", "de-DE": "Widget-Teil" },
  descriptions: { "en-US": "A useful widget.", "de-DE": "Ein nuetzliches Widget." },
});

const currentLang = ref("en-US");

const languages = [
  { value: "en-US", label: "English", flag: "/flags/us.svg" },
  { value: "de-DE", label: "Deutsch", flag: "/flags/de.svg" },
  { value: "fr-FR", label: "Francais", flag: "/flags/fr.svg" },
];

const currentName = computed({
  get: () => product.value.names[currentLang.value] ?? "",
  set: (val) => {
    product.value.names[currentLang.value] = val;
  },
});

const currentDescription = computed({
  get: () => product.value.descriptions[currentLang.value] ?? "",
  set: (val) => {
    product.value.descriptions[currentLang.value] = val;
  },
});
</script>

<template>
  <VcBlade title="Edit Product">
    <template #actions>
      <MultilanguageSelector
        v-model="currentLang"
        :options="languages"
      />
    </template>

    <VcInput
      v-model="currentName"
      label="Name"
    />
    <VcTextarea
      v-model="currentDescription"
      label="Description"
    />
  </VcBlade>
</template>
```

## Recipe: Dynamic Languages from API

Fetch available content languages from the platform instead of hardcoding them:

```typescript
import { ref, onMounted } from "vue";

const languages = ref([]);

onMounted(async () => {
  const locales = await api.getAvailableContentLocales();
  languages.value = locales.map((locale) => ({
    value: locale.code,
    label: locale.displayName,
    flag: `/flags/${locale.countryCode.toLowerCase()}.svg`,
  }));
});
```

## Details

- **Compact layout**: The button renders as a small circle showing the flag of the currently selected language. Clicking it opens a dropdown with all available options.
- **v-model binding**: The component uses `modelValue` / `update:modelValue` for two-way binding, following the standard Vue 3 v-model convention.
- **Flag images**: The `flag` property on each option is optional. When provided, it shows the flag image; otherwise, the language code text is displayed.
- **Dropdown positioning**: The dropdown is positioned relative to the button and adjusts to avoid viewport overflow.

## Tips

- Place the selector in the blade's `#actions` slot so it appears in the toolbar area alongside save/cancel buttons.
- The `disabled` prop is useful when the blade is in a read-only or loading state.
- If a language has no content yet, the form fields will be empty for that language. Consider showing a visual indicator (like a badge) on the selector to mark languages with missing translations.
- Keep the `value` field consistent with the locale codes used by your API (typically BCP 47 format like `"en-US"`, `"de-DE"`).

## Related Components

- [LanguageSelector](../language-selector/language-selector.docs.md) -- settings menu entry for UI locale switching (different purpose)
