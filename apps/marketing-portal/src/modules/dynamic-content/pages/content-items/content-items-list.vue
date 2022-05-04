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
    <div class="pl-4 pt-4">
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
          class="w-full h-full box-border flex flex-col items-center justify-center"
        >
          <img src="/assets/empty-product.png" />
          <div class="m-4 text-xl font-medium">
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
          class="w-full h-full box-border flex flex-col items-center justify-center"
        >
          <img src="/assets/empty-product.png" />
          <div class="m-4 text-xl font-medium">
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
        <div class="flex justify-center">
          <VcIcon
            size="xxl"
            class="text-[#a9bfd2]"
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
        <div class="p-3 flex flex-nowrap">
          <div class="grow basis-0 ml-3">
            <div class="font-bold text-lg">
              {{ itemData.item.name }}
            </div>

            <div class="mt-3 w-full flex justify-between">
              <div
                class="text-ellipsis overflow-hidden whitespace-nowrap grow basis-0"
              >
                <VcHint>{{
                  $t(
                    "DYNAMIC_CONTENT.PAGES.CONTENT_ITEMS_LIST.LIST.TABLE.HEADER.CREATED"
                  )
                }}</VcHint>
                <div
                  class="text-ellipsis overflow-hidden whitespace-nowrap mt-1"
                >
                  {{ moment(itemData.item.created).format("L") }}
                </div>
              </div>
              <div
                class="text-ellipsis overflow-hidden whitespace-nowrap vc-grow basis-0"
              >
                <VcHint>{{
                  $t(
                    "DYNAMIC_CONTENT.PAGES.CONTENT_ITEMS_LIST.LIST.TABLE.HEADER.DESCRIPTION"
                  )
                }}</VcHint>
                <div
                  class="text-ellipsis overflow-hidden whitespace-nowrap mt-1"
                >
                  {{ itemData.item.description }}
                </div>
              </div>
            </div>

            <div class="mt-3 w-full flex justify-between">
              <div
                class="text-ellipsis overflow-hidden whitespace-nowrap vc-grow basis-0"
              >
                <VcHint>{{
                  $t(
                    "DYNAMIC_CONTENT.PAGES.CONTENT_ITEMS_LIST.LIST.TABLE.HEADER.PATH"
                  )
                }}</VcHint>
                <div
                  class="text-ellipsis overflow-hidden whitespace-nowrap mt-1"
                >
                  {{ itemData.item.path }}
                </div>
              </div>
              <div
                class="text-ellipsis overflow-hidden whitespace-nowrap vc-grow basis-0"
              >
                <VcHint>{{
                  $t(
                    "DYNAMIC_CONTENT.PAGES.CONTENT_ITEMS_LIST.LIST.TABLE.HEADER.ID"
                  )
                }}</VcHint>
                <div
                  class="text-ellipsis overflow-hidden whitespace-nowrap mt-1"
                >
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
  useContentItems,
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
} = useContentItems(contentType.value);

const { deleteContentFolder } = useContentItemFolder();
const { deleteContentItemDetails } = useContentItem();

const { debounce } = useFunctions();
const searchValue = ref();
const title = t("DYNAMIC_CONTENT.PAGES.CONTENT_ITEMS_LIST.LIST.TITLE");
const sort = ref("created:DESC");
const breadcrumbs = ref<IBreadcrumbs[]>([]);

const bladeToolbar = reactive<IBladeToolbar[]>([
  {
    id: "back",
    title: computed(() =>
      t("DYNAMIC_CONTENT.PAGES.CONTENT_ITEMS_LIST.LIST.TOOLBAR.BACK")
    ),
    icon: "fas fa-arrow-left",
    disabled: computed(() => breadcrumbs.value.length === 1),
    clickHandler() {
      if (breadcrumbs.value.length > 1) {
        const prevItem = breadcrumbs.value[breadcrumbs.value.length - 2];
        breadcrumbs.value.splice(breadcrumbs.value.length - 1, 1);
        contentType.value.folderId = prevItem.id as string;
      }
    },
  },
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
        title: t(
          "DYNAMIC_CONTENT.PAGES.CONTENT_ITEMS_LIST.LIST.TOOLBAR.DROPDOWN.CONTENT_ITEM_FOLDER"
        ),
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
        title: t(
          "DYNAMIC_CONTENT.PAGES.CONTENT_ITEMS_LIST.LIST.TOOLBAR.DROPDOWN.CONTENT_ITEM"
        ),
        clickHandler() {
          addContentItem();
        },
      },
    ],
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
        if (item.objectType === "DynamicContentFolder") {
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
