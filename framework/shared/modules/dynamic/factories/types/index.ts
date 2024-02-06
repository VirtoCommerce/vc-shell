/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComputedRef, MaybeRef, Ref, UnwrapNestedRefs } from "vue";
import { AsyncAction } from "../../../../../core/composables";
import { SettingsSchema } from "../../types";
import { AssetsHandler, IBladeToolbar, ICommonAsset } from "../../../../../core/types";
import { useBladeNavigation } from "../../../../components";
import { FormContext } from "vee-validate";

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
}

export type CustomQuery = { ids: string[] | null; allSelected?: boolean };

export interface UseDetails<Item, Scope extends DetailsBaseBladeScope = DetailsBaseBladeScope> {
  load: AsyncAction<ItemId>;
  saveChanges: AsyncAction<Item>;
  remove?: AsyncAction<ItemId>;
  loading: ComputedRef<boolean>;
  item: Ref<Item | undefined>;
  validationState: ComputedRef<IValidationState<Item>>;
  scope?: ComputedRef<UnwrapNestedRefs<Scope>>;
  bladeTitle?: ComputedRef<string>;
}

export interface UseList<Items, Query, Scope extends ListBaseBladeScope = ListBaseBladeScope> {
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

export interface ListBaseBladeScope extends BaseBladeScope {
  openDetailsBlade: (
    args?: Omit<Parameters<ReturnType<typeof useBladeNavigation>["openBlade"]>["0"], "blade">,
  ) => Promise<void>;
}

export interface DetailsBaseBladeScope extends BaseBladeScope {
  disabled?: ComputedRef<boolean | undefined>;
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
      property: Record<string, any>,
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
}
