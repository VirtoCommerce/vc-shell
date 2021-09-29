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
    </vc-table>
  </vc-blade>
</template>

<script lang="ts">
import { defineComponent, watch, onMounted, ref, computed } from "vue";
import { useI18n, useRouter } from "@virtoshell/core";
import { useOffers } from "../composables";
import moment from "moment";

export default defineComponent({
  props: {
    uid: {
      type: String,
      default: undefined,
    },
    expanded: {
      type: Boolean,
      default: true,
    },

    closable: {
      type: Boolean,
      default: true,
    },
  },

  setup(props) {
    const { t } = useI18n();
    const { openBlade } = useRouter();

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

    watch(sort, async (value) => {
      await loadOffers({ ...searchQuery.value, sort: value });
    });

    onMounted(async () => {
      await loadOffers({ sort: sort.value });
    });

    const reload = async () => {
      await loadOffers({
        ...searchQuery.value,
        skip: (currentPage.value - 1) * searchQuery.value.take,
        sort: sort.value,
      });
    };

    const bladeToolbar = [
      {
        id: "refresh",
        title: t("OFFERS.PAGES.LIST.TOOLBAR.REFRESH"),
        icon: "fas fa-sync-alt",
        onClick: async () => {
          await reload();
        },
      },
      {
        id: "add",
        title: t("OFFERS.PAGES.LIST.TOOLBAR.ADD"),
        icon: "fas fa-plus",
        onClick: () => {
          openBlade(props.uid, "offers-details", { url: null });
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
        openBlade(props.uid, "offers-details");
      },
    };

    const onItemClick = (item: { id: string }) => {
      openBlade(props.uid, "offers-details", { param: item.id });
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
      title: t("OFFERS.PAGES.LIST.TITLE"),
    };
  },
});
</script>
