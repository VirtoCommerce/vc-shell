---
id: component-VcIcon-demo
type: COMPONENT
complexity: SIMPLE
category: component
tags: ["component","icon","display"]
title: "VcIcon Demo"
description: "Icon component"
componentRole: display
bladeContext: ["details","list","general"]
---

# VcIcon Demo

Real-world icon examples from vendor-portal with Material, Bootstrap, Lucide, and FontAwesome support.

## Icons in Buttons

```vue
<template>
  <div class="tw-flex tw-flex-wrap tw-gap-3">
    <!-- Icon-only buttons -->
    <VcButton
      icon="material-add"
      @click="onCreate"
    />
    
    <VcButton
      icon="material-edit"
      variant="primary"
      @click="onEdit"
    />
    
    <VcButton
      icon="material-delete"
      variant="danger"
      @click="onDelete"
    />

    <!-- Buttons with icon and text -->
    <VcButton @click="onSave">
      <VcIcon icon="material-save" class="tw-mr-2" />
      {{ $t("COMMON.SAVE") }}
    </VcButton>

    <VcButton outlined @click="onExport">
      <VcIcon icon="material-download" class="tw-mr-2" />
      {{ $t("COMMON.EXPORT") }}
    </VcButton>

    <VcButton variant="primary" @click="onUpload">
      <VcIcon icon="material-upload" class="tw-mr-2" />
      {{ $t("COMMON.UPLOAD") }}
    </VcButton>
  </div>
</template>

<script setup lang="ts">
import { VcButton, VcIcon } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

function onCreate() {
  console.log("Create clicked");
}

function onEdit() {
  console.log("Edit clicked");
}

function onDelete() {
  console.log("Delete clicked");
}

function onSave() {
  console.log("Save clicked");
}

function onExport() {
  console.log("Export clicked");
}

function onUpload() {
  console.log("Upload clicked");
}
</script>
```

## Icon Sizes

```vue
<template>
  <div class="tw-space-y-4">
    <div class="tw-flex tw-items-center tw-gap-4">
      <span class="tw-w-20 tw-text-sm">Extra Small:</span>
      <VcIcon icon="material-star" size="xs" />
      <VcIcon icon="material-favorite" size="xs" />
      <VcIcon icon="bi-bell" size="xs" />
    </div>

    <div class="tw-flex tw-items-center tw-gap-4">
      <span class="tw-w-20 tw-text-sm">Small:</span>
      <VcIcon icon="material-star" size="s" />
      <VcIcon icon="material-favorite" size="s" />
      <VcIcon icon="bi-bell" size="s" />
    </div>

    <div class="tw-flex tw-items-center tw-gap-4">
      <span class="tw-w-20 tw-text-sm">Medium:</span>
      <VcIcon icon="material-star" size="m" />
      <VcIcon icon="material-favorite" size="m" />
      <VcIcon icon="bi-bell" size="m" />
    </div>

    <div class="tw-flex tw-items-center tw-gap-4">
      <span class="tw-w-20 tw-text-sm">Large:</span>
      <VcIcon icon="material-star" size="l" />
      <VcIcon icon="material-favorite" size="l" />
      <VcIcon icon="bi-bell" size="l" />
    </div>

    <div class="tw-flex tw-items-center tw-gap-4">
      <span class="tw-w-20 tw-text-sm">Extra Large:</span>
      <VcIcon icon="material-star" size="xl" />
      <VcIcon icon="material-favorite" size="xl" />
      <VcIcon icon="bi-bell" size="xl" />
    </div>

    <div class="tw-flex tw-items-center tw-gap-4">
      <span class="tw-w-20 tw-text-sm">XXL:</span>
      <VcIcon icon="material-star" size="xxl" />
      <VcIcon icon="material-favorite" size="xxl" />
      <VcIcon icon="bi-bell" size="xxl" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { VcIcon } from "@vc-shell/framework";
</script>
```

## Icons in Table Columns

