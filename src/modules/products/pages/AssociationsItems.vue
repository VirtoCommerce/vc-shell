<template>
  <VcBlade
    v-loading="loading"
    :title="title"
    :expanded="expanded"
    :closable="closable"
    width="50%"
    :toolbar-items="bladeToolbar"
    @close="$emit('close:blade')"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <VcTable
      :items="items"
      :columns="columns"
      state-key="associations_items"
      :total-count="totalCount"
      :pages="pages"
      :current-page="currentPage"
      :loading="loading"
      :search-value="searchValue"
      multiselect
      @selection-changed="onSelectionChanged"
      @search:change="onSearchList"
      @pagination-click="onPaginationClick"
    >
      <template #[`item_quantity`]="{ item }">
        <div v-if="selectedItemIds.includes(item.id!)">
          <VcInput
            :model-value="item.quantity"
            type="number"
            min="0"
            step="1"
            @update:model-value="(e) => onQuantityChange(item, e as string)"
          ></VcInput>
        </div>
        <div v-else></div>
      </template>
    </VcTable>
  </VcBlade>
</template>

<script lang="ts" setup>
import { IBladeToolbar, IParentCallArgs, ITableColumns } from "@vc-shell/framework";
import { useAssociationItems } from "../composables/useAssociationsItems";
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import * as _ from "lodash-es";
import { ISellerProduct } from "@vcmp-vendor-portal/api/marketplacevendor";

export interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
  options?: {
    type: string;
  };
}

export interface Emits {
  (event: "parent:call", args: IParentCallArgs): void;
  (event: "collapse:blade"): void;
  (event: "expand:blade"): void;
  (event: "close:blade"): void;
}

defineOptions({
  name: "AssociationsItems",
});

const emit = defineEmits<Emits>();

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
  param: undefined,
});

const { items, totalCount, pages, currentPage, searchQuery, loading, searchAssociationItems } = useAssociationItems();
const { t } = useI18n({ useScope: "global" });

const selectedItemIds = ref<string[]>([]);
const selectedItems = ref<(ISellerProduct & { quantity: number })[]>([]);

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "confirm",
    title: computed(() => t("PRODUCTS.PAGES.ASSOCIATIONS_ITEMS.TOOLBAR.CONFIRM")),
    icon: "fas fa-check",
    disabled: computed(() => selectedItemIds.value.length === 0),
    clickHandler() {
      emit("parent:call", {
        method: "confirm",
        args: {
          type: props.options?.type,
          selectedItems: selectedItems.value,
        },
      });
      emit("close:blade");
    },
  },
]);
const searchValue = ref();
const title = t("PRODUCTS.PAGES.ASSOCIATIONS_ITEMS.TITLE");

const columns = ref<ITableColumns[]>([
  {
    id: "imgSrc",
    title: computed(() => t("PRODUCTS.PAGES.ASSOCIATIONS_ITEMS.TABLE.HEADER.IMAGES")),
    width: "60px",
    type: "image",
  },
  {
    id: "name",
    title: computed(() => t("PRODUCTS.PAGES.ASSOCIATIONS_ITEMS.TABLE.HEADER.NAME")),
  },
  {
    id: "quantity",
    title: computed(() => t("PRODUCTS.PAGES.ASSOCIATIONS_ITEMS.TABLE.HEADER.QUANTITY")),
    type: "number",
    editable: true,
  },
]);

const onSearchList = _.debounce(async (keyword: string | undefined) => {
  searchValue.value = keyword;
  await searchAssociationItems({
    ...searchQuery.value,
    keyword,
  });
}, 1000);

const onPaginationClick = async (page: number) => {
  await searchAssociationItems({
    ...searchQuery.value,
    skip: (page - 1) * (searchQuery.value.take ?? 10),
  });
};

const onSelectionChanged = (items: (ISellerProduct & { quantity: number })[]) => {
  selectedItemIds.value = items.map((item) => item.id).filter((x): x is string => x !== null);
  selectedItems.value = items;
};

const onQuantityChange = (item: ISellerProduct, e: string) => {
  const index = selectedItems.value.findIndex((i) => i.id === item.id);
  if (index !== -1) {
    selectedItems.value[index].quantity = parseInt(e);
  }
};

onMounted(async () => {
  await searchAssociationItems();
});

defineExpose({
  title,
});
</script>

<style lang="scss" scoped></style>
