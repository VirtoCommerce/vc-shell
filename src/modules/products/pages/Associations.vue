<template>
  <VcBlade
    v-loading="loading"
    :title="$t('PRODUCTS.PAGES.ASSOCIATIONS.TITLE')"
    :expanded="expanded"
    :closable="closable"
    width="50%"
    :toolbar-items="bladeToolbar"
    @close="$emit('close:blade')"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <VcContainer class="tw-p-2">
      <div class="tw-flex tw-flex-col tw-gap-4">
        <VcCard
          v-for="(item, index) in items"
          :key="`${index}_${index}`"
          :header="$t(`PRODUCTS.PAGES.ASSOCIATIONS.TYPES.${_.snakeCase(item.type).toUpperCase()}`)"
          is-collapsable
          :is-collapsed="restoreCollapsed(item.type)"
          @state:collapsed="handleCollapsed(item.type, $event)"
        >
          <VcTable
            :items="item.associations"
            :state-key="`${index}_${index}`"
            :columns="columns"
            :footer="false"
            :header="false"
            :loading="loading"
            multiselect
            editing
            :add-new-row-button="{
              show: true,
              title: $t('PRODUCTS.PAGES.ASSOCIATIONS.TABLE.ADD_NEW'),
            }"
            enable-item-actions
            :item-action-builder="itemActionBuilder"
            @on-add-new-row="onAddNewRow(item.type)"
            @selection-changed="onSelectionChanged"
          >
          </VcTable>
        </VcCard>
      </div>
    </VcContainer>
  </VcBlade>
</template>

<script lang="ts" setup>
import {
  IActionBuilderResult,
  IBladeToolbar,
  IParentCallArgs,
  ITableColumns,
  useBladeNavigation,
  usePopup,
} from "@vc-shell/framework";
import { useAssociations } from "../composables";
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import * as _ from "lodash-es";
import {
  IOffer,
  IProductAssociation,
  ProductAssociation,
  SellerProduct,
} from "@vcmp-vendor-portal/api/marketplacevendor";

export interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
}

export interface Emits {
  (event: "parent:call", args: IParentCallArgs): void;
  (event: "collapse:blade"): void;
  (event: "expand:blade"): void;
  (event: "close:blade"): void;
}

defineOptions({
  name: "Associations",
});

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
  param: undefined,
});

const emit = defineEmits<Emits>();

const { t } = useI18n({ useScope: "global" });

const {
  loading,
  searchAssociations,
  searchQuery,
  items,
  getTypes,
  addAssociations,
  removeAssociations: remove,
} = useAssociations();
const { showConfirmation } = usePopup();
const { openBlade, resolveBladeByName } = useBladeNavigation();

const title = computed(() => t("PRODUCTS.PAGES.ASSOCIATIONS.TITLE"));

const selectedItemIds = ref<string[]>([]);

const columns = ref<ITableColumns[]>([
  {
    id: "imgSrc",
    title: computed(() => t("PRODUCTS.PAGES.ASSOCIATIONS.TABLE.HEADER.IMAGES")),
    width: "60px",
    alwaysVisible: true,
    type: "image",
  },
  {
    id: "name",
    title: computed(() => t("PRODUCTS.PAGES.ASSOCIATIONS.TABLE.HEADER.NAME")),
    alwaysVisible: true,
  },
  {
    id: "quantity",
    title: computed(() => t("PRODUCTS.PAGES.ASSOCIATIONS.TABLE.HEADER.QUANTITY")),
  },
]);

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "remove",
    icon: "fas fa-trash",
    title: computed(() => t("PRODUCTS.PAGES.ASSOCIATIONS.TOOLBAR.REMOVE")),
    disabled: computed(() => selectedItemIds.value.length === 0),
    clickHandler: removeAssociations,
  },
]);

async function removeAssociations() {
  if (
    await showConfirmation(
      t("PRODUCTS.PAGES.ALERTS.DELETE_SELECTED_CONFIRMATION_ASSOCIATIONS.MESSAGE", {
        count: selectedItemIds.value.length,
      }),
    )
  ) {
    await remove(selectedItemIds.value);
    emit("parent:call", {
      method: "updateActiveWidgetCount",
    });
    emit("parent:call", {
      method: "markProductDirty",
    });
    await reload();
  }
}

const reload = async () => {
  selectedItemIds.value = [];
  if (props.param) {
    await searchAssociations({
      ...searchQuery.value,
      objectIds: [props.param],
    });
  }
};

const onAddNewRow = async (type?: string) => {
  if (type) {
    await openBlade({
      blade: resolveBladeByName("AssociationsItems"),
      options: {
        type,
      },
    });
  }
};

function handleCollapsed(key: string, value: boolean): void {
  localStorage?.setItem(key, `${value}`);
}

function restoreCollapsed(key: string): boolean {
  return localStorage?.getItem(key) === "true";
}

async function confirm(args: { type: string; selectedItems: (SellerProduct & { quantity: number })[] }) {
  if (props.param) {
    await addAssociations({ ...args, itemId: props.param });
    emit("parent:call", {
      method: "updateActiveWidgetCount",
    });
    emit("parent:call", {
      method: "markProductDirty",
    });
    await reload();
  }
}

const onSelectionChanged = (items: IProductAssociation[]) => {
  selectedItemIds.value = items.map((item) => item.id).filter((x): x is string => x !== null);
};

const itemActionBuilder = (): IActionBuilderResult[] => {
  const result: IActionBuilderResult[] = [];
  result.push({
    icon: "fas fa-trash",
    title: computed(() => t("PRODUCTS.PAGES.ASSOCIATIONS.TOOLBAR.REMOVE")),
    type: "danger",
    position: "left",
    async clickHandler(item: IProductAssociation) {
      if (item.id) {
        if (!selectedItemIds.value.includes(item.id)) {
          selectedItemIds.value.push(item.id);
        }
        await removeAssociations();
        selectedItemIds.value = [];
      }
    },
  });

  return result;
};

onMounted(async () => {
  await getTypes();
  await reload();
});

defineExpose({
  title,
  reload,
  confirm,
});
</script>

<style lang="scss" scoped></style>
