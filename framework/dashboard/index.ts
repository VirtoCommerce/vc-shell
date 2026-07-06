// @vc-shell/framework/dashboard — opt-in entry for the draggable dashboard.
//
// Importing dashboard widgets from here (instead of the main barrel) keeps the
// heavy Gridstack dependency out of a consumer's default bundle: it is only
// pulled when this subpath is imported. The same symbols remain re-exported
// from the main "@vc-shell/framework" barrel for backward compatibility.
export * from "@shell/dashboard/draggable-dashboard";
export * from "@shell/dashboard/dashboard-widget-card";
