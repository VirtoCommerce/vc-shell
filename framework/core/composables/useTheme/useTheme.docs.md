# useTheme

Manages color theme registration, switching, and persistence. Themes are applied via a `data-theme` attribute on `<html>`.

## When to Use

- Switch between light/dark or custom themes at runtime
- Register module-specific themes dynamically
- When NOT to use: for one-off color overrides (use CSS custom properties directly)

## Basic Usage

```typescript
import { useTheme } from '@vc-shell/framework';

const { themes, currentThemeKey, next, setTheme, register } = useTheme();

// Register a custom theme
register({ key: 'dark', localizationKey: 'CORE.THEMES.DARK' });

// Switch to it
setTheme('dark');

// Or cycle through all registered themes
next();
```

## API

### Returns

| Property | Type | Description |
|---|---|---|
| `themes` | `Ref<DisplayTheme[]>` | All registered themes with localized `name` |
| `currentThemeKey` | `Ref<string>` | Active theme key (e.g., `"light"`, `"dark"`) |
| `currentLocalizedName` | `Ref<string>` | Localized display name of the active theme |
| `next` | `() => void` | Cycle to the next registered theme |
| `setTheme` | `(themeKey: string) => void` | Switch to a specific registered theme |
| `register` | `(themes: ThemeDefinition \| ThemeDefinition[]) => void` | Add themes to the registry |
| `unregister` | `(keys: string \| string[]) => void` | Remove themes from the registry |

### ThemeDefinition

| Field | Type | Required | Description |
|---|---|---|---|
| `key` | `string` | Yes | Unique theme identifier (used as `data-theme` value) |
| `localizationKey` | `string` | No | i18n key for the display name; falls back to capitalized `key` |

## Details

- A `"light"` theme is registered by default.
- Persistence is handled by `@vueuse/core` `useColorMode` (writes to localStorage).
- CSS should scope theme variables under `[data-theme="dark"]` selectors.

## Related

- `framework/assets/styles/theme/colors.scss` -- CSS custom property definitions
- `@vueuse/core` `useColorMode` -- underlying persistence mechanism
