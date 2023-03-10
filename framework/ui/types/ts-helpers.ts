/* eslint-disable */
import {
  ComponentOptions,
  ComponentPublicInstance,
  ComputedOptions,
  ExtractPropTypes,
  MethodOptions,
  ObjectEmitsOptions,
  EmitsOptions,
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
> = { new (): Component } & ComponentOptions<Props, RawBindings, D, C, M, E>;

export type GlobalComponentConstructor<Props = {}, Slots = {}, Emits = {}> = {
    new (): {
      $props: PublicProps & Props;
      $slots: Slots;
      $emit: EventToSignature<Emits>
    }
};

export type EmitsToProps<T extends ObjectEmitsOptions> = {
  [K in string & `on${Capitalize<string & keyof T>}`]?: K extends `on${infer C}`
    ? T[Uncapitalize<C>] extends null
      ? (...args: any[]) => void
      : (...args: T[Uncapitalize<C>] extends (...args: infer P) => void ? P : never) => void
    : never;
};

export type ExtractTypes<T> = Partial<ExtractPropTypes<T>>;
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
export type EventToSignature<Options = ObjectEmitsOptions, Event extends keyof Options = keyof Options> = UnionToIntersection<{
  [key in Event]: Options[key] extends (...args: infer Args) => any ? (event: key, ...args: Args) => void : (event: key, ...args: any[]) => void;
}[Event]>
