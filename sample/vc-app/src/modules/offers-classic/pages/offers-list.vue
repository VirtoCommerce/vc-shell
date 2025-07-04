<template>
  <VcBlade
    :title="$t('OFFERSCLASSIC.PAGES.LIST.TITLE')"
    width="50%"
    :expanded="expanded"
    :closable="closable"
    :toolbar-items="bladeToolbar"
    @close="$emit('close:blade')"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <!-- Blade contents -->
    <VcTable
      :loading="loading"
      :expanded="expanded"
      :empty="empty"
      :notfound="notfound"
      class="tw-grow tw-basis-0"
      multiselect
      :columns="tableColumns"
      :items="offers as unknown as IOfferUnwrappedPrice[]"
      :item-action-builder="actionBuilder"
      enable-item-actions
      :sort="sort"
      :pages="pages"
      :current-page="currentPage"
      :search-value="searchValue"
      :search-placeholder="$t('OFFERSCLASSIC.PAGES.LIST.SEARCH.PLACEHOLDER')"
      :total-label="$t('OFFERSCLASSIC.PAGES.LIST.TABLE.TOTALS')"
      :total-count="totalCount"
      :selected-item-id="selectedItemId"
      select-all
      state-key="offers_list"
      @search:change="onSearchList"
      @item-click="onItemClick"
      @header-click="onHeaderClick"
      @pagination-click="onPaginationClick"
      @scroll:ptr="reload"
      @selection-changed="onSelectionChanged"
      @select:all="selectAllOffers"
    >
      <!-- Override sellerName column template -->
      <template #item_name="itemData">
        <div class="tw-truncate">
          {{ itemData.item.name }}
        </div>
      </template>

      <template #mobile-item="itemData">
        <div class="tw-border-b tw-border-solid tw-border-b-[#e3e7ec] tw-py-3 tw-px-4">
          <div class="tw-w-full tw-flex tw-justify-evenly">
            <VcImage
              class="tw-shrink-0"
              aspect="1x1"
              size="s"
              :bordered="true"
              :src="itemData.item.imgSrc"
            ></VcImage>
            <div class="tw-grow tw-basis-0 tw-ml-3">
              <div class="tw-font-bold tw-text-lg">
                {{ itemData.item.name }}
              </div>
            </div>
          </div>
          <div class="tw-mt-3 tw-w-full tw-flex tw-justify-between">
            <div class="tw-truncate tw-grow tw-basis-0 tw-mr-2">
              <VcHint>{{ $t("OFFERSCLASSIC.PAGES.LIST.MOBILE.SKU") }}</VcHint>
              <div class="tw-truncate tw-mt-1">
                {{ itemData.item.sku }}
              </div>
            </div>
            <div class="tw-truncate tw-grow-[2] tw-basis-0">
              <VcHint>{{ $t("OFFERSCLASSIC.PAGES.LIST.MOBILE.QUANTITY") }}</VcHint>
              <div class="tw-truncate tw-mt-1">
                {{ itemData.item.inStockQuantity }}
              </div>
            </div>
          </div>
          <div class="tw-mt-3 tw-w-full tw-flex tw-justify-between">
            <div class="tw-truncate tw-grow-[2] tw-basis-0 tw-mr-2">
              <VcHint>{{ $t("OFFERSCLASSIC.PAGES.LIST.MOBILE.LIST_PRICE") }}</VcHint>
              <div class="tw-truncate tw-mt-1">
                {{ itemData.item.listPrice && itemData.item.listPrice.toFixed(2) }}
              </div>
            </div>
            <div class="tw-truncate tw-grow-[2] tw-basis-0 tw-mr-2">
              <VcHint>{{ $t("OFFERSCLASSIC.PAGES.LIST.MOBILE.SALE_PRICE") }}</VcHint>
              <div class="tw-truncate tw-mt-1">
                {{ handleSalePrice(itemData.item.salePrice) }}
              </div>
            </div>
            <div class="tw-truncate tw-grow-[2] tw-basis-0">
              <VcHint>{{ $t("OFFERSCLASSIC.PAGES.LIST.MOBILE.CREATED") }}</VcHint>
              <div class="tw-truncate tw-mt-1">
                {{ itemData.item.createdDate && moment(itemData.item.createdDate).fromNow() }}
              </div>
            </div>
          </div>
        </div>
      </template>
    </VcTable>
  </VcBlade>
</template>

