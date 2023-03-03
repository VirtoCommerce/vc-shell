<template>
  <VcBlade
    :title="$t('DEFAULT.PAGES.LIST.TITLE')"
    width="50%"
    :expanded="expanded"
    :closable="closable"
    :toolbarItems="bladeToolbar"
    @close="$emit('close:blade')"
  >
    <!-- Blade contents -->
    <VcTable
      :expanded="expanded"
      :empty="empty"
      :notfound="notfound"
      class="tw-grow tw-basis-0"
      :multiselect="true"
      :columns="columns"
      :itemActionBuilder="actionBuilder"
      :sort="sort"
      :searchValue="searchValue"
      :searchPlaceholder="$t('DEFAULT.PAGES.LIST.SEARCH.PLACEHOLDER')"
      :totalLabel="$t('DEFAULT.PAGES.LIST.TABLE.TOTALS')"
      :selectedItemId="selectedItemId"
      @itemClick="onItemClick"
      @headerClick="onHeaderClick"
    >
    </VcTable>
  </VcBlade>
</template>

<script lang="ts">
import { computed, defineComponent, inject, reactive, ref, shallowRef } from "vue";

export default defineComponent({
  url: "/default",
});
</script>

<script lang="ts" setup>
import {
  IBladeEvent,
  IBladeToolbar,
  IParentCallArgs,
  useFunctions,
  useI18n,
  useLogger,
  IActionBuilderResult,
  ITableColumns,
} from "@vc-shell/framework";
import moment from "moment";
// eslint-disable-next-line import/no-unresolved
import emptyImage from "/assets/empty.png";

export interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
  options?: Record<string, unknown>;
}

export interface Emits {
  (event: "parent:call", args: IParentCallArgs): void;
  (event: "close:children"): void;
  (event: "open:blade", blade: IBladeEvent);
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});

const emit = defineEmits<Emits>();

const { t } = useI18n();
const logger = useLogger();
const { debounce } = useFunctions();

const sort = ref("createdDate:DESC");
const searchValue = ref();
const selectedItemId = ref<string>();
const isDesktop = inject("isDesktop");

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "refresh",
    title: computed(() => t("DEFAULT.PAGES.LIST.TOOLBAR.REFRESH")),
    icon: "fas fa-sync-alt",
    // async clickHandler() {},
  },
]);

const tableColumns = ref<ITableColumns[]>([
  {
    id: "imgSrc",
    title: computed(() => t("DEFAULT.PAGES.LIST.TABLE.HEADER.PRODUCT_IMAGE")),
    width: 60,
    alwaysVisible: true,
    type: "image",
  },
  {
    id: "name",
    field: "name",
    title: computed(() => t("DEFAULT.PAGES.LIST.TABLE.HEADER.PRODUCT_NAME")),
    sortable: true,
    alwaysVisible: true,
  },
  {
    id: "createdDate",
    title: computed(() => t("DEFAULT.PAGES.LIST.TABLE.HEADER.CREATED_DATE")),
    width: 140,
    sortable: true,
    type: "date-ago",
  },
]);

const empty = reactive({
  image: emptyImage,
  text: computed(() => t("DEFAULT.PAGES.LIST.TABLE.EMPTY.TITLE")),
  action: computed(() => t("DEFAULT.PAGES.LIST.TABLE.EMPTY.ACTION")),
  // clickHandler: () => {},
});

const notfound = reactive({
  image: emptyImage,
  text: computed(() => t("DEFAULT.PAGES.LIST.TABLE.NOT_FOUND.TITLE")),
  action: computed(() => t("DEFAULT.PAGES.LIST.TABLE.NOT_FOUND.ACTION")),
  clickHandler: async () => {
    searchValue.value = "";
  },
});

const columns = computed(() => {
  if (props.expanded) {
    return tableColumns.value;
  } else {
    return tableColumns.value.filter((item) => item.alwaysVisible === true);
  }
});

const title = computed(() => t("DEFAULT.PAGES.LIST.TITLE"));

const onItemClick = (item: { id: string }) => {
  emit("open:blade", {
    component: shallowRef(),
    param: item.id,
    // onOpen() {},
    // onClose() {},
  });
};

const onHeaderClick = (item: ITableColumns) => {
  const sortBy = [":DESC", ":ASC", ""];
  if (item.sortable) {
    item.sortDirection = (item.sortDirection ?? 0) + 1;
    if (sortBy[item.sortDirection % 3] === "") {
      sort.value = `${sortBy[item.sortDirection % 3]}`;
    } else {
      sort.value = `${item.id}${sortBy[item.sortDirection % 3]}`;
    }
  }
};

const actionBuilder = (item: { status: string }): IActionBuilderResult[] => {
  let result = [];

  result.push({
    icon: "fas fa-trash",
    title: "Delete",
    variant: "danger",
    leftActions: true,
    // clickHandler() {},
  });

  return result;
};

defineExpose({
  title,
});
</script>
