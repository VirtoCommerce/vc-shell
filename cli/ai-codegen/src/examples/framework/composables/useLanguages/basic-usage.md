---
id: useLanguages-basic-usage
type: FRAMEWORK_API
category: composable
tags: [composable, i18n, localization, language]
title: "useLanguages - Basic Usage"
description: "Managing application locale and language settings"
---

# useLanguages - Basic Usage

The `useLanguages` composable manages internationalization and language settings in VC-Shell applications.

## Overview

- Change application locale
- Get current locale
- Retrieve native language names
- Format locale strings
- Get flag icons for languages
- Automatic locale persistence in localStorage

## Basic Usage

```typescript
import { useLanguages } from "@vc-shell/framework";

const { currentLocale, setLocale, getLocaleByTag } = useLanguages();

// Get current locale
console.log(currentLocale.value); // "en"

// Change locale
setLocale("fr");

// Get native language name
const languageName = getLocaleByTag("fr-FR"); // "Français"
```

## Complete Example - Language Settings

```vue
<template>
  <VcBlade title="Language Settings">
    <VcContainer class="tw-p-4">
      <VcCard header="Current Language">
        <div class="tw-p-4">
          <VcField
            label="Active Language"
            :model-value="currentLanguageName"
          />

          <VcField
            label="Locale Code"
            :model-value="currentLocale"
          />
        </div>
      </VcCard>

      <VcCard header="Available Languages" class="tw-mt-4">
        <div class="tw-p-4 tw-space-y-2">
          <VcButton
            v-for="lang in availableLanguages"
            :key="lang.code"
            :variant="lang.code === currentLocale ? 'primary' : 'outline'"
            @click="changeLanguage(lang.code)"
            class="tw-w-full"
          >
            {{ lang.name }} ({{ lang.code }})
          </VcButton>
        </div>
      </VcCard>
    </VcContainer>
  </VcBlade>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useLanguages } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { currentLocale, setLocale, getLocaleByTag } = useLanguages();
const { availableLocales } = useI18n();

// Get current language name in native form
const currentLanguageName = computed(() => {
  return getLocaleByTag(currentLocale.value) || currentLocale.value;
});

// Build list of available languages
const availableLanguages = computed(() => {
  return availableLocales.map((locale) => ({
    code: locale,
    name: getLocaleByTag(locale) || locale
  }));
});

function changeLanguage(locale: string) {
  setLocale(locale);
}
</script>
```

## Change Locale

```typescript
import { useLanguages, notification } from "@vc-shell/framework";

const { setLocale } = useLanguages();

function changeLanguage(locale: string) {
  setLocale(locale);
  notification.success(`Language changed to ${locale}`);

  // Locale is automatically saved to localStorage
  // and synced with Vue I18n and Vee-Validate
}

// Usage
changeLanguage("en"); // English
changeLanguage("fr"); // French
changeLanguage("es"); // Spanish
changeLanguage("de"); // German
```

## Get Native Language Names

```typescript
import { useLanguages } from "@vc-shell/framework";

const { getLocaleByTag } = useLanguages();

// Get native language names
const englishName = getLocaleByTag("en");    // "English"
const frenchName = getLocaleByTag("fr");     // "Français"
const spanishName = getLocaleByTag("es");    // "Español"
const germanName = getLocaleByTag("de");     // "Deutsch"
const japaneseName = getLocaleByTag("ja");   // "日本語"

// With region codes
const usEnglish = getLocaleByTag("en-US");   // "English"
const ukEnglish = getLocaleByTag("en-GB");   // "English"
const frenchFrance = getLocaleByTag("fr-FR"); // "Français"
```

## Watch Locale Changes

