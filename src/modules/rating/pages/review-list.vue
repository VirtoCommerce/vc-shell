<template>
  <VcBlade
    :title="title"
    :toolbarItems="bladeToolbar"
    width="70%"
    :expanded="expanded"
    :closable="closable"
    @close="$emit('page:close')"
  >
    <ReviewTable :expanded="expanded" @itemClick="onItemClick"></ReviewTable>
  </VcBlade>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { VcBlade, IPage } from "@vc-shell/ui";
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
import { useI18n } from "@vc-shell/core";

// Page

interface Props {
  expanded: boolean;
  closable: boolean;
  param?: string;
}

interface Emits {
  (event: "page:close"): void;
  (event: "page:open", page: IPage): void;
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
  emit("page:open", {
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
