<template>
  <vc-blade
    :title="$t('PRODUCTS.PAGES.LIST.TITLE')"
    :subtitle="$t('PRODUCTS.PAGES.LIST.SUBTITLE')"
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
      @itemClick="onItemClick"
    >
      <template v-slot:footer>
        <div class="products-list__footer vc-padding_l">
          <vc-pagination
            :pages="pages"
            :currentPage="currentPage"
            @itemClick="onPaginationClick"
          ></vc-pagination>
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
import { defineComponent, ref, onMounted } from "vue";
import { useRouter, useI18n, useLogger } from "@virtoshell/core";
import { useProducts } from "../composables";

export default defineComponent({
  setup() {
    const router = useRouter();
    const logger = useLogger();
    const { t } = useI18n();
    const expanded = ref(true);
    const { products, pages, currentPage, loadProducts } = useProducts();

    onMounted(() => {
      loadProducts();
    });

    const bladeToolbar = [
      {
        id: "refresh",
        title: t("PRODUCTS.PAGES.LIST.TOOLBAR.REFRESH"),
        icon: "fas fa-sync-alt",
        onClick: () => {
          loadProducts();
        },
      },
      {
        id: "add",
        title: t("PRODUCTS.PAGES.LIST.TOOLBAR.ADD"),
        icon: "fas fa-plus-square",
        disabled: true,
      },
      {
        id: "batchDelete",
        title: t("PRODUCTS.PAGES.LIST.TOOLBAR.BULK_DELETE"),
        icon: "fas fa-times-circle",
        disabled: true,
      },
    ];

    const headers = [
      {
        id: "image",
        title: "",
        width: 60,
      },
      {
        id: "gtin",
        title: t("PRODUCTS.PAGES.LIST.TABLE.GTIN"),
        width: 120,
      },
      {
        id: "sellerName",
        title: t("PRODUCTS.PAGES.LIST.TABLE.NAME"),
      },
      {
        id: "category",
        title: t("PRODUCTS.PAGES.LIST.TABLE.CATEGORY"),
        width: 200,
      },
      {
        id: "createdDate",
        title: t("PRODUCTS.PAGES.LIST.TABLE.CREATED_DATE"),
        width: 180,
      },
      {
        id: "status",
        title: t("PRODUCTS.PAGES.LIST.TABLE.STATUS"),
        width: 120,
      },
    ];

    const onItemClick = (item: { id: string }) => {
      router.push({ name: "product-details", params: { id: item.id } });
    };

    const onPaginationClick = (page: number) => {
      logger.info(`Load page ${page}`);
      loadProducts({ page });
    };

    return {
      expanded,
      bladeToolbar,
      headers,
      products,
      pages,
      currentPage,
      onItemClick,
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
