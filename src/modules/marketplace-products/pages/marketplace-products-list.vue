<template>
  <VcBlade
    :title="$t('MP_PRODUCTS.PAGES.LIST.TITLE')"
    :expanded="expanded"
    :closable="closable"
    width="50%"
    :toolbar-items="bladeToolbar"
    @close="$emit('close:blade')"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <template
      v-if="$slots['error']"
      #error
    >
      <slot name="error"></slot>
    </template>
    <!-- Blade contents -->
    <VcTable
      class="tw-grow tw-basis-0"
      :loading="loading"
      :expanded="expanded"
      :columns="columns"
      :items="products"
      :item-action-builder="actionBuilder"
      :sort="sort"
      :pages="pages"
      :current-page="currentPage"
      :search-placeholder="$t('MP_PRODUCTS.PAGES.LIST.SEARCH.PLACEHOLDER')"
      :total-label="$t('MP_PRODUCTS.PAGES.LIST.TABLE.TOTALS')"
      :search-value="searchValue"
      :active-filter-count="activeFilterCount"
      :selected-item-id="selectedItemId"
      :total-count="totalCount"
      state-key="marketplace_products"
      @search:change="onSearchList"
      @item-click="onItemClick"
      @header-click="onHeaderClick"
      @pagination-click="onPaginationClick"
      @scroll:ptr="reload"
    >
      <!-- Not found template -->
      <template #notfound>
        <div class="tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-items-center tw-justify-center">
          <img :src="emptyImage" />
          <div class="tw-m-4 tw-text-xl tw-font-medium">
            {{ $t("MP_PRODUCTS.PAGES.LIST.NOT_FOUND.EMPTY") }}
          </div>
          <VcButton @click="resetSearch">{{ $t("MP_PRODUCTS.PAGES.LIST.NOT_FOUND.RESET") }}</VcButton>
        </div>
      </template>

      <!-- Empty template -->
      <template #empty>
        <div class="tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-items-center tw-justify-center">
          <img :src="emptyImage" />
          <div class="tw-m-4 tw-text-xl tw-font-medium">
            {{ $t("MP_PRODUCTS.PAGES.LIST.EMPTY.NO_PRODUCTS") }}
          </div>
          <VcButton @click="addProduct">{{ $t("MP_PRODUCTS.PAGES.LIST.EMPTY.ADD") }}</VcButton>
        </div>
      </template>

      <!-- Override name column template -->
      <template #item_name="itemData">
        <div class="tw-flex tw-flex-col">
          <div class="tw-truncate">
            {{ itemData.item.name }}
          </div>
          <VcHint class="tw-truncate tw-mt-1">
            {{ itemData.item.path }}
          </VcHint>
        </div>
      </template>

      <!-- Override status column template -->
      <template #item_status="itemData">
        <mp-product-status
          :status="itemData.item.status as string"
          class="tw-mb-1"
        />
      </template>

      <template #mobile-item="itemData">
        <div class="tw-border-b tw-border-solid tw-border-b-[#e3e7ec] tw-p-3 tw-flex tw-flex-nowrap">
          <VcImage
            class="tw-shrink-0"
            aspect="1x1"
            size="m"
            :bordered="true"
            :src="itemData.item.imgSrc as string"
          />
          <div class="tw-grow tw-basis-0 tw-ml-3">
            <div class="tw-font-bold tw-text-lg">
              {{ itemData.item.name }}
            </div>
            <VcHint class="tw-mt-1">{{ itemData.item.path }}</VcHint>

            <div class="tw-mt-2 tw-mb-3">
              <mp-product-status
                class="tw-mt-3"
                :status="itemData.item.status as string"
              />
            </div>

            <div class="tw-mt-3 tw-w-full tw-flex tw-justify-between">
              <div class="tw-truncate tw-grow tw-basis-0 tw-mr-2">
                <VcHint>{{ $t("MP_PRODUCTS.PAGES.LIST.MOBILE.EAN_GTIN") }}</VcHint>
                <div class="tw-truncate tw-mt-1">
                  {{ itemData.item.productData && (itemData.item.productData as Record<"gtin", string>).gtin }}
                </div>
              </div>
              <div class="tw-truncate tw-grow tw-basis-0 tw-mr-2">
                <VcHint>{{ $t("MP_PRODUCTS.PAGES.LIST.MOBILE.CREATED") }}</VcHint>
                <div class="tw-truncate tw-mt-1">
                  {{ itemData.item.createdDate && moment(itemData.item.createdDate).fromNow() }}
                </div>
              </div>
              <div class="tw-truncate tw-grow tw-basis-0 tw-mr-2">
                <div class="tw-flex tw-flex-col tw-items-center">
                  <VcHint>{{ $t("MP_PRODUCTS.PAGES.LIST.MOBILE.PUBLISHED") }}</VcHint>
                  <div class="tw-truncate tw-mt-1">
                    <VcStatusIcon :status="itemData.item && itemData.item.isPublished as boolean"></VcStatusIcon>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </VcTable>
  </VcBlade>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref, watch, markRaw } from "vue";
