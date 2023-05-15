/* eslint-disable */
import { Ref } from "vue";
import { CoreBladeAdditionalSettings } from "@vc-shell/framework";

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $isPhone: Ref<boolean>;
    $isTablet: Ref<boolean>;
    $isMobile: Ref<boolean>;
    $isDesktop: Ref<boolean>;
    $isTouch: boolean;
  }

  interface ComponentOptionsBase extends CoreBladeAdditionalSettings {}
}

export {};
