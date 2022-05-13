<template>
  <VcBlade
    :title="$t('PROMOTIONS.PAGES.LIST.TITLE')"
    width="50%"
    :expanded="expanded"
    :closable="closable"
    :toolbarItems="bladeToolbar"
    @close="$emit('page:close')"
  >
    <!-- Blade contents -->
    <VcTable
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
        <VcContainer no-padding>
          <VcRow>
            <VcCol class="p-2">
              <div class="mb-4 text-[#a1c0d4] font-bold text-[17px]">
                {{ $t("PROMOTIONS.PAGES.LIST.FILTERS.START_DATE") }}
              </div>
              <div>
                <VcInput
                  :modelValue="getFilterDate('startDate')"
                  @update:modelValue="setFilterDate('startDate', $event)"
                  type="date"
                  class="mb-3"
                  :label="$t('PROMOTIONS.PAGES.LIST.FILTERS.START_DATE')"
                ></VcInput>
                <VcInput
                  :modelValue="getFilterDate('endDate')"
                  @update:modelValue="setFilterDate('endDate', $event)"
                  type="date"
                  :label="$t('PROMOTIONS.PAGES.LIST.FILTERS.END_DATE')"
                ></VcInput>
              </div>
            </VcCol>
          </VcRow>
          <VcRow>
            <VcCol class="p-2">
              <div class="flex justify-end">
                <VcButton outline class="mr-4" @click="resetFilters">{{
                  $t("PROMOTIONS.PAGES.LIST.FILTERS.RESET_FILTERS")
                }}</VcButton>
                <VcButton @click="applyFilters">{{
                  $t("PROMOTIONS.PAGES.LIST.FILTERS.APPLY")
                }}</VcButton>
              </div>
            </VcCol>
          </VcRow>
        </VcContainer>
      </template>

      <!-- Not found template -->
      <template v-slot:notfound>
        <div
          class="w-full h-full box-border flex flex-col items-center justify-center"
        >
          <img src="/assets/empty-product.png" />
          <div class="m-4 text-xl font-medium">
            {{ $t("PROMOTIONS.PAGES.LIST.TABLE.NOT_FOUND") }}
          </div>
          <VcButton @click="resetSearch">
            {{ $t("PROMOTIONS.PAGES.LIST.TABLE.RESET_SEARCH") }}</VcButton
          >
        </div>
      </template>

      <!-- Empty template -->
      <template v-slot:empty>
        <div
          class="w-full h-full box-border flex flex-col items-center justify-center"
        >
          <img src="/assets/empty-product.png" />
          <div class="m-4 text-xl font-medium">
            {{ $t("PROMOTIONS.PAGES.LIST.TABLE.IS_EMPTY") }}
          </div>
          <VcButton>{{ $t("PROMOTIONS.PAGES.LIST.TABLE.ADD_PROMO") }}</VcButton>
        </div>
      </template>

      <!-- Mobile template -->
      <template v-slot:mobile-item="itemData">
        <div class="p-3 flex flex-nowrap">
          <div class="grow basis-0 ml-3">
            <div class="font-bold text-lg">
              {{ itemData.item.name }}
            </div>

            <div class="mt-3 w-full flex justify-between">
              <div
                class="text-ellipsis overflow-hidden whitespace-nowrap grow-[2] basis-0"
              >
                <VcHint>{{
                  $t("PROMOTIONS.PAGES.LIST.TABLE.HEADER.START_DATE")
                }}</VcHint>
                <div
                  class="text-ellipsis overflow-hidden whitespace-nowrap mt-1"
                >
                  {{ moment(itemData.item.startDate).format("L") }}
                </div>
              </div>
              <div
                class="text-ellipsis overflow-hidden whitespace-nowrap grow basis-0"
              >
                <VcHint>{{
                  $t("PROMOTIONS.PAGES.LIST.TABLE.HEADER.MODIFIED")
                }}</VcHint>
                <div
                  class="text-ellipsis overflow-hidden whitespace-nowrap mt-1"
                >
                  {{ moment(itemData.item.modified).format("L") }}
                </div>
              </div>
            </div>

            <div class="mt-3 w-full flex justify-between">
              <div
                class="text-ellipsis overflow-hidden whitespace-nowrap grow basis-0"
              >
                <VcHint>{{
                  $t("PROMOTIONS.PAGES.LIST.TABLE.HEADER.IS_ACTIVE")
                }}</VcHint>
                <div
                  class="text-ellipsis overflow-hidden whitespace-nowrap mt-1"
                >
                  <VcStatusIcon :status="itemData.item.isActive"></VcStatusIcon>
                </div>
              </div>
              <div
                class="text-ellipsis overflow-hidden whitespace-nowrap grow basis-0"
              >
                <VcHint>{{
                  $t("PROMOTIONS.PAGES.LIST.TABLE.HEADER.IS_EXCLUSIVE")
                }}</VcHint>
                <div
                  class="text-ellipsis overflow-hidden whitespace-nowrap mt-1"
                >
                  <VcStatusIcon
                    :status="itemData.item.isExclusive"
                  ></VcStatusIcon>
                </div>
              </div>
              <div
                class="text-ellipsis overflow-hidden whitespace-nowrap grow basis-0"
              >
                <VcHint>{{
                  $t("PROMOTIONS.PAGES.LIST.TABLE.HEADER.CREATED_DATE")
                }}</VcHint>
                <div
                  class="text-ellipsis overflow-hidden whitespace-nowrap mt-1"
                >
                  {{ moment(itemData.item.createdDate).format("L") }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </VcTable>
  </VcBlade>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  onMounted,
  reactive,
  ref,
  watch,
} from "vue";

export default defineComponent({
  url: "promotions",
});
</script>

<script lang="ts" setup>
import { IBladeToolbar, ITableColumns } from "../../../types";
import { useI18n, useFunctions } from "@virtoshell/core";
import moment from "moment";
import { usePromotions } from "../composables";

defineProps({
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
});

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
const title = t("PROMOTIONS.PAGES.LIST.TITLE");
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
  const sortBy = [":DESC", ":ASC", ""];
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

defineExpose({
  title,
  reload,
});
</script>
