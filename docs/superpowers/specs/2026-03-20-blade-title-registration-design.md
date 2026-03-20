# Blade Title Registration via VcBlade

**Date:** 2026-03-20
**Status:** Approved
**Scope:** Framework-internal change — no public API changes for blade-page authors

## Problem

Blade components expose their `title` via `defineExpose({ title })`, which is then read by `vc-blade-slot.vue` through a component instance ref and forwarded to `BladeStack.setBladeTitle()`. This title is used for:

1. **Mobile header** — `MobileLayout.viewTitle` reads `BladeDescriptor.title` (via legacy shim `descriptorToShim()` in `useBladeNavigationAdapter`)
2. **BladeInstanceKey** — legacy breadcrumbs and blade instance data
3. **Blade navigation** — identifying blades in the stack

This creates two parallel channels for the same data:
- `defineExpose({ title })` → vc-blade-slot instance ref → setBladeTitle (navigation)
- `:title` prop → VcBlade → BladeHeader (display)

The `defineExpose` path is fragile (depends on instance ref reactivity), requires proxy components for delegation (productDetails → ProductDetailsBase), and is the last remaining reason many blade components use `defineExpose`.

## Solution

**VcBlade registers the title directly with BladeStack.**

VcBlade already receives `title` as a prop for display. It also already injects `BladeDescriptorKey` and calls `useBlade()`. Adding a `watchEffect` to register the title with `BladeStack.setBladeTitle()` collapses both channels into one.

### Data Flow: Before vs After

```
BEFORE:
  blade-page ─── defineExpose({ title }) ──► vc-blade-slot ──► setBladeTitle()
  blade-page ─── :title prop ──────────────► VcBlade ────────► BladeHeader (display)

AFTER:
  blade-page ─── :title prop ──► VcBlade ──► BladeHeader (display)
                                         └──► setBladeTitle() (navigation)
```

### Downstream Dependency: MobileLayout

`MobileLayout.viewTitle` reads title from the legacy shim path:
```
BladeDescriptor.title → descriptorToShim() → instance.title → viewTitle computed
```
Since `setBladeTitle()` updates `BladeDescriptor.title`, MobileLayout continues to work without changes.

## Implementation

### Step 1: Add title registration to VcBlade

In `framework/ui/components/organisms/vc-blade/vc-blade.vue`, reuse the existing `useBladeStack()` destructure (line 228) instead of creating a second call:

```ts
// Line 228 — expand existing destructure:
const { blades, setBladeTitle } = useBladeStack();

// Add after hasBladeContext logic:
// Register title with BladeStack for navigation/breadcrumbs
watchEffect(() => {
  if (hasBladeContext && bladeId.value && props.title) {
    setBladeTitle(bladeId.value, props.title);
  }
});
```

**Note:** `bladeId` is a `ComputedRef<string>` from `useBlade()` — must use `.value` to get the string.

`hasBladeContext` guard ensures Storybook/standalone usage is unaffected.

### Step 2: Remove bridge from vc-blade-slot.vue

Remove the `watchEffect` that reads `bladeInstanceRef.value?.title` and calls `setBladeTitle` (lines 116-124):

```ts
// REMOVE:
watchEffect(() => {
  const title = bladeInstanceRef.value?.title;
  if (title !== undefined) {
    bladeStack.setBladeTitle(props.descriptor.id, title);
  }
});
```

Also replace `title: bladeInstanceRef.value?.title` in the `BladeInstanceKey` provider (line 78) with `title: props.descriptor.title` — reads from the descriptor which VcBlade now populates. This is reactive because `setBladeTitle` replaces the descriptor in `_blades` array, triggering Vue's prop update cycle.

### Step 3: Remove defineExpose({ title }) from remaining components

After Step 1-2, `defineExpose({ title })` is no longer consumed by the framework. Remove from:

