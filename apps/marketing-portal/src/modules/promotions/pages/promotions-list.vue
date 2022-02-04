<template>
  <vc-blade
    :title="$t('PROMOTIONS.PAGES.LIST.TITLE')"
    width="50%"
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
      :items="promotions"
      :totalCount="totalCount"
      :pages="pages"
      :currentPage="currentPage"
      @paginationClick="onPaginationClick"
      :searchValue="searchValue"
      @search:change="onSearchList"
      @headerClick="onHeaderClick"
      :sort="sort"
      @scroll:ptr="reload"
      :activeFilterCount="activeFilterCount"
    >
      <!-- Filters -->
      <template v-slot:filters>
        <h2 v-if="$isMobile.value">
          {{ $t("PROMOTIONS.PAGES.LIST.FILTERS.TITLE") }}
        </h2>
        <vc-container no-padding>
          <vc-row>
            <vc-col class="vc-padding_s">
              <div class="group-title">
                {{ $t("PROMOTIONS.PAGES.LIST.FILTERS.START_DATE") }}
              </div>
              <div>
                <vc-input
                  :modelValue="getFilterDate('startDate')"
                  @update:modelValue="setFilterDate('startDate', $event)"
                  type="date"
                  class="vc-margin-bottom_m"
                  :label="$t('PROMOTIONS.PAGES.LIST.FILTERS.START_DATE')"
                ></vc-input>
                <vc-input
                  :modelValue="getFilterDate('endDate')"
                  @update:modelValue="setFilterDate('endDate', $event)"
                  type="date"
                  :label="$t('PROMOTIONS.PAGES.LIST.FILTERS.END_DATE')"
                ></vc-input>
              </div>
            </vc-col>
          </vc-row>
          <vc-row>
            <vc-col class="vc-padding_s">
              <div class="vc-flex vc-flex-justify_end">
                <vc-button
                  outline
                  class="vc-margin-right_l"
                  @click="resetFilters"
                  >{{
                    $t("PROMOTIONS.PAGES.LIST.FILTERS.RESET_FILTERS")
                  }}</vc-button
                >
                <vc-button @click="applyFilters">{{
                  $t("PROMOTIONS.PAGES.LIST.FILTERS.APPLY")
                }}</vc-button>
              </div>
            </vc-col>
          </vc-row>
        </vc-container>
      </template>

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
          <img src="/assets/empty-product.png" />
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
                  $t("PROMOTIONS.PAGES.LIST.TABLE.HEADER.START_DATE")
                }}</vc-hint>
                <div class="vc-ellipsis vc-margin-top_xs">
                  {{ moment(itemData.item.startDate).format("L") }}
                </div>
              </div>
              <div class="vc-ellipsis vc-flex-grow_1">
                <vc-hint>{{
                  $t("PROMOTIONS.PAGES.LIST.TABLE.HEADER.MODIFIED")
                }}</vc-hint>
                <div class="vc-ellipsis vc-margin-top_xs">
                  {{ moment(itemData.item.modified).format("L") }}
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
              <div class="vc-ellipsis vc-flex-grow_1">
                <vc-hint>{{
                  $t("PROMOTIONS.PAGES.LIST.TABLE.HEADER.IS_ACTIVE")
                }}</vc-hint>
                <div class="vc-ellipsis vc-margin-top_xs">
                  <vc-status-icon
                    :status="itemData.item.isActive"
                  ></vc-status-icon>
                </div>
              </div>
              <div class="vc-ellipsis vc-flex-grow_1">
                <vc-hint>{{
                  $t("PROMOTIONS.PAGES.LIST.TABLE.HEADER.IS_EXCLUSIVE")
                }}</vc-hint>
                <div class="vc-ellipsis vc-margin-top_xs">
                  <vc-status-icon
                    :status="itemData.item.isExclusive"
                  ></vc-status-icon>
                </div>
              </div>
              <div class="vc-ellipsis vc-flex-grow_1">
                <vc-hint>{{
                  $t("PROMOTIONS.PAGES.LIST.TABLE.HEADER.CREATED_DATE")
                }}</vc-hint>
                <div class="vc-ellipsis vc-margin-top_xs">
                  {{ moment(itemData.item.createdDate).format("L") }}
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
import { IBladeToolbar, ITableColumns } from "../../../types";
import { useI18n, useFunctions } from "@virtoshell/core";
import moment from "moment";
import { usePromotions } from "../composables";

