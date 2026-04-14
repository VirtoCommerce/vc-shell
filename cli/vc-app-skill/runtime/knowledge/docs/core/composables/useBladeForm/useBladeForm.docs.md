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
| `markReady()` | `() => void` | Mark form ready without resetting pristine snapshot. Computes modification state from current data vs setup-time snapshot |
| `revert()` | `() => void \| Promise<void>` | Revert data to pristine (or call onRevert) |
| `canSave` | `ComputedRef<boolean>` | `isReady && valid && modified && canSaveOverride` |
| `isModified` | `ComputedRef<boolean>` | Data differs from pristine (false until setBaseline) |
| `isReady` | `ComputedRef<boolean>` | setBaseline() called at least once |
| `formMeta` | vee-validate meta | Form validation state |
| `setFieldError` | function | Set field error programmatically |
| `errorBag` | Ref | All field errors |

## Lifecycle

### Standard (edit existing entity)
```
Mount → Load data → setBaseline() → User edits → Save → setBaseline()
                                                  └→ Cancel → revert()
```

### Pre-filled (create from template)
```
Mount → Pre-fill data → markReady() → canSave = true immediately
                                       └→ Save → setBaseline()
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

## Advanced: Pre-filled Entity (markReady)

When creating a new entity that is pre-populated from a parent (e.g. new offer from a product), the form should be immediately saveable. Use `markReady()` instead of `setBaseline()`:

```ts
const form = useBladeForm({ data: item });

onMounted(async () => {
  // Populate base fields
  item.value.sku = generateSku();
  await addEmptyInventory();

  const hasTemplate = !param.value && !!options.value?.templateId;

  if (hasTemplate) {
    // Fill from template — data diverges from the setup-time snapshot
    await fillFromTemplate(options.value.templateId);
    // Mark ready: compares current data to setup-time snapshot → isModified = true
    form.markReady();
  } else {
    // Standard load — current state becomes the pristine baseline
    await loadItem({ id: param.value });
    form.setBaseline();
  }
});
```

### setBaseline vs markReady

| | `setBaseline()` | `markReady()` |
|--|-----------------|---------------|
| Sets `isReady` | yes | yes |
| Updates pristine snapshot | yes (current data → pristine) | no (keeps setup-time snapshot) |
| `trackerIsModified` after call | `false` | computed: `data !== pristineSnapshot` |
| Use case | Load / Save — "this is the clean state" | Pre-fill — "form is ready, changes are intentional" |

### How it works

At composable creation, `useBladeForm` takes a snapshot of `data` (the **setup-time snapshot**). When `markReady()` is called:

1. `isReady` → `true` (gates `canSave` and the deep watcher)
2. `trackerIsModified` = `!semanticEqual(data, setupTimeSnapshot)` — since data was mutated during `onMounted`, this evaluates to `true`
3. Subsequent edits are tracked normally by the deep watcher

After save, call `setBaseline()` as usual to capture the saved state as the new pristine snapshot.

## Constraints

- **Must be called from component `setup()`** (or `<script setup>`). Do NOT call from shared data-composables.
- Validation rules stay in template (`<Field rules="...">`).
- `setBaseline()` must be called after data is loaded — before that, `canSave` and `isModified` are `false`.

## Migration

See `MIGRATION_GUIDE.md` for step-by-step instructions on migrating existing modules.
