<template>
  <VcTable
    class="tw-w-full tw-h-full tw-box-border"
    :loading="loading"
    :expanded="expanded"
    :columns="tableColumns"
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
    state-key="review_table"
  >
    <!-- Empty -->
    <template v-slot:empty>
      <div class="tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-items-center tw-justify-center tw-p-5">
        <img :src="emptyImage" />
        <div class="tw-m-4 tw-text-xl tw-font-medium">
          {{ $t("RATING.REVIEW_TABLE.EMPTY") }}
        </div>
      </div>
    </template>

    <template v-slot:mobile-item="{ item }">
      <div class="tw-p-3">
        <div class="tw-w-full tw-flex tw-justify-evenly">
          <div class="tw-grow tw-basis-0">
            <div class="tw-font-bold tw-text-lg">
              {{ item.title }}
            </div>
          </div>
          <div>
            <Status :review-status="item.reviewStatus as CustomerReviewReviewStatus"></Status>
          </div>
        </div>
        <div>
          <div class="tw-mt-3 tw-w-full tw-flex tw-justify-between">
            <div class="tw-truncate tw-grow tw-basis-0 tw-mr-2">
              <VcHint>Rating</VcHint>
              <VcRating :rating="item.rating as number"></VcRating>
            </div>
            <div class="tw-truncate tw-grow tw-basis-0 tw-mr-2">
              <VcHint>Created date</VcHint>
              <div class="tw-truncate tw-mt-1">
                {{ item.createdDate && moment(item.createdDate).fromNow() }}
              </div>
            </div>
            <div class="tw-truncate tw-grow tw-basis-0 tw-mr-2">
              <VcHint>Created by</VcHint>
              <div class="tw-truncate tw-mt-1">
                {{ item.createdBy }}
              </div>
            </div>
          </div>
          <div class="tw-mt-3 tw-w-full">
            <div class="tw-truncate tw-grow tw-basis-0 tw-mr-2">
              <VcHint>Review</VcHint>
              <div class="tw-truncate tw-mt-1">{{ item.review }}</div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Override rating column template -->
    <template v-slot:item_rating="itemData">
      <VcRating :rating="itemData.item.rating as number"></VcRating>
    </template>

    <!-- Override status column template -->
    <template v-slot:item_status="itemData">
      <Status :review-status="itemData.item.reviewStatus as CustomerReviewReviewStatus"></Status>
    </template>
  </VcTable>
</template>

<script lang="ts" setup>
import { VcRating, VcTable, ITableColumns } from "@vc-shell/framework";
import { computed, onMounted, ref, watch } from "vue";
import { CustomerReview, CustomerReviewReviewStatus } from "../../../api_client/marketplacevendor";
import { Status } from "../components";
import { useReviews } from "../composables";
// eslint-disable-next-line import/no-unresolved
import emptyImage from "/assets/empty.png";
import moment from "moment";
import { useI18n } from "vue-i18n";

// Component

export interface Props {
  expanded: boolean;
  footer?: boolean;
  pageSize?: number;
  sort?: string;
  param?: string;
}

export interface Emits {
  (event: "itemClick", item: CustomerReview, onSelect: () => void, onDeselect: () => void): void;
}

const props = withDefaults(defineProps<Props>(), { footer: true });

const emit = defineEmits<Emits>();

onMounted(async () => {
  selectedItemId.value = props.param;
  await loadReviews();
});

const { t } = useI18n();

// Data

const { loading, reviews, totalCount, pages, currentPage, sort, loadReviews } = useReviews({
  pageSize: props.pageSize,
  sort: props.sort,
});

// Table

const tableColumns = ref<ITableColumns[]>([
  {
    id: "title",
    title: computed(() => t("RATING.REVIEW_TABLE.HEADER.TITLE")),
    alwaysVisible: true,
    class: "tw-truncate",
  },
  {
    id: "review",
    title: computed(() => t("RATING.REVIEW_TABLE.HEADER.REVIEW")),
    alwaysVisible: false,
    class: "tw-truncate",
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
  const sortOptions = ["DESC", "ASC", ""];

  if (item.sortable) {
    if (sort.value.split(":")[0] === item.id) {
      const index = sortOptions.findIndex((x) => {
        const sorting = sort.value.split(":")[1];
        if (sorting) {
          return x === sorting;
        } else {
          return x === "";
        }
      });

      if (index !== -1) {
        const newSort = sortOptions[(index + 1) % sortOptions.length];

        if (newSort === "") {
          sort.value = `${item.id}`;
        } else {
          sort.value = `${item.id}:${newSort}`;
        }
      }
    } else {
      sort.value = `${item.id}:${sortOptions[0]}`;
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
