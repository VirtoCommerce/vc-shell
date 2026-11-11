---
title: VcSearchBar
category: components
group: data-display
---

# VcSearchBar

Search, applied filters and saved views for a list screen, in one row. It holds the filter state and reports it as plain values and as a search phrase. `VcDataTable` renders it when you set `search-bar`; it also works on its own.

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
| under 480px | Narrow: the Filters button is a funnel icon with a count badge                                                      |

::storybook id="data-display-vcsearchbar--medium-blade"

### Search syntax

- Typing `field:` suggests the field's values; `field:value` followed by a space becomes a chip. The field name is the field's `key` (default: its `id`).
- A word of 2 or more letters suggests the fields it matches. ↑ and ↓ move through the suggestions, Enter picks one.
- An unknown field or value (`foo:bar`, `status:xyz`) stays search text.

### Keyboard

- `/` focuses the search of the active blade (or of a bar outside blades) when no text field has focus.
- Backspace in an empty search removes the last chip.
- Esc closes the suggestions, then clears the text, then leaves the search. It never closes the blade.

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

Selecting a view replaces the filters. Any other change keeps the current view and marks it **Modified**; changing it back (in any order) clears the mark. The selector never switches to another view on its own because the filters happen to match it. Clear all selects "All".

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
| `placeholder`     | `string`                                 | -          | Search placeholder and accessible name                                                |
| `searchDebounce`  | `number`                                 | `300`      | Delay in ms before the typed text reaches the state, `change` and `search`            |
| `search`          | `string`                                 | -          | Controlled search text, see below                                                     |
| `name`            | `string`                                 | -          | Target of external filters and views; defaults to the name of the blade the bar is in |
| `searchable`      | `boolean`                                | `true`     | Show the search input                                                                 |
| `disabled`        | `boolean`                                | `false`    | Disable the bar                                                                       |

## Events

| Event               | Payload           | Description                                                                              |
| ------------------- | ----------------- | ---------------------------------------------------------------------------------------- |
| `update:modelValue` | `SearchBarState`  | Any change of search text or values                                                      |
| `change`            | `SearchBarChange` | `{ search, filters, phrase, state }`. One per user action; the debounced text counts too |
| `update:search`     | `string`          | Every keystroke, undebounced                                                             |
| `search`            | `string`          | The debounced search text                                                                |

The component exposes `clearAll()` (filters, search and the "All" view), `clearFilters()` and `removeFilter(id)`.

## Fields

A field is `{ id, label, filter, key?, operators? }`. `filter` selects the kind; the existing `ColumnFilterConfig` shapes keep working.

| Kind       | `filter`                                 | Value in `state.values[id]`                                    |
| ---------- | ---------------------------------------- | -------------------------------------------------------------- |
| Text       | `true` or `"field"`                      | `string`                                                       |
| Select     | `{ options, multiple? }`                 | `string`, `string[]`, or `NotValue` when `operators` has `not` |
| Date range | `{ range: [startField, endField] }`      | `{ start?, end? }` or a `RelativeDate`                         |
| Toggle     | `{ toggle: true }`                       | `boolean`                                                      |
| Number     | `{ number: true, min?, max?, presets? }` | `NumberValue`                                                  |
| Custom     | `{ component, label, toPhrase? }`        | whatever your component emits                                  |

Value shapes added by the bar:

```ts
type NumberValue = { op: "gte" | "lte" | "eq" | "between"; min?: number; max?: number };
type NotValue = { not: string[] };
type RelativeDate = { relative: "today" | "7d" | "30d" };
```

- `NumberValue`: `gte` and `eq` carry `min`, `lte` carries `max`, `between` carries both. The editor writes `gte`, `lte` or `between`; `eq` comes only from code or a phrase.
- `NotValue`: the chip reads "Field: not Value".
- `RelativeDate`: the date editor's relative ranges. The bar resolves it to concrete dates in `change.filters`.
- `key` is the name used in the phrase and in the search syntax (default: `id`).
- `FilterOption.count` shows a count next to the option; the `counts` prop overrides it per state.

### Custom editors

A custom field gives a component and two functions. The component receives `modelValue` and emits `update:modelValue`. `label(value)` is the text on the chip after `Name:`; `toPhrase(value)` is the phrase fragment (without it the phrase gets `key:value`).

