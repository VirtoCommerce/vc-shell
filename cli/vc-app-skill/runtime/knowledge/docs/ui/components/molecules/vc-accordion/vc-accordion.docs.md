# VcAccordion

Collapsible content sections with smooth CSS grid animations, customizable collapsed heights with fade-out preview, and four visual variants. Supports both data-driven rendering via `items` array and slot-based composition with `VcAccordionItem`.

## When to Use

- FAQ sections, expandable product details, or grouped settings
- Progressive disclosure to reduce visual clutter on content-heavy pages
- Partial content preview in collapsed state (via `collapsedHeight`)
- Expandable form sections or configuration panels

When NOT to use:

- For navigation groups -- use `VcMenuGroup`
- For tab-based content switching -- use `VcTabs`
- For single collapsible panels without siblings -- use `VcAccordionItem` directly

## Quick Start

```vue
<template>
  <VcAccordion
    :items="faqItems"
    variant="bordered"
  />
</template>

<script setup lang="ts">
import { VcAccordion } from "@vc-shell/framework";

const faqItems = [
  { id: "install", title: "How to install?", content: "Run yarn add @vc-shell/framework..." },
  { id: "configure", title: "How to configure?", content: "Create a vite.config.ts file..." },
  { id: "deploy", title: "How to deploy?", content: "Build with yarn build and deploy..." },
];
</script>
```

## Features

### Visual Variants

Four variants control the visual grouping and spacing of accordion items.

| Variant     | Description                                                              |
| ----------- | ------------------------------------------------------------------------ |
| `default`   | Items stacked with shared top/bottom borders, no gaps                    |
| `bordered`  | Single outer border wrapping all items, items separated by inner borders |
| `separated` | Card-like items with 12px gaps between them, each with its own border    |
| `ghost`     | Transparent background, minimal styling, no borders or padding           |

```vue
<VcAccordion :items="items" variant="separated" />
```

### Controlled with v-model

Use `v-model` to control which items are expanded. In single mode, the value is a single `string | number`. In multiple mode, the value is an array.

```vue
<template>
  <VcAccordion
    v-model="openItem"
    :items="items"
  />
  <p>Currently open: {{ openItem }}</p>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcAccordion } from "@vc-shell/framework";

const openItem = ref<string | number | null>("faq1");
const items = [
  { id: "faq1", title: "First question", content: "Answer to first question." },
  { id: "faq2", title: "Second question", content: "Answer to second question." },
];
</script>
```

### Multiple Open Items

Set `multiple` to `true` to allow expanding several items simultaneously. The `v-model` value becomes an array.

```vue
<VcAccordion v-model="openItems" :items="items" :multiple="true" />
```

### Partial Content Preview (collapsedHeight)

When `collapsedHeight` > 0, collapsed items show that many pixels of content with a fade-out gradient. The chevron only appears when content overflows.

```vue
<VcAccordion :items="items" :collapsed-height="100" variant="separated" />
```

### Maximum Expanded Height

Limit expanded content height with `maxExpandedHeight`. Content scrolls when it exceeds the limit.

```vue
<VcAccordion :items="items" :max-expanded-height="400" variant="bordered" />
```

### Per-Item Height Overrides

Each item can override the global `collapsedHeight` and `maxExpandedHeight`:

```ts
const items = [
  { id: "summary", title: "Summary", content: longText, collapsedHeight: 0 },
  { id: "preview", title: "Description", content: longText, collapsedHeight: 80 },
  { id: "terms", title: "Terms", content: veryLongText, maxExpandedHeight: 300 },
];
```

### Custom Title and Slot-based Composition

For full control, use the default slot with `VcAccordionItem` children instead of the `items` prop.

```vue
<VcAccordion variant="bordered">
  <VcAccordionItem>
    <template #title>
      <div class="tw-flex tw-items-center tw-gap-2">
        <span class="tw-px-2 tw-py-0.5 tw-bg-[color:var(--success-100)] tw-text-[color:var(--success-700)] tw-rounded tw-text-xs">NEW</span>
        <span>Feature announcement</span>
      </div>
    </template>
    Details about the new feature...
  </VcAccordionItem>
  <VcAccordionItem title="Regular item">Standard content.</VcAccordionItem>
</VcAccordion>
```

### Dynamic Component Content

The `content` property in `AccordionItem` accepts both strings and Vue components, allowing you to embed interactive content inside accordion panels.

## Recipes

### FAQ Page with Preselected Item

```vue
<template>
  <VcAccordion
    v-model="activeQuestion"
    :items="faqs"
    variant="separated"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcAccordion } from "@vc-shell/framework";

const activeQuestion = ref("shipping");
const faqs = [
  { id: "shipping", title: "What are the shipping options?", content: "We offer standard, express, and overnight shipping..." },
  { id: "returns", title: "What is the return policy?", content: "Items can be returned within 30 days..." },
];
</script>
```

