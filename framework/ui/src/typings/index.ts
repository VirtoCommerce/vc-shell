import { Component, ComponentPublicInstance, ComputedRef } from "vue";

export interface IValidationRules {
  required?: boolean;
  min?: number;
  max?: number;
  regex?: RegExp;
}

export interface IComponent extends ComponentPublicInstance {
  openDashboard(): void;
}

export type BladeComponent = Component & {
  url?: string;
  permissions?: string | string[];
  idx?: number;
  onBeforeClose?: () => Promise<boolean>;
};

export interface IBladeToolbar {
  id?: string;
  icon?: string;
  title?: string | ComputedRef<string>;
  isVisible?: boolean | unknown;
  isAccent?: boolean | ComputedRef<boolean>;
  component?: BladeComponent;
  bladeOptions?: Record<string, unknown> | unknown;
  disabled?: boolean | ComputedRef<boolean>;
  dropdownItems?: IBladeDropdownItem[];
  clickHandler?(app: Record<string, unknown> | unknown): void;
}

export interface IBladeDropdownItem {
  id: number;
  title: string;
  icon?: string;
  clickHandler?(): void;
}

export interface IMenuItems extends IBladeToolbar {
  clickHandler?(app?: IComponent): void;
  bladeOptions?: Record<string, unknown> | unknown;
  children?: IMenuItems[];
}

export interface IPage {
  component: BladeComponent | unknown;
  bladeOptions?: Record<string, unknown> | unknown;
  permissions?: string | string[];
  url?: string;
  param?: string;
  onOpen?: () => void;
  onClose?: () => void;
}

export interface IActionBuilderResult {
  icon: string;
  title: string;
  variant: string;
  leftActions?: boolean;
  clickHandler(): void;
}

export interface IImage {
  sortOrder?: number;
}
