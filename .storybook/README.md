# Storybook for VC-Shell

Stories live next to the components in `framework/ui/components/**` and `framework/shell/**`. How a story file must look is defined in [STORY_STANDARD.md](./STORY_STANDARD.md).

## Commands

```bash
yarn dev:storybook          # dev server on :6006
yarn build:storybook        # static build into storybook-static/
yarn test:storybook         # every story as a browser test: render, play function, axe (WCAG 2.2 A/AA)
yarn check:story-argtypes   # fails when a story documents a prop, event or slot the component no longer has
```

`yarn build` must run first on a fresh checkout. When `framework/dist/index.css` exists, Storybook uses it instead of the SCSS sources, so rebuild the framework before judging a style change.

## Docs pages

Every component gets an autodocs page (`.storybook/docs-page.ts`): description, primary story, controls, all stories, then the component's `*.docs.md` guide under "Usage guide". The guide is the same file that feeds vc-docs and the vc-app skill, so write usage documentation there, not in the story file.

"Show code" is built by `.storybook/source-snippet.ts`: for a story with its own `render`, it prints the story's template and setup as a `<script setup>` + `<template>` SFC with `@vc-shell/framework` imports. Set `parameters.docs.source.code` on a story only when the generated snippet is not what a developer should copy.

## Tags

| Tag          | Effect                                                               |
| ------------ | -------------------------------------------------------------------- |
| `autodocs`   | Docs page (on by default in `preview.ts`)                            |
| `!autodocs`  | Story stays in the sidebar and in tests, but not on the docs page    |
| `deprecated` | Shows a deprecated API; pair it with `!autodocs` so nobody copies it |

## Interaction tests

A `play` function turns a story into a behaviour test that `yarn test:storybook` runs in Chromium:

```ts
import { expect, userEvent, within } from "storybook/test";

export const Interactive: Story = {
  render: () => ({
    /* ... */
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Next page" }));
    await expect(canvas.getByText("Current Page: 6 of 15")).toBeInTheDocument();
  },
};
```

Query by role and accessible name. Teleported content (popups, dropdowns) is outside `canvasElement`: use `within(canvasElement.ownerDocument.body)`.

## Toolbar

- **Theme**: light / dark.
- **Language**: every locale in `framework/locales`. Arabic and Hebrew switch `<html dir>` to `rtl`, as in the app. vc-shell formats dates, numbers and money by the browser locale (`navigator.language`), not the app language, so the story iframe also pretends its browser is set to the chosen language. Story texts passed as args (labels, placeholders) stay as written; only the framework's own texts translate.
- **Direction**: `auto` follows the language; `ltr` / `rtl` force it, to check an RTL layout with readable English text.

A story that must always render in one mode pins it with `globals: { locale: "ar" }`.

## Decorators

From `.storybook/decorators.ts`:

- `withContainer` — padded, bordered wrapper
- `withDarkBackground` — dark background
- `withVcApp` — `.vc-app` container, needed by components that teleport (tooltips, dropdowns)
- `withMobileView` — forces `$isMobile` / `IsMobileKey` to true for the story
- `withDesktopView` — forces the desktop inject keys, for docs iframes narrower than the desktop breakpoint

`preview.ts` applies the router, the global mocks, `withVcApp` and the theme switcher to every story.

## Component manifest

`yarn generate:component-manifest` writes `cli/vc-app-skill/runtime/knowledge/components.json`: import line, props, events, slots, docs path and story ids for every component that has stories. The release regenerates it together with the `*.docs.md` mirror.
