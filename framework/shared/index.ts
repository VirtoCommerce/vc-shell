import { Router } from "vue-router";
import { App } from "vue";
import { AssetsDetailsModule } from "@modules/assets";
import { VcBladeNavigationComponent } from "@shell/_internal/blade-navigation";
import { AssetsManagerModule } from "@modules/assets-manager";
import { VcPopupHandler } from "@shell/_internal/popup";

export const SharedModule = {
  install(app: App, args: { router: Router }): void {
    app
      .use(AssetsDetailsModule)
      .use(AssetsManagerModule)
      .use(VcBladeNavigationComponent, { router: args.router })
      .use(VcPopupHandler);
  },
};

// Re-export everything from new locations
export * from "@shell/components";
export * from "@shell/auth";
export * from "@shell/pages";
export * from "@shell/dashboard";
export * from "@modules";
export * from "@core/blade-navigation";
export * from "@shell/_internal/blade-navigation";
export * from "@core/composables/useBladeNavigationAdapter";
export * from "@shell/_internal/popup";
export * from "@core/notifications";
export * from "@shell/_internal/notifications/composables";
export * from "@shell/_internal/notifications/components";
export * from "@ui/components/molecules/multilanguage-selector";

// Deprecated
/** @deprecated Use `VcDropdown` from `framework/ui/components` instead. */
export { GenericDropdown } from "@shared/components/generic-dropdown";

// Shared composables (transitional)
export * from "@core/composables/useMenuExpanded";
export * from "@core/composables/useModificationTracker";
export * from "@core/composables/useBladeWidgets";
export * from "@core/composables/useBladeContext";
export * from "@ui/composables/useTableSort";
export * from "@ui/composables/useTableSelection";

// Shared utilities (transitional)
export * from "@core/utilities/assets";
export * from "@core/utilities/colorUtils";
export * from "@core/utilities/formatBadgeCount";
export * from "@ui/utilities/vueUtils";
