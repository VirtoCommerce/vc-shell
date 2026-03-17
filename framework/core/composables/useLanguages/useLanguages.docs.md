# useLanguages

Provides access to the language service for locale management: getting/setting the current locale, resolving locale tags, and fetching country flags.

Also exports `provideLanguages()` for framework-level initialization.

## When to Use

- To read or switch the current application locale
- To resolve locale tags (e.g., `en-US`) to display names or country codes
- To fetch flag images for language selectors
- When NOT to use: if you only need i18n translations, use Vue I18n's `useI18n()` directly

## Basic Usage

```typescript
import { useLanguages } from '@vc-shell/framework';

const { currentLocale, setLocale, getFlag } = useLanguages();
```

## API

### Parameters

None.

### Returns (`ILanguageService`)

| Property / Method | Type | Description |
|-------------------|------|-------------|
| `currentLocale` | `ComputedRef<string>` | The currently active locale code |
| `setLocale` | `(locale: string) => void` | Switches the application locale |
| `getLocaleByTag` | `(localeTag: string) => string \| undefined` | Resolves a locale tag to its display string |
| `resolveCamelCaseLocale` | `(locale: string) => string` | Converts a locale code to camelCase format (e.g., `en-US` to `enUs`) |
| `getFlag` | `(language: string) => Promise<string>` | Fetches a flag image URL for the given language |
| `getCountryCode` | `(language: string) => string` | Extracts the country code from a language tag |

### Additional Exports

| Export | Description |
|--------|-------------|
| `provideLanguages()` | Creates and provides the language service via Vue injection. Returns existing service if already provided. |

## Common Patterns

### Language selector component

```vue
<script setup lang="ts">
import { useLanguages } from '@vc-shell/framework';
import { ref, onMounted } from 'vue';

const { currentLocale, setLocale, getFlag, getCountryCode } = useLanguages();
const flagUrl = ref('');

onMounted(async () => {
  flagUrl.value = await getFlag(currentLocale.value);
});

function switchLocale(locale: string) {
  setLocale(locale);
}
</script>
```

## Related

- Vue I18n `useI18n()` -- for translation strings within components
- [useDynamicProperties](../useDynamicProperties/useDynamicProperties.docs.md) -- uses locale for multilanguage property values
