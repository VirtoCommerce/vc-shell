import { ComputedRef, Ref } from "vue";
import { AsyncAction } from "../../../../../core/composables";

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
  modified: boolean;
  validated: boolean;
  setFieldError: (field: string, message: string | string[]) => void;
  resetModified: (data: Item, updateInitial?: boolean) => void;
}

export type CustomQuery = { ids: string[] | null; allSelected?: boolean };

export interface IDetails<Item, Scope> {
  load: AsyncAction<ItemId>;
  saveChanges: AsyncAction<Item>;
  remove: AsyncAction<ItemId>;
  loading: ComputedRef<boolean>;
  item: Ref<Item>;
  validationState: ComputedRef<IValidationState<Item>>;
  scope: Scope;
  bladeTitle: ComputedRef<string>;
}

export interface IList<Items, Query, Scope> {
  items: ComputedRef<Items>;
  query: Ref<Query>;
  loading: ComputedRef<boolean>;
  pagination: ComputedRef<IPagination>;
  load: AsyncAction<Query>;
  remove: AsyncAction<CustomQuery>;
  scope: Scope;
}
