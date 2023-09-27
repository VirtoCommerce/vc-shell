<template>
  <VcBlade
    :expanded="expanded"
    :closable="closable"
    width="50%"
    :toolbar-items="toolbarComputed"
    :title="title"
    @close="$emit('close:blade')"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <VcTable
      class="tw-grow tw-basis-0"
      :loading="loading"
      :expanded="expanded"
      v-bind="bladeOptions?.table"
      :state-key="tableData?.id"
      :items="items"
      :multiselect="tableData?.multiselect"
      :header="tableData?.header"
      :sort="sort"
      :pages="pagination?.pages"
      :current-page="pagination?.currentPage"
      :search-value="searchValue"
      :selected-item-id="selectedItemId"
      :total-label="$t(`${settings.localeKey.trim().toUpperCase()}.PAGES.LIST.TABLE.TOTALS`)"
      :total-count="pagination?.totalCount"
      :active-filter-count="activeFilterCount"
      @item-click="onItemClick"
      @pagination-click="onPaginationClick"
      @selection-changed="onSelectionChanged"
      @header-click="onHeaderClick"
      @load:change="onSearchList"
      @scroll:ptr="reload"
      @search:change="onSearchList"
    >
      <template
        v-if="isFilterVisible"
        #filters="{ closePanel }"
      >
        <filterComponent :close="closePanel" />
      </template>

      <!-- Not found template -->
      <template #notfound>
        <div class="tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-items-center tw-justify-center">
          <div class="tw-m-4 tw-text-xl tw-font-medium">
            {{ $t(`${settings.localeKey.trim().toUpperCase()}.PAGES.LIST.NOT_FOUND.EMPTY`) }}
          </div>
          <VcButton @click="resetSearch">{{
            $t(`${settings.localeKey.trim().toUpperCase()}.PAGES.LIST.NOT_FOUND.RESET`)
          }}</VcButton>
        </div>
      </template>

      <!-- Override table templates-->
      <template
        v-for="(component, key, index) in bladeOptions?.templateOverrideComponents"
        #[`item_${key}`]="itemData"
        :key="`template_override_${index}`"
      >
        <component
          :is="component"
          :context="itemData"
        />
      </template>

      <!-- Override table mobile view -->

      <template
        v-if="bladeOptions.mobileView"
        #mobile-item="itemData"
      >
        <component
          :is="bladeOptions.mobileView"
          :context="itemData"
        ></component>
      </template>
    </VcTable>
  </VcBlade>
</template>
<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Ref,
  VNode,
  computed,
  inject,
  onMounted,
  reactive,
  ref,
  resolveComponent,
  shallowRef,
  unref,
  watch,
} from "vue";
import { useI18n } from "vue-i18n";
import { DynamicGridSchema, ListContentSchema } from "../types";
import useFilterBuilder from "../composables/useFilterBuilder";
import * as _ from "lodash-es";
import { useFunctions } from "../../../../core/composables";
import { IBladeToolbar, ITableColumns } from "../../../../core/types";
import { usePopup } from "../../../index";

export interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
  options?: unknown;
  model?: DynamicGridSchema;
  composables?: Record<string, (...args: any[]) => Record<string, any>>;
}

export interface Emits {
  (event: "close:blade"): void;
  (event: "collapse:blade"): void;
  (event: "expand:blade"): void;
  (event: "close:children"): void;
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
  param: undefined,
});

const { t } = useI18n({ useScope: "global" });
const { showConfirmation } = usePopup();
const { debounce } = useFunctions();
const emit = defineEmits<Emits>();

defineOptions({
  isBladeComponent: true,
});

const settings = computed(() => props.model?.settings);
const title = computed(() => settings.value?.titleTemplate);
const allSelected = ref(false);
const searchValue = ref();
const selectedItemId = ref();
const sort = ref("createdDate:DESC");
const selectedIds = ref<string[]>([]);
const isDesktop = inject<Ref<boolean>>("isDesktop");

const tableData = computed(() => props.model?.content.find((type: ListContentSchema) => type.type === "grid"));
const table = computed(() => {
  const tableScope = {
    columns: tableData.value?.columns,
  };

  return tableScope;
});

const bladeOptions = reactive({
  tableData,
  table,
  templateOverrideComponents: templateOverrideComponents(),
  mobileView: mobileViewComponent(),
});

const { load, remove, items, loading, pagination, query, scope } = props.composables[props.model?.settings?.composable](
  {
    emit,
    props,
  }
);

const { filterComponent, activeFilterCount, isFilterVisible } = useFilterBuilder({
  data: bladeOptions.tableData?.filter,
  query,
  load,
});

const toolbarMethods = _.merge(
  ref({}),
  ref({
    openAddBlade: {
      async clickHandler() {
        if ("openDetailsBlade" in scope && scope.openDetailsBlade && typeof scope.openDetailsBlade === "function") {
          scope.openDetailsBlade();
        }
      },
    },
    refresh: {
      async clickHandler() {
        await reload();
      },
    },
    removeItems: {
      async clickHandler() {
        removeItems();
      },
      disabled: computed(() => !selectedIds.value?.length),
      isVisible: isDesktop.value,
    },
  }),
  ref(scope)
);

