# Framework Constants

Default values and configuration constants exported from `@vc-shell/framework` via `core/constants/index.ts`.

## Overview

Magic numbers scattered across a codebase make maintenance difficult and create inconsistencies. The vc-shell framework centralizes all layout dimensions, timing values, breakpoints, z-index layers, and component default props into a single constants module.

These constants are organized into three categories:
- **Top-level exports** -- standalone constants like `FALLBACK_BLADE_ID`
- **`UI_CONSTANTS`** -- layout, timing, and threshold values used by the framework's UI layer
- **`COMPONENT_DEFAULTS`** -- default prop values for each component type, accessible via `getComponentDefaults()`
- **`languageToCountryMap`** -- locale-to-country code mapping for flag resolution

All constants are importable from `@vc-shell/framework`.

## Top-Level Exports

| Constant | Value | Description |
|----------|-------|-------------|
| `FALLBACK_BLADE_ID` | `"fallback-blade-id"` | Default blade identifier when no ID is provided |

## UI Constants (`UI_CONSTANTS`)

Centralized magic numbers for layout, timing, and thresholds.

| Key | Value | Description |
|-----|-------|-------------|
| `GRID_COLUMNS` | `12` | Dashboard grid column count |
| `CELL_HEIGHT` | `80` | Dashboard cell height (px) |
| `WIDGET_GAP` | `20` | Dashboard widget gap (px) |
| `DEBOUNCE_DEFAULT_MS` | `500` | Default debounce delay |
| `HOVER_DELAY_MS` | `200` | Hover intent delay |
| `TOOLTIP_DELAY_MS` | `300` | Tooltip show delay |
| `RESIZE_DEBOUNCE_MS` | `100` | Window resize debounce |
| `ANIMATION_DURATION_MS` | `200` | Default animation duration |
| `TRANSITION_DURATION_MS` | `150` | Default CSS transition duration |
| `DRAG_THRESHOLD_PX` | `3` | Min px movement to start drag |
| `MAX_COLLISION_ITERATIONS` | `50` | Grid collision resolution limit |
| `MIN_COLUMN_WIDTH_PX` | `15` | Minimum table column width |
| `OVERFLOW_THRESHOLD` | `100` | Overflow detection threshold (px) |
| `PAGINATION_VISIBLE_PAGES` | `5` | Visible page buttons in paginator |
| `PAGINATION_EDGE_PAGES` | `3` | Edge page buttons shown |
| `TABLE_ROW_HEIGHT` | `48` | Table row height (px) |
| `TABLE_HEADER_HEIGHT` | `56` | Table header height (px) |
| `DEFAULT_MAXLENGTH` | `1024` | Default input maxlength |
| `DEFAULT_TEXTAREA_ROWS` | `3` | Default textarea rows |
| `MENU_COLLAPSED_WIDTH` | `76` | Sidebar collapsed width (px) |
| `MENU_EXPANDED_WIDTH` | `246` | Sidebar expanded width (px) |
| `MENU_ITEM_HEIGHT` | `38` | Menu item height (px) |
| `Z_INDEX.DROPDOWN` | `100` | Dropdown z-index |
| `Z_INDEX.TOOLTIP` | `9999` | Tooltip z-index |
| `Z_INDEX.POPUP` | `10000` | Popup z-index |
| `Z_INDEX.MODAL` | `10001` | Modal z-index |
| `Z_INDEX.DRAG` | `1000` | Drag overlay z-index |
| `Z_INDEX.SIDEBAR` | `50` | Sidebar z-index |
| `Z_INDEX.HEADER` | `40` | Header z-index |
| `BREAKPOINTS.XS` | `0` | Extra small breakpoint |
| `BREAKPOINTS.SM` | `576` | Small breakpoint |
| `BREAKPOINTS.MD` | `768` | Medium breakpoint |
| `BREAKPOINTS.LG` | `992` | Large breakpoint |
| `BREAKPOINTS.XL` | `1200` | Extra large breakpoint |
| `BREAKPOINTS.XXL` | `1400` | Extra extra large breakpoint |

## Component Defaults (`COMPONENT_DEFAULTS`)

Default prop values per component type. Access via `getComponentDefaults(name)`.

