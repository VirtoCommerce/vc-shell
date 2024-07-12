/* eslint-disable */
import { CoreBladeAdditionalSettings } from "@vc-shell/framework";
import { Ref, Plugin } from "vue";
import { DynamicGridSchema, DynamicDetailsSchema } from "@vc-shell/framework";
import * as vue from "vue";
import * as vueRouter from "vue-router";
import * as veeValidate from "vee-validate";
import * as vueI18n from "vue-i18n";
import moment from "moment";
import type { Component } from "vue";

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
