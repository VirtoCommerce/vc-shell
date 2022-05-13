<template>
  <VcBlade
    :title="$t('DYNAMIC_CONTENT.PAGES.CONTENT_PLACEHOLDERS_LIST.TITLE')"
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
      :items="contentPlaces"
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
                "DYNAMIC_CONTENT.PAGES.CONTENT_PLACEHOLDERS_LIST.LIST.TABLE.NOT_FOUND"
              )
            }}
          </div>
          <VcButton @click="resetSearch">
            {{
              $t(
                "DYNAMIC_CONTENT.PAGES.CONTENT_PLACEHOLDERS_LIST.LIST.TABLE.RESET_SEARCH"
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
              $t(
                "DYNAMIC_CONTENT.PAGES.CONTENT_PLACEHOLDERS_LIST.LIST.TABLE.EMPTY"
              )
            }}
          </div>
          <VcButton>{{
            $t(
              "DYNAMIC_CONTENT.PAGES.CONTENT_PLACEHOLDERS_LIST.LIST.TABLE.ADD_PLACEHOLDER"
            )
          }}</VcButton>
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

      <template v-slot:mobile-item="itemData">
        <div class="p-3 flex flex-nowrap">
          <div class="grow basis-0 ml-3">
            <div class="dont-bold text-lg">
              {{ itemData.item.name }}
            </div>

            <div class="mt-3 w-full flex justify-between">
              <div
                class="text-ellipsis overflow-hidden whitespace-nowrap grow-[2] basis-0"
              >
                <VcHint>{{
                  $t(
                    "DYNAMIC_CONTENT.PAGES.CONTENT_PLACEHOLDERS_LIST.LIST.TABLE.HEADER.CREATED"
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
                    "DYNAMIC_CONTENT.PAGES.CONTENT_PLACEHOLDERS_LIST.LIST.TABLE.HEADER.DESCRIPTION"
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
                class="text-ellipsis overflow-hidden whitespace-nowrap grow-[2] basis-0"
              >
                <VcHint>{{
                  $t(
                    "DYNAMIC_CONTENT.PAGES.CONTENT_PLACEHOLDERS_LIST.LIST.TABLE.HEADER.PATH"
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
                    "DYNAMIC_CONTENT.PAGES.CONTENT_PLACEHOLDERS_LIST.LIST.TABLE.HEADER.ID"
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
  onMounted,
  reactive,
  ref,
  watch,
  computed,
} from "vue";

export default defineComponent({
  url: "content-placeholders",
});
</script>

<script lang="ts" setup>
import {
  IActionBuilderResult,
  IBladeToolbar,
  ITableColumns,
} from "../../../../types";
import { useFunctions, useI18n } from "@virtoshell/core";
import {
  useContentItemFolder,
  useContentPlace,
  useContentPlaces,
} from "../../composables";
import moment from "moment";
import {
  DynamicContentFolder,
  DynamicContentItem,
} from "@virtoshell/api-client";
import ContentItemFolder from "../content-items/content-item-folder.vue";
import ContentPlaceholder from "./content-placeholder.vue";

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
const emit = defineEmits(["page:open", "page:close"]);
const { t } = useI18n();
const contentType = ref<IContentType>({
  responseGroup: "20",
});
const {
  contentPlaces,
  loading,
  totalCount,
  pages,
  currentPage,
  searchQuery,
  loadContentPlaces,
} = useContentPlaces(contentType.value);
const { deleteContentPlaceDetails } = useContentPlace();
const { deleteContentFolder } = useContentItemFolder();
const searchValue = ref();
const { debounce } = useFunctions();
const selectedItemId = ref();
const title = t("DYNAMIC_CONTENT.PAGES.CONTENT_PLACEHOLDERS_LIST.TITLE");
const sort = ref("created:DESC");
const breadcrumbs = ref<IBreadcrumbs[]>([]);
const bladeToolbar = reactive<IBladeToolbar[]>([
  {
    id: "back",
    title: computed(() =>
      t("DYNAMIC_CONTENT.PAGES.CONTENT_PLACEHOLDERS_LIST.LIST.TOOLBAR.BACK")
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
    title: t(
      "DYNAMIC_CONTENT.PAGES.CONTENT_PLACEHOLDERS_LIST.LIST.TOOLBAR.REFRESH"
    ),
    icon: "fas fa-sync-alt",
    clickHandler() {
      reload();
    },
  },
  {
    id: "add",
    title: t(
      "DYNAMIC_CONTENT.PAGES.CONTENT_PLACEHOLDERS_LIST.LIST.TOOLBAR.ADD"
    ),
    icon: "fas fa-plus",
    dropdownItems: [
      {
        id: 1,
        icon: "fa fa-folder",
        title: t(
          "DYNAMIC_CONTENT.PAGES.CONTENT_PLACEHOLDERS_LIST.LIST.TOOLBAR.DROPDOWN.PLACEHOLDER_FOLDER"
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
          "DYNAMIC_CONTENT.PAGES.CONTENT_PLACEHOLDERS_LIST.LIST.TOOLBAR.DROPDOWN.PLACEHOLDER"
        ),
        clickHandler() {
          addContentItem();
        },
      },
    ],
  },
]);

function addContentItem() {
  emit("page:open", {
    component: ContentPlaceholder,
    componentOptions: { folderId: contentType.value.folderId },
  });
}

const columns = ref<ITableColumns[]>([
  {
    id: "image",
    title: t(
      "DYNAMIC_CONTENT.PAGES.CONTENT_PLACEHOLDERS_LIST.LIST.TABLE.HEADER.IMAGE"
    ),
    alwaysVisible: true,
    width: 70,
    align: "center",
  },
  {
    id: "name",
    title: t(
      "DYNAMIC_CONTENT.PAGES.CONTENT_PLACEHOLDERS_LIST.LIST.TABLE.HEADER.NAME"
    ),
    alwaysVisible: true,
    width: 120,
    sortable: true,
  },
  {
    id: "createdDate",
    title: t(
      "DYNAMIC_CONTENT.PAGES.CONTENT_PLACEHOLDERS_LIST.LIST.TABLE.HEADER.CREATED"
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
      "DYNAMIC_CONTENT.PAGES.CONTENT_PLACEHOLDERS_LIST.LIST.TABLE.HEADER.DESCRIPTION"
    ),
    width: 150,
    sortable: true,
  },
  {
    id: "path",
    title: t(
      "DYNAMIC_CONTENT.PAGES.CONTENT_PLACEHOLDERS_LIST.LIST.TABLE.HEADER.PATH"
    ),
    width: 150,
    sortable: true,
  },
  {
    id: "id",
    title: t(
      "DYNAMIC_CONTENT.PAGES.CONTENT_PLACEHOLDERS_LIST.LIST.TABLE.HEADER.ID"
    ),
    sortable: true,
    width: 300,
  },
]);

watch(sort, async (value) => {
  await loadContentPlaces({ ...searchQuery.value, sort: value });
});

watch(
  () => breadcrumbs,
  async () => {
    await loadContentPlaces({ sort: sort.value });
  },
  { deep: true }
);

onMounted(async () => {
  contentType.value.folderId = "ContentPlace";
  breadcrumbs.value.push({
    id: "ContentPlace",
    title: t(
      "DYNAMIC_CONTENT.PAGES.CONTENT_PLACEHOLDERS_LIST.LIST.BREADCRUMBS.ALL_PLACEHOLDERS"
    ),
    clickHandler: (id: string) => handleBreadcrumbs(id),
  });
  await loadContentPlaces({ sort: sort.value });
});

function handleBreadcrumbs(id: string) {
  contentType.value.folderId = id;
  const item = breadcrumbs.value.findIndex((x) => x.id === id);
  breadcrumbs.value.splice(item + 1);
}

async function reload() {
  await loadContentPlaces({
    ...searchQuery.value,
    skip: (currentPage.value - 1) * searchQuery.value.take,
    sort: sort.value,
  });
}

async function onPaginationClick(page: number) {
  await loadContentPlaces({
    skip: (page - 1) * 20,
  });
}

const onSearchList = debounce(async (keyword: string) => {
  searchValue.value = keyword;
  await loadContentPlaces({
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
  await loadContentPlaces({
    ...searchQuery.value,
    keyword: "",
  });
}

const onItemClick = async (item: DynamicContentFolder | DynamicContentItem) => {
  console.log(item);
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

function openEntry(item: DynamicContentFolder | DynamicContentItem) {
  emit("page:open", {
    component:
      item.objectType === "DynamicContentFolder"
        ? ContentItemFolder
        : ContentPlaceholder,
    param: item.id,
    onOpen() {
      selectedItemId.value = item.id;
    },
    onClose() {
      selectedItemId.value = undefined;
    },
  });
}

const actionBuilder = (
  item: DynamicContentFolder | DynamicContentItem
): IActionBuilderResult[] => {
  return [
    {
      icon: "fas fa-trash",
      title: computed(() =>
        t("DYNAMIC_CONTENT.PAGES.CONTENT_PLACEHOLDERS_LIST.LIST.ACTIONS.DELETE")
      ),
      variant: "danger",
      async clickHandler() {
        if (item.objectType === "DynamicContentFolder") {
          await deleteContentFolder({ id: item.id });
        } else {
          await deleteContentPlaceDetails({ id: item.id });
        }
        await reload();
      },
    },
    {
      icon: "fa fa-edit",
      title: computed(() =>
        t("DYNAMIC_CONTENT.PAGES.CONTENT_PLACEHOLDERS_LIST.LIST.ACTIONS.MANAGE")
      ),
      clickHandler() {
        openEntry(item);
      },
    },
  ];
};

defineExpose({
  title,
  reload,
});
</script>
