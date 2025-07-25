import type { RouteLocationNormalized, Router } from "vue-router";
import * as VueRouter from "vue-router";
import { App, Component } from "vue";
import * as components from "./ui/components";
import * as directives from "./core/directives";
import { useBreakpoints } from "@vueuse/core";
import { i18n, permissions, signalR } from "./core/plugins";
import { BladeVNode, SharedModule, notification } from "./shared";
import * as sharedPages from "./shared/pages/plugin";
import { registerInterceptors } from "./core/interceptors";
import { usePermissions } from "./core/composables/usePermissions";
import { useUserManagement } from "./core/composables/useUserManagement";
import Vue3TouchEvents from "vue3-touch-events";
import * as locales from "./locales";
import { AppInsightsPlugin, AppInsightsPluginOptions } from "vue3-application-insights";
import { useAppInsights } from "./core/composables";

// Import Blade Registry
import { createBladeRegistry, BladeRegistryKey, IBladeRegistryInstance } from "./core/composables/useBladeRegistry";

import * as coreComposables from "./core/composables";
import * as corePlugins from "./core/plugins";
import * as coreApiPlatform from "./core/api/platform";
import * as coreUtilities from "./core/utilities";
import * as coreConstants from "./core/constants";
import * as shared from "./shared";
import * as Vue from "vue";
import * as VueI18n from "vue-i18n";
import * as VueUse from "@vueuse/core";
import * as _ from "lodash-es";
import * as VeeValidate from "vee-validate";
import "normalize.css";
import "./assets/styles/fonts.scss";
import "./assets/styles/index.scss";
import {
  createWidgetService,
  createMenuService,
  createAppBarWidgetService,
  createSettingsMenuService,
  createToolbarService,
  createLanguageService,
} from "./core/services";
import {
  AppBarWidgetServiceKey,
  MenuServiceKey,
  NotificationTemplatesSymbol,
  SettingsMenuServiceKey,
  TOOLBAR_SERVICE,
  WidgetServiceKey,
  LanguageServiceKey,
} from "./injection-keys";

import "@fortawesome/fontawesome-free/css/fontawesome.min.css";
import "@fortawesome/fontawesome-free/css/solid.min.css";
import "bootstrap-icons/font/bootstrap-icons.min.css";
import * as icons from "lucide-vue-next";
import "@material-symbols/font-300/index.css";

type I18NParams = Parameters<typeof i18n.global.mergeLocaleMessage>;

export interface VcShellFrameworkPlugin {
  install(
    app: App,
    args: {
      router: Router;
      /**
       * @deprecated `platformUrl` key will be removed in the next versions.
       * Use 'APP_PLATFORM_URL' environment variable instead while on development.
       */
      platformUrl?: string;
      i18n?: {
        locale: string;
        fallbackLocale: string;
      };
      signalR?: {
        creator?: string;
      };
      applicationInsights?: {
        instrumentationKey: string;
        appName?: string;
        cloudRole?: string;
        cloudRoleInstance?: string;
      };
    },
  ): void;
}

// globals
if (typeof window !== "undefined") {
  window.VcShellFramework = {
    ...window.VcShellFramework,
    ...components,
    ...coreComposables,
    ...corePlugins,
    ...coreApiPlatform,
    ...coreUtilities,
    ...coreConstants,
    ...shared,
    ...directives,
  };
  window.Vue = Vue;
  window.VueRouter = VueRouter;
  window.moment = corePlugins.moment;
  window.VueI18n = VueI18n;
  window._ = _;
  window.VueUse = VueUse;
  window.VeeValidate = VeeValidate;
}

