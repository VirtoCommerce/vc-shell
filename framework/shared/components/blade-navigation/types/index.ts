/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router } from "vue-router";
import {
  AppContext,
  Component,
  ComponentOptionsBase,
  ComponentOptionsMixin,
  VNode,
  ComponentInternalInstance,
  VNodeTypes,
  Ref,
  InjectionKey,
  ComputedRef,
} from "vue";
import { ComponentPublicInstanceConstructor } from "../../../utilities/vueUtils";
import { MenuItemConfig } from "../../../../core/types";
import { Breadcrumbs } from "../../../../ui/types";
import { DisplayableError } from "../../../../core/utilities/error";

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
  isBlade?: boolean;
  name?: string;
  menuItem?: MenuItemConfig;
};
export interface CoreBladeExposed {
  [x: string]: any;
  title?: string;
  reloadParent?: () => void;
  reload?: () => void;
}

export interface IBladeInstance {
  id: string;
  expandable: boolean;
  maximized: boolean;
  error: DisplayableError | Error | string | null | undefined;
  navigation: BladeVNode["props"]["navigation"] | undefined;
  breadcrumbs: Breadcrumbs[] | undefined;
  title?: string;
  param?: string;
  options?: Record<string, any>;
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
  blade: BladeInstanceConstructor<T> | { name: string } | undefined;
  options?: Record<string, any>;
  param?: string;
  onOpen?: () => void;
  onClose?: () => void;
  replaceCurrentBlade?: boolean;
}

export interface BladeNavigationPlugin {
  router: Router;
}

export interface BladeRoutesRecord {
  component: BladeInstanceConstructor;
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
      error?: Ref<Error | null>;
      instance: CoreBladeExposed | undefined | null;
      idx: number;
      isVisible?: boolean;
    };
    onVnodeUnmounted?: VNodeMountHook | VNodeMountHook[];
    onVnodeMounted?: VNodeMountHook | VNodeMountHook[];
  } & Omit<VNode["props"], "onVnodeUnmounted" | "onVnodeMounted"> &
    CoreBladeComponentProps;
  type: VNodeTypes & BladeInstanceConstructor;
}

// ─── New Blade Navigation Types (BladeStack architecture) ─────────────────────

/**
 * Plain data descriptor for a blade instance in the stack.
 * Replaces BladeVNode — no VNode mutation, purely reactive data.
 */
export interface BladeDescriptor {
  /** Unique per open blade instance (generated at open time) */
  id: string;
  /** Registered component name (e.g. "OrderDetails") from defineOptions */
  name: string;
  /** URL segment (e.g. "/order") from defineOptions — used for URL construction */
  url?: string;
  /** Entity ID — appears in URL path */
  param?: string;
  /** Small key-value pairs — serialized to URL query params */
  query?: Record<string, string>;
  /** Large context data — stored in history.state only, not in URL */
  options?: Record<string, unknown>;
  /** ID of the blade that opened this one (undefined for workspace) */
  parentId?: string;
  /** Whether this blade is currently visible */
  visible: boolean;
  /** Error state for this blade */
  error?: unknown;
  /** Blade title — populated at runtime from the component's defineExpose({ title }) */
  title?: string;
}

/**
 * Event object for opening a blade.
 * Used by BladeStack.openBlade, openWorkspace, replaceCurrentBlade.
 */
export interface BladeOpenEvent {
  /** Registered component name — resolved via BladeRegistry */
  name: string;
  /** Entity ID for the blade */
  param?: string;
  /** Small key-value pairs for URL query */
  query?: Record<string, string>;
  /** Large context data — stored in history.state only */
  options?: Record<string, unknown>;
  /** Called after the blade is opened */
  onOpen?: () => void;
  /** Called after the blade is closed */
  onClose?: () => void;
  /** If true, replaces current blade instead of opening a new one */
  replaceCurrentBlade?: boolean;
}

/**
 * Result of parsing a blade URL into its segments.
 */
export interface ParsedBladeUrl {
  /** Workspace URL segment (e.g. "orders") */
  workspaceUrl?: string;
  /** Child blade URL segment (e.g. "order") */
  bladeUrl?: string;
  /** Entity ID from the URL path */
  param?: string;
}

/**
 * Public interface for the BladeStack state machine.
 */
export interface IBladeStack {
  /** The workspace blade (first in stack) */
  readonly workspace: ComputedRef<BladeDescriptor | undefined>;
  /** All blades in the stack (including workspace at [0]) */
  readonly blades: ComputedRef<readonly BladeDescriptor[]>;
  /** The last visible blade */
  readonly activeBlade: ComputedRef<BladeDescriptor | undefined>;

  /** Switch to a different workspace — clears all existing blades */
  openWorkspace(event: BladeOpenEvent): Promise<void>;
  /** Open a new blade as a child of the active blade */
  openBlade(event: BladeOpenEvent & { parentId?: string }): Promise<void>;
  /** Close a blade by ID. Returns true if close was prevented by a guard. */
  closeBlade(bladeId: string): Promise<boolean>;
  /** Replace the current active blade with a different one */
  replaceCurrentBlade(event: BladeOpenEvent & { parentId?: string }): Promise<void>;

  /**
   * Register a before-close guard for a blade.
   *
   * Guard semantics (NEW API): return `true` to PREVENT close, `false` to ALLOW.
   *
   * **Note**: The legacy `onBeforeClose` callback has INVERTED semantics:
   * return `false` to prevent, `undefined`/`true` to allow.
   * The adapter in `useBladeNavigationAdapter.ts` handles this inversion.
   */
  registerBeforeClose(bladeId: string, guard: () => Promise<boolean>): void;
  /** Unregister a before-close guard */
  unregisterBeforeClose(bladeId: string): void;

  /** Set an error on a blade */
  setBladeError(bladeId: string, error: unknown): void;
  /** Clear a blade's error */
  clearBladeError(bladeId: string): void;

  /** Update a blade's title (called by VcBladeSlot when component exposes title) */
  setBladeTitle(bladeId: string, title: string | undefined): void;

  /** Restore stack from descriptors (used by HistoryManager — bypasses guards) */
  _restoreStack(descriptors: BladeDescriptor[]): void;
}

/**
 * Public interface for inter-blade messaging.
 */
export interface IBladeMessaging {
  /** Expose methods to child blades */
  exposeToChildren(bladeId: string, methods: Record<string, (...args: any[]) => any>): void;
  /** Call a method exposed by the parent blade */
  callParent<T = unknown>(callerBladeId: string, method: string, args?: unknown): Promise<T>;
  /** Remove all exposed methods for a blade (cleanup on close) */
  cleanup(bladeId: string): void;
}

// ─── Injection Keys for new BladeStack architecture ───────────────────────────

export const BladeStackKey: InjectionKey<IBladeStack> = Symbol("BladeStack");
export const BladeMessagingKey: InjectionKey<IBladeMessaging> = Symbol("BladeMessaging");
export const BladeDescriptorKey: InjectionKey<ComputedRef<BladeDescriptor>> = Symbol("BladeDescriptor");
