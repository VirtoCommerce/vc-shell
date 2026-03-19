import { Component, ComputedRef, Ref } from "vue";
import type { CoreBladeExposed } from "@core/blade-navigation/types";
import type { ComponentPublicInstanceConstructor } from "@ui/utilities/vueUtils";
import type { IBladeInstance } from "@core/blade-navigation/types";

// AI Agent types are now part of the ai-agent plugin
// export * from "./plugins/ai-agent/types";

// Type instead of interface here is workaround for:
// https://github.com/microsoft/TypeScript/issues/15300
// (index signature is missing for interfaces in Typescript,
// i.e. interface N { key: value } can't be casted to Record<TKey,TValue>
// while it satisfies requirements
export type IValidationRules = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x: string]: any;
  required?: boolean;
  numeric?: boolean;
  email?: boolean;
  min?: number;
  max?: number;
  regex?: RegExp;
  min_value?: number;
  max_value?: number;
  maxdimensions?: [string | number, string | number];
  size?: number;
  alpha?: boolean;
  alpha_dash?: boolean;
  alpha_num?: boolean;
  alpha_spaces?: boolean;
  between?: [number, number] | { min: number; max: number };
  confirmed?: `@${string}`;
  digits?: number;
  dimensions?: [number, number] | { width: number; height: number };
  not_one_of?: [number, number];
  ext?: string[];
  image?: boolean;
  integer?: boolean;
  is?: string;
  is_not?: string;
  length?: number;
  mimes?: string[];
  one_of?: number[];
  url?: string;
  mindimensions?: [number, number] | { width: number; height: number };
  fileWeight?: number;
  before?: `@${string}`;
  after?: `@${string}`;
  bigint?: boolean;
};

export interface IBladeDropdownItem {
  id: string;
  title: string;
  icon?: string;
  clickHandler?(): void;
}

export interface IMenuItem<T extends Component = Component> {
  title?: string | Ref<string>;
  icon?: string | Component;
  isVisible?: boolean | Ref<boolean>;
  component?: T;
  clickHandler?(): void;
}

export interface IBladeToolbar {
  id?: string;
  icon?: string | (() => string);
  disabled?: boolean | ComputedRef<boolean | undefined>;
  title?: string | Ref<string> | ComputedRef<string>;
  isVisible?:
    | boolean
    | Ref<boolean | undefined>
    | ComputedRef<boolean | undefined>
    | ((blade?: IBladeInstance) => boolean | undefined);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  clickHandler?(app?: Record<string, any> | CoreBladeExposed | null): void;
  separator?: "left" | "right" | "both";
  permissions?: string | string[];
}

export type ToolbarMenu<T> = T extends {
  component?: infer C extends ComponentPublicInstanceConstructor;
}
  ? {
      component?: C;
      options?: InstanceType<C>["$props"];
    } & IBladeToolbar
  : T & { component?: ComponentPublicInstanceConstructor };

export type NotificationTemplateConstructor = ComponentPublicInstanceConstructor & {
  notifyType: string;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export interface IActionBuilderResult<T = {}> {
  icon: string;
  title: string | Ref<string>;
  type: "danger" | "success" | "warning" | "info";
  clickHandler(item?: T, index?: number): void;
}

export interface AssetsHandler<T extends ICommonAsset> {
  noRemoveConfirmation?: boolean;
  loading?: Ref<boolean>;
  upload?: (files: FileList, startingSortOrder?: number) => Promise<T[]>;
  edit?: (files: T[]) => T[];
  remove?: (files: T[]) => T[];
}

export interface ICommonAsset {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x: string]: any;
  sortOrder?: number;
  title?: string | undefined;
  name?: string | undefined;
  url?: string | undefined;
  readableSize?: string;
  relativeUrl?: string | undefined;
  description?: string | undefined;
  modifiedDate?: Date;
  id?: string | undefined;
  altText?: string | undefined;
  typeId?: string;
  size?: number;
  createdDate?: Date;
}

export interface RequestPasswordResult {
  succeeded: boolean;
  error?: string;
  errorCode?: string;
}

/** Option for select filters */
export interface IFilterOption {
  value: string;
  label: string;
}

/**
 * Column filter configuration.
 * - `true` — text filter, backend field = column.id
 * - `"fieldName"` — text filter, backend field = fieldName
 * - `{ options: [...] }` — select filter (single), backend field = column.id
 * - `{ options: [...], multiple: true }` — select filter (multi), backend field = column.id
 * - `{ field: "x", options: [...] }` — select filter, backend field = x
 * - `{ range: ["startDate", "endDate"] }` — date range filter
 */
export type IColumnFilterConfig =
  | true
  | string
  | { options: IFilterOption[]; multiple?: boolean }
  | { field: string; options: IFilterOption[]; multiple?: boolean }
  | { range: [string, string] };

export type ITableColumnsBase = {
  id: string;
  title: string | ComputedRef<string>;
  width?: number | string;
  field?: string;
  alwaysVisible?: boolean;
  type?:
    | "money"
    | "date-ago"
    | "date"
    | "time"
    | "image"
    | "date-time"
    | "status"
    | "status-icon"
    | "number"
    | "link"
    | "html";
  sortable?: boolean;
  class?: string;
  format?: string;
  align?: "start" | "end" | "center" | "between" | "around" | "evenly";
  visible?: boolean;
  editable?: boolean;
  currencyField?: string;
  rules?: IValidationRules;
  /**
   * Column filter configuration.
   * @see IColumnFilterConfig for usage examples
   */
  filter?: IColumnFilterConfig;
  // Mobile view specific fields
  mobilePosition?: "status" | "image" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
  mobileVisible?: boolean; // Show in mobile view
};

type IImageColumn = {
  type: "image";
  emptyIcon?: string;
};

type IMoneyColumn = {
  type: "money";
  currencyField: string;
};

export type ITableColumns = ITableColumnsBase | (ITableColumnsBase & IImageColumn) | (ITableColumnsBase & IMoneyColumn);

// Menu types extracted to break circular dependency (core/types ↔ blade-navigation/types)
export * from "./menu-types";
import type { MenuItemConfig, MenuItemBadgeConfig } from "./menu-types";

export interface MenuItem extends Omit<MenuItemConfig, "title" | "id"> {
  priority: number;
  routeId?: string;
  title: string;
  url?: string;
  groupIcon?: string;
  groupId?: string;
  children?: MenuItem[];
  permissions?: string | string[];
  id?: number | string;
  /**
   * Badge configuration for displaying counters or indicators on this menu item.
   */
  badge?: MenuItemBadgeConfig;
}
