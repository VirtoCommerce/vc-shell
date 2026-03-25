export * from "@core/composables/useFunctions";
export * from "@core/composables/useUser";
export * from "@core/composables/useNotifications";
export * from "@core/composables/useSettings";
export * from "@core/composables/usePermissions";
export * from "@core/composables/useAsync";
export * from "@core/composables/useApiClient";
export * from "@core/composables/useLoading";
export * from "@core/composables/useErrorHandler";
export * from "@core/composables/useAssets";
export * from "@core/composables/useAssetsManager";
export * from "@core/composables/useMenuService";
export * from "@core/composables/useBeforeUnload";
export * from "@core/composables/useLanguages";
export * from "@core/composables/useBreadcrumbs";
export * from "@core/composables/useAppInsights";
export * from "@core/composables/useTheme";
// useWidgets is internal — deprecated re-export available via shared/composables
export * from "@core/composables/useDashboard";
export * from "@core/composables/useAppBarWidget";
export * from "@core/composables/useSettingsMenu";
export * from "@core/composables/useToolbar";
export * from "@core/composables/useDynamicProperties";
export * from "@core/composables/useBlade";
export * from "@core/composables/useSidebarState";
export * from "@core/composables/useWebVitals";
export * from "@core/composables/useBladeWidgets";
export * from "@core/composables/useBladeContext";
export * from "@core/composables/useModificationTracker";
export * from "@core/composables/useMenuExpanded";
export * from "@core/composables/usePopup";
// Note: useConnectionStatus is NOT re-exported here to avoid circular
// dependency. Import directly from "@core/composables/useConnectionStatus".
// useBladeSelection and useAiAgent are now part of the ai-agent plugin
// export * from "./core/plugins/ai-agent";
