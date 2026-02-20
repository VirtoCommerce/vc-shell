<template>
  <VcBlade
    v-if="!composables"
    :expanded="expanded"
    :closable="closable"
    :width="settings?.width || '50%'"
    :toolbar-items="toolbarComputed"
    :title="title"
    :modified="unreffedScope?.modified"
    @close="$emit('close:blade')"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <div
      v-if="toValue(scope?.breadcrumbs)?.length"
      class="tw-p-4"
    >
      <VcBreadcrumbs
        :items="toValue(scope?.breadcrumbs)"
        variant="light"
        separated
      />
    </div>
    <VcTable
      class="tw-grow tw-basis-0"
      v-bind="tableConfigComputed"
      :expanded="expanded"
      :total-label="$t(`${localizationPrefix}.PAGES.LIST.TABLE.TOTALS`)"
      :active-filter-count="activeFilterCount"
      :disable-filter="filterDisable"
    >
      <template
        v-if="isFilterVisible && bladeOptions.tableData?.filter"
        #filters="{ closePanel }"
      >
        <filterComponent :close="closePanel" />
      </template>

      <!-- Not found template -->
      <template #notfound>
        <template v-if="tableTemplates?.notFound">
          <component
            :is="tableTemplates.notFound"
            :context="bladeContext"
            @reset="resetSearch"
          ></component>
        </template>
        <template v-else>
          <div class="tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-items-center tw-justify-center">
            <div class="tw-m-4 tw-text-xl tw-font-medium">
              {{ $t(`${localizationPrefix}.PAGES.LIST.NOT_FOUND.EMPTY`) }}
            </div>
            <VcButton
              v-if="isFilterVisible"
              @click="resetSearch"
              >{{ $t(`${localizationPrefix}.PAGES.LIST.NOT_FOUND.RESET`) }}</VcButton
            >
          </div>
        </template>
      </template>

      <!-- Empty template -->
      <template #empty>
        <template v-if="tableTemplates?.empty">
          <component
            :is="tableTemplates.empty"
            :context="bladeContext"
            @add="openDetailsBlade"
          ></component>
        </template>
        <template v-else>
          <div class="tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-items-center tw-justify-center">
            <div class="tw-m-4 tw-text-xl tw-font-medium">
              {{ $t(`${localizationPrefix}.PAGES.LIST.EMPTY.NO_ITEMS`) }}
            </div>
          </div>
        </template>
      </template>

      <!-- Override table templates-->
      <template
        v-for="(component, key, index) in tableTemplates?.templateOverrideComponents"
        #[`item_${key}`]="itemData"
        :key="`template_override_${index}`"
      >
        <component
          :is="component"
          :context="itemData"
          :blade-context="bladeContext"
        />
      </template>

      <!-- Override header -->
      <template
        v-if="tableTemplates?.header"
        #header="headerData"
      >
        <component
          :is="tableTemplates.header"
          :context="headerData"
          :blade-context="bladeContext"
        ></component>
      </template>

      <!-- Override footer -->
      <template
        v-if="tableTemplates?.footer"
        #footer="footerData"
      >
        <component
          :is="tableTemplates.footer"
          :context="footerData"
          :blade-context="bladeContext"
        ></component>
      </template>

      <!-- Override table mobile view -->

      <template
        v-if="tableTemplates?.mobileView"
        #mobile-item="itemData"
      >
        <component
          :is="tableTemplates.mobileView"
          :context="itemData"
          :blade-context="bladeContext"
        ></component>
      </template>
    </VcTable>
  </VcBlade>