<script lang="ts" setup>
import { computed, inject, onMounted, reactive, ref, watch, markRaw, Ref } from "vue";
import {
  IBladeToolbar,
  IParentCallArgs,
  useFunctions,
  IActionBuilderResult,
  ITableColumns,
  useNotifications,
  notification,
  useBladeNavigation,
  usePopup,
} from "@vc-shell/framework";
import moment from "moment";
import { IOffer, ISellerProduct } from "@vc-app/api";
import { useOffers } from "../composables";
import OffersDetails from "./offers-details.vue";
// eslint-disable-next-line import/no-unresolved
import emptyImage from "/assets/empty.png";
import { useI18n } from "vue-i18n";

export interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
  options?: {
    sellerProduct?: ISellerProduct;
  };
}

export interface Emits {
  (event: "parent:call", args: IParentCallArgs): void;
  (event: "close:children"): void;
  (event: "close:blade"): void;
  (event: "collapse:blade"): void;
  (event: "expand:blade"): void;
}

interface IOfferUnwrappedPrice extends IOffer {
  listPrice: number;
  salePrice: number;
}

defineOptions({
  url: "/offers-cls",
  name: "OffersListClassic",
  isWorkspace: true,
  menuItem: {
    title: "OFFERSCLASSIC.MENU.TITLE",
    icon: "bi-file-earmark-invoice",
    priority: 3,
  },
});

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});

const emit = defineEmits<Emits>();
const { openBlade } = useBladeNavigation();
const { showConfirmation } = usePopup();

const { t } = useI18n({ useScope: "global" });
const { debounce } = useFunctions();

const { searchQuery, offers, totalCount, pages, currentPage, loadOffers, loading, deleteOffers } = useOffers();
const { moduleNotifications, markAsRead } = useNotifications("OfferDeletedDomainEvent");

const sort = ref("createdDate:DESC");
const searchValue = ref();
const selectedItemId = ref<string>();
const selectedOfferIds = ref([]) as Ref<string[]>;
const allSelected = ref(false);
const isDesktop = inject<Ref<boolean>>("isDesktop");

watch(
  moduleNotifications,
  (newVal) => {
    newVal.forEach((message) => {
      notification.success(message.title ?? "", {
        onClose() {
          markAsRead(message);
        },
      });
    });
  },
  { deep: true },
);

watch(sort, async (value) => {
  await loadOffers({ ...searchQuery.value, sort: value });
});

watch(
  () => props.param,
  (newVal) => {
    selectedItemId.value = newVal;
  },
  { immediate: true },
);

onMounted(async () => {
  searchQuery.value.sellerProductId = props.options?.sellerProduct?.id;
  await loadOffers({ ...searchQuery.value, sort: sort.value });
});

const reload = async () => {
  selectedOfferIds.value = [];
  await loadOffers({
    ...searchQuery.value,
    skip: (currentPage.value - 1) * (searchQuery.value.take ?? 10),
    sort: sort.value,
  });
  emit("parent:call", {
    method: "reload",
  });
};

const onSearchList = debounce(async (keyword: string) => {
  console.debug(`Offers list search by ${keyword}`);
  searchValue.value = keyword;
  await loadOffers({
    ...searchQuery.value,
    keyword,
  });
}, 1000);

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "refresh",
    title: computed(() => t("OFFERSCLASSIC.PAGES.LIST.TOOLBAR.REFRESH")),
    icon: "material-refresh",
    async clickHandler() {
      await reload();
    },
  },
  {
    id: "add",
    title: computed(() => t("OFFERSCLASSIC.PAGES.LIST.TOOLBAR.ADD")),
    icon: "material-add",
    clickHandler() {
      addOffer();
    },
  },
  {
    id: "deleteSelected",
    title: computed(() => t("OFFERSCLASSIC.PAGES.LIST.TOOLBAR.DELETE")),
    icon: "material-delete",
    async clickHandler() {
      removeOffers();
    },
    disabled: computed(() => !selectedOfferIds.value?.length),
    isVisible: isDesktop,
  },
]);

