<template>
  <VcTable
    class="grow basis-0"
    :loading="loading"
    :expanded="expanded"
    :columns="columns"
    :header="false"
    :footer="footer"
    :items="reviews"
    :selectedItemId="selectedItemId"
    :sort="sort"
    :pages="pages"
    :currentPage="currentPage"
    :totalLabel="$t('RATING.REVIEW_TABLE.TOTALS')"
    :totalCount="totalCount"
    @headerClick="onHeaderClick"
    @itemClick="onItemClick"
    @paginationClick="onPaginationClick"
    @scroll:ptr="loadReviews"
  >
    <!-- Empty -->
    <template v-slot:empty>
      <div
        class="w-full h-full box-border flex flex-col items-center justify-center p-5"
      >
        <img :src="emptyImage" />
        <div class="m-4 text-xl font-medium">
          {{ $t("RATING.REVIEW_TABLE.EMPTY") }}
        </div>
      </div>
    </template>

    <!-- Override rating column template -->
    <template v-slot:item_rating="itemData">
      <VcRating :rating="itemData.item.rating"></VcRating>
    </template>

    <!-- Override status column template -->
    <template v-slot:item_status="itemData">
      <Status :review-status="itemData.item.reviewStatus"></Status>
    </template>
  </VcTable>
</template>

<script lang="ts" setup>
import { useI18n } from "@vc-shell/core";
import { VcRating, VcTable } from "@vc-shell/ui";
import { computed, onMounted, ref, watch } from "vue";
import { CustomerReview } from "../../../api_client/marketplacevendor";
import { ITableColumns } from "../../../types";
import { Status } from "../components";
import { useReviews } from "../composables";
import emptyImage from "/assets/empty.png";

// Component

export interface Props {
  expanded: boolean;
  footer?: boolean;
  pageSize?: number;
  sort?: string;
  param?: string;
}

export interface Emits {
  (
    event: "itemClick",
    item: CustomerReview,
    onSelect: () => void,
    onDeselect: () => void
  ): void;
}

const props = withDefaults(defineProps<Props>(), { footer: true });

const emit = defineEmits<Emits>();

onMounted(async () => {
  selectedItemId.value = props.param;
  await loadReviews();
});

const { t } = useI18n();

// Data

const { loading, reviews, totalCount, pages, currentPage, sort, loadReviews } =
  useReviews({ pageSize: props.pageSize, sort: props.sort });

// Table

const columns = computed(() => {
  if (props.expanded) {
    return tableColumns.value;
  } else {
    return tableColumns.value.filter((item) => item.alwaysVisible === true);
  }
});
const tableColumns = ref<ITableColumns[]>([
  {
    id: "title",
    title: computed(() => t("RATING.REVIEW_TABLE.HEADER.TITLE")),
    alwaysVisible: true,
    class: "truncate",
  },
  {
    id: "review",
    title: computed(() => t("RATING.REVIEW_TABLE.HEADER.REVIEW")),
    alwaysVisible: false,
    class: "truncate",
  },
  {
    id: "rating",
    title: computed(() => t("RATING.REVIEW_TABLE.HEADER.RATING")),
    alwaysVisible: true,
    sortable: true,
    width: 140,
  },
  {
    id: "status",
    field: "reviewStatus",
    title: computed(() => t("RATING.REVIEW_TABLE.HEADER.STATUS")),
    alwaysVisible: true,
    width: 120,
  },
  {
    id: "createdDate",
    title: computed(() => t("RATING.REVIEW_TABLE.HEADER.CREATEDDATE")),
    alwaysVisible: true,
    sortable: true,
    type: "date-ago",
    width: 120,
  },
  {
    id: "createdBy",
    title: computed(() => t("RATING.REVIEW_TABLE.HEADER.CREATEDBY")),
    alwaysVisible: true,
    width: 140,
  },
]);

watch(sort, async (value) => {
  sort.value = value;
  await loadReviews();
});

const selectedItemId = ref();

const onHeaderClick = (item: ITableColumns) => {
  const sortBy = [":DESC", ":ASC", ""];
  if (item.sortable) {
    item.sortDirection = (item.sortDirection ?? 0) + 1;
    if (sortBy[item.sortDirection % 3] === "") {
      sort.value = `${sortBy[item.sortDirection % 3]}`;
    } else {
      sort.value = `${item.id}${sortBy[item.sortDirection % 3]}`;
    }
  }
};

const onItemClick = (item: CustomerReview) => {
  emit(
    "itemClick",
    item,
    () => {
      selectedItemId.value = item.id;
    },
    () => {
      selectedItemId.value = undefined;
    }
  );
};

const onPaginationClick = async (page: number) => {
  currentPage.value = page;
  await loadReviews();
};
</script>
