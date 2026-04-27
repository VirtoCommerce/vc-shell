# DashboardWidgetSkeleton

Internal placeholder card used by `GridstackDashboard` while remote modules are still loading. Mimics the shape of `DashboardWidgetCard` (header with icon + title, stats row, content lines) with a shimmer animation. Not exported from `@vc-shell/framework` — consumed only inside the dashboard organism.

## When to Use

- You won't use this directly. `GridstackDashboard` renders one per `SkeletonItem` while `ModulesReadyKey` resolves to `false`.
- If you build a custom dashboard layout and want the same loading aesthetic, copy this file rather than importing it — the component is intentionally internal so the dashboard team can change its markup at any time.

## Layout Contract

The skeleton has no props. Its parent positions it via inline `style` (`grid-column` / `grid-row`) inside a 12-column CSS grid. Card height/width is fully determined by the grid cell it occupies, so the skeleton stretches to fill its slot.

## Accessibility

- The wrapper has `aria-hidden="true"` so screen readers ignore the visual placeholders. The parent grid carries `role="status"` + `aria-busy="true"` to announce loading state once.
- Shimmer animation is disabled when the user prefers reduced motion.

## Design Tokens

Skeleton inherits dashboard card tokens where possible (`--dashboard-widget-card-background`, `--dashboard-widget-card-border-color`, `--dashboard-widget-card-border-radius`, `--dashboard-widget-card-shadow`) so its silhouette matches the real card. Shimmer colors are read from `--neutrals-100` / `--neutrals-200`.

## Related

- [DraggableDashboard](./draggable-dashboard.docs.md) — owns the skeleton grid and decides when to render placeholders.
- [DashboardWidgetCard](../dashboard-widget-card/dashboard-widget-card.docs.md) — the real card whose shape skeletons imitate.
