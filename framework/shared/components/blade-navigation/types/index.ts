/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AppContext,
  Component,
  ComponentOptionsBase,
  ComponentOptionsMixin,
  ComponentPublicInstance,
  ComputedOptions,
  VNode,
  ComponentInternalInstance,
  VNodeTypes,
  Ref,
  MethodOptions,
} from "vue";
import { ComponentPublicInstanceConstructor } from "../../../utilities/vueUtils";

/**
 * @deprecated use `ComponentPublicInstanceConstructor` interface instead
 */
export type ComponentInstanceConstructor<T = any> = ComponentPublicInstanceConstructor<T>;

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

/**
 * @deprecated use `BladeInstanceConstructor` interface instead
 */
export type BladePageComponent = BladeInstanceConstructor;

export type CoreComponentData = {
  isBladeComponent?: boolean;
};

export type CoreBladeAdditionalSettings = {
  url?: `/${string}`;
  permissions?: string | string[];
  isWorkspace?: boolean;
};

export type CoreBladeNavigationData = {
  idx?: number;
};

export interface CoreBladeExposed {
  [x: string]: any;
  title?: string;
  onBeforeClose?: () => Promise<boolean>;
  reloadParent?: () => void;
  reload?: () => void;
}

export interface IParentCallArgs {
  method: keyof CoreBladeExposed;
  args?: unknown;
  callback?: (args: unknown) => void;
}

export interface IBladeContainer extends IBladeEvent {
  idx?: number;
}

export interface BladeComponentInternalInstance extends ComponentInternalInstance {
  vnode: VNode & { type: VNodeTypes & CoreBladeAdditionalSettings & CoreBladeNavigationData };
  appContext: AppContext & { components: Record<string, BladeInstanceConstructor> };
}

export type ExtractedBladeOptions<T, U extends keyof T> = T[U];

/**
 * @deprecated use `BladeInstanceConstructor` interface instead
 */
export type BladeConstructor<T extends ComponentPublicInstance = ComponentPublicInstance> = BladeInstanceConstructor<T>;

type Extractor<T> = Extract<T, ComponentPublicInstanceConstructor>;

export type BladeInstanceConstructor<T extends Component = Component> = Extractor<T> & {
  new (...args: any[]): InstanceType<Extractor<T>> & {
    $: ComponentInternalInstance & {
      exposed: CoreBladeExposed | InstanceType<Extractor<T>>["$"]["exposed"];
    };
    $props: InstanceType<Extractor<T>>["$props"] & CoreBladeComponentProps;
  };
} & ComponentOptionsBase<any, any, any, any, ComponentOptionsMixin, ComponentOptionsMixin, any, any, any> &
  CoreComponentData &
  CoreBladeAdditionalSettings &
  CoreBladeNavigationData;

export interface IBladeEvent<T extends Component = Component> {
  blade: BladeInstanceConstructor<T>;
  options?: ExtractedBladeOptions<InstanceType<BladeInstanceConstructor<T>>["$props"], "options">;
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
