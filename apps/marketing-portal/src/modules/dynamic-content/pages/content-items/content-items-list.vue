<template>
  <VcBlade
    :title="$t('DYNAMIC_CONTENT.PAGES.CONTENT_ITEMS_LIST.LIST.TITLE')"
    width="50%"
    :expanded="expanded"
    :closable="closable"
    v-loading="loading"
    :toolbarItems="bladeToolbar"
    @close="$emit('page:close')"
  >
    <!-- Breadcrumbs -->
    <div class="vc-padding-left_l vc-padding-top_l">
      <VcBreadcrumbs :items="breadcrumbs" />
    </div>
    <!-- Blade contents -->
    <VcTable
      :expanded="expanded"
      :loading="loading"
      :columns="columns"
      :items="contentItems"
      :selectedItemId="selectedItemId"
      @itemClick="onItemClick"
      :totalCount="totalCount"
      :itemActionBuilder="actionBuilder"
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
          class="vc-fill_all vc-flex vc-flex-column vc-flex-align_center vc-flex-justify_center"
        >
          <img src="/assets/empty-product.png" />
          <div class="vc-margin_l vc-font-size_xl vc-font-weight_medium">
            {{
              $t(
                "DYNAMIC_CONTENT.PAGES.CONTENT_ITEMS_LIST.LIST.TABLE.NOT_FOUND"
              )
            }}
          </div>
          <VcButton @click="resetSearch">
            {{
              $t(
                "DYNAMIC_CONTENT.PAGES.CONTENT_ITEMS_LIST.LIST.TABLE.RESET_SEARCH"
              )
            }}</VcButton
          >
        </div>
      </template>

      <!-- Empty template -->
      <template v-slot:empty>
        <div
          class="vc-fill_all vc-flex vc-flex-column vc-flex-align_center vc-flex-justify_center"
        >
          <img src="/assets/empty-product.png" />
          <div class="vc-margin_l vc-font-size_xl vc-font-weight_medium">
            {{
              $t("DYNAMIC_CONTENT.PAGES.CONTENT_ITEMS_LIST.LIST.TABLE.IS_EMPTY")
            }}
          </div>
          <vc-button @click="addContentItem">{{
            $t("DYNAMIC_CONTENT.PAGES.CONTENT_ITEMS_LIST.LIST.TABLE.ADD_ITEM")
          }}</vc-button>
        </div>
      </template>

      <!-- Image column override -->
      <template v-slot:item_image="itemData">
        <div class="vc-flex vc-flex-justify_center">
          <VcIcon
            size="xxl"
            class="content-items-list__icon"
            :icon="
              itemData.item.objectType === 'DynamicContentFolder'
                ? 'fa fa-folder'
                : 'fa fa-location-arrow'
            "
          ></VcIcon>
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
              class="vc-margin-top_m vc-fill_width vc-flex vc-flex-justify_space-between"
            >
              <div class="vc-ellipsis vc-flex-grow_1">
                <VcHint>{{
                  $t(
                    "DYNAMIC_CONTENT.PAGES.CONTENT_ITEMS_LIST.LIST.TABLE.HEADER.CREATED"
                  )
                }}</VcHint>
                <div class="vc-ellipsis vc-margin-top_xs">
                  {{ moment(itemData.item.created).format("L") }}
                </div>
              </div>
              <div class="vc-ellipsis vc-flex-grow_1">
                <VcHint>{{
                  $t(
                    "DYNAMIC_CONTENT.PAGES.CONTENT_ITEMS_LIST.LIST.TABLE.HEADER.DESCRIPTION"
                  )
                }}</VcHint>
                <div class="vc-ellipsis vc-margin-top_xs">
                  {{ itemData.item.description }}
                </div>
              </div>
            </div>

            <div
              class="vc-margin-top_m vc-fill_width vc-flex vc-flex-justify_space-between"
            >
              <div class="vc-ellipsis vc-flex-grow_1">
                <VcHint>{{
                  $t(
                    "DYNAMIC_CONTENT.PAGES.CONTENT_ITEMS_LIST.LIST.TABLE.HEADER.PATH"
                  )
                }}</VcHint>
                <div class="vc-ellipsis vc-margin-top_xs">
                  {{ itemData.item.path }}
                </div>
              </div>
              <div class="vc-ellipsis vc-flex-grow_1">
                <VcHint>{{
                  $t(
                    "DYNAMIC_CONTENT.PAGES.CONTENT_ITEMS_LIST.LIST.TABLE.HEADER.ID"
                  )
                }}</VcHint>
                <div class="vc-ellipsis vc-margin-top_xs">
                  {{ itemData.item.id }}
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
  ref,
  reactive,
  onMounted,
  watch,
} from "vue";

