import { computed, provide } from "vue";
import { provideAppBarWidget, useNotifications } from "../../../../../core/composables";
import { provideAppBarMobileButtonsService } from "../../../../../core/composables/useAppBarMobileButtons";
import { provideSettingsMenu } from "../../../../../core/composables/useSettingsMenu";
import { provideMenuService } from "../../../../../core/composables/useMenuService";
import { provideGlobalSearch } from "../../../../../core/composables/useGlobalSearch";
import { provideDashboardService } from "../../../../../core/composables/useDashboard";
import { provideAiAgentService } from "../../../../../core/plugins/ai-agent";
import type { IAiAgentConfig } from "../../../../../core/plugins/ai-agent";
import { EMBEDDED_MODE, DynamicModulesKey } from "../../../../../injection-keys";
import type { ShellFeature, ShellContext } from "../../../../../core/types/shell-feature";
import type { BladeRoutesRecord } from "../../../../../shared/components";

export interface ShellBootstrapOptions {
  isEmbedded: boolean;
  internalRoutes?: BladeRoutesRecord[];
  dynamicModules?: typeof window.VcShellDynamicModules;
  aiAgentConfig?: IAiAgentConfig;
  aiAgentAddGlobalToolbarButton?: boolean;
  context: ShellContext;
}

/**
 * Bootstraps the shell: provides all core services and processes shell features.
 * This replaces the ~100 lines of service provisioning and registration
 * that were previously inline in vc-app.vue setup.
 */
export function useShellBootstrap(features: ShellFeature[], options: ShellBootstrapOptions) {
  // 1. Provide core services
  const { register: registerSettingsMenuItem } = provideSettingsMenu();
  const { register: registerWidget } = provideAppBarWidget();
  const { register: registerMobileButton } = provideAppBarMobileButtonsService();
  const { notifications } = useNotifications();
  provideMenuService();
  provideGlobalSearch();
  provideDashboardService();

  const hasUnreadNotifications = computed(() => notifications.value.some((item) => item.isNew));

  // 2. Provide injection keys
  provide(EMBEDDED_MODE, options.isEmbedded);
  if (options.internalRoutes) {
    provide("internalRoutes", options.internalRoutes);
  }
  if (options.dynamicModules !== undefined) {
    provide(DynamicModulesKey, options.dynamicModules);
  }

  // 3. Process features — register their widgets/items/buttons into services
  for (const feature of features) {
    feature.appBarWidgets?.forEach((widget) => {
      // Keep legacy notification behavior: badge reflects unread notifications.
      if (widget.id === "notification-dropdown" && widget.badge === undefined) {
        registerWidget({
          ...widget,
          badge: () => hasUnreadNotifications.value,
        });
        return;
      }

      registerWidget(widget);
    });

    feature.settingsMenuItems?.forEach((item) => registerSettingsMenuItem(item));

    feature.mobileButtons?.forEach((button) => {
      registerMobileButton({
        ...button,
        // Embedded mode hides all mobile buttons by default
        isVisible: options.isEmbedded ? false : (button.isVisible ?? true),
      });
    });
  }

  // 4. Conditional AI agent setup
  if (options.aiAgentConfig?.url) {
    provideAiAgentService({
      config: options.aiAgentConfig,
      addGlobalToolbarButton: options.aiAgentAddGlobalToolbarButton ?? true,
    });
  }

  // 5. Run feature onSetup hooks
  for (const feature of features) {
    feature.onSetup?.(options.context);
  }
}
