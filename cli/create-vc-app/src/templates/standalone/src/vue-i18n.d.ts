import type { ComponentCustomProperties } from '@vue/runtime-core';

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $t: (key: string, ...args: any[]) => string;
    $d: (key: string, ...args: any[]) => string;
    $tm: (key: string, ...args: any[]) => string;
    $rt: (key: string, ...args: any[]) => string;
  }
}
