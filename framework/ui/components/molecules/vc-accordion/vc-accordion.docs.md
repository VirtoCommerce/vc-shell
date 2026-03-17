# VcAccordion

Collapsible content sections with smooth animations, customizable collapsed heights, and multiple visual variants.

## When to Use

- FAQ sections, expandable product details, or grouped settings
- When content needs to be progressively disclosed to reduce visual clutter
- When partial content preview is needed in collapsed state (via `collapsedHeight`)
- When NOT to use: for navigation groups, use `VcMenuGroup`; for single expandable panels, use `VcAccordionItem` directly

## Basic Usage

```vue
<template>
  <VcAccordion :items="faqItems" variant="bordered" />
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

## Key Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `AccordionItem[]` | `[]` | Array of items to render |
| `modelValue` | `(string \| number) \| (string \| number)[]` | — | Controlled expanded state (v-model) |
| `multiple` | `boolean` | `false` | Allow multiple items to be expanded simultaneously |
| `variant` | `"default" \| "bordered" \| "separated" \| "ghost"` | `"default"` | Visual style variant |
| `collapsedHeight` | `number` | `0` | Default collapsed height in pixels for all items |
| `maxExpandedHeight` | `number` | — | Maximum expanded height (content scrolls if exceeded) |

## AccordionItem Interface

```ts
interface AccordionItem {
  id?: string | number;
  title: string;
  content?: string | Component;
  titleSlot?: Component;
  collapsedHeight?: number;    // Per-item override
  maxExpandedHeight?: number;  // Per-item override
  disabled?: boolean;
}
```

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `(string \| number) \| (string \| number)[]` | Expanded item(s) changed |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Place `VcAccordionItem` components directly for custom rendering |

## Common Patterns

### Controlled with v-model

```vue
<template>
  <VcAccordion v-model="openItem" :items="items" />
  <p>Currently open: {{ openItem }}</p>
</template>

<script setup lang="ts">
import { ref } from "vue";
const openItem = ref<string | null>("faq1");
</script>
```

### Multiple Open Items

```vue
<VcAccordion
  v-model="openItems"
  :items="items"
  :multiple="true"
/>
```

### Partial Content Preview

```vue
<VcAccordion
  :items="items"
  :collapsed-height="100"
  variant="separated"
/>
```

Items show 100px of content when collapsed with a fade effect, and an expand button to reveal the rest.

### Per-Item Height Overrides

```vue
const items = [
  { id: "short", title: "Summary", content: longText, collapsedHeight: 0 },
  { id: "preview", title: "Description", content: longText, collapsedHeight: 80 },
  { id: "limited", title: "Terms", content: veryLongText, maxExpandedHeight: 300 },
];
```

### Custom Title Rendering via Slot

```vue
<VcAccordion>
  <VcAccordionItem>
    <template #title>
      <div class="tw-flex tw-items-center tw-gap-2">
        <span class="tw-px-2 tw-py-1 tw-bg-blue-500 tw-text-white tw-rounded tw-text-xs">NEW</span>
        <span>Custom title with badge</span>
      </div>
    </template>
    Content goes here...
  </VcAccordionItem>
</VcAccordion>
```

## Variant Comparison

| Variant | Description |
|---------|-------------|
| `default` | Items stacked with shared borders |
| `bordered` | Outer border wrapping all items |
| `separated` | Card-like items with gaps between them |
| `ghost` | Transparent background, minimal styling |

## Accessibility

- Each item header is a focusable button
- Smooth expand/collapse CSS grid animations
- Disabled items cannot be toggled
- Smart overflow detection hides the expand button when content fits within collapsed height

## Related Components

- [VcAccordionItem](./_internal/vc-accordion-item/) — individual accordion panel (used internally and via slot)