```vue
<template>
  <VcTable
    :items="items"
    :columns="columns"
    @item-click="onItemClick"
  >
    <!-- Status icon column -->
    <template #item_status="{ item }">
      <div class="tw-flex tw-items-center tw-gap-2">
        <VcIcon
          :icon="getStatusIcon(item.status)"
          :class="getStatusColor(item.status)"
          size="m"
        />
        <span>{{ item.status }}</span>
      </div>
    </template>

    <!-- Actions column -->
    <template #item_actions="{ item }">
      <div class="tw-flex tw-gap-2">
        <VcButton
          icon="material-visibility"
          size="s"
          text
          @click.stop="onView(item)"
        />
        <VcButton
          icon="material-edit"
          size="s"
          text
          @click.stop="onEdit(item)"
        />
        <VcButton
          icon="material-delete"
          size="s"
          text
          variant="danger"
          @click.stop="onDelete(item)"
        />
      </div>
    </template>

    <!-- Type icon -->
    <template #item_type="{ item }">
      <div class="tw-flex tw-items-center tw-gap-2">
        <VcIcon :icon="getTypeIcon(item.type)" size="m" />
        <span>{{ item.type }}</span>
      </div>
    </template>
  </VcTable>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { VcTable, VcButton, VcIcon } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const items = ref([
  { id: "1", name: "Order #1001", status: "completed", type: "digital" },
  { id: "2", name: "Order #1002", status: "pending", type: "physical" },
  { id: "3", name: "Order #1003", status: "cancelled", type: "service" },
]);

const columns = computed(() => [
  { id: "name", title: t("ORDERS.NAME") },
  { id: "status", title: t("ORDERS.STATUS") },
  { id: "type", title: t("ORDERS.TYPE") },
  { id: "actions", title: t("COMMON.ACTIONS"), align: "center" },
]);

function getStatusIcon(status: string): string {
  const icons: Record<string, string> = {
    completed: "material-check_circle",
    pending: "material-schedule",
    cancelled: "material-cancel",
    failed: "material-error",
  };
  return icons[status] || "material-info";
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    completed: "tw-text-[var(--success-500)]",
    pending: "tw-text-[var(--warning-500)]",
    cancelled: "tw-text-[var(--danger-500)]",
    failed: "tw-text-[var(--danger-500)]",
  };
  return colors[status] || "tw-text-[var(--neutrals-500)]";
}

function getTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    digital: "material-cloud_download",
    physical: "material-local_shipping",
    service: "material-build",
  };
  return icons[type] || "material-help";
}

function onItemClick(item: any) {
  console.log("Item clicked:", item.id);
}

function onView(item: any) {
  console.log("View:", item.id);
}

function onEdit(item: any) {
  console.log("Edit:", item.id);
}

function onDelete(item: any) {
  console.log("Delete:", item.id);
}
</script>
```

## Different Icon Libraries

```vue
<template>
  <div class="tw-space-y-6">
    <!-- Material Icons -->
    <div>
      <h3 class="tw-font-bold tw-mb-3">Material Icons</h3>
      <div class="tw-flex tw-flex-wrap tw-gap-4">
        <div class="tw-flex tw-items-center tw-gap-2">
          <VcIcon icon="material-home" size="l" />
          <span class="tw-text-sm">material-home</span>
        </div>
        <div class="tw-flex tw-items-center tw-gap-2">
          <VcIcon icon="material-shopping_cart" size="l" />
          <span class="tw-text-sm">material-shopping_cart</span>
        </div>
        <div class="tw-flex tw-items-center tw-gap-2">
          <VcIcon icon="material-favorite" size="l" />
          <span class="tw-text-sm">material-favorite</span>
        </div>
        <div class="tw-flex tw-items-center tw-gap-2">
          <VcIcon icon="material-settings" size="l" />
          <span class="tw-text-sm">material-settings</span>
        </div>
      </div>
    </div>

    <!-- Bootstrap Icons -->
    <div>
      <h3 class="tw-font-bold tw-mb-3">Bootstrap Icons</h3>
      <div class="tw-flex tw-flex-wrap tw-gap-4">
        <div class="tw-flex tw-items-center tw-gap-2">
          <VcIcon icon="bi-house" size="l" />
          <span class="tw-text-sm">bi-house</span>
        </div>
        <div class="tw-flex tw-items-center tw-gap-2">
          <VcIcon icon="bi-cart" size="l" />
          <span class="tw-text-sm">bi-cart</span>
        </div>
        <div class="tw-flex tw-items-center tw-gap-2">
          <VcIcon icon="bi-heart" size="l" />
          <span class="tw-text-sm">bi-heart</span>
        </div>
        <div class="tw-flex tw-items-center tw-gap-2">
          <VcIcon icon="bi-gear" size="l" />
          <span class="tw-text-sm">bi-gear</span>
        </div>
      </div>
    </div>

    <!-- Font Awesome - DEPRECATED, DO NOT USE -->
    <!--
    <div>
      <h3 class="tw-font-bold tw-mb-3 tw-text-red-500">⚠️ Font Awesome (FORBIDDEN - Legacy)</h3>
      <p class="tw-text-sm tw-text-red-500">Font Awesome icons are deprecated. Use Material Symbols instead.</p>
    </div>
    -->

    <!-- Lucide Icons -->
    <div>
      <h3 class="tw-font-bold tw-mb-3">Lucide Icons</h3>
      <div class="tw-flex tw-flex-wrap tw-gap-4">
        <div class="tw-flex tw-items-center tw-gap-2">
          <VcIcon icon="lucide-home" size="l" />
          <span class="tw-text-sm">lucide-home</span>
        </div>
        <div class="tw-flex tw-items-center tw-gap-2">
          <VcIcon icon="lucide-shopping-cart" size="l" />
          <span class="tw-text-sm">lucide-shopping-cart</span>
        </div>
        <div class="tw-flex tw-items-center tw-gap-2">
          <VcIcon icon="lucide-heart" size="l" />
          <span class="tw-text-sm">lucide-heart</span>
        </div>
        <div class="tw-flex tw-items-center tw-gap-2">
          <VcIcon icon="lucide-settings" size="l" />
          <span class="tw-text-sm">lucide-settings</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VcIcon } from "@vc-shell/framework";
</script>
```