import { UserPermissions } from "../../../types";

export default defineComponent({
  url: "/mp-products",
  permissions: [UserPermissions.SellerProductsSearchFromAllSellers],
});
</script>

<script lang="ts" setup>
import {
  IBladeToolbar,
  useFunctions,
  IActionBuilderResult,
  ITableColumns,
  useBladeNavigation,
} from "@vc-shell/framework";
import moment from "moment";
import { ISellerProduct } from "../../../api_client/marketplacevendor";
import MpProductStatus from "../components/MpProductStatus.vue";
import { useProducts } from "../composables";
import { MpProductsEdit } from "./";
// eslint-disable-next-line import/no-unresolved
import emptyImage from "/assets/empty.png";
import { useI18n } from "vue-i18n";

export interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
}

export interface Emits {
  (event: "close:blade"): void;
  (event: "collapse:blade"): void;
  (event: "expand:blade"): void;
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
  param: undefined,
});

defineEmits<Emits>();
const { openBlade } = useBladeNavigation();
const { debounce } = useFunctions();
const { t } = useI18n({ useScope: "global" });

const { products, totalCount, pages, currentPage, loadProducts, loading, searchQuery, exportCategories } = useProducts({
  isPublished: true,
  searchFromAllSellers: true,
});
const filter = reactive<{
  status?: string[];
}>({ status: [] });
const appliedFilter = ref({});

const sort = ref("createdDate:DESC");
const searchValue = ref();
const selectedItemId = ref();

watch(sort, async (value) => {
  await loadProducts({ ...searchQuery.value, sort: value });
});

onMounted(async () => {
  selectedItemId.value = props.param;
  if (props.param) {
    openBlade({
      blade: markRaw(MpProductsEdit),
      param: selectedItemId.value,
    });
  }
  await loadProducts({ sort: sort.value });
});

const reload = async () => {
  console.debug("Products list reload");
  await loadProducts({
    ...searchQuery.value,
    skip: (currentPage.value - 1) * searchQuery.value.take,
    sort: sort.value,
  });
};

const onSearchList = debounce(async (keyword: string) => {
  console.debug(`Products list search by ${keyword}`);
  searchValue.value = keyword;
  await loadProducts({
    ...searchQuery.value,
    keyword,
  });
}, 1000);

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "refresh",
    title: computed(() => t("MP_PRODUCTS.PAGES.LIST.TOOLBAR.REFRESH")),
    icon: "fas fa-sync-alt",
    async clickHandler() {
      await reload();
    },
  },
  {
    id: "add",
    title: computed(() => t("MP_PRODUCTS.PAGES.LIST.TOOLBAR.ADD")),
    icon: "fas fa-plus",
    async clickHandler() {
      openBlade({
        blade: markRaw(MpProductsEdit),
      });
    },
  },
  {
    id: "export",
    title: computed(() => t("MP_PRODUCTS.PAGES.LIST.TOOLBAR.EXPORT_CATEGORIES")),
    icon: "fas fa-file-export",
    async clickHandler() {
      await exportCategories();
    },
  },
]);

