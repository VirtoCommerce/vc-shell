import type * as components from "@ui/components";

type TGlobalComponents<T> = {
  [x in keyof T]: T[x];
};

declare module "vue" {
  export interface GlobalComponents extends TGlobalComponents<typeof components> {}
}
