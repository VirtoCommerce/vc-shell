import { VcShellComponents } from "./components";

// Declare all components globally
declare module "vue" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface GlobalComponents extends VcShellComponents {}
}

export {};
