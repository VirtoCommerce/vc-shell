# useLanguages

Provides access to the language service for locale management: getting/setting the current locale, resolving locale tags, and fetching country flags. The service is created once via `provideLanguages()` at the framework level and shared through Vue's injection system. If called outside an injection context (e.g., during module initialization), a fallback singleton service is used so the composable never throws.

Also exports `provideLanguages()` for framework-level initialization.

## When to Use

- To read or switch the current application locale programmatically
- To resolve locale tags (e.g., `en-US`) to display names or country codes for UI rendering
- To fetch flag images for language selector dropdowns
- When NOT to use: if you only need i18n translation strings, use Vue I18n's `useI18n()` directly -- it is lighter and does not require the language service

## Quick Start

```vue
<script setup lang="ts">
import { useLanguages } from '@vc-shell/framework';
import { ref, onMounted } from 'vue';

const { currentLocale, setLocale, getFlag, getCountryCode } = useLanguages();
const flagUrl = ref('');

onMounted(async () => {
  flagUrl.value = await getFlag(currentLocale.value);
});

function switchToGerman() {
  setLocale('de-DE');
}
</script>

<template>
  <div class="tw-flex tw-items-center tw-gap-2">
    <img v-if="flagUrl" :src="flagUrl" alt="flag" class="tw-w-6 tw-h-4" />
    <span>{{ currentLocale }}</span>
    <VcButton size="sm" @click="switchToGerman">Deutsch</VcButton>
  </div>
</template>
```

## API

### Parameters

None.

### Returns (`ILanguageService`)

| Property / Method | Type | Description |
|-------------------|------|-------------|
| `currentLocale` | `ComputedRef<string>` | The currently active locale code (e.g., `"en-US"`, `"de-DE"`). |
| `setLocale` | `(locale: string) => void` | Switches the application locale. This updates `vue-i18n`'s locale and triggers re-rendering of all translated text. |
| `getLocaleByTag` | `(localeTag: string) => string \| undefined` | Resolves a locale tag to its display string (e.g., `"en-US"` to `"English (United States)"`). Returns `undefined` if the tag is not recognized. |
| `resolveCamelCaseLocale` | `(locale: string) => string` | Converts a locale code to camelCase format (e.g., `"en-US"` to `"enUs"`). Useful for dynamic property access on objects keyed by locale. |
| `getFlag` | `(language: string) => Promise<string>` | Fetches a flag image URL for the given language/locale. Returns a promise because flags may be loaded lazily. |
| `getCountryCode` | `(language: string) => string` | Extracts the country code from a language tag (e.g., `"en-US"` to `"US"`, `"de-DE"` to `"DE"`). |

### Additional Exports

| Export | Description |
|--------|-------------|
| `provideLanguages()` | Creates and provides the language service via Vue injection. Returns existing service if already provided in the current tree. Falls back to a module-level singleton if no injection context is available. |

## How It Works

The language service is a thin wrapper around Vue I18n's locale management with additional utilities for locale metadata. `provideLanguages()` creates the service and stores it via `provide()`. When `useLanguages()` is called:

1. It checks for an injection context (`hasInjectionContext()`).
2. If inside a component, it `inject`s the service from the tree.
3. If no service is found, it throws an `InjectionError`.
4. If there is no injection context at all (called outside setup), it returns a fallback singleton service.

The fallback behavior means `useLanguages()` is safe to call in module `install()` functions and other non-component contexts.

## Recipe: Language Selector Dropdown

```vue
<script setup lang="ts">
import { useLanguages } from '@vc-shell/framework';
import { ref, onMounted, watch } from 'vue';

const { currentLocale, setLocale, getFlag } = useLanguages();

const availableLocales = ['en-US', 'de-DE', 'fr-FR', 'es-ES'];
const flags = ref<Record<string, string>>({});

onMounted(async () => {
  // Pre-fetch all flags in parallel
  const entries = await Promise.all(
    availableLocales.map(async (locale) => [locale, await getFlag(locale)] as const),
  );
  flags.value = Object.fromEntries(entries);
});

function onLocaleChange(locale: string) {
  setLocale(locale);
}
</script>

<template>
  <div class="language-picker">
    <div
      v-for="locale in availableLocales"
      :key="locale"
      class="tw-flex tw-items-center tw-gap-2 tw-cursor-pointer tw-p-2"
      :class="{ 'tw-bg-primary-50': locale === currentLocale }"
      @click="onLocaleChange(locale)"
    >
      <img v-if="flags[locale]" :src="flags[locale]" class="tw-w-6 tw-h-4" />
      <span>{{ locale }}</span>
    </div>
  </div>
</template>
```

## Recipe: Locale-Aware Dynamic Property Display

```typescript
import { useLanguages } from '@vc-shell/framework';
import { useDynamicProperties } from '@vc-shell/framework';

const { currentLocale } = useLanguages();
const { getPropertyValue } = useDynamicProperties(/* ... */);

// Read a multilanguage property value for the current locale
const displayValue = computed(() =>
  getPropertyValue(property.value, currentLocale.value),
);
```

## Tips

- **`setLocale` triggers a full re-render of translated text.** This is expected behavior from Vue I18n. If your app has many translated strings, the switch may cause a brief layout recalculation. There is no way to avoid this.
- **`getFlag` is async.** Flag images may be loaded from a CDN or bundled as lazy imports. Always await the result before using it in templates.
- **Fallback singleton is not reactive to injection changes.** If `provideLanguages()` is called after `useLanguages()` was already invoked outside an injection context, the fallback instance is not replaced. This is rarely an issue in practice since `provideLanguages()` runs before module installation.
- **`resolveCamelCaseLocale` is useful for object property access.** Platform API responses sometimes key multilanguage data by camelCase locale (e.g., `{ enUs: "Hello", deDe: "Hallo" }`).

## Related

- Vue I18n `useI18n()` -- for translation strings within components
- [useDynamicProperties](../useDynamicProperties/useDynamicProperties.docs.md) -- uses locale for multilanguage property values
- `framework/core/services/language-service.ts` -- underlying service implementation
