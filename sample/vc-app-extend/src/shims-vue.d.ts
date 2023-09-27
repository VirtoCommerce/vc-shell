/* eslint-disable */
import { CoreBladeAdditionalSettings } from "@vc-shell/framework";
import { Ref } from "vue";

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
  }

  interface ComponentOptionsBase extends CoreBladeAdditionalSettings {}
}

export {};
