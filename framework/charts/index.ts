// @vc-shell/framework/charts — opt-in entry for dashboard charts.
//
// Importing charts from here (instead of the main barrel) keeps the heavy
// @unovis dependency out of a consumer's default bundle: it is only pulled when
// this subpath is imported. The same symbols remain re-exported from the main
// "@vc-shell/framework" barrel for backward compatibility.
export * from "@shell/dashboard/dashboard-charts";
