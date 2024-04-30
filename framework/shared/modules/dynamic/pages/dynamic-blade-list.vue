<template>
  <component
    :is="isWidgetView ? 'template' : 'VcBlade'"
    v-if="!composables"
    :expanded="expanded"
    :closable="closable"
    :width="settings?.width || '50%'"
    :toolbar-items="toolbarComputed"
    :title="title"
    :class="{
      'tw-flex tw-flex-auto': isWidgetView,
    }"
    @close="$emit('close:blade')"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <template v-if="isWidgetView && $isMobile.value">
      <slot
        name="widget-mobile"
        :total-count="pagination.totalCount"
        :loading="loading"
      >
        {{ pagination.totalCount }}</slot
      >
    </template>
    <template v-else>
      <div
        v-if="!isWidgetView && scope?.breadcrumbs"
        :class="[
          {
            '-tw-mb-4': tableData?.header,
          },
          'tw-p-4',
        ]"
      >
        <VcBreadcrumbs :items="scope?.breadcrumbs" />
      </div>
      <VcTable
        class="tw-grow tw-basis-0"
        :loading="loading"
        :expanded="expanded"
        :columns="(tableColsWithLocales as ITableColumns[]) ?? []"
        :state-key="stateKey ?? ''"
        :items="itemsProxy as Record<string, any>[]"
        :multiselect="isWidgetView ? false : tableData?.multiselect"
        :header="isWidgetView ? false : tableData?.header"
        :item-action-builder="actionBuilder"
        :enable-item-actions="!!tableData?.actions && !isWidgetView"
        :footer="!isWidgetView"
        :sort="sort"
        :pages="pagination?.pages"
        :current-page="pagination?.currentPage"
        :search-value="searchValue"
        :selected-item-id="selectedItemId"
        :total-label="$t(`${settings?.localizationPrefix.trim().toUpperCase()}.PAGES.LIST.TABLE.TOTALS`)"
        :total-count="pagination?.totalCount"
        :active-filter-count="activeFilterCount"
        :reorderable-rows="isWidgetView ? false : tableData?.reorderableRows"
        :pull-to-reload="!isWidgetView"
        :select-all="tableData?.selectAll"
        @item-click="onItemClick"
        @pagination-click="onPaginationClick"
        @selection-changed="onSelectionChanged"
        @header-click="onHeaderClick"
        @load:change="onSearchList"
        @scroll:ptr="reload"
        @search:change="onSearchList"
        @row:reorder="sortRows"
        @select:all="handleSelectAllItems"
      >
        <template
          v-if="isFilterVisible"
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
                {{ $t(`${settings?.localizationPrefix.trim().toUpperCase()}.PAGES.LIST.NOT_FOUND.EMPTY`) }}
              </div>
              <VcButton
                v-if="isFilterVisible"
                @click="resetSearch"
                >{{ $t(`${settings?.localizationPrefix.trim().toUpperCase()}.PAGES.LIST.NOT_FOUND.RESET`) }}</VcButton
              >
            </div>
          </template>
        </template>

        <!-- Empty template -->
        <template #empty>
          <template v-if="tableTemplates?.empty">
            <component
              :is="tableTemplates.empty"
              :class="{
                'tw-py-6': isWidgetView,
              }"
              :context="bladeContext"
              @add="openDetailsBlade"
            ></component>
          </template>
          <template v-else>
            <div class="tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-items-center tw-justify-center">
              <div class="tw-m-4 tw-text-xl tw-font-medium">
                {{ $t(`${settings?.localizationPrefix.trim().toUpperCase()}.PAGES.LIST.EMPTY.NO_ITEMS`) }}
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
          />
        </template>

        <!-- Override table mobile view -->

        <template
          v-if="tableTemplates?.mobileView"
          #mobile-item="itemData"
        >
          <component
            :is="tableTemplates.mobileView"
            :context="itemData"
          ></component>
        </template>
      </VcTable>
    </template>
  </component>
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
} from "vue";
import { useI18n } from "vue-i18n";
import { DynamicGridSchema, ListContentSchema, SettingsSchema } from "../types";
import { useFilterBuilder, useTableTemplates } from "../composables";
import { useFunctions, useNotifications } from "../../../../core/composables";
import { IActionBuilderResult, ITableColumns } from "../../../../core/types";
import { useToolbarReducer } from "../composables/useToolbarReducer";
import { notification, useBladeNavigation, usePopup } from "../../../components";
import { ListBaseBladeScope, ListBladeContext, UseList } from "../factories/types";
import { IParentCallArgs } from "../../../index";
import * as _ from "lodash-es";
import { toReactive, useMounted } from "@vueuse/core";
import { safeIn } from "../helpers/safeIn";

export interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
  options?: unknown;
  model?: DynamicGridSchema;
  composables?: Record<string, (...args: any[]) => Record<string, any>>;
  isWidgetView?: boolean;
}

