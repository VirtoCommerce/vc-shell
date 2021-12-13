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
                {{ itemData.item.inStockQuantity }}
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
import {
  defineComponent,
  watch,
  onMounted,
  ref,
  computed,
  reactive,
} from "vue";
import { useI18n, useFunctions, useLogger } from "@virtoshell/core";
import { useOffers } from "../composables";
import moment from "moment";
import OffersDetails from "./offers-details.vue";
import {
  IActionBuilderResult,
  ITableColumns,
  IToolbarItems,
} from "../../../types";
import { IOffer } from "../../../api_client";

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
      deleteOffers,
    } = useOffers();

    const sort = ref("createdDate:DESC");
    const searchValue = ref();
    const selectedItemId = ref();
    const selectedOfferIds = ref([]);

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

    const bladeToolbar = reactive<IToolbarItems[]>([
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
        clickHandler() {
          addOffer();
        },
      },
      {
        id: "deleteSelected",
        title: t("OFFERS.PAGES.LIST.TOOLBAR.DELETE"),
        icon: "fas fa-trash",
        async clickHandler() {
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
        },
        disabled: computed(() => !selectedOfferIds.value?.length),
      },
    ]);

    const columns = ref<ITableColumns[]>([
      {
        id: "imgSrc",
        title: t("OFFERS.PAGES.LIST.TABLE.HEADER.PRODUCT_IMAGE"),
        width: 60,
        alwaysVisible: true,
        type: "image",
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
        type: "date-ago",
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
        type: "money",
      },
      {
        id: "listPrice",
        title: t("OFFERS.PAGES.LIST.TABLE.HEADER.LIST_PRICE"),
        width: 100,
        sortable: true,
        type: "money",
      },
      {
        id: "minQuantity",
        title: t("OFFERS.PAGES.LIST.TABLE.HEADER.MIN_QTY"),
        width: 80,
        sortable: true,
        type: "number",
      },
      {
        id: "inStockQuantity",
        title: t("OFFERS.PAGES.LIST.TABLE.HEADER.QTY"),
        width: 80,
        sortable: true,
        type: "number",
      },
    ]);

    const empty = {
      image: "/assets/empty-product.png",
      text: "There are no offers yet",
      action: "Add offer",
      clickHandler: () => {
        addOffer();
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
      console.log(selectedOfferIds.value);
    };

    const actionBuilder = (
      item: IOffer & { status: string }
    ): IActionBuilderResult[] => {
      let result = [];

      if (item.status === "Published") {
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

      return result;
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
      actionBuilder,
      totalCount,
      pages,
      currentPage,
      sort,
      moment,
      searchValue,
      selectedItemId,
      onSearchList,
      onItemClick,
      onHeaderClick,
      onPaginationClick,
      reload,
      onSelectionChanged,
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
