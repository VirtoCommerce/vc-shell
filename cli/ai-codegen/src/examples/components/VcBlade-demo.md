---
id: component-VcBlade-demo
type: COMPONENT
complexity: SIMPLE
category: component
tags: ["component","blade","container","layout"]
title: "VcBlade Demo"
description: "Blade container component"
componentRole: layout
bladeContext: ["general"]
---

# VcBlade Demo

Real-world blade examples from vendor-portal.

## List Blade (30% width)

```vue
<template>
  <VcBlade
    v-loading="loading"
    :title="bladeTitle"
    :toolbar-items="bladeToolbar"
    :closable="closable"
    :expanded="expanded"
    width="30%"
    @close="$emit('close:blade')"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <!-- @vue-generic {IItem} -->
    <VcTable
      :total-label="$t('ORDERS.PAGES.LIST.TABLE.TOTALS')"
      :items="items"
      :columns="columns"
      :empty="empty"
      :notfound="notfound"
      class="tw-grow tw-basis-0"
      @item-click="onItemClick"
    />
  </VcBlade>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { IBladeToolbar } from "@vc-shell/framework";

export interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
}

export interface Emits {
  (event: "close:blade"): void;
  (event: "expand:blade"): void;
  (event: "collapse:blade"): void;
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});

const emit = defineEmits<Emits>();

// IMPORTANT: defineOptions for blade registration
defineOptions({
  name: "Orders",
  url: "/orders",
  isWorkspace: true,
  priority: 1,
  menuItem: {
    title: "ORDERS.MENU.TITLE",
    icon: "material-shopping_cart",
    priority: 1,
  },
});

const { t } = useI18n({ useScope: "global" });

const bladeTitle = computed(() => t("ORDERS.PAGES.LIST.TITLE"));

// Toolbar configuration
const bladeToolbar = computed((): IBladeToolbar[] => [
  {
    id: "refresh",
    title: t("ORDERS.PAGES.LIST.TOOLBAR.REFRESH"),
    icon: "material-refresh",
    async clickHandler() {
      await loadOrders(searchQuery.value);
    },
  },
]);
</script>
```

## Details Blade with Modification Tracking (70% width)

```vue
<template>
  <VcBlade
    v-loading="loading || stateMachineLoading"
    :title="bladeTitle"
    :toolbar-items="bladeToolbar"
    :closable="closable"
    :expanded="expanded"
    :modified="!disabled ? isModified : undefined"
    width="70%"
    @close="$emit('close:blade')"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <div class="tw-p-6 tw-space-y-6">
      <!-- Blade content -->
      <VcRow class="tw-space-x-4">
        <VcCol :size="6">
          <VcCard :header="$t('ORDERS.PAGES.DETAILS.FORM.ORDER_INFO.TITLE')">
            <div class="tw-p-4 tw-space-y-4">
              <!-- Read-only fields -->
              <VcField
                :label="$t('ORDERS.PAGES.DETAILS.FORM.ORDER_INFO.ORDER_REF')"
                :model-value="item?.number || item?.id"
                orientation="horizontal"
                :aspect-ratio="[1, 2]"
                copyable
                type="text"
              />
            </div>
          </VcCard>
        </VcCol>
      </VcRow>
    </div>
  </VcBlade>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import {
  IBladeToolbar,
  useBladeNavigation,
  useBeforeUnload,
  usePopup,
} from "@vc-shell/framework";
import { useForm } from "vee-validate";

defineOptions({
  url: "/order",
  name: "OrderDetails",
});

const { t } = useI18n({ useScope: "global" });
const { onBeforeClose } = useBladeNavigation();
const { showConfirmation } = usePopup();
const { meta } = useForm({ validateOnMount: false });

const disabled = ref(true);
const isModified = ref(false);
const loading = ref(false);

const bladeTitle = computed(() => item.value?.number ?? "");

// Toolbar with conditional visibility
const bladeToolbar = computed((): IBladeToolbar[] => [
  {
    id: "save",
    title: t("ORDERS.PAGES.DETAILS.TOOLBAR.SAVE"),
    icon: "material-save",
    async clickHandler() {
      if (item.value) {
        await saveOrder(item.value);
        disabled.value = true;
      }
    },
    isVisible: !disabled.value,
    disabled: !(meta.value.valid && isModified.value),
  },
  {
    id: "edit",
    title: t("ORDERS.PAGES.DETAILS.TOOLBAR.EDIT"),
    icon: "lucide-file-pen-line",
    clickHandler: () => {
      disabled.value = false;
    },
    isVisible: computed(() =>
      hasAccess("edit:order") &&
      (item.value?.status === "New" || item.value?.status === "Pending") &&
      disabled.value
    ),
  },
  {
    id: "cancelEdit",
    title: t("ORDERS.PAGES.DETAILS.TOOLBAR.CANCEL_EDIT"),
    icon: "material-undo",
    clickHandler: () => {
      resetModificationState();
      disabled.value = true;
    },
    isVisible: !disabled.value,
  },
]);

// Warn before closing if modified
onBeforeClose(async () => {
  if (!disabled.value && isModified.value) {
    return await showConfirmation(t("ORDERS.PAGES.ALERTS.CLOSE_CONFIRMATION"));
  }
  return true;
});

// Warn before page reload
useBeforeUnload(computed(() => !disabled.value && isModified.value));
</script>
```

