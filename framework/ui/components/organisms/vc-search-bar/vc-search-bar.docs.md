---
title: VcSearchBar
category: components
group: data-display
---

# VcSearchBar

A search input with filter pills, presets, an optional condition builder and an optional Advanced query. It holds the filter state and reports it as plain values and as a search phrase. `VcDataTable` renders it for you; it also works on its own.

::storybook id="data-display-vcsearchbar--status-and-date-range"

## When to Use

- Use **VcSearchBar** for a list screen that needs search text plus a few filters the user can pin, save as presets and combine.
- Use it standalone when the data is not a table (cards, a gallery, a tree).
- When NOT to use: for a single text box with no filters, use `VcInput`; for a filter inside one table column, use `VcColumn` `filter`.

## Three Ways to Use It

### 1. Table default

Set `searchable` or `global-filters` on `VcDataTable`. The table renders the bar and forwards `@search` and `@filter` as before. See [VcDataTable](../vc-data-table).

```vue
<VcDataTable :items="orders" state-key="orders-list" searchable :global-filters="orderFilters" @filter="onFilter" @search="onSearch" />
```

### 2. Your own bar in the `#header` slot

For the builder, the Advanced query or full control over the state, leave `searchable` and `global-filters` off and put the bar into the table's `#header` slot. Load data from the bar's `v-model` or `@change`.

```vue
<VcDataTable :items="orders" :loading="loading">
  <template #header>
    <VcSearchBar v-model="query" :fields="orderFields" builder advanced storage-key="orders-list" @change="load" />
  </template>
</VcDataTable>
```

### 3. Standalone

```vue
<VcSearchBar v-model="query" :fields="fields" storage-key="orders" @change="load" />
```

## Layout

The bar is one row, 48px high with its own 16px side and 8px top and bottom padding, so it needs no wrapper: search, filter pills, **+ Filter**, then **Clear all** and **Save as preset** after a divider, the **Edit filters** icon button (with `builder` or `advanced`), and the preset tray at the end.

- The search field is 180px wide and does not grow on focus.
- In a bar narrower than 640px (a narrow blade) the search folds into a square button that widens into the field on click; it folds back when focus leaves an empty field. Pills show only the set filters there; on a wide bar pinned fields show too.
- A row that does not fit is cut at the edge. Hovering it (after 400ms) or moving focus into it unfolds it over the content below; it folds 150ms after the pointer leaves. An open editor, menu or the preset name field keeps it unfolded. Without motion when the system asks for reduced motion.
- `collapse-search` overrides the automatic choice: `true` always shows the button, `false` always shows the field. A search with text is always shown open.
- The bar has no slots. Put your own buttons next to it, or use the table's `search-header-actions` slot.

::storybook id="data-display-vcsearchbar--narrow-blade"

## Props

