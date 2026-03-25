# Multilanguage Fields Pattern

Add multilanguage content editing to a detail blade. This is for switching which language version of entity data the user edits — distinct from the UI locale (app translation language).

---

## Prerequisites

- Entity has multilingual fields stored as `Record<string, string>` (keyed by locale code like `"en-US"`, `"de-DE"`)
- Module registers its own locale files via `defineAppModule({ locales })`

---

## Step 1 — Load Available Languages

Create or reuse a composable that fetches content languages from the API and exposes a reactive `currentLocale`, options list, and flag URLs.

```ts
import { ref, computed, watchEffect, onBeforeUnmount, Ref } from "vue";
import { useLanguages } from "@vc-shell/framework";

const currentLocale = ref("en-US");
const languages = ref<string[]>([]);
const localesOptions = ref<{ value: string; label: string }[]>([]);

export function useMultilanguage() {
  const { getLocaleByTag, getFlag } = useLanguages();

  const languageOptionsWithFlags = ref<{ value: string; label: string; flag?: string }[]>([]);
  const isMultilanguage = computed(() => localesOptions.value.length > 1);

  async function getLanguages() {
    // Fetch from your API client
    languages.value = await fetchAvailableLanguages();
    localesOptions.value = languages.value.map((x) => ({
      label: getLocaleByTag(x) || x,
      value: x,
    }));
  }

  // Resolve flags in parallel
  watchEffect(async () => {
    if (!isMultilanguage.value) return;
    languageOptionsWithFlags.value = await Promise.all(
      localesOptions.value.map(async (lang) => ({
        ...lang,
        flag: await getFlag(lang.value),
      })),
    );
  });

  const setLocale = (locale: string) => {
    currentLocale.value = locale;
  };

  // Reset on unmount so next blade starts fresh
  onBeforeUnmount(() => {
    currentLocale.value = "en-US";
  });

  return { currentLocale, localesOptions, languageOptionsWithFlags, isMultilanguage, setLocale, getLanguages };
}
```

Key points:
- `currentLocale` and `languages` are module-level refs (shared across blades in the same module).
- Deduplicate concurrent `getLanguages` calls with a promise guard if multiple blades mount simultaneously.
- `useLanguages()` from the framework provides `getLocaleByTag` (display name) and `getFlag` (async flag URL).

---

## Step 2 — Place MultilanguageSelector in the Blade

Use the blade's `#actions` slot to position the language picker in the toolbar area.

```vue
<template>
  <VcBlade :title="bladeTitle" :toolbar-items="bladeToolbar">
    <template #actions>
      <MultilanguageSelector
        v-if="isMultilanguage"
        v-model="currentLocale"
        :options="languageOptionsWithFlags"
      />
    </template>

    <!-- form fields below -->
  </VcBlade>
</template>
```

Import `MultilanguageSelector` from `@vc-shell/framework`. It renders as a compact circular flag button that opens a dropdown. Only show it when `isMultilanguage` is true (more than one language available).

---

## Step 3 — Create Localized Computed Properties

For each multilingual field on your entity, create a writable computed that reads/writes the value for `currentLocale`.

```ts
const { currentLocale } = useMultilanguage();

// Assuming item.value is the entity with multilingual fields
const localizedName = computed({
  get: () => item.value?.names?.[currentLocale.value] ?? "",
  set: (val: string) => {
    if (item.value) {
      if (!item.value.names) item.value.names = {};
      item.value.names[currentLocale.value] = val;
    }
  },
});

const localizedDescription = computed({
  get: () => item.value?.descriptions?.[currentLocale.value] ?? "",
  set: (val: string) => {
    if (item.value) {
      if (!item.value.descriptions) item.value.descriptions = {};
      item.value.descriptions[currentLocale.value] = val;
    }
  },
});
```

Guard against undefined with `??` — when a language has no content yet, the field shows empty.

---

## Step 4 — Wire Form Fields with Multilanguage Props

`VcInput` and `VcEditor` both accept `:multilanguage` and `:current-language` props. These add a visual language indicator on the field label.

```vue
<VcInput
  v-model="localizedName"
  :label="t('MY_MODULE.FIELDS.NAME')"
  multilanguage
  :current-language="currentLocale"
/>

<VcEditor
  v-model="localizedDescription"
  :label="t('MY_MODULE.FIELDS.DESCRIPTION')"
  multilanguage
  :current-language="currentLocale"
/>
```

- `multilanguage` (boolean) — enables the language indicator badge on the label.
- `current-language` (string) — the locale code shown in the indicator (e.g., `"de-DE"`).
- The actual value switching is handled by your localized computed, not by the component itself.

---

## Step 5 — Module Locale Files

Register translation files in your module definition so the framework merges them into the global i18n instance.

```
modules/my-module/
  locales/
    en.json
    de.json
  index.ts
```

```ts
// modules/my-module/index.ts
import * as en from "./locales/en.json";
import * as de from "./locales/de.json";

export default defineAppModule({
  locales: { en, de },
  // ...other module config
});
```

Locale files use nested JSON with a module namespace:

```json
{
  "MY_MODULE": {
    "FIELDS": {
      "NAME": "Name",
      "DESCRIPTION": "Description"
    }
  }
}
```

The framework calls `i18n.global.mergeLocaleMessage()` during module installation — no manual merge needed.

---

## Complete Blade Example

```vue
<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { MultilanguageSelector } from "@vc-shell/framework";
import { useMultilanguage } from "../composables/useMultilanguage";

const { t } = useI18n();
const { currentLocale, languageOptionsWithFlags, isMultilanguage, getLanguages } = useMultilanguage();

const props = defineProps<{ param?: { item: Record<string, any> } }>();
const item = computed(() => props.param?.item);

// Call once on blade open
getLanguages();

const localizedName = computed({
  get: () => item.value?.names?.[currentLocale.value] ?? "",
  set: (val: string) => {
    if (item.value) item.value.names[currentLocale.value] = val;
  },
});
</script>

<template>
  <VcBlade :title="t('MY_MODULE.BLADE_TITLE')">
    <template #actions>
      <MultilanguageSelector
        v-if="isMultilanguage"
        v-model="currentLocale"
        :options="languageOptionsWithFlags"
      />
    </template>

    <VcInput
      v-model="localizedName"
      :label="t('MY_MODULE.FIELDS.NAME')"
      multilanguage
      :current-language="currentLocale"
    />
  </VcBlade>
</template>
```
