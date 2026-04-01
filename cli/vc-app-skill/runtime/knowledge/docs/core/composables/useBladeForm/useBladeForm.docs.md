# useBladeForm

Unified form state management for blades. Replaces manual combination of `useForm` + `useModificationTracker` + `useBeforeUnload` + `onBeforeClose` with a single composable.

## Import

```ts
import { useBladeForm } from "@vc-shell/framework";
```

## Basic Usage

```ts
const { item, loadItem, saveItem } = useItemData();

const form = useBladeForm({ data: item });

onMounted(async () => {
  await loadItem({ id: param.value });
  form.setBaseline(); // snapshot current data as pristine
});

// Toolbar
const toolbar = ref<IBladeToolbar[]>([
  {
    id: "save",
    title: "Save",
    icon: "lucide-save",
    disabled: computed(() => !form.canSave.value),
    async clickHandler() {
      await saveItem(item.value);
      form.setBaseline(); // snapshot after save
      callParent("reload");
    },
  },
]);
```

## API

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `data` | `Ref<T>` | required | Reactive data object for the form |
| `canSaveOverride` | `ComputedRef<boolean>` | — | Additional condition for canSave |
| `autoBeforeClose` | `boolean \| ComputedRef<boolean>` | `true` | Close guard behavior |
| `autoBeforeUnload` | `boolean` | `true` | Browser tab close guard |
| `closeConfirmMessage` | `MaybeRefOrGetter<string>` | — | Custom unsaved changes message |
| `onRevert` | `() => void \| Promise<void>` | — | Custom revert handler |

### Returns

| Property | Type | Description |
|----------|------|-------------|
| `setBaseline()` | `() => void` | Snapshot current data as pristine. Call after load and after save |
| `revert()` | `() => void \| Promise<void>` | Revert data to pristine (or call onRevert) |
| `canSave` | `ComputedRef<boolean>` | `isReady && valid && modified && canSaveOverride` |
| `isModified` | `ComputedRef<boolean>` | Data differs from pristine (false until setBaseline) |
| `isReady` | `ComputedRef<boolean>` | setBaseline() called at least once |
| `formMeta` | vee-validate meta | Form validation state |
| `setFieldError` | function | Set field error programmatically |
| `errorBag` | Ref | All field errors |

## Lifecycle

```
Mount → Load data → setBaseline() → User edits → Save → setBaseline()
                                                 └→ Cancel → revert()
```

## VcBlade Integration

`useBladeForm` auto-provides form state to `VcBlade` via inject. No need to pass `:modified` prop:

```vue
<!-- Before -->
<VcBlade :modified="isModified" :toolbar-items="toolbar">

<!-- After -->
<VcBlade :toolbar-items="toolbar">
```

## Advanced: Readonly Blade

```ts
const disabled = computed(() => !!param.value && !item.value?.canBeModified);

const form = useBladeForm({
  data: item,
  canSaveOverride: computed(() => !disabled.value),
  autoBeforeClose: computed(() => !disabled.value), // no prompt when readonly
});
```

## Advanced: Custom Revert

```ts
const form = useBladeForm({
  data: item,
  onRevert: () => loadItem({ id: param.value }), // reload from server
});
```

## Constraints

- **Must be called from component `setup()`** (or `<script setup>`). Do NOT call from shared data-composables.
- Validation rules stay in template (`<Field rules="...">`).
- `setBaseline()` must be called after data is loaded — before that, `canSave` and `isModified` are `false`.

## Migration

See `MIGRATION_GUIDE.md` for step-by-step instructions on migrating existing modules.
