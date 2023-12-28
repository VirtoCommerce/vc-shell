<template>
  <component
    :is="isWidgetView ? 'template' : 'VcBlade'"
    v-if="!composables"
    :expanded="expanded"
    :closable="closable"
    width="50%"
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
      <VcTable
        class="tw-grow tw-basis-0"
        :loading="loading"
        :expanded="expanded"
        :columns="(tableData?.columns as ITableColumns[]) ?? []"
        :state-key="stateKey ?? ''"
        :items="itemsProxy as Record<string, any>[]"
        :multiselect="isWidgetView ? false : tableData?.multiselect"
        :header="isWidgetView ? false : tableData?.header"
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
        :pull-to-reload="true"
        @item-click="onItemClick"
        @pagination-click="onPaginationClick"
        @selection-changed="onSelectionChanged"
        @header-click="onHeaderClick"
        @load:change="onSearchList"
        @scroll:ptr="reload"
        @search:change="onSearchList"
        @row:reorder="sortRows"
      >
        <template
          v-if="isFilterVisible"
          #filters="{ closePanel }"
        >
          <filterComponent :close="closePanel" />
        </template>

        <!-- Not found template -->
        <template #notfound>
          <template v-if="bladeOptions?.notFound">
            <component
              :is="bladeOptions.notFound"
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
          <template v-if="bladeOptions?.empty">
            <component
              :is="bladeOptions.empty"
              :class="{
                'tw-py-6': isWidgetView,
              }"
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
          v-if="bladeOptions?.mobileView"
          #mobile-item="itemData"
        >
          <component
            :is="bladeOptions.mobileView"
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
  Ref,
  computed,
  inject,
  reactive,
  ref,
  resolveComponent,
  shallowRef,
  toValue,
  unref,
  watch,
  UnwrapRef,
  ShallowRef,
  ConcreteComponent,
  ComputedRef,
  onBeforeMount,
} from "vue";
import { useI18n } from "vue-i18n";
import { DynamicGridSchema, ListContentSchema, SettingsSchema } from "../types";
import { useFilterBuilder } from "../composables";
import { useFunctions, useNotifications } from "../../../../core/composables";
import { ITableColumns } from "../../../../core/types";
import { toolbarReducer } from "../helpers/toolbarReducer";
import { notification, usePopup } from "../../../components";
import { ListBaseBladeScope, ListBladeContext, UseList } from "../factories/types";
import { IParentCallArgs } from "../../../index";
import * as _ from "lodash-es";
import { useMounted } from "@vueuse/core";

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
const title = computed(() => settings.value?.titleTemplate);
const allSelected = ref(false);
const searchValue = ref();
const selectedItemId = shallowRef();
const sort = shallowRef("createdDate:DESC");
const selectedIds = shallowRef<string[]>([]);
const isDesktop = inject("isDesktop") as Ref<boolean>;
const itemsProxy = ref<Record<string, any>[]>();
const modified = shallowRef(false);

const { moduleNotifications, markAsRead } = useNotifications(settings.value?.pushNotificationType);

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
const stateKey =
  props.composables &&
  computed(() => {
    if (tableData?.value?.id) {
      return tableData.value?.id + props.isWidgetView ? "_dashboard" : "";
    }

    throw new Error('Table id is not defined. Please provide "id" property in table schema');
  });

const { load, remove, items, loading, pagination, query, scope } = props.composables
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

if (props.isWidgetView) {
  query.value.take = 5;
}

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
  templateOverrideComponents: templateOverrideComponents(),
  mobileView: resolveTemplateComponent("mobileTemplate"),
  notFound: resolveTemplateComponent("notFoundTemplate"),
  empty: resolveTemplateComponent("emptyTemplate"),
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
});

const bladeContext = ref<ListBladeContext>({
  load,
  remove,
  items: computed(() => itemsProxy.value ?? []),
  loading,
  pagination,
  query,
  scope,
  settings: settings as ComputedRef<SettingsSchema>,
});

const toolbarComputed =
  props.composables &&
  toolbarReducer({
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
            toValue(scope).openDetailsBlade();
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
          removeItems();
        },
        disabled: computed(() => !selectedIds.value?.length),
        isVisible: isDesktop.value,
      },
    },
    customToolbarConfig: toValue(scope)?.toolbarOverrides,
    context: bladeContext.value,
  });

onBeforeMount(async () => {
  if (props.composables) await load({ ...query.value, sort: sort.value });
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
        await toValue(scope).openDetailsBlade({
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
      await toValue(scope).openDetailsBlade();
    }
  } else {
    emit("add");
  }
};

const onItemClick = (item: { [x: string]: any; id?: string }) => {
  if (!props.isWidgetView) {
    if (
      scope &&
      "openDetailsBlade" in toValue(scope) &&
      toValue(scope).openDetailsBlade &&
      typeof toValue(scope).openDetailsBlade === "function"
    ) {
      toValue(scope).openDetailsBlade({
        param: item.id,
        onOpen() {
          selectedItemId.value = item.id;
        },
        onClose() {
          selectedItemId.value = undefined;
        },
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
      t(`${settings.value?.localizationPrefix.trim().toUpperCase()}.PAGES.LIST.DELETE_SELECTED_CONFIRMATION.MESSAGE`, {
        count: allSelected.value
          ? t(
              `${settings.value?.localizationPrefix.trim().toUpperCase()}.PAGES.LIST.DELETE_SELECTED_CONFIRMATION.ALL`,
              {
                totalCount: pagination.value.totalCount,
              },
            )
          : selectedIds.value.length,
      }),
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
  await resetFilters();
  await load({
    ...query.value,
    ...filter,
    keyword: "",
  });
}

function templateOverrideComponents(): Record<string, ShallowRef<ConcreteComponent>> {
  return {
    ...table?.value.columns?.reduce(
      (acc, curr) => {
        if ("customTemplate" in curr && curr.customTemplate) {
          if (!("component" in curr.customTemplate)) {
            throw new Error(
              `Component name must be provided in 'customTemplate' property, column: ${JSON.stringify(curr)}`,
            );
          } else if ("component" in curr.customTemplate && curr.customTemplate.component) {
            const component = resolveComponent(curr.customTemplate.component);

            if (typeof component !== "string") {
              acc[curr.id] = shallowRef(component);
            }
          }
        }
        return acc;
      },
      {} as Record<string, ShallowRef<ConcreteComponent>>,
    ),
  };
}

function resolveTemplateComponent(name: keyof ListContentSchema) {
  if (!tableData?.value) return;
  const value = tableData.value[name];
  if (value && typeof value === "object" && "component" in value) {
    const componentName = value.component;
    if (componentName) {
      const component = resolveComponent(componentName);

      if (component && typeof component !== "string") return shallowRef(component);
    }
  }
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

defineExpose({
  reload,
  title,
  ...scope?.value,
});
</script>
