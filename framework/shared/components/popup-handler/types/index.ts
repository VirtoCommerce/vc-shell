import { Component, ComponentPublicInstance, DefineComponent, Slot as VueSlot } from "vue";

export type RawProps<T extends ComponentPublicInstanceConstructor<any>> = Omit<
  InstanceType<T>["$props"],
  `on${string}`
>;
export type RawEmits<T extends ComponentPublicInstanceConstructor<any>> = Pick<
  InstanceType<T>["$props"],
  Extract<keyof InstanceType<T>["$props"], `on${string}`>
>;
export type Slot = string | Component | VueSlot;

export interface UsePopupInternal {
  id: symbol;
  open: () => void;
  close: () => void;
}

export interface PopupPlugin {
  popups: Partial<UsePopupProps<DefineComponent> & UsePopupInternal>[];
}

export interface ComponentPublicInstanceConstructor<T extends ComponentPublicInstance> {
  __isFragment?: never;
  __isTeleport?: never;
  __isSuspense?: never;
  new (...args: unknown[]): T;
}

export interface UsePopupProps<T extends ComponentPublicInstanceConstructor<any>> {
  component: T;
  emits?: RawEmits<T>;
  props?: RawProps<T>;
  slots?: {
    [key: string]: Slot;
  };
}
