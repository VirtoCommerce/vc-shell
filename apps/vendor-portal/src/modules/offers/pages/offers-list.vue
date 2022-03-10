<template>
  <VcBlade
    :title="$t('OFFERS.PAGES.LIST.TITLE')"
    width="50%"
    :expanded="expanded"
    :closable="closable"
    :toolbarItems="bladeToolbar"
    @close="$emit('page:close')"
  >
    <!-- Blade contents -->
    <VcTable
      :loading="loading"
      :expanded="expanded"
      :empty="empty"
      :notfound="notfound"
      class="vc-flex-grow_1"
      :multiselect="true"
      :columns="columns"
      :items="offers"
      :itemActionBuilder="actionBuilder"
      :sort="sort"
      :pages="pages"
      :currentPage="currentPage"
      :searchValue="searchValue"
      @search:change="onSearchList"
      :searchPlaceholder="$t('OFFERS.PAGES.LIST.SEARCH.PLACEHOLDER')"
      :totalLabel="$t('OFFERS.PAGES.LIST.TABLE.TOTALS')"
      :totalCount="totalCount"
      :selectedItemId="selectedItemId"
      @itemClick="onItemClick"
      @headerClick="onHeaderClick"
      @paginationClick="onPaginationClick"
      @scroll:ptr="reload"
      @selectionChanged="onSelectionChanged"
    >
      <!-- Override sellerName column template -->
      <template v-slot:item_name="itemData">
        <div class="vc-ellipsis">{{ itemData.item.name }}</div>
      </template>

      <template v-slot:mobile-item="itemData">
        <div
          class="offers-list__mobile-item vc-padding-vertical_m vc-padding-horizontal_l"
        >
          <div class="vc-fill_width vc-flex vc-flex-justify_evenly">
            <VcImage
              class="vc-flex-shrink_0"
              aspect="1x1"
              size="s"
              :bordered="true"
              :src="itemData.item.imgSrc"
            ></VcImage>
            <div class="vc-flex-grow_1 vc-margin-left_m">
              <div class="vc-font-weight_bold vc-font-size_l">
                {{ itemData.item.name }}
              </div>
            </div>
          </div>
          <div
            class="vc-margin-top_m vc-fill_width vc-flex vc-flex-justify_space-between"
          >
            <div class="vc-ellipsis vc-flex-grow_1 vc-margin-right_s">
              <VcHint>{{ $t("OFFERS.PAGES.LIST.MOBILE.SKU") }}</VcHint>
              <div class="vc-ellipsis vc-margin-top_xs">
                {{ itemData.item.sku }}
              </div>
            </div>
            <div class="vc-ellipsis vc-flex-grow_2">
              <vc-hint>{{ $t("OFFERS.PAGES.LIST.MOBILE.QUANTITY") }}</vc-hint>
              <div class="vc-ellipsis vc-margin-top_xs">
                {{ itemData.item.inStockQuantity }}
              </div>
            </div>
          </div>
          <div
            class="vc-margin-top_m vc-fill_width vc-flex vc-flex-justify_space-between"
          >
            <div class="vc-ellipsis vc-flex-grow_2 vc-margin-right_s">
              <vc-hint>{{ $t("OFFERS.PAGES.LIST.MOBILE.LIST_PRICE") }}</vc-hint>
              <div class="vc-ellipsis vc-margin-top_xs">
                {{
                  itemData.item.listPrice && itemData.item.listPrice.toFixed(2)
                }}
              </div>
            </div>
            <div class="vc-ellipsis vc-flex-grow_2 vc-margin-right_s">
              <vc-hint>{{ $t("OFFERS.PAGES.LIST.MOBILE.SALE_PRICE") }}</vc-hint>
              <div class="vc-ellipsis vc-margin-top_xs">
                {{ handleSalePrice(itemData.item.salePrice) }}
              </div>
            </div>
            <div class="vc-ellipsis vc-flex-grow_2">
              <vc-hint>{{ $t("OFFERS.PAGES.LIST.MOBILE.CREATED") }}</vc-hint>
              <div class="vc-ellipsis vc-margin-top_xs">
                {{
                  itemData.item.createdDate &&
                  moment(itemData.item.createdDate).fromNow()
                }}
              </div>
            </div>
          </div>
        </div>
      </template>
    </VcTable>
  </VcBlade>
</template>

<script lang="ts">
import {
  defineComponent,
  watch,
  onMounted,
  ref,
  computed,
  reactive,
  unref,
  inject,
} from "vue";

