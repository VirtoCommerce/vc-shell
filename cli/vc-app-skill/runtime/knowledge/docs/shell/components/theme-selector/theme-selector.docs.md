# ThemeSelector

Settings menu entry that shows the current theme and opens a cascading submenu to switch between registered themes. Uses the `useTheme()` composable for theme management and shows a toast notification when the theme changes, confirming the switch to the user.

## When to Use

- Use inside the settings menu as a theme switching control
- When the application has multiple registered themes (light, dark, custom brand themes, etc.)
- Do NOT use standalone outside the settings menu context (it depends on SettingsMenu infrastructure)

## Basic Usage

```vue
<script setup lang="ts">
import { ThemeSelector } from "@vc-shell/framework";
</script>

<template>
  <ThemeSelector />
</template>
```

Typically registered through the settings menu service:

```ts
import { useSettingsMenu } from "@vc-shell/framework";
import { ThemeSelector } from "@vc-shell/framework";

const settingsMenu = useSettingsMenu();
settingsMenu.register({
  id: "theme-selector",
  group: "preferences",
  order: 10,
  component: ThemeSelector,
});
```

## Key Props

This component has no props. Themes are managed via the `useTheme()` composable.

## Recipe: Registering Custom Themes

Before the `ThemeSelector` can show themes, they must be registered with the theme service. Themes are defined as objects with a `key` that corresponds to a CSS class or custom property set:

```ts
import { useTheme } from "@vc-shell/framework";

const { register, setTheme, currentTheme } = useTheme();

// Register available themes during app initialization
register([
  { key: "light" }, // Default light theme
  { key: "dark" }, // Dark mode
  { key: "contrast" }, // High-contrast accessibility theme
]);

// Optionally set a default
setTheme("light");
```

The theme `key` is applied as a CSS class on the root element, allowing CSS custom properties to cascade:

```scss
// In your theme CSS files
.light {
  --primary-500: #3b82f6;
  --surface-bg: #ffffff;
}

.dark {
  --primary-500: #60a5fa;
  --surface-bg: #1e1e2e;
}
```

## Recipe: Programmatic Theme Switching

Switch themes from code (e.g., respecting system preference):

```ts
import { useTheme } from "@vc-shell/framework";

const { setTheme } = useTheme();

// Detect system dark mode preference
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
setTheme(prefersDark ? "dark" : "light");

// Listen for system preference changes
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
  setTheme(e.matches ? "dark" : "light");
});
```

## Details

- **Theme persistence**: The selected theme is persisted to localStorage, so the user's preference survives page reloads and browser restarts.
- **Toast notification**: When the user switches themes via the selector, a brief toast notification confirms the change (e.g., "Theme changed to Dark").
- **Cascading submenu**: On desktop, selecting the theme entry opens a submenu listing all registered themes. The current theme is highlighted.
- **CSS custom properties**: Themes work by switching CSS custom properties defined in `framework/assets/styles/theme/colors.scss`. Components reference these variables (e.g., `tw-bg-[var(--primary-500)]`), so theme changes are instant.

## Tips

- If only one theme is registered, the `ThemeSelector` still renders but the submenu will have only one option. Consider hiding it if theming is not a feature of your application.
- Theme keys should be short, lowercase identifiers. They are used as CSS class names on the root element.
- Always pair theme registration with corresponding CSS custom property definitions. A registered theme without CSS variables will result in unstyled or broken visuals.
- The framework's built-in components use CSS custom properties from the theme system. Custom components should follow the same pattern for consistent theming.

## Related Components

- [SettingsMenu](../settings-menu/settings-menu.docs.md) -- parent container
- [SettingsMenuItem](../settings-menu-item/settings-menu-item.docs.md) -- base menu item used internally
- [LanguageSelector](../language-selector/language-selector.docs.md) -- sibling preference entry
