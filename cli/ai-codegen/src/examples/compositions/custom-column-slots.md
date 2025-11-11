# Custom Column Templates

**Pattern:** VcTable item slots for custom rendering

**Use:** Custom column display (status, images, formatted text)

**Based on:** orders-list.vue, videos-list.vue, offers-list.vue

## Status Column

```vue
<VcTable>
  <template #item_status="{ item }">
    <VcStatus v-bind="statusStyle(item.status)">
      {{ item.status }}
    </VcStatus>
  </template>
</VcTable>

<script setup>
function statusStyle(status: string) {
  switch (status) {
    case "Active": return { variant: "success", outline: false };
    case "Pending": return { variant: "warning", outline: true };
    default: return { variant: "info", outline: true };
  }
}
</script>
```

## Image Column

```vue
<template #item_image="{ item }">
  <VcImage :src="item.imageUrl" size="s" bordered aspect="1x1" />
</template>
```

## Multi-line Text

```vue
<template #item_name="{ item }">
  <div class="tw-flex tw-flex-col">
    <div class="tw-truncate">{{ item.name }}</div>
    <VcHint class="tw-truncate tw-mt-1">{{ item.description }}</VcHint>
  </div>
</template>
```

## Status Icon Only

```vue
<template #item_isActive="{ item }">
  <VcStatusIcon :status="item.isActive" />
</template>
```

## Custom Empty/NotFound States

```vue
<VcTable :empty="empty" :notfound="notfound">
  <!-- Or use slot templates -->
  <template #empty>
    <CustomEmptyComponent @add="handleAdd" />
  </template>
  
  <template #notfound>
    <CustomNotFoundComponent @reset="handleReset" />
  </template>
</VcTable>

<script setup>
// Or use prop objects
const empty = {
  icon: "material-list",
  text: computed(() => t("EMPTY.TEXT")),
  action: computed(() => t("EMPTY.ADD")),
  clickHandler: handleAdd,
};

const notfound = {
  icon: "material-search",
  text: computed(() => t("NOTFOUND.TEXT")),
  action: computed(() => t("NOTFOUND.RESET")),
  clickHandler: handleReset,
};
</script>
```

**Components:**
- VcStatus, VcStatusIcon, VcImage, VcHint

**Lines:** ~30-40 per pattern

