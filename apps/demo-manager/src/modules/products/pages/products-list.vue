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
      :multiselect="true"
      :headers="headers"
      :items="products.results"
      @itemClick="onItemClick"
    ></vc-table>
  </vc-blade>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useRouter, useI18n } from "@virtoshell/core";

export default defineComponent({
  setup() {
    const router = useRouter();
    const { t } = useI18n();
    const expanded = ref(true);
    const products = {
      results: [],
    };

    const bladeToolbar = [
      {
        id: "refresh",
        title: t("PRODUCTS.PAGES.LIST.TOOLBAR.REFRESH"),
        icon: "fas fa-sync-alt",
      },
      {
        id: "add",
        title: t("PRODUCTS.PAGES.LIST.TOOLBAR.ADD"),
        icon: "fas fa-plus-square",
        disabled: true,
      },
      {
        id: "batchDelete",
        title: t("PRODUCTS.PAGES.LIST.TOOLBAR.BATCH_DELETE"),
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
        id: "sellerName",
        title: t("PRODUCTS.PAGES.LIST.TABLE.NAME"),
        sortable: true,
      },
      {
        id: "category",
        title: t("PRODUCTS.PAGES.LIST.TABLE.CATEGORY"),
        sortable: true,
        width: 120,
      },
      {
        id: "createdDate",
        title: t("PRODUCTS.PAGES.LIST.TABLE.CREATED_DATE"),
        sortable: true,
        width: 100,
      },
      {
        id: "status",
        title: t("PRODUCTS.PAGES.LIST.TABLE.STATUS"),
        sortable: true,
        width: 120,
      },
      {
        id: "gtin",
        title: t("PRODUCTS.PAGES.LIST.TABLE.GTIN"),
        sortable: true,
        width: 180,
      },
    ];

    const onItemClick = (item: { id: string }) => {
      router.push({ name: "product-details", params: { id: item.id } });
    };

    return {
      expanded,
      bladeToolbar,
      headers,
      products,
      onItemClick,
    };
  },
});
</script>
