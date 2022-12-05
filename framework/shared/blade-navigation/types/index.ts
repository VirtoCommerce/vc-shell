import {Component, ComponentPublicInstance} from "vue";
import {IMenuItems} from "@types";
import {NavigationFailure} from "vue-router";

/* onParentCall event interface */
export interface IParentCallArgs {
    method: string;
    args?: unknown;
    callback?: (args: unknown) => void;
}

/* extended component */
export type ExtendedComponent = Component & {
    url?: string;
    permissions?: string | string[];
    idx?: number;
};

/* blade interface for navigation */
export interface IBladeContainer extends IBladeEvent{
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
    component?: ExtendedComponent;
    bladeOptions?: Record<string, unknown>;
    param?: string;
    onOpen?: () => void;
    onClose?: () => void;
}

/* menu item event */
export interface IMenuClickEvent {
    item: IMenuItems
    navigationCb: () => Promise<void | NavigationFailure>
}

/* openBlade args interface */
export interface IOpenBlade extends IBladeEvent {
    id?: number
    navigationCb?: () => Promise<void | NavigationFailure>
}
