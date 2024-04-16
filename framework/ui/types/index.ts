import { MaybeRef } from "vue";
import * as components from "./../components";

// Declare all components globally

type TGlobalComponents<T> = {
  [x in keyof T]: T[x];
};
declare module "vue" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface GlobalComponents extends TGlobalComponents<typeof components> {}
}

export interface Breadcrumbs {
  icon?: string;
  title: MaybeRef<string | undefined>;
  clickHandler?: (id: string) => void | boolean | Promise<void | boolean>;
  id: string;
}
