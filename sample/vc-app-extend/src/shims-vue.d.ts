/* eslint-disable */
import { CoreBladeAdditionalSettings, DynamicGridSchema, DynamicDetailsSchema } from "@vc-shell/framework";

import type { Component, Ref } from "vue";
import type {
  ComponentCustomProperties as _ComponentCustomProperties,
} from 'vue';
import type { Composer } from "vue-i18n";
import type { moment } from "moment";
import type { Vue } from "vue";
import type { VueRouter } from "vue-router";
import type { VeeValidate } from "vee-validate";
import type { VueI18n } from "vue-i18n";
import type { VcShellFramework } from "@vc-shell/framework";


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
    $dynamicModules: {
      [x: string]: {
        components?: { [key: string]: Component };
        composables?: { [key: string]: (...args: any[]) => any };
        default: { install: (app: any, options?: any) => void };
        schema: { [key: string]: DynamicGridSchema | DynamicDetailsSchema };
        locales: { [key: string]: { [key: string]: string } };
        notificationTemplates?: { [key: string]: Component };
      };
    };
  }

  interface ComponentOptionsBase extends CoreBladeAdditionalSettings {}
}

declare global {
  interface Window {
    VcShellDynamicModules: {
      [x: string]: {
        components?: { [key: string]: Component };
        composables?: { [key: string]: (...args: any[]) => any };
        default: { install: (app: any, options?: any) => void };
        schema: { [key: string]: DynamicGridSchema | DynamicDetailsSchema };
        locales: { [key: string]: { [key: string]: string } };
        notificationTemplates?: { [key: string]: Component };
      };
    };
    Vue: typeof vue;
    VueRouter: typeof vueRouter;
    VeeValidate: typeof veeValidate;
    VueI18n: typeof vueI18n;
    moment: moment;
    VcShellFramework: any;
  }
}

export {};
