import { Component, ComputedRef, Ref } from "vue";
import { CoreBladeExposed } from "../../shared";
import { ComponentPublicInstanceConstructor } from "../../shared/utilities/vueUtils";

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
  isVisible?: boolean | Ref<boolean | undefined> | ComputedRef<boolean | undefined>;
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
  type: "danger" | "success";
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
  relativeUrl?: string;
  description?: string;
  modifiedDate?: Date;
  id?: string;
  altText?: string;
  typeId?: string;
  size?: number;
  createdDate?: Date;
}

export interface RequestPasswordResult {
  succeeded: boolean;
  error?: string;
  errorCode?: string;
}

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
  // Mobile view specific fields
  mobilePosition?: {
    row: 1 | 2; // In which row to show (1 or 2)
    order: number; // Order within row
  };
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

export interface MenuItem extends Omit<MenuItemConfig, "title" | "id"> {
  priority: number;
  routeId?: string;
  title: ComputedRef<string> | string;
  url?: string;
  groupIcon?: string | Component;
  groupId?: string;
  children?: MenuItem[];
  permissions?: string | string[];
  id?: number | string;
}

export interface MenuItemConfig {
  id?: string;
  /**
   * Menu item title.
   */
  title: string;
  /**
   * Menu item icon.
   */
  icon: string | Component;
  /**
   * Menu group icon.
   *
   * @deprecated Use groupConfig.icon instead for better robustness
   */
  groupIcon?: string | Component;
  /**
   * Menu item group. Is used to group menu items with it's provided name.
   *
   * If the path is not specified, the menu item is added to the root of the menu.
   *
   * @deprecated Use groupConfig instead for better robustness
   */
  group?: string;
  /**
   * Group configuration for creating or updating a group when adding this menu item.
   * This allows creating a group and adding an item to it in one step.
   * If a group with the specified ID already exists, it will be updated with the provided properties.
   */
  groupConfig?: {
    id: string;
    title?: string;
    icon?: string | Component | undefined;
    priority?: number;
    permissions?: string | string[];
  };
  /**
   * Position priority.
   */
  priority: number;
  /**
   * Position priority in group
   *
   * @deprecated Use groupConfig.priority instead for better robustness
   */
  inGroupPriority?: number;
  permissions?: string | string[];
}