## Blade with Language Selector (50% width)

```vue
<template>
  <VcBlade
    v-loading="allLoading"
    :title="title"
    width="50%"
    :expanded="expanded"
    :closable="closable"
    :toolbar-items="bladeToolbar"
    :modified="modified"
    @close="$emit('close:blade')"
  >
    <!-- Language selector in top-right -->
    <div
      v-if="isMultilanguage"
      class="tw-absolute tw-top-2 tw-right-4 tw-z-10"
    >
      <VcLanguageSelector
        :model-value="currentLocale"
        :options="languageOptionsWithFlags"
        :disabled="readonly"
        @update:model-value="setLocale"
      />
    </div>

    <!-- Blade content -->
    <VcContainer :no-padding="true">
      <div class="tw-p-4">
        <VcForm class="tw-space-y-4">
          <!-- Form fields -->
        </VcForm>
      </div>
    </VcContainer>
  </VcBlade>
</template>

<script setup lang="ts">
import { VcLanguageSelector } from "@vc-shell/framework";
import { useMultilanguage } from "../../common";

const {
  currentLocale,
  setLocale,
  languageOptionsWithFlags,
  isMultilanguage,
} = useMultilanguage({ includeFlags: true });

defineOptions({
  name: "Offer",
  url: "/offer",
  routable: false,
  notifyType: ["OfferCreatedDomainEvent"],
});
</script>
```

## Key Features

### Blade Configuration (defineOptions)
- **name**: Blade identifier for navigation
- **url**: Route path
- **isWorkspace**: Show in main menu
- **permissions**: Required permissions array
- **menuItem**: Menu configuration (title, icon, priority)
- **notifyType**: Push notification types to handle
- **routable**: Whether blade can be accessed via URL

### Width Options
- **30%**: Narrow blades (lists, simple views)
- **50%**: Medium blades (forms, dialogs)
- **70%**: Wide blades (complex forms, details)

### Toolbar Items
- **id**: Unique identifier
- **title**: Button text (use i18n)
- **icon**: Icon name (material-*, lucide-*, bi-*)
- **clickHandler**: Async function
- **disabled**: Computed or boolean
- **isVisible**: Computed or boolean (conditional display)
- **separator**: "left" | "right" for visual separator

### Lifecycle Hooks
- **onBeforeClose**: Confirm before closing (returns boolean)
- **useBeforeUnload**: Warn before page reload

### Layout Components
- **VcContainer**: Main content container
- **VcRow**: Flexbox row
- **VcCol**: Flexbox column with size prop
- **VcCard**: Card with header and collapsible support
