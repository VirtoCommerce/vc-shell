/* eslint-disable @typescript-eslint/no-explicit-any */
import { RouteRecordNormalized, Router } from "vue-router";
import {
  AppContext,
  Component,
  ComponentOptionsBase,
  ComponentOptionsMixin,
  VNode,
  ComponentInternalInstance,
  VNodeTypes,
  ComponentPublicInstance,
} from "vue";
import { ComponentPublicInstanceConstructor } from "../../../utilities/vueUtils";

export type CoreBladeComponentProps = {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
  options?: Record<string, any>;
};

export type CoreDynamicBladeComponentProps = {
  model?: any;
  composables?: any;
};

export interface MenuItemConfig {
  id?: string;
  /**
   * Menu item title.
   */
  title: string;
  /**
   * Menu item icon.
   */
  icon: string;
  /**
   * Menu item group. Is used to group menu items with it's provided name.
   *
   * If the path is not specified, the menu item is added to the root of the menu.
   */
  group?: string;
  /**
   * Position priority.
   */
  priority: number;
}

export type CoreBladeAdditionalSettings = {
  url?: `/${string}`;
  permissions?: string | string[];
  isWorkspace?: boolean;
  name?: string;
  menuItem?: MenuItemConfig;
};
export interface CoreBladeExposed {
  [x: string]: any;
  title?: string;
  reloadParent?: () => void;
  reload?: () => void;
}

export interface IParentCallArgs {
  method: keyof CoreBladeExposed;
  args?: unknown;
  callback?: (args: unknown) => void;
}

export interface BladeComponentInternalInstance extends ComponentInternalInstance {
  vnode: VNode & BladeVNode;
  appContext: AppContext & { components: Record<string, BladeInstanceConstructor> };
}

export type ExtractedBladeOptions<T, U extends keyof T> = T[U];

type Extractor<T> = Extract<T, ComponentPublicInstanceConstructor>;

export type BladeInstanceConstructor<T extends Component = Component> = Extractor<T> & {
  new (...args: any[]): InstanceType<Extractor<T>> & {
    $: ComponentInternalInstance & {
      exposed: CoreBladeExposed | InstanceType<Extractor<T>>["$"]["exposed"];
    };
    $props: InstanceType<Extractor<T>>["$props"] & CoreBladeComponentProps;
  };
} & ComponentOptionsBase<any, any, any, any, ComponentOptionsMixin, ComponentOptionsMixin, any, any, any> &
  CoreBladeAdditionalSettings;

export interface IBladeEvent<T extends Component = Component> {
  blade: BladeInstanceConstructor<T>;
  options?: ExtractedBladeOptions<InstanceType<BladeInstanceConstructor<T>>["$props"], "options">;
  param?: string;
  onOpen?: () => void;
  onClose?: () => void;
}

export interface BladeNavigationPlugin {
  router: Router;
}

type VNodeMountHook = (vnode: BladeVNode | VNode) => void;
export interface BladeVNode extends VNode {
  props: {
    navigation: {
      onOpen?: () => void;
      onClose?: () => void;
      fullPath: string;
      bladePath?: string;
      idx: number;
      uniqueRouteKey: string;
    };
    onVnodeUnmounted?: VNodeMountHook | VNodeMountHook[];
    onVnodeMounted?: VNodeMountHook | VNodeMountHook[];
  } & Omit<VNode["props"], "onVnodeUnmounted" | "onVnodeMounted"> &
    CoreBladeComponentProps;
  type: VNodeTypes & BladeInstanceConstructor;
}

export interface BladeRouteRecordLocationNormalized extends RouteRecordNormalized {
  components: Record<string, BladeVNode>;
  instances: Record<
    string,
    ComponentPublicInstance<CoreBladeExposed, any, CoreBladeExposed, any, CoreBladeExposed, any, any, any, any, any>
  >;
}
