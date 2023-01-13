/* eslint-disable */
import {
  ComponentOptions,
  ComponentPublicInstance,
  ComputedOptions,
  EmitsOptions,
  MethodOptions,
  VNodeProps,
} from "vue";

export type PublicProps = VNodeProps;

export type ComponentConstructor<
  Component extends ComponentPublicInstance<
    Props,
    RawBindings,
    D,
    C,
    M,
    E
  > = ComponentPublicInstance<any>,
  Props = any,
  RawBindings = any,
  D = any,
  C extends ComputedOptions = ComputedOptions,
  M extends MethodOptions = MethodOptions,
  E extends EmitsOptions = EmitsOptions
> = { new (): Component } & ComponentOptions<
  Props,
  RawBindings,
  D,
  C,
  M,
  any,
  any,
  E
>;


export type GlobalComponentConstructor<Props = {}, Slots = {}, Emits = {}> = {
  new (): {
    $props: PublicProps & Props;
    $slots: Slots;
    $emit: EmitsOptions & Emits;
  };
};
