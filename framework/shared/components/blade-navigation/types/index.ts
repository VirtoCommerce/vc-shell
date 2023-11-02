/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentPublicInstance, VNode, ComponentInternalInstance, VNodeTypes, Ref } from "vue";

export type BladeInstanceConstructor<T extends ComponentPublicInstance = ComponentPublicInstance> = {
  new (...args: any[]): T & { $: ComponentInternalInstance & { exposed: CoreBladeExposed & T["$"]["exposed"] } } & {
    $props: T["$props"] & CoreBladeComponentProps;
  };
} & CoreComponentData &
  CoreBladeAdditionalSettings &
  CoreBladeNavigationData;

export type ComponentInstanceConstructor<T = any> = {
  new (...args: any[]): T;
};

export type CoreBladeComponentProps = {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
  options?: Record<string, any>;
};

export type BladePageComponent = BladeConstructor;

export type CoreComponentData = {
  isBladeComponent?: boolean;
  isWorkspace?: boolean;
};

export type CoreBladeAdditionalSettings = {
  url?: `/${string}`;
  permissions?: string | string[];
};

export type CoreBladeNavigationData = {
  idx?: number;
};

export interface CoreBladeExposed {
  title?: string;
  onBeforeClose?: () => Promise<boolean>;
  reloadParent?: () => void;
  reload?: () => void;
}

export interface IParentCallArgs {
  method: string;
  args?: unknown;
  callback?: (args: unknown) => void;
}

export interface IBladeContainer extends IBladeEvent {
  idx?: number;
}

export interface BladeComponentInternalInstance extends ComponentInternalInstance {
  vnode: VNode & { type: VNodeTypes & CoreBladeAdditionalSettings & CoreBladeNavigationData };
}

export type ExtractedBladeOptions<T, U extends keyof T> = T[U];

export type BladeConstructor<T extends ComponentPublicInstance = ComponentPublicInstance> = BladeInstanceConstructor<T>;

export interface IBladeEvent<T extends ComponentPublicInstance = ComponentPublicInstance> {
  blade?: BladeConstructor<T>;
  options?: ExtractedBladeOptions<InstanceType<BladeConstructor<T>>["$props"], "options">;
  param?: string;
  onOpen?: () => void;
  onClose?: () => void;
}

export interface IBladeRef {
  exposed: CoreBladeExposed;
  blade: IBladeContainer;
  expanded?: boolean;
  active?: boolean;
}

export interface BladeNavigationPlugin {
  blades: Ref<IBladeContainer[]>;
  bladesRefs: Ref<IBladeRef[]>;
}