## Icons with Colors and States

```vue
<template>
  <div class="tw-space-y-4">
    <!-- Status indicators -->
    <div class="tw-flex tw-items-center tw-gap-4">
      <div class="tw-flex tw-items-center tw-gap-2">
        <VcIcon
          icon="material-check_circle"
          size="l"
          class="tw-text-[var(--success-500)]"
        />
        <span>{{ $t("STATUS.SUCCESS") }}</span>
      </div>

      <div class="tw-flex tw-items-center tw-gap-2">
        <VcIcon
          icon="material-error"
          size="l"
          class="tw-text-[var(--danger-500)]"
        />
        <span>{{ $t("STATUS.ERROR") }}</span>
      </div>

      <div class="tw-flex tw-items-center tw-gap-2">
        <VcIcon
          icon="material-warning"
          size="l"
          class="tw-text-[var(--warning-500)]"
        />
        <span>{{ $t("STATUS.WARNING") }}</span>
      </div>

      <div class="tw-flex tw-items-center tw-gap-2">
        <VcIcon
          icon="material-info"
          size="l"
          class="tw-text-[var(--info-500)]"
        />
        <span>{{ $t("STATUS.INFO") }}</span>
      </div>
    </div>

    <!-- Interactive icons -->
    <div class="tw-flex tw-gap-3">
      <VcIcon
        icon="material-favorite"
        size="xl"
        :class="isFavorite ? 'tw-text-[var(--danger-500)]' : 'tw-text-[var(--neutrals-400)]'"
        class="tw-cursor-pointer hover:tw-scale-110 tw-transition-transform"
        @click="toggleFavorite"
      />

      <VcIcon
        icon="material-bookmark"
        size="xl"
        :class="isBookmarked ? 'tw-text-[var(--primary-500)]' : 'tw-text-[var(--neutrals-400)]'"
        class="tw-cursor-pointer hover:tw-scale-110 tw-transition-transform"
        @click="toggleBookmark"
      />

      <VcIcon
        icon="material-star"
        size="xl"
        :class="isStarred ? 'tw-text-[var(--warning-500)]' : 'tw-text-[var(--neutrals-400)]'"
        class="tw-cursor-pointer hover:tw-scale-110 tw-transition-transform"
        @click="toggleStar"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcIcon } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const isFavorite = ref(false);
const isBookmarked = ref(false);
const isStarred = ref(true);

function toggleFavorite() {
  isFavorite.value = !isFavorite.value;
}

function toggleBookmark() {
  isBookmarked.value = !isBookmarked.value;
}

function toggleStar() {
  isStarred.value = !isStarred.value;
}
</script>
```

## Key Points

### Icon Library Prefixes
- **Material Icons**: `material-*` (e.g., `material-home`) - **PREFERRED**
- **Bootstrap Icons**: `bi-*` (e.g., `bi-house`)
- **Lucide Icons**: `lucide-*` (e.g., `lucide-home`)
- ~~**Font Awesome**~~: `fas fa-*`, `far fa-*`, `fab fa-*` - **⚠️ FORBIDDEN (Legacy)**

### Sizes
- `xs` - Extra Small (12px)
- `s` - Small (16px)
- `m` - Medium (20px, default)
- `l` - Large (24px)
- `xl` - Extra Large (32px)
- `xxl` - XXL (48px)

### Common Use Cases

1. **Button Icons**: Add visual context to actions
```vue
<VcButton icon="material-add" />
<VcButton>
  <VcIcon icon="material-save" class="tw-mr-2" />
  Save
</VcButton>
```

2. **Status Indicators**: Show state with colored icons
```vue
<VcIcon
  icon="material-check_circle"
  class="tw-text-[var(--success-500)]"
/>
```

3. **Table Actions**: Compact action buttons
```vue
<VcButton icon="material-edit" size="s" text />
```

4. **Interactive Icons**: Clickable favorites, bookmarks
```vue
<VcIcon
  icon="material-favorite"
  :class="isFavorite ? 'tw-text-red-500' : 'tw-text-gray-400'"
  class="tw-cursor-pointer"
  @click="toggleFavorite"
/>
```

### Best Practices

- Choose appropriate size for context (xs/s for inline, l/xl for standalone)
- Use semantic colors for status (success=green, danger=red, etc.)
- Add transitions for interactive icons (`hover:tw-scale-110`)
- Keep icon library consistent within a section
- Use `text` variant buttons for icon-only actions in tables
- Combine with text labels for clarity
- Apply proper spacing when icons are next to text (`tw-mr-2`, `tw-gap-2`)

