export * from "@shared/components/blade-navigation";
export * from "@shared/components/notifications";
export * from "@shared/components/popup-handler";
export * from "@shell/auth/sign-in";
/**
 * @deprecated Use `VcDropdown` from `framework/ui/components` instead.
 */
export { GenericDropdown } from "@shared/components/generic-dropdown";
export * from "@shell/dashboard/draggable-dashboard";
export * from "@shell/dashboard/dashboard-widget-card";
export * from "@shell/dashboard/dashboard-charts";

// Re-export from new locations for backward compatibility
export * from "@shell/components";
export * from "@ui/components/molecules/multilanguage-selector";
