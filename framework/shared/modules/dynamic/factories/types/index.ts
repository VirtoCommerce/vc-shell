/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComputedRef, MaybeRef, Ref, UnwrapNestedRefs } from "vue";
import { AsyncAction } from "../../../../../core/composables";
import { SettingsSchema } from "../../types";
import { Asset, AssetsHandler, IBladeToolbar, IImage } from "../../../../../core/types";
import { useBladeNavigation } from "../../../../components";

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
  setFieldError: (field: string, message: string | string[]) => void;
  setErrors: (fields: Record<string, string>) => void;
  resetModified: (data: MaybeRef<Item>, updateInitial?: MaybeRef<boolean>) => void;
  validate: () => Promise<{ valid: boolean; errors: Record<string, string> }>;
}

export type CustomQuery = { ids: string[] | null; allSelected?: boolean };

export interface UseDetails<Item, Scope extends DetailsBaseBladeScope = DetailsBaseBladeScope> {
  load: AsyncAction<ItemId>;
  saveChanges: AsyncAction<Item>;
  remove: AsyncAction<ItemId>;
  loading: ComputedRef<boolean>;
  item: Ref<Item>;
  validationState: ComputedRef<IValidationState<Item>>;
  scope?: ComputedRef<UnwrapNestedRefs<Scope>>;
  bladeTitle?: ComputedRef<string>;
}

export interface UseList<Items, Query, Scope extends DetailsBaseBladeScope = DetailsBaseBladeScope> {
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
  scope?: ComputedRef<Scope>;
}

interface BaseBladeScope {
  [x: string]: any;
  toolbarOverrides?: { [x: string]: any };
}

export interface ListBaseBladeScope extends BaseBladeScope {
  openDetailsBlade: (args?: Omit<Parameters<ReturnType<typeof useBladeNavigation>["openBlade"]>["0"], "blade">) => void;
}

export interface DetailsBaseBladeScope extends BaseBladeScope {
  disabled?: ComputedRef<boolean>;
  multilanguage?: {
    loading: ComputedRef<boolean>;
    currentLocale: Ref<string>;
    languages: Ref<string[]>;
    setLocale: (locale: string) => void;
    localesOptions: Ref<{ label: string; value: string }[]>;
  };
  dynamicProperties?: {
    loading: ComputedRef<boolean>;
    loadDictionaries: (
      property: Record<string, any>,
      keyword?: string,
      locale?: string
    ) => Promise<Record<string, any>[]>;
    getPropertyValue: (property: Record<string, any>, locale: string) => any;
    setPropertyValue: (data: {
      property: Record<string, any>;
      value: string | Record<string, any>[];
      dictionary?: Record<string, any>[];
      locale?: string;
    }) => void;
  };
  assetsHandler?: {
    assets?: AssetsHandler<Asset, Asset>;
    images?: AssetsHandler<IImage, IImage>;
  };
}

export interface BladeContext extends UseDetails<Record<string, any>, DetailsBaseBladeScope> {
  settings: ComputedRef<SettingsSchema>;
}
