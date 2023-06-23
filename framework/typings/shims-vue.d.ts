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
    /** @deprecated use `i18n.mergeLocaleMessage` from `import { i18n } "@vc-shell/framework"` */
    $mergeLocaleMessage: Composer<{}, {}, {}, string, never, string>["mergeLocaleMessage"];
    $hasAccess: (permissions: string | string[]) => boolean;
    $isPhone: Ref<boolean>;
    $isTablet: Ref<boolean>;
    $isMobile: Ref<boolean>;
    $isDesktop: Ref<boolean>;
    $isTouch: boolean;
  }
}

export {};
