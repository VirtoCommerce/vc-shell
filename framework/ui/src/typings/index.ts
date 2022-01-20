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

export interface IBladeToolbar {
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

export interface IMenuItems extends IBladeToolbar {
  clickHandler?(app?: IComponent): void;
}

export interface IPage {
  component: Component | unknown;
  componentOptions?: Record<string, unknown> | unknown;
  url?: string;
  param?: string;
  onOpen?: () => void;
  onClose?: () => void;
}

export interface IActionBuilderResult {
  icon: string;
  title: string;
  variant: string;
  clickHandler(): void;
}
