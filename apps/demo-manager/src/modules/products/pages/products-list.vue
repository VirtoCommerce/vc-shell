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
      <template v-slot:item_image="itemData">
        <vc-image size="s" aspect="1x1" :src="itemData.item.image"></vc-image>
      </template>
      <template v-slot:item_status="itemData">
        <vc-bubble :clickable="false">{{ itemData.item.status }}</vc-bubble>
      </template>
    </vc-table>
  </vc-blade>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch } from "vue";
import { useRouter, useI18n, useLogger } from "@virtoshell/core";
import { useProducts } from "../composables";

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
        icon: "fas fa-plus-square",
        disabled: true,
        onClick: () => {
          router.push({ name: "product-details" });
        },
      },
      {
        id: "batchDelete",
        title: t("PRODUCTS.PAGES.LIST.TOOLBAR.BULK_DELETE"),
        icon: "fas fa-times-circle",
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
        id: "gtin",
        title: t("PRODUCTS.PAGES.LIST.TABLE.HEADER.GTIN"),
        width: 120,
        sortable: true,
      },
      {
        id: "sellerName",
        title: t("PRODUCTS.PAGES.LIST.TABLE.HEADER.NAME"),
        sortable: true,
      },
      {
        id: "category",
        title: t("PRODUCTS.PAGES.LIST.TABLE.HEADER.CATEGORY"),
        width: 200,
        sortable: true,
      },
      {
        id: "createdDate",
        title: t("PRODUCTS.PAGES.LIST.TABLE.HEADER.CREATED_DATE"),
        width: 180,
        sortable: true,
      },
      {
        id: "status",
        title: t("PRODUCTS.PAGES.LIST.TABLE.HEADER.STATUS"),
        width: 120,
        sortable: true,
      },
    ];

    const onItemClick = (item: { id: string }) => {
      router.push({ name: "product-details", params: { id: item.id } });
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

    return {
      expanded,
      bladeToolbar,
      headers,
      products,
      totalCount,
      pages,
      currentPage,
      sort,
      onItemClick,
      onHeaderClick,
      onPaginationClick,
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
