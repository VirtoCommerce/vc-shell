import { App } from "vue";
import * as components from "./components";
import * as directives from "./directives";
import { useBreakpoints } from "@vueuse/core";
import Vue3TouchEvents from "vue3-touch-events";

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
  },
};

export * from "./components";
