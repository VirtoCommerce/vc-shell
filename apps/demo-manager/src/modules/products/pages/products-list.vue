<template>
  <vc-blade
    :uid="uid"
    :title="$t('PRODUCTS.PAGES.LIST.TITLE')"
    :expanded="expanded"
    :closable="closable"
    :toolbarItems="bladeToolbar"
    @close="$closeBlade(uid)"
  >
    <!-- Blade contents -->
    <vc-table
      :loading="loading"
      :expanded="expanded"
      :empty="empty"
      class="vc-flex-grow_1"
      :multiselect="true"
      :columns="columns"
      :items="products"
      :sort="sort"
      :pages="pages"
      :currentPage="currentPage"
      :searchPlaceholder="$t('PRODUCTS.PAGES.LIST.SEARCH.PLACEHOLDER')"
      :totalLabel="$t('PRODUCTS.PAGES.LIST.TABLE.TOTALS')"
      :totalCount="totalCount"
      @itemClick="onItemClick"
      @headerClick="onHeaderClick"
      @paginationClick="onPaginationClick"
    >
      <!-- Override sellerName column template -->
      <template v-slot:item_sellerName="itemData">
        <div class="vc-flex vc-flex-column">
          <div class="vc-ellipsis">{{ itemData.item.sellerName }}</div>
          <vc-hint class="vc-ellipsis">{{ itemData.item.category }}</vc-hint>
        </div>
      </template>

      <!-- Override image column template -->
      <template v-slot:item_image="itemData">
        <vc-image
          :bordered="true"
          size="s"
          aspect="1x1"
          :src="itemData.item.image"
        ></vc-image>
      </template>

      <!-- Override status column template -->
      <template v-slot:item_status="itemData">
        <vc-status v-bind="statusStyle(itemData.item.status)">{{
          itemData.item.status
        }}</vc-status>
      </template>

      <!-- Override createdDate column template -->
      <template v-slot:item_createdDate="itemData">
        {{ moment(itemData.item.createdDate).fromNow() }}
      </template>
    </vc-table>
  </vc-blade>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed, watch } from "vue";
import { useRouter, useI18n, useLogger } from "@virtoshell/core";
import { useProducts } from "../composables";
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
    const { openBlade } = useRouter();
    const logger = useLogger();
    const { t } = useI18n();
    const loading = ref(false);
    const { products, totalCount, pages, currentPage, loadProducts } =
      useProducts();

    const sort = ref("-createdDate");

    watch(sort, async (value) => {
      loading.value = true;
      await loadProducts({ sort: value });
      loading.value = false;
    });

    onMounted(async () => {
      loading.value = true;
      await loadProducts({ sort: sort.value });
      loading.value = false;
    });

    const bladeToolbar = [
      {
        id: "refresh",
        title: t("PRODUCTS.PAGES.LIST.TOOLBAR.REFRESH"),
        icon: "fas fa-sync-alt",
        onClick: async () => {
          loading.value = true;
          await loadProducts({ page: currentPage.value, sort: sort.value });
          loading.value = false;
        },
      },
      {
        id: "add",
        title: t("PRODUCTS.PAGES.LIST.TOOLBAR.ADD"),
        icon: "fas fa-plus",
        onClick: () => {
          openBlade(props.uid, "products-add");
        },
      },
      {
        id: "batchDelete",
        title: t("PRODUCTS.PAGES.LIST.TOOLBAR.BULK_DELETE"),
        icon: "fas fa-trash",
        disabled: true,
        onClick: () => {
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
        id: "sellerName",
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
        openBlade(props.uid, "products-add");
      },
    };

    const onItemClick = (item: { id: string }) => {
      openBlade(props.uid, "products-edit", { param: item.id });
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
      await loadProducts({ page, sort: sort.value });
      loading.value = false;
    };

    const statusStyle = (status: string) => {
      const result = {
        outline: true,
        variant: "info",
      };

      switch (status) {
        case "Published":
          result.outline = false;
          result.variant = "success";
          break;
        case "Requires changes":
          result.outline = true;
          result.variant = "danger";
          break;
        case "Approved":
          result.outline = true;
          result.variant = "success";
          break;
        case "Waiting for approval":
          result.outline = true;
          result.variant = "warning";
          break;
        case "Rejected":
          result.outline = false;
          result.variant = "danger";
          break;
      }
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
      products,
      totalCount,
      pages,
      currentPage,
      sort,
      empty,
      moment,
      onItemClick,
      onHeaderClick,
      onPaginationClick,
      statusStyle,
    };
  },
});
</script>