const toolbarComputed = computed((): IBladeToolbar[] => {
  return props.model.settings.toolbar.reduce((acc, curr) => {
    const toolbarItemCtx = toolbarMethods.value[curr.method];

    if (toolbarItemCtx) {
      const context =
        typeof toolbarItemCtx === "function"
          ? { clickHandler: async () => await toolbarItemCtx() }
          : { ...toolbarItemCtx };

      acc.push({
        ...curr,
        ...context,
      });
    }

    return acc;
  }, []);
});

onMounted(async () => {
  await load({ ...query.value, sort: sort.value });
});

watch(sort, async (value) => {
  await load({ ...query.value, sort: value });
});

watch(
  () => props.param,
  (newVal) => {
    if (newVal) {
      if ("openDetailsBlade" in scope && scope.openDetailsBlade && typeof scope.openDetailsBlade === "function") {
        scope.openDetailsBlade({
          param: newVal,
          onOpen() {
            selectedItemId.value = newVal;
          },
          onClose() {
            selectedItemId.value = undefined;
          },
        });
      }
    }
  },
  { immediate: true }
);

const onItemClick = (item: { id: string }) => {
  if ("openDetailsBlade" in scope && scope.openDetailsBlade && typeof scope.openDetailsBlade === "function") {
    scope.openDetailsBlade({
      param: item.id,
      onOpen() {
        selectedItemId.value = item.id;
      },
      onClose() {
        selectedItemId.value = undefined;
      },
    });
  }
};

const onSelectionChanged = (i: typeof items) => {
  const item = unref(i)
    .map((item) => item.id)
    .filter((x): x is string => x !== null);

  selectedIds.value = item;
};

async function removeItems() {
  if (
    await showConfirmation(
      t(`${settings.value.localeKey.trim().toUpperCase()}.PAGES.LIST.DELETE_SELECTED_CONFIRMATION.MESSAGE`, {
        count: allSelected.value
          ? t(`${settings.value.localeKey.trim().toUpperCase()}.PAGES.LIST.DELETE_SELECTED_CONFIRMATION.ALL`, {
              totalCount: pagination.value.totalCount,
            })
          : selectedIds.value.length,
      })
    )
  ) {
    emit("close:children");
    await remove({ allSelected: allSelected.value, ids: selectedIds.value });
    if (query.value.skip && query.value.take) {
      if (query.value.skip >= query.value.take) {
        if (allSelected.value) {
          query.value.skip = 0;
        } else {
          query.value.skip -= query.value.take;
        }
      }
    }
    await reload();
  }
}

const reload = async () => {
  selectedIds.value = [];
  if (query.value.take) {
    await load({
      ...query.value,
      skip: (pagination.value.currentPage - 1) * query.value.take,
      sort: sort.value,
    });
  }
};

const onPaginationClick = async (page: number) => {
  if (query.value.take) {
    await load({
      ...query.value,
      skip: (page - 1) * query.value.take,
    });
  }
};

const onHeaderClick = (item: ITableColumns) => {
  const sortOptions = ["DESC", "ASC", ""];

  if (item.sortable) {
    if (sort.value.split(":")[0] === item.id) {
      const index = sortOptions.findIndex((x) => {
        const sorting = sort.value.split(":")[1];
        if (sorting) {
          return x === sorting;
        } else {
          return x === "";
        }
      });

      if (index !== -1) {
        const newSort = sortOptions[(index + 1) % sortOptions.length];

        if (newSort === "") {
          sort.value = `${item.id}`;
        } else {
          sort.value = `${item.id}:${newSort}`;
        }
      }
    } else {
      sort.value = `${item.id}:${sortOptions[0]}`;
    }
  }
};
const onSearchList = debounce(async (keyword: string) => {
  searchValue.value = keyword;
  await load({
    ...query.value,
    keyword,
  });
}, 1000);

async function resetSearch() {
  searchValue.value = "";
  await load({
    ...query.value,
    keyword: "",
  });
}

function templateOverrideComponents(): Record<string, VNode> {
  return {
    ...table.value.columns?.reduce((acc, curr) => {
      if ("customTemplate" in curr) {
        if (!("component" in curr.customTemplate)) {
          throw new Error(
            `Component name must be provided in 'customTemplate' property, column: ${JSON.stringify(curr)}`
          );
        } else {
          const component = resolveComponent(curr.customTemplate.component);

          if (typeof component !== "string") {
            acc[curr.id] = shallowRef(component);
          }
        }
      }
      return acc;
    }, {}),
  };
}

function mobileViewComponent() {
  const componentName = tableData.value.mobileTemplate?.component;
  if (componentName) {
    const component = resolveComponent(componentName);

    if (component && typeof component !== "string") return shallowRef(component);
  }
}

defineExpose({
  reload,
  title,
});
</script>