| Component | Property | Default | Description |
|-----------|----------|---------|-------------|
| `input` | `maxlength` | `1024` | Max input length |
| `input` | `debounce` | `0` | Input debounce (ms) |
| `input` | `type` | `"text"` | Input type attribute |
| `input` | `autocomplete` | `"off"` | Autocomplete attribute |
| `select` | `debounce` | `500` | Search debounce (ms) |
| `select` | `pageSize` | `20` | Items per page |
| `select` | `searchable` | `true` | Enable search |
| `select` | `clearable` | `true` | Show clear button |
| `table` | `pageSize` | `20` | Rows per page |
| `table` | `pageSizes` | `[10, 20, 50, 100]` | Page size options |
| `table` | `selectable` | `false` | Row selection |
| `table` | `multiselect` | `false` | Multi-row selection |
| `table` | `stickyHeader` | `true` | Sticky header |
| `pagination` | `pageSize` | `20` | Default page size |
| `pagination` | `visiblePages` | `5` | Visible page buttons |
| `textarea` | `rows` | `3` | Default rows |
| `textarea` | `maxlength` | `4096` | Max textarea length |
| `editor` | `minHeight` | `200` | Editor min height (px) |
| `editor` | `maxHeight` | `500` | Editor max height (px) |
| `tooltip` | `delay` | `300` | Show delay (ms) |
| `tooltip` | `placement` | `"top"` | Default placement |
| `modal` | `closeOnEscape` | `true` | Close on Esc key |
| `modal` | `closeOnOverlayClick` | `true` | Close on backdrop click |
| `notification` | `duration` | `5000` | Auto-dismiss (ms) |
| `notification` | `position` | `"top-right"` | Toast position |
| `dashboard` | `columns` | `12` | Grid columns |
| `dashboard` | `rowHeight` | `80` | Row height (px) |
| `dashboard` | `gap` | `20` | Widget gap (px) |

## Locale Constants (`languageToCountryMap`)

A `Record<string, string>` mapping ISO 639-1 language codes to ISO 3166-1 alpha-2 country codes. Contains 57 entries (e.g. `"en" -> "us"`, `"de" -> "de"`, `"ja" -> "jp"`). Used for flag icon resolution and locale fallback.

| Helper | Signature | Description |
|--------|-----------|-------------|
| `getComponentDefaults` | `<K extends keyof ComponentDefaults>(componentName: K) => ComponentDefaults[K]` | Type-safe accessor for component default values |

## Usage Examples

### Using UI constants in a composable

```typescript
import { UI_CONSTANTS } from "@vc-shell/framework";

function useCustomDebounce() {
  // Use the framework's standard debounce delay
  const debouncedSearch = useDebounceFn(
    (query: string) => performSearch(query),
    UI_CONSTANTS.DEBOUNCE_DEFAULT_MS,
  );
  return { debouncedSearch };
}
```

### Using component defaults

```typescript
import { getComponentDefaults } from "@vc-shell/framework";

// Get all default props for a select component
const selectDefaults = getComponentDefaults("select");
console.log(selectDefaults.debounce);   // 500
console.log(selectDefaults.pageSize);   // 20
console.log(selectDefaults.searchable); // true
```

### Using z-index layers in custom components

```typescript
import { UI_CONSTANTS } from "@vc-shell/framework";

// Ensure custom dropdowns sit at the right z-index layer
const dropdownStyle = computed(() => ({
  zIndex: UI_CONSTANTS.Z_INDEX.DROPDOWN,
}));
```

### Using breakpoints for responsive logic

```typescript
import { UI_CONSTANTS } from "@vc-shell/framework";

const isMobile = computed(() =>
  windowWidth.value < UI_CONSTANTS.BREAKPOINTS.MD,
);
```

### Using the language-to-country map

```typescript
import { languageToCountryMap } from "@vc-shell/framework";

function getFlagUrl(locale: string): string {
  const country = languageToCountryMap[locale] ?? "us";
  return `https://flagcdn.com/w20/${country}.png`;
}
```

## Tip: Override Defaults at the Component Level

Component defaults serve as fallback values. Any prop explicitly set on a component instance takes precedence over `COMPONENT_DEFAULTS`. You do not need to modify the constants to change behavior for a single instance:

```vue
<!-- Uses default pageSize of 20 -->
<VcDataTable :items="items" :columns="columns" />

<!-- Overrides to 50 rows per page -->
<VcDataTable :items="items" :columns="columns" :page-size="50" />
```

## Related

- `framework/core/constants/ui.ts` -- UI_CONSTANTS definition
- `framework/core/constants/defaults.ts` -- COMPONENT_DEFAULTS and getComponentDefaults
- `framework/core/constants/locale.ts` -- languageToCountryMap
