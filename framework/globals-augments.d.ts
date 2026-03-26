/**
 * Module augmentation for @vue/runtime-core.
 *
 * This file is a module (has top-level imports) so `declare module` statements
 * are augmentations that extend existing modules — exactly what we need for
 * adding custom properties to Vue's ComponentCustomProperties.
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