```vue
<script setup lang="ts">
import { watch } from "vue";
import { useLanguages } from "@vc-shell/framework";

const { currentLocale } = useLanguages();

// Watch for locale changes
watch(currentLocale, (newLocale, oldLocale) => {
  console.log(`Language changed from ${oldLocale} to ${newLocale}`);

  // Update document language attribute
  document.documentElement.lang = newLocale;

  // Perform actions when language changes
  reloadData();
  updateDocumentTitle();
});

function reloadData() {
  // Reload localized data (e.g., categories, descriptions)
}

function updateDocumentTitle() {
  // Update page title with new locale
}
</script>
```

## Format Locale Strings

```typescript
import { useLanguages } from "@vc-shell/framework";

const { resolveCamelCaseLocale } = useLanguages();

// Convert camelCase to standard format
const locale1 = resolveCamelCaseLocale("enUS");  // "en-US"
const locale2 = resolveCamelCaseLocale("frFR");  // "fr-FR"
const locale3 = resolveCamelCaseLocale("esES");  // "es-ES"

// Already standard format - returns as-is
const locale4 = resolveCamelCaseLocale("en-GB"); // "en-GB"
const locale5 = resolveCamelCaseLocale("de");    // "de"

// Invalid locale - falls back to "en"
const locale6 = resolveCamelCaseLocale("xyz");   // "en"
```

## Get Flag Icons

```vue
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useLanguages } from "@vc-shell/framework";

const { getFlag } = useLanguages();

const flags = ref<Record<string, string>>({});

onMounted(async () => {
  // Load flag icons for languages
  flags.value = {
    en: await getFlag("en"),
    fr: await getFlag("fr"),
    es: await getFlag("es"),
    de: await getFlag("de")
  };
});
</script>

<template>
  <div class="language-flags">
    <img
      v-for="(flag, lang) in flags"
      :key="lang"
      :src="flag"
      :alt="lang"
      class="tw-w-6 tw-h-4"
    />
  </div>
</template>
```

## Get Country Codes

```typescript
import { useLanguages } from "@vc-shell/framework";

const { getCountryCode } = useLanguages();

// Get ISO 3166-1 alpha-2 country codes
const usCode = getCountryCode("en");  // "us"
const frCode = getCountryCode("fr");  // "fr"
const esCode = getCountryCode("es");  // "es"
const deCode = getCountryCode("de");  // "de"
const jpCode = getCountryCode("ja");  // "jp"
```

## Computed Language Display

```vue
<script setup lang="ts">
import { computed } from "vue";
import { useLanguages } from "@vc-shell/framework";

const { currentLocale, getLocaleByTag } = useLanguages();

// Display current language info
const languageInfo = computed(() => {
  const locale = currentLocale.value;
  const name = getLocaleByTag(locale);

  return {
    locale,
    name,
    displayText: `${name} (${locale})`
  };
});
</script>

<template>
  <div class="language-display">
    <span>{{ languageInfo.displayText }}</span>
  </div>
</template>
```

## Locale Persistence

```typescript
import { useLanguages } from "@vc-shell/framework";

const { setLocale, currentLocale } = useLanguages();

// Locale is automatically saved to localStorage as "VC_LANGUAGE_SETTINGS"
setLocale("fr");

// On next app load, saved locale is automatically restored
console.log(currentLocale.value); // "fr" (if previously saved)

// No manual localStorage handling needed!
```

## Integration with Vue I18n

```vue
<script setup lang="ts">
import { useLanguages } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { setLocale, currentLocale } = useLanguages();
const { t, locale } = useI18n();

// useLanguages automatically syncs with Vue I18n
// When you call setLocale(), it updates both:
// 1. currentLocale (from useLanguages)
// 2. locale (from useI18n)

function changeLanguage(newLocale: string) {
  setLocale(newLocale);

  // Now both are in sync:
  console.log(currentLocale.value); // "fr"
  console.log(locale.value);        // "fr"

  // Translations automatically update
  console.log(t("COMMON.SAVE")); // "Enregistrer" (if French)
}
</script>

<template>
  <div>
    <p>{{ t("COMMON.WELCOME") }}</p>
    <VcButton @click="changeLanguage('fr')">
      {{ t("COMMON.CHANGE_LANGUAGE") }}
    </VcButton>
  </div>
</template>
```

