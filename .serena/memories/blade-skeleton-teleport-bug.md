# Blade Skeleton + Teleport Defer Bug

## Problem
When VcBlade switches `loading` prop true↔false, repeated TypeError occurs:
```
TypeError: Cannot read properties of null (reading '__isMounted')
at TeleportImpl.process → patch → patchBlockChildren...
```

## Root Cause
`BladeHeader.vue:22` has `<teleport :to="teleportTarget" defer>` for tooltip.
When `loading` toggles `v-if`/`v-else` in vc-blade.vue, Vue unmounts BladeHeader.
The deferred Teleport's `el` becomes `null`, but Vue's patcher still tries `n2.el.__isMounted`.

This is a known Vue 3.5 issue: deferred Teleport + conditional rendering (`v-if`/`v-else`).

## Error log prefix
`[@vc-shell/framework#use-error-handler] Captured Error: TypeError: Cannot read properties of null (reading '__isMounted')`

## Fix Options
1. Remove `defer` from the teleport in BladeHeader.vue:22
2. Wrap teleport in additional `v-if` guard
3. Use `<Teleport :disabled="!mounted">` pattern instead of defer
4. Change vc-blade.vue to use `v-show` instead of `v-if`/`v-else` for header

## Files
- `framework/ui/components/organisms/vc-blade/_internal/BladeHeader.vue` — line 22, `<teleport defer>`
- `framework/ui/components/organisms/vc-blade/vc-blade.vue` — `v-if="loading"` / `v-else` switching
- `framework/ui/composables/useTeleportTarget` — provides teleportTarget ref

## Skeleton Status
- BladeHeaderSkeleton.vue — rewritten, self-contained styles (own CSS, no dependency on BladeHeader.vue)
- BladeContentSkeleton.vue — simplified, removed `vc-blade__content` wrapper
- BladeToolbarSkeleton.vue — works fine, unchanged
- VcSkeleton (vc-skeleton.vue) — user simplified: removed variant/block/circle, rows-only now
  - BladeHeaderSkeleton/BladeToolbarSkeleton need adaptation (they still pass variant/width/height props that no longer exist)

## Done in this session
1. Removed `defer` from ALL 5 Teleports (BladeHeader, MultivalueDropdown, SelectDropdown, vc-tooltip, AppBarOverlay) — fixes __isMounted crash
2. In vc-blade.vue: added skeletons back with `v-show="!showSkeleton"` for BladeHeader (Teleport-safe), `v-if`/`v-else` for Toolbar/Content
3. Added `showSkeleton` computed with `isInitializing` guard to prevent flash of empty content
4. Added `loading?: boolean` prop to VcBlade Props

## Fixed: CSS Variable Collision
- `--skeleton-bg` was overridden by `communication-app` module: `:root { --skeleton-bg: var(--additional-50) }` = white
- All skeleton CSS vars renamed from `--skeleton-*` to `--vc-skeleton-*` to prevent collisions
- BladeContentSkeleton rewritten: two-column form layout with label + input-like placeholders (not just text rows)

## Files modified
- `framework/ui/components/organisms/vc-blade/_internal/BladeHeader.vue` — removed defer
- `framework/ui/components/molecules/vc-multivalue/_internal/MultivalueDropdown.vue` — removed defer
- `framework/ui/components/molecules/vc-select/_internal/SelectDropdown.vue` — removed defer
- `framework/ui/components/atoms/vc-tooltip/vc-tooltip.vue` — removed defer
- `framework/ui/components/organisms/vc-app/_internal/app-bar/components/AppBarOverlay.vue` — removed defer
- `framework/ui/components/organisms/vc-blade/vc-blade.vue` — skeletons + showSkeleton computed

## Confirmed NOT the cause
- Async components / dynamic imports
- CSS sizing (percentage vs px widths)
- `defer` alone (removing it fixes crash but not visual glitch)
- `isInitializing` guard (loading prop timing is not the issue)