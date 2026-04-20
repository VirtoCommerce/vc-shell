# Toolbar Pattern

Toolbar items are defined as `ref<IBladeToolbar[]>` in blade `<script setup>`. Each item is a plain object — not a reactive proxy, not a class. The array is passed to `VcBlade` via `:toolbar-items`.

---

## IBladeToolbar Shape

```ts
interface IBladeToolbar {
  id: string;
  title: ComputedRef<string>; // must be computed for reactivity with i18n
  icon: string; // lucide icon name, e.g., "lucide-save"
  clickHandler: () => void | Promise<void>;
  isVisible?: boolean | ComputedRef<boolean>; // static or reactive
  disabled?: ComputedRef<boolean>; // must be ComputedRef for reactivity
}
```

Import `IBladeToolbar` from `@vc-shell/framework`.

---

## Pattern 1 — List Blade Toolbar (refresh + add)

```ts
const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "refresh",
    title: computed(() => t("XXX.PAGES.LIST.TOOLBAR.REFRESH")),
    icon: "lucide-refresh-cw",
    async clickHandler() {
      await reload();
    },
  },
  {
    id: "addItem",
    title: computed(() => t("XXX.PAGES.LIST.TOOLBAR.ADD")),
    icon: "lucide-plus",
    clickHandler: onAddItem,
  },
]);
```

Both buttons are always visible (no `isVisible`). Neither has a `disabled` state — a list toolbar typically does not disable its actions.

---

## Pattern 2 — Details Blade Toolbar (save/create + reset + delete)

The details toolbar uses `isVisible` to show different buttons for "create new" vs "edit existing", controlled by `!!param.value`:

```ts
const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "save",
    title: computed(() => t("MODULE.PAGES.DETAILS.TOOLBAR.SAVE")),
    icon: "lucide-save",
    async clickHandler() {
      await updateXxx(entity.value);
      callParent("reload");
      closeSelf();
    },
    isVisible: !!param.value, // only when editing
    disabled: computed(() => !(modified.value && !isDisabled.value)),
  },
  {
    id: "create",
    title: computed(() => t("MODULE.PAGES.DETAILS.TOOLBAR.CREATE")),
    icon: "lucide-plus",
    async clickHandler() {
      await createXxx(entity.value);
      callParent("reload");
      closeSelf();
    },
    isVisible: !param.value, // only when creating
    disabled: computed(() => !(modified.value && !isDisabled.value)),
  },
  {
    id: "reset",
    title: computed(() => t("MODULE.PAGES.DETAILS.TOOLBAR.RESET")),
    icon: "lucide-undo-2",
    clickHandler() {
      resetEntries();
    },
    isVisible: !!param.value, // only when editing
    disabled: computed(() => !modified.value),
  },
  {
    id: "delete",
    title: computed(() => t("MODULE.PAGES.DETAILS.TOOLBAR.DELETE")),
    icon: "lucide-trash-2",
    async clickHandler() {
      if (param.value && (await showConfirmation(computed(() => t("MODULE.PAGES.DETAILS.POPUP.ALERT.DELETE"))))) {
        await deleteXxx({ id: param.value });
        callParent("reload");
        closeSelf();
      }
    },
    isVisible: !!param.value, // hidden when creating
    disabled: computed(() => false),
  },
]);
```

Where `isDisabled` comes from vee-validate `useForm`:

```ts
const { meta } = useForm({ validateOnMount: false });
const isDisabled = computed(() => !meta.value.dirty || !meta.value.valid);
```

---

## Conditional Visibility Rules

| Condition          | `isVisible` value      | Effect                                |
| ------------------ | ---------------------- | ------------------------------------- |
| Always show        | omit entirely          | Item is always visible                |
| Edit existing only | `!!param.value`        | Hidden when `param` is undefined/null |
| Create new only    | `!param.value`         | Hidden when `param` has a value       |
| Reactive condition | `computed(() => expr)` | Re-evaluated whenever deps change     |

### Static vs reactive `isVisible`

Use **static boolean** (`!!param.value`) when the visibility is fixed at setup time and will not change during the blade's lifetime:

```ts
isVisible: !!param.value,   // evaluated once at setup — fine for create/edit split
```

Use **`computed`** when visibility must track reactive state:

```ts
isVisible: computed(() => !!someReactiveRef.value),
```

### `disabled` must always be a `ComputedRef`

```ts
// CORRECT — reactive
disabled: computed(() => !modified.value),

// WRONG — static boolean, never updates
disabled: !modified.value,
```

---

## Key Rules

1. **`title` must be `computed(() => t(...))`** — using a plain string `t("...")` evaluates once at setup and does not update when locale changes.
2. **Icon names use lucide prefix**: `"lucide-save"`, `"lucide-plus"`, `"lucide-trash-2"`, `"lucide-undo-2"`, `"lucide-refresh-cw"`.
3. **After save/delete**: always call `callParent("reload")` before `closeSelf()`.
4. **`ref<IBladeToolbar[]>`**: wrap in `ref()` so the toolbar array itself is reactive if items are added/removed dynamically. In practice the array is static, but the typing is conventional.
5. **Do NOT use `reactive()`** for the toolbar array — use `ref()`.
