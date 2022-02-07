<docs>
About component.
</docs>

<template>
  <vc-blade
    :title="$t('PRODUCTS.PAGES.LIST.TITLE')"
    :expanded="expanded"
    :closable="closable"
    width="50%"
    :toolbarItems="bladeToolbar"
    @close="$emit('page:close')"
  >
    <!-- Blade contents -->
    <vc-table
      class="vc-flex-grow_1"
      :loading="loading"
      :expanded="expanded"
      :multiselect="true"
      :columns="columns"
      :items="products"
      :itemActionBuilder="actionBuilder"
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
    >
      <!-- Filters -->
      <template v-slot:filters>
        <h2 v-if="$isMobile.value">
          {{ $t("PRODUCTS.PAGES.LIST.FILTERS.TITLE") }}
        </h2>
        <vc-container no-padding>
          <vc-row>
            <vc-col class="filter-col vc-padding_s">
              <div class="group-title">
                {{ $t("PRODUCTS.PAGES.LIST.FILTERS.STATUS_FILTER") }}
              </div>
              <div>
                <vc-checkbox
                  v-for="status in SellerProductStatus"
                  :key="status"
                  class="vc-margin-bottom_s"
                  :modelValue="filter.status === status"
                  @update:modelValue="
                    filter.status = $event ? status : undefined
                  "
                  >{{ status }}</vc-checkbox
                >
              </div>
            </vc-col>
            <vc-col class="filter-col vc-padding_s">
              <div class="group-title">
                {{ $t("PRODUCTS.PAGES.LIST.FILTERS.PRICE_BETWEEN.TITLE") }}
              </div>
              <div>
                <vc-input
                  :label="$t('PRODUCTS.PAGES.LIST.FILTERS.PRICE_BETWEEN.FROM')"
                  class="vc-margin-bottom_m"
                  :modelValue="filter.priceStart"
                  @update:modelValue="filter.priceStart = $event"
                ></vc-input>
                <vc-input
                  :label="$t('PRODUCTS.PAGES.LIST.FILTERS.PRICE_BETWEEN.TO')"
                  :modelValue="filter.priceEnd"
                  @update:modelValue="filter.priceEnd = $event"
                ></vc-input>
              </div>
            </vc-col>
            <vc-col class="filter-col vc-padding_s">
              <div class="group-title">
                {{ $t("PRODUCTS.PAGES.LIST.FILTERS.CREATED_DATE.TITLE") }}
              </div>
              <div>
                <vc-input
                  :label="
                    $t('PRODUCTS.PAGES.LIST.FILTERS.CREATED_DATE.START_DATE')
                  "
                  type="date"
                  class="vc-margin-bottom_m"
                ></vc-input>
                <vc-input
                  :label="
                    $t('PRODUCTS.PAGES.LIST.FILTERS.CREATED_DATE.END_DATE')
                  "
                  type="date"
                ></vc-input>
              </div>
            </vc-col>
          </vc-row>
          <vc-row>
            <vc-col class="vc-padding_s">
              <div class="vc-flex vc-flex-justify_end">
                <vc-button
                  outline
                  class="vc-margin-right_l"
                  @click="resetFilters"
                  >{{
                    $t("PRODUCTS.PAGES.LIST.FILTERS.RESET_FILTERS")
                  }}</vc-button
                >
                <vc-button @click="applyFilters">{{
                  $t("PRODUCTS.PAGES.LIST.FILTERS.APPLY")
                }}</vc-button>
              </div>
            </vc-col>
          </vc-row>
        </vc-container>
      </template>

      <!-- Not found template -->
      <template v-slot:notfound>
        <div
          class="
            vc-fill_all
            vc-flex vc-flex-column
            vc-flex-align_center
            vc-flex-justify_center
          "
        >
          <img src="/assets/empty-product.png" />
          <div class="vc-margin_l vc-font-size_xl vc-font-weight_medium">
            {{ $t("PRODUCTS.PAGES.LIST.NOT_FOUND.EMPTY") }}
          </div>
          <vc-button @click="resetSearch">{{
            $t("PRODUCTS.PAGES.LIST.NOT_FOUND.RESET")
          }}</vc-button>
        </div>
      </template>

      <!-- Empty template -->
      <template v-slot:empty>
        <div
          class="
            vc-fill_all
            vc-flex vc-flex-column
            vc-flex-align_center
            vc-flex-justify_center
          "
        >
          <img src="/assets/empty-product.png" />
          <div class="vc-margin_l vc-font-size_xl vc-font-weight_medium">
            {{ $t("PRODUCTS.PAGES.LIST.EMPTY.NO_PRODUCTS") }}
          </div>
          <vc-button @click="addProduct">{{
            $t("PRODUCTS.PAGES.LIST.EMPTY.ADD")
          }}</vc-button>
        </div>
      </template>

      <!-- Override name column template -->
      <template v-slot:item_name="itemData">
        <div class="vc-flex vc-flex-column">
          <div class="vc-ellipsis">{{ itemData.item.name }}</div>
          <vc-hint class="vc-ellipsis vc-margin-top_xs">
            {{ itemData.item.path }}
          </vc-hint>
        </div>
      </template>

      <!-- Override status column template -->
      <template v-slot:item_status="itemData">
        <mp-product-status
          :status="itemData.item.status"
          class="vc-margin-bottom_xs"
        />
      </template>

      <template v-slot:mobile-item="itemData">
        <div
          class="products-list__mobile-item vc-padding_m vc-flex vc-flex-nowrap"
        >
          <vc-image
            class="vc-flex-shrink_0"
            aspect="1x1"
            size="m"
            :bordered="true"
            :src="itemData.item.imgSrc"
          />
          <div class="vc-flex-grow_1 vc-margin-left_m">
            <div class="vc-font-weight_bold vc-font-size_l">
              {{ itemData.item.name }}
            </div>
            <vc-hint class="vc-margin-top_xs">{{ itemData.item.path }}</vc-hint>
            <div class="vc-margin-top_s vc-margin-bottom_m">
              <mp-product-status :status="itemData.item.status" />
            </div>
            <div
              class="
                vc-margin-top_m
                vc-fill_width
                vc-flex
                vc-flex-justify_space-between
              "
            >
              <div class="vc-ellipsis vc-flex-grow_1">
                <vc-hint>{{
                  $t("PRODUCTS.PAGES.LIST.MOBILE.EAN_GTIN")
                }}</vc-hint>
                <div class="vc-ellipsis vc-margin-top_xs">
                  {{
                    itemData.item.productData && itemData.item.productData.gtin
                  }}
                </div>
              </div>
              <div class="vc-ellipsis vc-flex-grow_1">
                <vc-hint>{{
                  $t("PRODUCTS.PAGES.LIST.MOBILE.CREATED")
                }}</vc-hint>
                <div class="vc-ellipsis vc-margin-top_xs">
                  {{
                    itemData.item.createdDate &&
                    moment(itemData.item.createdDate).fromNow()
                  }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </vc-table>
  </vc-blade>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  onMounted,
  computed,
  watch,
  reactive,
} from "vue";
import { useI18n, useLogger, useFunctions } from "@virtoshell/core";
import { useProducts } from "../composables";
import MpProductStatus from "../components/MpProductStatus.vue";
import ProductsEdit from "./products-edit.vue";
import moment from "moment";
import {
  IActionBuilderResult,
  ITableColumns,
  IBladeToolbar,
} from "../../../types";
import { ISellerProduct } from "../../../api_client";