```ts
const fields: SearchBarField[] = [
  {
    id: "rating",
    label: "Rating",
    filter: { component: StarsEditor, label: (v) => `${v}+ stars`, toPhrase: (v) => `rating:[${v} TO]` },
  },
];
```

## Search text: `search` prop vs `v-model`

`v-model` carries the whole state, search text included. When the parent changes `v-model`, the bar updates its state and the URL but does **not** emit `change`: the parent that wrote the value loads the data itself. The `search` prop is for a parent that owns the text itself (the table does): an outside change of `search` updates the input and `state.search` and emits neither `change` nor `search`, and typing that the parent echoes back emits nothing extra. The search text is never part of a view or of the remembered filters.

## Filters and the View in the URL

Inside a blade that has a URL, the applied filters go to the URL query under `<storage-key>_filters` and the current view under `<storage-key>_view`, next to the table's `_sort`, `_search` and `_page`. A link to the screen opens it with the same filters and view, and a reload keeps them.

- On mount, `v-model` comes first, then the URL, then the default view. Values the bar starts with win over the default view: it is not applied, and the view reads as "All", modified, unless the URL names a view.
- If filters were restored (or a default view applied), the bar emits `change` once so the data can be loaded; it emits nothing when there is nothing to apply.
- Every applied change rewrites the value; with nothing applied the parameter is removed. "All" is written as `_view=all` when the bar has a default view, so a reload does not reopen the default.
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

Relative dates stay relative: a link with `created:7d` opened next week shows that week's last 7 days. A `;`, `,`, `:` or `\` inside a value is escaped with `\`. Unknown field ids and malformed parts are skipped.

## On a Phone

- The bar is the search and a 36px Filters icon button with a count badge. A summary line under it reads "N results · View\* · filtered from M · K filters · Clear all" ("N items" when nothing is filtered).
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
- A contributed field that registers late has no value restored from the URL: its value is dropped on mount.

## Phrase Output

`change.phrase` is the search phrase for the Virto Commerce keyword search: the search words, then one `key:value` per filter, joined by spaces.

- The search words are a raw fragment. They are put into the phrase as typed and are not escaped.
- Values with spaces or special characters are quoted; lists are comma separated (`status:New,Processing`); `NotValue` becomes `!status:...`; ranges use the bracket form (`total:[100 TO]`, `total:[10 TO 20]`, `created:[2026-01-01 TO 2026-01-31]`); a toggle is `key:true`; `eq` is `total:100`.
- A custom field writes whatever its `toPhrase` returns.
- `change.filters` holds the same filters as plain values keyed by field, with relative dates resolved.

## Known Limitations

- The search text goes into the phrase unescaped (see above).
- Dates in a phrase are not checked for calendar validity (`2026-13-45` is accepted).
- User views keep object and array values by reference: treat view values as immutable. Custom values must be cloneable to be saved in a view.
- Two bars with the same `storage-key` on one page keep separate caches and can overwrite each other.
- Views use `localStorage` even when `VcDataTable` has `state-storage="session"`.
- Filters from the URL are kept only for fields known at mount. Fields whose ids arrive later (for example `globalFilters` loaded asynchronously) lose their values.
- Back and forward navigation inside an open blade does not update the bar: the URL is read when the bar mounts.
- In the table, the restored `@filter` is sent after the screen's own `onMounted`, but a screen that starts its own unfiltered load there can still race with it: whichever response arrives last fills the table.
- The date editor's relative ranges have no arrow-key navigation.
- A click on a button in Safari does not focus it, so focus is not returned to it after a popover closes.

## Common Mistakes

- Putting a `VcSearchBar` into `#header` and also setting `search-bar` on the table: the table renders its own bar as well. Use one.
- Passing `v-model` and `search` that disagree: the parent value of `search` wins for the text.
- Expecting user views or URL filters without `storage-key`: views live in memory and nothing goes to the URL.
- Passing `v-model` with values and expecting the default view: values the bar starts with win.
- Targeting external filters with a module name instead of the blade name.

## Related Components

- [VcDataTable](../vc-data-table): renders this bar with `search-bar`.
- [VcBlade](../vc-blade): shows the view selector next to its title.
- [VcInput](../../molecules/vc-input): a plain text input.
