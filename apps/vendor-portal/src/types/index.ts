import { Component, ComponentPublicInstance, ComputedRef } from "vue";

interface IComponent extends ComponentPublicInstance {
  openDashboard(): void;
}

interface IBladeToolbar {
  id?: string;
  icon?: string;
  title?: string;
  isVisible?: boolean | unknown;
  isAccent?: boolean | ComputedRef<boolean>;
  component?: Component & { url?: string };
  componentOptions?: Record<string, unknown> | unknown;
  disabled?: boolean | ComputedRef<boolean>;
  clickHandler?(): void;
}

interface IMenuItems extends IBladeToolbar {
  clickHandler?(app?: IComponent): void;
  children?: IMenuItems[];
}

interface ITableColumns {
  id: string;
  title: string;
  width?: number;
  field?: string;
  alwaysVisible?: boolean;
  type?: string;
  sortable?: boolean;
  sortDirection?: number;
  class?: string;
  format?: string;
}

interface IActionBuilderResult {
  icon: string;
  title: string;
  variant: string;
  position?: string;
  clickHandler(): void;
}

interface IShippingInfo {
  label: string;
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface INotificationActions {
  name: string;
  clickHandler(): void;
  outline: boolean;
  variant: string;
  isVisible?: boolean | ComputedRef<boolean>;
  disabled?: boolean | ComputedRef<boolean>;
}

export {
  IComponent,
  ITableColumns,
  IActionBuilderResult,
  IBladeToolbar,
  IMenuItems,
  IShippingInfo,
  INotificationActions,
};
