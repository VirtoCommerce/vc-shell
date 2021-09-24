import { App } from "vue";
import * as components from "./components";
import * as directives from "./directives";
import { useBreakpoints } from "@vueuse/core";

import "normalize.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "./styles/index.less";

export default {
  install(app: App): void {
    console.debug(`[@virtoshell/ui] - Install plugin`);

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

    app.config.globalProperties.$isPhone = bp.smaller("phone");
    app.config.globalProperties.$isTablet = bp.between("phone", "desktop");
    app.config.globalProperties.$isMobile = bp.smaller("desktop");
    app.config.globalProperties.$isDesktop = bp.greater("desktop");
    app.config.globalProperties.$isTouch =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
  },
};

export * from "./components";