export default defineComponent({
  url: "offers",
});
</script>

<script lang="ts" setup>
import { useI18n, useFunctions, useLogger } from "@virtoshell/core";
import { useOffers } from "../composables";
import moment from "moment";
import OffersDetails from "./offers-details.vue";
import {
  IActionBuilderResult,
  ITableColumns,
  IBladeToolbar,
} from "../../../types";
import { IOffer } from "../../../api_client";

const props = defineProps({
  expanded: {
    type: Boolean,
    default: true,
  },

  closable: {
    type: Boolean,
    default: true,
  },

  param: {
    type: String,
    default: undefined,
  },
  /**
   * Blade options params
   * @param {ISellerProduct} sellerProduct
   */
  options: {
    type: Object,
    default: () => ({}),
  },
});
const emit = defineEmits(["parent:call", "page:closeChildren", "page:open"]);

const { t } = useI18n();
const logger = useLogger();
const { debounce } = useFunctions();

const {
  searchQuery,
  offers,
  totalCount,
  pages,
  currentPage,
  loadOffers,
  loading,
  deleteOffers,
} = useOffers();

const sort = ref("createdDate:DESC");
const searchValue = ref();
const selectedItemId = ref();
const selectedOfferIds = ref([]);
const isDesktop = inject("isDesktop");

watch(sort, async (value) => {
  await loadOffers({ ...searchQuery.value, sort: value });
});

onMounted(async () => {
  selectedItemId.value = props.param;
  searchQuery.value.sellerProductId = props.options?.sellerProduct?.id;
  await loadOffers({ ...searchQuery.value, sort: sort.value });
});

const reload = async () => {
  selectedOfferIds.value = [];
  await loadOffers({
    ...searchQuery.value,
    skip: (currentPage.value - 1) * searchQuery.value.take,
    sort: sort.value,
  });
  emit("parent:call", {
    method: "reload",
  });
};

const onSearchList = debounce(async (keyword: string) => {
  logger.debug(`Offers list search by ${keyword}`);
  searchValue.value = keyword;
  await loadOffers({
    ...searchQuery.value,
    keyword,
  });
}, 200);

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "refresh",
    title: computed(() => t("OFFERS.PAGES.LIST.TOOLBAR.REFRESH")),
    icon: "fas fa-sync-alt",
    async clickHandler() {
      await reload();
    },
  },
  {
    id: "add",
    title: computed(() => t("OFFERS.PAGES.LIST.TOOLBAR.ADD")),
    icon: "fas fa-plus",
    clickHandler() {
      addOffer();
    },
  },
  {
    id: "deleteSelected",
    title: computed(() => t("OFFERS.PAGES.LIST.TOOLBAR.DELETE")),
    icon: "fas fa-trash",
    async clickHandler() {
      //TODO: replace to confirmation dialog from UI library
      if (
        window.confirm(
          unref(
            computed(() =>
              t("OFFERS.PAGES.LIST.DELETE_SELECTED_CONFIRMATION", {
                count: selectedOfferIds.value.length,
              })
            )
          )
        )
      ) {
        emit("page:closeChildren");
        await deleteOffers({ ids: selectedOfferIds.value });
        await reload();
      }
    },
    disabled: computed(() => !selectedOfferIds.value?.length),
    isVisible: isDesktop,
  },
]);

const tableColumns = ref<ITableColumns[]>([
  {
    id: "imgSrc",
    title: computed(() => t("OFFERS.PAGES.LIST.TABLE.HEADER.PRODUCT_IMAGE")),
    width: 60,
    alwaysVisible: true,
    type: "image",
  },
  {
    id: "name",
    field: "name",
    title: computed(() => t("OFFERS.PAGES.LIST.TABLE.HEADER.PRODUCT_NAME")),
    sortable: true,
    alwaysVisible: true,
  },
  {
    id: "createdDate",
    title: computed(() => t("OFFERS.PAGES.LIST.TABLE.HEADER.CREATED_DATE")),
    width: 140,
    sortable: true,
    type: "date-ago",
  },
  {
    id: "sku",
    title: computed(() => t("OFFERS.PAGES.LIST.TABLE.HEADER.SKU")),
    width: 120,
    sortable: true,
    alwaysVisible: true,
  },
  {
    id: "salePrice",
    title: computed(() => t("OFFERS.PAGES.LIST.TABLE.HEADER.SALE_PRICE")),
    width: 100,
    sortable: true,
    type: "money",
  },
  {
    id: "listPrice",
    title: computed(() => t("OFFERS.PAGES.LIST.TABLE.HEADER.LIST_PRICE")),
    width: 100,
    sortable: true,
    type: "money",
  },
  {
    id: "minQuantity",
    title: computed(() => t("OFFERS.PAGES.LIST.TABLE.HEADER.MIN_QTY")),
    width: 80,
    sortable: true,
    type: "number",
  },
  {
    id: "inStockQuantity",
    title: computed(() => t("OFFERS.PAGES.LIST.TABLE.HEADER.QTY")),
    width: 80,
    sortable: true,
    type: "number",
  },
]);

