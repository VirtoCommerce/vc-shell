# Mobile AppHub Tabs — Implementation State

## Task
Replace inline AppHub+Menu in mobile sidebar with tabbed interface (Menu/Hub tabs) with iOS-like swipe animation.

## Design Decision
Variant B — tabs inside sidebar. Design doc: `docs/plans/2026-03-02-mobile-apphub-tabs-design.md`. Prototypes: `docs/plans/mobile-apphub-prototypes.html`.

## Completed
- `AppHubContent.vue` — Fixed `widgets-inner` absolute positioning in mobile mode (added `tw-relative tw-inset-auto` in `&__sections--mobile`)
- `en.json` / `de.json` — Added `MOBILE_LAYOUT.TAB_MENU` / `TAB_HUB` keys under `COMPONENTS.ORGANISMS.VC_APP.INTERNAL`

## TODO — MobileLayout.vue Full Rewrite

### Architecture
- Wrapper div `.mobile-layout__navmenu` fills VcScrollableContainer viewport exactly (`height: 100%`, flex column)
- Override viewport: `.vc-scrollable-container__viewport:has(> .mobile-layout__navmenu) { overflow: hidden; }`
- Tabs row: flex-shrink-0, with animated indicator bar (position: absolute, bottom: 0, width: 50%)
- Slider viewport: `flex: 1; min-height: 0; overflow: hidden;`
- Slider: `display: flex; width: 200%; height: 100%; will-change: transform;`
- Each panel: `width: 50%; height: 100%; overflow-y: auto; -webkit-overflow-scrolling: touch; overscroll-behavior: contain;`

### Conditional Visibility
```ts
const showHubTab = computed(() => widgetItems.value.length > 0 || (!props.disableAppSwitcher && props.appsList.length > 0));
const showTabs = computed(() => showHubTab.value && !props.disableMenu);
```
- If `!showTabs`: render menu-only or hub-only directly (no slider)
- Watch `showHubTab` — reset activeIndex to 0 when it becomes false

### Swipe Implementation
- `activeIndex`: ref(0) — 0=menu, 1=hub
- `isDragging`: ref(false)
- `dragOffsetX`: ref(0) — pixel offset during drag
- `gestureState`: 'idle'|'pending'|'horizontal'|'vertical' — locks after 8px movement
- `sliderViewportRef`: template ref

Touch handlers:
- `touchstart.passive`: record startX/startY/startTime, set gestureState='pending'
- `touchmove` (NOT passive): if pending and |dy|>|dx|→vertical lock; if |dx|>|dy|→horizontal lock + e.preventDefault(). If horizontal: update dragOffsetX with rubber band at boundaries
- `touchend.passive`: velocity=|deltaX|/duration. If velocity>0.3 or |deltaX|>30%: switch tab. Reset isDragging.

Rubber band formula (iOS): `(offset * dimension) / (offset + dimension)`

### Slider/Indicator Styles (computed)
```ts
sliderStyle = computed(() => {
  const base = activeIndex.value * -50; // percentage of 200% slider
  if (isDragging && viewport) {
    const dragPercent = (dragOffsetX / viewport.clientWidth) * 50;
    return { transform: `translateX(${base + dragPercent}%)`, transition: 'none' };
  }
  return { transform: `translateX(${base}%)`, transition: 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)' };
});

indicatorStyle = computed(() => {
  const progress = activeIndex + (-dragOffsetX / containerWidth); // 0 to 1
  const clamped = Math.max(0, Math.min(1, progress));
  return { transform: `translateX(${clamped * 100}%)`, transition: isDragging ? 'none' : '...' };
});
```

### Reset
- Watch `sidebar.isMenuOpen` — reset activeIndex to 0 when sidebar closes

### Key Files
- `MobileLayout.vue` — main implementation
- `MenuSidebar.vue` — NOT modified (navmenu slot inside VcScrollableContainer)
- `AppHubContent.vue` — already fixed (widgets-inner position)
- `useAppBarWidget` from `@core/composables` — provides widget items for badge/visibility
