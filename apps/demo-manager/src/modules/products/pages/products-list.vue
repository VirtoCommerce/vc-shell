<template>
  <vc-blade
    :title="$t('PRODUCTS.PAGES.LIST.TITLE')"
    :width="400"
    :expanded="expanded"
    :closable="false"
    @expand="expanded = true"
    @collapse="expanded = false"
    :toolbarItems="bladeToolbar"
  >
    <vc-table
      class="vc-flex-grow_1"
      :multiselect="true"
      :headers="headers"
      :items="products"
      :sort="sort"
      @itemClick="onItemClick"
      @headerClick="onHeaderClick"
    >
      <template v-slot:header>
        <div
          class="
            products-list__header
            vc-flex
            vc-flex-align_center
            vc-flex-justify_space-between
            vc-padding_l
          "
        >
          <vc-form-input
            class="vc-flex-grow_1 vc-margin-right_m"
            :placeholder="$t('PRODUCTS.PAGES.LIST.SEARCH.PLACEHOLDER')"
            :clearable="true"
          ></vc-form-input>
          <vc-table-filter></vc-table-filter>
        </div>
      </template>

      <template v-slot:footer>
        <div
          class="
            products-list__footer
            vc-flex
            vc-flex-align_center
            vc-flex-justify_space-between
            vc-padding_l
          "
        >
          <vc-pagination
            :pages="pages"
            :currentPage="currentPage"
            @itemClick="onPaginationClick"
          ></vc-pagination>
          <vc-table-counter
            :label="$t('PRODUCTS.PAGES.LIST.TABLE.TOTALS')"
            :value="totalCount"
          ></vc-table-counter>
        </div>
      </template>
      <template v-slot:item_sellerName="itemData">
        <div class="vc-flex vc-flex-column">
          <div>{{ itemData.item.sellerName }}</div>
          <vc-tooltip>{{ itemData.item.category }}</vc-tooltip>
        </div>
      </template>
      <template v-slot:item_image="itemData">
        <vc-image
          :bordered="true"
          size="s"
          aspect="1x1"
          :src="itemData.item.image"
        ></vc-image>
      </template>
      <template v-slot:item_status="itemData">
        <vc-bubble v-bind="statusStyle(itemData.item.status)">{{
          itemData.item.status
        }}</vc-bubble>
      </template>
      <template v-slot:item_createdDate="itemData">
        {{ moment(itemData.item.createdDate).fromNow() }}
      </template>
    </vc-table>
  </vc-blade>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch } from "vue";
import { useRouter, useI18n, useLogger } from "@virtoshell/core";
import { useProducts } from "../composables";
import moment from "moment";

export default defineComponent({
  setup() {
    const router = useRouter();
    const logger = useLogger();
    const { t } = useI18n();
    const expanded = ref(true);
    const { products, totalCount, pages, currentPage, loadProducts } =
      useProducts();

    const sort = ref("-createdDate");

    watch(sort, (value) => {
      loadProducts({
        sort: value,
      });
    });

    onMounted(() => {
      loadProducts({
        sort: sort.value,
      });
    });

    const bladeToolbar = [
      {
        id: "refresh",
        title: t("PRODUCTS.PAGES.LIST.TOOLBAR.REFRESH"),
        icon: "fas fa-sync-alt",
        onClick: () => {
          loadProducts({ page: currentPage.value, sort: sort.value });
        },
      },
      {
        id: "add",
        title: t("PRODUCTS.PAGES.LIST.TOOLBAR.ADD"),
        icon: "fas fa-plus",
        onClick: () => {
          router.push({ name: "products-details", params: { id: "new" } });
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

    const headers = [
      {
        id: "image",
        title: t("PRODUCTS.PAGES.LIST.TABLE.HEADER.IMAGE"),
        width: 60,
      },
      {
        id: "sellerName",
        title: t("PRODUCTS.PAGES.LIST.TABLE.HEADER.NAME"),
        sortable: true,
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
      },
    ];

    const onItemClick = (item: { id: string }) => {
      router.push({ name: "products-details", params: { id: item.id } });
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

    const onPaginationClick = (page: number) => {
      loadProducts({ page, sort: sort.value });
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
      expanded,
      bladeToolbar,
      headers,
      products,
      totalCount,
      pages,
      currentPage,
      sort,
      moment,
      onItemClick,
      onHeaderClick,
      onPaginationClick,
      statusStyle,
    };
  },
});
</script>

<style lang="less">
.products-list {
  &__footer {
    background-color: #fbfdfe;
    border-top: 2px solid #eaedf3;
  }
}
</style>
