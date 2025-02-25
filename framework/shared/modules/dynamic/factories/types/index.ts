/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComputedRef, MaybeRef, Ref, UnwrapNestedRefs } from "vue";
import { AsyncAction } from "../../../../../core/composables";
import { SettingsDetails, SettingsGrid, SettingsSchema } from "../../types";
import {
  AssetsHandler,
  IActionBuilderResult,
  IBladeToolbar,
  ICommonAsset,
  ITableColumns,
} from "../../../../../core/types";
import { useBladeNavigation } from "../../../../components";
import { FormContext } from "vee-validate";
import { Breadcrumbs } from "../../../../../ui/types";
import { DynamicBladeForm, DynamicBladeList } from "../../pages";

export type ItemId = { id: string };

export interface IPagination {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  pages: number;
}

export interface IValidationState<Item> {
  valid: boolean;
  /**
   * @deprecated `dirty` - use `modified` instead
   */
  dirty: boolean;
  disabled: boolean;
  modified: boolean;
  validated: boolean;
  cachedValue: Item | undefined;
  setFieldError: FormContext["setFieldError"];
  setFieldValue: FormContext["setFieldValue"];
  setValues: FormContext["setValues"];
  setErrors: FormContext["setErrors"];
  resetModified: (
    data: MaybeRef<Item | undefined> | ComputedRef<Item | undefined>,
    updateInitial?: MaybeRef<boolean>,
  ) => void;
  resetValidationState: () => void;
  validate: FormContext["validate"];
  errorBag: Partial<Record<string, string[]>>;
  setModifiedState: (value: boolean) => void;
}

export type CustomQuery = { ids: string[] | null; allSelected?: boolean };

export interface UseDetails<Item, Scope extends DetailsBaseBladeScope = DetailsBaseBladeScope> {
  load: AsyncAction<ItemId>;
  saveChanges: AsyncAction<Item, Item | void>;
  remove?: AsyncAction<ItemId | Item>;
  loading: ComputedRef<boolean>;
  item: Ref<Item | undefined>;
  validationState: ComputedRef<IValidationState<Item>>;
  scope?: Scope;
  bladeTitle?: ComputedRef<string>;
}

export interface UseList<
  Items extends Record<string, any>[],
  Query,
  Scope extends ListBaseBladeScope<Items[number]> = ListBaseBladeScope<Items[number]>,
> {
  items: ComputedRef<Items>;
  query: Ref<Query>;
  loading: ComputedRef<boolean>;
  pagination: ComputedRef<{
    currentPage: number;
    totalCount: number;
    pageSize: number;
    pages: number;
  }>;
  load: AsyncAction<Query>;
  remove?: AsyncAction<CustomQuery>;
  scope?: Scope;
}

export interface ITableConfig {
  loading?: boolean;
  columns?: ITableColumns[];
  stateKey?: string;
  items?: Record<string, any>[];
  multiselect?: boolean;
  header?: boolean;
  itemActionBuilder?: (item: Record<string, any>) => IActionBuilderResult[] | undefined;
  editing?: boolean;
  enableItemActions?: boolean;
  footer?: boolean;
  sort?: string;
  pages?: number;
  currentPage?: number;
  searchValue?: string;
  selectedItemId?: string | undefined;
  totalCount?: number;
  reorderableRows?: boolean;
  pullToReload?: boolean;
  selectAll?: boolean;
  paginationVariant?: "default" | "minimal" | undefined;
  selectionItems?: Record<string, any>[];
  onItemClick?: (item: Record<string, any>) => void;
  onPaginationClick?: (page: number) => void;
  onSelectionChanged?: (items: Record<string, any>[]) => void;
  onHeaderClick?: (item: ITableColumns) => void;
  "onScroll:ptr"?: () => void;
  "onSearch:change"?: (keyword: string | undefined) => void;
  "onRow:reorder"?: (event: { dragIndex: number; dropIndex: number; value: any[] }) => void;
  "onSelect:all"?: (all: boolean) => void;
  onEditComplete?: (data: { event: { field: string; value: any }; index: number }) => void;
  onCellBlur?: (data: { row: number | undefined; field: string }) => void;
  disableItemCheckbox?: (item: Record<string, any> | undefined) => boolean;
  columnSelector?: "auto" | "defined" | MaybeRef<ITableColumns[]> | (() => ITableColumns[]);
}

export interface BaseBladeScope {
  [x: string]: any;
  toolbarOverrides?:
    | MaybeRef<{ [x: string]: IBladeToolbar | IBladeToolbar[] | MaybeRef<IBladeToolbar> | MaybeRef<IBladeToolbar[]> }>
    | ((...args: any[]) => any)
    | MaybeRef<IBladeToolbar[]>;
}