export default defineComponent({
  url: "products",

  components: {
    MpProductStatus,
  },

  props: {
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

    options: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props, { emit }) {
    const logger = useLogger();
    const { debounce } = useFunctions();
    const { t } = useI18n();
    const {
      products,
      totalCount,
      pages,
      currentPage,
      loadProducts,
      loading,
      searchQuery,
      SellerProductStatus,
    } = useProducts();
    const filter = reactive<{
      status?: string;
      priceStart?: string;
      priceEnd?: string;
    }>({});
    const appliedFilter = ref({});

    const sort = ref("createdDate:DESC");
    const searchValue = ref();
    const selectedItemId = ref();

    watch(sort, async (value) => {
      await loadProducts({ ...searchQuery.value, sort: value });
    });

    onMounted(async () => {
      selectedItemId.value = props.param;
      await loadProducts({ sort: sort.value });
    });

    const reload = async () => {
      logger.debug("Products list reload");
      await loadProducts({
        ...searchQuery.value,
        skip: (currentPage.value - 1) * searchQuery.value.take,
        sort: sort.value,
      });
    };

    const onSearchList = debounce(async (keyword: string) => {
      logger.debug(`Products list search by ${keyword}`);
      searchValue.value = keyword;
      await loadProducts({
        ...searchQuery.value,
        keyword,
      });
    }, 200);

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
          emit("page:open", {
            component: ProductsEdit,
          });
        },
      },
      {
        id: "batchDelete",
        title: computed(() => t("PRODUCTS.PAGES.LIST.TOOLBAR.BULK_DELETE")),
        icon: "fas fa-trash",
        disabled: true,
        async clickHandler() {
          logger.debug("Delete selected products");
        },
      },
    ]);

    const columns = ref<ITableColumns[]>([
      {
        id: "imgSrc",
        title: computed(() => t("PRODUCTS.PAGES.LIST.TABLE.HEADER.IMAGE")),
        width: 60,
        alwaysVisible: true,
        type: "image",
      },
      {
        id: "name",
        title: computed(() => t("PRODUCTS.PAGES.LIST.TABLE.HEADER.NAME")),
        sortable: true,
        alwaysVisible: true,
      },
      {
        id: "createdDate",
        title: computed(() =>
          t("PRODUCTS.PAGES.LIST.TABLE.HEADER.CREATED_DATE")
        ),
        width: 140,
        sortable: true,
        type: "date-ago",
      },
      {
        id: "isPublished",
        title: computed(() => t("PRODUCTS.PAGES.LIST.TABLE.HEADER.PUBLISHED")),
        type: "status-icon",
        width: 180,
        align: "center",
        sortable: true,
      },
      {
        id: "status",
        title: computed(() => t("PRODUCTS.PAGES.LIST.TABLE.HEADER.STATUS")),
        width: 180,
        sortable: true,
      },
      {
        id: "gtin",
        field: "productData.gtin",
        title: computed(() => t("PRODUCTS.PAGES.LIST.TABLE.HEADER.GTIN")),
        width: 180,
        sortable: true,
        alwaysVisible: true,
      },
    ]);

    const onItemClick = (item: { id: string }) => {
      emit("page:open", {
        component: ProductsEdit,
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
      const sortBy = [":ASK", ":DESC", ""];
      if (item.sortable) {
        item.sortDirection = (item.sortDirection ?? 0) + 1;
        sort.value = `${item.id}${sortBy[item.sortDirection % 3]}`;
      }
    };

    const onPaginationClick = async (page: number) => {
      await loadProducts({
        ...searchQuery.value,
        skip: (page - 1) * searchQuery.value.take,
      });
    };

    const actionBuilder = (product: ISellerProduct): IActionBuilderResult[] => {
      let result = [];

      const statuses =
        product.status?.split(",").map((item) => item.trim()) || [];

      if (statuses.includes("Published")) {
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
      }

      result.push({
        icon: "fas fa-trash",
        title: "Delete",
        variant: "danger",
        leftActions: true,
        clickHandler(item: ISellerProduct) {
          alert("Delete " + item.id);
        },
      });

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

      return result;
    };

    return {
      loading,
      bladeToolbar,
      columns: computed(() => {
        if (props.expanded) {
          return columns.value;
        } else {
          return columns.value.filter((item) => item.alwaysVisible === true);
        }
      }),
      searchQuery,
      products,
      actionBuilder,
      totalCount,
      pages,
      currentPage,
      sort,
      moment,
      reload,
      selectedItemId,
      async resetSearch() {
        searchValue.value = "";
        Object.keys(filter).forEach((key: string) => (filter[key] = undefined));
        await loadProducts({
          ...searchQuery.value,
          ...filter,
          keyword: "",
        });
        appliedFilter.value = {};
      },
      addProduct() {
        emit("page:open", {
          component: ProductsEdit,
        });
      },
      onItemClick,
      onHeaderClick,
      onPaginationClick,
      searchValue,
      onSearchList,
      title: computed(() => t("PRODUCTS.PAGES.LIST.TITLE")),
      filter,
      SellerProductStatus,
      activeFilterCount: computed(
        () => Object.values(appliedFilter.value).filter((item) => !!item).length
      ),
      async applyFilters() {
        await loadProducts({
          ...searchQuery.value,
          ...filter,
        });
        appliedFilter.value = {
          ...filter,
        };
      },
      async resetFilters() {
        Object.keys(filter).forEach((key: string) => (filter[key] = undefined));
        await loadProducts({
          ...searchQuery.value,
          ...filter,
        });
        appliedFilter.value = {};
      },
    };
  },
});
</script>

<style lang="less">
.products-list {
  &__mobile-item {
    border-bottom: 1px solid #e3e7ec;
  }
}

.group-title {
  margin-bottom: var(--margin-l);
  color: #a1c0d4;
  font-weight: var(--font-weight-bold);
  font-size: 17px;
}

.filter-col {
  width: 180px;
}
</style>
