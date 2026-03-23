# UI Composables

Shared composables for the VC-Shell UI component library. These provide reusable logic for layout, positioning, form fields, and scroll behavior.

## Overview

All composables are exported from `framework/ui/composables/index.ts` and available via `@vc-shell/framework`. They are designed for use inside `<script setup>` components.

## Exports

| Composable | Purpose |
|---|---|
| `useAdaptiveItems` | Measures and distributes items into visible/hidden groups based on container width |
| `useScrollArrows` | Tracks scroll overflow state and provides animated scroll-by-arrow controls |
| `useFloatingPosition` | Wrapper around `@floating-ui/vue` with sensible defaults for dropdowns/tooltips |
| `useTeleportTarget` | Resolves a consistent teleport target (explicit target, app root, or body) |
| `useFormField` | Shared form field logic: unique IDs, ARIA attributes, InputGroup integration |
| `useCollapsible` | Expand/collapse panel with measured content height and CSS transitions |

## API Details

### useAdaptiveItems

Measures natural widths of child elements (marked with `data-item-key`) and splits items into `visibleItems` / `hiddenItems` arrays based on available container width. Handles a "more" button (marked with `data-more-button`) using a two-pass layout algorithm.

```typescript
const { visibleItems, hiddenItems, showMoreButton, recalculate } = useAdaptiveItems({
  containerRef,
  items: tabs,
  getItemKey: (tab) => tab.id,
  moreButtonWidth: 40,
  calculationStrategy: "forward", // or "reverse"
});
```

Options: `calculationStrategy: "reverse"` fills from the end (useful for right-aligned toolbars). A `ResizeObserver` tracks element width changes automatically.

### useScrollArrows

Provides `canScrollUp` / `canScrollDown` booleans and `startScroll(direction)` / `stopScroll()` methods for scroll-arrow UI. Uses `requestAnimationFrame` for smooth scrolling.

```typescript
const { canScrollUp, canScrollDown, startScroll, stopScroll } = useScrollArrows(viewportRef, {
  speed: 3, // pixels per frame, default: 2
});
```

### useFloatingPosition

Wraps `@floating-ui/vue` with reactive placement, offset, flip, and shift middleware. Returns `floatingStyle` for direct binding.

```typescript
const { floatingStyle, placement } = useFloatingPosition(referenceEl, floatingEl, {
  placement: "bottom-start",
  offset: { mainAxis: 4 },
  enableFlip: true,
  enableShift: true,
});
```

### useTeleportTarget

Resolves teleport destination with priority: explicit `to` option, then injected `AppRootElementKey`, then `"body"`.

```typescript
const { teleportTarget } = useTeleportTarget({ fallbackToBody: true });
// <Teleport :to="teleportTarget">
```

### useFormField

Generates unique field/label/error/hint IDs and computes ARIA attributes. Integrates with `VcInputGroup` context for grouped disabled/invalid state.

```typescript
const { fieldId, invalid, resolvedDisabled, ariaDescribedBy } = useFormField(props);
```

### useCollapsible

Manages expand/collapse animation via measured `scrollHeight`. Returns `wrapperStyle` to bind on the overflow wrapper and `contentRef` to attach to the inner content.

```typescript
const { isExpanded, toggle, wrapperStyle, contentRef, hasOverflow } = useCollapsible({
  collapsedHeight: 100,
  maxExpandedHeight: 400,
});
```

## Tips

- `useAdaptiveItems` requires `data-item-key` attributes on rendered children and `data-more-button` on the overflow trigger for automatic measurement.
- `useFloatingPosition` enables flip and shift by default. Pass `enableFlip: false` to disable.
- `useFormField` auto-detects `InputGroupContext` via inject -- no extra wiring needed inside `VcInputGroup`.
- All composables clean up resources (observers, animation frames) in `onBeforeUnmount`.

## Related

- `framework/ui/components/molecules/vc-dropdown/` -- uses `useFloatingPosition`
- `framework/ui/components/molecules/vc-input/` -- uses `useFormField`
- `framework/shared/components/sidebar/` -- uses `useScrollArrows`
