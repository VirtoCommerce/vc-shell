/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import { ComponentPublicInstance, ComputedOptions, MethodOptions } from "vue";

type RemoveOnVnodePrefix<T> = {
  [K in keyof T as K extends `onVnode${string}`
    ? never
    : K extends `on${infer Event}`
      ? Uncapitalize<`on${Event}`>
      : K]: T[K];
};

type EmitsExtractor<T> = RemoveOnVnodePrefix<Pick<T, Extract<keyof T, `on${string}`>>>;

export type ComponentProps<T> = T extends new () => { $props: infer P }
  ? NonNullable<P>
  : T extends (props: infer P, ...args: any) => any
    ? P
    : {};

export type ComponentSlots<T> = T extends (...args: any) => any
  ? ReturnType<T> extends { [x: string]: any; __ctx?: { [x: string]: any; slots: infer Slots } }
    ? NonNullable<Slots>
    : {}
  : T extends new () => { $slots: infer S }
    ? NonNullable<S>
    : {};

export type ComponentEmit<T> = T extends (...args: any) => any
  ? ReturnType<T> extends { [x: string]: any; __ctx?: { [x: string]: any; props: infer Props } }
    ? EmitsExtractor<Props>
    : {}
  : T extends new () => { $props: infer Props }
    ? EmitsExtractor<Props>
    : never;

export type ComponentPublicInstanceConstructor<
  T extends ComponentPublicInstance<Props, RawBindings, D, C, M> = ComponentPublicInstance<any>,
  Props = any,
  RawBindings = any,
  D = any,
  C extends ComputedOptions = ComputedOptions,
  M extends MethodOptions = MethodOptions,
> = {
  __isFragment?: never;
  __isTeleport?: never;
  __isSuspense?: never;
  new (...args: any[]): T;
};
