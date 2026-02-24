import { provide, inject, computed } from "vue";
import { provideAppBarMobileButtonsService } from "@core/composables/useAppBarMobileButtons";
import { provideGlobalSearch } from "@core/composables/useGlobalSearch";
import { provideDashboardService } from "@core/composables/useDashboard";
import {
  AppBarWidgetServiceKey,
  SettingsMenuServiceKey,
  EmbeddedModeKey,
  DynamicModulesKey,
  ShellIndicatorsKey,
  InternalRoutesKey,
} from "@framework/injection-keys";
import { hasUnreadNotifications } from "@core/composables/useNotifications";
import { NotificationDropdown } from "@shared/components";
import { LanguageSelector } from "@shared/components/language-selector";
import { ThemeSelector } from "@shared/components/theme-selector";
import { ChangePasswordButton } from "@shared/components/change-password-button";
import { LogoutButton } from "@shared/components/logout-button";
import { provideAiAgentService } from "@core/plugins/ai-agent";
import type { IAiAgentConfig } from "@core/plugins/ai-agent";
import type { BladeRoutesRecord } from "@shared/components";
import type { registerAppBarWidgetOptions } from "@core/services/app-bar-menu-service";
import type { AppBarButtonContent } from "@core/services/app-bar-mobile-buttons-service";
import type { RegisterSettingsMenuItemOptions } from "@core/services/settings-menu-service";

export interface ShellBootstrapOptions {
  isEmbedded: boolean;
  internalRoutes?: BladeRoutesRecord[];
  dynamicModules?: typeof window.VcShellDynamicModules;
  aiAgentConfig?: IAiAgentConfig;
  aiAgentAddGlobalToolbarButton?: boolean;
}

export function useShellBootstrap(options: ShellBootstrapOptions) {
  // 1a. App-level services (created by framework plugin install)
  const appBarWidgetService = inject(AppBarWidgetServiceKey)!;
  const settingsMenuService = inject(SettingsMenuServiceKey)!;

  // 1b. Component-scoped services (created here for VcApp descendants)
  const mobileButtons = provideAppBarMobileButtonsService();
  provideGlobalSearch();
  provideDashboardService();

  // 2. Provide injection keys
  provide(EmbeddedModeKey, options.isEmbedded);
  if (options.internalRoutes) {
    provide(InternalRoutesKey, options.internalRoutes);
  }
  if (options.dynamicModules !== undefined) {
    provide(DynamicModulesKey, options.dynamicModules);
  }

  // 3. AI agent (conditional)
  if (options.aiAgentConfig?.url) {
    provideAiAgentService({
      config: options.aiAgentConfig,
      addGlobalToolbarButton: options.aiAgentAddGlobalToolbarButton ?? true,
    });
  }

  // 4. Register default shell UI
  useShellDefaults({
    isEmbedded: options.isEmbedded,
    registerWidget: appBarWidgetService.register,
    registerMobileButton: mobileButtons.register,
    registerSettingsMenuItem: settingsMenuService.register,
  });
}

// ── Internal: default UI element registration ─────────────────────
interface ShellDefaultsContext {
  isEmbedded: boolean;
  registerWidget: (options: registerAppBarWidgetOptions) => string;
  registerMobileButton: (button: AppBarButtonContent) => void;
  registerSettingsMenuItem: (options: RegisterSettingsMenuItemOptions) => string;
}

function useShellDefaults(ctx: ShellDefaultsContext) {
  // Notification widget
  ctx.registerWidget({
    id: "notifications",
    component: NotificationDropdown,
    icon: "lucide-bell",
    order: 10,
    badge: () => hasUnreadNotifications.value,
  });

  if (!ctx.isEmbedded) {
    ctx.registerMobileButton({
      id: "notifications",
      component: NotificationDropdown,
      icon: "lucide-bell",
      order: 10,
      isVisible: true,
    });
  }

  // Settings menu items
  ctx.registerSettingsMenuItem({ id: "theme-selector", component: ThemeSelector, group: "preferences", order: 10 });
  ctx.registerSettingsMenuItem({
    id: "language-selector",
    component: LanguageSelector,
    group: "preferences",
    order: 20,
  });
  ctx.registerSettingsMenuItem({ id: "change-password", component: ChangePasswordButton, group: "account", order: 30 });
  ctx.registerSettingsMenuItem({ id: "logout", component: LogoutButton, group: "account", order: 100 });

  // Shell indicator state for SidebarHeader
  provide(
    ShellIndicatorsKey,
    computed(() => hasUnreadNotifications.value),
  );
}
