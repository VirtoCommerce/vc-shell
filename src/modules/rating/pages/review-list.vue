<template>
  <VcBlade
    :title="title"
    :toolbarItems="bladeToolbar"
    width="70%"
    :expanded="expanded"
    :closable="closable"
    @close="$emit('close:blade')"
  >
    <ReviewTable :expanded="expanded" @itemClick="onItemClick"></ReviewTable>
  </VcBlade>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { VcBlade, IPage, useI18n } from "@vc-shell/framework";
import { ReviewDetails } from ".";
import { CustomerReview } from "../../../api_client/marketplacevendor";
import { IBladeToolbar } from "../../../types";
import { ReviewTable } from "../components";
import { useReviews } from "../composables";

export default defineComponent({
  url: "reviews",
});
</script>

<script lang="ts" setup>
// Page

export interface Props {
  expanded: boolean;
  closable: boolean;
  param?: string;
}

interface Emits {
  (event: "close:blade"): void;
  (event: "open:blade", page: IPage): void;
}

withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});

const emit = defineEmits<Emits>();

const { t } = useI18n();

// Data

const { loadReviews } = useReviews();

// Blade

const title = t("RATING.PAGES.REVIEW_LIST.TITLE");

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

const onItemClick = (
  item: CustomerReview,
  onSelect: () => void,
  onDeselect: () => void
) => {
  emit("open:blade", {
    component: ReviewDetails,
    param: item.id,
    componentOptions: {
      review: item,
    },
    onOpen: onSelect,
    onClose: onDeselect,
  });
};
</script>
