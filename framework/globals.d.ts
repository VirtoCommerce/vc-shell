/* eslint-disable @typescript-eslint/no-explicit-any */
import { DynamicGridSchema, DynamicDetailsSchema } from "@shared/modules/dynamic/types";
import * as vue from "vue";
import * as vueRouter from "vue-router";
import * as veeValidate from "vee-validate";
import * as vueI18n from "vue-i18n";
import * as VueUse from "@vueuse/core";
import moment from "moment";
import * as _ from "lodash";
import type { Component } from "vue";

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
    VueUse: typeof VueUse;
    _: any;
  }
}
