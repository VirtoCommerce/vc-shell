import { Component, ComponentPublicInstance, ComputedRef } from "vue";

interface IComponent extends ComponentPublicInstance {
  openDashboard(): void;
}

interface IToolbarItems {
  id?: string;
  icon?: string;
  title?: string;
  isVisible?: boolean | unknown;
  isAccent?: boolean;
  component?: Component;
  componentOptions?: Record<string, unknown> | unknown;
  disabled?: boolean | ComputedRef<boolean>;
  clickHandler?(app?: IComponent): void;
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
}

interface IActionBuilderResult {
  icon: string;
  title: string;
  variant: string;
  clickHandler(): void;
}

export { IToolbarItems, IComponent, ITableColumns, IActionBuilderResult };
