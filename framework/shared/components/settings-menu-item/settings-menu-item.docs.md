# SettingsMenuItem

Individual menu row used inside the settings menu. Displays an icon, title, optional current value, and a chevron indicator for sub-menus. Supports click and hover trigger actions.

## When to Use

- Use as a building block inside the settings menu for actions or selector entries
- When you need a menu item with icon, label, and optional cascading sub-menu
- Do NOT use outside of settings-menu-style contexts

## Basic Usage

```vue
<script setup lang="ts">
import { SettingsMenuItem } from "@vc-shell/framework";
</script>

<template>
  <SettingsMenuItem
    icon="lucide-palette"
    title="Theme"
    value="Light"
    :show-chevron="true"
    @trigger:click="onThemeClick"
  />
</template>
```

## Key Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `undefined` | Menu item label |
| `icon` | `string \| Component` | `undefined` | Icon name or component |
| `image` | `string` | `undefined` | Image URL (alternative to icon) |
| `value` | `string` | `undefined` | Current value displayed on the right |
| `showChevron` | `boolean` | `false` | Shows right chevron for sub-menus |
| `isActive` | `boolean` | `false` | Highlights the item (e.g., when sub-menu is open) |
| `disabled` | `boolean` | `false` | Disables click interaction |
| `triggerAction` | `"click" \| "hover" \| "none"` | `"click"` | What interaction opens the item |

## Common Patterns

### Cascading sub-menu with VcDropdownPanel

```vue
<SettingsMenuItem
  ref="menuItemRef"
  icon="lucide-palette"
  title="Theme"
  :value="currentTheme"
  :show-chevron="true"
  :is-active="isOpen"
  @trigger:click="isOpen = !isOpen"
/>

<VcDropdownPanel
  v-model:show="isOpen"
  :anchor-ref="menuItemRef?.triggerRef ?? null"
  placement="right-start"
  width="180px"
>
  <!-- sub-menu content -->
</VcDropdownPanel>
```

## Related Components

- [SettingsMenu](../settings-menu/settings-menu.docs.md) -- parent container
- [ThemeSelector](../theme-selector/theme-selector.docs.md) -- uses SettingsMenuItem internally
- [LanguageSelector](../language-selector/language-selector.docs.md) -- uses SettingsMenuItem internally
