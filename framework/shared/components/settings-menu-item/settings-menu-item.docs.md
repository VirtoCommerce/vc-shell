# SettingsMenuItem

Individual menu row used inside the settings menu. Displays an icon, title, optional current value, and a chevron indicator for sub-menus. Supports click and hover trigger actions.

## Overview

The vc-shell settings menu is a sidebar panel where users access application preferences: theme, language, notification settings, and module-specific configuration. Each row in this menu is rendered by `SettingsMenuItem`.

The component handles the visual representation of a single menu entry: an icon on the left, a title, an optional current value on the right (e.g., "English" for the language selector), and a chevron arrow indicating that clicking opens a sub-menu or panel. It supports three trigger modes (click, hover, or none) for flexible interaction patterns.

`SettingsMenuItem` is typically used as a building block inside `SettingsMenu` and paired with `VcDropdownPanel` for cascading sub-menus. It is used internally by the `ThemeSelector` and `LanguageSelector` components.

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

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `trigger:click` | -- | Emitted when the item is clicked (only when `triggerAction="click"`) |
| `trigger:hover` | -- | Emitted when hovered (only when `triggerAction="hover"`) |

## Common Patterns

### Cascading sub-menu with VcDropdownPanel

```vue
<script setup lang="ts">
import { ref } from "vue";
import { SettingsMenuItem } from "@vc-shell/framework";

const menuItemRef = ref();
const isOpen = ref(false);
const currentTheme = ref("Light");
</script>

<template>
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
    <div class="tw-flex tw-flex-col tw-p-2">
      <button @click="currentTheme = 'Light'; isOpen = false">Light</button>
      <button @click="currentTheme = 'Dark'; isOpen = false">Dark</button>
      <button @click="currentTheme = 'System'; isOpen = false">System</button>
    </div>
  </VcDropdownPanel>
</template>
```

### Simple action item (no sub-menu)

```vue
<SettingsMenuItem
  icon="lucide-log-out"
  title="Sign Out"
  @trigger:click="handleSignOut"
/>
```

### Item with user avatar image

```vue
<SettingsMenuItem
  :image="user.avatarUrl"
  :title="user.displayName"
  :value="user.roleName"
  :show-chevron="true"
  @trigger:click="openUserMenu"
/>
```

### Disabled item with tooltip

```vue
<SettingsMenuItem
  icon="lucide-shield"
  title="Security Settings"
  disabled
  value="Admin only"
/>
```

### Hover-triggered sub-menu

```vue
<SettingsMenuItem
  icon="lucide-globe"
  title="Language"
  :value="currentLocale"
  :show-chevron="true"
  trigger-action="hover"
  :is-active="isLangMenuOpen"
  @trigger:hover="isLangMenuOpen = true"
/>
```

## Tip: Use triggerRef for Dropdown Anchoring

When pairing with `VcDropdownPanel`, access the menu item's trigger element via the `triggerRef` exposed ref. This ensures the dropdown panel positions itself correctly relative to the menu item:

```vue
<SettingsMenuItem ref="itemRef" ... />
<VcDropdownPanel :anchor-ref="itemRef?.triggerRef ?? null" />
```

## Common Mistake

Do not set `triggerAction="none"` and then rely on `@trigger:click` -- the event will not fire. If you need custom click handling with no built-in trigger behavior, use `triggerAction="click"` and handle the event yourself:

```vue
<!-- Bad: event never fires with triggerAction="none" -->
<SettingsMenuItem trigger-action="none" @trigger:click="doSomething" />

<!-- Good: event fires normally -->
<SettingsMenuItem trigger-action="click" @trigger:click="doSomething" />
```

## Related Components

- [SettingsMenu](../settings-menu/settings-menu.docs.md) -- parent container
- [ThemeSelector](../theme-selector/theme-selector.docs.md) -- uses SettingsMenuItem internally
- [LanguageSelector](../language-selector/language-selector.docs.md) -- uses SettingsMenuItem internally
- [VcDropdownPanel](../../ui/components/molecules/vc-dropdown-panel/) -- dropdown panel for sub-menus
