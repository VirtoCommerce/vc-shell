/* eslint-disable */
import { CoreBladeAdditionalSettings } from "@vc-shell/framework";
import { Ref, Plugin } from "vue";

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $hasAccess: (permissions: string | string[]) => boolean;
    $isPhone: Ref<boolean>;
    $isTablet: Ref<boolean>;
    $isMobile: Ref<boolean>;
    $isDesktop: Ref<boolean>;
    $isTouch: boolean;
    $dynamicModules: Record<
      string,
      {
        components: Record<string, any>;
        composables: Record<string, any>;
        default: Plugin;
        locales: Record<string, any>;
        schema: Record<string, any>;
      }
    >;
  }

  interface ComponentOptionsBase extends CoreBladeAdditionalSettings {}
}

export {};
