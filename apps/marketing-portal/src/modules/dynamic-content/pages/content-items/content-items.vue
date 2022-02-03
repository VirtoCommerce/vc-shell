<template>
  <vc-blade
    :title="$t('DYNAMIC_CONTENT.PAGES.CONTENT_ITEMS.LIST.TITLE')"
    width="70%"
    :expanded="expanded"
    :closable="closable"
    :toolbarItems="bladeToolbar"
    @close="$emit('page:close')"
  >
    <!-- Blade contents -->
    <vc-table
      :expanded="expanded"
      :loading="loading"
      :columns="columns"
      :items="contentItems"
      :selectedItemId="selectedItemId"
      @itemClick="onItemClick"
      :totalCount="totalCount"
      :pages="pages"
      :currentPage="currentPage"
      @paginationClick="onPaginationClick"
      :searchValue="searchValue"
      @search:change="onSearchList"
      @headerClick="onHeaderClick"
      :sort="sort"
      @scroll:ptr="reload"
    >
      <!-- Not found template -->
      <template v-slot:notfound>
        <div
          class="
            vc-fill_all
            vc-flex vc-flex-column
            vc-flex-align_center
            vc-flex-justify_center
          "
        >
          <div class="vc-margin_l vc-font-size_xl vc-font-weight_medium">
            {{ $t("PROMOTIONS.PAGES.LIST.TABLE.NOT_FOUND") }}
          </div>
          <vc-button @click="resetSearch">
            {{ $t("PROMOTIONS.PAGES.LIST.TABLE.RESET_SEARCH") }}</vc-button
          >
        </div>
      </template>

      <!-- Empty template -->
      <template v-slot:empty>
        <div
          class="
            vc-fill_all
            vc-flex vc-flex-column
            vc-flex-align_center
            vc-flex-justify_center
          "
        >
          <img src="/assets/empty-product.png" />
          <div class="vc-margin_l vc-font-size_xl vc-font-weight_medium">
            {{ $t("PROMOTIONS.PAGES.LIST.TABLE.IS_EMPTY") }}
          </div>
          <vc-button>{{
            $t("PROMOTIONS.PAGES.LIST.TABLE.ADD_PROMO")
          }}</vc-button>
        </div>
      </template>

      <!-- Mobile template -->
      <template v-slot:mobile-item="itemData">
        <div
          class="products-list__mobile-item vc-padding_m vc-flex vc-flex-nowrap"
        >
          <div class="vc-flex-grow_1 vc-margin-left_m">
            <div class="vc-font-weight_bold vc-font-size_l">
              {{ itemData.item.name }}
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
                <vc-hint>{{
                  $t(
                    "DYNAMIC_CONTENT.PAGES.CONTENT_ITEMS.LIST.TABLE.HEADER.CREATED"
                  )
                }}</vc-hint>
                <div class="vc-ellipsis vc-margin-top_xs">
                  {{ moment(itemData.item.created).format("L") }}
                </div>
              </div>
              <div class="vc-ellipsis vc-flex-grow_1">
                <vc-hint>{{
                  $t(
                    "DYNAMIC_CONTENT.PAGES.CONTENT_ITEMS.LIST.TABLE.HEADER.DESCRIPTION"
                  )
                }}</vc-hint>
                <div class="vc-ellipsis vc-margin-top_xs">
                  {{ itemData.item.description }}
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
                <vc-hint>{{
                  $t(
                    "DYNAMIC_CONTENT.PAGES.CONTENT_ITEMS.LIST.TABLE.HEADER.PATH"
                  )
                }}</vc-hint>
                <div class="vc-ellipsis vc-margin-top_xs">
                  {{ itemData.item.path }}
                </div>
              </div>
              <div class="vc-ellipsis vc-flex-grow_1">
                <vc-hint>{{
                  $t("DYNAMIC_CONTENT.PAGES.CONTENT_ITEMS.LIST.TABLE.HEADER.ID")
                }}</vc-hint>
                <div class="vc-ellipsis vc-margin-top_xs">
                  {{ itemData.item.id }}
                </div>
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
  computed,
  defineComponent,
  onMounted,
  reactive,
  ref,
  watch,
} from "vue";
import { useFunctions, useI18n } from "@virtoshell/core";
import { IBladeToolbar, ITableColumns } from "../../../../types";
import moment from "moment";
import ContentItemEdit from "./content-item-edit.vue";
import { useContentItems } from "../../composables";

