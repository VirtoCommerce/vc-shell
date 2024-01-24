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
  Ref,
} from "vue";
import { ComponentPublicInstanceConstructor } from "../../../utilities/vueUtils";
import { MenuItemConfig } from "../../../../core/types";

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

export type CoreBladeAdditionalSettings = {
  url?: `/${string}`;
  routable?: boolean;
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
  internalRoutes: BladeRoutesRecord[];
  blades: Ref<BladeVNode[]>;
}

export interface BladeRoutesRecord {
  component: BladeVNode;
  name: string;
  isWorkspace: boolean;
  route: string;
}

type VNodeMountHook = (vnode: BladeVNode | VNode) => void;
export interface BladeVNode extends VNode {
  props: {
    navigation: {
      onOpen?: () => void;
      onClose?: () => void;
      onBeforeClose?: () => Promise<boolean | undefined>;
      instance: Ref<CoreBladeExposed | undefined | null>;
      fullPath: string;
      idx: number;
    };
    onVnodeUnmounted?: VNodeMountHook | VNodeMountHook[];
    onVnodeMounted?: VNodeMountHook | VNodeMountHook[];
  } & Omit<VNode["props"], "onVnodeUnmounted" | "onVnodeMounted"> &
    CoreBladeComponentProps;
  type: VNodeTypes & BladeInstanceConstructor;
}
