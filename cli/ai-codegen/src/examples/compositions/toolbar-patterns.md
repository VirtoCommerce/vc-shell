# Toolbar Patterns

**Pattern:** IBladeToolbar configuration

**Use:** Blade action buttons

## Basic Toolbar

```typescript
const toolbar = ref<IBladeToolbar[]>([
  {
    id: "refresh",
    title: computed(() => t("TOOLBAR.REFRESH")),
    icon: "material-refresh",
    async clickHandler() {
      await reload();
    },
  },
  {
    id: "add",
    title: computed(() => t("TOOLBAR.ADD")),
    icon: "material-add",
    clickHandler: () => openAddBlade(),
  },
]);
```

## Form Toolbar (Save/Delete)

```typescript
const toolbar = ref<IBladeToolbar[]>([
  {
    id: "save",
    title: computed(() => t("TOOLBAR.SAVE")),
    icon: "material-save",
    async clickHandler() {
      if (meta.value.valid) {
        entity.value.id ? await updateEntity(entity.value) : await createEntity(entity.value);
      }
    },
    disabled: computed(() => !(meta.value.valid && modified.value)),
  },
  {
    id: "delete",
    title: computed(() => t("TOOLBAR.DELETE")),
    icon: "material-delete",
    async clickHandler() {
      if (await showConfirmation(t("CONFIRM.DELETE"))) {
        await deleteEntity({ id: entity.value.id });
        emit("close:blade");
      }
    },
    isVisible: computed(() => !!entity.value.id),
  },
]);
```

## Bulk Actions Toolbar

```typescript
const toolbar = ref<IBladeToolbar[]>([
  {
    id: "refresh",
    icon: "material-refresh",
    async clickHandler() { await reload(); },
  },
  {
    id: "add",
    icon: "material-add",
    clickHandler: openAdd,
  },
  {
    id: "deleteSelected",
    icon: "material-delete",
    async clickHandler() { await deleteBulk(); },
    disabled: computed(() => !selectedIds.value.length),
    isVisible: isDesktop, // Hide on mobile
  },
]);
```

## Conditional Actions

```typescript
{
  id: "enable",
  title: "Enable",
  icon: "material-visibility",
  async clickHandler() {
    entity.value.isActive = true;
  },
  isVisible: computed(() => entity.value.id && !entity.value.isActive),
},
{
  id: "disable",
  title: "Disable",
  icon: "material-visibility_off",
  async clickHandler() {
    entity.value.isActive = false;
  },
  isVisible: computed(() => entity.value.id && entity.value.isActive),
}
```

**Key Props:**
- id, title, icon, clickHandler
- disabled (computed)
- isVisible (computed)

**Lines:** ~20-40 per toolbar

