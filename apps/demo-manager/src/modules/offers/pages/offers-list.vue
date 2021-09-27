<template>
  <vc-blade
    :title="$t('OFFERS.PAGES.LIST.TITLE')"
    width="50%"
    :expanded="expanded"
    :closable="closable"
    :toolbarItems="bladeToolbar"
  >
    <!-- Blade contents -->
    <vc-table
      :loading="loading"
      :expanded="expanded"
      :empty="empty"
      class="vc-flex-grow_1"
      :multiselect="true"
      :columns="columns"
      :items="offers"
      :sort="sort"
      :pages="pages"
      :currentPage="currentPage"
      :searchPlaceholder="$t('OFFERS.PAGES.LIST.SEARCH.PLACEHOLDER')"
      :totalLabel="$t('OFFERS.PAGES.LIST.TABLE.TOTALS')"
      :totalCount="totalCount"
      @itemClick="onItemClick"
      @headerClick="onHeaderClick"
      @paginationClick="onPaginationClick"
    >
      <!-- Override sellerName column template -->
      <template v-slot:item_productName="itemData">
        <div class="vc-flex vc-flex-column">
          <div class="vc-ellipsis">{{ itemData.item.product.sellerName }}</div>
          <vc-hint class="vc-ellipsis">{{
            itemData.item.product.category
          }}</vc-hint>
        </div>
      </template>

      <!-- Override image column template -->
      <template v-slot:item_productImage="itemData">
        <vc-image
          :bordered="true"
          size="s"
          aspect="1x1"
          :src="itemData.item.product.image"
        ></vc-image>
      </template>

      <!-- Override status column template -->
      <template v-slot:item_status="itemData">
        <vc-status v-bind="statusStyle(itemData.item.status)">
          {{ itemData.item.status }}
        </vc-status>
      </template>

      <!-- Override createdDate column template -->
      <template v-slot:item_createdDate="itemData">
        {{ moment(itemData.item.createdDate).fromNow() }}
      </template>

      <!-- Override listPrice column template -->
      <template v-slot:item_listPrice="itemData">
        {{ itemData.item.listPrice.toFixed(2) }}
      </template>

      <!-- Override salePrice column template -->
      <template v-slot:item_salePrice="itemData">
        {{ itemData.item.salePrice.toFixed(2) }}
      </template>
    </vc-table>
  </vc-blade>
</template>

<script lang="ts">
import { defineComponent, watch, onMounted, ref, computed } from "vue";
import { useI18n } from "@virtoshell/core";
import { useOffers } from "../composables";
import moment from "moment";
import OffersDetails from "./offers-details.vue";

export default defineComponent({
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

    const loading = ref(false);
    const { offers, totalCount, pages, currentPage, loadOffers } = useOffers();

    const sort = ref("-createdDate");

    watch(sort, async (value) => {
      loading.value = true;
      await loadOffers({ sort: value });
      loading.value = false;
    });

    onMounted(async () => {
      loading.value = true;
      await loadOffers({ sort: sort.value });
      loading.value = false;
    });

    const bladeToolbar = [
      {
        id: "refresh",
        title: t("OFFERS.PAGES.LIST.TOOLBAR.REFRESH"),
        icon: "fas fa-sync-alt",
        onClick: async () => {
          loading.value = true;
          await loadOffers({ page: currentPage.value, sort: sort.value });
          loading.value = false;
        },
      },
      {
        id: "add",
        title: t("OFFERS.PAGES.LIST.TOOLBAR.ADD"),
        icon: "fas fa-plus",
        onClick: () => {
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
        id: "productImage",
        field: "product.image",
        title: t("OFFERS.PAGES.LIST.TABLE.HEADER.PRODUCT_IMAGE"),
        width: 60,
        alwaysVisible: true,
      },
      {
        id: "productName",
        field: "product.sellerName",
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
        id: "status",
        title: t("OFFERS.PAGES.LIST.TABLE.HEADER.STATUS"),
        width: 180,
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
        id: "minQty",
        title: t("OFFERS.PAGES.LIST.TABLE.HEADER.MIN_QTY"),
        width: 80,
        sortable: true,
      },
      {
        id: "qty",
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

    const onItemClick = (item: { id: string }) => {
      emit("page:open", {
        component: OffersDetails,
        param: item.id,
      });
    };

    const onHeaderClick = (item: { id: string; sortable: boolean }) => {
      if (item.sortable) {
        if (sort.value === `${item.id}`) {
          sort.value = `-${item.id}`;
        } else if (sort.value === `-${item.id}`) {
          sort.value = null;
        } else {
          sort.value = item.id;
        }
      }
    };

    const onPaginationClick = async (page: number) => {
      loading.value = true;
      await loadOffers({ page, sort: sort.value });
      loading.value = false;
    };

    const statusStyle = (status: string) => {
      const result = {
        outline: true,
        variant: "info",
      };

      switch (status) {
        case "Active":
          result.outline = false;
          result.variant = "success";
          break;
        case "Saved":
          result.outline = true;
          result.variant = "success";
          break;
        case "Future":
          result.outline = true;
          result.variant = "warning";
          break;
      }
      return result;
    };

    return {
      bladeToolbar,
      empty,
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
      onItemClick,
      onHeaderClick,
      onPaginationClick,
      statusStyle,
      reload: async () => {
        loading.value = true;
        await loadOffers({ page: currentPage.value, sort: sort.value });
        loading.value = false;
      },
      title: t("OFFERS.PAGES.LIST.TITLE"),
    };
  },
});
</script>