const empty = reactive({
  image: "/assets/empty-product.png",
  text: computed(() => t("OFFERS.PAGES.LIST.TABLE.EMPTY.TITLE")),
  action: computed(() => t("OFFERS.PAGES.LIST.TABLE.EMPTY.ACTION")),
  clickHandler: () => {
    addOffer();
  },
});

const notfound = reactive({
  image: "/assets/empty-product.png",
  text: computed(() => t("OFFERS.PAGES.LIST.TABLE.NOT_FOUND.TITLE")),
  action: computed(() => t("OFFERS.PAGES.LIST.TABLE.NOT_FOUND.ACTION")),
  clickHandler: async () => {
    searchValue.value = "";
    await loadOffers({
      ...searchQuery.value,
      keyword: "",
    });
  },
});

const columns = computed(() => {
  if (props.expanded) {
    return tableColumns.value;
  } else {
    return tableColumns.value.filter((item) => item.alwaysVisible === true);
  }
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const title = computed(() => t("OFFERS.PAGES.LIST.TITLE"));

const onItemClick = (item: { id: string }) => {
  emit("page:open", {
    component: OffersDetails,
    param: item.id,
    onOpen() {
      selectedItemId.value = item.id;
    },
    onClose() {
      selectedItemId.value = undefined;
    },
  });
};

const onHeaderClick = (item: ITableColumns) => {
  const sortBy = [":DESC", ":ASC", ""];
  if (item.sortable) {
    item.sortDirection = (item.sortDirection ?? 0) + 1;
    sort.value = `${item.id}${sortBy[item.sortDirection % 3]}`;
  }
};

const addOffer = async () => {
  emit("page:open", {
    component: OffersDetails,
    componentOptions: props.options,
  });
};

const onPaginationClick = async (page: number) => {
  await loadOffers({
    ...searchQuery.value,
    skip: (page - 1) * searchQuery.value.take,
  });
};

const onSelectionChanged = (checkboxes: { [key: string]: boolean }) => {
  selectedOfferIds.value = Object.entries(checkboxes)
    .filter(([id, isChecked]) => isChecked)
    .map(([id, isChecked]) => id);
};

const actionBuilder = (
  item: IOffer & { status: string }
): IActionBuilderResult[] => {
  let result = [];

  if (item.status === "Published") {
    result.push({
      icon: "fas fa-times",
      title: computed(() => t("OFFERS.PAGES.LIST.TABLE.ACTIONS.UNPUBLISH")),
      variant: "danger",
      clickHandler() {
        alert("Unpublish");
      },
    });
  } else {
    result.push({
      icon: "fas fa-check",
      title: computed(() => t("OFFERS.PAGES.LIST.TABLE.ACTIONS.PUBLISH")),
      variant: "success",
      clickHandler() {
        alert("Publish");
      },
    });
  }

  result.push({
    icon: "fas fa-trash",
    title: "Delete",
    variant: "danger",
    leftActions: true,
    clickHandler(item: IOffer) {
      if (!selectedOfferIds.value.includes(item.id)) {
        selectedOfferIds.value.push(item.id);
      }
      removeOffers();
      selectedOfferIds.value = [];
    },
  });

  return result;
};

async function removeOffers() {
  //TODO: replace to confirmation dialog from UI library
  if (
    window.confirm(
      t("OFFERS.PAGES.LIST.DELETE_SELECTED_CONFIRMATION", {
        count: selectedOfferIds.value.length,
      })
    )
  ) {
    emit("page:closeChildren");
    await deleteOffers({ ids: selectedOfferIds.value });
    await reload();
  }
}

function handleSalePrice(price: number | undefined) {
  if (!price) {
    return "N/A";
  } else {
    return price.toFixed(2);
  }
}
</script>

<style lang="less">
.offers-list {
  &__mobile-item {
    border-bottom: 1px solid #e3e7ec;
  }
}
</style>