export default defineComponent({
  url: "content-items",
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

    options: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props, { emit }) {
    const { t } = useI18n();
    const selectedItemId = ref();
    const {
      contentItems,
      loading,
      totalCount,
      pages,
      currentPage,
      searchQuery,
      loadContentItems,
    } = useContentItems();
    const searchValue = ref();
    const { debounce } = useFunctions();
    const sort = ref("startDate:DESC");
    const bladeToolbar = reactive<IBladeToolbar[]>([
      {
        id: "refresh",
        title: t("PROMOTIONS.PAGES.LIST.TOOLBAR.REFRESH"),
        icon: "fas fa-sync-alt",
        clickHandler() {
          alert("reload");
        },
      },
      {
        id: "add",
        title: t("PROMOTIONS.PAGES.LIST.TOOLBAR.ADD"),
        icon: "fas fa-plus",
        clickHandler() {
          alert("add");
        },
      },
    ]);
    const columns = ref<ITableColumns[]>([
      {
        id: "name",
        title: t("DYNAMIC_CONTENT.PAGES.CONTENT_ITEMS.LIST.TABLE.HEADER.NAME"),
        alwaysVisible: true,
        sortable: true,
      },
      {
        id: "createdDate",
        title: t(
          "DYNAMIC_CONTENT.PAGES.CONTENT_ITEMS.LIST.TABLE.HEADER.CREATED"
        ),
        sortable: true,
        alwaysVisible: true,
        width: 150,
        type: "date",
        format: "L",
      },
      {
        id: "description",
        title: t(
          "DYNAMIC_CONTENT.PAGES.CONTENT_ITEMS.LIST.TABLE.HEADER.DESCRIPTION"
        ),
        width: 150,
      },
      {
        id: "path",
        title: t("DYNAMIC_CONTENT.PAGES.CONTENT_ITEMS.LIST.TABLE.HEADER.PATH"),
        width: 150,
      },
      {
        id: "id",
        title: t("DYNAMIC_CONTENT.PAGES.CONTENT_ITEMS.LIST.TABLE.HEADER.ID"),
        sortable: true,
        width: 300,
      },
    ]);

    watch(sort, async (value) => {
      await loadContentItems({ ...searchQuery.value, sort: value });
    });

    onMounted(async () => {
      searchQuery.value = {
        ...searchQuery.value,
        folderId: "ContentItem",
        responseGroup: "18",
      };
      await loadContentItems({ sort: sort.value });
    });

    async function reload() {
      await loadContentItems({
        ...searchQuery.value,
        skip: (currentPage.value - 1) * searchQuery.value.take,
        sort: sort.value,
      });
    }

    async function onPaginationClick(page: number) {
      await loadContentItems({
        skip: (page - 1) * 20,
      });
    }

    const onSearchList = debounce(async (keyword: string) => {
      searchValue.value = keyword;
      await loadContentItems({
        keyword,
      });
    }, 200);

    function onHeaderClick(item: ITableColumns) {
      const sortBy = [":ASK", ":DESC", ""];
      if (item.sortable) {
        item.sortDirection = (item.sortDirection ?? 0) + 1;
        sort.value = `${item.id}${sortBy[item.sortDirection % 3]}`;
      }
    }

    async function resetSearch() {
      searchValue.value = "";
      await loadContentItems({
        ...searchQuery.value,
        keyword: "",
      });
    }

    const onItemClick = (item: { id: string }) => {
      emit("page:open", {
        component: ContentItemEdit,
        param: item.id,
        onOpen() {
          selectedItemId.value = item.id;
        },
        onClose() {
          selectedItemId.value = undefined;
        },
      });
    };

    return {
      title: t("DYNAMIC_CONTENT.PAGES.CONTENT_ITEMS.LIST.TITLE"),
      bladeToolbar,
      loading,
      columns,
      contentItems,
      selectedItemId,
      totalCount,
      pages,
      currentPage,
      searchValue,
      sort,
      onItemClick,
      moment,
      reload,
      onPaginationClick,
      onSearchList,
      onHeaderClick,
      resetSearch,
    };
  },
});
</script>

<style lang="less" scoped></style>
