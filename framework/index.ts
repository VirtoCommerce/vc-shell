import { App, Component } from "vue";
import * as components from "./ui/components";
import * as directives from "./core/directives";
import { useBreakpoints } from "@vueuse/core";
import Vue3TouchEvents from "vue3-touch-events";
import { i18n, permissions, signalR } from "./core/plugins";
import { SharedModule } from "./shared";
import * as componentLocales from "./ui/locales";
import * as sharedPages from "./shared/pages/plugin";
import "./utils/isInDemoMode";

import "normalize.css";
import "./assets/styles/index.scss";

export default {
  install(app: App): void {
    app.use(i18n);
    // Left for backward compatibility
    app.config.globalProperties.$mergeLocaleMessage = i18n.global.mergeLocaleMessage;

    // Components locales
    Object.entries(componentLocales).forEach(([key, message]) => {
      i18n.global.mergeLocaleMessage(key, message);
    });

    // Install libraries
    app.use(Vue3TouchEvents);

    // Register exported components
    Object.entries(components).forEach(([name, component]) => {
      app.component(name, component as Component);
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

    // Routes
    app.config.globalProperties.bladeRoutes = [];
    app.provide("bladeRoutes", app.config.globalProperties.bladeRoutes);

    // Notification templates
    app.config.globalProperties.notificationTemplates = [];
    app.provide("notificationTemplates", app.config.globalProperties.notificationTemplates);

    // Shared module
    app.use(SharedModule);

    // SignalR
    app.use(signalR);

    // Permissions check
    app.use(permissions);

    // Common pages
    Object.values(sharedPages).forEach((page) => {
      app.use(page);
    });
  },
};

export * from "./ui/components";
// eslint-disable-next-line import/export
export * from "./ui/types";

export * from "./core/composables";
export * from "./core/directives";
export * from "./core/types";
export * from "./core/plugins";
export * from "./core/api/platform";
export * from "./core/utilities";

export * from "./shared";
