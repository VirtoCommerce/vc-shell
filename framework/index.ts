import type { RouteLocationNormalized, Router } from "vue-router";
import * as VueRouter from "vue-router";
import { App, Component } from "vue";
import * as components from "@ui/components";
import * as directives from "@core/directives";
import { useBreakpoints } from "@vueuse/core";
import { i18n, permissions, signalR } from "@core/plugins";
import { aiAgentPlugin, type AiAgentPluginOptions } from "@core/plugins/ai-agent";
import { BladeVNode, SharedModule, notification } from "@shared";
import * as sharedPages from "@shared/pages/plugin";
import { registerInterceptors } from "@core/interceptors";
import { usePermissions } from "@core/composables/usePermissions";
import { useUserManagement } from "@core/composables/useUserManagement";
import Vue3TouchEvents from "vue3-touch-events";
import * as locales from "@locales";
import { AppInsightsPlugin, AppInsightsPluginOptions } from "vue3-application-insights";
import { useAppInsights, AppInsightsOptionsKey } from "@core/composables/useAppInsights";

// Import Blade Registry
import { createBladeRegistry, BladeRegistryKey, IBladeRegistryInstance } from "@core/composables/useBladeRegistry";

import * as coreComposables from "@core/composables";
import * as corePlugins from "@core/plugins";
import * as coreApiPlatform from "@core/api/platform";
import * as coreUtilities from "@core/utilities";
import * as coreConstants from "@core/constants";
import * as shared from "@shared";
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
} from "@core/services";
import {
  AppBarWidgetServiceKey,
  MenuServiceKey,
  NotificationTemplatesKey,
  SettingsMenuServiceKey,
  ToolbarServiceKey,
  WidgetServiceKey,
  LanguageServiceKey,
  IsMobileKey,
  IsDesktopKey,
  IsPhoneKey,
  IsTabletKey,
  IsTouchKey,
  BladeRoutesKey,
} from "@framework/injection-keys";

import "@fortawesome/fontawesome-free/css/fontawesome.min.css";
import "@fortawesome/fontawesome-free/css/solid.min.css";
import "bootstrap-icons/font/bootstrap-icons.min.css";
import * as icons from "lucide-vue-next";
import "@material-symbols/font-300/index.css";

type I18NParams = Parameters<typeof i18n.global.mergeLocaleMessage>;

interface FrameworkInstallArgs {
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
  /**
   * AI Agent plugin options.
   * Configure tenantId here to identify the platform instance.
   *
   * @example
   * ```typescript
   * app.use(VirtoShellFramework, {
   *   router,
   *   aiAgent: {
   *     config: {
   *       tenantId: "virto"
   *     }
   *   }
   * });
   * ```
   */
  aiAgent?: AiAgentPluginOptions;
}

