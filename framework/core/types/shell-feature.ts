import type { Ref } from "vue";
import type { Router, RouteLocationNormalizedLoaded } from "vue-router";
import type { registerAppBarWidgetOptions } from "../services/app-bar-menu-service";
import type { RegisterSettingsMenuItemOptions } from "../services/settings-menu-service";
import type { AppBarButtonContent } from "../services/app-bar-mobile-buttons-service";

/**
 * Context provided to ShellFeature.onSetup callbacks.
 */
export interface ShellContext {
  router: Router;
  route: RouteLocationNormalizedLoaded;
  isAuthenticated: Ref<boolean>;
  isEmbedded: boolean;
}

/**
 * A ShellFeature is a declarative configuration object that registers
 * widgets, menu items, and buttons into the shell at setup time.
 *
 * Consumer apps can compose features to customize the shell:
 * ```ts
 * const features = [
 *   ...defaultFeatures.filter(f => f.id !== "notifications"),
 *   myCustomFeature,
 * ];
 * ```
 */
export interface ShellFeature {
  /** Unique identifier for this feature */
  id: string;

  /** Widgets shown in the app bar toolbar (e.g., notification bell) */
  appBarWidgets?: registerAppBarWidgetOptions[];

  /** Items in the settings/user dropdown (e.g., language, theme, logout) */
  settingsMenuItems?: RegisterSettingsMenuItemOptions[];

  /** Buttons shown on the mobile app bar */
  mobileButtons?: AppBarButtonContent[];

  /** Called after all services are provided, before app renders */
  onSetup?: (context: ShellContext) => void;
}
