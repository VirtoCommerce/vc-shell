import { Component, DefineComponent, Slot as VueSlot } from "vue";
import { ComponentPublicInstanceConstructor, ComponentEmit } from "@shared/utilities/vueUtils";

export type RawProps<T extends ComponentPublicInstanceConstructor> = Omit<InstanceType<T>["$props"], `on${string}`>;
export type RawEmits<T extends ComponentPublicInstanceConstructor> = ComponentEmit<T>;
export type Slot = string | Component | VueSlot;

export interface UsePopupInternal {
  id: symbol;
  open: () => void;
  close: () => void;
}

export interface PopupPlugin {
  popups: Partial<UsePopupProps<DefineComponent> & UsePopupInternal>[];
}

export interface UsePopupProps<T extends ComponentPublicInstanceConstructor> {
  component: T;
  emits?: RawEmits<T>;
  props?: RawProps<T>;
  slots?: {
    [key: string]: Slot;
  };
}
