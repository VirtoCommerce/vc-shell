import { App } from "vue";
import * as components from "./ui/components";
import * as directives from "./core/directives";
import { useBreakpoints } from "@vueuse/core";
import Vue3TouchEvents from "vue3-touch-events";
import draggable from "vuedraggable/src/vuedraggable";
import { i18n } from "./core/plugins";
import { default as SharedModule } from "./shared";

import "normalize.css";
import "./assets/styles/index.scss";

export default {
  install(app: App): void {
    app.use(i18n);
    // Left for backward compatibility
    app.config.globalProperties.$mergeLocaleMessage = i18n.global.mergeLocaleMessage;

    // Install libraries
    app.use(Vue3TouchEvents);
    app.component("draggable", draggable);

    // Register exported components
    Object.entries(components).forEach(([name, component]) => {
      app.component(name, component);
    });

    // Register exported directives
    Object.entries(directives).forEach(([directiveName, directive]) => {
      app.directive(directiveName, directive);
    });

    // Breakpoints
    const bp = useBreakpoints({
      phone: 480,
      desktop: 1024,
    });

    app.config.globalProperties.$isPhone = bp.smaller("phone");
    app.config.globalProperties.$isTablet = bp.between("phone", "desktop");
    app.config.globalProperties.$isMobile = bp.smaller("desktop");
    app.config.globalProperties.$isDesktop = bp.greater("desktop");
    app.config.globalProperties.$isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

    app.provide("isPhone", app.config.globalProperties.$isPhone);
    app.provide("isTablet", app.config.globalProperties.$isTablet);
    app.provide("isMobile", app.config.globalProperties.$isMobile);
    app.provide("isDesktop", app.config.globalProperties.$isDesktop);
    app.provide("isTouch", app.config.globalProperties.$isTouch);

    // Pages
    app.config.globalProperties.pages = [];
    app.provide("pages", app.config.globalProperties.pages);

    // Shared module
    app.use(SharedModule);
  },
};

export * from "./ui/components";
// eslint-disable-next-line import/export
export * from "./ui/types";

export * from "./core/composables";
export * from "./core/directives";
export * from "./core/types";
export * from "./core/plugins";
export * from "./core/api";
export * from "./core/utilities";

export * from "./shared";