export default defineComponent({
  url: "promotions",
  props: {
    expanded: {
      type: Boolean,
      default: true,
    },

    closable: {
      type: Boolean,
      default: false,
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
  setup() {
    const { t } = useI18n();
    const {
      promotions,
      loading,
      currentPage,
      pages,
      totalCount,
      searchQuery,
      loadPromotions,
    } = usePromotions();
    const searchValue = ref();
    const { debounce } = useFunctions();
    const sort = ref("startDate:DESC");
    const filter = reactive<{
      dateStart?: string;
      dateEnd?: string;
    }>({});
    const appliedFilter = ref({});
    const bladeToolbar = reactive<IBladeToolbar[]>([
      {
        id: "refresh",
        title: t("PROMOTIONS.PAGES.LIST.TOOLBAR.REFRESH"),
        icon: "fas fa-sync-alt",
        clickHandler() {
          reload();
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
        title: t("PROMOTIONS.PAGES.LIST.TABLE.HEADER.NAME"),
        alwaysVisible: true,
        width: 343,
        sortable: true,
      },
      {
        id: "startDate",
        title: t("PROMOTIONS.PAGES.LIST.TABLE.HEADER.START_DATE"),
        sortable: true,
        alwaysVisible: true,
        width: 80,
        type: "date",
        format: "L",
      },
      {
        id: "isActive",
        title: t("PROMOTIONS.PAGES.LIST.TABLE.HEADER.IS_ACTIVE"),
        width: 80,
        sortable: true,
        align: "center",
        type: "status-icon",
      },
      {
        id: "isExclusive",
        title: t("PROMOTIONS.PAGES.LIST.TABLE.HEADER.IS_EXCLUSIVE"),
        width: 80,
        type: "status-icon",
        sortable: true,
        align: "center",
      },
      {
        id: "modifiedDate",
        title: t("PROMOTIONS.PAGES.LIST.TABLE.HEADER.MODIFIED"),
        width: 80,
        sortable: true,
        type: "date",
        format: "L",
      },
      {
        id: "createdDate",
        title: t("PROMOTIONS.PAGES.LIST.TABLE.HEADER.CREATED_DATE"),
        width: 100,
        alwaysVisible: true,
        type: "date",
        format: "L",
        sortable: true,
      },
    ]);

    watch(sort, async (value) => {
      await loadPromotions({ ...searchQuery.value, sort: value });
    });

    onMounted(async () => {
      await loadPromotions({ sort: sort.value });
    });

    const activeFilterCount = computed(
      () => Object.values(appliedFilter.value).filter((item) => !!item).length
    );

    async function reload() {
      await loadPromotions({
        ...searchQuery.value,
        skip: (currentPage.value - 1) * searchQuery.value.take,
        sort: sort.value,
      });
    }

    async function onPaginationClick(page: number) {
      await loadPromotions({
        skip: (page - 1) * 20,
      });
    }

    const onSearchList = debounce(async (keyword: string) => {
      searchValue.value = keyword;
      await loadPromotions({
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
      Object.keys(filter).forEach((key: string) => (filter[key] = undefined));
      await loadPromotions({
        ...searchQuery.value,
        ...filter,
        keyword: "",
      });
      appliedFilter.value = {};
    }

    async function resetFilters() {
      Object.keys(filter).forEach((key: string) => (filter[key] = undefined));
      await loadPromotions({
        ...searchQuery.value,
        ...filter,
      });
      appliedFilter.value = {};
    }

    async function applyFilters() {
      await loadPromotions({
        ...searchQuery.value,
        ...filter,
      });
      appliedFilter.value = {
        ...filter,
      };
    }

    function getFilterDate(key: string) {
      const date = filter[key] as Date;
      if (filter[key]) {
        const year = date.getUTCFullYear();
        const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
        const day = `${date.getUTCDate()}`.padStart(2, "0");
        return `${year}-${month}-${day}`;
      }
      return undefined;
    }

    function setFilterDate(key: string, value: string) {
      filter[key] = new Date(value);
    }

    return {
      title: t("PROMOTIONS.PAGES.LIST.TITLE"),
      bladeToolbar,
      loading,
      columns,
      promotions,
      currentPage,
      pages,
      totalCount,
      searchValue,
      sort,
      appliedFilter,
      activeFilterCount,
      moment,
      onPaginationClick,
      onHeaderClick,
      resetSearch,
      reload,
      onSearchList,
      resetFilters,
      applyFilters,
      getFilterDate,
      setFilterDate,
      filter,
    };
  },
});
</script>

<style lang="less" scoped>
.group-title {
  margin-bottom: var(--margin-l);
  color: #a1c0d4;
  font-weight: var(--font-weight-bold);
  font-size: 17px;
}
</style>
