---
title: VcSearchBar
category: components
group: data-display
---

# VcSearchBar

Search, applied filters and saved views for a list screen, in one row. It holds the filter state and reports it as plain filter values. `VcDataTable` renders it when you set `search-bar`; it also works on its own.

::storybook id="data-display-vcsearchbar--wide-blade"

## When to Use

- Use **VcSearchBar** for a list screen with a search and a few filters that users combine and save as views.
- Use it standalone when the data is not a table (cards, a gallery, a tree).
- When NOT to use: for a single text box with no filters, use `VcInput`; for a filter inside one table column, use `VcColumn` `filter`.

## Three Ways to Use It

### 1. On a table: `search-bar`

Set `search-bar` on `VcDataTable` next to `searchable` and `global-filters`. The table renders the bar instead of its classic search header and forwards `@search` and `@filter` as before. Without `search-bar` the table keeps the classic header. See [VcDataTable](../vc-data-table), "Search bar (opt-in)".

```vue
<VcDataTable :items="orders" state-key="orders-list" searchable search-bar :global-filters="orderFilters" :search-views="orderViews" @filter="onFilter" @search="onSearch" />
```

### 2. Your own bar in the `#header` slot

For full control over the state, leave `searchable` and `global-filters` off and put the bar into the table's `#header` slot. Load data from the bar's `v-model` or `@change`.

```vue
<VcDataTable :items="orders" :loading="loading">
  <template #header>
    <VcSearchBar v-model="query" :fields="orderFields" :views="orderViews" storage-key="orders-list" @change="load" />
  </template>
</VcDataTable>
```

### 3. Standalone

```vue
<VcSearchBar v-model="query" :fields="fields" storage-key="orders" @change="load" />
```

## Layout

The bar is one row of 36px controls with its own 16px side and 8px top and bottom padding, so it needs no wrapper: the search, a divider, the applied filters as chips, then the split **Filters** button.