| Prop             | Type                | Default | Description                                                                    |
| ---------------- | ------------------- | ------- | ------------------------------------------------------------------------------ |
| `modelValue`     | `SearchBarState`    | -       | `{ search, values, query? }`. Optional: without it the bar keeps its own state |
| `fields`         | `SearchBarField[]`  | `[]`    | Filters offered by this screen                                                 |
| `placeholder`    | `string`            | -       | Search input placeholder                                                       |
| `searchDebounce` | `number`            | `300`   | Delay in ms before the typed text reaches the state, `change` and `search`     |
| `search`         | `string`            | -       | Controlled search text, see below                                              |
| `storageKey`     | `string`            | -       | Turns on user presets and filters in the URL, see [Presets](#presets)          |
| `presets`        | `SearchBarPreset[]` | -       | Module presets shown to every user                                             |
| `builder`        | `boolean`           | `false` | Adds the condition builder to the Edit filters panel                           |
| `advanced`       | `boolean`           | `false` | Adds the Advanced query text to the Edit filters panel                         |
| `name`           | `string`            | -       | Target for external filters; defaults to the name of the blade the bar sits in |
| `searchable`     | `boolean`           | `true`  | Show the search input                                                          |
| `collapseSearch` | `boolean`           | -       | Search as a button. Unset: automatic (a bar under 640px or a phone)            |
| `disabled`       | `boolean`           | `false` | Disable the bar                                                                |

## Events

| Event               | Payload           | Description                                                                              |
| ------------------- | ----------------- | ---------------------------------------------------------------------------------------- |
| `update:modelValue` | `SearchBarState`  | Any change of search text, values or query                                               |
| `change`            | `SearchBarChange` | `{ search, filters, phrase, state }`. One per user action; the debounced text counts too |
| `update:search`     | `string`          | Every keystroke, undebounced                                                             |
| `search`            | `string`          | The debounced search text                                                                |

## Fields

A field is `{ id, label, filter, key?, pinned?, operators? }`. `filter` selects the kind; the existing `ColumnFilterConfig` shapes keep working.

| Kind       | `filter`                            | Value in `state.values[id]`                                    |
| ---------- | ----------------------------------- | -------------------------------------------------------------- |
| Text       | `true` or `"field"`                 | `string`                                                       |
| Select     | `{ options, multiple? }`            | `string`, `string[]`, or `NotValue` when `operators` has `not` |
| Date range | `{ range: [startField, endField] }` | `{ start?, end? }` or a `RelativeDate`                         |
| Toggle     | `{ toggle: true }`                  | `boolean`                                                      |
| Number     | `{ number: true, min?, max? }`      | `NumberValue`                                                  |
| Custom     | `{ component, label, toPhrase? }`   | whatever your component emits                                  |

Value shapes added by the bar:

```ts
type NumberValue = { op: "gte" | "lte" | "eq" | "between"; min?: number; max?: number };
type NotValue = { not: string[] };
type RelativeDate = { relative: "today" | "7d" | "30d" };
```

- `NumberValue`: `gte` and `eq` carry `min`, `lte` carries `max`, `between` carries both. The editor never emits a missing bound.
- `NotValue`: select fields with `operators: ["any", "not"]` offer "Is" and "Is not". "Is not" with nothing selected stays chosen and writes `{ not: [] }`.
- `RelativeDate`: the date editor's quick buttons. The bar resolves it to concrete dates in `change.filters` when it reports.
- `key` is the name used in the phrase (default: `id`). `pinned: false` hides a field until it has a value or the user adds it.

### Custom editors

A custom field gives a component and two functions. The component receives `modelValue` and emits `update:modelValue`. `label(value)` is the text on the pill after `Name:`; `toPhrase(value)` is the phrase fragment (without it the phrase gets `key:value`).

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

`v-model` carries the whole state, search text included. When the parent changes `v-model`, the bar updates its state and the URL but does **not** emit `change`: the parent that wrote the value loads the data itself. The `search` prop is for a parent that owns the text itself (the table does): an outside change of `search` updates the input and `state.search` and emits neither `change` nor `search`, and typing that the parent echoes back emits nothing extra. The search text is never part of the remembered filters.

## Presets

With a `storage-key` the bar offers presets. Presets are kept in `localStorage`; the applied filters are kept in the blade URL, see [Filters in the URL](#filters-in-the-url).

- **Module presets** come from the `presets` prop and from external registrations. They are the same for every user and cannot be deleted.
- **User presets** are made with "Save as preset" after setting filters. They are stored per browser.
- Any preset can be pinned to the tray at the end of the row or hidden; hidden module presets can be restored from the "All presets" list.

```ts
const presets: SearchBarPreset[] = [{ id: "unpaid", name: "Unpaid", values: { status: ["New", "Processing"] }, pinned: true, version: 1 }];
```

- The preset storage key is `VC_SEARCHBAR_<KEY>` (the key upper-cased). Presets always use `localStorage`.
- A bar with only search and no filters has nothing to save, so it shows no preset tray.

## Filters in the URL

Inside a blade that has a URL, the applied filters are written to the URL query under `<storage-key>_filters`, next to the table's `_sort`, `_search` and `_page`. A link to the screen therefore opens it with the same filters, and a reload keeps them.

- The source order on mount is `v-model` first, then the URL. If filters were restored from the URL, the bar emits `change` once so the data can be loaded; it emits nothing when nothing was restored.
- Every applied change (a pill, the panel, a preset, Clear all) rewrites the value; with nothing applied the parameter is removed.
- The search words are not part of the value: the table keeps them in `<state-key>_search`.
- A blade without a URL, or a bar outside a blade, remembers nothing. So does a bar without `storage-key`.

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
| Advanced query       | `~` followed by the query text                               |

Relative dates stay relative: a link with `created:7d` opened next week shows that week's last 7 days. A `;`, `,`, `:` or `\` inside a value is escaped with `\`. Unknown field ids and malformed parts are skipped.

## Builder and Advanced

Both live in the Edit filters panel, which opens from the **Edit filters** icon button after the pills. With only one of them set the panel shows just that; with both it has tabs.

- The panel has a fixed width (640px on desktop, never wider than the screen); its content does not change it.
- `builder`: one line per condition (field, operator, value). "Add condition" opens a floating list of the unused fields; Esc closes only the list. Apply writes the conditions into the state.
- `advanced`: a text box for the phrase, with suggestions for field names and values (a fixed-width list that floats over the panel; long items are cut, the full text is in the tooltip) and a Syntax card that links to the [search phrase syntax reference](https://docs.virtocommerce.org/platform/developer-guide/Fundamentals/Indexed-Search/search-query-syntax-reference/).
- A phrase the bar can map to fields becomes ordinary pills. Anything else (OR between fields, ranges it cannot express, unknown names) is kept as a single **Query** pill: its text is cut at 40 characters, the x removes it, and with `advanced` a click on it reopens the text.
- There is no blocking validation: Apply accepts any text and the server decides.

## On a Phone

The bar stays one row: the search button, the set filters with **+ Filter** in a row that swipes sideways (its edges fade while there is more to scroll), and a **Presets** button.

- The search button opens the field over the whole row; the filters and presets come back when it folds. With `collapse-search` set to `false` the search gets a full-width row of its own above.
- A bar with only the search (no fields, presets or builder) keeps the field instead of the button.
- A pill opens its editor in a bottom sheet with **Done**. Editors apply on change, as on desktop; Done only closes the sheet.
- **+ Filter** opens a sheet with the unused fields; picking one turns the sheet into its editor (a toggle applies at once).
- **Presets** opens a sheet with all presets and **Save as preset**. The button is highlighted while the filters match a preset.

::storybook id="data-display-vcsearchbar--phone"

## External Filters

Modules add fields and presets to another module's screen:

```ts
import { registerExternalSearchFilters, unregisterExternalSearchFilters } from "@vc-shell/framework";

registerExternalSearchFilters({
  id: "reviews-rating",
  targetBlades: ["orders"],
  priority: 100,
  fields: [{ id: "rating", label: "Rating", filter: { number: true } }],
});

unregisterExternalSearchFilters("reviews-rating");
```

- `targetBlades` lists blade names, compared case-insensitively. A bar answers to the name of the blade it sits in.
- Set the `name` prop to address a bar by another name: a bar outside a blade, or two bars in one blade. On `VcDataTable` the same prop is `search-name`.
- Contributed fields appear after the screen's own, ordered by `priority` (lower first, default 100). Registering an existing `id` replaces it. The registry is reactive: a module that loads after the blade opened still reaches it.
- A contributed field that registers late has no value restored from the URL: its value is dropped on mount.

## Phrase Output

`change.phrase` is the search phrase for the Virto Commerce keyword search: the search words, then one `key:value` per filter, joined by spaces.

- The search words are a raw fragment. They are put into the phrase as typed and are not escaped, so a user can type `status:Paid` into the search box and it behaves as a filter.
- Values with spaces or special characters are quoted; lists are comma separated (`status:New,Processing`); `NotValue` becomes `!status:...`; ranges use the bracket form (`total:[100 TO]`, `total:[10 TO 20]`, `created:[2026-01-01 TO 2026-01-31]`); a toggle is `key:true`; `eq` is `total:100`.
- A custom field writes whatever its `toPhrase` returns.
- `change.filters` holds the same filters as plain values keyed by field, with relative dates resolved.

## Known Limitations

- The bar's own `search` text goes into the phrase unescaped (see above).
- A phrase with `OR` between different fields, or a range on a field that cannot hold one, becomes a Query pill instead of pills.
- A field named `OR` or `AND` is read as the operator in the phrase.
- Dates in a phrase are not checked for calendar validity (`2026-13-45` is accepted).
- User presets keep object and array values by reference: treat preset values as immutable.
- Two bars with the same `storage-key` on one page keep separate caches and can overwrite each other.
- Custom values must be cloneable to be saved in a preset.
- The outside-click rule for the editor popover treats any `.vc-popover` or `.vc-sidebar` on the page as inside.
- Clicking a preset chip while an Advanced query is active drops the query.
- A multi-value condition on a field that is not multi-select (`status:a,b` on a single select) becomes a Query pill.
- In the table default, the restored `@filter` is sent after the screen's own `onMounted`, but a screen that starts its own unfiltered load there can still race with it: whichever response arrives last fills the table.
- Filters from the URL are kept only for fields known at mount. Fields whose ids arrive later (for example `globalFilters` loaded asynchronously) lose their values.
- Back and forward navigation inside an open blade does not update the bar: the blade's URL query service only reads and writes, it does not report outside changes. The URL is read when the bar mounts.
- Presets use `localStorage` even when `VcDataTable` has `state-storage="session"`.
- The panel tabs have no arrow-key navigation yet.
- A click on a button in Safari does not focus it, so focus is not returned to it after cancelling a panel.
- On a phone in a right-to-left layout the edge fades of the swipe row follow left-to-right scrolling.

## Common Mistakes

- Putting a `VcSearchBar` into `#header` and also setting `searchable` on the table: the table renders its own bar as well. Use one.
- Passing `v-model` and `search` that disagree: the parent value of `search` wins for the text.
- Expecting presets without `storage-key`: no presets are saved and no filters go to the URL.
- Targeting external filters with a module name instead of the blade name.

## Related Components

- [VcDataTable](../vc-data-table): renders this bar by default.
- [VcInput](../../molecules/vc-input): a plain text input.
