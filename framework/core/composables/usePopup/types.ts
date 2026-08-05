import { Component, Slot as VueSlot, type Ref } from "vue";
import type { ComponentProps } from "vue-component-type-helpers";

export type RawProps<T extends Component> = Omit<ComponentProps<T>, `on${string}`>;
export type RawEmits<T extends Component> = Pick<ComponentProps<T>, Extract<keyof ComponentProps<T>, `on${string}`>>;
export type Slot = string | Component | VueSlot;

export interface UsePopupInternal {
  id: symbol;
  open: () => void;
  close: () => void;
  /**
   * Set by `close()` to start the closing phase. The instance stays mounted until
   * the popup reports its leave transition finished (or the safety timer fires),
   * so the dialog can run its own close sequence — which is what restores focus
   * to the element that opened it.
   */
  closing: boolean;
  /**
   * The control that had focus when the popup was opened. Focus returns here once
   * the popup is gone, provided focus was lost to `<body>` in the meantime
   * (WCAG 2.4.3). Kept raw — this is a DOM node, not reactive state.
   */
  opener?: HTMLElement;
  /**
   * Unmounts the instance now. Called by the popup once its leave transition ends;
   * the single removal path, so restoring focus cannot be skipped.
   */
  finalize: () => void;
}

/**
 * Per-popup context handed to the rendered popup through provide/inject.
 *
 * Injected rather than passed as a prop because the container renders an
 * arbitrary component: writing `modelValue` into it would collide with popups
 * that own that prop themselves.
 */
export interface PopupInstanceContext {
  /** True once closing has started and the leave transition should run. */
  closing: Readonly<Ref<boolean>>;
  /** Called by the popup when its leave transition has finished. */
  finalize: () => void;
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
