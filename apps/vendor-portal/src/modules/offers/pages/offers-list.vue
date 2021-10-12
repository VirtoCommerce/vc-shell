<template>
  <vc-blade
    :title="$t('OFFERS.PAGES.LIST.TITLE')"
    width="50%"
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
      :items="offers"
      :sort="sort"
      :pages="pages"
      :currentPage="currentPage"
      :searchValue="searchValue"
      @searchValueChanged="onSearchList"
      :searchPlaceholder="$t('OFFERS.PAGES.LIST.SEARCH.PLACEHOLDER')"
      :totalLabel="$t('OFFERS.PAGES.LIST.TABLE.TOTALS')"
      :totalCount="totalCount"
      @itemClick="onItemClick"
      @headerClick="onHeaderClick"
      @paginationClick="onPaginationClick"
    >
      <!-- Override sellerName column template -->
      <template v-slot:item_name="itemData">
        <div class="vc-flex vc-flex-column">
          <div class="vc-ellipsis">{{ itemData.item.name }}</div>
          <vc-hint class="vc-ellipsis">{{ itemData.item.name }}</vc-hint>
        </div>
      </template>

      <!-- Override image column template -->
      <template v-slot:item_image="itemData">
        <vc-image
          :bordered="true"
          size="s"
          aspect="1x1"
          :src="itemData.item.imgSrc"
        ></vc-image>
      </template>

      <!-- Override createdDate column template -->
      <template v-slot:item_createdDate="itemData">
        {{ moment(itemData.item.createdDate).fromNow() }}
      </template>

      <!-- Override listPrice column template -->
      <template v-slot:item_listPrice="itemData">
        {{ itemData.item.listPrice?.toFixed(2) }}
      </template>

      <!-- Override salePrice column template -->
      <template v-slot:item_salePrice="itemData">
        {{ itemData.item.salePrice?.toFixed(2) }}
      </template>

      <template v-slot:mobile-item="itemData">
        <div
          class="
            offers-list__mobile-item
            vc-padding-vertical_m
            vc-padding-horizontal_l
          "
        >
          <div class="vc-fill_width vc-flex vc-flex-justify_evenly">
            <vc-image
              class="vc-flex-shrink_0"
              aspect="1x1"
              size="s"
              :bordered="true"
              :src="itemData.item.imgSrc"
            ></vc-image>
            <div class="vc-flex-grow_1 vc-margin-left_m">
              <div class="vc-font-weight_bold vc-font-size_l">
                {{ itemData.item.name }}
              </div>
              <vc-hint class="vc-margin-top_xs">
                {{ itemData.item.name }}
              </vc-hint>
            </div>
          </div>
          <div
            class="
              vc-margin-top_m
              vc-fill_width
              vc-flex
              vc-flex-justify_space-between
            "
          >
            <div class="vc-ellipsis vc-flex-grow_2">
              <vc-hint>SKU</vc-hint>
              <div class="vc-ellipsis vc-margin-top_xs">
                {{ itemData.item.sku }}
              </div>
            </div>
            <div class="vc-ellipsis vc-flex-grow_2">
              <vc-hint>Offer #</vc-hint>
              <div class="vc-ellipsis vc-margin-top_xs">
                {{ itemData.item.id }}
              </div>
            </div>
            <div class="vc-ellipsis vc-flex-grow_1">
              <vc-hint>Quantity</vc-hint>
              <div class="vc-ellipsis vc-margin-top_xs">
                {{ itemData.item.qty }}
              </div>
            </div>
          </div>
          <div
            class="
              vc-margin-top_m
              vc-fill_width
              vc-flex
              vc-flex-justify_space-between
            "
          >
            <div class="vc-ellipsis vc-flex-grow_2">
              <vc-hint>List price</vc-hint>
              <div class="vc-ellipsis vc-margin-top_xs">
                {{
                  itemData.item.listPrice && itemData.item.listPrice.toFixed(2)
                }}
              </div>
            </div>
            <div class="vc-ellipsis vc-flex-grow_2">
              <vc-hint>Sale price</vc-hint>
              <div class="vc-ellipsis vc-margin-top_xs">
                {{
                  itemData.item.salePrice && itemData.item.salePrice.toFixed(2)
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
      </template>
    </vc-table>
  </vc-blade>
</template>

<script lang="ts">
import { defineComponent, watch, onMounted, ref, computed } from "vue";
import { useI18n, useFunctions, useLogger } from "@virtoshell/core";
import { useOffers } from "../composables";
import moment from "moment";
import OffersDetails from "./offers-details.vue";

export default defineComponent({
  url: "offers",

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
    } = useOffers();

    const sort = ref("createdDate");
    const searchValue = ref();

    watch(sort, async (value) => {
      await loadOffers({ ...searchQuery.value, sort: value });
    });

    onMounted(async () => {
      await loadOffers({
        sort: sort.value,
        productId: props.options?.productId,
      });
    });

    const reload = async () => {
      await loadOffers({
        ...searchQuery.value,
        skip: (currentPage.value - 1) * searchQuery.value.take,
        sort: sort.value,
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

    const bladeToolbar = [
      {
        id: "refresh",
        title: t("OFFERS.PAGES.LIST.TOOLBAR.REFRESH"),
        icon: "fas fa-sync-alt",
        async clickHandler() {
          await reload();
        },
      },
      {
        id: "add",
        title: t("OFFERS.PAGES.LIST.TOOLBAR.ADD"),
        icon: "fas fa-plus",
        async clickHandler() {
          emit("page:open", {
            component: OffersDetails,
          });
        },
      },
      {
        id: "batchArchive",
        title: t("OFFERS.PAGES.LIST.TOOLBAR.BULK_ARCHIVE"),
        icon: "fas fa-archive",
        disabled: true,
      },
    ];

    const columns = ref([
      {
        id: "image",
        field: "image",
        title: t("OFFERS.PAGES.LIST.TABLE.HEADER.PRODUCT_IMAGE"),
        width: 60,
        alwaysVisible: true,
      },
      {
        id: "name",
        field: "name",
        title: t("OFFERS.PAGES.LIST.TABLE.HEADER.PRODUCT_NAME"),
        sortable: true,
        alwaysVisible: true,
      },
      {
        id: "createdDate",
        title: t("OFFERS.PAGES.LIST.TABLE.HEADER.CREATED_DATE"),
        width: 140,
        sortable: true,
      },
      {
        id: "sku",
        title: t("OFFERS.PAGES.LIST.TABLE.HEADER.SKU"),
        width: 120,
        sortable: true,
        alwaysVisible: true,
      },
      {
        id: "salePrice",
        title: t("OFFERS.PAGES.LIST.TABLE.HEADER.SALE_PRICE"),
        width: 100,
        sortable: true,
      },
      {
        id: "listPrice",
        title: t("OFFERS.PAGES.LIST.TABLE.HEADER.LIST_PRICE"),
        width: 100,
        sortable: true,
        alwaysVisible: true,
      },
      {
        id: "minQuantity",
        title: t("OFFERS.PAGES.LIST.TABLE.HEADER.MIN_QTY"),
        width: 80,
        sortable: true,
      },
      {
        id: "inStockQuantity",
        title: t("OFFERS.PAGES.LIST.TABLE.HEADER.QTY"),
        width: 80,
        sortable: true,
        alwaysVisible: true,
      },
    ]);

    const empty = {
      image: "/assets/empty-product.png",
      text: "There are no offers yet",
      action: "Add offer",
      clickHandler: () => {
        emit("page:open", {
          component: OffersDetails,
        });
      },
    };

    const notfound = {
      image: "/assets/empty-product.png",
      text: "No offers found.",
      action: "Reset search",
      clickHandler: async () => {
        searchValue.value = "";
        await loadOffers({
          ...searchQuery.value,
          keyword: "",
        });
      },
    };

    const onItemClick = (item: { id: string }) => {
      emit("page:open", {
        component: OffersDetails,
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
      await loadOffers({
        ...searchQuery.value,
        skip: (page - 1) * searchQuery.value.take,
      });
    };

    return {
      bladeToolbar,
      empty,
      notfound,
      columns: computed(() => {
        if (props.expanded) {
          return columns.value;
        } else {
          return columns.value.filter((item) => item.alwaysVisible === true);
        }
      }),
      loading,
      offers,
      totalCount,
      pages,
      currentPage,
      sort,
      moment,
      searchValue,
      onSearchList,
      onItemClick,
      onHeaderClick,
      onPaginationClick,
      reload: async () => {
        loading.value = true;
        await loadOffers({ ...searchQuery.value });
        loading.value = false;
      },
      title: t("OFFERS.PAGES.LIST.TITLE"),
    };
  },
});
</script>

<style lang="less">
.offers-list {
  &__mobile-item {
    border-bottom: 1px solid #e3e7ec;
  }
}
</style>
