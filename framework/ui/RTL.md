# Right-to-left languages (RTL)

Vc-Shell UI components lay out right to left for Arabic, Hebrew, Persian and Urdu. The app only sets the page's
direction; no app-side CSS or build step is needed.

## Turning it on

Set `dir` on `<html>` when the user's language reads right to left, and back to `ltr` otherwise:

```ts
const RTL_LANGUAGES = ["ar", "he", "fa", "ur"];

function applyDirection(locale: string) {
  const rtl = RTL_LANGUAGES.includes(locale.split("-")[0]);
  document.documentElement.dir = rtl ? "rtl" : "ltr";
  document.documentElement.lang = locale;
}
```

The components follow the attribute as it changes. Vc-Shell's fonts have no Arabic letters, so an app that serves
Arabic should add a font for them (for example Noto Sans Arabic with a `unicode-range`).

## What mirrors

- **Layout.** Components use logical CSS (`margin-inline-start`, `padding-inline`, `inset-inline-end`,
  `text-align: start`, `border-start-start-radius`...) and Tailwind's logical utilities (`tw-ms-*`, `tw-pe-*`,
  `tw-start-*`, `tw-text-end`, `tw-rounded-s`...). The sidebar, blades, menus, tables, forms and toolbars mirror.
- **Icons that point the way of reading** turn around: chevrons and arrows to a side, log in/out, panel, undo/redo
  and reply icons. Up/down and diagonal arrows don't. `VcIcon` marks them with `vc-icon--rtl-mirror`; a Lucide icon
  component used directly is covered by its class.
- **Panels and gestures.** Tooltips, popovers and dropdowns placed to the `right` open on the left. Phone swipes (table
  card actions, the menu tabs), column resize and column reorder follow the reading direction.
- **Data keeps its own direction.** Table cells, phone card fields and text inputs use `unicode-bidi: plaintext`, so an
  email, code, URL or amount reads left to right inside an Arabic page and keeps its column's alignment.
- **Column alignment** stays logical: a column with `align="end"` (amounts) aligns right, or left in RTL.

What doesn't mirror: charts, and the dashboard grid, which places its widgets itself (gridstack's own RTL mode).

## Writing components

- Use logical properties and utilities, never `left`/`right`, `margin-left`, `tw-ml-*`, `tw-text-left`.
  Centering (`left: 50%` with `translateX(-50%)`) is the same both ways and can stay.
- A horizontal move that has to go toward the end of the line multiplies by `--vc-inline-sign` (1, or -1 in RTL):
  `transform: translateX(calc(24px * var(--vc-inline-sign, 1)))`. Or use Tailwind's `rtl:` variant.
- Script that places things or reads a pointer uses `useTextDirection()` (`isRtl`) or `isRtlElement(el)` from
  `@core/composables/useTextDirection`. `useFloatingPosition` already mirrors `left`/`right` placements.
- To check a component, open its story and run `document.documentElement.dir = "rtl"` in the console.
