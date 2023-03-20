import type * as vcShellComponents from "../components";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Map<O extends Record<any, any>> = { [K in keyof O]: O[K] };
type KeyInObj<O, K> = K extends keyof O ? O[K] : never;

/** List of all components */
export type VcShellComponentsMap = Map<typeof vcShellComponents>;
/** Component names */
export type VcShellComponentName = keyof VcShellComponentsMap;

export type VcShellComponents<NAMES extends string = VcShellComponentName> = {
  [name in NAMES]: KeyInObj<VcShellComponentsMap, name>;
};
