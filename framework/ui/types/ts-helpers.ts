/* eslint-disable */
import {
  ComponentOptions,
  ComponentPublicInstance,
  ComputedOptions,
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
    M
  > = ComponentPublicInstance<any>,
  Props = any,
  RawBindings = any,
  D = any,
  C extends ComputedOptions = ComputedOptions,
  M extends MethodOptions = MethodOptions,
> = { new (): Component } & ComponentOptions<Props, RawBindings, D, C, M>;

export type GlobalComponentConstructor<Props = {}, Slots = {}> = {
    new (): {
      $props: PublicProps & Props;
      $slots: Slots;
    }
};
