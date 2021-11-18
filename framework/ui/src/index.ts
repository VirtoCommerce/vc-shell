import { App } from "vue";
import * as components from "./components";
import * as directives from "./directives";
import { useBreakpoints } from "@vueuse/core";
import Vue3TouchEvents from "vue3-touch-events";
import { defineRule, useForm as _useForm } from "vee-validate";

import "normalize.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "./styles/index.less";

export default {
  install(app: App): void {
    console.debug(`[@virtoshell/ui] - Install plugin`);

    app.use(Vue3TouchEvents);

    // Register exported components
    Object.entries(components).forEach(([componentName, component]) => {
      app.component(componentName, component);
    });

    // Register exported directives
    Object.entries(directives).forEach(([directiveName, directive]) => {
      app.directive(directiveName, directive);
    });

    const bp = useBreakpoints({
      phone: 480,
      desktop: 1024,
    });

    app.config.globalProperties.pages = [];
    app.config.globalProperties.$isPhone = bp.smaller("phone");
    app.config.globalProperties.$isTablet = bp.between("phone", "desktop");
    app.config.globalProperties.$isMobile = bp.smaller("desktop");
    app.config.globalProperties.$isDesktop = bp.greater("desktop");
    app.config.globalProperties.$isTouch =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;

    app.provide("isPhone", app.config.globalProperties.$isPhone);
    app.provide("isTablet", app.config.globalProperties.$isTablet);
    app.provide("isMobile", app.config.globalProperties.$isMobile);
    app.provide("isDesktop", app.config.globalProperties.$isDesktop);
    app.provide("pages", app.config.globalProperties.pages);

    // Define global validation rules
    defineRule("required", (value: string | boolean) => {
      if (
        value === null ||
        value === undefined ||
        value === false ||
        value === ""
      ) {
        return "This field is required";
      }
      return true;
    });
    defineRule("email", (value: string) => {
      // Field is empty, should pass
      if (!value || !value.length) {
        return true;
      }
      // Check if email
      if (!/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}/.test(value)) {
        return "This field must be a valid email";
      }
      return true;
    });
    defineRule("min", (value: string, [limit]: number[]) => {
      // The field is empty so it should pass
      if (!value || !value.length) {
        return true;
      }
      if (value.length < limit) {
        return `This field must contain at least ${limit} characters`;
      }
      return true;
    });
    defineRule("max", (value: string, [limit]: number[]) => {
      // The field is empty so it should pass
      if (!value || !value.length) {
        return true;
      }
      if (value.length > limit) {
        return `This field must contain not more than ${limit} characters`;
      }
      return true;
    });
    defineRule("regex", (value: string, [re]: RegExp[]) => {
      // Field is empty, should pass
      if (!value || !value.length) {
        return true;
      }
      // Check if matched
      if (!re.test(value)) {
        return "This field must match a given pattern";
      }
      return true;
    });
    defineRule("min_value", (value: string, [min]: number[]) => {
      // The field is empty so it should pass
      if (!value || !value.length) {
        return true;
      }
      const numericValue = Number(value);
      if (numericValue < min) {
        return `Value must be greater than ${min}`;
      }
      return true;
    });
    defineRule("max_value", (value: string, [max]: number[]) => {
      // The field is empty so it should pass
      if (!value || !value.length) {
        return true;
      }
      const numericValue = Number(value);
      if (numericValue > max) {
        return `Value must be less than ${max}`;
      }
      return true;
    });
  },
};

export * from "./components";
export * from "./typings";
export const useForm = _useForm;
