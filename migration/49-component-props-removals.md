# 48. Component Prop & Behavior Changes (Miscellaneous)

Small prop removals and behavioral changes across various components that
don't warrant individual guides. Each subsection is independent — skim for
the components you use.

## VcContainer — `usePtr` Prop and `scroll:ptr` Event Removed

**What changed**: Pull-to-refresh support has been removed from `VcContainer`
and relocated to `VcDataTable`, which is the only place in the framework that
actually used it. `VcContainer` is now a thin layout wrapper with no
scroll-gesture behavior.

Removed from `vc-container.vue`:

- Prop **`usePtr: boolean`**
- Emit **`"scroll:ptr"`**
- The internal `touchstart` / `touchend` handlers and `refreshing` state that
  backed it.

**Before** (v1.x):

```vue
<VcContainer
  :use-ptr="true"
  @scroll:ptr="onRefresh"
>
  <MyList />
</VcContainer>
```

**After** (v2.0):

If the container was wrapping a list of records, switch to `VcDataTable`
(which owns pull-to-refresh now):

```vue
<VcDataTable
  :items="records"
  :pull-to-refresh="true"
  :pull-to-refresh-text="{ pull: 'Pull down', release: 'Release', refreshing: 'Loading…' }"
  @pull-refresh="onRefresh"
/>
```

If the container was wrapping arbitrary content, there is no built-in
replacement — wire up pull-to-refresh yourself with `@vueuse/core`'s
`usePointerSwipe` / touch listeners, or drop the gesture. The shell's
`VcContainer` is now gesture-free.

**How to find**:

```bash
grep -rn 'use-ptr\|usePtr\|scroll:ptr' src/ --include='*.vue' --include='*.ts'
```

---

## VcStatus — `outline` Prop Removed

**What changed**: The `outline` boolean prop on `VcStatus` was already
`@deprecated` in v1.2.3 and is now fully removed along with its SCSS branch.
Visual differentiation goes through `variant` (and, orthogonally, `extend`
and `dot`) only.

- Prop **`outline?: boolean`** — removed.
- The `.vc-status_outline` / `--outline` CSS rules — removed.

**Before** (v1.x):

```vue
<VcStatus variant="warning" outline>Pending</VcStatus>
```

**After** (v2.0):

```vue
<VcStatus variant="warning">Pending</VcStatus>
```

If you specifically relied on the outlined look, pick the `variant` whose
tokens match (e.g. `"light-danger"` for a softer danger tone) or override
`--status-bg-color` / `--status-border-color` on the host scope. There is no
1-to-1 "outline" variant.

**How to find**:

```bash
grep -rn '<VcStatus[^>]*\boutline\b' src/ --include='*.vue'
```

---

## VcEditor — Custom Extensions Override Base Extensions With the Same Name

**What changed**: The `extensions` prop on `VcEditor` has always accepted a
list of extra TipTap extensions. In v1.x the merge was an **append** — both
your extension and the built-in one of the same `name` were registered,
leaving TipTap to resolve the collision unpredictably (and usually log a
"Duplicate extension names found" warning).

In v2.0 the merge is an **override**: built-in extensions whose `name`
matches a provided custom extension are dropped, and yours wins.

Source of truth — the merge in `vc-editor.vue`:

```ts
// v1.x — append
if (props.extensions && props.extensions.length > 0) {
  baseExtensions.push(...props.extensions);
}
return baseExtensions;

// v2.0 — override by name
if (props.extensions && props.extensions.length > 0) {
  const customNames = new Set(props.extensions.map((ext) => ext.name).filter(Boolean));
  const filtered = baseExtensions.filter((ext) => !customNames.has(ext.name));
  return [...filtered, ...props.extensions];
}
```

The prop type also tightened from `any[]` to `Extension[]`.

**Impact**:

- Passing `Link.configure({ openOnClick: true })` now **replaces** the
  built-in `Link` (instead of duplicating it). That is almost always what
  consumers wanted — previous behavior silently ignored your config in half
  the cases.
- Passing a genuinely new extension with a unique `name` (e.g. `Highlight`)
  behaves the same as before: appended.
- Custom extensions with a **blank/undefined `name`** are never treated as
  overrides (they fall through the `.filter(Boolean)`), so anonymous
  `Extension.create({ ... })` additions still append.

**Minimal example**:

```vue
<script setup lang="ts">
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
</script>

<template>
  <!-- Overrides the built-in Link (name === "link") -->
  <!-- Appends Highlight (not in base set) -->
  <VcEditor
    v-model="content"
    :extensions="[
      Link.configure({ openOnClick: true, autolink: false }),
      Highlight.configure({ multicolor: true }),
    ]"
  />
</template>
```

**Built-in extension names** you may shadow: `starterKit`, `underline`,
`textStyle`, `fontSize`, `table`, `tableRow`, `tableHeader`, `tableCell`,
`link`, `image`, `placeholder`, `markdown`.

---

## VcField — `modelValue` Type Narrowed

**What changed**: `VcField` (read-only display field) had `modelValue?: any`
in v1.x. It is now narrowed to:

```ts
modelValue?: string | number | Date
```

Additionally, a sibling `displayValue?: string` prop was added for the case
where you need the raw `modelValue` preserved for copy/link actions but want
a formatted/localized string shown in the UI.

**Impact**: TypeScript (in strict mode) will now flag any binding that isn't
`string | number | Date | undefined`. Common breakages:

```vue
<!-- ❌ boolean -->
<VcField :model-value="isActive" />

<!-- ❌ object / array -->
<VcField :model-value="user" />

<!-- ❌ null (was tolerated via any) -->
<VcField :model-value="maybeNull" />
```

**After**:

```vue
<!-- booleans → stringify, or use a dedicated component -->
<VcField :model-value="isActive ? 'Active' : 'Inactive'" />

<!-- objects → pick a scalar field, or format -->
<VcField :model-value="user.email" />

<!-- null → coalesce -->
<VcField :model-value="maybeNull ?? ''" />
```

If you need a "raw value / formatted label" split — e.g. copy the raw email
but show a display name — use the new `displayValue`:

```vue
<VcField
  type="email"
  :model-value="user.email"
  :display-value="user.fullName"
  copyable
/>
```

The copy button and `mailto:` / link handlers continue to operate on
`modelValue`; only the rendered text comes from `displayValue`.

**How to find**:

```bash
# Type errors will surface after upgrading. To pre-flight:
grep -rn '<VcField' src/ --include='*.vue' | grep -v 'model-value="[^"]*"'
```

---

## Related

- [Guide #19 — Generic Components](./19-generic-components.md) — general
  pattern for tightening component prop types in v2.0.
- [Guide #47 — VcButton Props](./47-vc-button-props.md) — another
  component-prop-narrowing guide with the same shape.
- [Guide #29 — VcTable → VcDataTable](./29-vc-table-to-data-table.md) — if
  you're migrating a records list that previously used `VcContainer` +
  `usePtr`, this is where the pull-to-refresh now lives.