const tableColumns = ref<ITableColumns[]>([
  {
    id: "imgSrc",
    title: computed(() => t("OFFERSCLASSIC.PAGES.LIST.TABLE.HEADER.PRODUCT_IMAGE")),
    width: 60,
    alwaysVisible: true,
    type: "image",
  },
  {
    id: "name",
    field: "name",
    title: computed(() => t("OFFERSCLASSIC.PAGES.LIST.TABLE.HEADER.PRODUCT_NAME")),
    sortable: true,
    alwaysVisible: true,
  },
  {
    id: "createdDate",
    title: computed(() => t("OFFERSCLASSIC.PAGES.LIST.TABLE.HEADER.CREATED_DATE")),
    width: 140,
    sortable: true,
    type: "date-ago",
  },
  {
    id: "sku",
    title: computed(() => t("OFFERSCLASSIC.PAGES.LIST.TABLE.HEADER.SKU")),
    width: 120,
    sortable: true,
    alwaysVisible: true,
  },
  {
    id: "isActive",
    title: computed(() => t("OFFERSCLASSIC.PAGES.LIST.TABLE.HEADER.ENABLED")),
    width: 120,
    sortable: true,
    alwaysVisible: true,
    type: "status-icon",
  },
  {
    id: "prices.salePrice",
    title: computed(() => t("OFFERSCLASSIC.PAGES.LIST.TABLE.HEADER.SALE_PRICE")),
    width: 100,
    sortable: true,
    type: "money",
  },
  {
    id: "prices.listPrice",
    title: computed(() => t("OFFERSCLASSIC.PAGES.LIST.TABLE.HEADER.LIST_PRICE")),
    width: 100,
    sortable: true,
    type: "money",
  },
  {
    id: "minQuantity",
    title: computed(() => t("OFFERSCLASSIC.PAGES.LIST.TABLE.HEADER.MIN_QTY")),
    width: 80,
    sortable: true,
    type: "number",
  },
  {
    id: "inStockQuantity",
    title: computed(() => t("OFFERSCLASSIC.PAGES.LIST.TABLE.HEADER.QTY")),
    width: 80,
    sortable: true,
    type: "number",
  },
  {
    id: "availQuantity",
    title: computed(() => t("OFFERSCLASSIC.PAGES.LIST.TABLE.HEADER.AVAIL_QTY")),
    width: 80,
    sortable: true,
    type: "number",
  },
]);

const empty = reactive({
  image: emptyImage,
  text: computed(() => t("OFFERSCLASSIC.PAGES.LIST.TABLE.EMPTY.TITLE")),
  action: computed(() => t("OFFERSCLASSIC.PAGES.LIST.TABLE.EMPTY.ACTION")),
  clickHandler: () => {
    addOffer();
  },
});

const notfound = reactive({
  image: emptyImage,
  text: computed(() => t("OFFERSCLASSIC.PAGES.LIST.TABLE.NOT_FOUND.TITLE")),
  action: computed(() => t("OFFERSCLASSIC.PAGES.LIST.TABLE.NOT_FOUND.ACTION")),
  clickHandler: async () => {
    searchValue.value = "";
    await loadOffers({
      ...searchQuery.value,
      keyword: "",
    });
  },
});

const title = computed(() => t("OFFERSCLASSIC.PAGES.LIST.TITLE"));

const onItemClick = (item: IOffer) => {
  openBlade({
    blade: markRaw(OffersDetails),
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

const addOffer = () => {
  openBlade({
    blade: markRaw(OffersDetails),
    options: {
      sellerProduct: props.options?.sellerProduct ?? {},
    },
  });
};

const onPaginationClick = async (page: number) => {
  await loadOffers({
    ...searchQuery.value,
    skip: (page - 1) * (searchQuery.value.take ?? 10),
  });
};

const onSelectionChanged = (items: IOffer[]) => {
  selectedOfferIds.value = items.map((item) => item.id!);
};

const actionBuilder = (): IActionBuilderResult[] => {
  const result: IActionBuilderResult[] = [];
  result.push({
    icon: "material-delete",
    title: "Delete",
    type: "danger",
    position: "left",
    clickHandler(item: IOffer) {
      if (item.id) {
        if (!selectedOfferIds.value.includes(item.id)) {
          selectedOfferIds.value.push(item.id);
        }
        removeOffers();
        selectedOfferIds.value = [];
      }
    },
  });

  return result;
};

async function removeOffers() {
  if (
    await showConfirmation(
      t("OFFERSCLASSIC.PAGES.ALERTS.DELETE_SELECTED_CONFIRMATION.MESSAGE", {
        count: allSelected.value
          ? t("OFFERSCLASSIC.PAGES.ALERTS.DELETE_SELECTED_CONFIRMATION.ALL", { totalCount: totalCount.value })
          : selectedOfferIds.value.length,
      }),
    )
  ) {
    emit("close:children");
    await deleteOffers(allSelected.value, selectedOfferIds.value);
    if (searchQuery.value.skip && searchQuery.value.take && searchQuery.value.skip >= searchQuery.value.take) {
      if (allSelected.value) {
        searchQuery.value.skip = 0;
      } else {
        searchQuery.value.skip -= searchQuery.value.take;
      }
    }
    await reload();
  }
}

async function selectAllOffers(all: boolean) {
  allSelected.value = all;
}

function handleSalePrice(price: number | undefined) {
  if (!price) {
    return "N/A";
  } else {
    return price.toFixed(2);
  }
}

defineExpose({
  title,
  reload,
});
</script>