const tableColumns = ref<ITableColumns[]>([
  {
    id: "imgSrc",
    title: computed(() => t("MP_PRODUCTS.PAGES.LIST.TABLE.HEADER.IMAGE")),
    width: 60,
    type: "image",
  },
  {
    id: "name",
    title: computed(() => t("MP_PRODUCTS.PAGES.LIST.TABLE.HEADER.NAME")),
    sortable: true,
    width: 100,
    alwaysVisible: true,
  },
  {
    id: "createdDate",
    title: computed(() => t("MP_PRODUCTS.PAGES.LIST.TABLE.HEADER.CREATED_DATE")),
    width: 140,
    sortable: true,
    type: "date-ago",
  },
  {
    id: "isPublished",
    title: computed(() => t("MP_PRODUCTS.PAGES.LIST.TABLE.HEADER.PUBLISHED")),
    type: "status-icon",
    width: 180,
    align: "center",
    sortable: true,
  },
  {
    id: "status",
    title: computed(() => t("MP_PRODUCTS.PAGES.LIST.TABLE.HEADER.STATUS")),
    width: 180,
    sortable: true,
    alwaysVisible: true,
  },
  {
    id: "gtin",
    field: "productData.gtin",
    title: computed(() => t("MP_PRODUCTS.PAGES.LIST.TABLE.HEADER.GTIN")),
    width: 180,
    alwaysVisible: true,
  },
]);

const columns = computed(() => {
  if (props.expanded) {
    return tableColumns.value;
  } else {
    return tableColumns.value.filter((item) => item.alwaysVisible === true);
  }
});

const title = computed(() => t("MP_PRODUCTS.PAGES.LIST.TITLE"));
const activeFilterCount = computed(() => Object.values(appliedFilter.value).filter((item) => !!item).length);

const onItemClick = (item: { id: string }) => {
  openBlade({
    blade: markRaw(MpProductsEdit),
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

const onPaginationClick = async (page: number) => {
  await loadProducts({
    ...searchQuery.value,
    skip: (page - 1) * searchQuery.value.take,
  });
};

const actionBuilder = (product: ISellerProduct): IActionBuilderResult[] => {
  const result = [];

  // const statuses =
  //   product.status?.split(",").map((item) => item.trim()) || [];

  /*if (statuses.includes("Published")) {
        result.push({
          icon: "fas fa-times",
          title: computed(() => t("MP_PRODUCTS.PAGES.LIST.ACTIONS.UNPUBLISH")),
          variant: "danger",
          clickHandler() {
            showError("Unpublish");
          },
        });
      } else {
        result.push({
          icon: "fas fa-check",
          title: computed(() => t("MP_PRODUCTS.PAGES.LIST.ACTIONS.PUBLISH")),
          variant: "success",
          clickHandler() {
            showError("Publish");
          },
        });
      }

      result.push({
        icon: "fas fa-trash",
        title: "Delete",
        variant: "danger",
        leftActions: true,
        clickHandler(item: ISellerProduct) {
          if (await showConfirmation("Delete " + item.id)) {
          }
        },
      });*/

  /*result.push(
        ...[
          {
            icon: "fas fa-clock",
            title: "Other action",
            clickHandler() {
              showError("Other action");
            },
          },
          {
            icon: "fas fa-clock",
            title: "Other action2",
            clickHandler() {
              showError("Other action");
            },
          },
        ]
      );*/

  return result;
};

async function resetSearch() {
  searchValue.value = "";
  Object.keys(filter).forEach((key: string) => (filter[key] = undefined));
  await loadProducts({
    ...searchQuery.value,
    ...filter,
    keyword: "",
  });
  appliedFilter.value = {};
}

function addProduct() {
  openBlade({
    blade: markRaw(MpProductsEdit),
  });
}

defineExpose({
  reload,
  title,
});
</script>
