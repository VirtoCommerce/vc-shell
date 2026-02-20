# VcDropdown Component - Full Usage Analysis

## Component Overview

**Location**: `/Users/symbot/DEV/vc-shell-main-dev/vc-shell/framework/ui/components/molecules/vc-dropdown/vc-dropdown.vue`

**Key Props**:
- `modelValue?: boolean` - Controlled open/closed state (v-model)
- `items?: T[]` - Array of items to render
- `itemText?: (item: T) => string` - Maps item to display text
- `isItemActive?: (item: T) => boolean` - Marks active/selected item
- `floating?: boolean` (default: false) - Enable floating positioning with `@floating-ui`
- `placement?: Placement` (default: "bottom") - Floating-UI placement
- `variant?: "default" | "secondary"` (default: "default") - Visual style
- `offset?: { mainAxis?: number; crossAxis?: number }` - Floating offset
- `maxHeight?: number | string` (default: 300) - Max dropdown height
- `role?: "menu" | "listbox"` (default: "menu") - ARIA role
- `padded?: boolean` (default: true) - Compact menu padding and item backgrounds
- `closeOnClickOutside?: boolean` (default: true)
- `closeOnEscape?: boolean` (default: true)
- `closeOnSelect?: boolean` (default: false)
- `zIndex?: number` (default: 10000)

**Key Slots**:
- `#trigger` - Custom trigger button/element (receives `{ isActive, toggle, open, close }`)
- `#item` - Custom item renderer (receives `{ item, click }`)
- `#items-container` - Custom container for items (receives `{ items, close }`)
- `#empty` - Custom empty state

**Events**:
- `@update:modelValue` - Model value change
- `@item-click` - Item selection event
- `@open` / `@close` - Open/close lifecycle
- `@close` receives reason: `"outside" | "escape" | "action"`

**CSS Custom Properties**:
- `--vc-dropdown-bg`: Background color (default: `var(--additional-50)`)
- `--vc-dropdown-text`: Text color (default: `var(--neutrals-950)`)
- `--vc-dropdown-border`: Border color (default: `var(--neutrals-200)`)
- `--vc-dropdown-accent`: Hover/active bg (default: `var(--neutrals-100)`)
- `--vc-dropdown-divider`: Item divider (mobile only)

---

## Usage Sites (25 files)

### 1. **notification-dropdown.vue** - Notification panel display
**File**: `/framework/shared/components/notification-dropdown/notification-dropdown.vue`
```vue
<VcDropdown
  :model-value="true"
  :items="notifications"
  :empty-text="t('COMPONENTS.NOTIFICATION_DROPDOWN.EMPTY')"
  max-height="auto"
  :padded="false"
>
  <template #item="{ item }">
    <NotificationItem
      :notification="item"
      :templates="notificationTemplates || []"
    />
  </template>
</VcDropdown>
```
**Props Used**: `modelValue`, `items`, `emptyText`, `maxHeight`, `padded=false`
**Slots**: `#item`
**Notes**: 
- Always open (`modelValue=true`)
- NO padding (`padded=false`) - allows full-width custom item rendering
- Auto max-height for flexible content
- Renders custom `NotificationItem` components in items

---

