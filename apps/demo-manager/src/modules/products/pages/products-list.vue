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
      <!-- Override name column template -->
      <template v-slot:item_name="itemData">
        <div class="vc-flex vc-flex-column">
          <div>{{ itemData.item.name }}</div>
          <vc-hint>{{ itemData.item.path }}</vc-hint>
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

      <!-- Override status column template -->
      <template v-slot:item_status="itemData">
        <vc-status
          v-bind="statusStyles[status]"
          v-for="(status, i) in getStatuses(itemData.item.status)"
          :key="i"
          >{{
            $t(`PRODUCTS.STATUSES.${camelToSnake(status).toUpperCase()}`)
          }}</vc-status
        >
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
import { useRouter, useI18n, useLogger, camelToSnake } from "@virtoshell/core";
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

    watch(sort, async (value) => {
      await loadProducts({ ...searchQuery.value, sort: value });
    });

    onMounted(async () => {
      await loadProducts({ sort: sort.value });
    });

    const bladeToolbar = [
      {
        id: "refresh",
        title: t("PRODUCTS.PAGES.LIST.TOOLBAR.REFRESH"),
        icon: "fas fa-sync-alt",
        onClick: async () => {
          await loadProducts({
            ...searchQuery.value,
            skip: (currentPage.value - 1) * searchQuery.value.take,
            sort: sort.value,
          });
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

    const getStatuses = (statusStr: string) => {
      return statusStr.split(",").map(function (item) {
        return item.trim();
      });
    };

    const statusStyles = {
      RequestChanges: {
        outline: true,
        variant: "danger",
      },
      Approved: {
        outline: true,
        variant: "success",
      },
      WaitForApproval: {
        outline: true,
        variant: "warning",
      },
      Rejected: {
        outline: false,
        variant: "danger",
      },
      HasStagedChanges: {
        outline: true,
        variant: "warning",
      },
      Published: {
        outline: true,
        variant: "success",
      },
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
      getStatuses,
      searchQuery,
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
      camelToSnake,
      statusStyles,
    };
  },
});
</script>