## Common Mistakes

### 1. Expecting items to open by default without v-model

```vue
<!-- WRONG: no items will be expanded on mount -->
<VcAccordion :items="items" />

<!-- CORRECT: use v-model to set initially expanded items -->
<VcAccordion v-model="expanded" :items="items" />
```

### 2. Mixing items prop with default slot

Both render together -- items-prop items appear first, then slot content. Omit `items` if using only slots.

### 3. Using multiple mode with single-value v-model

```vue
<!-- WRONG: multiple expects an array v-model -->
<VcAccordion v-model="singleValue" :items="items" :multiple="true" />

<!-- CORRECT -->
<VcAccordion v-model="arrayValue" :items="items" :multiple="true" />
```

## AccordionItem Interface

```ts
interface AccordionItem {
  id?: string | number; // Unique identifier (falls back to array index)
  title: string; // Header text
  content?: string | Component; // Body content (string or Vue component)
  titleSlot?: Component; // Custom title component (alternative to #title slot)
  collapsedHeight?: number; // Per-item collapsed height override (px)
  maxExpandedHeight?: number; // Per-item max expanded height override (px)
  disabled?: boolean; // Prevents toggling this item
}
```

## Props

| Prop                | Type                                                | Default     | Description                                           |
| ------------------- | --------------------------------------------------- | ----------- | ----------------------------------------------------- |
| `items`             | `AccordionItem[]`                                   | `[]`        | Array of items to render                              |
| `modelValue`        | `(string \| number) \| (string \| number)[]`        | --          | Controlled expanded state via `v-model`               |
| `multiple`          | `boolean`                                           | `false`     | Allow multiple items to be expanded simultaneously    |
| `variant`           | `"default" \| "bordered" \| "separated" \| "ghost"` | `"default"` | Visual style variant                                  |
| `collapsedHeight`   | `number`                                            | `0`         | Default collapsed height in pixels for all items      |
| `maxExpandedHeight` | `number`                                            | --          | Maximum expanded height (content scrolls if exceeded) |

## Events

| Event               | Payload                                      | Description                          |
| ------------------- | -------------------------------------------- | ------------------------------------ |
| `update:modelValue` | `(string \| number) \| (string \| number)[]` | Emitted when expanded item(s) change |

## Slots

| Slot      | Description                                                      |
| --------- | ---------------------------------------------------------------- |
| `default` | Place `VcAccordionItem` components directly for custom rendering |

### VcAccordionItem Slots

| Slot      | Description                                             |
| --------- | ------------------------------------------------------- |
| `title`   | Custom title rendering (replaces the `title` prop text) |
| `default` | Content body of the accordion item                      |

## CSS Variables

| Variable                                   | Default                | Description                               |
| ------------------------------------------ | ---------------------- | ----------------------------------------- |
| `--accordion-item-border-color`            | `var(--neutrals-200)`  | Border color for items and dividers       |
| `--accordion-item-border-radius`           | `6px`                  | Border radius of item containers          |
| `--accordion-item-header-padding`          | `12px 16px`            | Header button padding                     |
| `--accordion-item-header-background`       | `var(--additional-50)` | Header background color                   |
| `--accordion-item-header-background-hover` | `var(--neutrals-50)`   | Header background on hover                |
| `--accordion-item-header-color`            | `var(--secondary-950)` | Header text color                         |
| `--accordion-item-content-padding`         | `16px`                 | Content body padding                      |
| `--accordion-item-content-background`      | `var(--additional-50)` | Content body background                   |
| `--accordion-item-transition-duration`     | `300ms`                | Expand/collapse animation duration        |
| `--accordion-item-fade-height`             | `60px`                 | Fade gradient height on collapsed preview |
| `--accordion-item-focus-ring-color`        | `var(--primary-100)`   | Focus ring color for keyboard navigation  |

> **Note:** The `ghost` variant overrides several variables to transparent/zero values for minimal appearance.

## Accessibility

- Each header is a focusable `<button>` with `aria-expanded` and `aria-controls`
- Content panels have `role="region"` with `aria-labelledby`
- Unique IDs generated via Vue's `useId()` for trigger/panel pairs
- Disabled items set `disabled` on the button; chevron hidden when content fits
- Focus ring visible on keyboard navigation via `:focus-visible`

## Related Components

- [VcAccordionItem](./_internal/vc-accordion-item/) -- individual accordion panel (used internally and available via the default slot)

## Skeleton / Loading State

When placed inside a `VcBlade` with `loading=true`, the component automatically renders a skeleton placeholder matching its visual footprint. No additional props or configuration needed.