**Vendor-portal (apps):**
- `apps/vendor-portal/src/modules/products/components/ProductDetailsBase.vue` — remove `defineExpose({ title: bladeTitle, item })` entirely
- `apps/vendor-portal/src/modules/products/components/ProductsListBase.vue` — remove `defineExpose({ title: props.title })` entirely

**Framework built-in modules:**
- `framework/modules/assets/components/assets-details/assets-details.vue` — remove `defineExpose({ title: ... })`
- `framework/modules/assets-manager/components/assets-manager/assets-manager.vue` — remove `defineExpose({ title: bladeTitle })`

**CLI templates (scaffolded projects):**
- `cli/create-vc-app/src/templates/sample-module/pages/list.vue` — remove `defineExpose({ title, reload })`; add `exposeToChildren({ reload })` if `reload` is called by children
- `cli/create-vc-app/src/templates/sample-module/pages/details.vue` — remove `defineExpose({ title })`

### Step 4: Update JSDoc comments

In `framework/core/blade-navigation/types/index.ts`:

```ts
// Line 162 — BladeDescriptor.title:
// BEFORE: /** Blade title — populated at runtime from the component's defineExpose({ title }) */
// AFTER:  /** Blade title — populated at runtime by VcBlade via setBladeTitle() */

// Line 241 — IBladeStack.setBladeTitle:
// BEFORE: /** Update a blade's title (called by VcBladeSlot when component exposes title) */
// AFTER:  /** Update a blade's title (called by VcBlade when title prop changes) */
```

## Edge Cases

| Case | Behavior |
|------|----------|
| Storybook (no blade context) | `hasBladeContext` is false → no registration, display works normally |
| VcBlade without title prop | `props.title` is undefined → no registration (same as today) |
| Dynamic title (loads after mount) | `watchEffect` tracks `props.title` reactively → re-registers on change |
| Multiple VcBlade in same blade-page | Should not happen architecturally. If it does, last one wins (same as defineExpose) |
| ProductDetailsBase proxy pattern | ProductDetailsBase renders VcBlade with `:title`. VcBlade registers it. productDetails.vue has no role in title registration |

## Migration Compatibility

- **Bridge in vc-blade-slot** can be removed immediately since we just migrated all vendor-portal blades away from `defineExpose({ title })` in this session
- `setBladeTitle` is idempotent (`if (title === current) return`) — safe even if both old and new paths fire
- No public API changes — blade-page authors don't need to change anything

## Files Changed

| File | Change |
|------|--------|
| `framework/ui/components/organisms/vc-blade/vc-blade.vue` | Add `watchEffect` for title registration; expand `useBladeStack()` destructure |
| `framework/shell/_internal/blade-navigation/components/vc-blade-slot/vc-blade-slot.vue` | Remove title bridge (watchEffect + BladeInstanceKey.title from instance ref) |
| `framework/core/blade-navigation/types/index.ts` | Update JSDoc on `BladeDescriptor.title` and `IBladeStack.setBladeTitle` |
| `apps/vendor-portal/src/modules/products/components/ProductDetailsBase.vue` | Remove remaining `defineExpose` |
| `apps/vendor-portal/src/modules/products/components/ProductsListBase.vue` | Remove remaining `defineExpose` |
| `framework/modules/assets/components/assets-details/assets-details.vue` | Remove `defineExpose({ title })` |
| `framework/modules/assets-manager/components/assets-manager/assets-manager.vue` | Remove `defineExpose({ title })` |
| `cli/create-vc-app/src/templates/sample-module/pages/list.vue` | Update to `exposeToChildren` pattern |
| `cli/create-vc-app/src/templates/sample-module/pages/details.vue` | Remove `defineExpose({ title })` |

## Success Criteria

1. Mobile header shows correct blade title
2. Breadcrumbs display correct blade titles
3. Storybook renders VcBlade without errors
4. No `defineExpose({ title })` remains in vendor-portal or framework blade components
5. CLI templates use `exposeToChildren` pattern (no `defineExpose`)
6. TypeScript passes (`cd framework && npx tsc --noEmit`)