export interface Emits {
  (event: "parent:call", args: IParentCallArgs): void;
  (event: "close:blade"): void;
  (event: "collapse:blade"): void;
  (event: "expand:blade"): void;
  (event: "close:children"): void;
  (event: "item-click", args: { param: string | undefined }): void;
  (event: "add"): void;
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

const settings = computed(() => props.model?.settings);
const title = computed(() => t(settings.value?.titleTemplate as string));
const allSelected = ref(false);
const searchValue = ref();
const selectedItemId = shallowRef();
const sort = shallowRef("createdDate:DESC");
const selectedIds = shallowRef<string[]>([]);
const itemsProxy = ref<Record<string, any>[]>();
const modified = shallowRef(false);

const { moduleNotifications, markAsRead } = useNotifications(settings.value?.pushNotificationType);
const { setNavigationQuery, getNavigationQuery } = useBladeNavigation();

watch(
  moduleNotifications,
  (newVal) => {
    newVal.forEach((message) => {
      if (message.title && props.composables) {
        notification.success(message.title, {
          onClose() {
            markAsRead(message);
          },
        });
      }
    });
  },
  { deep: true },
);

const tableData =
  props.composables &&
  computed(() => props.model?.content.find((type: ListContentSchema) => type.component === "vc-table"));

const tableColsWithLocales = tableData?.value?.columns?.map((col) => ({ ...col, title: computed(() => t(col.title)) }));

const stateKey =
  props.composables &&
  computed(() => {
    if (tableData?.value?.id) {
      return tableData.value?.id && props.isWidgetView ? tableData.value?.id + "_dashboard" : tableData.value?.id;
    }

    throw new Error('Table id is not defined. Please provide "id" property in table schema');
  });

if (typeof props.composables?.[props.model?.settings?.composable ?? ""] === "undefined") {
  throw new Error(`Composable ( ${props.model?.settings?.composable} ) is not defined`);
}

const { load, remove, items, loading, pagination, query, scope } = props.composables
  ? (props.composables?.[props.model?.settings?.composable ?? ""]({
      emit,
      props,
      mounted: useMounted(),
      /**
       * @deprecated use `useDynamicViewsUtils` instead. This will be removed in the next major version.
       */
      bladeContext: {
        settings,
        selectedIds: computed(() => selectedIds.value),
      },
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

if (props.isWidgetView) {
  query.value.take = 5;
}

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
        save: {
          clickHandler() {
            emit("close:blade");
          },
          disabled: computed(() => !modified.value),
        },
        openAddBlade: {
          async clickHandler() {
            if (
              scope &&
              "openDetailsBlade" in toValue(scope) &&
              toValue(scope).openDetailsBlade &&
              typeof toValue(scope).openDetailsBlade === "function"
            ) {
              toValue(scope).openDetailsBlade?.();
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
      customToolbarConfig: toValue(scope)?.toolbarOverrides,
      context: bladeContext.value,
      scope,
    })) ??
  [];

onBeforeMount(async () => {
  if (props.composables)
    await load({ sort: sort.value, ...query.value, ...(props.isWidgetView ? {} : getNavigationQuery()) });
});

watch(
  () => props.param,
  async (newVal) => {
    if (newVal) {
      if (
        scope &&
        "openDetailsBlade" in toValue(scope) &&
        toValue(scope).openDetailsBlade &&
        typeof toValue(scope).openDetailsBlade === "function"
      ) {
        await toValue(scope).openDetailsBlade?.({
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
  { immediate: true },
);

watch(
  () => itemsProxy.value,
  (newVal) => {
    modified.value = !_.isEqual(newVal, items.value);
  },
  { deep: true },
);

watch(sort, async (value) => {
  await load({ ...query.value, sort: value });
});

watch(items, (newVal) => {
  itemsProxy.value = newVal;
});

const openDetailsBlade = async () => {
  if (!props.isWidgetView) {
    if (
      scope &&
      "openDetailsBlade" in toValue(scope) &&
      toValue(scope).openDetailsBlade &&
      typeof toValue(scope).openDetailsBlade === "function"
    ) {
      await toValue(scope).openDetailsBlade?.();
    }
  } else {
    emit("add");
  }
};

const onItemClick = (item: { [x: string]: any; id?: string }) => {
  if (!props.isWidgetView) {
    if (scope && safeIn("openDetailsBlade", toValue(scope)) && typeof toValue(scope).openDetailsBlade === "function") {
      toValue(scope).openDetailsBlade?.({
        param: item.id,
        onOpen() {
          selectedItemId.value = item.id;
        },
        onClose() {
          selectedItemId.value = undefined;
        },
      });
    }

    if (scope && safeIn("onListItemClick", toValue(scope)) && typeof toValue(scope).onListItemClick === "function") {
      toValue(scope).onListItemClick?.({
        item,
      });
    }
  } else {
    emit("item-click", { param: item.id });
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
    emit("parent:call", {
      method: "updateActiveWidgetCount",
    });
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
      safeIn("onPaginationClick", toValue(scope)) &&
      typeof toValue(scope).onPaginationClick === "function"
    ) {
      toValue(scope).onPaginationClick?.({
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

function updateActiveWidgetCount() {
  emit("parent:call", {
    method: "updateActiveWidgetCount",
  });
}

async function handleSelectAllItems(all: boolean) {
  allSelected.value = all;
}

function disabledActionHandler(disabled: { method?: string } | boolean, item: (typeof items.value)[number]): boolean {
  if (!disabled) return false;
  if (typeof disabled === "boolean") return disabled;
  else if (disabled.method && typeof toValue(scope)?.[disabled.method] === "function")
    return toValue(scope)?.[disabled.method]({ item });
  else if (disabled.method && toValue(scope)?.[disabled.method]) return toValue(scope)?.[disabled.method];
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
        position: action.position,
        clickHandler: async (itemVal: (typeof items.value)[number]) => {
          try {
            if (isRef(toolbarComputed) && toolbarComputed.value && toolbarComputed.value.length > 0) {
              const toolbarItem = toolbarComputed.value.find((x) => x.method === action.method);
              selectedIds.value = [itemVal.id];
              if (toolbarItem) {
                await toolbarItem.clickHandler?.();
              } else {
                await toValue(scope)?.[action.method]?.(itemVal);
              }
              selectedIds.value = [];
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

provide("bladeContext", toReactive(bladeContext));

defineExpose({
  reload,
  title,
  updateActiveWidgetCount,
  ...toRefs(scope?.value ?? {}),
  selectedIds,
  settings: toValue(settings),
});
</script>
