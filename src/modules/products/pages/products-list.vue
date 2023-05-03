<template>
  <VcBlade
    :title="$t('PRODUCTS.PAGES.LIST.TITLE')"
    :expanded="expanded"
    :closable="closable"
    width="50%"
    :toolbarItems="bladeToolbar"
    @close="$emit('close:blade')"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <template
      v-slot:error
      v-if="$slots['error']"
    >
      <slot name="error"></slot>
    </template>

    <!-- Blade contents -->
    <VcTable
      class="tw-grow tw-basis-0"
      :loading="loading"
      :expanded="expanded"
      :columns="tableColumns"
      :items="products"
      :itemActionBuilder="actionBuilder"
      :multiselect="true"
      :sort="sort"
      :pages="pages"
      :currentPage="currentPage"
      :searchPlaceholder="$t('PRODUCTS.PAGES.LIST.SEARCH.PLACEHOLDER')"
      :totalLabel="$t('PRODUCTS.PAGES.LIST.TABLE.TOTALS')"
      :searchValue="searchValue"
      :activeFilterCount="activeFilterCount"
      :selectedItemId="selectedItemId"
      @search:change="onSearchList"
      :totalCount="totalCount"
      @itemClick="onItemClick"
      @headerClick="onHeaderClick"
      @paginationClick="onPaginationClick"
      @scroll:ptr="reload"
      @selectionChanged="onSelectionChanged"
      state-key="products_list"
    >
      <!-- Filters -->
      <template v-slot:filters="{ closePanel }">
        <h2 v-if="$isMobile.value">
          {{ $t("PRODUCTS.PAGES.LIST.FILTERS.TITLE") }}
        </h2>
        <VcContainer no-padding>
          <VcRow>
            <VcCol class="tw-w-[180px] tw-p-2">
              <div class="tw-mb-4 tw-text-[#a1c0d4] tw-font-bold tw-text-[17px]">
                {{ $t("PRODUCTS.PAGES.LIST.FILTERS.STATUS_FILTER") }}
              </div>
              <div>
                <VcCheckbox
                  v-for="status in SellerProductStatus"
                  :key="status"
                  class="tw-mb-2"
                  :modelValue="isItemSelected(status)"
                  @update:modelValue="selectFilterItem($event, status)"
                  >{{ $t("PRODUCTS.PAGES.LIST.FILTERS.STATUS." + status) }}</VcCheckbox
                >
              </div>
            </VcCol>
          </VcRow>
          <VcRow>
            <VcCol class="tw-p-2">
              <div class="tw-flex tw-justify-end">
                <VcButton
                  outline
                  class="tw-mr-4"
                  @click="resetFilters(closePanel)"
                  :disabled="applyFiltersReset"
                  >{{ $t("PRODUCTS.PAGES.LIST.FILTERS.RESET_FILTERS") }}</VcButton
                >
                <VcButton
                  @click="applyFilters(closePanel)"
                  :disabled="applyFiltersDisable"
                  >{{ $t("PRODUCTS.PAGES.LIST.FILTERS.APPLY") }}</VcButton
                >
              </div>
            </VcCol>
          </VcRow>
        </VcContainer>
      </template>

      <!-- Not found template -->
      <template v-slot:notfound>
        <div class="tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-items-center tw-justify-center">
          <img :src="emptyImage" />
          <div class="tw-m-4 tw-text-xl tw-font-medium">
            {{ $t("PRODUCTS.PAGES.LIST.NOT_FOUND.EMPTY") }}
          </div>
          <VcButton @click="resetSearch">{{ $t("PRODUCTS.PAGES.LIST.NOT_FOUND.RESET") }}</VcButton>
        </div>
      </template>

      <!-- Empty template -->
      <template v-slot:empty>
        <div class="tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-items-center tw-justify-center">
          <img :src="emptyImage" />
          <div class="tw-m-4 tw-text-xl tw-font-medium">
            {{ $t("PRODUCTS.PAGES.LIST.EMPTY.NO_PRODUCTS") }}
          </div>
          <VcButton @click="addProduct">{{ $t("PRODUCTS.PAGES.LIST.EMPTY.ADD") }}</VcButton>
        </div>
      </template>

      <!-- Override name column template -->
      <template v-slot:item_name="itemData">
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
      <template v-slot:item_status="itemData">
        <mp-product-status
          :status="itemData.item.status"
          class="tw-mb-1"
        />
      </template>

      <template v-slot:mobile-item="itemData">
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
                <VcHint>{{ $t("PRODUCTS.PAGES.LIST.MOBILE.EAN_GTIN") }}</VcHint>
                <div class="tw-truncate tw-mt-1">
                  {{ itemData.item.productData && (itemData.item.productData as Record<"gtin", string>).gtin }}
                </div>
              </div>
              <div class="tw-truncate tw-grow tw-basis-0 tw-mr-2">
                <VcHint>{{ $t("PRODUCTS.PAGES.LIST.MOBILE.CREATED") }}</VcHint>
                <div class="tw-truncate tw-mt-1">
                  {{ itemData.item.createdDate && moment(itemData.item.createdDate).fromNow() }}
                </div>
              </div>
              <div class="tw-truncate tw-grow tw-basis-0 tw-mr-2">
                <div class="tw-flex tw-flex-col tw-items-center">
                  <VcHint>{{ $t("PRODUCTS.PAGES.LIST.MOBILE.PUBLISHED") }}</VcHint>
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
import { computed, defineComponent, onMounted, reactive, ref, watch, shallowRef, unref, inject } from "vue";
import { useI18n } from "vue-i18n";

