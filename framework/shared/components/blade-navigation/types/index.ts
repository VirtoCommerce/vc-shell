import { Component, ComponentPublicInstance, VNode } from "vue";
import { IMenuItems } from "../../../../core/types";

/* onParentCall event interface */
export interface IParentCallArgs {
  method: string;
  args?: unknown;
  callback?: (args: unknown) => void;
}

/* extended component */
export type ExtendedComponent = (VNode | Component) & {
  url?: string;
  permissions?: string | string[];
  idx?: number;
};

/* blade interface for navigation */
export interface IBladeContainer extends IBladeEvent {
  idx?: number;
}

/* blade exposed methods */
export interface IBladeElement extends ComponentPublicInstance {
  onBeforeClose?: () => Promise<boolean>;
  title?: string;
  reloadParent?: () => void;
  openDashboard?: () => void;
}

/* emitted blade event */
export interface IBladeEvent {
  parentBlade?: ExtendedComponent;
  descendantBlade?: ExtendedComponent;
  options?: Record<string, unknown>;
  param?: string;
  onOpen?: () => void;
  onClose?: () => void;
}

/* menu item event */
export interface IMenuClickEvent {
  item: IMenuItems;
}

/* openBlade args interface */
export interface IOpenBlade extends IBladeEvent {
  id?: number;
}

export interface IBladeRef {
  exposed: IBladeElement;
  blade: IBladeContainer;
}
