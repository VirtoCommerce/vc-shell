/* eslint-disable */

import { CoreBladeAdditionalSettings } from "@vc-shell/framework";
import type { Ref } from "vue";
import type { Composer } from "vue-i18n";

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties extends _ComponentCustomProperties {
    $mergeLocaleMessage: Composer<{}, {}, {}, string, never, string>["mergeLocaleMessage"];
    $hasAccess: (permissions: string | string[] | undefined) => boolean;
    $isPhone: Ref<boolean>;
    $isTablet: Ref<boolean>;
    $isMobile: Ref<boolean>;
    $isDesktop: Ref<boolean>;
    $isTouch: boolean;
    $t: (key: string, ...args: any[]) => string;
  }

  interface ComponentOptionsBase extends CoreBladeAdditionalSettings {}
}

export {};