## Complete Language Info Helper

```typescript
import { useLanguages } from "@vc-shell/framework";

const { getLocaleByTag, getFlag, getCountryCode, resolveCamelCaseLocale } = useLanguages();

// Create comprehensive language info
async function getLanguageInfo(localeInput: string) {
  // Normalize locale format
  const locale = resolveCamelCaseLocale(localeInput);

  // Get all info
  const name = getLocaleByTag(locale);
  const flag = await getFlag(locale);
  const countryCode = getCountryCode(locale);

  return {
    locale,           // "en-US"
    name,            // "English"
    flag,            // URL to flag icon
    countryCode,     // "us"
    displayName: `${name} (${locale})`
  };
}

// Usage
const info = await getLanguageInfo("enUS");
console.log(info);
// {
//   locale: "en-US",
//   name: "English",
//   flag: "data:image/svg+xml...",
//   countryCode: "us",
//   displayName: "English (en-US)"
// }
```

## API Reference

```typescript
interface IUseLanguages {
  // Change application locale
  setLocale: (locale: string) => void;

  // Current active locale (reactive)
  currentLocale: ComputedRef<string>;

  // Get native language name from locale tag
  getLocaleByTag: (localeTag: string) => string | undefined;

  // Format camelCase locale to standard format
  resolveCamelCaseLocale: (locale: string) => string;

  // Get flag icon URL for language
  getFlag: (language: string) => Promise<string>;

  // Get ISO country code for language
  getCountryCode: (language: string) => string;
}
```

## Important Notes

### ✅ DO

- Use `setLocale()` to change language (automatic sync with Vue I18n)
- Use `getLocaleByTag()` for native language names
- Use standard locale formats (en-US, fr-FR)
- Watch `currentLocale` for language changes
- Let composable handle localStorage persistence

### ❌ DON'T

- Don't manually set Vue I18n locale (use `setLocale()` instead)
- Don't manually manage localStorage for locale
- Don't use non-standard locale formats without `resolveCamelCaseLocale()`
- Don't assume locale format (always normalize first)

## Locale Formats

### Standard Formats (Recommended)
```typescript
"en"      // English
"en-US"   // English (United States)
"en-GB"   // English (United Kingdom)
"fr"      // French
"fr-FR"   // French (France)
"es"      // Spanish
"de"      // German
```

### Non-Standard Formats (Use resolveCamelCaseLocale)
```typescript
"enUS"    // Convert to "en-US"
"frFR"    // Convert to "fr-FR"
"esES"    // Convert to "es-ES"
```

## Common Patterns

### Display Current Language

```vue
<template>
  <span>{{ currentLanguageName }}</span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useLanguages } from "@vc-shell/framework";

const { currentLocale, getLocaleByTag } = useLanguages();

const currentLanguageName = computed(() =>
  getLocaleByTag(currentLocale.value) || currentLocale.value
);
</script>
```

### Language Selector Dropdown

```vue
<template>
  <VcSelect
    v-model="selectedLocale"
    :options="languageOptions"
    @update:model-value="onLanguageChange"
  />
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useLanguages } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { currentLocale, setLocale, getLocaleByTag } = useLanguages();
const { availableLocales } = useI18n();

const selectedLocale = ref(currentLocale.value);

const languageOptions = computed(() =>
  availableLocales.map((locale) => ({
    value: locale,
    label: getLocaleByTag(locale) || locale
  }))
);

function onLanguageChange(locale: string) {
  setLocale(locale);
}
</script>
```

## See Also

- [language-switcher.md](./language-switcher.md) - Language switcher component
- [localized-content.md](./localized-content.md) - Working with localized content
- [Vue I18n Documentation](https://vue-i18n.intlify.dev/) - Internationalization guide

**Reference:** [Official VC-Shell Documentation - useLanguages](https://docs.virtocommerce.org/platform/developer-guide/custom-apps-development/vc-shell/Essentials/composables/useLanguages/)