</template>
<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  computed,
  reactive,
  ref,
  shallowRef,
  toValue,
  unref,
  watch,
  UnwrapRef,
  ComputedRef,
  onBeforeMount,
  toRefs,
  provide,
  isRef,
  inject,
} from "vue";
import { useI18n } from "vue-i18n";
import { DynamicGridSchema, ListContentSchema, SettingsSchema } from "@shared/modules/dynamic/types";
import { IsBladeEditableKey } from "@shared/modules/dynamic/keys";
import useFilterBuilder from "@shared/modules/dynamic/composables/useFilterBuilder";
import { useTableTemplates } from "@shared/modules/dynamic/composables";
import { useFunctions } from "@core/composables";
import { IActionBuilderResult, ITableColumns } from "@core/types";
import { useToolbarReducer } from "@shared/modules/dynamic/composables/useToolbarReducer";
import { useBladeNavigation, usePopup } from "@shared/components";
import { ListBaseBladeScope, ListBladeContext, UseList } from "@shared/modules/dynamic/factories/types";
import { IParentCallArgs } from "@shared";
import { reactiveComputed, toReactive, useMounted } from "@vueuse/core";
import { safeIn } from "@shared/modules/dynamic/helpers/safeIn";
import { useWidgets } from "@core/composables/useWidgets";
import { useBlade } from "@core/composables";

export interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string | any;
  options?: unknown;
  model?: DynamicGridSchema;
  composables?: Record<string, (...args: any[]) => Record<string, any>>;
  mixinFn?: ((...args: any[]) => any)[];
}