export default defineComponent({
  url: "/products",
});
</script>

<script lang="ts" setup>
import { IBladeEvent, IBladeToolbar, useFunctions, IActionBuilderResult, ITableColumns } from "@vc-shell/framework";
import moment from "moment";
import { ISellerProduct } from "../../../api_client/marketplacevendor";
import MpProductStatus from "../components/MpProductStatus.vue";
import { useProducts } from "../composables";
import ProductsEdit from "./products-edit.vue";
// eslint-disable-next-line import/no-unresolved
import emptyImage from "/assets/empty.png";

export interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
}

export interface Emits {
  (event: "close:blade"): void;
  (event: "collapse:blade"): void;
  (event: "expand:blade"): void;
  (event: "close:children"): void;
  (event: "open:blade", blade: IBladeEvent): void;
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
  param: undefined,
});

const emit = defineEmits<Emits>();
const { debounce } = useFunctions();
const { t } = useI18n({ useScope: "global" });

const isDesktop = inject("isDesktop");

const {
  products,
  totalCount,
  pages,
  currentPage,
  loadProducts,
  deleteProducts,
  loading,
  searchQuery,
  SellerProductStatus,
  exportCategories,
} = useProducts();
const filter = reactive<{
  status?: string[];
}>({ status: [] });
const appliedFilter = ref({});

const sort = ref("createdDate:DESC");
const searchValue = ref();
const selectedItemId = ref();
const selectedProductIds = ref([]);
const applyFiltersDisable = computed(() => {
  const activeFilters = Object.values(filter).filter((x) => x !== undefined && Array.isArray(x) && !!x.length);
  return !activeFilters.length;
});
const applyFiltersReset = computed(() => {
  const activeFilters = Object.values(appliedFilter.value).filter((x) => x !== undefined);
  return !activeFilters.length;
});

watch(sort, async (value) => {
  await loadProducts({ ...searchQuery.value, sort: value });
});

onMounted(async () => {
  selectedItemId.value = props.param;
  await loadProducts({ sort: sort.value });
});

const reload = async () => {
  console.debug("Products list reload");
  selectedProductIds.value = [];
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
    title: computed(() => t("PRODUCTS.PAGES.LIST.TOOLBAR.REFRESH")),
    icon: "fas fa-sync-alt",
    async clickHandler() {
      await reload();
    },
  },
  {
    id: "add",
    title: computed(() => t("PRODUCTS.PAGES.LIST.TOOLBAR.ADD")),
    icon: "fas fa-plus",
    async clickHandler() {
      emit("open:blade", {
        descendantBlade: shallowRef(ProductsEdit),
      });
    },
  },
  {
    id: "export",
    title: computed(() => t("PRODUCTS.PAGES.LIST.TOOLBAR.EXPORT_CATEGORIES")),
    icon: "fas fa-file-export",
    async clickHandler() {
      await exportCategories();
    },
  },
  {
    id: "deleteSelected",
    title: computed(() => t("PRODUCTS.PAGES.LIST.TOOLBAR.DELETE")),
    icon: "fas fa-trash",
    async clickHandler() {
      //TODO: replace to confirmation dialog from UI library
      if (
        window.confirm(
          unref(
            computed(() =>
              t("PRODUCTS.PAGES.LIST.DELETE_SELECTED_CONFIRMATION", {
                count: selectedProductIds.value.length,
              })
            )
          )
        )
      ) {
        emit("close:children");
        await deleteProducts(selectedProductIds.value);
        if (searchQuery.value.skip >= searchQuery.value.take) {
          searchQuery.value.skip -= searchQuery.value.take;
        }
        await reload();
      }
    },
    disabled: computed(() => !selectedProductIds.value?.length),
    isVisible: isDesktop,
  },
]);