export default {
  install(
    app: App,
    args: {
      router: Router;
      /**
       * @deprecated `platformUrl` key will be removed in the next versions.
       * Use 'APP_PLATFORM_URL' environment variable instead while on development.
       */
      platformUrl?: string;
      i18n?: {
        locale: string;
        fallbackLocale: string;
      };
      signalR?: {
        creator?: string;
      };
      applicationInsights?: {
        instrumentationKey: string;
        appName?: string;
        cloudRole?: string;
        cloudRoleInstance?: string;
      };
    },
  ): void {
    // Register base theme
    coreComposables.useTheme().register([
      { key: "light", localizationKey: "core.themes.light" },
      // { key: "dark", localizationKey: "core.themes.dark" },
    ]);

    // HTTP Interceptors
    window.fetch = registerInterceptors(args.router);

    if (args.i18n?.locale) {
      i18n.global.locale.value = args.i18n.locale;
    }
    if (args.i18n?.fallbackLocale) {
      i18n.global.fallbackLocale.value = args.i18n.fallbackLocale;
    }

    // Lucide Icons
    Object.entries(icons).forEach(([key, value]) => {
      app.component(key, value as Component);
    });

    app.use(i18n);

    const languageService = createLanguageService();
    app.provide(LanguageServiceKey, languageService);

    const { resolveCamelCaseLocale } = languageService;

    app.config.globalProperties.$mergeLocaleMessage = (locale: I18NParams[0], message: I18NParams[1]) => {
      i18n.global.mergeLocaleMessage(resolveCamelCaseLocale(locale), message);
    };

    // Components locales
    Object.entries(locales).forEach(([key, message]) => {
      i18n.global.mergeLocaleMessage(resolveCamelCaseLocale(key), message);
    });

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
    app.provide(NotificationTemplatesSymbol, app.config.globalProperties.notificationTemplates);

    // Widgets
    app.provide(WidgetServiceKey, createWidgetService());

    // Toolbar service
    app.provide(TOOLBAR_SERVICE, createToolbarService());

    // App bar widgets
    app.provide(AppBarWidgetServiceKey, createAppBarWidgetService());

    // Menu service
    app.provide(MenuServiceKey, createMenuService());

    // Settings menu
    app.provide(SettingsMenuServiceKey, createSettingsMenuService());

    // Initialize and provide Blade Registry
    const bladeRegistryInstance: IBladeRegistryInstance = createBladeRegistry(app);
    // Provide the full instance, so _registerBladeFn can be accessed if needed by advanced modules via inject + IBladeRegistryInstance type.
    // General consumption via useBladeRegistry() will still get the IBladeRegistry interface due to how useBladeRegistry is typed.
    app.provide(BladeRegistryKey, bladeRegistryInstance);

    // Shared module - no longer needs bladeRegisterFn passed explicitly
    app.use(SharedModule, { router: args.router });

    // SignalR
    app.use(signalR, args.signalR);

    // Permissions check
    app.use(permissions);

    // Touch events
    app.use<[]>(Vue3TouchEvents);

    if (args.applicationInsights?.instrumentationKey) {
      // Application Insights
      const aiOptions: AppInsightsPluginOptions = {
        appInsightsConfig: {
          config: {
            instrumentationKey: args.applicationInsights.instrumentationKey,
          },
        },
        // router: args.router,
        trackAppErrors: true,
        appName: args.applicationInsights?.appName,
        cloudRole: args.applicationInsights?.cloudRole,
        cloudRoleInstance: args.applicationInsights?.cloudRoleInstance,
      };

      app.use(AppInsightsPlugin, aiOptions);
      app.provide("appInsightsOptions", aiOptions);

      app.runWithContext(() => {
        const { setupPageTracking } = useAppInsights();

        /**
         * Add Application Insights page tracking.
         */
        args.router.beforeEach((to) => {
          setupPageTracking.beforeEach({ name: to.name as string });
        });

        args.router.afterEach((to) => {
          setupPageTracking.afterEach({ name: to.name as string, fullPath: to.fullPath });
        });
      });
    }

    // Common pages
    Object.values(sharedPages).forEach((page) => {
      app.use(page);
    });

    // Router guards
    const getParam = (to: RouteLocationNormalized) => {
      let param: {
        [k: string]: string | string[];
      } = {};

      if (Object.keys(to.params).length > 0) {
        param = Object.fromEntries(Object.entries(to.params).filter(([key]) => key !== "pathMatch"));
      }

      return param;
    };

    /**
     * Check if user is authenticated and redirect to login page if not.
     */
    // TODO add check if app has login page
    args.router.beforeEach(async (to, _, next) => {
      const { isAuthenticated } = useUserManagement();

      if (to.meta.root === true) {
        try {
          if (!isAuthenticated.value) {
            localStorage.setItem("redirectAfterLogin", to.fullPath);
            next({ name: "Login" });
          } else {
            next();
          }
        } catch (e) {
          localStorage.setItem("redirectAfterLogin", to.fullPath);
          next({ name: "Login" });
        }
      } else {
        next();
      }
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
        notification.error(i18n.global.t("PERMISSION_MESSAGES.ACCESS_RESTRICTED"), {
          timeout: 3000,
        });

        const param = getParam(to);

        return Object.keys(param)[0] ? `/${Object.values(param)[0]}` + from.path : from.path;
      }
    });

    /**
     * Check if user trying to access not workspace pages as workspace pages.
     * Redirect to main page if not.
     */
    args.router.beforeEach((to) => {
      const blade = to.matched?.[1]?.components?.default as BladeVNode | Component;

      if (blade && "type" in blade && blade?.type?.isBlade && !blade?.type?.isWorkspace) {
        const routes = args.router.getRoutes();
        const mainRoute = routes.find((route) => route.meta?.root);
        const mainRouteAlias = routes.find((route) => route.aliasOf?.path === mainRoute?.path) ?? mainRoute;
        const param = getParam(to);

        return { name: mainRouteAlias?.name, params: param };
      }
    });
  },
} as VcShellFrameworkPlugin;

export * from "./injection-keys";

export * from "./ui/components";
// eslint-disable-next-line import/export
export * from "./ui/types";

export * from "./core/composables";
export * from "./core/directives";
export * from "./core/types";
export * from "./core/plugins";
export * from "./core/api/platform";
export * from "./core/utilities";
export * from "./core/constants";

export * from "./shared";
