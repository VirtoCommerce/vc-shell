/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentPublicInstance, ComputedOptions, MethodOptions, EmitsOptions, Slots, ComponentOptions } from "vue";

export type ComponentConstructor<
  Component extends ComponentPublicInstance<Props, RawBindings, D, C, M, E> = ComponentPublicInstance<any>,
  Props = any,
  RawBindings = any,
  D = any,
  C extends ComputedOptions = ComputedOptions,
  M extends MethodOptions = MethodOptions,
  E extends EmitsOptions = EmitsOptions,
  Slot extends Slots = Slots
> = { new (): Component & { $slots: Slot } } & ComponentOptions<Props, RawBindings, D, C, M, E>;

export type GlobalComponentConstructor<
  T extends abstract new (...args: any) => any,
  S extends Slots
> = ComponentConstructor<InstanceType<T>, any, any, any, any, any, any, S>;
