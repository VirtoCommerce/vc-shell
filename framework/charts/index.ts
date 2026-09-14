// @vc-shell/framework/charts — opt-in entry for dashboard charts.
//
// Importing from here keeps the heavy @unovis dependency out of a consumer's default
// bundle. The same symbols stay re-exported from the main barrel for compatibility.
export * from "@shell/dashboard/dashboard-charts";
