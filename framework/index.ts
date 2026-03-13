import type { RouteLocationNormalized, Router } from "vue-router";
import { App, Component } from "vue";
import * as components from "@ui/components";
import * as directives from "@core/directives";
import { useBreakpoints } from "@vueuse/core";
import { i18n, permissions, signalR } from "@core/plugins";
import { notifyMountComplete } from "@core/plugins/signalR";
import { aiAgentPlugin, type AiAgentPluginOptions } from "@core/plugins/ai-agent";
import { SharedModule, notification } from "@shared";
import { registerInterceptors } from "@core/interceptors";
import { usePermissions } from "@core/composables/usePermissions";
import { useUserManagement } from "@core/composables/useUserManagement";
import Vue3TouchEvents from "vue3-touch-events";
import * as locales from "@locales";
import { AppInsightsPlugin, AppInsightsPluginOptions } from "vue3-application-insights";
import { useAppInsights, AppInsightsOptionsKey } from "@core/composables/useAppInsights";
import { setupGlobalErrorHandlers } from "@core/plugins/global-error-handler";
import { useConnectionStatus } from "@core/composables/useConnectionStatus";
import { createNotificationStore } from "@core/notifications";

// Import Blade Registry
import { createBladeRegistry, BladeRegistryKey, IBladeRegistryInstance } from "@core/composables/useBladeRegistry";

import * as coreComposables from "@core/composables";
import * as corePlugins from "@core/plugins";
import * as coreApiPlatform from "@core/api/platform";
import * as coreUtilities from "@core/utilities";
import * as coreConstants from "@core/constants";
import * as shared from "@shared";
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
  NotificationStoreKey,
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


// ── Dev-mode string key deprecation warnings ─────────────────────────

const _warnedStringKeys = new Set<string>();

function warnStringKey(key: string, replacement: string): void {
  if (import.meta.env.DEV && !_warnedStringKeys.has(key)) {
    _warnedStringKeys.add(key);
    console.warn(
      `[vc-shell] inject("${key}") is deprecated. Use ${replacement} from @vc-shell/framework instead.`,
    );
  }
}

/** @internal — exported for testing only */
export { warnStringKey as _warnStringKey, _warnedStringKeys };

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
  warnStringKey("isMobile", "IsMobileKey");
  app.provide("isMobile", app.config.globalProperties.$isMobile);
  warnStringKey("isDesktop", "IsDesktopKey");
  app.provide("isDesktop", app.config.globalProperties.$isDesktop);
  warnStringKey("isPhone", "IsPhoneKey");
  app.provide("isPhone", app.config.globalProperties.$isPhone);
  warnStringKey("isTablet", "IsTabletKey");
  app.provide("isTablet", app.config.globalProperties.$isTablet);
  warnStringKey("isTouch", "IsTouchKey");
  app.provide("isTouch", app.config.globalProperties.$isTouch);
}

function setupLegacyGlobals(app: App) {
  // Pages
  app.config.globalProperties.pages = [];
  warnStringKey("pages", "a typed injection key");
  app.provide("pages", app.config.globalProperties.pages);

  // Blade routes
  app.config.globalProperties.bladeRoutes = [];
  app.provide(BladeRoutesKey, app.config.globalProperties.bladeRoutes);
  warnStringKey("bladeRoutes", "BladeRoutesKey");
  app.provide("bladeRoutes", app.config.globalProperties.bladeRoutes);

  // Legacy notification templates — empty array for backwards compat
  // New code uses useNotificationStore().registry
  app.provide(NotificationTemplatesKey, []);
}

function createAndProvideServices(app: App) {
  app.provide(WidgetServiceKey, createWidgetService());
  app.provide(ToolbarServiceKey, createToolbarService());
  app.provide(AppBarWidgetServiceKey, createAppBarWidgetService());
  app.provide(MenuServiceKey, createMenuService());
  app.provide(SettingsMenuServiceKey, createSettingsMenuService());
  app.provide(NotificationStoreKey, createNotificationStore());

  const bladeRegistryInstance: IBladeRegistryInstance = createBladeRegistry(app);
  app.provide(BladeRegistryKey, bladeRegistryInstance);
}

function installPlugins(app: App, args: FrameworkInstallArgs) {
  app.use(SharedModule, { router: args.router });
  app.use(signalR, args.signalR);
  app.use(permissions);
  app.use<[]>(Vue3TouchEvents);

  app.use(aiAgentPlugin, args.aiAgent);
}

function provideApplicationInsightsOptions(app: App, args: FrameworkInstallArgs) {
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

  // Provide options synchronously so components can inject at setup time
  // (useErrorHandler -> useAppInsights -> inject(AppInsightsOptionsKey))
  app.provide(AppInsightsOptionsKey, aiOptions);
}

function installApplicationInsightsDeferred(app: App, args: FrameworkInstallArgs) {
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

  // Install the SDK plugin (may start telemetry collection)
  app.use(AppInsightsPlugin, aiOptions);

  // Register router hooks for page tracking.
  // Note: the initial navigation's page-view may not be tracked since
  // router.isReady() may resolve before these hooks are registered.
  // This is an acceptable trade-off for removing SDK init from critical path.
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
  router.beforeEach(async (to) => {
    const { isAuthenticated } = useUserManagement();

    if (to.meta.root === true) {
      try {
        if (!isAuthenticated.value) {
          localStorage.setItem("redirectAfterLogin", to.fullPath);
          return { name: "Login" };
        }
      } catch (e) {
        localStorage.setItem("redirectAfterLogin", to.fullPath);
        return { name: "Login" };
      }
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

    // Provide AppInsights options synchronously (components inject at setup time)
    provideApplicationInsightsOptions(app, args);

    setupGlobalErrorHandlers(app);

    if (typeof window !== "undefined") {
      app.runWithContext(() => useConnectionStatus());
    }

    setupRouterGuards(args.router);

    // Defer non-critical plugins to post-paint.
    // setTimeout(fn, 0) yields to the browser's rendering pipeline —
    // the browser paints before executing the next macrotask.
    setTimeout(() => {
      performance.mark("vc:deferred-plugins-start");
      notifyMountComplete(); // Trigger deferred SignalR connection
      installApplicationInsightsDeferred(app, args); // AppInsights SDK + router hooks
      performance.mark("vc:deferred-plugins-done");
    }, 0);
  },
} as VcShellFrameworkPlugin;

export * from "@framework/injection-keys";

export * from "@ui/components";
// eslint-disable-next-line import/export
export * from "@ui/types";

export * from "@core/composables";

// Notifications (new API)
export { useBladeNotifications, useNotificationStore } from "./core/notifications";
export type {
  Severity,
  ToastConfig,
  NotificationTypeConfig,
  ModuleNotificationsConfig,
  NotificationAction,
  BladeNotificationOptions,
  BladeNotificationReturn,
} from "./core/notifications";

export * from "@core/directives";
export * from "@core/types";
export * from "@core/plugins";
export * from "@core/api/platform";
export * from "@core/utilities";
export * from "@core/constants";

export * from "@shared";

// AI Agent Plugin
export * from "@core/plugins/ai-agent";