- **Search** takes the remaining width (at least 200px or 22% of the bar). It has a clear button when it holds text and a `/` hint when it is empty and unfocused.
- **Chips** read "Field: value" (several values: "First +1"), in the order the filters were applied. A click opens the field's editor in a popover; the × removes the filter. Toggle fields show just their name. Chips that do not fit go behind a **+N** button that opens the hidden fields as an accordion.
- **Filters** opens the [Filters panel](#filters-panel). With filters applied it shows the count and a × part that clears them all.
- The bar has no slots. Put your own buttons next to it, or use the table's `search-header-actions` slot.

The layout follows the bar's own width:

| Width       | Layout                                                                                                              |
| ----------- | ------------------------------------------------------------------------------------------------------------------- |
| 720px+      | Wide: chips in the row (`variant="inline"`), or the applied field names on the Filters button (`variant="summary"`) |
| 480-719px   | Medium: no chips; the Filters button holds the count and the × that clears all                                      |
| under 480px | Narrow: the Filters button is a funnel icon with a count badge; the search shows the short default placeholder      |

::storybook id="data-display-vcsearchbar--medium-blade"

### Search syntax

- Typing `field:` suggests the field's values; `field:value` followed by a space becomes a chip when the value matches an option's value or label exactly (any case), or is the start of only one of them. A start shared by several options (`status:p` for Pending and Paid) stays text and keeps the suggestions open. The field name is the field's `key` (default: its `id`).
- A word of 2 or more letters suggests the fields it matches. ↑ and ↓ move through the suggestions, Enter picks one.
- An unknown field or value (`foo:bar`, `status:xyz`) stays search text.

### Keyboard

- `/` focuses the search of the active blade (or of a bar outside blades) when no text field has focus.
- Backspace in an empty search removes the last chip.
- Esc closes the suggestions, then clears the text, then leaves the search. It never closes the blade.
- A chip's editor, "+N", the Filters panel and the views menu take the focus when they open; Tab stays inside them, Esc closes them and returns the focus to their button. ↑, ↓, Home and End move through the views menu.
- Removing a chip with its × moves the focus to the next chip, else to "+N", the Filters button or the search.

## Filters Panel

On desktop the panel is a 360px popover aligned to the end of the Filters button. Everything in it applies at once.

- **Header:** "Filters · N active" and a close button.
- **Toggles:** toggle fields as switches, with a count when one is given.
- **Fields:** an accordion of the other fields, each with its value summary (or "Any") and a × when set. The first applied field starts open (or the first field when none is applied).
- **Editors:** a list field has checkboxes, a find box over 6 options, an "Only" link on hover and dimmed options with a zero count; a select with `operators: ["any", "not"]` adds "Is any of" and "Is not". A date field has "Any time", the relative ranges and a custom range. A number field has From and To (applied on Enter or with Apply) and optional presets. A custom field shows your component.
- **Unsaved row:** while the filters differ from the current view, a row above the footer offers revert, "Save" (not for "All") and "Save as view…".
- **Footer:** "N results · applied instantly" (with `result-count`) and **Clear filters**.

::storybook id="data-display-vcsearchbar--filters-panel"

## Saved Views

A view is a named set of filter values. The search text is not part of a view and never makes it modified.

- **All** is the system view: no filters. It always exists and cannot be changed.
- **Module views** come from the `views` prop and from [external registrations](#external-filters-and-views). One may be the `default`: the bar opens on it when the URL names no view and the bar starts with no values.
- **User views** are saved with "Save as new view…" and kept per browser in `localStorage` under `VC_SEARCHBAR_<KEY>` (the `storage-key` upper-cased). Each has a "⋯" menu with Rename and Delete; deleting the current one selects "All".

```ts
const orderViews: SearchBarView[] = [
  { id: "open", name: "Open orders", values: { status: ["New", "Processing"] }, default: true },
  { id: "paid", name: "Paid", values: { status: ["Paid"] } },
];
```

Selecting a view replaces the filters. Any other change keeps the current view and marks it **Modified**; changing it back (in any order) clears the mark. The selector never switches to another view on its own because the filters happen to match it, with one exception: removing the last filter of a view selects "All", as Clear all does.

While modified, the view menu offers "Save changes to “X”" (not for "All"; for a module view it stores the change in this browser), "Save as new view…" and "Revert to “X”".

### Where the selector is

- **In a blade:** next to the blade title: a bookmark, the view name, a "Modified" badge and a chevron. The bar registers it with the blade; the screen adds nothing. With two bars in one blade the first one gets the header and the other shows the selector in its own row.
- **Outside a blade:** at the start of the bar's row.
- **On a phone:** the views are chips at the top of the filters sheet; the current one is filled and marked `*` when modified.

`view-counts` adds a count per view to the menu.

::storybook id="data-display-vcsearchbar--modified-view"

## Props

| Prop              | Type                                     | Default    | Description                                                                           |
| ----------------- | ---------------------------------------- | ---------- | ------------------------------------------------------------------------------------- |
| `modelValue`      | `SearchBarState`                         | -          | `{ search, values }`. Optional: without it the bar keeps its own state                |
| `fields`          | `SearchBarField[]`                       | `[]`       | Filters offered by this screen                                                        |
| `views`           | `SearchBarView[]`                        | -          | Module views; one may be the `default`                                                |
| `storageKey`      | `string`                                 | -          | Key of the user views and of the filters and view in the blade URL                    |
| `variant`         | `"inline" \| "summary"`                  | `"inline"` | Wide bar: chips in the row, or the applied field names on the Filters button          |
| `counts`          | `Record<string, Record<string, number>>` | -          | Result count per option value, per field id (`{ status: { Paid: 12 } }`)              |
| `viewCounts`      | `Record<string, number>`                 | -          | Result count per view id, shown in the view menu                                      |
| `resultCount`     | `number`                                 | -          | Result count of the current filters: the panel footer and "Show N results"            |
| `unfilteredCount` | `number`                                 | -          | Rows without the bar's filters and search: "filtered from M" in the phone summary     |
| `placeholder`     | `string`                                 | -          | Search placeholder and accessible name; a narrow bar shows the short default instead  |
| `searchDebounce`  | `number`                                 | `300`      | Delay in ms before the typed text reaches the state, `change` and `search`            |
| `name`            | `string`                                 | -          | Target of external filters and views; defaults to the name of the blade the bar is in |
| `searchable`      | `boolean`                                | `true`     | Show the search input                                                                 |
| `disabled`        | `boolean`                                | `false`    | Disable the bar                                                                       |

## Events

| Event               | Payload           | Description                                                                                            |
| ------------------- | ----------------- | ------------------------------------------------------------------------------------------------------ |
| `update:modelValue` | `SearchBarState`  | Any change of search text or values                                                                    |
| `change`            | `SearchBarChange` | `{ search, filters, state }`. One per user action; the debounced text counts too                       |
| `update:search`     | `string`          | Every keystroke, undebounced                                                                           |
| `search`            | `string`          | The debounced search text                                                                              |
| `update:mode`       | `SearchBarMode`   | The bar's width mode (`wide`, `medium`, `narrow`), or `phone` on a phone; at mount and on every change |

`change.filters` holds the filters as plain values keyed by field, with relative dates resolved.

## Fields

A field is `{ id, label, filter, key?, operators? }`. `filter` selects the kind; the existing `ColumnFilterConfig` shapes keep working.

| Kind       | `filter`                                 | Value in `state.values[id]`                                    |
| ---------- | ---------------------------------------- | -------------------------------------------------------------- |
| Text       | `true` or `"field"`                      | `string`                                                       |
| Select     | `{ options, multiple? }`                 | `string`, `string[]`, or `NotValue` when `operators` has `not` |
| Date range | `{ range: [startField, endField] }`      | `{ start?, end? }` or a `RelativeDate`                         |
| Toggle     | `{ toggle: true }`                       | `boolean`                                                      |
| Number     | `{ number: true, min?, max?, presets? }` | `NumberValue`                                                  |
| Custom     | `{ component, label, parse? }`           | whatever your component emits                                  |

Value shapes added by the bar:

```ts
type NumberValue = { op: "gte" | "lte" | "eq" | "between"; min?: number; max?: number };
type NotValue = { not: string[] };
type RelativeDate = { relative: "today" | "7d" | "30d" };
```

- `NumberValue`: `gte` and `eq` carry `min`, `lte` carries `max`, `between` carries both. The editor writes `gte`, `lte` or `between`; `eq` comes only from code or a link.
- `NotValue`: the chip reads "Field: not Value".
- `RelativeDate`: the date editor's relative ranges. The bar resolves it to concrete dates in `change.filters`.
- `key` is the field name in the search syntax (default: `id`).
- `FilterOption.count` shows a count next to the option; the `counts` prop overrides it per state.

### Custom editors

A custom field gives a component and a label function. The component receives `modelValue` and emits `update:modelValue`. `label(value)` is the text on the chip after `Name:`.

A value read back from the URL or from a saved view is untrusted input. Give `parse(raw)` to check it: `raw` is the JSON-parsed value, return the value to apply or `undefined` to drop it (a throw drops it too). Without `parse` the bar accepts only a primitive, an array of primitives or a plain object whose entries are those, and drops anything with a `__proto__`, `constructor` or `prototype` key.

```ts
const fields: SearchBarField[] = [
  {
    id: "rating",
    label: "Rating",
    filter: {
      component: StarsEditor,
      label: (v) => `${v}+ stars`,
      parse: (raw) => (typeof raw === "number" && raw >= 1 && raw <= 5 ? raw : undefined),
    },
  },
];
```

## Search text and `v-model`

`v-model` carries the whole state, search text included; `state.search` follows the input after `search-debounce`. A filter changed while the text waits for that pause takes the text with it: `search` fires first, then one `change` carries both.

When the parent writes `v-model`, the bar updates its state, the input and the URL but emits neither `change` nor `search`: the parent that wrote the value loads the data itself. A write while the typed text waits for its pause drops that text. The table drives its bar this way (Clear all, the empty state's actions). The search text is never part of a view or of the remembered filters.

## Filters and the View in the URL

Inside a blade that has a URL, the applied filters go to the URL query under `<storage-key>_filters` and the current view under `<storage-key>_view`, next to the table's `_sort`, `_search` and `_page`. A link to the screen opens it with the same filters and view, and a reload keeps them.

- On mount, the values of `v-model` come first, then the URL's, then the default view. A `v-model` with a search and no values keeps its search and takes the URL's values. Values the bar starts with win over the default view: it is not applied, and the view reads as "All", modified, unless the URL names a view.
- A link that names a view but has no filters (`orders_view=overdue` from a dashboard) opens the view with its values. A view registered after mount applies when it arrives, unless a filter was set meanwhile.
- If filters were restored (or a view applied), the bar emits `update:modelValue` and `change` once so the data can be loaded; it emits nothing when there is nothing to apply.
- Every applied change rewrites the value; with nothing applied the parameter is removed. The current view is always written, "All" as `_view=all`; a link without `_view` opens the default view.
- A view id that no longer exists (a deleted user view) shows as "All", modified while its filters apply; the filters still apply.
- A blade without a URL, a bar outside a blade, or a bar without `storage-key` remembers nothing.

The value is short and readable: fields are separated by `;`, each one is `id:value`.

| Value                | Example                                                      |
| -------------------- | ------------------------------------------------------------ |
| Select, multi-select | `status:Paid,New`                                            |
| Excluded values      | `!status:Paid`                                               |
| Relative date        | `created:7d` (also `today`, `30d`)                           |
| Date range           | `created:2026-01-01..2026-01-31`, `created:2026-01-01..`     |
| Toggle               | `overdue:1`                                                  |
| Number               | `total:>=100`, `total:<=100`, `total:=100`, `total:100..200` |
| Text                 | `name:Acme`                                                  |
| Custom editor        | the value as JSON                                            |

Relative dates stay relative: a link with `created:7d` opened next week shows that week's last 7 days. A `;`, `,`, `:` or `\` inside a value is escaped with `\`. Malformed parts are skipped. A part for a field the bar does not have yet stays in the URL and applies when the field appears. A field that goes away (an external registration removed) leaves `change.filters`, but its part stays in the URL and its value comes back with the field.

## On a Phone

- The bar is the search and a 36px Filters icon button with a count badge. A summary line under it reads "N results · View\* · filtered from M · K filters · Clear all" ("N items" when nothing is filtered). The view shows when it is not the system view or when its values were changed ("All\*"). The search has no `/` hint.
- The Filters button opens a bottom sheet: "Clear" on the left, "Filters" with the count, "Done" on the right; the views as chips with the unsaved row; the same fields as the desktop panel with larger rows; and a full-width "Show N results" button ("No matching results" at 0).
- A chip editor and the view menu are not used on a phone; everything goes through the sheet.

::storybook id="data-display-vcsearchbar--phone-filters-sheet"

## External Filters and Views

Modules add fields and views to another module's screen:

```ts
import { registerExternalSearchFilters, unregisterExternalSearchFilters } from "@vc-shell/framework";

registerExternalSearchFilters({
  id: "reviews-rating",
  targetBlades: ["orders"],
  priority: 100,
  fields: [{ id: "rating", label: "Rating", filter: { number: true } }],
  views: [{ id: "top-rated", name: "Top rated", values: { rating: { op: "gte", min: 4 } } }],
});

unregisterExternalSearchFilters("reviews-rating");
```

- `targetBlades` lists blade names, compared case-insensitively. A bar answers to the name of the blade it sits in.
- Set the `name` prop to address a bar by another name: a bar outside a blade, or two bars in one blade. On `VcDataTable` the same prop is `search-name`.
- Contributed fields and views come after the screen's own, ordered by `priority` (lower first, default 100). Registering an existing `id` replaces it. The registry is reactive: a module that loads after the blade opened still reaches it.
- A field that registers late (a contributed one, or `fields` loaded after mount) still gets its value from the URL: that part of the URL is kept until the field arrives, then applies as one `change`.

## Known Limitations

- User views keep object and array values by reference: treat view values as immutable. Custom values must be cloneable to be saved in a view.
- Two bars with the same `storage-key` on one page keep separate caches and can overwrite each other.
- Views use `localStorage` even when `VcDataTable` has `state-storage="session"`.
- Back and forward navigation inside an open blade does not update the bar: the URL is read when the bar mounts.
- In the table, the restored `@filter` is sent after the screen's own `onMounted`, but a screen that starts its own unfiltered load there can still race with it: whichever response arrives last fills the table.
- The date editor's relative ranges have no arrow-key navigation.
- A click on a button in Safari does not focus it, so focus is not returned to it after a popover closes.

## Common Mistakes

- Putting a `VcSearchBar` into `#header` and also setting `search-bar` on the table: the table renders its own bar as well. Use one.
- Expecting user views or URL filters without `storage-key`: views live in memory and nothing goes to the URL. `VcDataTable` with `search-bar` and no `state-key` warns about it in development.
- Passing `v-model` with values and expecting the default view: values the bar starts with win.
- Targeting external filters with a module name instead of the blade name.

## Related Components

- [VcDataTable](../vc-data-table): renders this bar with `search-bar`.
- [VcBlade](../vc-blade): shows the view selector next to its title.
- [VcInput](../../molecules/vc-input): a plain text input.