### 2. **multilanguage-selector.vue** - Language flag selector dropdown
**File**: `/framework/shared/components/multilanguage-selector/multilanguage-selector.vue`
```vue
<VcDropdown
  :model-value="isOpened"
  :items="options"
  :floating="true"
  placement="bottom-end"
  :offset="{ mainAxis: 10, crossAxis: -15 }"
  :empty-text="t('common.no_options', 'No options')"
  :is-item-active="(item: any) => item.value === modelValue"
  @item-click="onItemClick"
  @update:model-value="isOpened = $event"
>
  <template #trigger>
    <div class="tw-flex tw-cursor-pointer...">
      <VcImage :src="currentLanguageOption?.flag" />
    </div>
  </template>
  <template #item="{ item }">
    <div class="tw-flex tw-items-center tw-gap-2 tw-p-2">
      <VcImage :src="item.flag" class="tw-w-6 tw-h-6" />
      <span class="tw-text-sm">{{ item.label }}</span>
    </div>
  </template>
  <template #empty>
    <div class="tw-p-2 tw-text-sm">{{ t("common.no_options", "No options") }}</div>
  </template>
</VcDropdown>
```
**Props Used**: `modelValue`, `items`, `floating`, `placement`, `offset`, `emptyText`, `isItemActive`
**Slots**: `#trigger`, `#item`, `#empty`
**Notes**:
- Floating dropdown with `bottom-end` placement
- Custom offset: `mainAxis: 10, crossAxis: -15`
- Custom trigger with image (flag)
- Custom items with image + label
- Emits `item-click` to update parent

---

### 3. **generic-dropdown.vue** - Generic wrapper around VcDropdown
**File**: `/framework/shared/components/generic-dropdown/generic-dropdown.vue`
```vue
<VcDropdown
  :model-value="props.opened && !props.disabled"
  :items="props.items"
  :empty-text="props.emptyText"
  :item-text="props.itemText"
  :is-item-active="props.isItemActive"
  :floating="props.floating"
  :placement="props.placement"
  :variant="props.variant"
  :offset="props.offset"
  :max-height="props.maxHeight"
  @item-click="onItemClick"
  @update:model-value="onUpdateOpened"
>
  <template #trigger="{ isActive, toggle, open, close }">
    <slot name="trigger" :is-active="isActive" :toggle="toggle" :open="open" :close="close" />
  </template>
  <template #item="{ item, click }">
    <slot name="item" :item="item" :click="click" />
  </template>
  <template #empty>
    <slot name="empty" />
  </template>
  <template #items-container="{ items: slotItems, close }">
    <slot name="items-container" :items="slotItems" :close="close" />
  </template>
</VcDropdown>
```
**Props Used**: All props forwarded with transformation (modelValue becomes opened/disabled guard)
**Slots**: All slots pass-through
**Notes**:
- Pure wrapper/adapter
- Adds disability check on opened/item-click
- Emits different event names: `update:opened` instead of `update:modelValue`

---

### 4. **language-selector.vue** - Settings menu language selector
**File**: `/framework/shared/components/language-selector/language-selector.vue`
**Uses**: `VcDropdownPanel` (NOT VcDropdown directly) with `SettingsMenuItem`
**Notes**: Uses VcDropdownPanel instead of VcDropdown for consistent settings panel styling

---

### 5. **theme-selector.vue** - Settings menu theme selector
**File**: `/framework/shared/components/theme-selector/theme-selector.vue`
**Uses**: `VcDropdownPanel` (NOT VcDropdown directly)
**Notes**: Uses VcDropdownPanel for settings panel

---

### 6. **user-dropdown-button.vue** - User account menu
**File**: `/framework/shared/components/user-dropdown-button/user-dropdown-button.vue`
**Uses**: `VcDropdownPanel` (NOT VcDropdown directly)
**Notes**: 
- Desktop: Uses VcDropdownPanel with floating positioning
- Mobile: Falls back to sidebar component
- Right-placed panel (`placement="right"`, `width="260px"`)

---

### 7. **vc-app-switcher.vue** - Multi-app switcher
**File**: `/framework/shared/components/app-switcher/components/vc-app-switcher/vc-app-switcher.vue`
```vue
<VcDropdown
  :model-value="true"
  :items="appsList"
  :is-item-active="(item) => locationHandler(item.relativeUrl ?? '')"
  max-height="auto"
  :padded="false"
  @item-click="switchApp"
>
  <template #item="{ item }">
    <div class="vc-app-switcher__item">
      <img :src="imageUrl(item.iconUrl ?? '')" />
      <p class="vc-app-switcher__item-title">{{ item.title }}</p>
    </div>
  </template>
</VcDropdown>
```
**Props Used**: `modelValue=true`, `items`, `isItemActive`, `maxHeight="auto"`, `padded=false`
**Slots**: `#item`
**Notes**:
- Always open
- No padding (full-width items)
- Auto height
- Custom item with icon + title
- Active state determined by URL matching

