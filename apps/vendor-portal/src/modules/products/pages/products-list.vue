<template>
  <vc-blade
    :title="$t('PRODUCTS.PAGES.LIST.TITLE')"
    :expanded="expanded"
    :closable="closable"
    :toolbarItems="bladeToolbar"
    @close="$emit('page:close')"
  >
    <!-- Blade contents -->
    <vc-table
      :loading="loading"
      :expanded="expanded"
      :empty="empty"
      :notfound="notfound"
      class="vc-flex-grow_1"
      :multiselect="true"
      :columns="columns"
      :items="products"
      :itemActionBuilder="actionBuilder"
      :filterItems="filterItems"
      :sort="sort"
      :pages="pages"
      :currentPage="currentPage"
      :searchPlaceholder="$t('PRODUCTS.PAGES.LIST.SEARCH.PLACEHOLDER')"
      :totalLabel="$t('PRODUCTS.PAGES.LIST.TABLE.TOTALS')"
      :searchValue="searchValue"
      @search:change="onSearchList"
      :totalCount="totalCount"
      @itemClick="onItemClick"
      @headerClick="onHeaderClick"
      @paginationClick="onPaginationClick"
    >
      <!-- Override name column template -->
      <template v-slot:item_name="itemData">
        <div class="vc-flex vc-flex-column">
          <div class="vc-ellipsis">{{ itemData.item.name }}</div>
          <vc-hint class="vc-ellipsis vc-margin-top_xs">
            {{ itemData.item.path }}
          </vc-hint>
        </div>
      </template>

      <!-- Override image column template -->
      <template v-slot:item_image="itemData">
        <vc-image
          :bordered="true"
          size="s"
          aspect="1x1"
          :src="itemData.item.imgSrc"
        />
      </template>

      <!-- Override status column template -->
      <template v-slot:item_status="itemData">
        <mp-product-status :status="itemData.item.status" />
      </template>

      <!-- Override createdDate column template -->
      <template v-slot:item_createdDate="itemData">
        {{ moment(itemData.item.createdDate).fromNow() }}
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
                <vc-hint>EAN/GTIN</vc-hint>
                <div class="vc-ellipsis vc-margin-top_xs">
                  {{
                    itemData.item.productData && itemData.item.productData.gtin
                  }}
                </div>
              </div>
              <div class="vc-ellipsis vc-flex-grow_1">
                <vc-hint>Created</vc-hint>
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
    } = useProducts();

    const sort = ref("createdDate");
    const searchValue = ref();

    watch(sort, async (value) => {
      await loadProducts({ ...searchQuery.value, sort: value });
    });

    onMounted(async () => {
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

    const bladeToolbar = [
      {
        id: "refresh",
        title: t("PRODUCTS.PAGES.LIST.TOOLBAR.REFRESH"),
        icon: "fas fa-sync-alt",
        async clickHandler() {
          await reload();
        },
      },
      {
        id: "add",
        title: t("PRODUCTS.PAGES.LIST.TOOLBAR.ADD"),
        icon: "fas fa-plus",
        async clickHandler() {
          emit("page:open", {
            component: ProductsEdit,
          });
        },
      },
      {
        id: "batchDelete",
        title: t("PRODUCTS.PAGES.LIST.TOOLBAR.BULK_DELETE"),
        icon: "fas fa-trash",
        disabled: true,
        async clickHandler() {
          logger.debug("Delete selected products");
        },
      },
    ];

    const columns = ref([
      {
        id: "image",
        title: t("PRODUCTS.PAGES.LIST.TABLE.HEADER.IMAGE"),
        width: 60,
        alwaysVisible: true,
      },
      {
        id: "name",
        title: t("PRODUCTS.PAGES.LIST.TABLE.HEADER.NAME"),
        sortable: true,
        alwaysVisible: true,
      },
      {
        id: "createdDate",
        title: t("PRODUCTS.PAGES.LIST.TABLE.HEADER.CREATED_DATE"),
        width: 140,
        sortable: true,
      },
      {
        id: "status",
        title: t("PRODUCTS.PAGES.LIST.TABLE.HEADER.STATUS"),
        width: 180,
        sortable: true,
      },
      {
        id: "gtin",
        field: "productData.gtin",
        title: t("PRODUCTS.PAGES.LIST.TABLE.HEADER.GTIN"),
        width: 180,
        sortable: true,
        alwaysVisible: true,
      },
    ]);

    const empty = {
      image: "/assets/empty-product.png",
      text: "There are no products yet",
      action: "Add product",
      clickHandler: () => {
        emit("page:open", {
          component: ProductsEdit,
        });
      },
    };

    const notfound = {
      image: "/assets/empty-product.png",
      text: "No products found.",
      action: "Reset search",
      clickHandler: async () => {
        searchValue.value = "";
        await loadProducts({
          ...searchQuery.value,
          keyword: "",
        });
      },
    };

    const onItemClick = (item: { id: string }) => {
      emit("page:open", {
        component: ProductsEdit,
        param: item.id,
      });
    };

    const onHeaderClick = (item) => {
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

    const filterItems = [
      {
        title: "Status",
        type: "multi",
        options: [
          { label: "Saved" },
          { label: "Active" },
          { label: "Archived" },
          { label: "Future" },
        ],
      },
      { title: "Created date", type: "date" },
    ];

    const actionBuilder = (product) => {
      let result = [];

      if (product.status === "Published") {
        result.push({
          icon: "fas fa-times",
          title: "Unpublish",
          variant: "danger",
          clickHandler() {
            alert("Unpublish");
          },
        });
      } else {
        result.push({
          icon: "fas fa-check",
          title: "Publish",
          variant: "success",
          clickHandler() {
            alert("Publish");
          },
        });
      }

      result.push(
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
      );

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
      filterItems,
      searchQuery,
      products,
      actionBuilder,
      totalCount,
      pages,
      currentPage,
      sort,
      empty,
      notfound,
      moment,
      reload,
      onItemClick,
      onHeaderClick,
      onPaginationClick,
      searchValue,
      onSearchList,
      title: t("PRODUCTS.PAGES.LIST.TITLE"),
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
</style>
