/* eslint-disable */
import { Ref } from "vue";
import { Composer } from "vue-i18n";
import { CoreBladeAdditionalSettings } from "./../shared/components/blade-navigation/types";

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module "*.mdx" {
  let MDXComponent: (props: any) => JSX.Element;
  export default MDXComponent;
}

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $mergeLocaleMessage: Composer<{}, {}, {}, string, never, string>["mergeLocaleMessage"];
    $hasAccess: (permissions: string | string[]) => boolean;
    $isPhone: Ref<boolean>;
    $isTablet: Ref<boolean>;
    $isMobile: Ref<boolean>;
    $isDesktop: Ref<boolean>;
    $isTouch: boolean;
  }
}

declare global {
  interface Window {
    __DEMO_MODE__: boolean;
  }
}

export {};
