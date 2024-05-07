/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComputedRef, MaybeRef, Ref, UnwrapNestedRefs } from "vue";
import { AsyncAction } from "../../../../../core/composables";
import { SettingsDetails, SettingsGrid, SettingsSchema } from "../../types";
import { AssetsHandler, IBladeToolbar, ICommonAsset } from "../../../../../core/types";
import { useBladeNavigation } from "../../../../components";
import { FormContext } from "vee-validate";
import { Breadcrumbs } from "../../../../../ui/types";

export type ItemId = { id: string };

export interface IPagination {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  pages: number;
}

export interface IValidationState<Item> {
  valid: boolean;
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
  validate: FormContext["validate"];
  errorBag: Partial<Record<string, string[]>>;
}

export type CustomQuery = { ids: string[] | null; allSelected?: boolean };

export interface UseDetails<Item, Scope extends DetailsBaseBladeScope = DetailsBaseBladeScope> {
  load: AsyncAction<ItemId>;
  saveChanges: AsyncAction<Item, Item | void>;
  remove?: AsyncAction<ItemId>;
  loading: ComputedRef<boolean>;
  item: Ref<Item | undefined>;
  validationState: ComputedRef<IValidationState<Item>>;
  scope?: ComputedRef<UnwrapNestedRefs<Scope>>;
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
  scope?: ComputedRef<UnwrapNestedRefs<Scope>>;
}

export interface BaseBladeScope {
  [x: string]: any;
  toolbarOverrides?: MaybeRef<{ [x: string]: IBladeToolbar }> | ((...args: any[]) => any) | MaybeRef<IBladeToolbar[]>;
}

export interface ListBaseBladeScope<Item = Record<string, any>, Query = Record<string, any>> extends BaseBladeScope {
  openDetailsBlade?: (
    args?: Omit<Parameters<ReturnType<typeof useBladeNavigation>["openBlade"]>["0"], "blade">,
  ) => Promise<void> | void;
  onListItemClick?: (args: { item?: Item }) => void;
  onPaginationClick?: (query: Query) => void;
  breadcrumbs?: ComputedRef<Breadcrumbs[]>;
}

export type TOpenBladeArgs = Omit<Parameters<ReturnType<typeof useBladeNavigation>["openBlade"]>["0"], "blade">;

export interface DetailsBaseBladeScope extends BaseBladeScope {
  disabled?: ComputedRef<boolean | undefined> | Ref<boolean | undefined>;
  isBladeEditable?: ComputedRef<boolean | undefined> | Ref<boolean | undefined>;
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
    }) => void;
  };
  assetsHandler?: {
    assets?: AssetsHandler<ICommonAsset>;
    images?: AssetsHandler<ICommonAsset>;
  };
}

export interface DetailsBladeContext extends UseDetails<Record<string, any>, DetailsBaseBladeScope> {
  settings: ComputedRef<SettingsSchema>;
}

export interface ListBladeContext extends UseList<Record<string, any>[], Record<string, any>, ListBaseBladeScope> {
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
} & UnwrapNestedRefs<Scope>;
