# SettingsMenuItem

Individual menu row used inside the settings menu. Displays an icon, title, optional current value, and a chevron indicator for sub-menus. Supports click and hover trigger actions.

## Overview

The vc-shell settings menu is a sidebar panel where users access application preferences: theme, language, notification settings, and module-specific configuration. Each row in this menu is rendered by `SettingsMenuItem`.

The component handles the visual representation of a single menu entry: an icon on the left, a title, an optional current value on the right (e.g., "English" for the language selector), and a chevron arrow indicating that clicking opens a sub-menu or panel. It supports three trigger modes (click, hover, or none) for flexible interaction patterns.

`SettingsMenuItem` is typically used as a building block inside `SettingsMenu`. It is used internally by the `ThemeSelector` and `LanguageSelector` components.

### Built-in Submenu Support

The component includes a `submenu` slot that **automatically adapts to the viewport**:

- **Desktop**: renders a floating `VcDropdownPanel` anchored to the menu item (`placement="right-start"`)
- **Mobile**: renders an inline accordion with animated expand/collapse (via `useCollapsible`)

This removes the need for consumers to manage `VcDropdownPanel`, `isMobile` checks, or z-index issues manually.

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
    @trigger:click="onThemeClick"
  />
</template>
```

## Key Props

| Prop            | Type                           | Default     | Description                                                                      |
| --------------- | ------------------------------ | ----------- | -------------------------------------------------------------------------------- |
| `title`         | `string`                       | `undefined` | Menu item label                                                                  |
| `icon`          | `string \| Component`          | `undefined` | Icon name or component                                                           |
| `image`         | `string`                       | `undefined` | Image URL (alternative to icon)                                                  |
| `value`         | `string`                       | `undefined` | Current value displayed on the right                                             |
| `showChevron`   | `boolean`                      | `false`     | Shows right chevron for sub-menus (auto-enabled when `submenu` slot is provided) |
| `isActive`      | `boolean`                      | `false`     | Highlights the item (auto-managed when `submenu` slot is provided)               |
| `disabled`      | `boolean`                      | `false`     | Disables click interaction                                                       |
| `triggerAction` | `"click" \| "hover" \| "none"` | `"click"`   | What interaction opens the item                                                  |

## Events

| Event           | Payload | Description                                                          |
| --------------- | ------- | -------------------------------------------------------------------- |
| `trigger:click` | --      | Emitted when the item is clicked (only when `triggerAction="click"`) |
| `trigger:hover` | --      | Emitted when hovered (only when `triggerAction="hover"`)             |

## Slots

| Slot         | Description                                                                                   |
| ------------ | --------------------------------------------------------------------------------------------- |
| `trigger`    | Custom trigger content (replaces the entire row)                                              |
| `icon`       | Custom icon area                                                                              |
| `title`      | Custom title content                                                                          |
| `additional` | Custom right-side content (replaces `value` display)                                          |
| `submenu`    | **Sub-menu items.** Desktop: floating dropdown. Mobile: inline accordion. Chevron auto-shown. |
| `content`    | Legacy slot for arbitrary content below the trigger                                           |

## Common Patterns

### Submenu with VcDropdownItem (recommended)

The simplest way to add a sub-menu. No manual state management needed -- the component handles open/close, chevron rotation, and mobile adaptation automatically.

```vue
<script setup lang="ts">
import { SettingsMenuItem } from "@vc-shell/framework";
import VcDropdownItem from "@vc-shell/framework/ui/components/molecules/vc-dropdown/_internal/VcDropdownItem.vue";

const themes = [
  { key: "light", name: "Light" },
  { key: "dark", name: "Dark" },
];
const currentTheme = ref("light");
</script>

<template>
  <SettingsMenuItem
    icon="lucide-palette"
    title="Theme"
    :value="themes.find((t) => t.key === currentTheme)?.name"
  >
    <template #submenu>
      <VcDropdownItem
        v-for="theme in themes"
        :key="theme.key"
        :title="theme.name"
        :active="theme.key === currentTheme"
        @click="currentTheme = theme.key"
      />
    </template>
  </SettingsMenuItem>
</template>
```

**What happens on each platform:**

| Platform | Behavior                                                          |
| -------- | ----------------------------------------------------------------- |
| Desktop  | Click triggers a floating panel to the right of the item          |
| Mobile   | Click expands an inline list below the item with chevron rotation |

### Simple action item (no sub-menu)

```vue
<SettingsMenuItem icon="lucide-log-out" title="Sign Out" @trigger:click="handleSignOut" />
```

### Item with user avatar image

```vue
<SettingsMenuItem :image="user.avatarUrl" :title="user.displayName" :value="user.roleName" :show-chevron="true" @trigger:click="openUserMenu" />
```

### Disabled item

```vue
<SettingsMenuItem icon="lucide-shield" title="Security Settings" disabled value="Admin only" />
```

### Custom submenu content

The `submenu` slot can contain any content, not just `VcDropdownItem`:

```vue
<SettingsMenuItem icon="lucide-sliders" title="Display density">
  <template #submenu>
    <div class="tw-p-2">
      <VcSlider v-model="density" :min="1" :max="3" :step="1" />
    </div>
  </template>
</SettingsMenuItem>
```

## Migration: Manual VcDropdownPanel to Submenu Slot

Before (manual dropdown management):

```vue
<SettingsMenuItem ref="menuItemRef" icon="lucide-palette" title="Theme" :value="currentTheme" :show-chevron="true" :is-active="isOpen" @trigger:click="isOpen = !isOpen" />
<VcDropdownPanel v-model:show="isOpen" :anchor-ref="menuItemRef?.triggerRef ?? null" placement="right-start" width="180px">
  <!-- options -->
</VcDropdownPanel>
```

After (submenu slot):

```vue
<SettingsMenuItem icon="lucide-palette" title="Theme" :value="currentTheme">
  <template #submenu>
    <!-- same options, no wrapper needed -->
  </template>
</SettingsMenuItem>
```

**What changes:**

- Remove `ref`, `isOpen`, `:show-chevron`, `:is-active`, `@trigger:click` toggle -- all auto-managed
- Remove `VcDropdownPanel` wrapper entirely
- Move dropdown content into `#submenu` slot
- Mobile adaptation is automatic (no `isMobile` check needed)

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
- [ThemeSelector](../theme-selector/theme-selector.docs.md) -- uses SettingsMenuItem with submenu slot
- [LanguageSelector](../language-selector/language-selector.docs.md) -- uses SettingsMenuItem with submenu slot
- [VcDropdownPanel](../../ui/components/molecules/vc-dropdown-panel/) -- used internally for desktop sub-menus
- [VcDropdownItem](../../ui/components/molecules/vc-dropdown/) -- recommended for sub-menu option rows
