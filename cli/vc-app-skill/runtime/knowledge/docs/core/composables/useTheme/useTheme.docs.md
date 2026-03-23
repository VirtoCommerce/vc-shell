# useTheme

Manages color theme registration, switching, and persistence. Themes are applied via a `data-theme` attribute on `<html>`, and the active theme key is persisted to localStorage via `@vueuse/core`'s `useColorMode`. The composable maintains a global registry of theme definitions, supports runtime registration/unregistration from modules, and provides both explicit (`setTheme`) and sequential (`next`) theme switching. A default `"light"` theme is always registered out of the box.

## When to Use

- Switch between light/dark or custom themes at runtime
- Register module-specific themes dynamically (e.g., a "high-contrast" theme from an accessibility module)
- Build a theme picker UI with localized display names
- When NOT to use: for one-off color overrides (use CSS custom properties directly in your component styles)

## Quick Start

```vue
<script setup lang="ts">
import { useTheme } from '@vc-shell/framework';

const { themes, currentThemeKey, currentLocalizedName, next, setTheme, register } = useTheme();

// Register a dark theme from your module
register({ key: 'dark', localizationKey: 'CORE.THEMES.DARK' });

// Switch to it explicitly
setTheme('dark');

// Or cycle through all registered themes (light -> dark -> light -> ...)
next();
</script>

<template>
  <div>
    <p>Current theme: {{ currentLocalizedName }} ({{ currentThemeKey }})</p>
    <VcButton @click="next">Next Theme</VcButton>
  </div>
</template>
```

## API

### Returns

| Property | Type | Description |
|---|---|---|
| `themes` | `ComputedRef<DisplayTheme[]>` | All registered themes with their `key` and localized `name`. Reactive -- updates when themes are registered/unregistered. |
| `currentThemeKey` | `Ref<string>` | Active theme key (e.g., `"light"`, `"dark"`). Two-way reactive -- setting it switches the theme. |
| `currentLocalizedName` | `ComputedRef<string>` | Localized display name of the active theme (e.g., "Light", "Dark"). Falls back to capitalized key. |
| `next` | `() => void` | Cycle to the next registered theme in order. Wraps around at the end. |
| `setTheme` | `(themeKey: string) => void` | Switch to a specific registered theme. Logs a warning if the key is not registered. |
| `register` | `(themes: ThemeDefinition \| ThemeDefinition[]) => void` | Add one or more themes to the global registry. Duplicates (by key) are silently ignored. |
| `unregister` | `(keys: string \| string[]) => void` | Remove themes from the registry by key. |

### ThemeDefinition

| Field | Type | Required | Description |
|---|---|---|---|
| `key` | `string` | Yes | Unique theme identifier. Used as the `data-theme` attribute value on `<html>` and as the localStorage persistence key. |
| `localizationKey` | `string` | No | i18n key for the display name (e.g., `"CORE.THEMES.DARK"`). Falls back to the capitalized `key` (e.g., `"Dark"`). |

### DisplayTheme

| Field | Type | Description |
|---|---|---|
| `key` | `string` | Theme identifier |
| `name` | `string` | Localized display name, resolved from `localizationKey` or capitalized `key` |

## How It Works

1. **Registration**: Themes are stored in a module-level `Ref<ThemeDefinition[]>` array. `register()` appends new definitions (skipping duplicates), and `unregister()` removes by key.

2. **Switching**: `@vueuse/core`'s `useColorMode` handles the `data-theme` attribute on `<html>` and persistence to localStorage. The `useCycleList` helper enables `next()` to cycle through registered theme keys.

3. **Reactivity**: A `watchEffect` syncs the cycle-list state to `useColorMode`'s mode whenever the active theme changes.

4. **Localization**: Display names are resolved via `vue-i18n`'s `t()` function using the `localizationKey`. If no key is provided, the theme's `key` is capitalized with lodash.

## Recipe: Module That Registers a Theme on Install

```typescript
// my-module/index.ts
import type { App } from 'vue';
import { useTheme } from '@vc-shell/framework';

export default {
  install(app: App) {
    const { register } = useTheme();

    register([
      { key: 'ocean', localizationKey: 'MY_MODULE.THEMES.OCEAN' },
      { key: 'forest', localizationKey: 'MY_MODULE.THEMES.FOREST' },
    ]);
  },
};
```

Then define your theme's CSS variables scoped by the `data-theme` attribute:

```scss
// my-module/styles/themes.scss
[data-theme="ocean"] {
  --primary-500: #0077b6;
  --primary-600: #005f8d;
  --bg-surface: #e0f7fa;
}

[data-theme="forest"] {
  --primary-500: #2d6a4f;
  --primary-600: #1b4332;
  --bg-surface: #d8f3dc;
}
```

## Recipe: Theme Picker Dropdown

```vue
<script setup lang="ts">
import { useTheme } from '@vc-shell/framework';

const { themes, currentThemeKey, setTheme } = useTheme();
</script>

<template>
  <VcSelect
    :model-value="currentThemeKey"
    :options="themes"
    option-value="key"
    option-label="name"
    label="Theme"
    @update:model-value="setTheme"
  />
</template>
```

## Tips

- **The `"light"` theme is always registered.** You cannot unregister it without side effects. If you need to replace the default, register your custom theme and use `setTheme()` to switch away from light.
- **Theme persistence survives page reloads.** `useColorMode` writes to `localStorage` under the key `vueuse-color-scheme`. If a user selects "dark", it will be restored on the next visit.
- **Theme key becomes a CSS selector.** Since the key is set as `data-theme="yourKey"` on `<html>`, choose URL-safe, lowercase keys without spaces (e.g., `"high-contrast"`, not `"High Contrast"`).
- **`setTheme` with an unregistered key is a no-op.** It logs a warning but does not change the active theme. Always `register()` before calling `setTheme()`.

## Related

- `framework/assets/styles/theme/colors.scss` -- CSS custom property definitions for the default light theme
- `@vueuse/core` `useColorMode` -- underlying persistence and attribute management
- `@vueuse/core` `useCycleList` -- powers the `next()` cycling behavior
