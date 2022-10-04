import { Component, ComponentPublicInstance, ComputedRef } from "vue";

interface IComponent extends ComponentPublicInstance {
  openDashboard(): void;
}

interface IBladeToolbar {
  id?: string;
  icon?: string;
  title?: string | ComputedRef<string>;
  isVisible?: boolean | unknown;
  isAccent?: boolean | ComputedRef<boolean>;
  component?: Component & { url?: string };
  componentOptions?: Record<string, unknown> | unknown;
  disabled?: boolean | ComputedRef<boolean>;
  dropdownItems?: IBladeDropdownItem[];
  clickHandler?(): void;
}

interface IBladeDropdownItem {
  id: number;
  title: string;
  icon?: string;
  clickHandler?(item: IBladeDropdownItem): void;
}

interface IMenuItems extends IBladeToolbar {
  clickHandler?(app?: IComponent): void;
  children?: IMenuItems[];
}

interface ITableColumns {
  id: string;
  title: string | ComputedRef<string>;
  width?: number;
  field?: string;
  alwaysVisible?: boolean;
  type?: string;
  sortable?: boolean;
  sortDirection?: number;
  class?: string;
  format?: string;
  align?: string;
}

interface IActionBuilderResult {
  icon: string;
  title: string | ComputedRef<string>;
  variant?: string;
  leftActions?: boolean;
  clickHandler?(): void;
}

interface IShippingInfo {
  label: string;
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface INotificationActions {
  name: string | ComputedRef<string>;
  clickHandler(): void;
  outline: boolean;
  variant: string;
  isVisible?: boolean | ComputedRef<boolean>;
  disabled?: boolean | ComputedRef<boolean>;
}

export type {
  IComponent,
  ITableColumns,
  IActionBuilderResult,
  IBladeToolbar,
  IMenuItems,
  IShippingInfo,
  INotificationActions,
  IBladeDropdownItem,
};