---

### 8. **TableColumnSwitcher.vue** - Table column visibility dropdown
**File**: `/framework/ui/components/organisms/vc-table/_internal/vc-table-column-switcher/vc-table-column-switcher.vue`
```vue
<VcDropdown
  :model-value="isActive"
  :items="internalItems"
  placement="bottom-end"
  floating
  max-height="40%"
  @item-click="selectItem"
  @update:model-value="(state) => emit('onActive', state)"
>
  <template #trigger>
    <VcButton size="xs" icon-size="l" icon="material-view_column" />
  </template>
  <template #item="{ item }">
    <div class="vc-table-column-switcher__item">
      <VcIcon :icon="item.visible ? 'material-check' : ''" size="s" />
      <p>{{ item.title }}</p>
    </div>
  </template>
</VcDropdown>
```
**Props Used**: `modelValue`, `items`, `placement`, `floating`, `maxHeight`
**Slots**: `#trigger`, `#item`
**Notes**:
- Floating dropdown at bottom-end
- Max height: 40% of viewport
- Custom trigger: VcButton with icon
- Custom items with visibility checkmark

---

### 9. **ToolbarDesktop.vue** - Blade toolbar more menu (desktop)
**File**: `/framework/ui/components/organisms/vc-blade/_internal/toolbar/ToolbarDesktop.vue`
```vue
<VcDropdown
  v-if="showMoreButton"
  :model-value="isMenuOpen"
  :items="hiddenItems"
  floating
  placement="bottom-end"
  variant="secondary"
  @item-click="handleItemClick"
  @update:model-value="isMenuOpen = $event"
>
  <template #trigger="{ isActive }">
    <div
      data-more-button
      class="vc-blade-toolbar-desktop__more"
      :class="{ 'vc-blade-toolbar-desktop__more--active': isActive }"
      @click="isMenuOpen = !isMenuOpen"
    >
      <VcIcon icon="material-more" />
      <span v-if="isExpanded">{{ $t("COMPONENTS.ORGANISMS.VC_BLADE.MORE") }}</span>
    </div>
  </template>
  <template #item="{ item }">
    <div class="vc-blade-toolbar-desktop__dropdown-item">
      <VcIcon :icon="typeof item.icon === 'function' ? item.icon() : item.icon" size="s" />
      <span>{{ toValue(item.title) }}</span>
    </div>
  </template>
</VcDropdown>
```
**Props Used**: `modelValue`, `items`, `floating`, `placement`, `variant="secondary"`
**Slots**: `#trigger`, `#item`
**Notes**:
- Secondary variant (darker styling)
- Custom trigger with icon + optional text
- Custom items with icon + title
- Closes after selection via `handleItemClick`

---

### 10. **WidgetContainerDesktop.vue** - Blade widget overflow menu (desktop)
**File**: `/framework/ui/components/organisms/vc-app/_internal/app-bar/components/WidgetContainerDesktop.vue`
```vue
<VcDropdown
  v-if="showMoreButton"
  :model-value="showToolbar"
  :items="overflowItems"
  floating
  placement="bottom-end"
  variant="secondary"
  @update:model-value="showToolbar = $event"
>
  <template #trigger="{ isActive }">
    <div
      class="vc-widget-container-desktop__more"
      :class="{ 'vc-widget-container-desktop__more--active': isActive }"
      @click="showToolbar = !showToolbar"
    >
      <VcIcon icon="lucide-chevron-down" />
    </div>
  </template>
  <template #item="{ item }">
    <component
      :is="item.component"
      class="tw-px-2 tw-py-1.5 tw-w-full"
      v-bind="item.props || {}"
      horizontal
      :widget-id="item.id"
      v-on="item.events || {}"
      @click="showToolbar = false"
    />
  </template>
</VcDropdown>
```
**Props Used**: `modelValue`, `items`, `floating`, `placement`, `variant="secondary"`
**Slots**: `#trigger`, `#item`
**Notes**:
- Renders dynamic widget components in items
- Closes on item click
- Secondary variant

