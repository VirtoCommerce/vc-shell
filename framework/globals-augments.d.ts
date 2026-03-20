/* eslint-disable @typescript-eslint/no-explicit-any */

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
    $isPhone: Ref<boolean>;
    $isTablet: Ref<boolean>;
    $isMobile: Ref<boolean>;
    $isDesktop: Ref<boolean>;
    $isTouch: boolean;
  }

  interface ComponentOptionsBase extends CoreBladeAdditionalSettings {}
}

export {};