export interface ListBaseBladeScope<Item = Record<string, any>, Query = Record<string, any>> extends BaseBladeScope {
  openDetailsBlade?: (
    args?: Omit<Parameters<ReturnType<typeof useBladeNavigation>["openBlade"]>["0"], "blade">,
  ) => Promise<void> | void;
  onListItemClick?: (
    args: { item?: Item } & Omit<
      Parameters<ReturnType<typeof useBladeNavigation>["openBlade"]>["0"],
      "blade" | "param" | "options"
    >,
  ) => void;
  onPaginationClick?: (query: Query) => void;
  breadcrumbs?: ComputedRef<Breadcrumbs[]>;
  modified?: ComputedRef<boolean> | Ref<boolean> | boolean;
  tableConfig?: (initialTableConfig: ITableConfig) => ITableConfig;
}

export type TOpenBladeArgs = Omit<Parameters<ReturnType<typeof useBladeNavigation>["openBlade"]>["0"], "blade">;
export type TListItemClickArgs<Item extends Record<string, any> = Record<string, any>> = Omit<
  Parameters<ReturnType<typeof useBladeNavigation>["openBlade"]>["0"],
  "blade" | "param" | "options"
> & { item?: Item | undefined };

export interface DetailsBaseBladeScope<Item = Record<string, any>> extends BaseBladeScope {
  disabled?: ComputedRef<boolean | undefined> | Ref<boolean | undefined> | boolean;
  multilanguage?: {
    loading: ComputedRef<boolean>;
    currentLocale: Ref<string>;
    languages: Ref<string[]>;
    setLocale: (locale: string) => void;
    localesOptions: Ref<{ label: string | undefined; value: string }[]>;
    getLanguages: AsyncAction<void, void>;
  };
  dynamicProperties?: {
    loading: ComputedRef<boolean>;
    loadDictionaries: (
      propertyId: string,
      keyword?: string,
      locale?: string,
    ) => Promise<Record<string, any>[] | undefined>;
    getPropertyValue: (property: Record<string, any>, locale: string) => any;
    setPropertyValue: (data: {
      property: Record<string, any>;
      value: string | Record<string, any>[];
      dictionary?: Record<string, any>[];
      locale?: string;
      initialProp?: Record<string, any>;
    }) => void;
  };
  assetsHandler?: {
    assets?: AssetsHandler<ICommonAsset>;
    images?: AssetsHandler<ICommonAsset>;
  };
  selection?: Item[];
}

export interface DetailsBladeContext<
  Item extends Record<string, any> = Record<string, any>,
  Scope extends DetailsBaseBladeScope = DetailsBaseBladeScope,
> extends UseDetails<Item, Scope> {
  settings: ComputedRef<SettingsSchema>;
}

export interface ListBladeContext<
  Items extends Record<string, any>[] = Record<string, any>[],
  Query = Record<string, any>,
  Scope extends ListBaseBladeScope = ListBaseBladeScope,
> extends UseList<Items, Query, Scope> {
  settings: ComputedRef<SettingsSchema>;
  selectedIds: ComputedRef<string[]>;
}

export interface BaseBladeExposed {
  updateActiveWidgetCount: () => void;
  readonly title: MaybeRef<string>;
}

export type ListBladeExposed<Scope extends ListBaseBladeScope> = BaseBladeExposed & {
  readonly selectedIds: string[];
  reload: () => void;
  readonly settings: SettingsGrid;
} & UnwrapNestedRefs<Scope>;

export type DetailsBladeExposed<Scope extends DetailsBaseBladeScope> = BaseBladeExposed & {
  readonly settings: SettingsDetails;
  readonly item: Record<string, any>;
  readonly validationState: IValidationState<Record<string, any>>;
} & UnwrapNestedRefs<Scope>;

export type DetailsComposableArgs<
  Props extends Omit<InstanceType<typeof DynamicBladeForm>["$props"], "composables"> = Record<string, any>,
> = {
  props: InstanceType<typeof DynamicBladeForm>["$props"] & Props;
  emit: InstanceType<typeof DynamicBladeForm>["$emit"];
  mounted: Ref<boolean>;
};

export type ListComposableArgs<
  Props extends Omit<InstanceType<typeof DynamicBladeList>["$props"], "composables"> = Record<string, any>,
> = {
  readonly props: InstanceType<typeof DynamicBladeList>["$props"] & Props;
  readonly emit: InstanceType<typeof DynamicBladeList>["$emit"];
  readonly mounted: Ref<boolean>;
  readonly isWidgetView: boolean;
};
