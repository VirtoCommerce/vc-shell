<template>
  <VcBlade
    :title="title"
    :toolbar-items="bladeToolbar"
    width="70%"
    :expanded="expanded"
    :closable="closable"
    @close="$emit('close:blade')"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <ReviewTable
      :expanded="expanded"
      :selected-item-id="selectedItemId"
      @item-click="onItemClick"
    ></ReviewTable>
  </VcBlade>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { IBladeToolbar, useBladeNavigation } from "@vc-shell/framework";
import { CustomerReview } from "@vcmp-vendor-portal/api/marketplacevendor";
import { ReviewTable } from "../components";
import { useReviews } from "../composables";
import { useI18n } from "vue-i18n";
import { UserPermissions } from "./../../types";
// Page

export interface Props {
  expanded: boolean;
  closable: boolean;
  param?: string;
  options?: {
    review: CustomerReview;
  };
}

export interface Emits {
  (event: "close:blade"): void;
  (event: "collapse:blade"): void;
  (event: "expand:blade"): void;
}

defineOptions({
  url: "/reviews",
  name: "Reviews",
  isWorkspace: true,
  permissions: UserPermissions.ManageSellerReviews,
  menuItem: {
    title: "Rating & Reviews",
    icon: "fas fa-star",
    priority: 5,
  },
});

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});

defineEmits<Emits>();

const { openBlade, resolveBladeByName } = useBladeNavigation();

const { t } = useI18n({ useScope: "global" });

// Data

const { loadReviews } = useReviews();

// Blade

const title = t("RATING.PAGES.REVIEW_LIST.TITLE");

const selectedItemId = ref();

watch(
  () => props.param,
  async (newVal) => {
    if (newVal && props.options) {
      await onItemClick(props.options.review);
    }
  },
  { immediate: true },
);

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "refresh",
    title: computed(() => t("RATING.PAGES.REVIEW_LIST.TOOLBAR.REFRESH")),
    icon: "fas fa-sync-alt",
    async clickHandler() {
      await loadReviews();
    },
  },
]);

async function onItemClick(item: CustomerReview) {
  await openBlade({
    blade: resolveBladeByName("ReviewDetails"),
    param: item.id,
    options: {
      review: item,
    },
    onOpen: () => {
      selectedItemId.value = item.id;
    },
    onClose: () => {
      selectedItemId.value = undefined;
    },
  });
}

defineExpose({
  title,
});
</script>
