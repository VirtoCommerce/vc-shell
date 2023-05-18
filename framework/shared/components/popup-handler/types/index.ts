import { Component, Slot as VueSlot } from "vue";

export type RawProps<T> = Omit<T, `on${string}`>;
export type RawEmits<T> = Pick<T, Extract<keyof T, `on${string}`>>;
export type Slot = string | Component | VueSlot;

export interface UsePopupInternal {
  id: symbol;
  open: () => void;
  close: () => void;
}

export interface PopupPlugin {
  popups: (UsePopupProps<unknown> & UsePopupInternal)[];
}

export interface ComponentPublicInstanceConstructor<T = unknown> {
  new (...args: unknown[]): { $props: T };
}

export interface UsePopupProps<T> {
  component: ComponentPublicInstanceConstructor<T>;
  emits?: RawEmits<T>;
  props?: RawProps<T>;
  slots?: {
    [key: string]: Slot;
  };
}
