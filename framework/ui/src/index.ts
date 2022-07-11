import { App } from "vue";
import * as components from "./components";
import * as directives from "./directives";
import { useBreakpoints } from "@vueuse/core";
import Vue3TouchEvents from "vue3-touch-events";
import draggable from "vuedraggable/src/vuedraggable";
import { defineRule, useForm as _useForm } from "vee-validate";
import {
  email,
  min,
  max,
  regex,
  min_value,
  max_value,
  numeric,
} from "@vee-validate/rules";

import "normalize.css";
import "./styles/index.less";

export default {
  install(app: App): void {
    console.debug(`[@virtoshell/ui] - Install plugin`);

    app.use(Vue3TouchEvents);
    app.component("draggable", draggable);

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
    defineRule("numeric", numeric);
    defineRule("email", email);
    defineRule("min", min);
    defineRule("max", max);
    defineRule("regex", regex);
    defineRule("min_value", min_value);
    defineRule("max_value", max_value);
    defineRule("after", (value: string, [target]: string[]) => {
      // The field is empty so it should pass
      if (!value || !value.length) {
        return true;
      }

      const first_date = new Date(value);
      const second_date = new Date(target);

      if (first_date.getTime() > 0 && second_date.getTime() > 0) {
        if (second_date.getTime() > first_date.getTime()) {
          return "End date must be later than start date";
        }
      }

      return true;
    });
    defineRule(
      "maxdimensions",
      (
        images: HTMLInputElement,
        [width, height]: [string | number, string | number]
      ) => {
        // The field is empty so it should pass
        if (!images?.files || !images.files?.length) {
          return true;
        }

        const validateImage = (
          file: File,
          width: string | number,
          height: string | number
        ) => {
          const URL = window.URL || window.webkitURL;
          return new Promise((resolve) => {
            const image = new Image();
            image.onerror = () => resolve(false);
            image.onload = () => {
              const isValid =
                image.width >= Number(width) && image.height >= Number(height);
              if (isValid) {
                resolve(true);
              } else {
                resolve(
                  `Image dimensions must be greater than ${height}*${width}`
                );
              }
            };

            image.src = URL.createObjectURL(file);
          });
        };
        const list = [];
        const fileList = images.files;
        for (let i = 0; i < fileList.length; i++) {
          if (!/\.(jpg|svg|jpeg|png|bmp|gif)$/i.test(fileList[i].name)) {
            return Promise.resolve("Not image file");
          }

          list.push(fileList[i]);
        }
        return Promise.all(
          list.map((file) => validateImage(file, width, height))
        ).then((res) => {
          const isInvalid = res.find((x) => x !== true);
          if (isInvalid === false || typeof isInvalid === "string") {
            return isInvalid;
          } else {
            return true;
          }
        });
      }
    );

    defineRule("size", (file: HTMLInputElement, [size]: [number]) => {
      if (!file?.files || !file.files?.length) {
        return true;
      }

      const maxSize = size * 1000;

      const fileSizeChecker = (file: File) => {
        return file.size > maxSize;
      };

      const list = [];
      for (let i = 0; i < file.files.length; i++) {
        list.push(file.files[i]);
      }

      const checker = list.map((x) => fileSizeChecker(x));

      const isInvalid = checker.find((x) => x === true);
      if (isInvalid) {
        return `File size must be maximum ${size} kb`;
      } else {
        return true;
      }
    });
  },
};

export * from "./components";
export * from "./typings";
export const useForm = _useForm;
