import { Router } from "vue-router";
import { App, Component } from "vue";
import * as components from "./ui/components";
import * as directives from "./core/directives";
import { useBreakpoints } from "@vueuse/core";
import { i18n, permissions, signalR } from "./core/plugins";
import { SharedModule, notification } from "./shared";
import * as sharedPages from "./shared/pages/plugin";
import { registerInterceptors } from "./core/interceptors";
import { usePermissions } from "./core/composables/usePermissions";
import { useUser } from "./core/composables/useUser";

import "normalize.css";
import "./assets/styles/index.scss";

export default {
  install(
    app: App,
    args: {
      router: Router;
      platformUrl: string;
      i18n?: {
        locale: string;
        fallbackLocale: string;
      };
    },
  ): void {
    // HTTP Interceptors
    window.fetch = registerInterceptors(args.router);

    if (args.i18n?.locale) {
      i18n.global.locale.value = args.i18n.locale;
    }
    if (args.i18n?.fallbackLocale) {
      i18n.global.fallbackLocale.value = args.i18n.fallbackLocale;
    }

    app.use(i18n);

    app.config.globalProperties.$mergeLocaleMessage = i18n.global.mergeLocaleMessage;

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
    app.use(SharedModule, { router: args.router });

    // SignalR
    app.use(signalR);

    // Permissions check
    app.use(permissions);

    // Common pages
    Object.values(sharedPages).forEach((page) => {
      app.use(page);
    });

    app.provide("platformUrl", args.platformUrl);

    args.router.listening = false;

    // Router guards
    /**
     * Check if user is authenticated and redirect to login page if not.
     */
    // TODO add check if app has login page
    args.router.beforeEach(async (to) => {
      const { isAuthenticated } = useUser();

      if (to.name !== "Login" && to.name !== "ResetPassword" && to.name !== "Invite") {
        try {
          if (!isAuthenticated.value) {
            return { name: "Login" };
          } else return true;
        } catch (e) {
          return { name: "Login" };
        }
      } else return true;
    });

    /**
     * Check if user has access to the page and redirect to previous path if not.
     */
    args.router.beforeEach((to, from) => {
      const { hasAccess } = usePermissions();
      if (!to.meta.permissions) {
        return true;
      } else if (hasAccess(to.meta.permissions as string | string[])) return true;
      else {
        // TODO move to locales
        notification.error(i18n.global.t("PERMISSION_MESSAGES.ACCESS_RESTRICTED"), {
          timeout: 3000,
        });
        return from.path;
      }
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
