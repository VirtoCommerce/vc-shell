<template>
  <VcBlade
    :title="$t('DYNAMIC_CONTENT.PAGES.CONTENT_ITEMS.LIST.TITLE')"
    width="50%"
    :expanded="expanded"
    :closable="closable"
    v-loading="loading"
    :toolbarItems="bladeToolbar"
    @close="$emit('page:close')"
  >
    <!-- Blade contents -->
    <VcTable
      :expanded="expanded"
      :loading="loading"
      :columns="columns"
      :items="dynamicProperties"
      :selectedItemId="selectedItemId"
      @itemClick="onItemClick"
      :totalCount="totalCount"
      :pages="pages"
      :header="false"
      :currentPage="currentPage"
      @paginationClick="onPaginationClick"
      @headerClick="onHeaderClick"
      @scroll:ptr="reload"
    >
      <!-- Not found template -->
      <template v-slot:notfound>
        <div
          class="w-full h-full box-border flex flex-col items-center justify-center"
        >
          <img src="/assets/empty-product.png" />
          <div class="m-4 text-xl font-medium">
            {{ $t("DYNAMIC_CONTENT.PAGES.CONTENT_ITEMS.LIST.TABLE.NOT_FOUND") }}
          </div>
          <VcButton @click="resetSearch">
            {{
              $t("DYNAMIC_CONTENT.PAGES.CONTENT_ITEMS.LIST.TABLE.RESET_SEARCH")
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
            {{ $t("DYNAMIC_CONTENT.PAGES.CONTENT_ITEMS.LIST.TABLE.IS_EMPTY") }}
          </div>
          <VcButton>{{
            $t("DYNAMIC_CONTENT.PAGES.CONTENT_ITEMS.LIST.TABLE.ADD_ITEM")
          }}</VcButton>
        </div>
      </template>

      <!-- Image column override -->
      <template v-slot:item_image="itemData">
        <div class="flex justify-center">
          <VcIcon
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
                class="text-ellipsis overflow-hidden whitespace-nowrap grow-[2] basis-0"
              >
                <VcHint>{{
                  $t(
                    "DYNAMIC_CONTENT.PAGES.CONTENT_ITEMS.LIST.TABLE.HEADER.CREATED"
                  )
                }}</VcHint>
                <div
                  class="text-ellipsis overflow-hidden whitespace-nowrap mt-1"
                >
                  {{ moment(itemData.item.created).format("L") }}
                </div>
              </div>
              <div
                class="text-ellipsis overflow-hidden whitespace-nowrap grow basis-0"
              >
                <VcHint>{{
                  $t(
                    "DYNAMIC_CONTENT.PAGES.CONTENT_ITEMS.LIST.TABLE.HEADER.DESCRIPTION"
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
                    "DYNAMIC_CONTENT.PAGES.CONTENT_ITEMS.LIST.TABLE.HEADER.PATH"
                  )
                }}</VcHint>
                <div
                  class="text-ellipsis overflow-hidden whitespace-nowrap mt-1"
                >
                  {{ itemData.item.path }}
                </div>
              </div>
              <div
                class="text-ellipsis overflow-hidden whitespace-nowrap grow basis-0"
              >
                <VcHint>{{
                  $t("DYNAMIC_CONTENT.PAGES.CONTENT_ITEMS.LIST.TABLE.HEADER.ID")
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

<script lang="ts" setup>
import { onMounted, reactive, ref, watch } from "vue";
import { useFunctions, useI18n } from "@virtoshell/core";
import { IBladeToolbar, ITableColumns } from "../../../../types";
import moment from "moment";
import ContentItemEdit from "./content-item.vue";
import { useContentItems } from "../../composables";
import useDynamicProperties from "../../composables/useDynamicProperties";
import ContentManageProperty from "./content-manage-property.vue";

const props = defineProps({
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
// const {
//   contentItems,
//   loading,
//   totalCount,
//   pages,
//   currentPage,
//   searchQuery,
//   loadContentItems,
// } = useContentItems({ responseGroup: "18" });
const searchValue = ref();
const { debounce } = useFunctions();
const {
  getDynamicProperties,
  dynamicProperties,
  loading,
  currentPage,
  searchQuery,
  pages,
  totalCount,
} = useDynamicProperties({ take: 20, objectType: props.options.objectType });
const sort = ref("startDate:DESC");
const title = t("DYNAMIC_CONTENT.PAGES.CONTENT_ITEMS.LIST.TITLE");
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
      emit("page:open", {
        component: ContentManageProperty,
        componentOptions: {
          objectType: props.options.objectType,
        },
      });
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
]);

watch(sort, async (value) => {
  await getDynamicProperties({ ...searchQuery.value, sort: value });
});

onMounted(async () => {
  if (props.options.objectType) {
    await getDynamicProperties({ ...searchQuery.value });
  }
});

async function reload() {
  await getDynamicProperties({
    ...searchQuery.value,
    skip: (currentPage.value - 1) * 20,
  });
}

async function onPaginationClick(page: number) {
  await getDynamicProperties({
    skip: (page - 1) * 20,
  });
}

const onItemClick = (item: { id: string }) => {
  emit("page:open", {
    component: ContentManageProperty,
    componentOptions: {
      item,
    },
    onOpen() {
      selectedItemId.value = item.id;
    },
    onClose() {
      selectedItemId.value = undefined;
    },
  });
};

defineExpose({
  title,
  reload,
});
</script>