export interface Emits {
  (event: "parent:call", args: IParentCallArgs): void;
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
const widgetService = useWidgets();

const emit = defineEmits<Emits>();

const settings = computed(() => props.model?.settings);
const localizationPrefix = computed(() => settings.value?.localizationPrefix.trim().toUpperCase());
const title = computed(() => t(settings.value?.titleTemplate as string));
const allSelected = ref(false);
const searchValue = ref();
const selectedItemId = shallowRef();
const sort = shallowRef();
const selectedIds = shallowRef<string[]>([]);
const itemsProxy = ref<Record<string, any>[]>();
const isMixinReady = ref(false);
const blade = useBlade();

const { setNavigationQuery, getNavigationQuery } = useBladeNavigation();

const tableData =
  props.composables &&
  computed(() => props.model?.content.find((type: ListContentSchema) => type.component === "vc-table"));

const tableColsWithLocales = tableData?.value?.columns?.map((col) => ({
  ...col,
  title: computed(() => t(col.title)),
})) as ITableColumns[];

const stateKey =
  props.composables &&
  computed(() => {
    if (tableData?.value?.id) {
      return tableData.value?.id;
    }

    throw new Error('Table id is not defined. Please provide "id" property in table schema');
  });

if (typeof props.composables?.[props.model?.settings?.composable ?? ""] === "undefined") {
  throw new Error(`Composable ( ${props.model?.settings?.composable} ) is not defined`);
}

// eslint-disable-next-line prefer-const
let { load, remove, items, loading, pagination, query, scope } = props.composables
  ? (props.composables?.[props.model?.settings?.composable ?? ""]({
      emit,
      props,
      mounted: useMounted(),
    }) as UseList<Record<string, any>[], Record<string, any>, ListBaseBladeScope>)
  : ({
      load: ref(true),
      remove: undefined,
      items: undefined,
      loading: undefined,
      pagination: undefined,
      query: undefined,
      scope: undefined,
    } as unknown as UseList<Record<string, any>[], Record<string, any>, ListBaseBladeScope>);

if (props.mixinFn?.length) {
  const mixinResults = props.mixinFn?.map((mixin) => mixin({ loading, items, scope, load, remove, query }));

  const mergedResults = mixinResults.reduce((acc, result) => {
    return {
      ...acc,
      ...result,
    };
  }, {});

  loading = mergedResults.loading ?? loading;
  items = mergedResults.items ?? items;
  scope = mergedResults.scope ?? scope;
  load = mergedResults.load ?? load;
  remove = mergedResults.remove ?? remove;
  query = mergedResults.query ?? query;

  isMixinReady.value = true;
} else {
  isMixinReady.value = true;
}

const isBladeEditable = computed(() =>
  "disabled" in toValue(scope || {}) ? !toValue(toValue(scope || {})?.disabled) : false,
);

const selection = computed(() => {
  const tableConfig = toValue(scope)?.tableConfigComputed;
  if (tableConfig && "selectedIds" in tableConfig) {
    return items.value?.filter((item) => tableConfig.selectedIds?.includes(item.id)) || [];
  }
  return [];
});

sort.value = query.value.sort ?? "createdDate:DESC";

const unreffedScope = reactiveComputed(() => toValue(scope) ?? {});

const filterDisable = computed(() => {
  if (tableData?.value?.filter?.disabled?.method) {
    const disableFilterMethod = toValue(unreffedScope)?.[tableData?.value?.filter?.disabled.method];

    if (disableFilterMethod && typeof disableFilterMethod === "function") {
      return disableFilterMethod();
    } else {
      return toValue(disableFilterMethod);
    }
  }
  return false;
});

const { tableTemplates } = useTableTemplates(tableData);

const calculateColumns = (columns: ListContentSchema["columns"]) => {
  const result = columns?.map((column) => {
    if (typeof column.visible !== "boolean" && column.visible?.method) {
      const result =
        typeof scope?.value[column.visible?.method] === "function"
          ? scope?.value[column.visible?.method]()
          : scope?.value[column.visible?.method];

      column.visible = result;
    }
    return column;
  });

  return result;
};

const table =
  props.composables &&
  computed(() => {
    const tableScope = {
      columns: calculateColumns(tableData?.value?.columns),
    };

    return tableScope;
  });

const bladeOptions = reactive({
  tableData,
  table,
});

const {
  filterComponent,
  activeFilterCount,
  isFilterVisible,
  reset: resetFilters,
  filter,
} = useFilterBuilder({
  data: bladeOptions.tableData?.filter,
  query,
  load,
  scope,
});

const bladeContext = ref<ListBladeContext>({
  load,
  remove,
  items: computed(() => itemsProxy.value ?? []),
  loading,
  pagination,
  query,
  scope,
  selectedIds: computed(() => selectedIds.value),
  settings: settings as ComputedRef<SettingsSchema>,
});

const toolbarComputed =
  (props.composables &&
    useToolbarReducer({
      defaultToolbarSchema: settings.value?.toolbar ?? [],
      defaultToolbarBindings: {
        openAddBlade: {
          async clickHandler() {
            if (
              scope &&
              "openDetailsBlade" in toValue(unreffedScope) &&
              toValue(unreffedScope).openDetailsBlade &&
              typeof toValue(unreffedScope).openDetailsBlade === "function"
            ) {
              toValue(unreffedScope).openDetailsBlade?.();
            } else throw new Error("openDetailsBlade method is not defined in scope");
          },
        },
        refresh: {
          async clickHandler() {
            await reload();
          },
        },
        removeItems: {
          async clickHandler() {
            await removeItems();
          },
          disabled: computed(() => !selectedIds.value?.length),
          // isVisible: computed(() => isDesktop.value),
        },
      },
      customToolbarConfig: toValue(unreffedScope)?.toolbarOverrides,
      context: bladeContext.value,
    })) ??
  [];

onBeforeMount(async () => {
  if (props.composables && isMixinReady.value)
    await load({
      sort: sort.value,
      ...query.value,
      ...getNavigationQuery(),
    });
});

watch(
  () => toValue(toValue(scope)?.tableConfigComputed)?.searchValue,
  (newVal) => {
    searchValue.value = newVal;
  },
  {
    immediate: true,
  },
);

watch(
  () => props.param,
  async (newVal) => {
    selectedItemId.value = unref(newVal);
  },
  { immediate: true },
);

watch(sort, async (value) => {
  await load({ ...query.value, sort: value });
});

watch(items, (newVal) => {
  itemsProxy.value = newVal;
});

const onEditComplete = (data: { event: { field: string; value: any }; index: number }) => {
  const item = itemsProxy.value?.[data.index];
  if (item) {
    item[data.event.field] = data.event.value;
  }
};

const onCellBlur = async (data: { row: number | undefined; field: string }) => {
  const column = tableData?.value?.columns?.find((col) => col.id === data.field);
  if (column && column.onCellBlur && column.onCellBlur.method) {
    if (
      scope &&
      toValue(unreffedScope)?.[column.onCellBlur.method] &&
      typeof toValue(unreffedScope)[column.onCellBlur.method] === "function"
    ) {
      await toValue(unreffedScope)[column.onCellBlur.method](data);
    }
  }
};

const openDetailsBlade = async () => {
  if (
    scope &&
    "openDetailsBlade" in toValue(unreffedScope) &&
    toValue(unreffedScope).openDetailsBlade &&
    typeof toValue(unreffedScope).openDetailsBlade === "function"
  ) {
    await toValue(unreffedScope).openDetailsBlade?.();
  }
};

const onItemClick = (item: { [x: string]: any; id?: string }) => {
  // TODO Add to docs
  if (
    scope &&
    safeIn("onListItemClick", toValue(unreffedScope)) &&
    typeof toValue(unreffedScope).onListItemClick === "function"
  ) {
    toValue(unreffedScope).onListItemClick?.({
      item,
      onOpen() {
        selectedItemId.value = item.id;
      },
      onClose() {
        selectedItemId.value = undefined;
      },
    });
  } else if (
    scope &&
    safeIn("openDetailsBlade", toValue(unreffedScope)) &&
    typeof toValue(unreffedScope).openDetailsBlade === "function"
  ) {
    toValue(unreffedScope).openDetailsBlade?.({
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

const onSelectionChanged = (i: UnwrapRef<typeof items>) => {
  const item = unref(i)
    .map((item) => item.id)
    .filter((x): x is string => x !== null);

  selectedIds.value = item;
};

async function removeItems() {
  if (
    await showConfirmation(
      t(
        `${settings.value?.localizationPrefix.trim().toUpperCase()}.PAGES.ALERTS.DELETE_SELECTED_CONFIRMATION.MESSAGE`,
        {
          count: allSelected.value
            ? t(
                `${settings.value?.localizationPrefix.trim().toUpperCase()}.PAGES.ALERTS.DELETE_SELECTED_CONFIRMATION.ALL`,
                {
                  totalCount: pagination.value.totalCount,
                },
              )
            : selectedIds.value.length,
        },
      ),
    )
  ) {
    emit("close:children");
    if (remove) await remove({ allSelected: allSelected.value, ids: selectedIds.value });
    if (query.value.skip && query.value.take) {
      if (query.value.skip >= query.value.take) {
        if (allSelected.value) {
          query.value.skip = 0;
        } else {
          query.value.skip -= query.value.take;
        }
      }
    }
    // emit("parent:call", {
    //   method: "updateActiveWidgetCount",
    // });

    widgetService.updateActiveWidget();
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
    if (
      scope &&
      safeIn("onPaginationClick", toValue(unreffedScope)) &&
      typeof toValue(unreffedScope).onPaginationClick === "function"
    ) {
      toValue(unreffedScope).onPaginationClick?.({
        ...query.value,
        skip: (page - 1) * query.value.take,
      });

      return;
    }
    const queryObj = {
      ...query.value,
      skip: (page - 1) * query.value.take,
    };
    setNavigationQuery(queryObj);
    await load(queryObj);
  }
};

const onHeaderClick = (item: Partial<ITableColumns>) => {
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
  await resetFilters();
  await load({
    ...query.value,
    ...filter,
    keyword: "",
  });
}

function sortRows(event: { dragIndex: number; dropIndex: number; value: any[] }) {
  if (event.dragIndex !== event.dropIndex) {
    const sorted = event.value.map((item, index) => {
      item.sortOrder = index;
      return item;
    });

    itemsProxy.value = sorted;
  }
}

// function updateActiveWidgetCount() {
//   emit("parent:call", {
//     method: "updateActiveWidgetCount",
//   });
// }

async function handleSelectAllItems(all: boolean) {
  allSelected.value = all;
}

function disabledActionHandler(disabled: { method?: string } | boolean, item: (typeof items.value)[number]): boolean {
  if (!disabled) return false;
  if (typeof disabled === "boolean") return disabled;
  else if (disabled.method && typeof toValue(unreffedScope)?.[disabled.method] === "function")
    return toValue(unreffedScope)?.[disabled.method]({ item });
  else if (disabled.method && toValue(unreffedScope)?.[disabled.method])
    return toValue(unreffedScope)?.[disabled.method];
  return false;
}

// TODO add to documentation
function actionBuilder(item: (typeof items.value)[number]): IActionBuilderResult[] | undefined {
  const result = tableData?.value?.actions?.reduce((arr, action) => {
    const isDisabled = disabledActionHandler(action?.disabled ?? false, item);

    if (!toValue(isDisabled)) {
      arr.push({
        icon: action.icon,
        title: computed(() => t(action.title)),
        type: action.type,
        clickHandler: async (itemVal: (typeof items.value)[number]) => {
          try {
            if (isRef(toolbarComputed) && toolbarComputed.value && toolbarComputed.value.length > 0) {
              const toolbarItem = toolbarComputed.value.find(
                (x) => ("method" in x && x.method === action.method) ?? false,
              );
              selectedIds.value = [itemVal.id];
              if (toolbarItem) {
                await toolbarItem.clickHandler?.();
              } else {
                await toValue(unreffedScope)?.[action.method]?.(itemVal);
                selectedIds.value = [];
              }
            }
          } catch (error) {
            throw new Error(`Method ${action.method} is not defined in scope or toolbarOverrides`);
          }
        },
      });
    }
    return arr;
  }, [] as IActionBuilderResult[]);

  return result;
}

const tableConfig = computed(() => {
  return {
    loading: loading.value,
    columns: tableColsWithLocales ?? [],
    stateKey: stateKey?.value ?? "",
    items: itemsProxy.value ?? [],
    multiselect: tableData?.value?.multiselect,
    header: tableData?.value?.header,
    itemActionBuilder: actionBuilder,
    editing: isBladeEditable.value,
    enableItemActions: !!tableData?.value?.actions,
    footer: tableData?.value?.footer,
    sort: sort.value,
    pages: pagination.value?.pages,
    currentPage: pagination.value?.currentPage,
    searchValue: searchValue.value,
    selectedItemId: selectedItemId.value,
    totalCount: pagination.value?.totalCount,
    reorderableRows: tableData?.value?.reorderableRows,
    pullToReload: true,
    selectAll: tableData?.value?.selectAll,
    paginationVariant: tableData?.value?.paginationVariant,
    selectionItems: selection.value,
    onItemClick: onItemClick,
    onPaginationClick: onPaginationClick,
    onSelectionChanged: onSelectionChanged,
    onHeaderClick: onHeaderClick,
    "onScroll:ptr": reload,
    "onSearch:change": onSearchList,
    "onRow:reorder": sortRows,
    "onSelect:all": handleSelectAllItems,
    onEditComplete: onEditComplete,
    onCellBlur: onCellBlur,
    noHeaderCheckbox: tableData?.value?.noHeaderCheckbox,
  };
});

const tableConfigComputed = computed(() => {
  if (scope && "tableConfig" in toValue(scope) && typeof toValue(scope)?.tableConfig === "function") {
    const initialTableConfig = toReactive(tableConfig.value);
    const scopeTableConfig = toValue(scope)?.tableConfig?.(initialTableConfig);

    const res = {
      ...initialTableConfig,
      ...scopeTableConfig,
    };

    if (scopeTableConfig?.columns?.length) {
      res.columns = scopeTableConfig.columns as ITableColumns[];
    }

    return res;
  }
  return tableConfig.value;
});

provide("bladeContext", toReactive(bladeContext));
provide(IsBladeEditableKey, isBladeEditable);

defineExpose({
  reload,
  title,
  // updateActiveWidgetCount,
  ...toRefs(toValue(unreffedScope) ?? {}),
  selectedIds,
  settings: toValue(settings),
});
</script>
