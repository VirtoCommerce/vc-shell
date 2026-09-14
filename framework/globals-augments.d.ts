/**
 * Module augmentation for @vue/runtime-core. The file has top-level imports, so `declare
 * module` extends the existing module rather than replacing it — which is what adding to
 * ComponentCustomProperties needs.
 */

import type { CoreBladeAdditionalSettings } from "@vc-shell/framework";
import type { Ref } from "vue";
import type { Composer } from "vue-i18n";

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties extends _ComponentCustomProperties {
    $t: (key: string, ...args: any[]) => string;
    $d: (key: string, ...args: any[]) => string;
    $tm: (key: string, ...args: any[]) => string;
    $rt: (key: string, ...args: any[]) => string;
    $mergeLocaleMessage: Composer<{}, {}, {}, string, never, string>["mergeLocaleMessage"];
    $hasAccess: (permissions: string | string[] | undefined) => boolean;
    /** @deprecated Use `useResponsive()` composable instead. Will be removed in next major. */
    $isPhone: Ref<boolean>;
    /** @deprecated Use `useResponsive()` composable instead. Will be removed in next major. */
    $isTablet: Ref<boolean>;
    /** @deprecated Use `useResponsive()` composable instead. Will be removed in next major. */
    $isMobile: Ref<boolean>;
    /** @deprecated Use `useResponsive()` composable instead. Will be removed in next major. */
    $isDesktop: Ref<boolean>;
    /** @deprecated Use `useResponsive()` composable instead. Will be removed in next major. */
    $isTouch: boolean;
  }

  interface ComponentOptionsBase extends CoreBladeAdditionalSettings {}
}

export {};
