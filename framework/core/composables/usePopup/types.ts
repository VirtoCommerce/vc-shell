import { Component, Slot as VueSlot } from "vue";
import type { ComponentProps } from "vue-component-type-helpers";

export type RawProps<T extends Component> = Omit<ComponentProps<T>, `on${string}`>;
export type RawEmits<T extends Component> = Pick<ComponentProps<T>, Extract<keyof ComponentProps<T>, `on${string}`>>;
export type Slot = string | Component | VueSlot;

export interface UsePopupInternal {
  id: symbol;
  open: () => void;
  close: () => void;
}

export interface PopupPlugin {
  popups: Partial<UsePopupProps & UsePopupInternal>[];
}

export interface UsePopupProps<T extends Component = Component> {
  component: T;
  emits?: RawEmits<T>;
  props?: RawProps<T>;
  slots?: {
    [key: string]: Slot;
  };
}