export default defineComponent({
  url: "content-items-list",
});
</script>

<script lang="ts" setup>
import { useFunctions, useI18n } from "@virtoshell/core";
import {
  IActionBuilderResult,
  IBladeToolbar,
  ITableColumns,
} from "../../../../types";
import moment from "moment";
import {
  useContent,
  useContentItem,
  useContentItemFolder,
} from "../../composables";
import ContentItemFolder from "./content-item-folder.vue";
import {
  DynamicContentFolder,
  DynamicContentItem,
} from "@virtoshell/api-client";
import ContentItem from "./content-item.vue";

interface IContentType {
  responseGroup: string;
  folderId?: string;
}

interface IBreadcrumbs {
  id?: number | string;
  title: string;
  icon?: string;
  clickHandler?(id: string): void;
}

defineProps({
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
});

const emit = defineEmits(["page:open", "page:close"]);
const { t } = useI18n();
const selectedItemId = ref();
const contentType = ref<IContentType>({ responseGroup: "18" });
const {
  contentItems,
  loading,
  totalCount,
  pages,
  currentPage,
  searchQuery,
  loadContentItems,
} = useContent(contentType.value);

const { deleteContentFolder } = useContentItemFolder();
const { deleteContentItemDetails } = useContentItem();

const { debounce } = useFunctions();
const searchValue = ref();
const title = t("DYNAMIC_CONTENT.PAGES.CONTENT_ITEMS_LIST.LIST.TITLE");
const sort = ref("startDate:DESC");
const bladeToolbar = reactive<IBladeToolbar[]>([
  {
    id: "refresh",
    title: computed(() =>
      t("DYNAMIC_CONTENT.PAGES.CONTENT_ITEMS_LIST.LIST.TOOLBAR.REFRESH")
    ),
    icon: "fas fa-sync-alt",
    clickHandler() {
      reload();
    },
  },
  {
    id: "add",
    title: computed(() =>
      t("DYNAMIC_CONTENT.PAGES.CONTENT_ITEMS_LIST.LIST.TOOLBAR.ADD")
    ),
    icon: "fas fa-plus",
    dropdownItems: [
      {
        id: 1,
        icon: "fa fa-folder",
        title: "Content item folder",
        clickHandler() {
          emit("page:open", {
            component: ContentItemFolder,
            componentOptions: { folderId: contentType.value.folderId },
          });
        },
      },
      {
        id: 2,
        icon: "fas fa-location-arrow",
        title: "Content item",
        clickHandler() {
          addContentItem();
        },
      },
    ],
  },
]);

const breadcrumbs = ref<IBreadcrumbs[]>([
  {
    title: "Back",
    icon: "fas fa-arrow-left",
    async clickHandler() {
      if (breadcrumbs.value.length > 2) {
        const prevItem = breadcrumbs.value[breadcrumbs.value.length - 2];
        breadcrumbs.value.splice(breadcrumbs.value.length - 1, 1);
        contentType.value.folderId = prevItem.id as string;
      }
    },
  },
]);

