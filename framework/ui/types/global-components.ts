import type * as components from "@ui/components";

type TGlobalComponents<T> = {
  [x in keyof T]: T[x];
};

declare module "vue" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface GlobalComponents extends TGlobalComponents<typeof components> {}
}