---

### 11. **WidgetContainerMobile.vue** - Blade widget overflow menu (mobile)
**File**: `/framework/ui/components/organisms/vc-app/_internal/app-bar/components/WidgetContainerMobile.vue`
```vue
<VcDropdown
  v-if="showMoreButton"
  :model-value="showToolbar"
  :items="hiddenItems"
  floating
  placement="top-end"
  variant="secondary"
  class="vc-widget-container-mobile__more-dropdown"
  @update:model-value="showToolbar = $event"
>
  <template #trigger="{ isActive }">
    <div
      data-more-button
      class="vc-widget-container-mobile__more"
      :class="{ 'vc-widget-container-mobile__more--active': isActive }"
      @click="toggleToolbar"
    >
      <VcIcon icon="lucide-chevron-up" />
    </div>
  </template>
  <template #item="{ item }">
    <component
      :is="item.component"
      class="tw-p-3 tw-w-full"
      v-bind="item.props || {}"
      horizontal
      :widget-id="item.id"
      v-on="item.events || {}"
    />
  </template>
</VcDropdown>
```
**Props Used**: `modelValue`, `items`, `floating`, `placement`, `variant="secondary"`
**Slots**: `#trigger`, `#item`
**Notes**:
- Mobile version: `placement="top-end"` (pops up from bottom)
- Icon: `lucide-chevron-up` (vs desktop's `chevron-down`)
- Same secondary variant
- Renders dynamic widget components

---

### 12. **vc-breadcrumbs.vue** - Breadcrumb overflow menu
**File**: `/framework/ui/components/molecules/vc-breadcrumbs/vc-breadcrumbs.vue`
```vue
<VcDropdown
  v-if="showMoreButton"
  :items="hiddenItems"
  :model-value="showBreadcrumbs"
  floating
  variant="secondary"
  placement="bottom-start"
  :offset="{ mainAxis: 10 }"
  @item-click="onItemClick"
  @update:model-value="showBreadcrumbs = $event"
>
  <template #trigger="{ isActive }">
    <slot name="trigger" :click="toggleBreadcrumbs" :is-active="isActive">
      <VcButton
        text
        icon="lucide-ellipsis-vertical"
        icon-size="xl"
        data-more-button
        class="vc-breadcrumbs__expand-button"
        :class="{ 'vc-breadcrumbs__expand-button--active': isActive }"
        @click="toggleBreadcrumbs"
      />
    </slot>
  </template>
  <template #item="{ item, click }">
    <VcBreadcrumbsItem
      v-bind="item"
      :current="false"
      :variant="variant"
      class="tw-p-3 tw-w-full"
      @click="click"
    />
  </template>
</VcDropdown>
```
**Props Used**: `items`, `modelValue`, `floating`, `variant`, `placement`, `offset`
**Slots**: `#trigger`, `#item`
**Notes**:
- Breadcrumb items in overflow
- Custom offset: `{ mainAxis: 10 }`
- Trigger button with ellipsis icon
- Items are `VcBreadcrumbsItem` components

---

### 13. **VcTableAdapter.vue** - Legacy table adapter
**File**: `/framework/ui/components/organisms/vc-table/VcTableAdapter.vue`
**Uses**: `VcDropdownPanel` (NOT VcDropdown directly)
**Notes**: Uses VcDropdownPanel for legacy filters panel

---

### 14. **GlobalFiltersPanel.vue** - Table global filters panel
**File**: `/framework/ui/components/organisms/vc-table/components/GlobalFiltersPanel.vue`
**Uses**: `VcDropdownPanel` (NOT VcDropdown directly)
**Notes**: Uses VcDropdownPanel for consistent table panel styling with filters

---

### 15. **TableColumnSwitcher.vue** - Table column switcher panel (new)
**File**: `/framework/ui/components/organisms/vc-table/components/TableColumnSwitcher.vue`
**Uses**: `VcDropdownPanel` (NOT VcDropdown directly)
**Notes**: Uses VcDropdownPanel for column visibility toggles

---

### 16. **vc-dropdown-panel/index.ts** - VcDropdownPanel export
**File**: `/framework/ui/components/molecules/vc-dropdown-panel/index.ts`
**Notes**: Exports VcDropdownPanel which wraps VcDropdown concepts into a panel component

---

### 17-25. Other files
- `vc-dropdown.test.ts` - Test file
- `vc-dropdown.stories.ts` - Storybook stories (see below)
- `index.ts` - Component export
- `dynamic-blade-form.vue` - Uses VcImage/VcDropdown (minor usage)
- `ui/components/molecules/index.ts` - Export barrel
- `shared/components/index.ts` - Export barrel
- `CHANGELOG.md` - Documentation

---

## Storybook Stories Analysis

**Location**: `/framework/ui/components/molecules/vc-dropdown/vc-dropdown.stories.ts`

### Story 1: **ActionMenu** - Contextual actions with descriptions
```vue
<VcDropdown
  v-bind="args"
  :model-value="opened"
  placement="bottom-start"
  variant="secondary"
  closeOnSelect="true"
  @update:modelValue="opened = $event"
  @item-click="onSelect"
>
  <template #trigger="{ isActive, toggle }">
    <VcButton variant="secondary" @click="toggle">
      <VcIcon icon="material-more_horiz" size="m" />
      Actions
      <VcIcon :icon="isActive ? 'material-expand_less' : 'material-expand_more'" size="m" />
    </VcButton>
  </template>
  <template #item="{ item, click }">
    <button class="tw-flex tw-w-[320px] tw-items-center tw-justify-between tw-gap-3">
      <div class="tw-flex tw-items-center tw-gap-2">
        <VcIcon :icon="item.icon" size="s" />
        <span class="tw-text-sm" :class="item.danger ? 'tw-text-[var(--danger-600)]' : ''">
          {{ item.title }}
        </span>
      </div>
      <kbd>{{ item.shortcut }}</kbd>
    </button>
  </template>
</VcDropdown>
```
**Props**: `placement="bottom-start"`, `variant="secondary"`, `closeOnSelect=true`
**Styling**: Wide items (320px), custom buttons with icons and danger coloring

### Story 2: **WorkspaceSwitcher** - List with selection
```vue
<VcDropdown
  v-bind="args"
  placement="bottom-end"
  role="listbox"
  closeOnSelect="true"
  variant="default"
  :is-item-active="(item) => item.id === activeWorkspaceId"
  @item-click="onSelect"
>
  <template #trigger="{ isActive, toggle }">
    <VcButton variant="outline" @click="toggle">
      <VcIcon icon="material-layers" size="m" />
      {{ getTitle(activeWorkspaceId) }}
    </VcButton>
  </template>
  <template #item="{ item, click }">
    <button class="tw-flex tw-w-[280px]">
      <div>
        <p class="tw-text-sm">{{ item.title }}</p>
        <p class="tw-text-xs tw-text-[var(--neutrals-500)]">{{ item.owner }}</p>
      </div>
      <VcIcon v-if="item.id === activeWorkspaceId" icon="material-check" />
    </button>
  </template>
</VcDropdown>
```
**Props**: `role="listbox"`, `isItemActive`, `variant="default"`
**Styling**: Item sub-text, checkmark icon for active item

### Story 3: **ScrollableList** - Long list with keyboard nav
```vue
<VcDropdown
  v-bind="args"
  role="listbox"
  maxHeight="220"
  closeOnSelect="false"
  :is-item-active="(item) => item.id === activeId"
  @item-click="(item) => activeId = item.id"
>
  <template #trigger="{ isActive, toggle }">
    <VcButton variant="ghost" @click="toggle">
      <VcIcon icon="material-filter_list" size="m" />
      Audience segments
    </VcButton>
  </template>
  <template #item="{ item, click }">
    <button class="tw-flex tw-w-[260px]">
      <div>
        <p class="tw-text-sm">{{ item.title }}</p>
        <p class="tw-text-xs">{{ item.description }}</p>
      </div>
      <div class="tw-h-2 tw-w-2 tw-rounded-full" :class="item.id === activeId ? 'tw-bg-[var(--primary-500)]' : ''"/>
    </button>
  </template>
</VcDropdown>
```
**Props**: `maxHeight="220"`, `closeOnSelect=false`, `role="listbox"`
**Styling**: Multi-line items with colored indicator dot

---

## Visual Inconsistencies Identified

### 1. **Padding/Padded Prop Usage**
- `padded=true` (default): Compact items with rounded backgrounds (4px padding container, border-radius)
  - Used in: ToolbarDesktop, TableColumnSwitcher, breadcrumbs
- `padded=false`: Full-width items, no background, for rich content
  - Used in: NotificationDropdown, AppSwitcher, dynamic blade form

### 2. **Variant Styling**
- `variant="default"` (default): Lighter background (`--additional-50`)
  - Used in: WorkspaceSwitcher story, language selector
- `variant="secondary"` (darker): Secondary styling
  - Used in: ActionMenu story, ToolbarDesktop, WidgetContainers

### 3. **Floating vs. Non-floating**
- `floating=false` (default): Positioned relative to trigger
  - Used in: Storybook default, some internal dropdowns
- `floating=true`: Positioned with `@floating-ui` with fixed strategy
  - Used in: Breadcrumbs, ToolbarDesktop, WidgetContainers, multilanguage-selector

### 4. **Placement Variations**
- `placement="bottom"` (default)
- `placement="bottom-start"` - ActionMenu, vc-breadcrumbs
- `placement="bottom-end"` - ToolbarDesktop, WidgetContainers (desktop), multilanguage-selector
- `placement="top-end"` - WidgetContainers (mobile) - unique mobile placement
- `placement="right"` - user-dropdown-button via VcDropdownPanel
- `placement="right-start"` - language-selector, theme-selector via VcDropdownPanel

### 5. **Max Height Variations**
- `maxHeight="300"` (default)
- `maxHeight="auto"` - NotificationDropdown, AppSwitcher (no height limit)
- `maxHeight="220"` - ScrollableList story
- `maxHeight="40%"` - TableColumnSwitcher (percentage of viewport)

### 6. **Offset Variations**
- Default: `{ mainAxis: 0, crossAxis: 0 }`
- multilanguage-selector: `{ mainAxis: 10, crossAxis: -15 }`
- vc-breadcrumbs: `{ mainAxis: 10 }`

### 7. **Item Rendering Patterns**
- **Simple text**: Default `itemText` callback
- **Rich content with icons**: ToolbarDesktop, breadcrumbs
- **Multi-line text**: WorkspaceSwitcher, ScrollableList stories
- **Images + text**: AppSwitcher, multilanguage-selector
- **Custom components**: WidgetContainers (dynamic component rendering)

### 8. **Role Attribute**
- `role="menu"` (default) - For action menus
- `role="listbox"` - For selection lists (WorkspaceSwitcher, ScrollableList stories)

### 9. **VcDropdownPanel vs VcDropdown**
Some components use **VcDropdownPanel** instead:
- language-selector, theme-selector (settings menus)
- user-dropdown-button (account menu)
- TableColumnSwitcher.vue, GlobalFiltersPanel.vue (table panels)
- VcTableAdapter legacy filters

VcDropdownPanel adds:
- Header with title + close button
- Footer slot for buttons
- Document-level click-outside close
- Escape key handling
- Middleware for better positioning
