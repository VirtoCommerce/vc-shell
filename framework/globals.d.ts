/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Global type augmentations for apps consuming @vc-shell/framework.
 *
 * Usage — add to tsconfig.json:
 *   "compilerOptions": { "types": ["vite/client", "@vc-shell/framework/globals"] }
 *
 * This replaces manual shims-vue.d.ts and vue-i18n.d.ts files.
 */

import type { CoreBladeAdditionalSettings } from "./index";
import type { Ref } from "vue";
import type { Composer } from "vue-i18n";

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties extends _ComponentCustomProperties {
    $t: (key: string, ...args: any[]) => string;
    $d: (key: string, ...args: any[]) => string;
    $tm: (key: string, ...args: any[]) => string;
    $rt: (key: string, ...args: any[]) => string;
    $mergeLocaleMessage: Composer<{}, {}, {}, string, never, string>["mergeLocaleMessage"];
    $hasAccess: (permissions: string | string[] | undefined) => boolean;
    $isPhone: Ref<boolean>;
    $isTablet: Ref<boolean>;
    $isMobile: Ref<boolean>;
    $isDesktop: Ref<boolean>;
    $isTouch: boolean;
  }

  interface ComponentOptionsBase extends CoreBladeAdditionalSettings {}
}

export {};