const tableColumns = ref<ITableColumns[]>([
  {
    id: "imgSrc",
    title: computed(() => t("PRODUCTS.PAGES.LIST.TABLE.HEADER.IMAGE")),
    width: "60px",
    type: "image",
  },
  {
    id: "name",
    title: computed(() => t("PRODUCTS.PAGES.LIST.TABLE.HEADER.NAME")),
    sortable: true,
    width: "100px",
    alwaysVisible: true,
  },
  {
    id: "createdDate",
    title: computed(() => t("PRODUCTS.PAGES.LIST.TABLE.HEADER.CREATED_DATE")),
    width: "140px",
    sortable: true,
    type: "date-ago",
  },
  {
    id: "isPublished",
    title: computed(() => t("PRODUCTS.PAGES.LIST.TABLE.HEADER.PUBLISHED")),
    type: "status-icon",
    width: "180px",
    align: "center",
    sortable: true,
  },
  {
    id: "status",
    title: computed(() => t("PRODUCTS.PAGES.LIST.TABLE.HEADER.STATUS")),
    width: "180px",
    sortable: true,
    alwaysVisible: true,
  },
  {
    id: "gtin",
    field: "productData.gtin",
    title: computed(() => t("PRODUCTS.PAGES.LIST.TABLE.HEADER.GTIN")),
    width: "180px",
    alwaysVisible: true,
  },
]);

const title = computed(() => t("PRODUCTS.PAGES.LIST.TITLE"));
const activeFilterCount = computed(() => Object.values(appliedFilter.value).filter((item) => !!item).length);

const onItemClick = (item: { id: string }) => {
  emit("open:blade", {
    descendantBlade: shallowRef(ProductsEdit),
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

const onSelectionChanged = (items: ISellerProduct[]) => {
  selectedProductIds.value = items.map((item) => item.id);
};

const actionBuilder = (product: ISellerProduct): IActionBuilderResult[] => {
  let result = [];

  // const statuses =
  //   product.status?.split(",").map((item) => item.trim()) || [];

  /*if (statuses.includes("Published")) {
        result.push({
          icon: "fas fa-times",
          title: computed(() => t("PRODUCTS.PAGES.LIST.ACTIONS.UNPUBLISH")),
          variant: "danger",
          clickHandler() {
            alert("Unpublish");
          },
        });
      } else {
        result.push({
          icon: "fas fa-check",
          title: computed(() => t("PRODUCTS.PAGES.LIST.ACTIONS.PUBLISH")),
          variant: "success",
          clickHandler() {
            alert("Publish");
          },
        });
      }*/

  /*result.push(
        ...[
          {
            icon: "fas fa-clock",
            title: "Other action",
            clickHandler() {
              alert("Other action");
            },
          },
          {
            icon: "fas fa-clock",
            title: "Other action2",
            clickHandler() {
              alert("Other action");
            },
          },
        ]
      );*/

  result.push({
    icon: "fas fa-trash",
    title: computed(() => t("PRODUCTS.PAGES.LIST.ACTIONS.DELETE")),
    variant: "danger",
    leftActions: true,
    clickHandler(item: ISellerProduct) {
      if (!selectedProductIds.value.includes(item.id)) {
        selectedProductIds.value.push(item.id);
      }
      removeProducts();
      selectedProductIds.value = [];
    },
  });

  return result;
};

async function removeProducts() {
  //TODO: replace to confirmation dialog from UI library
  if (
    window.confirm(
      t("PRODUCTS.PAGES.LIST.DELETE_SELECTED_CONFIRMATION", {
        count: selectedProductIds.value.length,
      })
    )
  ) {
    emit("close:children");
    await deleteProducts(selectedProductIds.value);
    await reload();
  }
}

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
  emit("open:blade", {
    descendantBlade: shallowRef(ProductsEdit),
  });
}

async function applyFilters(filterHandlerFn: () => void) {
  filterHandlerFn();
  await loadProducts({
    ...searchQuery.value,
    ...filter,
  });
  appliedFilter.value = {
    ...filter,
  };
}
async function resetFilters(filterHandlerFn: () => void) {
  filterHandlerFn();
  Object.keys(filter).forEach((key: string) => (filter[key] = undefined));
  await loadProducts({
    ...searchQuery.value,
    ...filter,
  });
  appliedFilter.value = {};
}

function selectFilterItem(e: boolean, status: string) {
  const isSelected = filter.status?.includes(status);

  if (!Array.isArray(filter.status)) {
    filter.status = [];
  }

  if (e && !isSelected) {
    filter.status?.push(status);
  } else if (!e && isSelected) {
    filter.status = filter.status.filter((x) => x !== status);
  }
}

function isItemSelected(status: string) {
  return filter.status?.some((x) => x === status);
}

defineExpose({
  reload,
  title,
});
</script>
