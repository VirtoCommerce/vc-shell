# Accessibility (a11y)

Vc-Shell UI components target **WCAG 2.2 level AA**. Accessibility is verified
automatically with [axe-core](https://github.com/dequelabs/axe-core) against
every Storybook story.

## Running the checks

Two complementary entry points, same axe configuration:

```bash
# 1. Vitest story tests (the primary gate) — each story renders in Chromium,
#    its play function runs, and axe checks are applied automatically.
yarn test:storybook

# 2. Standalone Playwright audit against a running Storybook.
yarn dev:storybook          # start Storybook on :6006 (or serve a static build)
yarn test:a11y              # scan every story with axe-core, fail on violations
VERBOSE=1 yarn test:a11y    # print per-story detail
SB_BASE=http://host:port yarn test:a11y   # point at a different Storybook
```

`yarn test:storybook` is powered by `@storybook/addon-vitest`
(`vitest.config.storybook.ts`): the story files themselves are the tests, and
`.storybook/preview.ts` sets `a11y.test: "error"`, so any violation fails the
test run. The standalone audit (`scripts/a11y-audit.mjs`) is useful for
scanning a deployed/static Storybook without the Vitest harness.

Inside Storybook the [`@storybook/addon-a11y`](https://storybook.js.org/addons/@storybook/addon-a11y)
panel reports the same violations live.

## Scope and disabled rules

Checks run the **WCAG 2.2 A/AA rule tags** (`wcag2a`, `wcag2aa`, `wcag21a`,
`wcag21aa`, `wcag22a`, `wcag22aa`) — axe "best-practice" rules such as `landmark-unique` or
`empty-table-header` are intentionally out of scope. The scope is set via
`a11y.options.runOnly` in `.storybook/preview.ts` and mirrored in
`scripts/a11y-audit.mjs`.

Two axe rules are additionally disabled in both places:

| Rule             | Reason                                                                                                                                                                                                                                                                                                                                                                                           |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `region`         | Storybook decorators wrap each story in extra elements, which breaks landmark/region rules. Not a component defect.                                                                                                                                                                                                                                                                              |
| `color-contrast` | Text/background contrast is defined by the product **brand palette** (`framework/assets/styles/theme/colors.scss`). Several brand and status colors (e.g. `--primary-500` `#319ed4` with white text ≈ 3:1) do not meet the 4.5:1 AA threshold for small text. Changing them alters the product's visual identity, so contrast is tracked as a **design decision**, not a per-component code fix. |

Everything else (names, roles, labels, ARIA validity, keyboard focus, nesting)
is enforced and expected to stay at zero violations.

## Authoring accessible components

- **Icon-only controls need a name.** Pass `aria-label` (or an i18n string) to
  any button/link that shows only an icon. A tooltip is _not_ an accessible name.
- **Form controls need a name.** When a component can be used without a visible
  label, expose an `ariaLabel` prop and bind it to the input when `label` is
  empty. `VcCheckbox`, `VcRadioButton`, `VcSwitch` and `VcDropdown` follow this
  pattern.
- **Don't nest interactive controls.** A `role="button"`/`tabindex` wrapper
  around a real `<button>` (or an `<input>` inside a `<button>`) triggers
  `nested-interactive`. Put the interactivity on a single element.
- **`role="img"` requires an accessible name.** Only expose it when an `alt`/
  name is provided; otherwise leave background images decorative.
- **Keep ARIA table structure valid.** `role="table" → rowgroup → row → cell`.
  Use `role="presentation"` on pure layout wrappers so cells/rows are owned by
  the correct ancestor, and `display: contents` on semantic wrappers that must
  stay layout-transparent (see `vc-data-table/components/*`).

## Configuration gotcha

The Vitest projects **must** be referenced as config files in the root
`vitest.config.ts` (`test.projects: ["./vitest.config.storybook.ts", …]`). An
inline project object silently skips `vitest.config.storybook.ts`, dropping the
`storybookTest` plugin — and with it the Storybook vite aliases and the a11y
checks — while still appearing to define a "storybook" project.