export interface VcShellFrameworkPlugin {
  install(app: App, args: FrameworkInstallArgs): void;
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

// ── Install helpers ──────────────────────────────────────────────────

function setupI18n(app: App, args: FrameworkInstallArgs) {
  if (args.i18n?.locale) {
    i18n.global.locale.value = args.i18n.locale;
  }
  if (args.i18n?.fallbackLocale) {
    i18n.global.fallbackLocale.value = args.i18n.fallbackLocale;
  }

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
}

function registerComponentsAndDirectives(app: App) {
  Object.entries(components).forEach(([name, component]) => {
    app.component(name, component as Component);
  });

  // Lucide Icons
  Object.entries(icons).forEach(([key, value]) => {
    app.component(key, value as Component);
  });

  Object.entries(directives).forEach(([directiveName, directive]) => {
    app.directive(directiveName, directive);
  });
}

function setupBreakpoints(app: App) {
  const bp = useBreakpoints({
    phone: 480,
    desktop: 1024,
  });

  app.config.globalProperties.$isPhone = bp.smaller("phone");
  app.config.globalProperties.$isTablet = bp.between("phone", "desktop");
  app.config.globalProperties.$isMobile = bp.smaller("desktop");
  app.config.globalProperties.$isDesktop = bp.greater("desktop");
  app.config.globalProperties.$isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

  // Typed Symbol keys (internal framework use)
  app.provide(IsPhoneKey, app.config.globalProperties.$isPhone);
  app.provide(IsTabletKey, app.config.globalProperties.$isTablet);
  app.provide(IsMobileKey, app.config.globalProperties.$isMobile);
  app.provide(IsDesktopKey, app.config.globalProperties.$isDesktop);
  app.provide(IsTouchKey, app.config.globalProperties.$isTouch);

  // String keys (backward compatibility for external apps/modules)
  app.provide("isMobile", app.config.globalProperties.$isMobile);
  app.provide("isDesktop", app.config.globalProperties.$isDesktop);
  app.provide("isPhone", app.config.globalProperties.$isPhone);
  app.provide("isTablet", app.config.globalProperties.$isTablet);
  app.provide("isTouch", app.config.globalProperties.$isTouch);
}

function setupLegacyGlobals(app: App) {
  // Pages
  app.config.globalProperties.pages = [];
  app.provide("pages", app.config.globalProperties.pages);

  // Blade routes
  app.config.globalProperties.bladeRoutes = [];
  app.provide(BladeRoutesKey, app.config.globalProperties.bladeRoutes);
  app.provide("bladeRoutes", app.config.globalProperties.bladeRoutes);

  // Notification templates
  app.config.globalProperties.notificationTemplates = [];
  app.provide(NotificationTemplatesKey, app.config.globalProperties.notificationTemplates);
}

function createAndProvideServices(app: App) {
  app.provide(WidgetServiceKey, createWidgetService());
  app.provide(ToolbarServiceKey, createToolbarService());
  app.provide(AppBarWidgetServiceKey, createAppBarWidgetService());
  app.provide(MenuServiceKey, createMenuService());
  app.provide(SettingsMenuServiceKey, createSettingsMenuService());

  const bladeRegistryInstance: IBladeRegistryInstance = createBladeRegistry(app);
  app.provide(BladeRegistryKey, bladeRegistryInstance);
}

function installPlugins(app: App, args: FrameworkInstallArgs) {
  app.use(SharedModule, { router: args.router });
  app.use(signalR, args.signalR);
  app.use(permissions);
  app.use<[]>(Vue3TouchEvents);

  Object.values(sharedPages).forEach((page) => {
    app.use(page);
  });

  app.use(aiAgentPlugin, args.aiAgent);
}

function setupApplicationInsights(app: App, args: FrameworkInstallArgs) {
  if (!args.applicationInsights?.instrumentationKey) return;

  const aiOptions: AppInsightsPluginOptions = {
    appInsightsConfig: {
      config: {
        instrumentationKey: args.applicationInsights.instrumentationKey,
      },
    },
    trackAppErrors: true,
    appName: args.applicationInsights?.appName,
    cloudRole: args.applicationInsights?.cloudRole,
    cloudRoleInstance: args.applicationInsights?.cloudRoleInstance,
  };

  app.use(AppInsightsPlugin, aiOptions);
  app.provide(AppInsightsOptionsKey, aiOptions);

  app.runWithContext(() => {
    const { setupPageTracking } = useAppInsights();

    args.router.beforeEach((to) => {
      setupPageTracking.beforeEach({ name: to.name as string });
    });

    args.router.afterEach((to) => {
      setupPageTracking.afterEach({ name: to.name as string, fullPath: to.fullPath });
    });
  });
}

function setupRouterGuards(router: Router) {
  const getParam = (to: RouteLocationNormalized) => {
    let param: {
      [k: string]: string | string[];
    } = {};

    if (Object.keys(to.params).length > 0) {
      param = Object.fromEntries(Object.entries(to.params).filter(([key]) => key !== "pathMatch"));
    }

    return param;
  };

  // Check if user is authenticated and redirect to login page if not.
  // TODO add check if app has login page
  router.beforeEach(async (to, _, next) => {
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

  // Check if user has access to the page and redirect to previous path if not.
  router.beforeEach((to, from) => {
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

  // Check if user trying to access not workspace pages as workspace pages.
  // Redirect to main page if not.
  router.beforeEach((to) => {
    const blade = to.matched?.[1]?.components?.default as BladeVNode | Component;

    if (blade && "type" in blade && blade?.type?.isBlade && !blade?.type?.isWorkspace) {
      const routes = router.getRoutes();
      const mainRoute = routes.find((route) => route.meta?.root);
      const mainRouteAlias = routes.find((route) => route.aliasOf?.path === mainRoute?.path) ?? mainRoute;
      const param = getParam(to);

      return { name: mainRouteAlias?.name, params: param };
    }
  });
}

// ── Plugin entry point ───────────────────────────────────────────────

export default {
  install(app: App, args: FrameworkInstallArgs): void {
    // Register base theme
    coreComposables.useTheme().register([
      { key: "light", localizationKey: "core.themes.light" },
    ]);

    // HTTP Interceptors
    window.fetch = registerInterceptors(args.router);

    setupI18n(app, args);
    registerComponentsAndDirectives(app);
    setupBreakpoints(app);
    setupLegacyGlobals(app);
    createAndProvideServices(app);
    installPlugins(app, args);
    setupApplicationInsights(app, args);
    setupRouterGuards(args.router);
  },
} as VcShellFrameworkPlugin;

export * from "@framework/injection-keys";

export * from "@ui/components";
// eslint-disable-next-line import/export
export * from "@ui/types";

export * from "@core/composables";
export * from "@core/directives";
export * from "@core/types";
export * from "@core/plugins";
export * from "@core/api/platform";
export * from "@core/utilities";
export * from "@core/constants";

export * from "@shared";

// AI Agent Plugin
export * from "@core/plugins/ai-agent";