const columns = ref<ITableColumns[]>([
  {
    id: "image",
    title: t(
      "DYNAMIC_CONTENT.PAGES.CONTENT_ITEMS_LIST.LIST.TABLE.HEADER.IMAGE"
    ),
    alwaysVisible: true,
    width: 70,
    align: "center",
  },
  {
    id: "name",
    title: t("DYNAMIC_CONTENT.PAGES.CONTENT_ITEMS_LIST.LIST.TABLE.HEADER.NAME"),
    alwaysVisible: true,
    sortable: true,
  },
  {
    id: "createdDate",
    title: t(
      "DYNAMIC_CONTENT.PAGES.CONTENT_ITEMS_LIST.LIST.TABLE.HEADER.CREATED"
    ),
    sortable: true,
    alwaysVisible: true,
    type: "date",
    format: "L",
  },
  {
    id: "description",
    title: t(
      "DYNAMIC_CONTENT.PAGES.CONTENT_ITEMS_LIST.LIST.TABLE.HEADER.DESCRIPTION"
    ),
    sortable: true,
  },
  {
    id: "path",
    title: t("DYNAMIC_CONTENT.PAGES.CONTENT_ITEMS_LIST.LIST.TABLE.HEADER.PATH"),
    sortable: true,
  },
  {
    id: "id",
    title: t("DYNAMIC_CONTENT.PAGES.CONTENT_ITEMS_LIST.LIST.TABLE.HEADER.ID"),
    sortable: true,
  },
]);

watch(sort, async (value) => {
  await loadContentItems({ ...searchQuery.value, sort: value });
});

watch(
  () => breadcrumbs,
  async () => {
    await loadContentItems({ sort: sort.value });
  },
  { deep: true }
);

onMounted(async () => {
  contentType.value.folderId = "ContentItem";
  breadcrumbs.value.push({
    id: "ContentItem",
    title: t(
      "DYNAMIC_CONTENT.PAGES.CONTENT_ITEMS_LIST.LIST.BREADCRUMBS.ALL_ITEMS"
    ),
    clickHandler: (id: string) => handleBreadcrumbs(id),
  });
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
  const sortBy = [":DESC", ":ASC", ""];
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

const onItemClick = async (item: DynamicContentFolder | DynamicContentItem) => {
  if (item.objectType === "DynamicContentFolder") {
    contentType.value.folderId = item.id;
    const isBreadcrumbExist = breadcrumbs.value.find((x) => x.id === item.id);
    if (!isBreadcrumbExist) {
      breadcrumbs.value.push({
        id: item.id,
        title: item.name,
        clickHandler: (id: string) => handleBreadcrumbs(id),
      });
    }
  } else {
    openEntry(item);
  }
};

const actionBuilder = (
  item: DynamicContentFolder | DynamicContentItem
): IActionBuilderResult[] => {
  return [
    {
      icon: "fas fa-trash",
      title: computed(() =>
        t("DYNAMIC_CONTENT.PAGES.CONTENT_ITEMS_LIST.LIST.ACTIONS.DELETE")
      ),
      variant: "danger",
      async clickHandler() {
        if (item.objectType === '"DynamicContentFolder"') {
          await deleteContentFolder({ id: item.id });
        } else {
          await deleteContentItemDetails({ id: item.id });
        }
        await reload();
      },
    },
    {
      icon: "fa fa-edit",
      title: computed(() =>
        t("DYNAMIC_CONTENT.PAGES.CONTENT_ITEMS_LIST.LIST.ACTIONS.MANAGE")
      ),
      clickHandler() {
        openEntry(item);
      },
    },
  ];
};

function openEntry(item: DynamicContentFolder | DynamicContentItem) {
  emit("page:open", {
    component:
      item.objectType === "DynamicContentFolder"
        ? ContentItemFolder
        : ContentItem,
    param: item.id,
    onOpen() {
      selectedItemId.value = item.id;
    },
    onClose() {
      selectedItemId.value = undefined;
    },
  });
}

function addContentItem() {
  emit("page:open", {
    component: ContentItem,
    componentOptions: { folderId: contentType.value.folderId },
  });
}

function handleBreadcrumbs(id: string) {
  contentType.value.folderId = id;
  const item = breadcrumbs.value.findIndex((x) => x.id === id);
  breadcrumbs.value.splice(item + 1);
}

defineExpose({
  title,
  reload,
});
</script>

<style lang="less" scoped>
.content-items-list {
  &__icon {
    color: #a9bfd2;
  }
}
</style>
